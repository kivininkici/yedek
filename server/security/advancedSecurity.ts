import type { Request, Response, NextFunction } from 'express';

// Advanced security middleware for admin routes
export const advancedSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious headers that might indicate automation
  const suspiciousHeaders = [
    'x-requested-with',
    'selenium',
    'phantomjs',
    'chromedriver',
    'webdriver',
    'bot',
    'crawler',
    'spider'
  ];

  const userAgent = req.get('User-Agent')?.toLowerCase() || '';
  const headers = Object.keys(req.headers).map(h => h.toLowerCase());

  // Block known automation tools
  const automationSignatures = [
    'selenium',
    'phantomjs',
    'chromedriver',
    'webdriver',
    'headless',
    'bot',
    'crawler',
    'spider',
    'automation',
    'python-requests',
    'curl',
    'wget',
    'postman'
  ];

  const isAutomation = automationSignatures.some(sig => 
    userAgent.includes(sig) || headers.some(h => h.includes(sig))
  );

  if (isAutomation) {
    console.log('🚫 Automation tool detected:', userAgent);
    return res.status(403).json({ 
      message: 'Otomatik araçlar ve botlar engellendi',
      code: 'AUTOMATION_BLOCKED'
    });
  }

  // Rate limiting per IP for admin routes
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // Max 20 requests per minute per IP

  if (!global.adminRateLimit) {
    global.adminRateLimit = new Map();
  }

  const ipData = global.adminRateLimit.get(ipAddress) || { count: 0, resetTime: now + windowMs };
  
  if (now > ipData.resetTime) {
    ipData.count = 1;
    ipData.resetTime = now + windowMs;
  } else {
    ipData.count++;
  }

  global.adminRateLimit.set(ipAddress, ipData);

  if (ipData.count > maxRequests) {
    console.log('🚫 Rate limit exceeded for IP:', ipAddress);
    return res.status(429).json({ 
      message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  // Block requests with suspicious patterns
  const suspiciousPatterns = [
    /admin.*console/i,
    /eval\(/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /document\.cookie/i,
    /window\./i,
    /\.innerHTML/i
  ];

  const requestString = JSON.stringify(req.body) + req.url + (req.get('Referer') || '');
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (hasSuspiciousPattern) {
    console.log('🚫 Suspicious pattern detected:', requestString);
    return res.status(403).json({ 
      message: 'Güvenlik ihlali tespit edildi',
      code: 'SUSPICIOUS_PATTERN'
    });
  }

  // Log admin route access
  console.log('🔐 Admin route access:', req.method, req.path, 'from IP:', ipAddress);
  
  next();
};

// Global rate limit storage
declare global {
  var adminRateLimit: Map<string, { count: number; resetTime: number }>;
}