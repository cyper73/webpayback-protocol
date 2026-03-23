import { Router } from "express";
import { humanityService } from "../services/humanityProtocol";
import { z } from "zod";

const router = Router();

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
    
    // In mock mode without SDK, just return a mock URL
    if (!humanityService.sdk && process.env.MOCK_HUMANITY === 'true') {
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
    let userId: number;
    try {
        const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
        userId = parseInt(decodedState.userId);
    } catch (e) {
        return res.status(400).send("Invalid state parameter");
    }

    // Get the codeVerifier from the frontend (passed via cookie/session in a real app)
    // For this prototype, if it's a mock, we bypass it
    if (!humanityService.sdk && process.env.MOCK_HUMANITY === 'true') {
        // Mock successful verification
        await humanityService.getStatus(userId); // Just to check DB
        return res.redirect('/creators?humanity_success=true');
    }

    // Note: In a full production app, the `codeVerifier` must be retrieved from the user's session
    // For now, this endpoint expects the frontend to handle the callback and POST it to a different endpoint
    res.send("Please close this window and return to the application.");

  } catch (error) {
    console.error("Callback error:", error);
    res.redirect('/creators?humanity_error=verification_failed');
  }
});

/**
 * POST /api/humanity/verify
 * Trigger a new verification check using the code from the callback
 */
router.post("/verify", async (req, res) => {
  try {
    const { userId, code, codeVerifier } = req.body;
    
    // Mock mode bypass
    if (!humanityService.sdk && process.env.MOCK_HUMANITY === 'true') {
        const status = await humanityService.getStatus(userId);
        return res.json({ 
            success: true, 
            message: "Mock verification successful!", 
            score: status.score 
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
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification process failed" });
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
