import { 
  users, creators, blockchainNetworks, 
  contentTracking, rewardDistributions, poolManagement, complianceRecords,
  fraudDetectionRules, fraudDetectionAlerts, creatorReputationScores, accessPatterns, referralRewards, domainVerifications,
  channelContentMappings, rewardPoolLimits, poolDrainProtection, rewardPoolSecurity,
  type User, type InsertUser, type Creator, type InsertCreator,
  type BlockchainNetwork, type InsertBlockchainNetwork, type ContentTracking, type InsertContentTracking,
  type RewardDistribution, type InsertRewardDistribution, type PoolManagement, type InsertPoolManagement,
  type ComplianceRecord, type InsertComplianceRecord,
  type FraudDetectionRule, type InsertFraudDetectionRule, type FraudDetectionAlert, type InsertFraudDetectionAlert,
  type CreatorReputationScore, type InsertCreatorReputationScore, type AccessPattern, type InsertAccessPattern,
  type ReferralReward, type InsertReferralReward, type DomainVerification, type InsertDomainVerification,
  type ChannelContentMapping, type InsertChannelContentMapping,
  type RewardPoolLimits, type InsertRewardPoolLimits, type PoolDrainProtection, type InsertPoolDrainProtection,
  type RewardPoolSecurity, type InsertRewardPoolSecurity
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte } from "drizzle-orm";

// IStorage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Blockchain network methods
  getAllBlockchainNetworks(): Promise<BlockchainNetwork[]>;
  getBlockchainNetwork(id: number): Promise<BlockchainNetwork | undefined>;
  getBlockchainNetworkByName(name: string): Promise<BlockchainNetwork | undefined>;
  createBlockchainNetwork(insertNetwork: InsertBlockchainNetwork): Promise<BlockchainNetwork>;
  updateBlockchainNetwork(name: string, updates: Partial<BlockchainNetwork>): Promise<void>;
  
  // Creator methods
  getAllCreators(): Promise<Creator[]>;
  createCreator(insertCreator: InsertCreator): Promise<Creator>;
  updateCreator(id: number, updates: Partial<Creator>): Promise<void>;
  getCreatorByReferralCode(referralCode: string): Promise<Creator | undefined>;
  getCreatorByWebsiteUrl(websiteUrl: string): Promise<Creator | undefined>;
  getCreatorByWalletAddress(walletAddress: string): Promise<Creator | undefined>;
  getCreatorsByWalletAddress(walletAddress: string): Promise<Creator[]>;
  generateReferralCode(): Promise<string>;
  
  // Referral methods
  createReferralReward(insertReward: InsertReferralReward): Promise<ReferralReward>;
  getReferralRewards(creatorId?: number): Promise<ReferralReward[]>;
  updateReferralReward(id: number, updates: Partial<ReferralReward>): Promise<void>;
  processReferralSignup(referralCode: string, newCreatorId: number): Promise<void>;
  
  // Content tracking methods
  createContentTracking(insertTracking: InsertContentTracking): Promise<ContentTracking>;
  getContentTrackingStats(): Promise<any>;
  
  // Reward distribution methods
  getRewardDistributions(): Promise<RewardDistribution[]>;
  createRewardDistribution(insertReward: InsertRewardDistribution): Promise<RewardDistribution>;
  
  // Pool management methods
  getPoolManagement(): Promise<PoolManagement[]>;
  
  // Compliance methods
  getComplianceRecords(): Promise<ComplianceRecord[]>;
  
  // Anti-fraud methods
  createFraudDetectionRule(insertRule: InsertFraudDetectionRule): Promise<FraudDetectionRule>;
  getActiveFraudDetectionRules(): Promise<FraudDetectionRule[]>;
  getFraudDetectionRuleByType(ruleType: string): Promise<FraudDetectionRule | undefined>;
  createFraudDetectionAlert(insertAlert: InsertFraudDetectionAlert): Promise<FraudDetectionAlert>;
  getFraudDetectionAlerts(creatorId?: number): Promise<FraudDetectionAlert[]>;
  getTotalFraudAlerts(): Promise<number>;
  getActiveFraudAlerts(): Promise<number>;
  createCreatorReputationScore(insertScore: InsertCreatorReputationScore): Promise<CreatorReputationScore>;
  getCreatorReputationScore(creatorId: number): Promise<CreatorReputationScore | undefined>;
  updateCreatorReputationScore(creatorId: number, updates: Partial<CreatorReputationScore>): Promise<void>;
  getBannedCreators(): Promise<Creator[]>;
  createAccessPattern(insertPattern: InsertAccessPattern): Promise<AccessPattern>;
  getAccessPatterns(creatorId: number): Promise<AccessPattern[]>;
  getAccessPatternByHashes(creatorId: number, domainHash: string, ipHash: string, aiType: string): Promise<AccessPattern | undefined>;
  updateAccessPattern(patternId: number, updates: Partial<AccessPattern>): Promise<void>;
  getCreatorRewardsFromDate(creatorId: number, fromDate: Date): Promise<RewardDistribution[]>;
  getCreator(creatorId: number): Promise<Creator | undefined>;
  
  // Domain verification methods
  createDomainVerification(insertVerification: InsertDomainVerification): Promise<DomainVerification>;
  getDomainVerification(id: number): Promise<DomainVerification | undefined>;
  getDomainVerificationByDomain(domain: string): Promise<DomainVerification | undefined>;
  getDomainVerificationsByCreator(creatorId: number): Promise<DomainVerification[]>;
  updateDomainVerification(id: number, updates: Partial<DomainVerification>): Promise<void>;
  
  // Channel content mapping methods
  createChannelContentMapping(insertMapping: InsertChannelContentMapping): Promise<ChannelContentMapping>;
  getChannelContentMappings(): Promise<ChannelContentMapping[]>;
  getChannelContentMappingsByCreator(creatorId: number): Promise<ChannelContentMapping[]>;
  updateChannelContentMapping(id: number, updates: Partial<ChannelContentMapping>): Promise<boolean>;

  // Pool drain protection methods
  createRewardPoolLimits(insertLimits: InsertRewardPoolLimits): Promise<RewardPoolLimits>;
  getRewardPoolLimits(): Promise<RewardPoolLimits[]>;
  getRewardPoolLimitsByWallet(walletAddress: string, timeframeType: string): Promise<RewardPoolLimits[]>;
  updateRewardPoolLimits(id: number, updates: Partial<RewardPoolLimits>): Promise<void>;
  
  createPoolDrainProtection(insertProtection: InsertPoolDrainProtection): Promise<PoolDrainProtection>;
  getPoolDrainProtection(): Promise<PoolDrainProtection[]>;
  getPoolDrainProtectionByType(protectionType: string): Promise<PoolDrainProtection[]>;
  updatePoolDrainProtection(id: number, updates: Partial<PoolDrainProtection>): Promise<void>;
  
  createRewardPoolSecurity(insertSecurity: InsertRewardPoolSecurity): Promise<RewardPoolSecurity>;
  getRewardPoolSecurity(): Promise<RewardPoolSecurity[]>;
  getRewardPoolSecurityByWallet(walletAddress: string): Promise<RewardPoolSecurity[]>;
  updateRewardPoolSecurity(id: number, updates: Partial<RewardPoolSecurity>): Promise<void>;
}

// rewrite MemStorage to DatabaseStorage
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Blockchain network methods
  async getAllBlockchainNetworks(): Promise<BlockchainNetwork[]> {
    return await db.select().from(blockchainNetworks);
  }

  async getBlockchainNetwork(id: number): Promise<BlockchainNetwork | undefined> {
    const [network] = await db.select().from(blockchainNetworks).where(eq(blockchainNetworks.id, id));
    return network || undefined;
  }

  async getBlockchainNetworkByName(name: string): Promise<BlockchainNetwork | undefined> {
    const [network] = await db.select().from(blockchainNetworks).where(eq(blockchainNetworks.name, name));
    return network || undefined;
  }

  async createBlockchainNetwork(insertNetwork: InsertBlockchainNetwork): Promise<BlockchainNetwork> {
    const [network] = await db
      .insert(blockchainNetworks)
      .values(insertNetwork)
      .returning();
    return network;
  }

  async updateBlockchainNetwork(name: string, updates: Partial<BlockchainNetwork>): Promise<void> {
    await db.update(blockchainNetworks).set(updates).where(eq(blockchainNetworks.name, name));
  }

  // Creator methods
  async getAllCreators(): Promise<Creator[]> {
    return await db.select().from(creators);
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    // Check wallet address registration limit (max 15 registrations per wallet)
    const existingCreators = await this.getCreatorsByWalletAddress((insertCreator as any).walletAddress);
    if (existingCreators.length >= 15) {
      throw new Error(`Maximum registration limit reached for this wallet address (15/15). Please use a different wallet address.`);
    }

    // Generate referral code if not provided
    const referralCode = (insertCreator as any).referralCode || await this.generateReferralCode();
    
    // Check if this is an early adopter (first 100 creators)
    const creatorCount = await db.select().from(creators);
    const isEarlyAdopter = creatorCount.length < 100;
    const earlyAdopterRank = isEarlyAdopter ? creatorCount.length + 1 : null;
    
    const [creator] = (await db
      .insert(creators)
      .values({
        ...insertCreator,
        referralCode,
        isEarlyAdopter,
        earlyAdopterRank,
      } as any)
      .returning()) as any;
    return creator;
  }

  async updateCreator(id: number, updates: Partial<Creator>): Promise<void> {
    await db.update(creators).set(updates).where(eq(creators.id, id));
  }

  async getCreatorByReferralCode(referralCode: string): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.referralCode, referralCode));
    return creator || undefined;
  }

  async getCreatorByWebsiteUrl(websiteUrl: string): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.websiteUrl, websiteUrl));
    return creator || undefined;
  }

  async getCreatorByWalletAddress(walletAddress: string): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.walletAddress, walletAddress));
    return creator || undefined;
  }

  async getCreatorsByWalletAddress(walletAddress: string): Promise<Creator[]> {
    return await db.select().from(creators).where(eq(creators.walletAddress, walletAddress));
  }

  async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let exists = true;
    
    while (exists) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existing = await this.getCreatorByReferralCode(code);
      exists = !!existing;
    }
    
    return code;
  }

  // Referral methods
  async createReferralReward(insertReward: InsertReferralReward): Promise<ReferralReward> {
    const [reward] = await db
      .insert(referralRewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async getReferralRewards(creatorId?: number): Promise<ReferralReward[]> {
    if (creatorId) {
      return await db.select().from(referralRewards).where(eq(referralRewards.referrerId, creatorId));
    }
    return await db.select().from(referralRewards);
  }

  async updateReferralReward(id: number, updates: Partial<ReferralReward>): Promise<void> {
    await db.update(referralRewards).set(updates).where(eq(referralRewards.id, id));
  }

  async processReferralSignup(referralCode: string, newCreatorId: number): Promise<void> {
    const referrer = await this.getCreatorByReferralCode(referralCode);
    if (!referrer) return;

    // Update referrer's referral count
    await this.updateCreator(referrer.id, {
      totalReferrals: (referrer.totalReferrals || 0) + 1,
    });

    // Update new creator's referredBy
    await this.updateCreator(newCreatorId, {
      referredBy: referrer.id,
    });

    // Create referral reward
    const baseReward = "5.0"; // Base referral reward
    const earlyAdopterBonus = referrer.isEarlyAdopter ? "2.0" : "0";
    const totalReward = (parseFloat(baseReward) + parseFloat(earlyAdopterBonus)).toString();

    await this.createReferralReward({
      referrerId: referrer.id,
      referredId: newCreatorId,
      rewardAmount: totalReward,
      rewardType: referrer.isEarlyAdopter ? "early_adopter_bonus" : "signup_bonus",
      status: "pending",
    });

    // Update referrer's total bonus
    const currentBonus = parseFloat(referrer.referralBonus || "0");
    const newBonus = (currentBonus + parseFloat(totalReward)).toString();
    
    await this.updateCreator(referrer.id, {
      referralBonus: newBonus,
    });
  }

  // Content tracking methods
  async createContentTracking(insertTracking: InsertContentTracking): Promise<ContentTracking> {
    const [tracking] = await db
      .insert(contentTracking)
      .values(insertTracking)
      .returning();
    return tracking;
  }

  async getContentTrackingStats(): Promise<any> {
    const stats = await db.select().from(contentTracking);
    return {
      totalRequests: stats.length,
      totalRewards: stats.reduce((sum, s) => sum + parseFloat(s.rewardAmount || "0"), 0),
      uniqueCreators: new Set(stats.map(s => s.creatorId)).size,
      averageUsage: stats.reduce((sum, s) => sum + (s.usageCount || 0), 0) / stats.length || 0
    };
  }

  // Reward distribution methods
  async getRewardDistributions(): Promise<RewardDistribution[]> {
    return await db.select().from(rewardDistributions);
  }

  async createRewardDistribution(insertReward: InsertRewardDistribution): Promise<RewardDistribution> {
    const [reward] = await db
      .insert(rewardDistributions)
      .values(insertReward)
      .returning();
    return reward;
  }

  // Pool management methods
  async getPoolManagement(): Promise<PoolManagement[]> {
    return await db.select().from(poolManagement);
  }

  // Compliance methods
  async getComplianceRecords(): Promise<ComplianceRecord[]> {
    return await db.select().from(complianceRecords);
  }

  // Anti-fraud methods
  async createFraudDetectionRule(insertRule: InsertFraudDetectionRule): Promise<FraudDetectionRule> {
    const [rule] = await db
      .insert(fraudDetectionRules)
      .values(insertRule)
      .returning();
    return rule;
  }

  async getActiveFraudDetectionRules(): Promise<FraudDetectionRule[]> {
    return await db.select().from(fraudDetectionRules).where(eq(fraudDetectionRules.isActive, true));
  }

  async getFraudDetectionRuleByType(ruleType: string): Promise<FraudDetectionRule | undefined> {
    const [rule] = await db.select().from(fraudDetectionRules).where(eq(fraudDetectionRules.ruleType, ruleType));
    return rule || undefined;
  }

  async createFraudDetectionAlert(insertAlert: InsertFraudDetectionAlert): Promise<FraudDetectionAlert> {
    const [alert] = await db
      .insert(fraudDetectionAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async getFraudDetectionAlerts(creatorId?: number): Promise<FraudDetectionAlert[]> {
    if (creatorId) {
      return await db.select().from(fraudDetectionAlerts).where(eq(fraudDetectionAlerts.creatorId, creatorId));
    }
    return await db.select().from(fraudDetectionAlerts);
  }

  async getTotalFraudAlerts(): Promise<number> {
    const alerts = await db.select().from(fraudDetectionAlerts);
    return alerts.length;
  }

  async getActiveFraudAlerts(): Promise<number> {
    const alerts = await db.select().from(fraudDetectionAlerts).where(eq(fraudDetectionAlerts.status, "active"));
    return alerts.length;
  }

  async createCreatorReputationScore(insertScore: InsertCreatorReputationScore): Promise<CreatorReputationScore> {
    const [score] = await db
      .insert(creatorReputationScores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getCreatorReputationScore(creatorId: number): Promise<CreatorReputationScore | undefined> {
    const [score] = await db.select().from(creatorReputationScores).where(eq(creatorReputationScores.creatorId, creatorId));
    return score || undefined;
  }

  async updateCreatorReputationScore(creatorId: number, updates: Partial<CreatorReputationScore>): Promise<void> {
    await db.update(creatorReputationScores).set(updates).where(eq(creatorReputationScores.creatorId, creatorId));
  }

  async getBannedCreators(): Promise<Creator[]> {
    const bannedScores = await db.select().from(creatorReputationScores).where(eq(creatorReputationScores.trustLevel, "banned"));
    const bannedCreatorIds = bannedScores.map(score => score.creatorId);
    const bannedCreators = [];
    
    for (const creatorId of bannedCreatorIds) {
      const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));
      if (creator) bannedCreators.push(creator);
    }
    
    return bannedCreators;
  }

  async createAccessPattern(insertPattern: InsertAccessPattern): Promise<AccessPattern> {
    const [pattern] = await db
      .insert(accessPatterns)
      .values(insertPattern)
      .returning();
    return pattern;
  }

  async getAccessPatterns(creatorId: number): Promise<AccessPattern[]> {
    return await db.select().from(accessPatterns).where(eq(accessPatterns.creatorId, creatorId));
  }

  async getAccessPatternByHashes(creatorId: number, domainHash: string, ipHash: string, aiType: string): Promise<AccessPattern | undefined> {
    const [pattern] = await db.select().from(accessPatterns)
      .where(and(
        eq(accessPatterns.creatorId, creatorId),
        eq(accessPatterns.domainHash, domainHash),
        eq(accessPatterns.ipHash, ipHash),
        eq(accessPatterns.aiType, aiType)
      ));
    return pattern || undefined;
  }

  async updateAccessPattern(patternId: number, updates: Partial<AccessPattern>): Promise<void> {
    await db.update(accessPatterns).set(updates).where(eq(accessPatterns.id, patternId));
  }

  async getCreatorRewardsFromDate(creatorId: number, fromDate: Date): Promise<RewardDistribution[]> {
    return await db.select().from(rewardDistributions)
      .where(and(
        eq(rewardDistributions.creatorId, creatorId),
        gte(rewardDistributions.createdAt, fromDate)
      ));
  }

  async getCreator(creatorId: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));
    return creator || undefined;
  }

  // Domain verification methods
  async createDomainVerification(insertVerification: InsertDomainVerification): Promise<DomainVerification> {
    const [verification] = await db
      .insert(domainVerifications)
      .values({
        ...insertVerification,
        verificationStatus: 'pending',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      })
      .returning();
    return verification;
  }

  async getDomainVerification(id: number): Promise<DomainVerification | undefined> {
    const [verification] = await db
      .select()
      .from(domainVerifications)
      .where(eq(domainVerifications.id, id));
    return verification || undefined;
  }

  async getDomainVerificationByDomain(domain: string): Promise<DomainVerification | undefined> {
    const [verification] = await db
      .select()
      .from(domainVerifications)
      .where(eq(domainVerifications.domain, domain));
    return verification || undefined;
  }

  async getDomainVerificationsByCreator(creatorId: number): Promise<DomainVerification[]> {
    return await db
      .select()
      .from(domainVerifications)
      .where(eq(domainVerifications.creatorId, creatorId));
  }

  async updateDomainVerification(id: number, updates: Partial<DomainVerification>): Promise<void> {
    await db
      .update(domainVerifications)
      .set(updates)
      .where(eq(domainVerifications.id, id));
  }

  // Channel content mapping methods
  async createChannelContentMapping(insertMapping: InsertChannelContentMapping): Promise<ChannelContentMapping> {
    const [mapping] = await db
      .insert(channelContentMappings)
      .values(insertMapping)
      .returning();
    return mapping;
  }

  async getChannelContentMappings(): Promise<ChannelContentMapping[]> {
    return await db
      .select()
      .from(channelContentMappings)
      .where(eq(channelContentMappings.isActive, true));
  }

  async getChannelContentMappingsByCreator(creatorId: number): Promise<ChannelContentMapping[]> {
    return await db
      .select()
      .from(channelContentMappings)
      .where(and(
        eq(channelContentMappings.creatorId, creatorId),
        eq(channelContentMappings.isActive, true)
      ));
  }

  async updateChannelContentMapping(id: number, updates: Partial<ChannelContentMapping>): Promise<boolean> {
    try {
      await db
        .update(channelContentMappings)
        .set(updates)
        .where(eq(channelContentMappings.id, id));
      return true;
    } catch (error) {
      console.error('Error updating channel content mapping:', error);
      return false;
    }
  }

  // Pool drain protection methods
  async createRewardPoolLimits(insertLimits: InsertRewardPoolLimits): Promise<RewardPoolLimits> {
    const [limits] = await db
      .insert(rewardPoolLimits)
      .values(insertLimits)
      .returning();
    return limits;
  }

  async getRewardPoolLimits(): Promise<RewardPoolLimits[]> {
    return await db.select().from(rewardPoolLimits);
  }

  async getRewardPoolLimitsByWallet(walletAddress: string, timeframeType: string): Promise<RewardPoolLimits[]> {
    return await db
      .select()
      .from(rewardPoolLimits)
      .where(and(
        eq(rewardPoolLimits.walletAddress, walletAddress),
        eq(rewardPoolLimits.timeframeType, timeframeType),
        eq(rewardPoolLimits.isActive, true)
      ));
  }

  async updateRewardPoolLimits(id: number, updates: Partial<RewardPoolLimits>): Promise<void> {
    await db
      .update(rewardPoolLimits)
      .set(updates)
      .where(eq(rewardPoolLimits.id, id));
  }

  async createPoolDrainProtection(insertProtection: InsertPoolDrainProtection): Promise<PoolDrainProtection> {
    const [protection] = await db
      .insert(poolDrainProtection)
      .values(insertProtection)
      .returning();
    return protection;
  }

  async getPoolDrainProtection(): Promise<PoolDrainProtection[]> {
    return await db.select().from(poolDrainProtection);
  }

  async getPoolDrainProtectionByType(protectionType: string): Promise<PoolDrainProtection[]> {
    return await db
      .select()
      .from(poolDrainProtection)
      .where(eq(poolDrainProtection.timeframe, protectionType));
  }

  async updatePoolDrainProtection(id: number, updates: Partial<PoolDrainProtection>): Promise<void> {
    await db
      .update(poolDrainProtection)
      .set(updates)
      .where(eq(poolDrainProtection.id, id));
  }

  async createRewardPoolSecurity(insertSecurity: InsertRewardPoolSecurity): Promise<RewardPoolSecurity> {
    const [security] = await db
      .insert(rewardPoolSecurity)
      .values(insertSecurity)
      .returning();
    return security;
  }

  async getRewardPoolSecurity(): Promise<RewardPoolSecurity[]> {
    return await db.select().from(rewardPoolSecurity);
  }

  async getRewardPoolSecurityByWallet(walletAddress: string): Promise<RewardPoolSecurity[]> {
    return await db
      .select()
      .from(rewardPoolSecurity)
      .where(eq(rewardPoolSecurity.walletAddress, walletAddress));
  }

  async updateRewardPoolSecurity(id: number, updates: Partial<RewardPoolSecurity>): Promise<void> {
    await db
      .update(rewardPoolSecurity)
      .set(updates)
      .where(eq(rewardPoolSecurity.id, id));
  }
}

export const storage = new DatabaseStorage();