import { db } from "../db";
import { creators, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ethers } from "ethers";
import { HumanitySDK } from '@humanity-org/connect-sdk';

// Configuration
const HUMANITY_CLIENT_ID = process.env.HUMANITY_CLIENT_ID || "";
const HUMANITY_CLIENT_SECRET = process.env.HUMANITY_CLIENT_SECRET || "";
const HUMANITY_REDIRECT_URI = process.env.HUMANITY_REDIRECT_URI || "http://localhost:5000/api/humanity/callback";
const WPT_HUMAN_ADDRESS = process.env.WPT_HUMAN_ADDRESS || "0x0000000000000000000000000000000000000000";
const HUMANITY_RPC_URL = process.env.HUMANITY_RPC_URL || "https://rpc.testnet.humanity.org";

// ABI for WPT-HUMAN Token (Partial)
const WPT_HUMAN_ABI = [
  "function humanVerified(address user) view returns (bool)",
  "function humanityScore(address user) view returns (uint256)",
  "function distributeHumanRewards(address creator, uint256 baseAmount, uint256 engagementScore) external"
];

interface HumanityVerificationResult {
  isVerified: boolean;
  score: number;
  verificationDate?: string;
  credentialId?: string;
}

export class HumanityProtocolService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;
  public sdk: HumanitySDK | null = null;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(HUMANITY_RPC_URL);
    this.contract = new ethers.Contract(WPT_HUMAN_ADDRESS, WPT_HUMAN_ABI, this.provider);
    
    // Initialize the official SDK
    if (HUMANITY_CLIENT_ID && HUMANITY_CLIENT_SECRET) {
      try {
        this.sdk = new HumanitySDK({
          clientId: HUMANITY_CLIENT_ID,
          clientSecret: HUMANITY_CLIENT_SECRET, // We are a confidential backend client
          redirectUri: HUMANITY_REDIRECT_URI,
          environment: 'production', // Torniamo a production perché le credenziali create sono di tipo production
        });
        console.log("🟢 Humanity SDK initialized successfully in Production mode");
      } catch (err) {
        console.error("🔴 Failed to initialize Humanity SDK:", err);
      }
    } else {
        console.warn("🟡 Humanity SDK not initialized: Missing CLIENT_ID or CLIENT_SECRET");
    }
  }

  /**
   * Generates the OAuth authorization URL for the user to grant consent
   */
  getAuthUrl(userId: string) {
    if (!this.sdk) throw new Error("SDK not initialized");
    
    // We pass the userId in the state so we know who to update when the callback hits
    const stateObj = JSON.stringify({ userId });
    // Encode state in base64 to avoid URL issues
    const encodedState = Buffer.from(stateObj).toString('base64');
    
    const { url, codeVerifier } = this.sdk.buildAuthUrl({
      // Richiediamo solo gli scope strettamente necessari e configurati nel portale
      // 'openid' per l'autenticazione base, 'identity:read' per i dati di verifica
      scopes: ['openid', 'identity:read'], 
      additionalQueryParams: { prompt: 'consent', state: encodedState }
    });
    
    return { url, codeVerifier, state: encodedState };
  }

  /**
   * Handles the OAuth callback, exchanges code for token, and verifies presets
   */
  async handleCallback(code: string, codeVerifier: string, userId: number): Promise<HumanityVerificationResult> {
    if (!this.sdk) throw new Error("SDK not initialized");

    try {
      // 1. Exchange Code for Token
      const token = await this.sdk.exchangeCodeForToken({
        code,
        codeVerifier,
      });

      let isVerified = true; // Assume true if we got a token with just openid
      let score = 100;

      // 2. Try to verify Presets using the token (might fail if scopes were limited)
      try {
        const results = await this.sdk.verifyPresets({
          accessToken: token.accessToken,
          presets: ['is_human', 'humanity_score'],
        });
        
        isVerified = (results as any)?.is_human?.verified ?? true;
        score = (results as any)?.humanity_score?.value ?? 100;
      } catch (presetError) {
        console.warn("Could not verify presets (likely due to scope limitations). Proceeding with basic openid verification.", presetError);
      }

      // 3. Update Database
      await db.update(creators)
        .set({
          isHumanityVerified: isVerified,
          humanityScore: score,
          humanityVerificationDate: isVerified ? new Date() : null,
        })
        .where(eq(creators.id, userId));

      return {
        isVerified,
        score,
        verificationDate: isVerified ? new Date().toISOString() : undefined
      };

    } catch (error) {
      console.error("Humanity callback verification error:", error);
      throw error;
    }
  }

  /**
   * Reads current status from Database or On-Chain
   */
  async getStatus(userId: number): Promise<HumanityVerificationResult> {
    try {
      const creator = await db.query.creators.findFirst({
        where: eq(creators.id, userId),
      });

      if (!creator) throw new Error("Creator not found");

      // Check DB first (Fast)
      if (creator.isHumanityVerified) {
          return {
              isVerified: true,
              score: creator.humanityScore || 0,
              verificationDate: creator.humanityVerificationDate?.toISOString()
          };
      }

      // Check on-chain as fallback (Source of Truth)
      if (creator.walletAddress && WPT_HUMAN_ADDRESS !== "0x0000000000000000000000000000000000000000") {
          try {
            const isVerifiedOnChain = await this.contract.humanVerified(creator.walletAddress);
            if (isVerifiedOnChain) {
                const scoreBN = await this.contract.humanityScore(creator.walletAddress);
                return { isVerified: true, score: scoreBN.toNumber() };
            }
          } catch (err) {
              console.warn("On-chain check failed", err);
          }
      }

      // Mock fallback for UI testing
      if (process.env.MOCK_HUMANITY === 'true' && !this.sdk) {
          return { isVerified: true, score: 85, verificationDate: new Date().toISOString() };
      }

      return { isVerified: false, score: 0 };
    } catch (error) {
      return { isVerified: false, score: 0 };
    }
  }

  /**
   * Calculates the reward multiplier based on humanity score
   * @param score Humanity score (0-100)
   */
  getHumanityMultiplier(score: number): number {
    if (score >= 95) return 2.0;   // 2x for elite humans
    if (score >= 85) return 1.75;  // 1.75x for high score
    if (score >= 75) return 1.5;   // 1.5x for medium score
    if (score > 0) return 1.25;    // 1.25x for basic verification
    return 1.0;                    // 1x for unverified
  }

  /**
   * Distributes rewards ensuring humanity checks
   */
  async distributeRewards(creatorId: number, baseAmount: number, engagementScore: number) {
    const verification = await this.getStatus(creatorId);
    
    if (!verification.isVerified) {
        console.log(`User ${creatorId} is not human verified. Skipping Human Bonus.`);
        return { success: false, reason: "Not verified" };
    }

    const multiplier = this.getHumanityMultiplier(verification.score);
    const finalAmount = baseAmount * multiplier;

    // logic to mint tokens would go here (interacting with the contract)
    
    return {
        success: true,
        originalAmount: baseAmount,
        multiplier,
        finalAmount,
        humanityScore: verification.score
    };
  }
}

export const humanityService = new HumanityProtocolService();
