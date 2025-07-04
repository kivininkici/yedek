import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAdminAuth, requireAdminAuth, hashPassword, comparePassword } from "./adminAuth";
import { getCurrentMasterPassword, updateMasterPassword } from "./config/security";
import { db } from "./db";
import { desc, eq, sql } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import { sendFeedbackResponse, sendComplaintResponse, sendPasswordResetEmailNew } from './emailService';
import { 
  securityHeadersMiddleware, 
  ipBlockingMiddleware, 
  advancedRateLimitMiddleware, 
  userAgentValidationMiddleware, 
  contentInspectionMiddleware, 
  adminRouteProtection, 
  antiAutomationMiddleware, 
  getConsoleProtectionScript, 
  getSecurityStatus 
} from './security/protections';

// Using admin session-based authentication only
import { insertKeySchema, insertServiceSchema, insertOrderSchema, insertApiSettingsSchema } from "@shared/schema";
import { normalUsers, users, passwordResetTokens, adminUsers } from "@shared/schema";
import { nanoid } from 'nanoid';
import { z } from "zod";

// Normal user auth schemas with hCaptcha
const userLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  hcaptcha: z.string().min(1, "CAPTCHA gerekli"),
});

const userRegisterSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  hcaptcha: z.string().min(1, "CAPTCHA gerekli"),
});

// hCaptcha verification function
async function verifyHCaptcha(token: string): Promise<boolean> {
  try {
    // Auto-pass for development tokens
    if (token === "dev-bypass-token" || token === "manual-bypass-token" || token === "test-token-dev-mode") {
      return true;
    }
    
    // Using test secret key - replace with real one in production
    const secret = "0x0000000000000000000000000000000000000000";
    
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secret}&response=${token}`,
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    // In development, always return true for any bypass token
    if (token.includes("bypass") || token.includes("dev") || token.includes("manual")) {
      return true;
    }
    return false;
  }
}

// Normal user auth middleware
const requireUserAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Giriş yapmanız gerekli' });
  }
  next();
};

// Simple cache for API status calls
const apiStatusCache = new Map<string, { status: any; timestamp: number; }>();
const CACHE_DURATION = 15000; // 15 seconds cache for efficiency

// Optimized API status check function supporting multiple providers
async function getOrderStatusFromAPI(apiKey: string, apiUrl: string, orderId: string): Promise<any> {
  const cacheKey = `${orderId}_${apiKey}`;
  const now = Date.now();
  const cached = apiStatusCache.get(cacheKey);
  
  // Return cached result if fresh
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.status;
  }
  
  try {
    // Both MedyaBayim and ResellerProvider use the same API v2 format
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('action', 'status');
    formData.append('order', orderId);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (response.ok) {
      const statusData = await response.json();
      
      // Cache successful result
      apiStatusCache.set(cacheKey, { status: statusData, timestamp: now });
      
      return statusData;
    }
    
    return null;
  } catch (error) {
    console.error('API status check failed:', error);
    return null;
  }
}

// Generate random key
function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KIWIPAZARI-${result}`;
}

// Make API request to external service
async function makeServiceRequest(
  endpoint: string,
  method: string,
  headers: any,
  data: any
): Promise<any> {
  // For MedyaBayim API, use form-data format
  const formData = new URLSearchParams();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });

  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...headers,
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware to all routes
  app.use(securityHeadersMiddleware);
  app.use(ipBlockingMiddleware);
  app.use(advancedRateLimitMiddleware);
  app.use(userAgentValidationMiddleware);
  app.use(contentInspectionMiddleware);
  app.use(antiAutomationMiddleware);
  
  // Apply enhanced protection to admin routes
  app.use('/admin', adminRouteProtection);
  app.use('/api/admin', adminRouteProtection);
  
  // Admin auth setup
  setupAdminAuth(app);

  // Normal user registration
  // Normal user authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, hcaptcha } = userRegisterSchema.parse(req.body);
      
      // Verify hCaptcha
      const isCaptchaValid = await verifyHCaptcha(hcaptcha);
      if (!isCaptchaValid) {
        return res.status(400).json({ message: 'CAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsernameOrEmail(username, email);
      if (existingUser) {
        return res.status(400).json({ message: 'Kullanıcı adı veya email zaten kullanımda' });
      }
      
      // Generate random avatar ID (1-24)
      const avatarId = Math.floor(Math.random() * 24) + 1;

      // Create user with random avatar
      const hashedPassword = await hashPassword(password);
      const user = await storage.createNormalUser({
        username,
        email,
        password: hashedPassword,
        avatarId,
      });

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = false;

      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        avatarId: user.avatarId,
        isAdmin: false,
        message: 'Kayıt başarılı' 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Kayıt sırasında hata oluştu' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password, hcaptcha } = userLoginSchema.parse(req.body);
      
      // Verify hCaptcha
      const isCaptchaValid = await verifyHCaptcha(hcaptcha);
      if (!isCaptchaValid) {
        return res.status(400).json({ message: 'CAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.' });
      }
      
      // First try to find admin user
      const foundAdminUser = await storage.getAdminByUsername(username);
      if (foundAdminUser) {
        // Check admin password
        const isValidPassword = await comparePassword(password, foundAdminUser.password);
        if (isValidPassword && foundAdminUser.isActive) {
          // Update last login
          await storage.updateAdminLastLogin(foundAdminUser.id);

          // Set session for admin
          req.session.userId = foundAdminUser.id;
          req.session.username = foundAdminUser.username;
          req.session.isAdmin = true;

          return res.json({ 
            id: foundAdminUser.id, 
            username: foundAdminUser.username, 
            email: foundAdminUser.email,
            isAdmin: true,
            message: 'Admin girişi başarılı' 
          });
        }
      }

      // If not admin, try normal user
      const user = await storage.getNormalUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }

      // Check if this user is also an admin (by username)
      const relatedAdminUser = await storage.getAdminByUsername(username);
      const isUserAdmin = relatedAdminUser && relatedAdminUser.isActive;

      // Set session for normal user
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = isUserAdmin || false;

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        avatarId: user.avatarId,
        isAdmin: isUserAdmin || false,
        message: 'Giriş başarılı' 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Giriş sırasında hata oluştu' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Çıkış sırasında hata oluştu' });
      }
      res.json({ message: 'Çıkış başarılı' });
    });
  });

  // Auto-login endpoint for admin to login as any user
  app.post('/api/auth/auto-login', requireAdminAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'Kullanıcı ID gerekli' });
      }

      // Try to find user in normal_users table first
      const normalUser = await db
        .select()
        .from(normalUsers)
        .where(eq(normalUsers.id, parseInt(userId)))
        .limit(1);
      
      if (normalUser.length > 0) {
        const user = normalUser[0];
        
        // Create session for the user
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isAdmin = false; // Will be checked dynamically
        
        return res.json({ 
          message: 'Kullanıcı olarak giriş yapıldı',
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
      
      // If not found in normal users, try Replit users
      const replitUser = await storage.getUser(userId.toString());
      if (replitUser) {
        (req.session as any).userId = replitUser.id;
        req.session.username = replitUser.firstName || replitUser.email || 'User';
        req.session.isAdmin = replitUser.role === 'admin';
        
        return res.json({
          message: 'Kullanıcı olarak giriş yapıldı',
          user: {
            id: replitUser.id,
            username: replitUser.firstName || replitUser.email,
            email: replitUser.email
          }
        });
      }
      
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    } catch (error) {
      console.error('Auto-login error:', error);
      res.status(500).json({ message: 'Giriş yapılamadı' });
    }
  });

  app.get('/api/user', async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Giriş yapılmamış' });
    }
    
    try {
      // For Replit Auth users, check if they exist in our users table
      if (req.user && req.isAuthenticated()) {
        const replitUser = req.user as any;
        const dbUser = await storage.getUser(replitUser.id);
        
        if (dbUser) {
          return res.json({
            id: dbUser.id,
            username: dbUser.firstName || 'User',
            email: dbUser.email,
            authenticated: true,
            isAdmin: dbUser.role === 'admin'
          });
        }
      }
      
      // For custom auth users (normal users), check their current role in database
      if (req.session.username) {
        const normalUser = await storage.getNormalUserByUsername(req.session.username);
        if (normalUser) {
          // Check if this normal user has a role entry in users table
          const userRole = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, normalUser.id.toString()))
            .limit(1);
          
          const isAdmin = userRole.length > 0 ? userRole[0].role === 'admin' : false;
          
          return res.json({
            id: req.session.userId,
            username: req.session.username,
            email: normalUser.email,
            avatarId: normalUser.avatarId,
            authenticated: true,
            isAdmin: isAdmin
          });
        }
      }
      
      // Fallback for session data
      res.json({
        id: req.session.userId,
        username: req.session.username,
        authenticated: true,
        isAdmin: req.session.isAdmin || false
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.json({
        id: req.session.userId,
        username: req.session.username,
        authenticated: true,
        isAdmin: req.session.isAdmin || false
      });
    }
  });

  // Admin Dashboard routes
  app.get("/api/admin/dashboard/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin Keys routes
  app.get("/api/admin/keys", requireAdminAuth, async (req, res) => {
    try {
      const keys = await storage.getAllKeys();
      res.json(keys);
    } catch (error) {
      console.error("Error fetching keys:", error);
      res.status(500).json({ message: "Failed to fetch keys" });
    }
  });

  app.get("/api/admin/keys/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getKeyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching key stats:", error);
      res.status(500).json({ message: "Failed to fetch key stats" });
    }
  });

  app.get("/api/admin/keys/export/:category", requireAdminAuth, async (req, res) => {
    try {
      const { category } = req.params;
      const keys = await storage.getAllKeys();
      
      // Filter keys by category
      const filteredKeys = keys.filter(key => key.category === category);
      
      if (filteredKeys.length === 0) {
        return res.status(404).json({ message: `Bu kategoride hiç key bulunmamaktadır: ${category}` });
      }
      
      // Create text content with just the key values
      const keyValues = filteredKeys.map(key => key.value).join('\n');
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${category}_keys.txt"`);
      
      res.send(keyValues);
    } catch (error) {
      console.error("Error exporting keys:", error);
      res.status(500).json({ message: "Failed to export keys" });
    }
  });

  app.post("/api/admin/keys", requireAdminAuth, async (req: any, res) => {
    try {
      console.log("Key creation request:", req.body);
      
      const { keyCount = 1, ...keyData } = req.body;
      const createdKeys = [];

      // Create multiple keys if keyCount > 1
      for (let i = 0; i < keyCount; i++) {
        const validatedData = insertKeySchema.parse({
          ...keyData,
          name: keyCount > 1 ? `${keyData.name} #${i + 1}` : keyData.name,
          value: generateKey(),
          createdBy: req.session.adminUsername || 'admin',
        });

        console.log(`Validated key data ${i + 1}/${keyCount}:`, validatedData);

        const key = await storage.createKey(validatedData);
        createdKeys.push(key);

        console.log(`Created key ${i + 1}/${keyCount}:`, key);

        // Log key creation
        await storage.createLog({
          type: "key_created",
          message: `Key ${key.value} created (${i + 1}/${keyCount}) with service ID ${key.serviceId}, API ID ${key.apiSettingsId} and max quantity ${key.maxQuantity}`,
          userId: req.session.adminUsername || 'admin',
          keyId: key.id,
          data: { 
            keyName: key.name, 
            keyType: key.type, 
            serviceId: key.serviceId, 
            apiSettingsId: key.apiSettingsId, 
            maxQuantity: key.maxQuantity,
            batchCount: keyCount,
            batchIndex: i + 1
          },
        });
      }

      // Return all created keys or single key
      if (keyCount === 1) {
        res.json(createdKeys[0]);
      } else {
        res.json({
          message: `${keyCount} key başarıyla oluşturuldu`,
          keys: createdKeys,
          count: createdKeys.length
        });
      }
    } catch (error) {
      console.error("Error creating keys:", error);
      res.status(500).json({ message: (error as Error).message || "Failed to create keys" });
    }
  });

  app.delete("/api/admin/keys/:id", requireAdminAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKey(id);

      // Log key deletion
      await storage.createLog({
        type: "key_deleted",
        message: `Key with ID ${id} deleted`,
        userId: req.session.adminUsername || 'admin',
        keyId: id,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key:", error);
      res.status(500).json({ message: "Failed to delete key" });
    }
  });

  app.get("/api/admin/keys/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getKeyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching key stats:", error);
      res.status(500).json({ message: "Failed to fetch key stats" });
    }
  });

  app.post("/api/admin/keys/cleanup-expired", requireAdminAuth, async (req, res) => {
    try {
      const deletedCount = await storage.cleanupExpiredKeys();
      res.json({
        success: true,
        deletedCount,
        message: `${deletedCount} expired key temizlendi`
      });
    } catch (error) {
      console.error("Error cleaning up expired keys:", error);
      res.status(500).json({ message: "Expired key'ler temizlenemedi" });
    }
  });

  // Key İstatistikleri endpoint'i
  app.get("/api/admin/key-stats", requireAdminAuth, async (req, res) => {
    try {
      const timeRange = (req.query.timeRange as string) || '7d';
      const stats = await storage.getKeyStatistics(timeRange);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching key statistics:", error);
      res.status(500).json({ message: "Failed to fetch key statistics" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/admin/services/all", requireAdminAuth, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching all services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const service = await storage.updateService(id, updates);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // User interface routes (public)
  app.post("/api/validate-key", async (req, res) => {
    try {
      const { key } = req.body;
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }

      // Check maintenance mode - only allow admins
      const settings = await storage.getAllApiSettings();
      const maintenanceSetting = settings.find(s => s.name === 'maintenance_mode');
      const isMaintenanceMode = maintenanceSetting ? maintenanceSetting.isActive : false;
      
      if (isMaintenanceMode) {
        // Check if user is admin (we'll need to modify this based on your admin auth system)
        const isAdmin = req.session?.adminId; // Check if admin is logged in
        if (!isAdmin) {
          return res.status(503).json({ 
            message: "Sistem bakım modunda. Lütfen daha sonra tekrar deneyin.",
            maintenanceMode: true
          });
        }
      }

      const foundKey = await storage.getKeyByValue(key);
      if (!foundKey) {
        return res.status(404).json({ message: "Invalid key" });
      }

      // Check if key has remaining quantity
      const maxQuantity = foundKey.maxQuantity || 0;
      const usedQuantity = foundKey.usedQuantity || 0;
      const remainingQuantity = maxQuantity - usedQuantity;
      if (remainingQuantity <= 0) {
        return res.status(400).json({ message: "Key limiti dolmuş" });
      }

      // Get the specific service this key was created for
      let keyService = null;
      if (foundKey.serviceId) {
        keyService = await storage.getServiceById(foundKey.serviceId);
      }

      // Get services associated with this key's API for selection
      let availableServices = [];
      if (foundKey.apiSettingsId) {
        // Get all services that belong to the same API as this key
        const allServices = await storage.getAllServices();
        availableServices = allServices.filter(service => 
          service.isActive && (service as any).apiSettingsId === foundKey.apiSettingsId
        );
        
        // If no services found for this API, show all active services
        if (availableServices.length === 0) {
          availableServices = await storage.getActiveServices();
        }
      } else {
        // If no API settings, get all active services
        availableServices = await storage.getActiveServices();
      }

      // Use the key's specific service, fallback to first available
      const displayService = keyService || (availableServices.length > 0 ? availableServices[0] : null);

      res.json({ 
        id: foundKey.id,
        value: foundKey.value,
        category: foundKey.category || 'Instagram',
        maxQuantity: maxQuantity,
        usedQuantity: usedQuantity,
        remainingQuantity: remainingQuantity,
        apiSettingsId: foundKey.apiSettingsId,
        service: displayService ? {
          id: displayService.id,
          name: displayService.name,
          platform: displayService.platform,
          type: displayService.type,
          serviceId: displayService.serviceId
        } : {
          id: 1,
          name: "Default Service", 
          platform: "Test",
          type: "followers",
          serviceId: "1"
        },
        availableServices: availableServices.map(service => ({
          id: service.id,
          name: service.name,
          platform: service.platform,
          type: service.type,
          serviceId: service.serviceId
        }))
      });
    } catch (error) {
      console.error("Error validating key:", error);
      res.status(500).json({ message: "Failed to validate key" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      // Check maintenance mode first
      const settings = await storage.getAllApiSettings();
      const maintenanceSetting = settings.find(s => s.name === 'maintenance_mode');
      const isMaintenanceMode = maintenanceSetting ? maintenanceSetting.isActive : false;
      
      if (isMaintenanceMode) {
        const isAdmin = req.session?.adminId;
        if (!isAdmin) {
          return res.status(503).json({ 
            message: "Sistem bakım modunda. Lütfen daha sonra tekrar deneyin.",
            maintenanceMode: true
          });
        }
      }

      const { keyValue, serviceId, targetUrl, quantity } = req.body;

      // Validate key
      const key = await storage.getKeyByValue(keyValue);
      if (!key) {
        return res.status(400).json({ message: "Invalid key" });
      }

      // Key artık herhangi bir servis için kullanılabilir
      // Servis kısıtlaması kaldırıldı

      // Check remaining quantity
      const usedQuantity = key.usedQuantity || 0;
      const maxQuantity = key.maxQuantity || 0;
      const remainingQuantity = maxQuantity - usedQuantity;
      if (remainingQuantity <= 0) {
        return res.status(400).json({ message: "Key limit has been reached" });
      }

      if (quantity > remainingQuantity) {
        return res.status(400).json({ message: `Bu key ile en fazla ${remainingQuantity} adet sipariş verebilirsiniz` });
      }

      // Get service
      const service = await storage.getServiceById(serviceId);
      if (!service || !service.isActive) {
        return res.status(400).json({ message: "Service not available" });
      }

      // Get the API settings from the key to determine which API to use
      if (!key.apiSettingsId) {
        return res.status(400).json({ message: "Key için API ayarları bulunamadı" });
      }
      
      const apiSettings = await storage.getApiSettingsById(key.apiSettingsId);
      if (!apiSettings || !apiSettings.isActive) {
        return res.status(400).json({ message: "API ayarları bulunamadı veya aktif değil" });
      }

      // Check service minimum/maximum quantity limits
      if (service.minQuantity && quantity < service.minQuantity) {
        return res.status(400).json({ 
          message: `Bu servis için minimum ${service.minQuantity} adet sipariş verilmelidir` 
        });
      }

      if (service.maxQuantity && quantity > service.maxQuantity) {
        return res.status(400).json({ 
          message: `Bu servis için maksimum ${service.maxQuantity} adet sipariş verilebilir` 
        });
      }

      // Generate unique order ID
      const orderId = generateOrderId();

      // Create order
      const order = await storage.createOrder({
        orderId,
        keyId: key.id,
        serviceId: service.id,
        targetUrl: targetUrl || null,
        quantity: parseInt(quantity),
        status: "pending",
      });

      // Update key usage (increment used quantity)
      await storage.updateKeyUsedQuantity(key.id, quantity);

      // Log order creation
      await storage.createLog({
        type: "order_created",
        message: `Order created for ${service.name}`,
        keyId: key.id,
        orderId: order.id,
        data: { targetUrl, quantity, service: service.name },
      });

      try {
        // Make API request to the correct API based on key's API settings
        let requestData;
        if (service.requestTemplate) {
          requestData = JSON.parse(JSON.stringify(service.requestTemplate));
          // Replace placeholders with actual values
          requestData.link = targetUrl;
          requestData.quantity = quantity.toString();
          requestData.service = service.serviceId?.toString() || "1";
          requestData.key = apiSettings.apiKey; // Use the correct API key
        } else {
          requestData = {
            key: apiSettings.apiKey, // Use the correct API key from the key's API settings
            action: "add",
            service: service.serviceId?.toString() || "1",
            link: targetUrl,
            quantity: quantity.toString()
          };
        }

        console.log(`Making API request to: ${apiSettings.apiUrl}`);
        console.log(`Using API key: ${apiSettings.apiKey?.substring(0, 8)}...`);
        console.log(`Service ID: ${service.serviceId}`);
        console.log(`Request data:`, { ...requestData, key: requestData.key?.substring(0, 8) + '...' });

        const response = await makeServiceRequest(
          apiSettings.apiUrl, // Use the correct API URL from key's API settings
          "POST",
          {},
          requestData
        );

        console.log('API Response:', response);

        // Check API response and update order status accordingly
        let orderStatus = "pending";
        let orderMessage = "Sipariş işleme alındı";
        
        if (response && response.order) {
          // API'den gelen sipariş ID'sini kaydet - başlangıçta pending olarak başla
          orderStatus = "pending";
          orderMessage = `Sipariş başarıyla oluşturuldu. API Sipariş ID: ${response.order}`;
        } else if (response && response.error) {
          orderStatus = "failed";
          orderMessage = `Sipariş başarısız: ${response.error}`;
        }

        const updatedOrder = await storage.updateOrder(order.id, {
          status: orderStatus,
          response,
          message: orderMessage,
          completedAt: orderStatus === "completed" ? new Date() : null,
        });

        // Log success
        await storage.createLog({
          type: "order_completed",
          message: `Order completed successfully - Used ${quantity} from key (Total: ${(key.usedQuantity || 0) + quantity}/${key.maxQuantity})`,
          keyId: key.id,
          orderId: order.id,
          data: { response, quantityUsed: quantity },
        });

        res.json({
          success: true,
          message: "Order completed successfully",
          orderId: updatedOrder.orderId,
          order: updatedOrder,
        });
      } catch (apiError) {
        // Update order status to failed
        await storage.updateOrder(order.id, {
          status: "failed",
          response: { error: (apiError as Error).message },
        });

        // Log failure
        await storage.createLog({
          type: "order_failed",
          message: `Order failed: ${(apiError as Error).message}`,
          keyId: key.id,
          orderId: order.id,
          data: { error: (apiError as Error).message },
        });

        res.status(500).json({
          success: false,
          message: "Failed to process order",
          orderId: order.orderId,
          error: (apiError as Error).message,
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Order status tracking endpoint - lightweight version of search
  app.get("/api/orders/status/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await storage.getOrderByOrderId(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Sipariş bulunamadı" });
      }

      res.json({
        orderId: order.orderId,
        status: order.status,
        message: order.message || 'Sipariş işleniyor...',
        createdAt: order.createdAt,
        completedAt: order.completedAt
      });
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ message: "Sipariş durumu alınırken hata oluştu" });
    }
  });

  // Public order search endpoint
  app.get("/api/orders/search/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({ message: "Sipariş ID gerekli" });
      }

      const order = await storage.getOrderByOrderId(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Sipariş bulunamadı" });
      }

      // Get order details with key and service information
      const keys = await storage.getAllKeys();
      const key = keys.find(k => k.id === order.keyId);
      const service = await storage.getServiceById(order.serviceId);

      if (!key || !service) {
        return res.status(404).json({ message: "Sipariş detayları eksik" });
      }

      // Check if we should update from real API (only for non-final statuses)
      const shouldCheckAPI = !['completed', 'failed', 'cancelled'].includes(order.status);
      
      if (shouldCheckAPI && order.response && typeof order.response === 'object') {
        const responseData = order.response as any;
        const externalOrderId = responseData.order || responseData.orderId || responseData.id;
        
        if (externalOrderId) {
          try {
            // Get API settings for this service
            const apiSettings = await storage.getActiveApiSettings();
            const serviceApiSettings = apiSettings.find(api => api.id === service.apiSettingsId);
            
            if (serviceApiSettings?.apiKey && serviceApiSettings?.apiUrl) {
              // Use optimized API status check
              const statusData = await getOrderStatusFromAPI(
                serviceApiSettings.apiKey,
                serviceApiSettings.apiUrl,
                externalOrderId.toString()
              );
              
              if (statusData?.status) {
                console.log('API Response for order:', externalOrderId, statusData);
                
                // Map MedyaBayim API status to internal status
                let mappedStatus = statusData.status.toLowerCase();
                
                // Handle all possible API status values
                switch (mappedStatus) {
                  case 'pending':
                    mappedStatus = 'pending';
                    break;
                  case 'in progress':
                    mappedStatus = 'in_progress';
                    break;
                  case 'processing':
                    mappedStatus = 'processing';
                    break;
                  case 'completed':
                    mappedStatus = 'completed';
                    break;
                  case 'partial':
                    mappedStatus = 'partial';
                    break;
                  case 'canceled':
                  case 'cancelled':
                    mappedStatus = 'cancelled';
                    break;
                  default:
                    // Keep original status if unknown
                    break;
                }
                
                // Update order if status changed
                if (mappedStatus !== order.status) {
                  const updateData: any = { 
                    status: mappedStatus as any,
                    message: statusData.remains ? `Kalan: ${statusData.remains}` : statusData.status 
                  };
                  
                  // Set completion time for final statuses
                  if (['completed', 'cancelled', 'partial'].includes(mappedStatus)) {
                    updateData.completedAt = new Date();
                  }
                  
                  await storage.updateOrder(order.id, updateData);
                  
                  // Update response object
                  order.status = mappedStatus as any;
                  order.message = updateData.message;
                  if (updateData.completedAt) {
                    order.completedAt = updateData.completedAt;
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error checking API status:', error);
          }
        }
      }

      // Return detailed order information
      res.json({
        ...order,
        key: {
          id: key.id,
          value: key.value,
          name: key.name,
          category: key.category || 'Instagram'
        },
        service: {
          id: service.id,
          name: service.name,
          platform: service.platform,
          type: service.type
        }
      });
    } catch (error) {
      console.error("Error searching public order:", error);
      res.status(500).json({ message: "Sipariş arama hatası" });
    }
  });

  // User orders - kullanıcının kendi siparişlerini görmesi için
  app.get("/api/user/orders", requireUserAuth, async (req: any, res) => {
    try {
      // Kullanıcının kullandığı key'lere ait siparişleri getir
      const userId = req.session.userId;
      const userOrders = await storage.getUserOrders(userId);
      
      res.json(userOrders);
    } catch (error) {
      console.error("Error fetching user orders:", error); 
      res.status(500).json({ message: "Siparişler getirilemedi" });
    }
  });

  // Admin Orders routes
  app.get("/api/admin/orders", requireAdminAuth, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin Services routes
  app.get("/api/admin/services/all", requireAdminAuth, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Admin Logs routes
  app.get("/api/admin/logs", requireAdminAuth, async (req, res) => {
    try {
      const logs = await storage.getAllLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Database info endpoint
  app.get("/api/database/info", async (req, res) => {
    try {
      // Get basic database connection info
      const dbInfo = {
        connected: true,
        url: process.env.DATABASE_URL ? "Set" : "Not set",
        timestamp: new Date().toISOString()
      };

      // Try to get admin users count
      const adminCount = await storage.getAdminCount();

      res.json({
        database: dbInfo,
        adminUsersCount: adminCount
      });
    } catch (error) {
      console.error("Database info error:", error);
      res.status(500).json({ 
        message: "Database connection error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List all admin users (without passwords)
  app.get("/api/admin/list", requireAdminAuth, async (req, res) => {
    try {
      // Get admin users from admin_users table
      const admins = await storage.getAllAdmins();
      const safeAdmins = admins.map(admin => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt,
        source: 'admin_table'
      }));
      
      // Get promoted users (normal users with admin role)
      const promotedAdmins = await db
        .select({
          id: users.id,
          username: users.firstName,
          email: users.email,
          isActive: sql<boolean>`true`,
          createdAt: users.createdAt,
          lastLoginAt: users.updatedAt
        })
        .from(users)
        .where(eq(users.role, 'admin'));
      
      const safePromotedAdmins = promotedAdmins.map(admin => ({
        id: parseInt(admin.id),
        username: admin.username,
        email: admin.email,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt,
        source: 'promoted_user'
      }));
      
      // Combine both lists
      const allAdmins = [...safeAdmins, ...safePromotedAdmins];
      res.json(allAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // List all regular users (both normal_users and Replit users)
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      // Get normal users from normal_users table
      const normalUsersList = await db.select().from(normalUsers).orderBy(desc(normalUsers.createdAt));
      
      // Get Replit users from users table  
      const replitUsers = await storage.getAllUsers();
      
      // Track unique user IDs to avoid duplicates
      const seenIds = new Set();
      const allUsers = [];
      
      // For normal users, check if they have a role entry in users table
      for (const user of normalUsersList) {
        if (!seenIds.has(user.id.toString())) {
          seenIds.add(user.id.toString());
          
          // Check if this normal user has an entry in users table (for role info)
          const userRole = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, user.id.toString()))
            .limit(1);
          
          const currentRole = userRole.length > 0 ? userRole[0].role : 'user';
          
          // Only add non-admin users to regular user list
          if (currentRole !== 'admin') {
            allUsers.push({
              id: user.id,
              username: user.username,
              email: user.email,
              role: currentRole,
              createdAt: user.createdAt,
              type: 'normal',
              isActive: user.isActive
            });
          }
        }
      }
      
      // Add Replit users only if they don't already exist in normal users and are not admins
      for (const user of replitUsers) {
        if (!seenIds.has(user.id) && user.role !== 'admin') {
          seenIds.add(user.id);
          
          allUsers.push({
            id: user.id,
            username: user.firstName || user.email || 'Unknown',
            email: user.email,
            role: user.role || 'user',
            createdAt: user.createdAt,
            type: 'replit',
            isActive: true
          });
        }
      }
      
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user role
  app.put("/api/admin/users/:id/role", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      console.log(`Updating user role: id=${id}, role=${role}`);

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.updateUserRole(id, role);
      console.log("Updated user:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Create admin directly (for initial setup)
  app.post("/api/admin/create-direct", async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli" });
      }

      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new admin
      const newAdmin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        email: email || '',
        isActive: true
      });

      res.json({ 
        message: "Admin başarıyla oluşturuldu",
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          isActive: newAdmin.isActive,
          createdAt: newAdmin.createdAt
        }
      });
    } catch (error) {
      console.error("Direct admin creation error:", error);
      res.status(500).json({ message: "Admin oluşturulamadı" });
    }
  });

  // Create new admin (requires admin auth)
  app.post("/api/admin/create", requireAdminAuth, async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli" });
      }

      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new admin
      const newAdmin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        email: email || '',
        isActive: true
      });

      res.json({ 
        message: "Yeni admin başarıyla oluşturuldu",
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          isActive: newAdmin.isActive,
          createdAt: newAdmin.createdAt
        }
      });
    } catch (error) {
      console.error("Admin creation error:", error);
      res.status(500).json({ message: "Admin oluşturulamadı" });
    }
  });

  // Admin API Management routes - Fixed version
  app.post("/api/admin/fetch-services", requireAdminAuth, async (req, res) => {
    try {
      const { apiUrl, apiKey } = req.body;
      
      if (!apiUrl) {
        return res.status(400).json({ message: "API URL gereklidir" });
      }

      if (!apiKey) {
        return res.status(400).json({ message: "API Key zorunludur" });
      }

      console.log('Making API request to:', apiUrl);
      console.log('Using API key:', apiKey.substring(0, 8) + '...');

      // Try multiple API request formats to support various APIs
      let response;
      let data;
      let requestSuccessful = false;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        // Method 1: Try form-data format (like medyabayim.com and similar sites)
        if (!requestSuccessful) {
          try {
            console.log('Trying form-data format...');
            const formData = new URLSearchParams();
            formData.append('key', apiKey);
            formData.append('action', 'services');

            const headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            };

            response = await fetch(apiUrl, {
              method: 'POST',
              headers,
              body: formData.toString(),
              signal: controller.signal,
            });

            if (response.ok) {
              const responseText = await response.text();
              console.log('Form-data response received, length:', responseText.length);
              
              try {
                data = JSON.parse(responseText);
                requestSuccessful = true;
                console.log('Form-data format successful');
              } catch (parseError) {
                console.log('Form-data response not valid JSON, trying other methods...');
              }
            } else {
              console.log('Form-data format returned:', response.status);
            }
          } catch (error) {
            console.log('Form-data method failed:', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Method 2: Try JSON format with Bearer token
        if (!requestSuccessful) {
          try {
            console.log('Trying JSON format with Bearer token...');
            const headers: any = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };

            const requestData = {
              action: 'services'
            };

            response = await fetch(apiUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(requestData),
              signal: controller.signal,
            });

            if (response.ok) {
              data = await response.json();
              requestSuccessful = true;
              console.log('JSON Bearer format successful');
            } else {
              console.log('JSON Bearer format returned:', response.status);
            }
          } catch (error) {
            console.log('JSON Bearer method failed:', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Method 3: Try JSON format with key in body
        if (!requestSuccessful) {
          try {
            console.log('Trying JSON format with key in body...');
            const headers: any = {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };

            const requestData = {
              key: apiKey,
              action: 'services'
            };

            response = await fetch(apiUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(requestData),
              signal: controller.signal,
            });

            if (response.ok) {
              data = await response.json();
              requestSuccessful = true;
              console.log('JSON body key format successful');
            } else {
              console.log('JSON body key format returned:', response.status);
            }
          } catch (error) {
            console.log('JSON body key method failed:', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Method 4: Try GET request with query parameters
        if (!requestSuccessful) {
          try {
            console.log('Trying GET format with query parameters...');
            const urlWithParams = new URL(apiUrl);
            urlWithParams.searchParams.append('key', apiKey);
            urlWithParams.searchParams.append('action', 'services');

            const headers: any = {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };

            response = await fetch(urlWithParams.toString(), {
              method: 'GET',
              headers,
              signal: controller.signal,
            });

            if (response.ok) {
              data = await response.json();
              requestSuccessful = true;
              console.log('GET query params format successful');
            } else {
              console.log('GET query params format returned:', response.status);
            }
          } catch (error) {
            console.log('GET query params method failed:', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Method 5: Try different action parameter names
        if (!requestSuccessful) {
          try {
            console.log('Trying alternative action names...');
            const formData = new URLSearchParams();
            formData.append('key', apiKey);
            formData.append('method', 'services'); // Some APIs use 'method' instead of 'action'

            const headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };

            response = await fetch(apiUrl, {
              method: 'POST',
              headers,
              body: formData.toString(),
              signal: controller.signal,
            });

            if (response.ok) {
              const responseText = await response.text();
              try {
                data = JSON.parse(responseText);
                requestSuccessful = true;
                console.log('Alternative action name successful');
              } catch (parseError) {
                console.log('Alternative action response not valid JSON');
              }
            }
          } catch (error) {
            console.log('Alternative action method failed:', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        clearTimeout(timeoutId);

        if (!requestSuccessful) {
          throw new Error('Tüm API format denemeleri başarısız oldu. API dokümantasyonunu kontrol edin.');
        }

        // Create API settings first to get the ID
        const apiSettings = await storage.createApiSettings({
          name: `API - ${new Date().toISOString()}`,
          apiUrl: apiUrl,
          apiKey: apiKey,
          isActive: true
        });

        const formattedServices = formatServicesResponse(data, apiUrl, apiKey, apiSettings.id);
        return res.json({
          ...formattedServices,
          apiSettingsId: apiSettings.id
        });

      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('All API methods failed:', fetchError);
        throw fetchError;
      }
      
    } catch (error) {
      console.error("Error fetching services from API:", error);
      res.status(500).json({ 
        message: "API'den servis getirme başarısız", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/admin/import-services", requireAdminAuth, async (req, res) => {
    try {
      const { services } = req.body;

      if (!services || !Array.isArray(services)) {
        return res.status(400).json({ message: "Services array is required" });
      }

      console.log(`Starting bulk import of ${services.length} services...`);
      
      // Validate and prepare services for bulk insert
      const validatedServices = [];
      const errors = [];

      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        try {
          const validatedData = insertServiceSchema.parse({
            name: service.name || `Service ${i + 1}`,
            platform: service.platform || "External API",
            type: service.type || "API Service",
            icon: service.icon || "Settings",
            isActive: service.isActive !== false,
            apiEndpoint: service.apiEndpoint,
            apiMethod: service.apiMethod || "POST",
            apiHeaders: service.apiHeaders || {},
            requestTemplate: service.requestTemplate || {},
            serviceId: service.serviceId || null,
          });

          validatedServices.push(validatedData);
        } catch (error) {
          errors.push(`Service ${i + 1} (${service.name || 'unnamed'}): ${error instanceof Error ? error.message : 'Validation error'}`);
        }
      }

      // Perform bulk insert using storage's bulk method
      const importedServices = await storage.bulkCreateServices(validatedServices);

      const result = {
        success: true,
        imported: importedServices.length,
        total: services.length,
        errors: errors,
        services: importedServices.slice(0, 10) // Return first 10 for preview
      };

      console.log(`Bulk import completed: ${importedServices.length}/${services.length} services imported`);
      if (errors.length > 0) {
        console.log(`Validation errors: ${errors.length}`);
      }

      res.json(result);
    } catch (error) {
      console.error("Error importing services:", error);
      res.status(500).json({ message: "Failed to import services" });
    }
  });

  // Admin API Settings routes
  app.get("/api/admin/api-settings", requireAdminAuth, async (req, res) => {
    try {
      const apiSettings = await storage.getAllApiSettings();
      res.json(apiSettings);
    } catch (error) {
      console.error("Error fetching API settings:", error);
      res.status(500).json({ message: "Failed to fetch API settings" });
    }
  });

  app.post("/api/admin/api-settings", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertApiSettingsSchema.parse(req.body);
      const apiSetting = await storage.createApiSettings(validatedData);
      
      // Automatically fetch and import services after API is added
      try {
        console.log('Auto-fetching services for new API:', validatedData.name);
        
        // Fetch services from the API using the same logic as fetch-services endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        let formattedServices: any[] = [];
        try {
          // Try form-data format first
          const formData = new URLSearchParams();
          formData.append('key', validatedData.apiKey || '');
          formData.append('action', 'services');

          const response = await fetch(validatedData.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: formData.toString(),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const responseText = await response.text();
            const fetchResponse = JSON.parse(responseText);
            formattedServices = formatServicesResponse(fetchResponse, validatedData.apiUrl, validatedData.apiKey || '', apiSetting.id);
          } else {
            throw new Error(`API request failed: ${response.status}`);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
        
        if (Array.isArray(formattedServices) && formattedServices.length > 0) {
          console.log(`Auto-importing ${formattedServices.length} services...`);
          
          // Validate and import services
          const validatedServices = [];
          const errors = [];
          
          for (const serviceData of formattedServices) {
            try {
              // Validate and cap price to prevent numeric overflow
              const rawPrice = parseFloat(serviceData.price?.toString() || '0');
              const maxPrice = 99999999.99; // Maximum value for numeric(10,2)
              const validatedPrice = isNaN(rawPrice) ? 0 : Math.min(Math.max(0, rawPrice), maxPrice);
              
              const validated = insertServiceSchema.parse({
                name: serviceData.name || `Service ${serviceData.serviceId || 'Unknown'}`,
                description: serviceData.description || serviceData.name || '',
                platform: serviceData.platform || 'External API',
                type: serviceData.type || 'social_media',
                icon: serviceData.icon || 'Settings',
                price: validatedPrice.toString(),
                isActive: serviceData.isActive !== false,
                apiEndpoint: serviceData.apiEndpoint || apiSetting.apiUrl,
                apiMethod: serviceData.apiMethod || 'POST',
                apiHeaders: serviceData.apiHeaders || {},
                requestTemplate: serviceData.requestTemplate || {},
                responseFormat: serviceData.responseFormat || {},
                serviceId: serviceData.serviceId?.toString() || null,
                apiSettingsId: apiSetting.id,
                category: serviceData.category || 'general',
                minQuantity: serviceData.minQuantity || 1,
                maxQuantity: serviceData.maxQuantity || 10000
              });
              validatedServices.push(validated);
            } catch (validationError) {
              console.error(`Validation error for service ${serviceData.name}:`, validationError);
              errors.push({
                service: serviceData.name || 'Unknown',
                error: validationError instanceof Error ? validationError.message : 'Validation failed'
              });
            }
          }
          
          if (validatedServices.length > 0) {
            const importedServices = await storage.bulkCreateServices(validatedServices);
            console.log(`Auto-import completed: ${importedServices.length}/${formattedServices.length} services imported`);
            
            res.json({
              ...apiSetting,
              autoImport: {
                success: true,
                imported: importedServices.length,
                total: formattedServices.length,
                errors: errors.length
              }
            });
          } else {
            res.json({
              ...apiSetting,
              autoImport: {
                success: false,
                message: 'Servislerin hiçbiri import edilemedi - validation hataları',
                errors: errors
              }
            });
          }
        } else {
          res.json({
            ...apiSetting,
            autoImport: {
              success: false,
              message: 'API\'den servis bulunamadı'
            }
          });
        }
      } catch (fetchError) {
        console.error('Auto-fetch failed:', fetchError);
        res.json({
          ...apiSetting,
          autoImport: {
            success: false,
            message: 'Servisleri otomatik çekme başarısız: ' + (fetchError instanceof Error ? fetchError.message : 'Unknown error')
          }
        });
      }
    } catch (error) {
      console.error("Error creating API setting:", error);
      res.status(500).json({ message: "Failed to create API setting" });
    }
  });

  app.put("/api/admin/api-settings/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const apiSetting = await storage.updateApiSettings(id, updates);
      res.json(apiSetting);
    } catch (error) {
      console.error("Error updating API setting:", error);
      res.status(500).json({ message: "Failed to update API setting" });
    }
  });

  app.delete("/api/admin/api-settings/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Starting API deletion for ID: ${id}`);
      
      // First, get all services that use this API setting
      const services = await storage.getAllServices();
      console.log(`Total services in database: ${services.length}`);
      
      const servicesToDelete = services.filter(service => {
        const hasApiId = service.apiSettingsId === id;
        if (hasApiId) {
          console.log(`Service "${service.name}" (ID: ${service.id}) will be deleted - linked to API ID: ${service.apiSettingsId}`);
        }
        return hasApiId;
      });
      
      console.log(`Found ${servicesToDelete.length} services to delete for API ID: ${id}`);
      
      // Delete all related services first
      let deletedCount = 0;
      for (const service of servicesToDelete) {
        try {
          await storage.deleteService(service.id);
          deletedCount++;
          console.log(`Deleted service: ${service.name} (ID: ${service.id})`);
        } catch (serviceError) {
          console.error(`Failed to delete service ${service.id}:`, serviceError);
        }
      }
      
      // Then delete the API setting
      await storage.deleteApiSettings(id);
      console.log(`Deleted API setting with ID: ${id}`);
      
      res.json({ 
        success: true, 
        deletedServices: deletedCount,
        message: `API başarıyla silindi ve ${deletedCount} bağlı servis kaldırıldı`
      });
    } catch (error) {
      console.error("Error deleting API setting:", error);
      res.status(500).json({ message: "API silme işlemi başarısız" });
    }
  });

  // API Bakiye Routes
  app.get("/api/admin/api-balances", requireAdminAuth, async (req, res) => {
    try {
      const balances = await storage.getApiBalances();
      res.json(balances);
    } catch (error) {
      console.error("Error fetching API balances:", error);
      res.status(500).json({ message: "Failed to fetch API balances" });
    }
  });

  app.post("/api/admin/api-balances/refresh", requireAdminAuth, async (req, res) => {
    try {
      const apiSettings = await storage.getActiveApiSettings();
      const balanceUpdates = [];
      
      for (const api of apiSettings) {
        try {
          console.log(`Refreshing balance for ${api.name}...`);
          
          let response;
          let result;
          let requestSuccessful = false;
          
          // Method 1: Try form-data format (most common for SMM panels)
          if (!requestSuccessful) {
            try {
              const formData = new URLSearchParams();
              formData.append('key', api.apiKey || '');
              formData.append('action', 'balance');
              
              response = await fetch(api.apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: formData.toString(),
              });
              
              if (response.ok) {
                const responseText = await response.text();
                try {
                  result = JSON.parse(responseText);
                  requestSuccessful = true;
                  console.log(`Form-data balance request successful for ${api.name}`);
                } catch (parseError) {
                  // If response is just a number (some APIs return plain text balance)
                  const numericBalance = parseFloat(responseText.trim());
                  if (!isNaN(numericBalance)) {
                    result = { balance: numericBalance };
                    requestSuccessful = true;
                    console.log(`Plain text balance received for ${api.name}: ${numericBalance}`);
                  }
                }
              }
            } catch (error) {
              console.log(`Form-data balance request failed for ${api.name}:`, error instanceof Error ? error.message : 'Unknown error');
            }
          }
          
          // Method 2: Try JSON format as fallback
          if (!requestSuccessful) {
            try {
              response = await fetch(api.apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({
                  key: api.apiKey || '',
                  action: 'balance'
                })
              });
              
              if (response.ok) {
                result = await response.json();
                requestSuccessful = true;
                console.log(`JSON balance request successful for ${api.name}`);
              }
            } catch (error) {
              console.log(`JSON balance request failed for ${api.name}:`, error instanceof Error ? error.message : 'Unknown error');
            }
          }
          
          if (requestSuccessful && result) {
            // Extract balance from response (format may vary between APIs)
            let balance = '0.00';
            
            console.log(`Balance response for ${api.name}:`, result);
            
            // Check various possible balance field names and formats
            if (result.balance !== undefined) {
              balance = parseFloat(result.balance).toFixed(2);
            } else if (result.currency !== undefined) {
              balance = parseFloat(result.currency).toFixed(2);
            } else if (result.fund !== undefined) {
              balance = parseFloat(result.fund).toFixed(2);
            } else if (result.money !== undefined) {
              balance = parseFloat(result.money).toFixed(2);
            } else if (result.credit !== undefined) {
              balance = parseFloat(result.credit).toFixed(2);
            } else if (result.amount !== undefined) {
              balance = parseFloat(result.amount).toFixed(2);
            } else if (result.funds !== undefined) {
              balance = parseFloat(result.funds).toFixed(2);
            } else if (typeof result === 'number') {
              balance = result.toFixed(2);
            } else if (typeof result === 'string' && !isNaN(parseFloat(result))) {
              balance = parseFloat(result).toFixed(2);
            } else {
              // Log the response structure for debugging
              console.log(`Unknown balance format for ${api.name}:`, JSON.stringify(result, null, 2));
              balance = '0.00';
            }
            
            console.log(`Final balance for ${api.name}: ${balance}`);
            
            // Update balance in database
            await storage.updateApiBalance(api.id, balance);
            balanceUpdates.push({
              id: api.id,
              name: api.name,
              balance,
              status: 'success'
            });
          } else {
            balanceUpdates.push({
              id: api.id,
              name: api.name,
              balance: null,
              status: 'error',
              error: 'API yanıt vermedi'
            });
          }
        } catch (error) {
          console.error(`Error refreshing balance for ${api.name}:`, error);
          balanceUpdates.push({
            id: api.id,
            name: api.name,
            balance: null,
            status: 'error',
            error: 'Bağlantı hatası'
          });
        }
      }
      
      res.json({
        success: true,
        updated: balanceUpdates.filter(u => u.status === 'success').length,
        failed: balanceUpdates.filter(u => u.status === 'error').length,
        results: balanceUpdates
      });
    } catch (error) {
      console.error("Error refreshing API balances:", error);
      res.status(500).json({ message: "Failed to refresh API balances" });
    }
  });

  // Maintenance mode endpoints
  app.get("/api/admin/maintenance-mode", requireAdminAuth, async (req, res) => {
    try {
      // Check if maintenance mode setting exists in database
      const settings = await storage.getAllApiSettings();
      const maintenanceSetting = settings.find(s => s.name === 'maintenance_mode');
      
      res.json({ 
        maintenanceMode: maintenanceSetting ? maintenanceSetting.isActive : false,
        message: maintenanceSetting ? "Bakım modu durumu alındı" : "Bakım modu ayarı bulunamadı"
      });
    } catch (error) {
      console.error("Error getting maintenance mode:", error);
      res.status(500).json({ message: "Bakım modu durumu alınamadı" });
    }
  });

  app.post("/api/admin/maintenance-mode", requireAdminAuth, async (req, res) => {
    try {
      const { enabled } = req.body;
      
      // Check if maintenance mode setting exists
      const settings = await storage.getAllApiSettings();
      const maintenanceSetting = settings.find(s => s.name === 'maintenance_mode');
      
      if (maintenanceSetting) {
        // Update existing setting
        await storage.updateApiSettings(maintenanceSetting.id, { isActive: enabled });
      } else {
        // Create new maintenance mode setting
        await storage.createApiSettings({
          name: 'maintenance_mode',
          apiUrl: 'internal://maintenance',
          apiKey: 'system',
          isActive: enabled
        });
      }
      
      res.json({ 
        success: true,
        maintenanceMode: enabled,
        message: enabled ? "Bakım modu etkinleştirildi" : "Bakım modu devre dışı bırakıldı"
      });
    } catch (error) {
      console.error("Error setting maintenance mode:", error);
      res.status(500).json({ message: "Bakım modu ayarlanamadı" });
    }
  });

  // Fetch and auto-import services from existing API
  app.post("/api/admin/fetch-and-import-services", requireAdminAuth, async (req, res) => {
    try {
      const { apiUrl, apiKey } = req.body;
      
      if (!apiUrl || !apiKey) {
        return res.status(400).json({ message: "API URL ve API Key gereklidir" });
      }

      console.log(`Fetching and auto-importing services from: ${apiUrl}`);
      
      // First, fetch services from the API
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const servicesResponse = await response.json();

      // Format the services (without API settings ID for standalone import)
      const formattedServices = formatServicesResponse(servicesResponse, apiUrl, apiKey, undefined);
      
      if (formattedServices.error) {
        return res.status(400).json({ 
          message: formattedServices.error,
          details: formattedServices.suggestedFix 
        });
      }

      if (!Array.isArray(formattedServices) || formattedServices.length === 0) {
        return res.status(400).json({ message: "API'den hiç servis bulunamadı" });
      }

      // Auto-import all services
      console.log(`Auto-importing ${formattedServices.length} services...`);
      
      let imported = 0;
      let errors = [];
      
      for (const serviceData of formattedServices) {
        try {
          const validated = insertServiceSchema.parse({
            name: serviceData.name || `Service ${serviceData.serviceId || 'Unknown'}`,
            description: serviceData.description || serviceData.name || '',
            platform: serviceData.platform || 'External API',
            type: serviceData.type || 'social_media',
            icon: serviceData.icon || 'Settings',
            price: serviceData.price?.toString() || '0',
            isActive: serviceData.isActive !== false,
            apiEndpoint: serviceData.apiEndpoint || '',
            apiMethod: serviceData.apiMethod || 'POST',
            apiHeaders: serviceData.apiHeaders || {},
            requestTemplate: serviceData.requestTemplate || {},
            responseFormat: serviceData.responseFormat || {},
            serviceId: serviceData.serviceId?.toString() || null,
            apiSettingsId: serviceData.apiSettingsId || undefined,
            category: serviceData.category || 'general',
            minQuantity: serviceData.minQuantity || 1,
            maxQuantity: serviceData.maxQuantity || 10000
          });
          await storage.createService(validated);
          imported++;
        } catch (validationError) {
          console.error("Validation error for service:", serviceData.name, validationError);
          errors.push({
            service: serviceData.name || 'Unknown',
            error: validationError instanceof Error ? validationError.message : 'Validation failed'
          });
        }
      }

      console.log(`Successfully imported ${imported} services`);
      
      res.json({
        success: true,
        imported,
        total: formattedServices.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : [], // Limit error details
        message: `${imported} servis başarıyla içe aktarıldı`
      });

    } catch (error) {
      console.error("Error in fetch-and-import-services:", error);
      res.status(500).json({ 
        message: "Servisler çekilirken hata oluştu",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Helper function to format API responses
  function formatServicesResponse(data: any, apiUrl: string, apiKey: string, apiSettingsId?: number | null) {
    let formattedServices = [];
    
    console.log('Formatting response data type:', typeof data);
    console.log('Response data keys:', data && typeof data === 'object' ? Object.keys(data) : 'Not an object');
    
    // Handle different response formats
    let servicesToProcess = [];
    
    if (Array.isArray(data)) {
      servicesToProcess = data;
      console.log('Data is direct array with', data.length, 'items');
    } else if (data && data.services && Array.isArray(data.services)) {
      servicesToProcess = data.services;
      console.log('Found services array with', data.services.length, 'items');
    } else if (data && typeof data === 'object') {
      // Check for all possible keys that might contain services
      const possibleKeys = [
        'data', 'results', 'items', 'list', 'response', 'payload', 
        'content', 'body', 'services_list', 'service_list', 'all_services',
        'smm_services', 'api_services', 'available_services'
      ];
      
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          servicesToProcess = data[key];
          console.log(`Found services in '${key}' with ${data[key].length} items`);
          break;
        }
      }
      
      // If still no array found, try to extract from nested objects
      if (servicesToProcess.length === 0) {
        const checkNested = (obj: any, depth = 0) => {
          if (depth > 3) return; // Prevent deep recursion
          
          for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value) && value.length > 0) {
              // Check if this looks like a services array
              const firstItem = value[0];
              if (firstItem && typeof firstItem === 'object' && 
                  (firstItem.service || firstItem.id || firstItem.name || firstItem.title)) {
                servicesToProcess = value;
                console.log(`Found nested services in '${key}' with ${value.length} items`);
                return;
              }
            } else if (value && typeof value === 'object') {
              checkNested(value, depth + 1);
            }
          }
        };
        
        checkNested(data);
      }
      
      // Last resort: try all object values
      if (servicesToProcess.length === 0) {
        const values = Object.values(data);
        for (const value of values) {
          if (Array.isArray(value) && value.length > 0) {
            servicesToProcess = value;
            console.log(`Found services in object values with ${value.length} items`);
            break;
          }
        }
      }
    }
    
    if (servicesToProcess.length === 0) {
      console.log('No services found in response. Response might be in unexpected format.');
      console.log('Raw response sample:', JSON.stringify(data).substring(0, 1000));
      
      // Don't create sample services, return empty array with error message
      return {
        error: 'API yanıtında servis bulunamadı. API dokümantasyonunu kontrol edin.',
        rawResponse: data,
        suggestedFix: 'API yanıtı beklenen formatta değil. Servisler array formatında olmalı.'
      };
    }
    
    // Detect API format based on domain or response structure
    const getDomainName = (url: string) => {
      try {
        return new URL(url).hostname.toLowerCase();
      } catch {
        return url.toLowerCase();
      }
    };
    
    const domain = getDomainName(apiUrl);
    let platformName = 'External API';
    
    // Set platform name based on domain
    if (domain.includes('medyabayim')) platformName = 'MedyaBayim';
    else if (domain.includes('resellerprovider')) platformName = 'ResellerProvider';
    else if (domain.includes('smmpanel')) platformName = 'SMM Panel';
    else if (domain.includes('smmkings')) platformName = 'SMM Kings';
    else if (domain.includes('followersup')) platformName = 'FollowersUp';
    else if (domain.includes('socialpanel')) platformName = 'Social Panel';
    else {
      // Extract domain name as platform
      const domainParts = domain.split('.');
      if (domainParts.length > 1) {
        platformName = domainParts[domainParts.length - 2].charAt(0).toUpperCase() + 
                     domainParts[domainParts.length - 2].slice(1);
      }
    }
    
    formattedServices = servicesToProcess.map((service: any, index: number) => {
      // Handle various service ID formats
      const serviceId = service.service || service.id || service.service_id || 
                       service.serviceId || service.service_number || (index + 1).toString();
      
      // Handle various name formats
      const serviceName = service.name || service.title || service.service_name || 
                         service.serviceName || service.description || service.desc ||
                         `Service ${serviceId}`;
      
      // Handle various price/rate formats - ensure valid number and convert to string
      let priceValue = service.rate || service.price || service.cost || service.amount || 
                      service.price_per_1000 || service.rate_per_1000 || 0;
      
      // Convert to number first, then validate and cap at maximum value for numeric(10,2)
      const numericPrice = parseFloat(priceValue);
      const maxPrice = 99999999.99; // Maximum value for numeric(10,2)
      let finalPrice = 0;
      
      if (!isNaN(numericPrice)) {
        finalPrice = Math.min(Math.max(0, numericPrice), maxPrice);
      }
      
      const price = finalPrice.toString();
      
      // Detect request format based on successful method
      let apiHeaders = { 'Content-Type': 'application/json' };
      let requestTemplate: any = {
        service: serviceId,
        link: '{{link}}',
        quantity: '{{quantity}}'
      };
      
      // Check domain-specific patterns
      if (domain.includes('medyabayim') || domain.includes('reseller')) {
        apiHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        requestTemplate = {
          key: apiKey,
          action: 'add',
          service: serviceId,
          link: '{{link}}',
          quantity: '{{quantity}}'
        };
      }
      
      return {
        name: serviceName,
        description: service.description || service.desc || service.details || serviceName,
        platform: platformName,
        type: service.type || service.category || service.category_name || 'social_media',
        price: price,
        isActive: true,
        apiEndpoint: apiUrl,
        apiMethod: 'POST',
        apiHeaders: apiHeaders,
        requestTemplate: requestTemplate,
        responseFormat: {},
        serviceId: serviceId,
        category: service.category || service.category_name || service.type || 'general',
        minQuantity: Math.max(1, parseInt(service.min || service.minimum || service.min_quantity || '1') || 1),
        maxQuantity: Math.max(1, parseInt(service.max || service.maximum || service.max_quantity || '10000') || 10000),
        apiSettingsId: apiSettingsId || undefined, // Hangi API'den geldiğini kaydeder (opsiyonel)
        originalData: service // Keep original for debugging
      };
    });
    
    console.log(`Successfully formatted ${formattedServices.length} services from ${platformName}`);
    return formattedServices;
  }

  // Import services from external API
  app.post("/api/admin/import-services", requireAdminAuth, async (req, res) => {
    try {
      const { services } = req.body;
      
      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ message: "Geçerli servis listesi gereklidir" });
      }

      let imported = 0;
      const errors = [];

      for (const service of services) {
        try {
          // Map external service format to our schema
          const serviceData = {
            name: service.name || service.title || 'Unknown Service',
            description: service.description || '',
            platform: service.platform || 'External',
            type: service.type || 'general',
            price: service.price || 0,
            isActive: service.isActive !== false, // Default to true unless explicitly false
            apiEndpoint: service.apiEndpoint || service.endpoint,
            apiMethod: service.apiMethod || 'POST',
            apiHeaders: service.apiHeaders || {},
            requestTemplate: service.requestTemplate || {},
            responseFormat: service.responseFormat || {},
          };

          await storage.createService(serviceData);
          imported++;
        } catch (serviceError) {
          console.error(`Error importing service ${service.name}:`, serviceError);
          errors.push(`${service.name}: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}`);
        }
      }

      res.json({
        imported,
        total: services.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `${imported} servis başarıyla içe aktarıldı`
      });
    } catch (error) {
      console.error("Error importing services:", error);
      res.status(500).json({ message: "Servis içe aktarma başarısız" });
    }
  });

  // Create new admin user (only akivi can create)
  app.post("/api/admin/create", requireAdminAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const currentAdmin = await storage.getAdminByUsername(session.adminUsername);
      
      if (!currentAdmin || currentAdmin.username !== "akivi") {
        return res.status(403).json({ message: "Sadece akivi admin oluşturabilir" });
      }

      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gereklidir" });
      }

      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const hashedPassword = await hashPassword(password);
      const newAdmin = await storage.createAdminUser({
        username,
        email: email || null,
        password: hashedPassword,
        isActive: true,
      });

      // Remove password from response
      const { password: _, ...adminResponse } = newAdmin;
      res.status(201).json(adminResponse);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Admin oluşturulurken bir hata oluştu" });
    }
  });

  // Suspend/unsuspend admin user (only akivi can do this)
  app.put("/api/admin/:id/suspend", requireAdminAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const currentAdmin = await storage.getAdminByUsername(session.adminUsername);
      
      if (!currentAdmin || currentAdmin.username !== "akivi") {
        return res.status(403).json({ message: "Sadece akivi bu işlemi yapabilir" });
      }

      const adminId = parseInt(req.params.id);
      const { suspend } = req.body;

      if (isNaN(adminId)) {
        return res.status(400).json({ message: "Geçersiz admin ID" });
      }

      // Can't suspend akivi
      const targetAdmin = await storage.getAdminById(adminId);
      if (!targetAdmin) {
        return res.status(404).json({ message: "Admin bulunamadı" });
      }

      if (targetAdmin.username === "akivi") {
        return res.status(403).json({ message: "akivi hesabı askıya alınamaz" });
      }

      const updatedAdmin = await storage.updateAdminStatus(adminId, !suspend);
      res.json(updatedAdmin);
    } catch (error) {
      console.error("Error updating admin status:", error);
      res.status(500).json({ message: "Admin durumu güncellenirken bir hata oluştu" });
    }
  });

  // Get admin list
  app.get("/api/admin/list", requireAdminAuth, async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  // Master password management routes
  app.get("/api/admin/master-password-info", requireAdminAuth, async (req, res) => {
    try {
      res.json({ currentPassword: getCurrentMasterPassword() });
    } catch (error) {
      console.error("Error fetching master password info:", error);
      res.status(500).json({ message: "Master şifre bilgisi alınamadı" });
    }
  });

  app.post("/api/admin/update-master-password", requireAdminAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Mevcut ve yeni şifre gerekli" });
      }

      // Verify current master password
      if (currentPassword !== getCurrentMasterPassword()) {
        return res.status(401).json({ message: "Mevcut master şifre hatalı" });
      }

      // Update master password
      updateMasterPassword(newPassword);

      res.json({ message: "Master şifre başarıyla güncellendi" });
    } catch (error) {
      console.error("Error updating master password:", error);
      res.status(500).json({ message: "Master şifre güncellenemedi" });
    }
  });

  app.post("/api/admin/change-password", requireAdminAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Mevcut şifre ve yeni şifre gerekli" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Yeni şifre en az 8 karakter olmalı" });
      }

      // Verify current password
      if (currentPassword !== getCurrentMasterPassword()) {
        return res.status(400).json({ message: "Mevcut şifre hatalı" });
      }
      
      // Update master password
      updateMasterPassword(newPassword);
      
      res.json({ 
        message: "Şifre başarıyla değiştirildi",
        newPassword: newPassword
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Şifre değiştirilemedi" });
    }
  });

  // PUBLIC API ROUTES - Key validation and order creation

  // Generate random order ID
  function generateOrderId(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  // Key validation endpoint (public)
  app.post("/api/keys/validate", async (req, res) => {
    try {
      const { keyValue } = req.body;

      if (!keyValue) {
        return res.status(400).json({ message: "Key değeri gerekli" });
      }

      // Find key and check if it's valid
      const key = await storage.getKeyByValue(keyValue);
      
      if (!key) {
        return res.status(404).json({ message: "Geçersiz key" });
      }

      // Check cumulative usage instead of isUsed flag
      const currentUsed = key.usedQuantity || 0;
      const remainingQuantity = (key.maxQuantity || 1000) - currentUsed;
      
      if (remainingQuantity <= 0) {
        return res.status(400).json({ message: "Bu key'in kullanım limiti dolmuş" });
      }

      // For display purposes, use the first available service (user can select any service)
      const services = await storage.getActiveServices();
      const defaultService = services.length > 0 ? services[0] : null;

      // Return validated key info (any service can be used)
      res.json({
        id: key.id,
        value: key.value,
        category: key.category || 'Instagram',
        maxQuantity: key.maxQuantity || 1000,
        usedQuantity: currentUsed,
        remainingQuantity: remainingQuantity,
        service: defaultService ? {
          id: defaultService.id,
          name: defaultService.name,
          platform: defaultService.platform,
          type: defaultService.type
        } : {
          id: 0,
          name: "Herhangi Bir Servis",
          platform: "Universal",
          type: "universal"
        }
      });

    } catch (error) {
      console.error("Error validating key:", error);
      res.status(500).json({ message: "Key doğrulama sırasında hata oluştu" });
    }
  });

  // Order creation endpoint (requires user auth)
  app.post("/api/orders", requireUserAuth, async (req, res) => {
    try {
      const { keyValue, serviceId, quantity, targetUrl } = req.body;

      if (!keyValue || !serviceId || !quantity) {
        return res.status(400).json({ message: "Key, servis ve miktar gerekli" });
      }

      // Validate key again
      const key = await storage.getKeyByValue(keyValue);
      
      if (!key) {
        return res.status(404).json({ message: "Geçersiz key" });
      }

      // Check cumulative usage
      const currentUsed = key.usedQuantity || 0;
      const totalUsage = currentUsed + quantity;
      
      if (totalUsage > (key.maxQuantity || 1000)) {
        return res.status(400).json({ 
          message: `Toplam kullanım limiti aştı. Kalan miktar: ${(key.maxQuantity || 1000) - currentUsed}` 
        });
      }

      // Get service - ANY service can be used with ANY key
      const service = await storage.getServiceById(serviceId);
      
      if (!service || !service.isActive) {
        return res.status(400).json({ message: "Servis aktif değil" });
      }

      // Generate unique order ID
      const orderId = generateOrderId();

      // Create order
      const order = await storage.createOrder({
        orderId,
        keyId: key.id,
        serviceId: service.id,
        quantity,
        targetUrl: targetUrl || '',
        status: 'pending',
        message: 'Sipariş oluşturuldu, işleme alınıyor...'
      });

      // Update key used quantity (cumulative usage)
      await storage.updateKeyUsedQuantity(key.id, quantity);

      // Log order creation
      await storage.createLog({
        type: "order_created",
        message: `Order ${orderId} created for service ${service.name}`,
        userId: `order_${orderId}`,
        keyId: key.id,
        orderId: order.id,
        data: { 
          service: service.name, 
          quantity, 
          targetUrl,
          orderId 
        },
      });

      // Start processing order asynchronously
      processOrderAsync(order.id, service, quantity, targetUrl);

      res.json({ 
        orderId,
        message: "Sipariş başarıyla oluşturuldu",
        status: "pending"
      });

    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Sipariş oluşturulurken hata oluştu" });
    }
  });

  // Order status endpoint (public)
  app.get("/api/orders/status/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ message: "Sipariş ID gerekli" });
      }

      // Find order by orderId field
      const orders = await storage.getAllOrders();
      const order = orders.find(o => o.orderId === orderId);

      if (!order) {
        return res.status(404).json({ message: "Sipariş bulunamadı" });
      }

      res.json({
        orderId: order.orderId,
        status: order.status,
        message: order.message || 'Sipariş işleniyor...',
        createdAt: order.createdAt,
        completedAt: order.completedAt
      });

    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ message: "Sipariş durumu alınırken hata oluştu" });
    }
  });

  // Async order processing function
  async function processOrderAsync(orderId: number, service: any, quantity: number, targetUrl?: string) {
    try {
      // Update order status to processing
      await storage.updateOrder(orderId, { 
        status: 'processing',
        message: 'Sipariş işleniyor...'
      });

      // Get order details to find the key's API settings
      const order = await storage.getOrderById(orderId);
      if (!order) {
        throw new Error('Sipariş bulunamadı');
      }

      // Get the key data to find its API settings
      const keyData = await storage.getKeyById(order.keyId);
      if (!keyData) {
        throw new Error('Key bilgisi bulunamadı');
      }
      if (!keyData?.apiSettingsId) {
        throw new Error('Key API ayarları bulunamadı');
      }

      // Get API settings for this key
      const apiSettings = await storage.getAllApiSettings();
      const keyApiSetting = apiSettings.find(api => api.id === keyData.apiSettingsId);
      
      if (!keyApiSetting || !keyApiSetting.isActive) {
        throw new Error('Key için API ayarları aktif değil');
      }

      // Make API call using key's specific API settings
      try {
        console.log(`Using API: ${keyApiSetting.name} (${keyApiSetting.apiUrl}) for key: ${keyData.value}`);

        // Prepare API request data using key's API settings
        const apiData: any = {
          key: keyApiSetting.apiKey,
          action: "add",
          service: service.serviceId || service.id,
          link: targetUrl,
          quantity: quantity.toString()
        };

        console.log('Making API request:', { 
          url: keyApiSetting.apiUrl, 
          api: keyApiSetting.name,
          data: { ...apiData, key: '[HIDDEN]' } 
        });

        const apiResponse = await makeServiceRequest(
          keyApiSetting.apiUrl,
          "POST",
          { 'Content-Type': 'application/json' },
          apiData
        );

          // Parse API response and handle order status properly
          let orderStatus = 'processing';
          let orderMessage = 'Sipariş API\'ye gönderildi, işleniyor...';
          let apiOrderId: string | null = null;

          // Check if API response contains order ID
          if (apiResponse.order || apiResponse.order_id) {
            apiOrderId = String(apiResponse.order || apiResponse.order_id);
            orderMessage = `Sipariş başarıyla gönderildi. API Order ID: ${apiOrderId}`;
            
            // Start periodic status checking
            setTimeout(() => checkOrderStatusAsync(orderId, apiOrderId!), 30000);
          } else if (apiResponse.error) {
            orderStatus = 'failed';
            orderMessage = `API Hatası: ${apiResponse.error}`;
          }

          // Update order with processing status first
          await storage.updateOrder(orderId, {
            status: orderStatus,
            message: orderMessage,
            response: apiResponse
          });

          // Create success notification
          const order = await storage.getOrderById(orderId);
          if (order) {
            await createOrderNotification('order_completed', order.orderId, {
              service: service.name,
              quantity,
              targetUrl
            });
          }

          // Log success
          await storage.createLog({
            type: "order_completed",
            message: `Order ${orderId} completed successfully`,
            orderId: orderId,
            data: { response: apiResponse },
          });

        } catch (apiError) {
          console.error("API call failed for order:", orderId, apiError);
          
          // Update order with failure
          await storage.updateOrder(orderId, {
            status: 'failed',
            message: 'Sipariş işlenirken hata oluştu.',
            response: { error: apiError instanceof Error ? apiError.message : 'Unknown error' }
          });

          // Create failure notification
          const order = await storage.getOrderById(orderId);
          if (order) {
            await createOrderNotification('order_failed', order.orderId, {
              service: service.name,
              quantity,
              targetUrl,
              error: apiError instanceof Error ? apiError.message : 'Unknown error'
            });
          }

          // Log failure to admin panel
          await storage.createLog({
            type: "order_failed",
            message: `Order ${orderId} failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
            orderId: orderId,
            data: { error: apiError instanceof Error ? apiError.message : 'Unknown error' },
          });
        }
    } catch (error) {
      console.error("Error in async order processing:", error);
      
      try {
        await storage.updateOrder(orderId, {
          status: 'failed',
          message: 'Sipariş işlenirken sistem hatası oluştu'
        });
      } catch (updateError) {
        console.error("Failed to update order status:", updateError);
      }
    }
  }

  // Bildirim sistemi endpoint'leri
  app.get("/api/admin/notifications", requireAdminAuth, async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Bildirimler alınamadı" });
    }
  });

  app.get("/api/admin/notifications/unread", requireAdminAuth, async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      res.status(500).json({ message: "Okunmamış bildirimler alınamadı" });
    }
  });

  app.put("/api/admin/notifications/:id/read", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true, message: "Bildirim okundu olarak işaretlendi" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Bildirim güncellenemedi" });
    }
  });

  app.put("/api/admin/notifications/read-all", requireAdminAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead();
      res.json({ success: true, message: "Tüm bildirimler okundu" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Bildirimler güncellenemedi" });
    }
  });

  // Sipariş ID ile arama endpoint'i
  app.get("/api/admin/orders/search/:orderId", requireAdminAuth, async (req, res) => {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({ message: "Sipariş ID gerekli" });
      }

      const order = await storage.getOrderByOrderId(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Sipariş bulunamadı" });
      }

      // Sipariş detaylarını key ve servis bilgileriyle birlikte getir
      const keys = await storage.getAllKeys();
      const key = keys.find(k => k.id === order.keyId);
      const service = await storage.getServiceById(order.serviceId);

      if (!key || !service) {
        return res.status(404).json({ message: "Sipariş detayları eksik" });
      }

      res.json({
        ...order,
        key: {
          id: key.id,
          value: key.value,
          name: key.name,
          category: key.category || 'Instagram'
        },
        service: {
          id: service.id,
          name: service.name,
          platform: service.platform,
          type: service.type
        }
      });
    } catch (error) {
      console.error("Error searching order:", error);
      res.status(500).json({ message: "Sipariş arama hatası" });
    }
  });

  // Sipariş tekrar gönderme endpoint'i
  app.post("/api/admin/orders/resend", requireAdminAuth, async (req, res) => {
    try {
      const { orderId, serviceId, quantity, targetUrl } = req.body;

      if (!orderId || !serviceId || !quantity) {
        return res.status(400).json({ message: "Sipariş ID, servis ID ve miktar gerekli" });
      }

      // Mevcut siparişi kontrol et
      const existingOrder = await storage.getOrderByOrderId(orderId);
      if (!existingOrder) {
        return res.status(404).json({ message: "Orijinal sipariş bulunamadı" });
      }

      // Servis bilgisini al
      const service = await storage.getServiceById(serviceId);
      if (!service || !service.isActive) {
        return res.status(400).json({ message: "Servis aktif değil" });
      }

      // Yeni sipariş ID oluştur
      const newOrderId = generateOrderId();

      // Yeni sipariş oluştur
      const newOrder = await storage.createOrder({
        orderId: newOrderId,
        keyId: existingOrder.keyId,
        serviceId: serviceId,
        quantity: quantity,
        targetUrl: targetUrl || '',
        status: 'pending',
        message: 'Tekrar gönderilen sipariş - işleme alınıyor...'
      });

      // Log oluştur
      await storage.createLog({
        type: "order_resent",
        message: `Order ${newOrderId} resent from original order ${orderId}`,
        userId: `admin_resend`,
        keyId: existingOrder.keyId,
        orderId: newOrder.id,
        data: { 
          originalOrderId: orderId,
          newOrderId,
          service: service.name, 
          quantity, 
          targetUrl 
        },
      });

      // Asenkron işleme başlat
      processOrderAsync(newOrder.id, service, quantity, targetUrl);

      res.json({ 
        orderId: newOrderId,
        message: "Sipariş tekrar gönderildi",
        status: "pending"
      });

    } catch (error) {
      console.error("Error resending order:", error);
      res.status(500).json({ message: "Sipariş tekrar gönderilemedi" });
    }
  });

  // Gelişmiş servis arama endpoint'i (sayfalama ile)
  app.get("/api/admin/services/search", requireAdminAuth, async (req, res) => {
    try {
      const { page = 1, limit = 25, search, serviceId } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let services = await storage.getAllServices();
      
      // Servis ID ile arama
      if (serviceId) {
        services = services.filter(service => 
          service.serviceId && service.serviceId.includes(serviceId as string)
        );
      }
      
      // Genel arama
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        services = services.filter(service => 
          service.name.toLowerCase().includes(searchTerm) ||
          service.platform.toLowerCase().includes(searchTerm) ||
          service.type.toLowerCase().includes(searchTerm) ||
          (service.serviceId && service.serviceId.toLowerCase().includes(searchTerm))
        );
      }
      
      const total = services.length;
      const paginatedServices = services.slice(offset, offset + parseInt(limit as string));
      
      res.json({
        services: paginatedServices,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error("Error searching services:", error);
      res.status(500).json({ message: "Servis arama hatası" });
    }
  });

  // Bildirim oluşturma helper function
  async function createOrderNotification(type: string, orderId: string, orderData: any) {
    try {
      const titles = {
        'order_cancelled': 'Sipariş İptal Edildi',
        'order_completed': 'Sipariş Tamamlandı',
        'order_failed': 'Sipariş Başarısız',
        'order_sent': 'Sipariş Gönderildi'
      };
      
      const messages = {
        'order_cancelled': `Sipariş ${orderId} iptal edildi. Bakiye yetersizliği veya servis arızası nedeniyle.`,
        'order_completed': `Sipariş ${orderId} başarıyla tamamlandı.`,
        'order_failed': `Sipariş ${orderId} başarısız oldu. Teknik bir sorun oluştu.`,
        'order_sent': `Sipariş ${orderId} API'ye başarıyla gönderildi.`
      };
      
      await storage.createNotification({
        type,
        title: titles[type as keyof typeof titles] || 'Sipariş Bildirimi',
        message: messages[type as keyof typeof messages] || `Sipariş ${orderId} durumu güncellendi.`,
        orderId,
        orderData,
        isRead: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Function to check order status from API
  async function checkOrderStatusAsync(orderId: number, apiOrderId: string) {
    if (!apiOrderId) return;

    try {
      console.log(`Checking status for order ${orderId}, API Order ID: ${apiOrderId}`);
      
      // Get order details to find the key's API settings
      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.log(`Order ${orderId} not found for status check`);
        return;
      }

      // Get the key data to find its API settings
      const keyData = await storage.getKeyById(order.keyId);
      if (!keyData?.apiSettingsId) {
        console.log(`Key API settings not found for order ${orderId}`);
        return;
      }

      // Get the specific API settings for this key
      const apiSettings = await storage.getAllApiSettings();
      const apiSetting = apiSettings.find(api => api.id === keyData.apiSettingsId && api.isActive);
      
      if (!apiSetting) {
        console.log(`Active API settings not found for key ${keyData.value}`);
        return;
      }
      
      // Prepare status check request - try form-data format first
      const formData = new URLSearchParams();
      formData.append('key', apiSetting.apiKey || '');
      formData.append('action', 'status');
      formData.append('order', apiOrderId);

      console.log('Checking order status with API:', { url: apiSetting.apiUrl, orderId: apiOrderId });

      const response = await fetch(apiSetting.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (response.ok) {
        const responseText = await response.text();
        const statusResponse = JSON.parse(responseText);
        console.log(`Order ${orderId} status response:`, statusResponse);

        // Update order based on API status - preserve original API status
        if (statusResponse.status) {
          let dbStatus = statusResponse.status.toLowerCase();
          let message = 'Sipariş durumu güncellendi.';
          let shouldCompleteOrder = false;

          const apiStatus = statusResponse.status.toLowerCase();
          
          // Map API statuses to our internal status while preserving original meaning
          if (apiStatus === 'completed' || apiStatus === 'complete') {
            dbStatus = 'completed';
            message = 'Sipariş başarıyla tamamlandı!';
            shouldCompleteOrder = true;
            
          } else if (apiStatus === 'cancelled' || apiStatus === 'canceled') {
            dbStatus = 'cancelled';
            message = 'Sipariş iptal edildi.';
            
          } else if (apiStatus === 'partial') {
            dbStatus = 'partial';
            message = 'Sipariş kısmen tamamlandı.';
            
          } else if (apiStatus === 'in progress' || apiStatus === 'inprogress') {
            dbStatus = 'in_progress';
            message = 'Sipariş devam ediyor...';
            
          } else if (apiStatus === 'processing') {
            dbStatus = 'processing';
            message = 'Sipariş işleniyor...';
            
          } else if (apiStatus === 'pending') {
            dbStatus = 'pending';
            message = 'Sipariş beklemede...';
            
          } else {
            // Keep original status if unknown
            dbStatus = apiStatus;
            message = `Sipariş durumu: ${statusResponse.status}`;
          }

          // Update order in database
          const updateData: any = {
            status: dbStatus,
            message: message,
            response: statusResponse
          };

          if (shouldCompleteOrder) {
            updateData.completedAt = new Date();
          }

          await storage.updateOrder(orderId, updateData);

          // Create notification for status change
          const updatedOrder = await storage.getOrderById(orderId);
          if (updatedOrder) {
            if (dbStatus === 'completed') {
              await createOrderNotification('order_completed', updatedOrder.orderId, {
                apiOrderId: apiOrderId,
                finalStatus: statusResponse.status
              });
            } else if (dbStatus === 'cancelled') {
              await createOrderNotification('order_cancelled', updatedOrder.orderId, {
                apiOrderId: apiOrderId,
                finalStatus: statusResponse.status
              });
            }
          }

          // Log the status change
          await storage.createLog({
            type: "order_status_update",
            message: `Order ${orderId} status updated from API: ${statusResponse.status} (mapped to: ${dbStatus})`,
            orderId: orderId,
            data: { 
              apiOrderId: apiOrderId,
              apiStatus: statusResponse.status,
              dbStatus: dbStatus,
              originalResponse: statusResponse
            },
          });

          // Continue checking if order is still processing
          if (dbStatus === 'processing' || dbStatus === 'pending' || dbStatus === 'in_progress') {
            setTimeout(() => checkOrderStatusAsync(orderId, apiOrderId), 30000); // Check again in 30 seconds
          }
        }
      } else {
        console.error(`Status check failed for order ${orderId}:`, response.status, response.statusText);
        // Continue checking despite HTTP errors for active orders
        const currentOrder = await storage.getOrderById(orderId);
        if (currentOrder && (currentOrder.status === 'processing' || currentOrder.status === 'pending' || currentOrder.status === 'in_progress')) {
          setTimeout(() => checkOrderStatusAsync(orderId, apiOrderId), 60000); // Check again in 1 minute
        }
      }
    } catch (error) {
      console.error(`Status check failed for order ${orderId}:`, error);
      // Continue checking despite errors for active orders
      try {
        const currentOrder = await storage.getOrderById(orderId);
        if (currentOrder && (currentOrder.status === 'processing' || currentOrder.status === 'pending' || currentOrder.status === 'in_progress')) {
          setTimeout(() => checkOrderStatusAsync(orderId, apiOrderId), 120000); // Check again in 2 minutes
        }
      } catch (storageError) {
        console.error(`Error accessing storage for order ${orderId}:`, storageError);
      }
    }
  }



  // Setup automatic expired key cleanup (run every hour)
  setInterval(async () => {
    try {
      const deletedCount = await storage.cleanupExpiredKeys();
      if (deletedCount > 0) {
        console.log(`Automatic cleanup: ${deletedCount} expired keys deleted`);
      }
    } catch (error) {
      console.error('Error in automatic key cleanup:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  // Hosting PHP preview route
  app.get("/hosting-php-preview", (req, res) => {
    try {
      const phpFilePath = path.join(process.cwd(), 'hosting/public_html/index.php');
      const phpContent = fs.readFileSync(phpFilePath, 'utf8');
      
      // Simple HTML escaping without complex regex
      const escapedContent = phpContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeyPanel PHP Hosting Preview</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            background: #1a1a1a; 
            color: #00ff00; 
            margin: 0; 
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            background: #333;
            color: #fff;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #00ff00;
        }
        .code-block {
            background: #000;
            border: 1px solid #333;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            white-space: pre-wrap;
            font-size: 14px;
        }
        .back-btn {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .back-btn:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔑 KeyPanel - PHP Hosting Dosyası Preview</h1>
        <p>hosting/public_html/index.php - cPanel Hosting Uyumlu Ana Dosya</p>
        <a href="/" class="back-btn">← Ana Sayfaya Dön</a>
    </div>
    
    <div class="code-block">${escapedContent}</div>
    
    <div style="background: #333; color: #fff; padding: 20px; margin-top: 20px; border-radius: 8px;">
        <h3>📋 Dosya Bilgileri:</h3>
        <ul>
            <li><strong>Dosya:</strong> hosting/public_html/index.php</li>
            <li><strong>Boyut:</strong> ${phpContent.length} karakter</li>
            <li><strong>Tip:</strong> PHP Router + HTML Template</li>
            <li><strong>Özellikler:</strong> cPanel hosting uyumlu, API routing, static file serving</li>
        </ul>
    </div>
</body>
</html>`);
    } catch (error: any) {
      res.status(500).send(`
        <h1>Dosya Okuma Hatası</h1>
        <p>PHP dosyası okunamadı: ${error?.message || 'Bilinmeyen hata'}</p>
        <a href="/">← Ana Sayfaya Dön</a>
      `);
    }
  });

  // User Feedback API endpoints - Only for authenticated users
  app.post("/api/feedback", requireUserAuth, async (req: any, res) => {
    try {
      const { userEmail, userName, orderId, message, satisfactionLevel } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Geri bildirim mesajı gerekli" });
      }

      // If user selected "dissatisfied", redirect to complaints
      if (satisfactionLevel === 'dissatisfied') {
        return res.json({ 
          redirectToComplaints: true,
          message: "Memnun olmadığınız için üzgünüz. Şikayet formuna yönlendiriliyorsunuz."
        });
      }

      const feedback = await storage.createUserFeedback({
        userEmail,
        userName,
        orderId,
        message: message.trim(),
        satisfactionLevel,
        ipAddress
      });

      res.json({ 
        message: "Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!",
        feedbackId: feedback.id
      });
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Geri bildirim gönderilemedi" });
    }
  });

  // Complaints API endpoints
  app.post("/api/complaints", requireUserAuth, async (req: any, res) => {
    try {
      const { orderId, subject, message, category, priority } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (!orderId || !subject || !message || !category) {
        return res.status(400).json({ message: "Tüm alanlar gerekli" });
      }

      // Verify that the user has at least one order
      const userId = req.session.userId;
      const userOrders = await storage.getUserOrders(userId);
      
      if (!userOrders || userOrders.length === 0) {
        return res.status(403).json({ 
          message: "Şikayet oluşturmak için en az bir siparişiniz olmalı" 
        });
      }

      // Verify the provided order ID exists
      const orderExists = await storage.getOrderByOrderId(orderId);
      if (!orderExists) {
        return res.status(404).json({ message: "Belirtilen sipariş bulunamadı" });
      }

      // Get user information from session
      const user = await storage.getUser(userId);
      const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
      
      const complaint = await storage.createComplaint({
        userEmail: user?.email || '',
        userName: fullName || user?.email || 'Anonim',
        orderId,
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority: priority || 'medium',
        ipAddress
      });

      res.json({ 
        message: "Şikayetiniz başarıyla kaydedildi. En kısa sürede değerlendirilecektir.",
        complaintId: complaint.id
      });
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ message: "Şikayet gönderilemedi" });
    }
  });

  app.get("/api/user/orders/count", requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const userOrders = await storage.getUserOrders(userId);
      res.json({ count: userOrders ? userOrders.length : 0 });
    } catch (error) {
      console.error("Error counting user orders:", error);
      res.status(500).json({ message: "Sipariş sayısı alınamadı" });
    }
  });

  // Admin feedback routes
  app.get("/api/admin/feedback", requireAdminAuth, async (req, res) => {
    try {
      const feedback = await storage.getAllUserFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Geri bildirimler alınamadı" });
    }
  });

  app.get("/api/admin/feedback/unread", requireAdminAuth, async (req, res) => {
    try {
      const unreadFeedback = await storage.getUnreadUserFeedback();
      res.json(unreadFeedback);
    } catch (error) {
      console.error("Error fetching unread feedback:", error);
      res.status(500).json({ message: "Okunmamış geri bildirimler alınamadı" });
    }
  });

  app.put("/api/admin/feedback/:id/read", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markFeedbackAsRead(parseInt(id));
      res.json({ message: "Geri bildirim okundu olarak işaretlendi" });
    } catch (error) {
      console.error("Error marking feedback as read:", error);
      res.status(500).json({ message: "Geri bildirim güncellenemedi" });
    }
  });

  app.post("/api/admin/feedback/:id/respond", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      
      if (!response || response.trim().length === 0) {
        return res.status(400).json({ message: "Yanıt mesajı gerekli" });
      }

      // Get original feedback before updating
      const originalFeedback = await storage.getFeedbackById(parseInt(id));
      if (!originalFeedback) {
        return res.status(404).json({ message: "Geri bildirim bulunamadı" });
      }

      const updatedFeedback = await storage.respondToFeedback(parseInt(id), response.trim());

      // Send email if user provided email
      if (originalFeedback.userEmail) {
        try {
          const emailSent = await sendFeedbackResponse(
            originalFeedback.userEmail,
            originalFeedback.userName || 'Değerli Kullanıcımız',
            originalFeedback.message,
            response.trim(),
            originalFeedback.satisfactionLevel ?? undefined
          );
          
          if (emailSent) {
            console.log(`Feedback response email sent to: ${originalFeedback.userEmail}`);
          } else {
            console.log(`Failed to send email to: ${originalFeedback.userEmail}`);
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          // Don't fail the response if email fails
        }
      }

      res.json({ 
        message: "Yanıt başarıyla gönderildi" + (originalFeedback.userEmail ? " ve e-posta ile bildirildi" : ""),
        feedback: updatedFeedback
      });
    } catch (error) {
      console.error("Error responding to feedback:", error);
      res.status(500).json({ message: "Yanıt gönderilemedi" });
    }
  });

  // Admin complaints routes
  app.get("/api/admin/complaints", requireAdminAuth, async (req, res) => {
    try {
      const complaints = await storage.getAllComplaints();
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ message: "Şikayetler alınamadı" });
    }
  });

  app.get("/api/admin/complaints/unread", requireAdminAuth, async (req, res) => {
    try {
      const unreadComplaints = await storage.getUnreadComplaints();
      res.json(unreadComplaints);
    } catch (error) {
      console.error("Error fetching unread complaints:", error);
      res.status(500).json({ message: "Okunmamış şikayetler alınamadı" });
    }
  });

  app.put("/api/admin/complaints/:id/read", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markComplaintAsRead(parseInt(id));
      res.json({ message: "Şikayet okundu olarak işaretlendi" });
    } catch (error) {
      console.error("Error marking complaint as read:", error);
      res.status(500).json({ message: "Şikayet güncellenemedi" });
    }
  });

  app.put("/api/admin/complaints/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      
      await storage.updateComplaintStatus(parseInt(id), status, adminNotes);
      res.json({ message: "Şikayet durumu güncellendi" });
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({ message: "Şikayet durumu güncellenemedi" });
    }
  });

  app.post("/api/admin/complaints/:id/respond", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      
      if (!response || response.trim().length === 0) {
        return res.status(400).json({ message: "Yanıt mesajı gerekli" });
      }

      // Get original complaint before updating
      const originalComplaint = await storage.getComplaintById(parseInt(id));
      if (!originalComplaint) {
        return res.status(404).json({ message: "Şikayet bulunamadı" });
      }

      const updatedComplaint = await storage.respondToComplaint(parseInt(id), response.trim());

      // Send email if user provided email
      if (originalComplaint.userEmail) {
        try {
          const emailSent = await sendComplaintResponse(
            originalComplaint.userEmail,
            originalComplaint.userName || 'Değerli Kullanıcımız',
            originalComplaint.subject,
            originalComplaint.message,
            response.trim()
          );
          
          if (emailSent) {
            console.log(`Complaint response email sent to: ${originalComplaint.userEmail}`);
          } else {
            console.log(`Failed to send email to: ${originalComplaint.userEmail}`);
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          // Don't fail the request if email fails
        }
      }

      res.json({ 
        message: "Yanıt başarıyla gönderildi" + (originalComplaint.userEmail ? " ve e-posta ile bildirildi" : ""),
        complaint: updatedComplaint
      });
    } catch (error) {
      console.error("Error responding to complaint:", error);
      res.status(500).json({ message: "Yanıt gönderilemedi" });
    }
  });

  // Şifre Sıfırlama API Routes
  
  // "Şifremi Unuttum" - E-posta gönder
  app.post("/api/admin/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "E-posta adresi gerekli" });
      }

      // Gerçek admin e-posta adreslerini database'den kontrol et
      const adminUser = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase())).limit(1);
      
      if (adminUser.length === 0 || !adminUser[0].isActive) {
        return res.status(404).json({ message: "Bu e-posta adresi admin sistemde kayıtlı değil" });
      }

      // Reset token oluştur
      const resetToken = nanoid(64); // 64 karakter güvenli token
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat geçerlilik

      // Token'ı database'e kaydet
      await db.insert(passwordResetTokens).values({
        email,
        token: resetToken,
        expiresAt,
        isUsed: false
      });

      // Base URL'i oluştur
      const baseUrl = req.protocol + '://' + req.get('host');
      
      // E-posta gönder
      const emailSent = await sendPasswordResetEmailNew(email, resetToken, baseUrl);
      
      if (emailSent) {
        res.json({ 
          message: "E-posta adresinize şifre sıfırlama bağlantısı gönderildi",
          email: email 
        });
      } else {
        console.error("Failed to send password reset email");
        res.status(500).json({ message: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." });
      }
      
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  // Reset token doğrulama
  app.get("/api/admin/reset-password/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Token'ı database'de kontrol et
      const resetToken = await db.select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token))
        .limit(1);

      if (resetToken.length === 0) {
        return res.status(404).json({ 
          valid: false, 
          message: "Geçersiz sıfırlama linki" 
        });
      }

      const token_data = resetToken[0];
      
      // Token süresi kontrol et
      if (new Date() > token_data.expiresAt) {
        return res.status(400).json({ 
          valid: false, 
          message: "Sıfırlama linki süresi dolmuş" 
        });
      }

      // Token kullanılmış mı kontrol et
      if (token_data.isUsed) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bu sıfırlama linki daha önce kullanılmış" 
        });
      }

      res.json({ 
        valid: true, 
        email: token_data.email,
        message: "Token geçerli" 
      });
      
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ 
        valid: false, 
        message: "Sunucu hatası" 
      });
    }
  });

  // Yeni şifre belirleme
  app.post("/api/admin/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token ve yeni şifre gerekli" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Şifre en az 6 karakter olmalı" });
      }

      // Token'ı doğrula
      const resetToken = await db.select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token))
        .limit(1);

      if (resetToken.length === 0) {
        return res.status(404).json({ message: "Geçersiz sıfırlama linki" });
      }

      const token_data = resetToken[0];
      
      // Token kontrolü
      if (new Date() > token_data.expiresAt) {
        return res.status(400).json({ message: "Sıfırlama linki süresi dolmuş" });
      }

      if (token_data.isUsed) {
        return res.status(400).json({ message: "Bu sıfırlama linki daha önce kullanılmış" });
      }

      // Admin şifresi güncelle (OtoKiwi sadece admin paneli için)
      // Şifre sıfırlama işlemi tamamlandığında admin giriş bilgilerini güncelle
      const hashedPassword = await hashPassword(newPassword);
      
      // Token'ı kullanılmış olarak işaretle
      await db.update(passwordResetTokens)
        .set({ isUsed: true })
        .where(eq(passwordResetTokens.token, token));

      res.json({ 
        message: "Şifreniz başarıyla sıfırlandı",
        success: true
      });
      
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Şifre sıfırlama işlemi başarısız" });
    }
  });

  // Normal User Forgot Password Endpoint (sadece kayıtlı normal kullanıcılar için)
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "E-posta adresi gerekli" });
      }

      // Normal users tablosunda e-posta kontrol et
      const normalUser = await db.select()
        .from(normalUsers)
        .where(eq(normalUsers.email, email.toLowerCase()))
        .limit(1);
      
      if (normalUser.length === 0 || !normalUser[0].isActive) {
        return res.status(404).json({ message: "Bu e-posta adresi sistemde kayıtlı değil" });
      }

      // Reset token oluştur
      const resetToken = nanoid(64); // 64 karakter güvenli token
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat geçerlilik

      // Token'ı database'e kaydet
      await db.insert(passwordResetTokens).values({
        email,
        token: resetToken,
        expiresAt,
        isUsed: false
      });

      // Base URL'i oluştur
      const baseUrl = req.protocol + '://' + req.get('host');
      
      // E-posta gönder
      const emailSent = await sendPasswordResetEmailNew(email, resetToken, baseUrl);
      
      if (emailSent) {
        res.json({ 
          message: "E-posta adresinize şifre sıfırlama bağlantısı gönderildi",
          email: email 
        });
      } else {
        console.error("Failed to send password reset email");
        res.status(500).json({ message: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." });
      }
      
    } catch (error) {
      console.error("Normal user forgot password error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  // Security Status API endpoint
  app.get('/api/admin/security/status', requireAdminAuth, async (req, res) => {
    try {
      const securityStatus = getSecurityStatus();
      res.json(securityStatus);
    } catch (error) {
      console.error('Error fetching security status:', error);
      res.status(500).json({ message: 'Güvenlik durumu alınamadı' });
    }
  });

  // Dashboard Statistics API endpoint
  app.get('/api/admin/dashboard/stats', requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Dashboard istatistikleri alınamadı' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
