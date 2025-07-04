/**
 * Comprehensive Input Validation and SQL Injection Protection
 * Provides validation middleware to prevent SQL injection, XSS, and other attacks
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// SQL Injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
  /(--|\/\*|\*\/|;)/g,
  /(\b(UNION|SELECT)\s+.*\s+FROM)/gi,
  /(\b(INSERT|UPDATE|DELETE)\s+.*\s+(WHERE|SET))/gi,
  /(\b(DROP|CREATE|ALTER)\s+(TABLE|DATABASE|INDEX))/gi,
  /(\bEXEC\s*\()/gi,
  /(\bsp_executesql\b)/gi,
  /(\bxp_cmdshell\b)/gi,
  /(\b(SLEEP|BENCHMARK|WAITFOR)\s*\()/gi,
  /(\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b)/gi,
  /(\b(INFORMATION_SCHEMA|MYSQL\.USER|PG_SHADOW)\b)/gi,
];

// XSS patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /expression\s*\(/gi,
  /eval\s*\(/gi,
];

/**
 * Validates input against SQL injection patterns
 */
export function validateSQLInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return true;
  return !SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Validates input against XSS patterns
 */
export function validateXSS(input: string): boolean {
  if (!input || typeof input !== 'string') return true;
  return !XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation
 */
export function validateInput(input: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input) return { isValid: true, errors: [] };
  
  const inputString = typeof input === 'string' ? input : JSON.stringify(input);
  
  if (!validateSQLInjection(inputString)) {
    errors.push('SQL injection pattern detected');
  }
  
  if (!validateXSS(inputString)) {
    errors.push('XSS pattern detected');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Middleware for comprehensive input validation
 */
export function inputValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  const inputs = [
    ...Object.values(req.body || {}),
    ...Object.values(req.query || {}),
    ...Object.values(req.params || {}),
  ];
  
  for (const input of inputs) {
    const validation = validateInput(input);
    if (!validation.isValid) {
      console.log(`🚫 Malicious input detected: ${validation.errors.join(', ')}`);
      return res.status(400).json({
        message: 'Geçersiz veri formatı tespit edildi',
        error: 'INVALID_INPUT',
        code: 'SECURITY_VIOLATION'
      });
    }
  }
  
  next();
}

/**
 * Validation result checker middleware
 */
export function validationResultChecker(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Geçersiz veri',
      errors: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
}

/**
 * Common validation rules
 */
export const commonValidations = {
  // Username validation
  username: body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Kullanıcı adı 3-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir'),
  
  // Password validation
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Şifre en az 8 karakter olmalıdır'),
  
  // Email validation
  email: body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),
  
  // Key validation
  key: body('key')
    .isLength({ min: 10, max: 100 })
    .withMessage('Anahtar 10-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Anahtar sadece harf, rakam, tire ve alt çizgi içerebilir'),
  
  // URL validation
  url: body('url')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Geçerli bir URL giriniz'),
  
  // Integer validation
  integer: (field: string) => body(field)
    .isInt({ min: 0 })
    .withMessage(`${field} pozitif bir sayı olmalıdır`),
  
  // ID validation
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('Geçerli bir ID giriniz'),
  
  // Category validation
  category: body('category')
    .isIn(['Instagram', 'YouTube', 'Twitter', 'TikTok', 'Facebook', 'LinkedIn', 'Other'])
    .withMessage('Geçerli bir kategori seçiniz'),
  
  // Text validation
  text: (field: string, min: number = 1, max: number = 1000) => body(field)
    .isLength({ min, max })
    .withMessage(`${field} ${min}-${max} karakter arasında olmalıdır`)
    .trim()
    .escape(),
};

export default {
  validateSQLInjection,
  validateXSS,
  validateInput,
  inputValidationMiddleware,
  validationResultChecker,
  commonValidations,
};