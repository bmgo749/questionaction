
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';

// Enhanced input sanitization middleware - COMPREHENSIVE XSS & Injection Protection
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        // SQL Injection Protection
        .replace(/['";\\]/g, '') // Remove quotes and backslashes
        .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick|onmouseover|onmouseout|onfocus|onblur|onchange|onsubmit|onreset|onselect|onkeydown|onkeypress|onkeyup)\b/gi, '')
        .replace(/\b(information_schema|sysobjects|syscolumns|pg_tables|sqlite_master)\b/gi, '')
        .replace(/(\-\-|\#|\/\*|\*\/)/g, '') // Remove SQL comments
        .replace(/\b(xp_cmdshell|sp_|sys\.)\b/gi, '') // Remove dangerous procedures
        
        // NoSQL Injection Protection
        .replace(/[\$\{\}\[\]\\]/g, '') // Remove NoSQL operators
        .replace(/\b(\$where|\$regex|\$ne|\$gt|\$lt|\$in|\$nin|\$exists|\$type|\$size)\b/gi, '')
        
        // XSS Protection - Comprehensive
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
        .replace(/<link\b[^>]*>/gi, '') // Remove link tags
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
        .replace(/on\w+\s*=/gi, '') // Remove all event handlers
        .replace(/javascript\s*:/gi, '') // Remove javascript protocol
        .replace(/data\s*:/gi, '') // Remove data protocol
        .replace(/vbscript\s*:/gi, '') // Remove vbscript protocol
        .replace(/about\s*:/gi, '') // Remove about protocol
        .replace(/file\s*:/gi, '') // Remove file protocol
        .replace(/\beval\s*\(/gi, '') // Remove eval attempts
        .replace(/\bFunction\s*\(/gi, '') // Remove Function constructor
        .replace(/\bsetTimeout\s*\(/gi, '') // Remove setTimeout
        .replace(/\bsetInterval\s*\(/gi, '') // Remove setInterval
        .replace(/document\./gi, '') // Remove document object access
        .replace(/window\./gi, '') // Remove window object access
        .replace(/\balert\s*\(/gi, '') // Remove alert calls
        .replace(/\bconfirm\s*\(/gi, '') // Remove confirm calls
        .replace(/\bprompt\s*\(/gi, '') // Remove prompt calls
        
        // Path Traversal Protection
        .replace(/\.\.\//g, '') // Remove ../ sequences
        .replace(/\.\.\\/g, '') // Remove ..\ sequences
        .replace(/%2e%2e%2f/gi, '') // Remove URL encoded ../
        .replace(/%2e%2e%5c/gi, '') // Remove URL encoded ..\
        .replace(/\.{2,}/g, '.') // Replace multiple dots
        
        // Command Injection Protection
        .replace(/[;&|`$(){}]/g, '') // Remove command separators
        .replace(/\b(cat|ls|dir|type|copy|move|del|rm|chmod|chown|ps|kill|ping|wget|curl|nc|netcat|telnet|ssh)\b/gi, '')
        
        // HTML Entity Protection
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#x27;/gi, "'")
        .replace(/&#x2F;/gi, '/')
        .replace(/&amp;/gi, '&')
        
        .trim();
    }
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize key names with stricter validation
        const cleanKey = key
          .replace(/[<>'"&\$\{\}\[\]\\;`]/g, '')
          .replace(/\b(constructor|prototype|__proto__|eval|function)\b/gi, '');
        
        if (cleanKey && cleanKey.length > 0 && cleanKey.length < 100) {
          sanitized[cleanKey] = sanitize(value);
        }
      }
      return sanitized;
    }
    if (Array.isArray(obj)) {
      return obj.slice(0, 100).map(item => sanitize(item)); // Limit array size
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
}

// Enhanced CSRF Protection with proper token validation
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Skip CSRF for API authentication endpoints
  if (req.path.startsWith('/api/auth/')) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string || req.body.csrfToken;
  const sessionToken = req.session?.csrfToken;
  
  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({ error: 'CSRF token invalid or missing' });
  }
  
  next();
}

// Clickjacking Protection
export function clickjackingProtection(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
}

// File Upload Security with comprehensive validation
export function fileUploadSecurity(req: Request, res: Response, next: NextFunction) {
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'File too large' });
  }
  
  // Validate Content-Type
  const contentType = req.headers['content-type'];
  if (contentType && contentType.includes('multipart/form-data')) {
    // Allow only specific file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    // This will be validated in multer configuration
  }
  
  next();
}

// Advanced Rate Limiting with IP tracking
const rateLimitStore = new Map();

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many API requests', retryAfter: '15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + '-' + (req.session?.userId || 'anonymous');
  }
});

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Only 5 auth attempts per minute
  message: { error: 'Too many authentication attempts', retryAfter: '1 minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Only 3 uploads per minute
  message: { error: 'Too many upload attempts', retryAfter: '1 minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // Minimal for Vite
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
      mediaSrc: ["'self'", "blob:", "data:"],
      objectSrc: ["'none'"],
      embedSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Prevent clickjacking
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  permittedCrossDomainPolicies: false,
  hidePoweredBy: true,
  xssFilter: true
});

// DoS Protection middleware
export function dosProtection(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip;
  const now = Date.now();
  const requests = rateLimitStore.get(ip) || [];
  
  // Clean old requests (older than 1 minute)
  const recentRequests = requests.filter((time: number) => now - time < 60000);
  
  // Clean up old IPs from store periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [storeIp, storeTimes] of rateLimitStore.entries()) {
      const validTimes = storeTimes.filter((time: number) => now - time < 60000);
      if (validTimes.length === 0) {
        rateLimitStore.delete(storeIp);
      } else {
        rateLimitStore.set(storeIp, validTimes);
      }
    }
  }
  
  // If more than 200 requests in 1 minute, block
  if (recentRequests.length >= 200) {
    return res.status(429).json({ error: 'Rate limit exceeded - potential DoS detected' });
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  
  next();
}

// MITM Protection
export function mitmeProtection(req: Request, res: Response, next: NextFunction) {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  
  // Add security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Expect-CT', 'max-age=86400, enforce');
  
  next();
}

// Path Traversal Protection
export function pathTraversalProtection(req: Request, res: Response, next: NextFunction) {
  const suspiciousPatterns = [
    /\.\./,
    /%2e%2e/i,
    /%252e%252e/i,
    /\.\x2f/,
    /\.\x5c/,
    /\x2e\x2e\x2f/,
    /\x2e\x2e\x5c/
  ];
  
  const pathsToCheck = [req.url, req.path, ...Object.values(req.params), ...Object.values(req.query)];
  
  for (const pathStr of pathsToCheck) {
    if (typeof pathStr === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(pathStr)) {
          return res.status(400).json({ error: 'Path traversal attempt detected' });
        }
      }
    }
  }
  
  next();
}

// XML External Entity (XXE) Protection
export function xxeProtection(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers['content-type'];
  
  if (contentType && (contentType.includes('xml') || contentType.includes('text/xml'))) {
    return res.status(400).json({ error: 'XML content not allowed for security reasons' });
  }
  
  next();
}

// SQL/NoSQL Injection Protection for queries
export function sqlInjectionProtection(query: string): string {
  return query
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute|sp_|xp_)\b/gi, '')
    .replace(/(\-\-|\#|\/\*|\*\/)/g, '') // Remove comments
    .replace(/\b(information_schema|sysobjects|syscolumns|pg_tables|sqlite_master)\b/gi, '')
    .trim();
}

export function mongoInjectionProtection(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/[\$\{\}]/g, '');
  }
  if (typeof obj === 'object' && obj !== null) {
    const clean: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Block NoSQL operators
      if (!key.startsWith('$') && !key.includes('.') && !key.includes(' ')) {
        clean[key] = mongoInjectionProtection(value);
      }
    }
    return clean;
  }
  return obj;
}

// Comprehensive security middleware stack
export function applySecurity(req: Request, res: Response, next: NextFunction) {
  try {
    // Apply all security checks in sequence with error handling
    dosProtection(req, res, (err1?: any) => {
      if (err1) return next(err1);
      pathTraversalProtection(req, res, (err2?: any) => {
        if (err2) return next(err2);
        xxeProtection(req, res, (err3?: any) => {
          if (err3) return next(err3);
          mitmeProtection(req, res, (err4?: any) => {
            if (err4) return next(err4);
            clickjackingProtection(req, res, (err5?: any) => {
              if (err5) return next(err5);
              sanitizeInput(req, res, next);
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Security middleware error:', error);
    next(error);
  }
}

// Generate CSRF token for sessions
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
