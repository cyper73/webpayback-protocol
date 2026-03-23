import { Request, Response, NextFunction } from 'express';

interface ApiUsageData {
  dailyCalls: number;
  lastReset: number;
  recentCalls: number[];
  currentHourCalls: number;
  isThrottled: boolean;
}

const apiUsageStore = new Map<string, ApiUsageData>();

// Configuration
const DAILY_LIMIT = 2000;
const HOURLY_LIMIT = 300;
const BURST_LIMIT = 80; // max calls in 1 minute (increased for dashboard)
const THROTTLE_THRESHOLD = 0.8; // start throttling at 80% of daily limit

// Reset daily counters at midnight
setInterval(() => {
  const now = Date.now();
  const today = new Date(now).toDateString();
  
  for (const [key, data] of apiUsageStore.entries()) {
    const lastResetDate = new Date(data.lastReset).toDateString();
    if (lastResetDate !== today) {
      data.dailyCalls = 0;
      data.lastReset = now;
      data.isThrottled = false;
    }
  }
}, 60 * 60 * 1000); // Check every hour

export function apiThrottling(req: Request, res: Response, next: NextFunction) {
  const serviceId = getServiceIdentifier(req);
  const now = Date.now();
  
  let usageData = apiUsageStore.get(serviceId);
  
  if (!usageData) {
    usageData = {
      dailyCalls: 0,
      lastReset: now,
      recentCalls: [],
      currentHourCalls: 0,
      isThrottled: false
    };
    apiUsageStore.set(serviceId, usageData);
  }
  
  // Clean up old recent calls (older than 1 minute)
  const oneMinuteAgo = now - 60 * 1000;
  usageData.recentCalls = usageData.recentCalls.filter(time => time > oneMinuteAgo);
  
  // Clean up hourly counter
  const oneHourAgo = now - 60 * 60 * 1000;
  if (usageData.recentCalls.length === 0 || Math.min(...usageData.recentCalls) > oneHourAgo) {
    usageData.currentHourCalls = usageData.recentCalls.length;
  }
  
  // Check daily limit
  if (usageData.dailyCalls >= DAILY_LIMIT) {
    console.log(`🚫 DAILY API LIMIT EXCEEDED: ${serviceId} - ${usageData.dailyCalls}/${DAILY_LIMIT} calls`);
    return res.status(429).json({
      error: 'Daily API limit exceeded',
      limit: DAILY_LIMIT,
      used: usageData.dailyCalls,
      resetTime: new Date(usageData.lastReset + 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Check hourly limit
  if (usageData.currentHourCalls >= HOURLY_LIMIT) {
    console.log(`⏰ HOURLY API LIMIT EXCEEDED: ${serviceId} - ${usageData.currentHourCalls}/${HOURLY_LIMIT} calls/hour`);
    return res.status(429).json({
      error: 'Hourly API limit exceeded',
      hourlyLimit: HOURLY_LIMIT,
      used: usageData.currentHourCalls,
      retryAfter: 3600
    });
  }
  
  // Check burst limit
  if (usageData.recentCalls.length >= BURST_LIMIT) {
    console.log(`💥 BURST LIMIT EXCEEDED: ${serviceId} - ${usageData.recentCalls.length} calls in 1 minute`);
    return res.status(429).json({
      error: 'Too many requests in short time',
      burstLimit: BURST_LIMIT,
      retryAfter: 60
    });
  }
  
  // Apply dynamic throttling when approaching daily limit
  const usagePercentage = usageData.dailyCalls / DAILY_LIMIT;
  if (usagePercentage >= THROTTLE_THRESHOLD && !usageData.isThrottled) {
    usageData.isThrottled = true;
    console.log(`⚡ DYNAMIC THROTTLING ACTIVATED: ${serviceId} - ${Math.round(usagePercentage * 100)}% of daily limit used`);
  }
  
  // Add delay for throttled requests
  if (usageData.isThrottled) {
    const delay = Math.min(2000, (usagePercentage - THROTTLE_THRESHOLD) * 10000);
    setTimeout(() => {
      continueRequest();
    }, delay);
  } else {
    continueRequest();
  }
  
  function continueRequest() {
    // Update counters
    usageData!.dailyCalls++;
    usageData!.recentCalls.push(now);
    usageData!.currentHourCalls++;
    
    // Add usage headers
    res.set({
      'X-API-Daily-Limit': DAILY_LIMIT.toString(),
      'X-API-Daily-Remaining': (DAILY_LIMIT - usageData!.dailyCalls).toString(),
      'X-API-Hourly-Limit': HOURLY_LIMIT.toString(),
      'X-API-Hourly-Remaining': (HOURLY_LIMIT - usageData!.currentHourCalls).toString(),
      'X-API-Throttled': usageData!.isThrottled.toString()
    });
    
    next();
  }
}

function getServiceIdentifier(req: Request): string {
  // Identify service by endpoint pattern
  const path = req.path;
  
  if (path.includes('/api/reentrancy/alchemy/')) return 'alchemy';
  if (path.includes('/api/cultural/')) return 'qloo';
  if (path.includes('/api/web3/')) return 'blockchain';
  if (path.includes('/api/pool/')) return 'pool-monitoring';
  
  return 'general';
}

// Export stats for monitoring
export function getApiUsageStats() {
  const stats: Record<string, any> = {};
  
  for (const [service, data] of apiUsageStore.entries()) {
    stats[service] = {
      dailyCalls: data.dailyCalls,
      dailyRemaining: DAILY_LIMIT - data.dailyCalls,
      isThrottled: data.isThrottled,
      lastReset: new Date(data.lastReset).toISOString()
    };
  }
  
  return stats;
}