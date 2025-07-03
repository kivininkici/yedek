import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';
import { adminLoginSchema, type AdminLogin } from '@shared/schema';
import { sendPasswordResetEmail } from './emailService';
import { 
  getCurrentMasterPassword, 
  updateMasterPassword, 
  getRandomSecurityQuestion, 
  validateSecurityAnswer,
  ADMIN_CREDENTIALS 
} from './config/security';

// Admin session middleware
export const requireAdminAuth: RequestHandler = (req, res, next) => {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: 'Admin girişi gerekli' });
  }
  next();
};

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Admin auth routes
export function setupAdminAuth(app: Express) {
  // Get random security question
  app.get('/api/admin/security-question', (req, res) => {
    const randomQuestion = getRandomSecurityQuestion();
    res.json({ 
      question: randomQuestion.question
    });
  });

  // Admin login
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password, securityQuestion, securityAnswer }: AdminLogin = adminLoginSchema.parse(req.body);
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || '';
      
      // Check for recent failed attempts (3 attempts in 15 minutes)
      const recentFailedAttempts = await storage.getRecentFailedAttempts(ipAddress, 15);
      if (recentFailedAttempts >= 3) {
        // Log blocked attempt
        await storage.createLoginAttempt({
          ipAddress,
          username,
          attemptType: 'blocked',
          userAgent,
        });
        return res.status(429).json({ 
          message: 'Çok fazla hatalı giriş denemesi. 15 dakika sonra tekrar deneyin.' 
        });
      }
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        // Log failed attempt
        await storage.createLoginAttempt({
          ipAddress,
          username,
          attemptType: 'failed_password',
          userAgent,
        });
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }

      if (!admin.isActive) {
        return res.status(403).json({ message: 'Hesabınız askıya alınmıştır. Lütfen sistem yöneticisiyle iletişime geçin.' });
      }

      // Check if password matches the admin password (either original or changed)
      const currentAdminPassword = ADMIN_CREDENTIALS.password;
      let isValidPassword = false;
      
      // First try direct password comparison (for the fixed password)
      if (password === currentAdminPassword) {
        isValidPassword = true;
      } else {
        // If not the fixed password, try bcrypt comparison (for changed passwords)
        isValidPassword = await comparePassword(password, admin.password);
      }
      
      if (!isValidPassword) {
        // Log failed password attempt
        await storage.createLoginAttempt({
          ipAddress,
          username,
          attemptType: 'failed_password',
          userAgent,
        });
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }

      // Güvenlik sorusu kontrolü - config'den validasyon yap
      if (!validateSecurityAnswer(securityQuestion, securityAnswer)) {
        // Log failed security question attempt
        await storage.createLoginAttempt({
          ipAddress,
          username,
          attemptType: 'failed_security',
          userAgent,
        });
        return res.status(401).json({ message: 'Güvenlik sorusu cevabı hatalı' });
      }

      // Log successful login
      await storage.createLoginAttempt({
        ipAddress,
        username,
        attemptType: 'success',
        userAgent,
      });

      // Update last login
      await storage.updateAdminLastLogin(admin.id);

      // Set session
      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;

      res.json({ 
        message: 'Giriş başarılı',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(400).json({ message: 'Giriş başarısız' });
    }
  });

  // Admin logout
  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Çıkış yapılamadı' });
      }
      res.json({ message: 'Çıkış başarılı' });
    });
  });

  // Check admin session
  app.get('/api/admin/me', requireAdminAuth, async (req, res) => {
    try {
      const admin = await storage.getAdminByUsername(req.session.adminUsername!);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: 'Admin bulunamadı' });
      }

      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email
      });
    } catch (error) {
      res.status(500).json({ message: 'Admin bilgileri alınamadı' });
    }
  });

  // Get all login attempts
  app.get('/api/admin/login-attempts', requireAdminAuth, async (req, res) => {
    try {
      const loginAttempts = await storage.getAllLoginAttempts();
      res.json(loginAttempts);
    } catch (error) {
      console.error('Error fetching login attempts:', error);
      res.status(500).json({ message: 'Giriş denemeleri alınamadı' });
    }
  });

  // Master password verification - accepts both password and masterPassword fields
  app.post('/api/admin/verify-master-password', async (req, res) => {
    try {
      const { password, masterPassword } = req.body;
      const inputPassword = password || masterPassword;
      
      if (!inputPassword) {
        return res.status(400).json({ message: 'Master şifre gerekli' });
      }
      
      // Get current master password from security config
      const correctMasterPassword = getCurrentMasterPassword();
      
      if (inputPassword !== correctMasterPassword) {
        return res.status(401).json({ message: 'Hatalı master şifre' });
      }

      res.json({ message: 'Master şifre doğrulandı' });
    } catch (error) {
      console.error('Master password verification error:', error);
      res.status(500).json({ message: 'Master şifre doğrulanamadı' });
    }
  });

  // Create first admin (only if no admin exists)
  app.post('/api/admin/setup', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if any admin exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin zaten mevcut' });
      }

      const hashedPassword = await hashPassword(password);
      const newAdmin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        email,
        isActive: true
      });

      res.json({ 
        message: 'İlk admin oluşturuldu',
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email
        }
      });
    } catch (error) {
      console.error('Admin setup error:', error);
      res.status(500).json({ message: 'Admin oluşturulamadı' });
    }
  });

  // Direct admin creation with master password verification
  app.post('/api/admin/create-direct', async (req, res) => {
    try {
      const { username, password, email, masterPassword } = req.body;
      
      // Verify master password first
      const correctMasterPassword = getCurrentMasterPassword();
      if (masterPassword !== correctMasterPassword) {
        return res.status(401).json({ message: 'Hatalı master şifre' });
      }
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(409).json({ message: 'Admin kullanıcısı zaten mevcut' });
      }

      const hashedPassword = await hashPassword(password);
      const newAdmin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        email,
        isActive: true
      });

      res.status(201).json({ 
        message: 'Admin başarıyla oluşturuldu',
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email
        }
      });
    } catch (error) {
      console.error('Direct admin creation error:', error);
      res.status(500).json({ message: 'Admin oluşturulamadı' });
    }
  });

  // Password reset request endpoint
  app.post('/api/admin/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'E-posta adresi gerekli' });
      }

      // Check if admin with this email exists
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        // Don't reveal if email exists or not for security
        return res.json({ message: 'E-posta adresinize şifre sıfırlama bağlantısı gönderildi (eğer hesap mevcutsa)' });
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save reset token to database
      await storage.createPasswordResetToken(email, resetToken, expiresAt);

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/admin/reset-password?token=${resetToken}`;

      // Send email
      const emailSent = await sendPasswordResetEmail(email, admin.username, resetUrl);

      if (!emailSent) {
        console.error('Failed to send password reset email');
        return res.status(500).json({ message: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' });
      }

      res.json({ message: 'E-posta adresinize şifre sıfırlama bağlantısı gönderildi' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Şifre sıfırlama talebi işlenemedi' });
    }
  });

  // Password reset verification endpoint
  app.get('/api/admin/reset-password/verify/:token', async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ message: 'Geçersiz token' });
      }

      // Get token from database
      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(404).json({ message: 'Geçersiz veya süresi dolmuş token' });
      }

      if (resetToken.isUsed) {
        return res.status(400).json({ message: 'Bu token zaten kullanılmış' });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: 'Token süresi dolmuş' });
      }

      res.json({ 
        message: 'Token geçerli',
        email: resetToken.email 
      });
    } catch (error) {
      console.error('Password reset verification error:', error);
      res.status(500).json({ message: 'Token doğrulanamadı' });
    }
  });

  // Password reset completion endpoint
  app.post('/api/admin/reset-password', async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Tüm alanlar gerekli' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Şifreler eşleşmiyor' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı' });
      }

      // Get and validate token
      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(404).json({ message: 'Geçersiz token' });
      }

      if (resetToken.isUsed) {
        return res.status(400).json({ message: 'Bu token zaten kullanılmış' });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: 'Token süresi dolmuş' });
      }

      // Get admin user
      const admin = await storage.getAdminByEmail(resetToken.email);
      if (!admin) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateAdminPassword(admin.username, hashedPassword);

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(token);

      res.json({ message: 'Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.' });
    } catch (error) {
      console.error('Password reset completion error:', error);
      res.status(500).json({ message: 'Şifre güncellenemedi' });
    }
  });
}

// Type declarations for session
declare module 'express-session' {
  interface SessionData {
    adminId?: number;
    adminUsername?: string;
    userId?: number;
    username?: string;
    isAdmin?: boolean;
  }
}