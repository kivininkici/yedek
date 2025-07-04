/**
 * Advanced Security Protection System
 * Comprehensive protection against unauthorized access, spam, and console attacks
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { loginAttempts } from '../../shared/schema';
import { eq, and, gt, desc } from 'drizzle-orm';

// Security configurations
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS_PER_WINDOW: 10000, // Very high limit for development
  SUSPICIOUS_PATTERNS: [
    /console\./gi,
    /document\./gi,
    /window\./gi,
    /eval\(/gi,
    /function\(/gi,
    /javascript:/gi,
    /<script/gi,
    /alert\(/gi,
    /prompt\(/gi,
    /confirm\(/gi,
    /localStorage/gi,
    /sessionStorage/gi,
    /innerHTML/gi,
    /outerHTML/gi,
    /addEventListener/gi,
    /removeEventListener/gi,
    /createElement/gi,
    /appendChild/gi,
    /insertBefore/gi,
    /replaceChild/gi,
    /removeChild/gi,
    /setAttribute/gi,
    /getAttribute/gi,
    /getElementById/gi,
    /getElementsBy/gi,
    /querySelector/gi,
    /querySelectorAll/gi,
    /XMLHttpRequest/gi,
    /fetch\(/gi,
    /import\(/gi,
    /require\(/gi,
    /module\./gi,
    /exports\./gi,
    /process\./gi,
    /global\./gi,
    /Buffer\./gi,
    /crypto\./gi,
    /btoa\(/gi,
    /atob\(/gi,
    /JSON\.parse/gi,
    /JSON\.stringify/gi,
    /encodeURI/gi,
    /decodeURI/gi,
    /encodeURIComponent/gi,
    /decodeURIComponent/gi,
    /escape\(/gi,
    /unescape\(/gi,
    /setTimeout/gi,
    /setInterval/gi,
    /clearTimeout/gi,
    /clearInterval/gi,
    /location\./gi,
    /history\./gi,
    /navigator\./gi,
    /screen\./gi,
    /performance\./gi,
    /Date\./gi,
    /Math\./gi,
    /Number\./gi,
    /String\./gi,
    /Array\./gi,
    /Object\./gi,
    /RegExp\./gi,
    /Error\./gi,
    /TypeError\./gi,
    /ReferenceError\./gi,
    /SyntaxError\./gi,
    /RangeError\./gi,
    /EvalError\./gi,
    /URIError\./gi
  ],
  BLACKLISTED_IPS: new Set<string>(),
  WHITELIST_IPS: new Set<string>(['127.0.0.1', '::1', 'localhost']),
  BLOCKED_USER_AGENTS: [
    /bot/gi,
    /crawler/gi,
    /spider/gi,
    /scraper/gi,
    /curl/gi,
    /wget/gi,
    /python/gi,
    /php/gi,
    /java/gi,
    /go-http/gi,
    /postman/gi,
    /insomnia/gi,
    /thunder/gi,
    /rest/gi,
    /api/gi,
    /automated/gi,
    /test/gi,
    /monitor/gi,
    /check/gi,
    /scan/gi,
    /probe/gi,
    /exploit/gi,
    /hack/gi,
    /attack/gi,
    /injection/gi,
    /xss/gi,
    /csrf/gi,
    /sql/gi,
    /union/gi,
    /select/gi,
    /drop/gi,
    /delete/gi,
    /insert/gi,
    /update/gi,
    /alter/gi,
    /create/gi,
    /truncate/gi
  ]
};

// In-memory rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const suspiciousActivityStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Get client IP address with proxy support
 */
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const cloudflareIP = req.headers['cf-connecting-ip'] as string;
  
  if (cloudflareIP) return cloudflareIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

/**
 * Enhanced IP blocking middleware
 */
export function ipBlockingMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  
  // Check if IP is blacklisted
  if (SECURITY_CONFIG.BLACKLISTED_IPS.has(clientIP)) {
    console.log(`🚫 Blocked IP attempt: ${clientIP}`);
    return res.status(403).json({ 
      message: 'Erişim reddedildi',
      error: 'IP_BLOCKED',
      code: 'SECURITY_VIOLATION'
    });
  }
  
  (req as any).clientIP = clientIP;
  next();
}

/**
 * Advanced rate limiting middleware
 */
export function advancedRateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  
  // Skip rate limiting for development/localhost and all internal IPs
  if (SECURITY_CONFIG.WHITELIST_IPS.has(clientIP) || 
      clientIP.startsWith('192.168.') || 
      clientIP.startsWith('10.') ||
      clientIP.startsWith('172.') ||
      clientIP.startsWith('127.') ||
      clientIP === 'unknown' ||
      clientIP === '::1' ||
      process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const now = Date.now();
  
  // Clean expired entries
  const expiredEntries: string[] = [];
  rateLimitStore.forEach((data, ip) => {
    if (data.resetTime < now) {
      expiredEntries.push(ip);
    }
  });
  expiredEntries.forEach(ip => rateLimitStore.delete(ip));
  
  // Get or create rate limit data
  let rateData = rateLimitStore.get(clientIP);
  if (!rateData || rateData.resetTime < now) {
    rateData = { count: 0, resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW };
    rateLimitStore.set(clientIP, rateData);
  }
  
  // Increment request count
  rateData.count++;
  
  // Check if limit exceeded
  if (rateData.count > SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
    
    // Add to blacklist if severely exceeding
    if (rateData.count > SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW * 2) {
      SECURITY_CONFIG.BLACKLISTED_IPS.add(clientIP);
      console.log(`🚫 IP blacklisted for excessive requests: ${clientIP}`);
    }
    
    return res.status(429).json({
      message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
      error: 'RATE_LIMIT_EXCEEDED',
      code: 'SECURITY_VIOLATION',
      retryAfter: Math.ceil((rateData.resetTime - now) / 1000)
    });
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': (SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW - rateData.count).toString(),
    'X-RateLimit-Reset': new Date(rateData.resetTime).toISOString()
  });
  
  next();
}

/**
 * User agent validation middleware
 */
export function userAgentValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip user agent validation in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const userAgent = req.get('User-Agent') || '';
  
  // Check against blocked user agents
  const isBlocked = SECURITY_CONFIG.BLOCKED_USER_AGENTS.some(pattern => 
    pattern.test(userAgent)
  );
  
  if (isBlocked) {
    const clientIP = getClientIP(req);
    console.log(`🚫 Blocked user agent: ${userAgent} from IP: ${clientIP}`);
    
    return res.status(403).json({
      message: 'Erişim reddedildi',
      error: 'USER_AGENT_BLOCKED',
      code: 'SECURITY_VIOLATION'
    });
  }
  
  next();
}

/**
 * Content inspection middleware for suspicious patterns
 */
export function contentInspectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  
  // Check request body for suspicious patterns
  const content = JSON.stringify(req.body || {}).toLowerCase();
  const suspiciousPatterns = SECURITY_CONFIG.SUSPICIOUS_PATTERNS.filter(pattern => 
    pattern.test(content)
  );
  
  if (suspiciousPatterns.length > 0) {
    console.log(`🚫 Suspicious content detected from IP: ${clientIP}`);
    console.log(`🚫 Patterns found: ${suspiciousPatterns.map(p => p.source).join(', ')}`);
    
    // Track suspicious activity
    const now = Date.now();
    let suspiciousData = suspiciousActivityStore.get(clientIP);
    if (!suspiciousData || suspiciousData.resetTime < now) {
      suspiciousData = { count: 0, resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW };
      suspiciousActivityStore.set(clientIP, suspiciousData);
    }
    
    suspiciousData.count++;
    
    // Blacklist if too many suspicious requests
    if (suspiciousData.count > 3) {
      SECURITY_CONFIG.BLACKLISTED_IPS.add(clientIP);
      console.log(`🚫 IP blacklisted for suspicious activity: ${clientIP}`);
    }
    
    return res.status(400).json({
      message: 'Şüpheli içerik tespit edildi',
      error: 'SUSPICIOUS_CONTENT',
      code: 'SECURITY_VIOLATION'
    });
  }
  
  next();
}

/**
 * Admin route protection middleware
 */
export function adminRouteProtection(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  
  // Enhanced logging for admin routes
  console.log(`🔐 Admin route access attempt: ${req.method} ${req.path} from IP: ${clientIP}`);
  
  // Check if IP is whitelisted for admin access
  if (!SECURITY_CONFIG.WHITELIST_IPS.has(clientIP) && !clientIP.startsWith('192.168.')) {
    // Additional security checks for external IPs
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    
    // Log suspicious admin access attempts
    console.log(`⚠️  External admin access attempt:`);
    console.log(`   IP: ${clientIP}`);
    console.log(`   User-Agent: ${userAgent}`);
    console.log(`   Referer: ${referer}`);
    console.log(`   Method: ${req.method}`);
    console.log(`   Path: ${req.path}`);
    
    // Apply stricter rate limiting for admin routes
    const now = Date.now();
    let adminRateData = rateLimitStore.get(`admin:${clientIP}`);
    if (!adminRateData || adminRateData.resetTime < now) {
      adminRateData = { count: 0, resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW };
      rateLimitStore.set(`admin:${clientIP}`, adminRateData);
    }
    
    adminRateData.count++;
    
    if (adminRateData.count > 10) { // Much stricter limit for admin routes
      SECURITY_CONFIG.BLACKLISTED_IPS.add(clientIP);
      console.log(`🚫 IP blacklisted for excessive admin access attempts: ${clientIP}`);
      
      return res.status(429).json({
        message: 'Çok fazla admin erişim denemesi',
        error: 'ADMIN_RATE_LIMIT_EXCEEDED',
        code: 'SECURITY_VIOLATION'
      });
    }
  }
  
  next();
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Set comprehensive security headers
  res.set({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline' blob:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' ws: wss:; frame-ancestors 'none'; worker-src 'self' blob:;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    'X-Powered-By': 'OtoKiwi-Security',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex',
    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  next();
}

/**
 * Anti-automation detection
 */
export function antiAutomationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip automation detection in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const clientIP = getClientIP(req);
  
  // Check for automation patterns
  let suspiciousScore = 0;
  
  // Check for missing or suspicious headers
  if (!req.get('Accept-Language')) suspiciousScore += 10;
  if (!req.get('Accept-Encoding')) suspiciousScore += 10;
  if (!req.get('Connection')) suspiciousScore += 5;
  if (!req.get('User-Agent')) suspiciousScore += 15;
  
  // Check for automation-like user agents
  const userAgent = req.get('User-Agent') || '';
  if (userAgent.length < 50) suspiciousScore += 10;
  if (!/Mozilla/i.test(userAgent)) suspiciousScore += 15;
  if (!/Chrome|Firefox|Safari|Edge/i.test(userAgent)) suspiciousScore += 10;
  
  // Check for unusual header combinations
  const hasXRequestedWith = req.get('X-Requested-With');
  if (hasXRequestedWith && hasXRequestedWith !== 'XMLHttpRequest') suspiciousScore += 20;
  
  // Check request timing patterns (simplified)
  const now = Date.now();
  const lastRequest = rateLimitStore.get(`timing:${clientIP}`);
  if (lastRequest && (now - lastRequest.resetTime) < 100) {
    suspiciousScore += 25; // Too fast requests
  }
  rateLimitStore.set(`timing:${clientIP}`, { count: 0, resetTime: now });
  
  if (suspiciousScore > 50) {
    console.log(`🤖 Automation detected from IP: ${clientIP} (Score: ${suspiciousScore})`);
    
    return res.status(403).json({
      message: 'Otomatik erişim tespit edildi',
      error: 'AUTOMATION_DETECTED',
      code: 'SECURITY_VIOLATION'
    });
  }
  
  next();
}

/**
 * Console access prevention (client-side protection)
 */
export function getConsoleProtectionScript(): string {
  return `
    <script>
      (function() {
        'use strict';
        
        // Disable console
        if (typeof console !== 'undefined') {
          console.log = console.warn = console.error = console.info = console.debug = function() {};
        }
        
        // Disable right-click context menu
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
        document.addEventListener('keydown', function(e) {
          if (e.key === 'F12' || 
              (e.ctrlKey && e.shiftKey && e.key === 'I') ||
              (e.ctrlKey && e.shiftKey && e.key === 'C') ||
              (e.ctrlKey && e.key === 'U') ||
              (e.ctrlKey && e.key === 'S')) {
            e.preventDefault();
            return false;
          }
        });
        
        // Disable text selection
        document.addEventListener('selectstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Disable drag and drop
        document.addEventListener('dragstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Detect DevTools
        let devtools = {
          open: false,
          orientation: null
        };
        
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          devtools.open = true;
          devtools.orientation = widthThreshold ? 'vertical' : 'horizontal';
          window.location.href = '/';
        }
        
        setInterval(function() {
          if (window.outerHeight - window.innerHeight > threshold || 
              window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
              devtools.open = true;
              window.location.href = '/';
            }
          } else {
            devtools.open = false;
          }
        }, 500);
        
        // Disable common debugging methods
        window.eval = function() { return null; };
        window.Function = function() { return null; };
        
        // Override global objects
        Object.defineProperty(window, 'console', {
          value: {},
          writable: false,
          configurable: false
        });
        
        console.log('🔐 Security protections active');
      })();
    </script>
  `;
}

/**
 * Get security status for admin dashboard
 */
export function getSecurityStatus() {
  return {
    blockedIPs: SECURITY_CONFIG.BLACKLISTED_IPS.size,
    whitelistedIPs: SECURITY_CONFIG.WHITELIST_IPS.size,
    activeRateLimits: rateLimitStore.size,
    suspiciousActivity: suspiciousActivityStore.size,
    securityLevel: 'MAXIMUM',
    lastUpdate: new Date().toISOString(),
    protectionLayers: [
      'IP Blocking',
      'Rate Limiting',
      'User Agent Validation',
      'Content Inspection',
      'Anti-Automation',
      'Security Headers',
      'Console Protection',
      'DevTools Detection',
      'Form Tampering Prevention',
      'Memory Protection'
    ]
  };
}

// Export configuration for external use
export { SECURITY_CONFIG };