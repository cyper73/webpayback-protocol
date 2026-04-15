/**
 * CSRF Protection Implementation for WebPayback Protocol
 * Prevents Cross-Site Request Forgery attacks on critical endpoints
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Store CSRF tokens (in production, use Redis or database)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Generate cryptographically secure CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Store CSRF token for session
export const storeCSRFToken = (sessionId: string, token: string): void => {
  csrfTokenStore.set(sessionId, {
    token,
    expires: Date.now() + CSRF_TOKEN_EXPIRY
  });
};

// Validate CSRF token
export const validateCSRFToken = (sessionId: string, providedToken: string): boolean => {
  const stored = csrfTokenStore.get(sessionId);
  
  if (!stored) {
    console.log('CSRF: No token found for session', sessionId);
    return false;
  }
  
  if (Date.now() > stored.expires) {
    console.log('CSRF: Token expired for session', sessionId);
    csrfTokenStore.delete(sessionId);
    return false;
  }
  
  const isValid = crypto.timingSafeEqual(
    Buffer.from(stored.token, 'hex'),
    Buffer.from(providedToken, 'hex')
  );
  
  if (!isValid) {
    console.log('CSRF: Token mismatch for session', sessionId);
  }
  
  return isValid;
};

// Generate session ID from request
export const getSessionId = (req: Request): string => {
  // Use IP + User-Agent as session identifier (simple approach)
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  return crypto.createHash('sha256').update(ip + userAgent).digest('hex');
};

// CSRF Protection Middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = getSessionId(req);
  
  // Skip CSRF for GET requests (generally safe)
  if (req.method === 'GET') {
    return next();
  }
  
  // Extract CSRF token from multiple sources
  const csrfToken = req.headers['x-csrf-token'] as string ||
                   req.body._csrf ||
                   req.query._csrf as string;
  
  if (!csrfToken) {
    console.log('CSRF: Missing token for', req.method, req.path);
    res.status(403).json({ 
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING'
    });
    return;
  }
  
  if (!validateCSRFToken(sessionId, csrfToken)) {
    console.log('CSRF: Invalid token for', req.method, req.path);
    res.status(403).json({
      error: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    });
    return;
  }
  
  console.log('CSRF: Valid token for', req.method, req.path);
  next();
};

// Enhanced CSRF Protection for Financial Operations
export const enhancedCSRFProtection = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = getSessionId(req);
  
  // Additional validation for financial endpoints
  const referer = req.get('Referer') || '';
  const origin = req.get('Origin') || '';
  const host = req.get('Host') || '';
  
  // Validate origin/referer for financial operations
  const allowedOrigins = [
    `http://localhost:5000`,
    `https://localhost:5000`,
    `http://127.0.0.1:5000`,
    `https://127.0.0.1:5000`
  ];
  
  const isOriginValid = allowedOrigins.some(allowed => 
    origin.startsWith(allowed) || referer.startsWith(allowed)
  );
  
  if (!isOriginValid && (origin || referer)) {
    console.log('CSRF: Invalid origin/referer for financial operation:', origin, referer);
    res.status(403).json({ 
      error: 'Request origin not allowed for financial operations',
      code: 'CSRF_ORIGIN_FORBIDDEN'
    });
    return;
  }
  
  // Continue with standard CSRF protection
  csrfProtection(req, res, next);
};

// Rate limiting for CSRF token generation
const tokenGenerationLimits = new Map<string, { count: number; resetTime: number }>();
const TOKEN_GENERATION_LIMIT = 10; // per hour
const TOKEN_GENERATION_WINDOW = 60 * 60 * 1000; // 1 hour

export const rateLimitTokenGeneration = (sessionId: string): boolean => {
  const now = Date.now();
  const existing = tokenGenerationLimits.get(sessionId);
  
  if (!existing || now > existing.resetTime) {
    tokenGenerationLimits.set(sessionId, { 
      count: 1, 
      resetTime: now + TOKEN_GENERATION_WINDOW 
    });
    return true;
  }
  
  if (existing.count >= TOKEN_GENERATION_LIMIT) {
    return false;
  }
  
  existing.count++;
  return true;
};

// Clean up expired tokens (run periodically)
export const cleanupExpiredTokens = (): void => {
  const now = Date.now();
  
  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now > data.expires) {
      csrfTokenStore.delete(sessionId);
    }
  }
  
  for (const [sessionId, data] of tokenGenerationLimits.entries()) {
    if (now > data.resetTime) {
      tokenGenerationLimits.delete(sessionId);
    }
  }
};

// Start cleanup interval
setInterval(cleanupExpiredTokens, 60 * 60 * 1000); // Every hour

// CORS Configuration for CSRF Protection - Fixed for Replit
export const corsConfig = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5000',
      'https://localhost:5000',
      'http://127.0.0.1:5000',
      'https://127.0.0.1:5000'
    ];
    
    // Check for Replit domains
    const isReplit = origin.includes('.replit.dev') || 
                    origin.includes('.repl.co') ||
                    origin.includes('localhost:') ||
                    origin.includes('127.0.0.1:');
    
    if (allowedOrigins.includes(origin) || isReplit || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('CORS: Blocked origin:', origin);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
};

// Double Submit Cookie Pattern (additional protection)
export const doubleSubmitCookie = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = getSessionId(req);
  
  if (req.method === 'GET') {
    // Set CSRF cookie on GET requests
    const token = generateCSRFToken();
    storeCSRFToken(sessionId, token);
    
    res.cookie('csrf_token', token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_EXPIRY
    });
  }
  
  next();
};