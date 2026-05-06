import { Router } from "express";
import { humanityService } from "../services/humanityProtocol";
import * as jose from 'jose';
import { db } from "../db";
import { creators } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Privy App ID from environment or fallback.
// Prefer server-side PRIVY_APP_ID, keep VITE fallback for backward compatibility.
const PRIVY_APP_ID =
  process.env.PRIVY_APP_ID ||
  process.env.VITE_PRIVY_APP_ID ||
  'cmn0xgyny01ra0ciijd8kc2kk';
// JWKS Endpoint for verifying Privy access tokens
const JWKS_URL = `https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`;

// Cache the JWKS keystore
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URL));

/**
 * Middleware to verify Privy access token
 */
const verifyPrivyToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token signature against Privy's JWKS
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: 'privy.io',
      audience: PRIVY_APP_ID
    });

    // Add verified user ID to request
    req.privyUserId = payload.sub;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid access token" });
  }
};

router.get('/auth-url/:userId', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'OAuth redirect ownership is frontend-only via Humanity React SDK quickstart.',
  });
});

router.post('/login', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use frontend Humanity SDK redirect login. This backend endpoint no longer creates sessions.',
  });
});

router.get('/status/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const status = await humanityService.getStatus(userId);
    return res.json(status);
  } catch (error) {
    console.error('Status read error:', error);
    return res.status(500).json({ error: 'Failed to read humanity status' });
  }
});

router.post('/verify', verifyPrivyToken, async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use frontend SDK verification and persist result through POST /api/humanity/sync.',
  });
});

/**
 * POST /api/humanity/rewards/calculate
 */
router.post('/rewards/calculate', async (req, res) => {
  try {
    const { userId, baseAmount } = req.body;
    if (!userId || !baseAmount) return res.status(400).json({ error: 'Missing parameters' });
    const result = await humanityService.distributeRewards(userId, baseAmount, 1.0);
    res.json(result);
  } catch (error) {
    console.error('Reward calculation error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

router.post('/sync', verifyPrivyToken, async (req, res) => {
  try {
    if ((req.body as any).accessToken) {
      return res.status(400).json({ error: 'Do not send accessToken from frontend.' });
    }

    const userId = Number(req.body?.userId);
    const isVerified = Boolean(req.body?.isVerified);
    const scoreRaw = Number(req.body?.score ?? 0);
    const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, scoreRaw)) : 0;
    const credentialId = typeof req.body?.credentialId === 'string' ? req.body.credentialId : null;
    const privyUserId = typeof req.body?.privyUserId === 'string' ? req.body.privyUserId : null;
    const walletAddress = typeof req.body?.walletAddress === 'string' ? req.body.walletAddress : null;

    if (!Number.isFinite(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    if (!privyUserId || privyUserId !== req.privyUserId) {
      return res.status(403).json({ error: 'Privy user mismatch' });
    }

    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return res.status(400).json({ error: 'Invalid walletAddress' });
    }

    const existing = await db.select().from(creators).where(eq(creators.id, userId));
    if (!existing.length) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    if (
      !existing[0].walletAddress ||
      existing[0].walletAddress.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      return res.status(403).json({ error: 'Creator ownership mismatch' });
    }

    await db
      .update(creators)
      .set({
        isHumanityVerified: isVerified,
        humanityScore: score,
        humanityVerificationDate: isVerified ? new Date() : null,
        humanityCredentialId: credentialId || existing[0].humanityCredentialId || null,
      })
      .where(eq(creators.id, userId));

    return res.json({
      success: true,
      message: 'Humanity status persisted',
      status: {
        userId,
        isVerified,
        score,
        credentialId,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Failed to persist humanity status' });
  }
});

export default router;
