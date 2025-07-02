import bcrypt from 'bcryptjs';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';
import { adminLoginSchema, type AdminLogin } from '@shared/schema';

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
    const securityQuestions = [
      { id: 1, question: "Kiwi'nin Doğum Tarihi?", answer: "29/05/2020" },
      { id: 2, question: "Anne Adın?", answer: "halime" },
      { id: 3, question: "Anne Kızlık Soyadı?", answer: "bahat" },
      { id: 4, question: "Anne Doğum Tarihi?", answer: "17/12/1978" },
      { id: 5, question: "Baba Adı?", answer: "muhammed" },
      { id: 6, question: "Baba Soyadı?", answer: "yazar" }
    ];
    
    const randomQuestion = securityQuestions[Math.floor(Math.random() * securityQuestions.length)];
    res.json({ 
      question: randomQuestion.question,
      questionId: randomQuestion.id 
    });
  });

  // Admin login
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password, securityAnswer }: AdminLogin = adminLoginSchema.parse(req.body);
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
      const currentAdminPassword = "m;rf_oj78cMGbO+0)Ai8e@JAAq=C2Wl)6xoQ_K42mQivX1DjvJ";
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

      // Güvenlik sorusu kontrolü - Rastgele seçilen soru cevabını kontrol et
      const securityQuestions = {
        "29/05/2020": "Kiwi'nin Doğum Tarihi?",
        "halime": "Anne Adın?",
        "bahat": "Anne Kızlık Soyadı?", 
        "17/12/1978": "Anne Doğum Tarihi?",
        "muhammed": "Baba Adı?",
        "yazar": "Baba Soyadı?"
      };
      
      const normalizedAnswer = securityAnswer.toLowerCase().trim();
      const validAnswers = Object.keys(securityQuestions);
      
      if (!validAnswers.includes(normalizedAnswer)) {
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

  // Master password verification - simple approach
  app.post('/api/admin/verify-master-password', async (req, res) => {
    try {
      const { password } = req.body;
      
      // Hard-coded master password 
      const correctMasterPassword = 'm;rf_oj78cMGbO+0)Ai8e@JAAq=C2Wl)6xoQ_K42mQivX1DjvJ)';
      
      if (password !== correctMasterPassword) {
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