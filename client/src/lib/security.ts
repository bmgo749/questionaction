// Security URL transformation and code generation system
import { v4 as uuidv4 } from 'uuid';

// Security configuration
const SECURITY_CONFIG = {
  VERSION: 'v2',
  CODE_LENGTH: 16,
  CODE_EXPIRY: 1000 * 60 * 30, // 30 minutes
  ALLOWED_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
};

// User session security store
interface SecuritySession {
  userId?: string;
  sessionId: string;
  code: string;
  timestamp: number;
  fingerprint: string;
}

class SecurityManager {
  private sessions: Map<string, SecuritySession> = new Map();
  private userCodes: Map<string, string> = new Map();

  // Generate secure code for user
  generateSecureCode(userId?: string): string {
    const sessionId = uuidv4();
    const fingerprint = this.generateFingerprint();
    
    // Generate unique code
    let code = '';
    for (let i = 0; i < SECURITY_CONFIG.CODE_LENGTH; i++) {
      code += SECURITY_CONFIG.ALLOWED_CHARS.charAt(
        Math.floor(Math.random() * SECURITY_CONFIG.ALLOWED_CHARS.length)
      );
    }
    
    // XSS protection: ensure code doesn't contain dangerous patterns
    code = this.sanitizeCode(code);
    
    const session: SecuritySession = {
      userId,
      sessionId,
      code,
      timestamp: Date.now(),
      fingerprint,
    };
    
    this.sessions.set(code, session);
    if (userId) {
      this.userCodes.set(userId, code);
    }
    
    return code;
  }

  // Generate browser fingerprint for MITM protection
  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  // Sanitize code to prevent XSS
  private sanitizeCode(code: string): string {
    // Remove any potentially dangerous characters
    return code.replace(/[<>'"&]/g, '');
  }

  // Get current user's code
  getCurrentCode(userId?: string): string {
    if (userId && this.userCodes.has(userId)) {
      const code = this.userCodes.get(userId)!;
      const session = this.sessions.get(code);
      
      // Check if code is still valid
      if (session && (Date.now() - session.timestamp) < SECURITY_CONFIG.CODE_EXPIRY) {
        return code;
      }
    }
    
    // Generate new code if none exists or expired
    return this.generateSecureCode(userId);
  }

  // Validate code for security
  validateCode(code: string, userId?: string): boolean {
    const session = this.sessions.get(code);
    if (!session) return false;
    
    // Check expiry
    if ((Date.now() - session.timestamp) > SECURITY_CONFIG.CODE_EXPIRY) {
      this.sessions.delete(code);
      if (session.userId) {
        this.userCodes.delete(session.userId);
      }
      return false;
    }
    
    // Check user match
    if (userId && session.userId !== userId) {
      return false;
    }
    
    // Check fingerprint for MITM protection
    const currentFingerprint = this.generateFingerprint();
    if (session.fingerprint !== currentFingerprint) {
      return false;
    }
    
    return true;
  }

  // Clean expired sessions
  cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [code, session] of this.sessions.entries()) {
      if ((now - session.timestamp) > SECURITY_CONFIG.CODE_EXPIRY) {
        this.sessions.delete(code);
        if (session.userId) {
          this.userCodes.delete(session.userId);
        }
      }
    }
  }
}

// Global security manager instance
export const securityManager = new SecurityManager();

// Transform regular path to secure path
export function transformToSecurePath(path: string, userId?: string, forceNew: boolean = true): string {
  // Clean expired sessions periodically
  if (Math.random() < 0.1) {
    securityManager.cleanExpiredSessions();
  }
  
  // Always generate a new code for navigation to ensure fresh URLs
  const code = forceNew ? securityManager.generateSecureCode(userId) : securityManager.getCurrentCode(userId);
  
  // Remove leading slash if present for hash fragment
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Create secure URL structure with both code and errorCode parameters, path in hash
  const errorCode = Math.random().toString(36).substring(2, 8);
  const secureUrl = `/${SECURITY_CONFIG.VERSION}/?code=${code}&errorCode=${errorCode}#${cleanPath}`;
  
  console.log(`🔐 transformToSecurePath: ${path} -> ${secureUrl}`);
  return secureUrl;
}

// Alias for transformToSecurePath - used for generating secure links
export function generateSecureLink(path: string, userId?: string): string {
  return transformToSecurePath(path, userId, true);
}

// Extract original path from secure path
export function extractOriginalPath(securePath: string): { path: string; code: string; errorCode?: string } | null {
  const regex = new RegExp(`^/${SECURITY_CONFIG.VERSION}/\\?code=([^&]+)(?:&errorCode=([^#]+))?#(.*)$`);
  const match = securePath.match(regex);
  
  if (match) {
    return {
      code: match[1],
      errorCode: match[2],
      path: '/' + match[3],
    };
  }
  
  return null;
}

// CSRF protection token generation
export function generateCSRFToken(): string {
  return btoa(uuidv4() + Date.now()).replace(/[+/=]/g, '');
}

// XSS protection for user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;');
}

// Additional security headers for requests
export function getSecurityHeaders(code: string): Record<string, string> {
  return {
    'X-Security-Version': SECURITY_CONFIG.VERSION,
    'X-Security-Code': code,
    'X-CSRF-Token': generateCSRFToken(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}