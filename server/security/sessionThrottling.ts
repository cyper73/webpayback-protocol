import { Request, Response, NextFunction } from 'express';

interface SessionData {
  requestCount: number;
  firstRequest: number;
  isBlocked: boolean;
  blockUntil?: number;
}

// In-memory store for session throttling
const sessionStore = new Map<string, SessionData>();

// Configuration
const UNAUTHENTICATED_LIMIT = 200; // requests per window (increased for dashboard)
const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes (reduced)

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of sessionStore.entries()) {
    if (data.blockUntil && now > data.blockUntil) {
      sessionStore.delete(key);
    } else if (now - data.firstRequest > WINDOW_SIZE) {
      sessionStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function sessionThrottling(req: Request, res: Response, next: NextFunction) {
  const clientId = getSessionIdentifier(req);
  const now = Date.now();
  
  let sessionData = sessionStore.get(clientId);
  
  if (!sessionData) {
    sessionData = {
      requestCount: 1,
      firstRequest: now,
      isBlocked: false
    };
    sessionStore.set(clientId, sessionData);
    return next();
  }
  
  // Check if session is currently blocked
  if (sessionData.isBlocked && sessionData.blockUntil && now < sessionData.blockUntil) {
    console.log(`🚫 SESSION BLOCKED: ${clientId} - ${Math.ceil((sessionData.blockUntil - now) / 1000)}s remaining`);
    res.status(429).json({
      error: 'Session temporarily blocked due to excessive requests',
      retryAfter: Math.ceil((sessionData.blockUntil - now) / 1000)
    });
    return;
  }
  
  // Reset window if enough time has passed
  if (now - sessionData.firstRequest > WINDOW_SIZE) {
    sessionData.requestCount = 1;
    sessionData.firstRequest = now;
    sessionData.isBlocked = false;
    sessionData.blockUntil = undefined;
  } else {
    sessionData.requestCount++;
  }
  
  // Check if limit exceeded
  if (sessionData.requestCount > UNAUTHENTICATED_LIMIT) {
    sessionData.isBlocked = true;
    sessionData.blockUntil = now + BLOCK_DURATION;
    
    console.log(`⚠️  SESSION THROTTLED: ${clientId} - ${sessionData.requestCount} requests in ${Math.floor((now - sessionData.firstRequest) / 1000)}s`);
    
    res.status(429).json({
      error: 'Too many requests from this session',
      limit: UNAUTHENTICATED_LIMIT,
      windowSize: WINDOW_SIZE / 1000,
      retryAfter: BLOCK_DURATION / 1000
    });
    return;
  }
  
  // Add throttling headers
  res.set({
    'X-Session-Limit': UNAUTHENTICATED_LIMIT.toString(),
    'X-Session-Remaining': (UNAUTHENTICATED_LIMIT - sessionData.requestCount).toString(),
    'X-Session-Reset': new Date(sessionData.firstRequest + WINDOW_SIZE).toISOString()
  });
  
  next();
}

function getSessionIdentifier(req: Request): string {
  // Combine IP and User-Agent for session identification
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Create hash-like identifier
  return `${ip}-${Buffer.from(userAgent).toString('base64').slice(0, 16)}`;
}

// Export stats for monitoring
export function getSessionStats() {
  const stats = {
    activeSessions: sessionStore.size,
    blockedSessions: 0,
    totalRequests: 0
  };
  
  for (const data of sessionStore.values()) {
    if (data.isBlocked) {
      stats.blockedSessions++;
    }
    stats.totalRequests += data.requestCount;
  }
  
  return stats;
}