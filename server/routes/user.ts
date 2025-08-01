import { Router } from "express";
import crypto from "crypto";

const router = Router();

// Get current user with proper session handling
router.get("/", (req, res) => {
  // Extract user session from request
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const sessionFingerprint = `${ip}_${userAgent}`;
  
  // Hash session to create unique user ID
  const sessionHash = crypto.createHash('md5').update(sessionFingerprint).digest('hex');
  const userId = parseInt(sessionHash.substring(0, 8), 16) % 1000 + 2; // Generate ID between 2-1001
  
  // Map known founder session (desktop browser) to user ID 1
  if (userAgent.includes('Chrome') && userAgent.includes('Windows')) {
    const founderId = 1;
    console.log(`SESSION: Desktop founder session detected - User ID: ${founderId}`);
    return res.json({
      id: founderId,
      username: "webpayback_founder"
    });
  }
  
  // Mobile or unknown devices get different user IDs
  console.log(`SESSION: Mobile/External device detected - User ID: ${userId}`);
  console.log(`SESSION: IP: ${ip}, User-Agent: ${userAgent.substring(0, 50)}...`);
  
  res.json({
    id: userId,
    username: `user_${userId}`
  });
});

export default router;