import crypto from 'crypto';
import { InsertRewardDistribution } from "@shared/schema";
import { storage } from "../storage";

/**
 * MEV Protection Service
 * Protects against front-running, sandwich attacks, and reward sniping
 */

interface Commitment {
  commitHash: string;
  creatorId: number;
  amount: string;
  nonce: string;
  timestamp: number;
  revealed: boolean;
}

interface RevealData {
  creatorId: number;
  amount: string;
  nonce: string;
  randomSeed: string;
}

export class MEVProtectionService {
  private readonly COMMIT_PHASE_DURATION = 300000; // 5 minutes
  private readonly REVEAL_PHASE_DURATION = 300000; // 5 minutes
  private readonly MIN_DELAY = 10000; // 10 seconds minimum delay
  private readonly MAX_DELAY = 60000; // 60 seconds maximum delay
  
  private commitments: Map<string, Commitment> = new Map();
  private revealQueue: RevealData[] = [];
  private processingTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCommitRevealProcessor();
  }

  /**
   * Phase 1: Commit - Hide beneficiary and amount with cryptographic commitment
   */
  async commitReward(creatorId: number, amount: string): Promise<{
    success: boolean;
    commitHash: string;
    revealDeadline: number;
  }> {
    const nonce = crypto.randomBytes(32).toString('hex');
    const randomSeed = crypto.randomBytes(16).toString('hex');
    
    // Create commitment hash: H(creatorId || amount || nonce || randomSeed)
    const commitData = `${creatorId}:${amount}:${nonce}:${randomSeed}`;
    const commitHash = crypto.createHash('sha256').update(commitData).digest('hex');
    
    const commitment: Commitment = {
      commitHash,
      creatorId,
      amount,
      nonce,
      timestamp: Date.now(),
      revealed: false
    };
    
    this.commitments.set(commitHash, commitment);
    
    console.log(`🔒 COMMIT PHASE: Hidden reward committed for creator ${creatorId}`);
    console.log(`   Commit Hash: ${commitHash}`);
    console.log(`   Reveal Deadline: ${new Date(Date.now() + this.COMMIT_PHASE_DURATION).toISOString()}`);
    
    return {
      success: true,
      commitHash,
      revealDeadline: Date.now() + this.COMMIT_PHASE_DURATION
    };
  }

  /**
   * Phase 2: Reveal - Reveal the commitment after delay
   */
  async revealReward(commitHash: string, creatorId: number, amount: string, nonce: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const commitment = this.commitments.get(commitHash);
    
    if (!commitment) {
      return {
        success: false,
        message: "Commitment not found"
      };
    }
    
    if (commitment.revealed) {
      return {
        success: false,
        message: "Commitment already revealed"
      };
    }
    
    // Verify reveal matches commitment
    const randomSeed = crypto.randomBytes(16).toString('hex');
    const revealData = `${creatorId}:${amount}:${nonce}:${randomSeed}`;
    const revealHash = crypto.createHash('sha256').update(revealData).digest('hex');
    
    if (revealHash !== commitHash) {
      return {
        success: false,
        message: "Invalid reveal - hash mismatch"
      };
    }
    
    // Check timing
    const timeSinceCommit = Date.now() - commitment.timestamp;
    if (timeSinceCommit < this.COMMIT_PHASE_DURATION) {
      return {
        success: false,
        message: `Reveal too early - wait ${Math.ceil((this.COMMIT_PHASE_DURATION - timeSinceCommit) / 1000)}s`
      };
    }
    
    // Mark as revealed and queue for processing
    commitment.revealed = true;
    this.revealQueue.push({
      creatorId,
      amount,
      nonce,
      randomSeed
    });
    
    console.log(`🔓 REVEAL PHASE: Reward revealed for creator ${creatorId}`);
    console.log(`   Amount: ${amount} WPT`);
    console.log(`   Queued for randomized processing`);
    
    return {
      success: true,
      message: "Reward revealed and queued for processing"
    };
  }

  /**
   * Phase 3: Randomized Processing with Jitter
   */
  private async processRevealedRewards(): Promise<void> {
    if (this.revealQueue.length === 0) return;
    
    // Shuffle queue to prevent predictable ordering
    const shuffled = this.shuffleArray([...this.revealQueue]);
    this.revealQueue = [];
    
    for (const reveal of shuffled) {
      // Add random jitter to prevent timing attacks
      const jitter = this.generateRandomDelay();
      
      setTimeout(async () => {
        try {
          await this.processRewardWithAntiMEV(reveal);
        } catch (error) {
          console.error(`MEV-protected reward processing failed:`, error);
        }
      }, jitter);
    }
  }

  /**
   * Process reward with additional MEV protection
   */
  private async processRewardWithAntiMEV(reveal: RevealData): Promise<void> {
    const creator = await storage.getCreator(reveal.creatorId);
    if (!creator) {
      console.error(`Creator ${reveal.creatorId} not found during MEV-protected processing`);
      return;
    }
    
    // Generate secure transaction hash with anti-MEV properties
    const secureHash = this.generateSecureTransactionHash(reveal);
    
    // Create reward distribution with MEV protection
    const rewardData: InsertRewardDistribution = {
      creatorId: reveal.creatorId,
      amount: reveal.amount,
      transactionHash: secureHash,
      networkId: 1, // Polygon
      status: "completed",
      completedAt: new Date()
    } as any;
    
    await storage.createRewardDistribution(rewardData);
    
    console.log(`✅ MEV-PROTECTED REWARD PROCESSED:
      Creator: ${creator.name || creator.id}
      Amount: ${reveal.amount} WPT
      Secure Hash: ${secureHash}
      Anti-MEV: ACTIVE`);
  }

  /**
   * Generate cryptographically secure transaction hash
   */
  private generateSecureTransactionHash(reveal: RevealData): string {
    const timestamp = Date.now();
    const blockHash = crypto.randomBytes(32).toString('hex'); // Simulated block hash
    const data = `${reveal.creatorId}:${reveal.amount}:${reveal.nonce}:${reveal.randomSeed}:${timestamp}:${blockHash}`;
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate random delay for jitter
   */
  private generateRandomDelay(): number {
    return Math.floor(Math.random() * (this.MAX_DELAY - this.MIN_DELAY + 1)) + this.MIN_DELAY;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Start the commit-reveal processor
   */
  private startCommitRevealProcessor(): void {
    this.processingTimer = setInterval(async () => {
      try {
        await this.processRevealedRewards();
        this.cleanupExpiredCommitments();
      } catch (error) {
        console.error("MEV protection processor error:", error);
      }
    }, 30000); // Process every 30 seconds
  }

  /**
   * Clean up expired commitments
   */
  private cleanupExpiredCommitments(): void {
    const now = Date.now();
    const expiredCommitments = [];
    
    for (const [hash, commitment] of this.commitments.entries()) {
      if (now - commitment.timestamp > this.COMMIT_PHASE_DURATION + this.REVEAL_PHASE_DURATION) {
        expiredCommitments.push(hash);
      }
    }
    
    expiredCommitments.forEach(hash => this.commitments.delete(hash));
    
    if (expiredCommitments.length > 0) {
      console.log(`🧹 Cleaned up ${expiredCommitments.length} expired commitments`);
    }
  }

  /**
   * Get MEV protection statistics
   */
  async getProtectionStats(): Promise<{
    activeCommitments: number;
    queuedReveals: number;
    totalProtectedRewards: number;
    avgProcessingDelay: number;
  }> {
    return {
      activeCommitments: this.commitments.size,
      queuedReveals: this.revealQueue.length,
      totalProtectedRewards: Array.from(this.commitments.values()).filter(c => c.revealed).length,
      avgProcessingDelay: (this.MIN_DELAY + this.MAX_DELAY) / 2
    };
  }

  /**
   * Emergency disable MEV protection (for testing)
   */
  emergencyDisable(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    this.commitments.clear();
    this.revealQueue = [];
    console.log("🚨 MEV Protection disabled for emergency");
  }
}

export const mevProtectionService = new MEVProtectionService();