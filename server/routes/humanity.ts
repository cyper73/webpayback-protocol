import { Router } from "express";
import { humanityService } from "../services/humanityProtocol";
import { z } from "zod";
import * as jose from 'jose';

const router = Router();

// Privy App ID from environment or fallback
const PRIVY_APP_ID = process.env.VITE_PRIVY_APP_ID || 'cmn0xgyny01ra0ciijd8kc2kk';
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

// Schema for verification request
const verifySchema = z.object({
  userId: z.number(),
  walletAddress: z.string().optional(),
});

/**
 * GET /api/humanity/status/:userId
 * Get the current humanity verification status for a user
 */
router.get("/status/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const status = await humanityService.getStatus(userId);
    res.json(status);
  } catch (error) {
    console.error("Error getting humanity status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/humanity/auth-url/:userId
 * Generates the OAuth URL to redirect the user to Humanity Protocol
 */
router.get("/auth-url/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // In mock mode, just return a mock URL
    if (process.env.MOCK_HUMANITY === 'true') {
        return res.json({ 
            url: `http://localhost:5000/api/humanity/callback?code=mock_code&state=${Buffer.from(JSON.stringify({ userId })).toString('base64')}`,
            mock: true 
        });
    }

    const { url, codeVerifier, state } = humanityService.getAuthUrl(userId);
    
    // Store codeVerifier in session or return it to frontend to store in localStorage
    // For this implementation, we'll return it to the frontend
    res.json({ url, codeVerifier, state });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate authorization URL" });
  }
});

/**
 * GET /api/humanity/callback
 * Handles the OAuth redirect from Humanity Protocol
 */
router.get("/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
        console.error("Humanity Auth Error:", error);
        return res.redirect('/creators?humanity_error=' + error);
    }

    if (!code || typeof code !== 'string') {
        return res.status(400).send("Missing authorization code");
    }

    // Decode state to get userId
    let userId: string | number;
    try {
        const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
        userId = decodedState.userId;
    } catch (e) {
        return res.status(400).send("Invalid state parameter");
    }

    // Get the codeVerifier from the frontend (passed via cookie/session in a real app)
    // For this prototype, if it's a mock, we bypass it
    if (process.env.MOCK_HUMANITY === 'true') {
        if (userId === "login") {
            return res.redirect('/login?humanity_success=true&mock=true');
        }
        // Mock successful verification
        await humanityService.getStatus(userId as number); // Just to check DB
        return res.redirect('/creators?humanity_success=true');
    }

    if (userId === "login") {
        return res.redirect(`/login?humanity_code=${code}&humanity_state=${state}`);
    }

    // Instead of showing a blank page, we redirect back to the creator portal
    // passing the authorization code in the URL so the frontend can complete the verification
    return res.redirect(`/creators?humanity_code=${code}&humanity_state=${state}`);

  } catch (error) {
    console.error("Callback error:", error);
    res.redirect('/creators?humanity_error=verification_failed');
  }
});

/**
 * POST /api/humanity/login
 * Handle Humanity First login/registration flow
 */
router.post("/login", async (req, res) => {
  try {
    const { code, codeVerifier } = req.body;

    if (process.env.MOCK_HUMANITY === 'true') {
        // Create a mock user
        const { storage } = await import('../storage');
        const mockWallet = '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0');
        
        const newCreator = await storage.createCreator({
            websiteUrl: 'pending',
            walletAddress: mockWallet,
            contentCategory: 'other',
            isWalletVerified: true,
            twoFactorEnabled: false,
            humanityScore: 85,
            isHumanityVerified: true,
            humanityVerificationDate: new Date()
        });

        return res.json({ 
            success: true, 
            message: "Mock login successful!", 
            creator: newCreator,
            sessionToken: 'mock-session-token'
        });
    }

    if (!code || !codeVerifier) {
        return res.status(400).json({ error: "Missing OAuth parameters" });
    }

    // 1. Exchange code and verify humanity
    // Use a special user ID or handle internally in handleCallback if user doesn't exist yet
    // Wait, handleCallback expects a userId (number). We need a variant for login.
    const result = await humanityService.handleLoginCallback(code, codeVerifier);
    
    if (!result.isVerified) {
        return res.status(400).json({ 
            success: false, 
            message: "Humanity verification failed." 
        });
    }

    // 2. Find or create user based on Humanity credentials
    const { storage } = await import('../storage');
    // Using email or a unique identifier from Humanity. 
    // Assuming result.credentialId or result.email is available.
    const humanityId = result.credentialId || `human_${Date.now()}`;
    
    // In a real app, we'd look up by humanityId. Here we'll just create a new one if it's a new login
    // or look up if we have a way. For simplicity, we create a new wallet via Privy API
    
    const { PrivyClient } = await import('@privy-io/node');
    const privy = new PrivyClient({
        appId: process.env.VITE_PRIVY_APP_ID || '',
        appSecret: process.env.PRIVY_APP_SECRET || ''
    });

    // Create a Privy Server Wallet for this user
    let walletAddress = "";
    try {
        const wallet = await privy.wallets().create({ chainType: 'ethereum' });
        walletAddress = wallet.address;
    } catch (e) {
        console.error("Failed to create Privy wallet:", e);
        // Fallback for dev
        walletAddress = '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0');
    }

    const newCreator = await storage.createCreator({
        websiteUrl: 'pending',
        walletAddress: walletAddress,
        contentCategory: 'other',
        isWalletVerified: true, // We trust Privy server wallets
        twoFactorEnabled: false,
        humanityScore: result.score,
        isHumanityVerified: true,
        humanityVerificationDate: new Date()
    });

    res.json({ 
        success: true, 
        message: "User authenticated and wallet created!", 
        creator: newCreator,
        sessionToken: 'custom-auth-token' // In production, generate a real JWT
    });
  } catch (error) {
    console.error("Login error detail:", error);
    res.status(500).json({ error: "Login process failed", details: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * POST /api/humanity/verify

 * Trigger a new verification check using the code from the callback
 */
router.post("/verify", verifyPrivyToken, async (req, res) => {
  try {
    const { userId, code, codeVerifier } = req.body;
    
    // Mock mode bypass
    if (process.env.MOCK_HUMANITY === 'true') {
        const status = await humanityService.getStatus(userId);
        return res.json({ 
            success: true, 
            message: "Mock verification successful!", 
            score: status.score || 85
        });
    }

    if (!code || !codeVerifier) {
        return res.status(400).json({ error: "Missing OAuth parameters" });
    }

    const result = await humanityService.handleCallback(code, codeVerifier, userId);
    
    if (result.isVerified) {
        res.json({ 
            success: true, 
            message: "User verified as human!", 
            score: result.score 
        });
    } else {
        res.status(400).json({ 
            success: false, 
            message: "Verification failed or incomplete." 
        });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
    }
    console.error("Verification error detail:", error);
    res.status(500).json({ error: "Verification process failed", details: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * POST /api/humanity/rewards/calculate
 * Calculate potential rewards with humanity multiplier
 */
router.post("/rewards/calculate", async (req, res) => {
    try {
        const { userId, baseAmount } = req.body;
        
        if (!userId || !baseAmount) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        const result = await humanityService.distributeRewards(userId, baseAmount, 1.0); // Engagement score defaults to 1.0 for calculation
        res.json(result);
    } catch (error) {
        console.error("Reward calculation error:", error);
        res.status(500).json({ error: "Calculation failed" });
    }
});

export default router;
