/**
 * Server-side input validation and sanitization for XSS prevention
 */

import { z } from 'zod';

// XSS Prevention: HTML entity encoding for server responses
export const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
};

// XSS Prevention: URL validation schema
export const urlValidationSchema = z.string()
  .url('Invalid URL format')
  .max(500, 'URL too long')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Only allow safe protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'Only HTTP/HTTPS URLs are allowed')
  .refine((url) => {
    // Check for dangerous patterns
    return !/<[^>]*>/gi.test(url) && 
           !url.toLowerCase().includes('javascript:') &&
           !url.toLowerCase().includes('data:') &&
           !url.toLowerCase().includes('vbscript:');
  }, 'URL contains potentially dangerous content');

// XSS Prevention: Wallet address validation schema
export const walletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address format')
  .transform(val => val.toLowerCase());

// XSS Prevention: Content category validation schema - Qloo-compatible enum
export const contentCategorySchema = z.enum([
  "blog_articles",
  "news_journalism", 
  "educational_content",
  "technical_documentation",
  "creative_writing",
  "art_design",
  "music_audio",
  "video_content",
  "social_media",
  "academic_papers",
  "photography"
]);

// XSS Prevention: General text input sanitization
export const sanitizeTextInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove basic HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/style\s*=/gi, '') // Remove style attributes
    .trim()
    .substring(0, maxLength);
};

// XSS Prevention: Error message sanitization for API responses
export const sanitizeErrorMessage = (message: unknown): string => {
  if (typeof message !== 'string') return 'An error occurred';
  
  return escapeHtml(message)
    .substring(0, 500) // Limit error message length
    .replace(/\n/g, ' '); // Remove newlines
};

// XSS Prevention: Validate and sanitize domain names
export const validateDomainName = (domain: string): boolean => {
  if (!domain || typeof domain !== 'string') return false;
  
  try {
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return domainRegex.test(cleanDomain) && 
           cleanDomain.length <= 253 &&
           !cleanDomain.includes('<') &&
           !cleanDomain.includes('>') &&
           !cleanDomain.includes('"') &&
           !cleanDomain.includes("'");
  } catch {
    return false;
  }
};

// XSS Prevention: Request body sanitization middleware
export const sanitizeRequestBody = (body: any): any => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      // Sanitize string values
      sanitized[key] = sanitizeTextInput(value);
    } else if (Array.isArray(value)) {
      // Sanitize array values
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeTextInput(item) : item
      );
    } else {
      // Keep other types as-is
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// XSS Prevention: Enhanced creator registration validation
export const validateCreatorInput = (input: any) => {
  const schema = z.object({
    websiteUrl: urlValidationSchema,
    walletAddress: walletAddressSchema,
    contentCategory: contentCategorySchema,
    termsAccepted: z.boolean().refine(val => val === true, {
      message: 'Terms and conditions must be accepted'
    })
  });
  
  return schema.parse(input);
};

// XSS Prevention: API parameter validation
export const validateApiParams = (params: Record<string, any>) => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Sanitize and validate string parameters
      const sanitizedValue = sanitizeTextInput(value, 100);
      
      // Additional validation for numeric IDs
      if (key.includes('id') || key.includes('Id')) {
        const numValue = parseInt(sanitizedValue);
        if (isNaN(numValue) || numValue < 0) {
          throw new Error(`Invalid ${key} parameter`);
        }
        sanitized[key] = numValue;
      } else {
        sanitized[key] = sanitizedValue;
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// XSS Prevention: SQL injection prevention (additional layer)
export const validateSqlSafeString = (input: string): boolean => {
  if (typeof input !== 'string') return false;
  
  // Check for common SQL injection patterns
  const sqlInjectionPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(\b(or|and)\s+['"]*\d+['"]*\s*[=<>])/gi,
    /['"]\s*(or|and)\s*['"]\s*['"]/gi,
    /['"]\s*[;]\s*--/gi,
    /\/\*.*\*\//gi
  ];
  
  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
};

// Content Security Policy helpers
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  require('crypto').getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// XSS Prevention: Response header sanitization
export const sanitizeResponseHeaders = (headers: Record<string, string>) => {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      // Remove newlines and control characters from headers
      sanitized[key] = value.replace(/[\r\n\t]/g, '').substring(0, 500);
    }
  }
  
  return sanitized;
};