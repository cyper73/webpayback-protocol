/**
 * Rate Limiting Protection for WebPayback Protocol
 * Prevents brute force attacks, abuse, and API flooding
 */

import { Request, Response, NextFunction } from 'express';

// Rate limit storage - in production, use Redis for distributed systems
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpiry?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configurable rate limiting rules
interface RateLimitConfig {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Max requests per window
  blockDurationMs: number; // How long to block after limit exceeded
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean;     // Don't count failed requests
}

// Different rate limiting profiles for different endpoint types
const RATE_LIMIT_CONFIGS = {
  // Authentication related endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,             // 5 attempts per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
    skipSuccessfulRequests: true
  },
  
  // CSRF token generation
  CSRF_TOKEN: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 10,            // 10 tokens per hour
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
    skipSuccessfulRequests: false
  },
  
  // Creator registration
  CREATOR_REGISTRATION: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 3,             // 3 registrations per hour
    blockDurationMs: 24 * 60 * 60 * 1000, // Block for 24 hours
    skipSuccessfulRequests: true
  },
  
  // Domain verification attempts
  DOMAIN_VERIFICATION: {
    windowMs: 30 * 60 * 1000,  // 30 minutes
    maxRequests: 10,            // 10 verification attempts per 30 minutes
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
    skipSuccessfulRequests: true
  },
  
  // Financial operations (rewards)
  FINANCIAL: {
    windowMs: 5 * 60 * 1000,   // 5 minutes
    maxRequests: 20,            // 20 operations per 5 minutes
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
    skipSuccessfulRequests: true
  },
  
  // General API usage
  GENERAL: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 100,           // 100 requests per minute
    blockDurationMs: 10 * 60 * 1000, // Block for 10 minutes
    skipSuccessfulRequests: false
  },
  
  // Content tracking (AI monitoring)
  CONTENT_TRACKING: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 30,            // 30 tracking requests per minute
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
    skipSuccessfulRequests: true
  }
} as const;

// Generate unique key for rate limiting
const generateRateLimitKey = (req: Request, identifier: string): string => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const sessionId = req.headers['x-session-id'] || 'anonymous';
  
  // Use session ID if available, otherwise fall back to IP + User-Agent hash
  if (sessionId !== 'anonymous') {
    return `${identifier}:session:${sessionId}`;
  }
  
  return `${identifier}:ip:${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 10)}`;
};

// Core rate limiting function
const applyRateLimit = (
  req: Request, 
  res: Response, 
  next: NextFunction, 
  config: RateLimitConfig,
  identifier: string
): void => {
  const key = generateRateLimitKey(req, identifier);
  const now = Date.now();
  
  // Clean expired entries
  if (rateLimitStore.has(key)) {
    const entry = rateLimitStore.get(key)!;
    
    // Check if block period has expired
    if (entry.blocked && entry.blockExpiry && now > entry.blockExpiry) {
      entry.blocked = false;
      entry.blockExpiry = undefined;
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }
    
    // Check if window has expired
    if (now > entry.resetTime && !entry.blocked) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }
  }
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if currently blocked
  if (entry.blocked) {
    const remainingBlockTime = Math.ceil((entry.blockExpiry! - now) / 1000);
    
    console.log(`🚫 RATE LIMIT: Blocked request from ${key} - ${remainingBlockTime}s remaining`);
    
    return res.status(429).json({
      error: 'Rate limit exceeded. You are temporarily blocked.',
      code: 'RATE_LIMIT_BLOCKED',
      retryAfter: remainingBlockTime,
      blockExpiresAt: new Date(entry.blockExpiry!).toISOString()
    });
  }
  
  // Increment counter
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    entry.blocked = true;
    entry.blockExpiry = now + config.blockDurationMs;
    
    console.log(`⚠️ RATE LIMIT EXCEEDED: ${key} exceeded ${config.maxRequests} requests - blocking for ${config.blockDurationMs / 1000}s`);
    
    // Log potential attack
    console.log(`🚨 POTENTIAL BRUTE FORCE: IP/Session exceeded rate limit on ${identifier}`);
    
    return res.status(429).json({
      error: 'Rate limit exceeded. You have been temporarily blocked due to too many requests.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
      blockExpiresAt: new Date(entry.blockExpiry).toISOString(),
      maxRequests: config.maxRequests,
      windowMs: config.windowMs
    });
  }
  
  // Add rate limit headers
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetTime = Math.ceil((entry.resetTime - now) / 1000);
  
  res.set({
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
    'X-RateLimit-Window': config.windowMs.toString()
  });
  
  // Log suspicious activity (>75% of limit)
  if (entry.count > config.maxRequests * 0.75) {
    console.log(`⚠️ RATE LIMIT WARNING: ${key} used ${entry.count}/${config.maxRequests} requests on ${identifier}`);
  }
  
  next();
};

// Middleware factory for different rate limiting types
export const createRateLimit = (type: keyof typeof RATE_LIMIT_CONFIGS) => {
  const config = RATE_LIMIT_CONFIGS[type];
  
  return (req: Request, res: Response, next: NextFunction): void => {
    applyRateLimit(req, res, next, config, type);
  };
};

// Specific rate limiting middlewares
export const authRateLimit = createRateLimit('AUTH');
export const csrfTokenRateLimit = createRateLimit('CSRF_TOKEN');
export const creatorRegistrationRateLimit = createRateLimit('CREATOR_REGISTRATION');
export const domainVerificationRateLimit = createRateLimit('DOMAIN_VERIFICATION');
export const financialRateLimit = createRateLimit('FINANCIAL');
export const generalRateLimit = createRateLimit('GENERAL');
export const contentTrackingRateLimit = createRateLimit('CONTENT_TRACKING');

// Adaptive rate limiting based on response status
export const adaptiveRateLimit = (type: keyof typeof RATE_LIMIT_CONFIGS) => {
  const config = RATE_LIMIT_CONFIGS[type];
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const statusCode = res.statusCode;
      const key = generateRateLimitKey(req, type);
      
      // Only count requests based on configuration
      let shouldCount = true;
      
      if (config.skipSuccessfulRequests && statusCode >= 200 && statusCode < 400) {
        shouldCount = false;
      }
      
      if (config.skipFailedRequests && statusCode >= 400) {
        shouldCount = false;
      }
      
      if (!shouldCount) {
        const entry = rateLimitStore.get(key);
        if (entry && entry.count > 0) {
          entry.count--;
          console.log(`✅ RATE LIMIT: Successful request - decremented counter for ${key}`);
        }
      }
      
      return originalSend.call(this, data);
    };
    
    applyRateLimit(req, res, next, config, type);
  };
};

// IP-based blocking for severe abuse
const blockedIPs = new Set<string>();
const ipAbuseCounts = new Map<string, { count: number, resetTime: number }>();

export const ipAbuseProtection = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Whitelist localhost and internal IPs from permanent blocking
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('172.31.') || ip.startsWith('10.');
  
  if (isLocalhost) {
    return next(); // Never block localhost/internal IPs
  }
  
  // Check if IP is permanently blocked
  if (blockedIPs.has(ip)) {
    console.log(`🚫 IP BLOCKED: Permanent block for ${ip}`);
    return res.status(403).json({
      error: 'Your IP address has been blocked due to abusive behavior.',
      code: 'IP_BLOCKED'
    });
  }
  
  // Track abuse patterns
  const now = Date.now();
  let abuseData = ipAbuseCounts.get(ip);
  
  if (!abuseData) {
    abuseData = { count: 0, resetTime: now + 24 * 60 * 60 * 1000 }; // 24 hour window
    ipAbuseCounts.set(ip, abuseData);
  }
  
  // Reset counter if window expired
  if (now > abuseData.resetTime) {
    abuseData.count = 0;
    abuseData.resetTime = now + 24 * 60 * 60 * 1000;
  }
  
  // Check for rate limit violations in response
  res.on('finish', () => {
    if (res.statusCode === 429) {
      abuseData!.count++;
      
      // Block IP if too many rate limit violations
      if (abuseData!.count >= 5) {
        blockedIPs.add(ip);
        console.log(`🚨 IP PERMANENTLY BLOCKED: ${ip} exceeded abuse threshold`);
      }
    }
  });
  
  next();
};

// Get rate limiting statistics for monitoring
export const getRateLimitStats = (): any => {
  const stats = {
    totalEntries: rateLimitStore.size,
    blockedSessions: 0,
    blockedIPs: blockedIPs.size,
    recentActivity: [] as any[]
  };
  
  rateLimitStore.forEach((entry, key) => {
    if (entry.blocked) {
      stats.blockedSessions++;
    }
    
    // Include recent high-activity entries
    if (entry.count > 5) {
      stats.recentActivity.push({
        key: key.split(':')[0] + ':***', // Anonymize for privacy
        count: entry.count,
        blocked: entry.blocked,
        resetTime: new Date(entry.resetTime).toISOString()
      });
    }
  });
  
  return stats;
};

// Clean expired entries (call periodically)
export const cleanupRateLimit = (): void => {
  const now = Date.now();
  let cleaned = 0;
  
  rateLimitStore.forEach((entry, key) => {
    // Remove expired entries that are not blocked
    if (!entry.blocked && now > entry.resetTime + 60000) { // 1 minute grace period
      rateLimitStore.delete(key);
      cleaned++;
    }
    
    // Remove expired blocks
    if (entry.blocked && entry.blockExpiry && now > entry.blockExpiry + 60000) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  });
  
  ipAbuseCounts.forEach((data, ip) => {
    if (now > data.resetTime) {
      ipAbuseCounts.delete(ip);
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    console.log(`🧹 RATE LIMIT CLEANUP: Removed ${cleaned} expired entries`);
  }
};

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

// Emergency rate limiting for DDoS-like attacks
export const emergencyRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Whitelist localhost and internal dashboard requests
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('172.31.') || ip.startsWith('10.');
  const isDashboard = req.headers['user-agent']?.includes('Mozilla') || req.headers['referer']?.includes('localhost');
  
  if (isLocalhost || isDashboard) {
    return next(); // Skip rate limiting for dashboard
  }
  
  const key = `emergency:${ip}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { count: 0, resetTime: now + 10000, blocked: false }; // 10 second window
    rateLimitStore.set(key, entry);
  }
  
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + 10000;
    entry.blocked = false;
  }
  
  entry.count++;
  
  // Very aggressive limiting - 50 requests per 10 seconds for external IPs only
  if (entry.count > 50) {
    console.log(`🚨 EMERGENCY RATE LIMIT: Potential DDoS from ${ip}`);
    return res.status(429).json({
      error: 'Emergency rate limit exceeded',
      code: 'EMERGENCY_RATE_LIMIT'
    });
  }
  
  next();
};