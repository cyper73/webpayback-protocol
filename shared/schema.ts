import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  websiteUrl: text("website_url").notNull(),
  walletAddress: text("wallet_address").notNull(),
  contentCategory: text("content_category").notNull(),
  isVerified: boolean("is_verified").default(false),
  isEarlyAdopter: boolean("is_early_adopter").default(false),
  earlyAdopterRank: integer("early_adopter_rank"),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => creators.id),
  totalReferrals: integer("total_referrals").default(0),
  referralBonus: decimal("referral_bonus", { precision: 18, scale: 8 }).default("0"),
  // Channel-level monitoring fields
  platformType: text("platform_type").default("single_page"), // single_page, youtube_channel, instagram_profile, etc.
  channelId: text("channel_id"), // YouTube channel ID, Instagram username, etc.
  channelName: text("channel_name"), // Display name of the channel
  channelVerificationUrl: text("channel_verification_url"), // URL used for verification
  monitoringScope: text("monitoring_scope").default("single_url"), // single_url, full_channel, domain_wide
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table to track channel content mappings
export const channelContentMappings = pgTable("channel_content_mappings", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  originalUrl: text("original_url").notNull(), // The specific URL that was verified
  channelBaseUrl: text("channel_base_url").notNull(), // The base channel URL
  urlPattern: text("url_pattern").notNull(), // Pattern to match all URLs in this channel
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blockchainNetworks = pgTable("blockchain_networks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chainId: integer("chain_id").notNull(),
  rpcUrl: text("rpc_url").notNull(),
  contractAddress: text("contract_address"),
  deploymentStatus: text("deployment_status").default("pending"), // pending, deploying, deployed, failed
  gasUsed: text("gas_used"),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // webpayback, autoregolator, poolagent, transparentagent
  status: text("status").default("active"), // active, inactive, processing
  expertiseLevel: integer("expertise_level").default(280),
  lastActivity: timestamp("last_activity").defaultNow(),
  metrics: jsonb("metrics").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentCommunications = pgTable("agent_communications", {
  id: serial("id").primaryKey(),
  fromAgentId: integer("from_agent_id").references(() => aiAgents.id),
  toAgentId: integer("to_agent_id").references(() => aiAgents.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("question"), // question, answer, notification
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const contentTracking = pgTable("content_tracking", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  contentHash: text("content_hash").notNull(),
  accessType: text("access_type").default("ai_access"), // ai_access, manual_access, crawler_access
  aiModel: text("ai_model"), // claude, gpt, gemini, bot
  detectionConfidence: decimal("detection_confidence", { precision: 3, scale: 2 }),
  usageCount: integer("usage_count").default(1),
  rewardAmount: decimal("reward_amount", { precision: 18, scale: 8 }).default("0"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

export const rewardDistributions = pgTable("reward_distributions", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionHash: text("transaction_hash"),
  networkId: integer("network_id").references(() => blockchainNetworks.id),
  status: text("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const poolManagement = pgTable("pool_management", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => blockchainNetworks.id),
  poolAddress: text("pool_address").notNull(),
  token0: text("token0").notNull(), // POL, WMATIC
  token1: text("token1").notNull(), // WPT
  totalStaked: decimal("total_staked", { precision: 18, scale: 8 }).default("0"),
  totalRewards: decimal("total_rewards", { precision: 18, scale: 8 }).default("0"),
  apy: decimal("apy", { precision: 5, scale: 2 }).default("0"),
  tradingFeeApy: decimal("trading_fee_apy", { precision: 5, scale: 2 }).default("0"),
  stakingApy: decimal("staking_apy", { precision: 5, scale: 2 }).default("0"),
  stakersCount: integer("stakers_count").default(0),
  totalValueLocked: decimal("total_value_locked", { precision: 18, scale: 8 }).default("0"),
  volume24h: decimal("volume_24h", { precision: 18, scale: 8 }).default("0"),
  feesCollected24h: decimal("fees_collected_24h", { precision: 18, scale: 8 }).default("0"),
  isActive: boolean("is_active").default(true),
  lastUpdate: timestamp("last_update").defaultNow(),
});

// New table for POL staking integration
export const polStakingVaults = pgTable("pol_staking_vaults", {
  id: serial("id").primaryKey(),
  vaultAddress: text("vault_address").notNull(),
  validatorAddress: text("validator_address").notNull(),
  validatorName: text("validator_name").notNull(),
  commission: decimal("commission", { precision: 3, scale: 2 }).default("0"),
  totalDelegated: decimal("total_delegated", { precision: 18, scale: 8 }).default("0"),
  rewards: decimal("rewards", { precision: 18, scale: 8 }).default("0"),
  apy: decimal("apy", { precision: 5, scale: 2 }).default("0"),
  uptime: decimal("uptime", { precision: 5, scale: 2 }).default("0"),
  lastRewardClaim: timestamp("last_reward_claim"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table for dual rewards tracking
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  poolId: integer("pool_id").references(() => poolManagement.id),
  vaultId: integer("vault_id").references(() => polStakingVaults.id),
  lpTokensStaked: decimal("lp_tokens_staked", { precision: 18, scale: 8 }).default("0"),
  polStaked: decimal("pol_staked", { precision: 18, scale: 8 }).default("0"),
  tradingFeesEarned: decimal("trading_fees_earned", { precision: 18, scale: 8 }).default("0"),
  stakingRewardsEarned: decimal("staking_rewards_earned", { precision: 18, scale: 8 }).default("0"),
  totalRewardsEarned: decimal("total_rewards_earned", { precision: 18, scale: 8 }).default("0"),
  lastClaim: timestamp("last_claim"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceRecords = pgTable("compliance_records", {
  id: serial("id").primaryKey(),
  auditType: text("audit_type").notNull(),
  status: text("status").notNull(), // compliant, non_compliant, under_review
  score: decimal("score", { precision: 5, scale: 2 }),
  details: jsonb("details").default({}),
  auditedAt: timestamp("audited_at").defaultNow(),
  auditedBy: text("audited_by"),
});

// Reward Pool Protection Tables
export const rewardPoolLimits = pgTable("reward_pool_limits", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  timeframeType: text("timeframe_type").notNull(), // hourly, daily, weekly, monthly
  maxRewardAmount: decimal("max_reward_amount", { precision: 18, scale: 8 }).notNull(),
  currentPeriodAmount: decimal("current_period_amount", { precision: 18, scale: 8 }).default("0"),
  periodStart: timestamp("period_start").defaultNow(),
  periodEnd: timestamp("period_end").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const poolDrainProtection = pgTable("pool_drain_protection", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  timeframe: text("timeframe").notNull(), // hourly, daily, weekly, monthly
  amountDistributed: decimal("amount_distributed", { precision: 18, scale: 8 }).default("0"),
  maxRewardAmount: decimal("max_reward_amount", { precision: 18, scale: 8 }).default("100.0"),
  lastDistributionAt: timestamp("last_distribution_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rewardPoolSecurity = pgTable("reward_pool_security", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  suspiciousActivity: text("suspicious_activity").notNull(), // high_frequency, large_amounts, exploit_attempt
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(),
  alertLevel: text("alert_level").notNull(), // low, medium, high, critical
  actionTaken: text("action_taken"), // throttled, blocked, flagged, investigated
  evidence: jsonb("evidence").default({}),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fake Creator Detection Schema
export const fakeCreatorDetection = pgTable("fake_creator_detection", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  suspiciousUrl: text("suspicious_url").notNull(),
  suspiciousType: text("suspicious_type").notNull(), // pattern_match, fuzzy_match, suspicious_chars
  similarityScore: decimal("similarity_score", { precision: 5, scale: 2 }).notNull(),
  alertLevel: text("alert_level").notNull(), // low, medium, high, critical
  actionTaken: text("action_taken").notNull(), // none, monitored, flagged, blocked
  isResolved: boolean("is_resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  evidence: text("evidence"),
});

// Anti-fraud system tables
export const fraudDetectionRules = pgTable("fraud_detection_rules", {
  id: serial("id").primaryKey(),
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull(), // domain_limit, ip_limit, pattern_analysis, threshold_check, reputation_check
  parameters: jsonb("parameters").default({}),
  isActive: boolean("is_active").default(true),
  severity: text("severity").default("medium"), // low, medium, high, critical
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fraudDetectionAlerts = pgTable("fraud_detection_alerts", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => fraudDetectionRules.id),
  creatorId: integer("creator_id").references(() => creators.id),
  alertType: text("alert_type").notNull(), // sybil_attack, auto_farming, suspicious_pattern, threshold_breach
  severity: text("severity").default("medium"), // low, medium, high, critical
  status: text("status").default("active"), // active, resolved, ignored
  details: jsonb("details").default({}),
  evidence: jsonb("evidence").default({}),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creatorReputationScores = pgTable("creator_reputation_scores", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  overallScore: integer("overall_score").default(100), // 0-100 scale
  trustLevel: text("trust_level").default("trusted"), // trusted, warning, suspended, banned
  fraudCount: integer("fraud_count").default(0),
  positiveActions: integer("positive_actions").default(0),
  negativeActions: integer("negative_actions").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  penalties: jsonb("penalties").default({}),
  notes: text("notes"),
});

export const accessPatterns = pgTable("access_patterns", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  domainHash: text("domain_hash").notNull(), // hashed domain for privacy
  ipHash: text("ip_hash").notNull(), // hashed IP for privacy
  aiType: text("ai_type").notNull(),
  accessCount: integer("access_count").default(1),
  lastAccess: timestamp("last_access").defaultNow(),
  suspicious: boolean("suspicious").default(false),
  entropy: decimal("entropy", { precision: 10, scale: 6 }).default("0"),
  metadata: jsonb("metadata").default({}),
});

export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => creators.id),
  referredId: integer("referred_id").references(() => creators.id),
  rewardAmount: decimal("reward_amount", { precision: 18, scale: 8 }).notNull(),
  rewardType: text("reward_type").notNull(), // signup_bonus, activity_bonus, early_adopter_bonus
  status: text("status").default("pending"), // pending, completed, failed
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Domain verification system to prevent fraudulent site registration
export const domainVerifications = pgTable("domain_verifications", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  domain: text("domain").notNull(), // extracted domain from websiteUrl
  verificationMethod: text("verification_method").notNull(), // dns_txt, html_meta, file_upload, social_proof
  verificationToken: text("verification_token").notNull(), // unique token for verification
  verificationStatus: text("verification_status").default("pending"), // pending, verified, failed, expired
  verificationProof: text("verification_proof"), // DNS TXT record, HTML meta tag, file content, social post URL
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"), // verification expires after 90 days
  attemptCount: integer("attempt_count").default(0),
  lastAttempt: timestamp("last_attempt"),
  failureReason: text("failure_reason"),
  isManualReview: boolean("is_manual_review").default(false),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  creators: many(creators),
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, {
    fields: [creators.userId],
    references: [users.id],
  }),
  contentTracking: many(contentTracking),
  rewardDistributions: many(rewardDistributions),
  fraudAlerts: many(fraudDetectionAlerts),
  reputationScore: one(creatorReputationScores),
  accessPatterns: many(accessPatterns),
  referralsMade: many(referralRewards, { relationName: "referrer" }),
  referralsReceived: many(referralRewards, { relationName: "referred" }),
  referredBy: one(creators, {
    fields: [creators.referredBy],
    references: [creators.id],
    relationName: "referrer",
  }),
  referrals: many(creators, { relationName: "referrer" }),
  domainVerifications: many(domainVerifications),
  channelContentMappings: many(channelContentMappings),
}));

export const channelContentMappingsRelations = relations(channelContentMappings, ({ one }) => ({
  creator: one(creators, {
    fields: [channelContentMappings.creatorId],
    references: [creators.id],
  }),
}));

export const blockchainNetworksRelations = relations(blockchainNetworks, ({ many }) => ({
  rewardDistributions: many(rewardDistributions),
  poolManagement: many(poolManagement),
}));

export const aiAgentsRelations = relations(aiAgents, ({ many }) => ({
  sentMessages: many(agentCommunications, { relationName: "sentMessages" }),
  receivedMessages: many(agentCommunications, { relationName: "receivedMessages" }),
}));

export const agentCommunicationsRelations = relations(agentCommunications, ({ one }) => ({
  fromAgent: one(aiAgents, {
    fields: [agentCommunications.fromAgentId],
    references: [aiAgents.id],
    relationName: "sentMessages",
  }),
  toAgent: one(aiAgents, {
    fields: [agentCommunications.toAgentId],
    references: [aiAgents.id],
    relationName: "receivedMessages",
  }),
}));

export const contentTrackingRelations = relations(contentTracking, ({ one }) => ({
  creator: one(creators, {
    fields: [contentTracking.creatorId],
    references: [creators.id],
  }),
}));

export const rewardDistributionsRelations = relations(rewardDistributions, ({ one }) => ({
  creator: one(creators, {
    fields: [rewardDistributions.creatorId],
    references: [creators.id],
  }),
  network: one(blockchainNetworks, {
    fields: [rewardDistributions.networkId],
    references: [blockchainNetworks.id],
  }),
}));

export const poolManagementRelations = relations(poolManagement, ({ one }) => ({
  network: one(blockchainNetworks, {
    fields: [poolManagement.networkId],
    references: [blockchainNetworks.id],
  }),
}));

// Anti-fraud relations
export const fraudDetectionRulesRelations = relations(fraudDetectionRules, ({ many }) => ({
  alerts: many(fraudDetectionAlerts),
}));

export const fraudDetectionAlertsRelations = relations(fraudDetectionAlerts, ({ one }) => ({
  rule: one(fraudDetectionRules, {
    fields: [fraudDetectionAlerts.ruleId],
    references: [fraudDetectionRules.id],
  }),
  creator: one(creators, {
    fields: [fraudDetectionAlerts.creatorId],
    references: [creators.id],
  }),
}));

export const creatorReputationScoresRelations = relations(creatorReputationScores, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorReputationScores.creatorId],
    references: [creators.id],
  }),
}));

export const accessPatternsRelations = relations(accessPatterns, ({ one }) => ({
  creator: one(creators, {
    fields: [accessPatterns.creatorId],
    references: [creators.id],
  }),
}));

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  referrer: one(creators, {
    fields: [referralRewards.referrerId],
    references: [creators.id],
    relationName: "referrer",
  }),
  referred: one(creators, {
    fields: [referralRewards.referredId],
    references: [creators.id],
    relationName: "referred",
  }),
}));

export const domainVerificationsRelations = relations(domainVerifications, ({ one }) => ({
  creator: one(creators, {
    fields: [domainVerifications.creatorId],
    references: [creators.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Content category enum aligned with Qloo Cultural Intelligence categories
export const contentCategoryEnum = z.enum([
  "blog_articles",
  "news_journalism", 
  "educational_content",
  "technical_documentation",
  "creative_writing",
  "art_design",
  "music_audio",
  "video_content",
  "social_media",
  "academic_papers",
  "photography"
]);

export const insertCreatorSchema = createInsertSchema(creators).pick({
  userId: true,
  websiteUrl: true,
  walletAddress: true,
  contentCategory: true,
  platformType: true,
  channelId: true,
  channelName: true,
  channelVerificationUrl: true,
  monitoringScope: true,
}).extend({
  contentCategory: contentCategoryEnum
});

export const insertChannelContentMappingSchema = createInsertSchema(channelContentMappings).pick({
  creatorId: true,
  originalUrl: true,
  channelBaseUrl: true,
  urlPattern: true,
  isActive: true,
});

export const insertBlockchainNetworkSchema = createInsertSchema(blockchainNetworks).pick({
  name: true,
  chainId: true,
  rpcUrl: true,
  contractAddress: true,
  deploymentStatus: true,
  gasUsed: true,
});

export const insertAiAgentSchema = createInsertSchema(aiAgents).pick({
  name: true,
  type: true,
  status: true,
  expertiseLevel: true,
  metrics: true,
});

export const insertAgentCommunicationSchema = createInsertSchema(agentCommunications).pick({
  fromAgentId: true,
  toAgentId: true,
  message: true,
  messageType: true,
});

export const insertContentTrackingSchema = createInsertSchema(contentTracking).pick({
  creatorId: true,
  contentHash: true,
  accessType: true,
  aiModel: true,
  detectionConfidence: true,
  usageCount: true,
  rewardAmount: true,
  metadata: true,
});

export const insertRewardDistributionSchema = createInsertSchema(rewardDistributions).pick({
  creatorId: true,
  amount: true,
  transactionHash: true,
  networkId: true,
  status: true,
});

export const insertPoolManagementSchema = createInsertSchema(poolManagement).pick({
  networkId: true,
  totalStaked: true,
  totalRewards: true,
  apy: true,
  stakersCount: true,
});

export const insertComplianceRecordSchema = createInsertSchema(complianceRecords).pick({
  auditType: true,
  status: true,
  score: true,
  details: true,
  auditedBy: true,
});

// Anti-fraud insert schemas
export const insertFraudDetectionRuleSchema = createInsertSchema(fraudDetectionRules).pick({
  ruleName: true,
  ruleType: true,
  parameters: true,
  isActive: true,
  severity: true,
  description: true,
});

export const insertFraudDetectionAlertSchema = createInsertSchema(fraudDetectionAlerts).pick({
  ruleId: true,
  creatorId: true,
  alertType: true,
  severity: true,
  status: true,
  details: true,
  evidence: true,
});

export const insertCreatorReputationScoreSchema = createInsertSchema(creatorReputationScores).pick({
  creatorId: true,
  overallScore: true,
  trustLevel: true,
  fraudCount: true,
  positiveActions: true,
  negativeActions: true,
  penalties: true,
  notes: true,
});

export const insertAccessPatternSchema = createInsertSchema(accessPatterns).pick({
  creatorId: true,
  domainHash: true,
  ipHash: true,
  aiType: true,
  accessCount: true,
  suspicious: true,
  entropy: true,
  metadata: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).pick({
  referrerId: true,
  referredId: true,
  rewardAmount: true,
  rewardType: true,
  status: true,
  transactionHash: true,
});

export const insertDomainVerificationSchema = createInsertSchema(domainVerifications).pick({
  creatorId: true,
  domain: true,
  verificationMethod: true,
  verificationToken: true,
  verificationProof: true,
  reviewNotes: true,
});

// Reward Pool Protection insert schemas
export const insertRewardPoolLimitsSchema = createInsertSchema(rewardPoolLimits).pick({
  walletAddress: true,
  timeframeType: true,
  maxRewardAmount: true,
  currentPeriodAmount: true,
  periodStart: true,
  periodEnd: true,
  isActive: true,
});

export const insertPoolDrainProtectionSchema = createInsertSchema(poolDrainProtection).pick({
  protectionType: true,
  threshold: true,
  currentValue: true,
  timeWindow: true,
  windowStart: true,
  isTriggered: true,
  metadata: true,
});

export const insertRewardPoolSecuritySchema = createInsertSchema(rewardPoolSecurity).pick({
  walletAddress: true,
  suspiciousActivity: true,
  riskScore: true,
  alertLevel: true,
  actionTaken: true,
  evidence: true,
  isResolved: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Creator = typeof creators.$inferSelect;

export type InsertBlockchainNetwork = z.infer<typeof insertBlockchainNetworkSchema>;
export type BlockchainNetwork = typeof blockchainNetworks.$inferSelect;

export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;
export type AiAgent = typeof aiAgents.$inferSelect;

export type InsertAgentCommunication = z.infer<typeof insertAgentCommunicationSchema>;
export type AgentCommunication = typeof agentCommunications.$inferSelect;

export type InsertContentTracking = z.infer<typeof insertContentTrackingSchema>;
export type ContentTracking = typeof contentTracking.$inferSelect;

export type InsertRewardDistribution = z.infer<typeof insertRewardDistributionSchema>;
export type RewardDistribution = typeof rewardDistributions.$inferSelect;

export type InsertPoolManagement = z.infer<typeof insertPoolManagementSchema>;
export type PoolManagement = typeof poolManagement.$inferSelect;

export type InsertComplianceRecord = z.infer<typeof insertComplianceRecordSchema>;
export type ComplianceRecord = typeof complianceRecords.$inferSelect;

// Anti-fraud types
export type InsertFraudDetectionRule = z.infer<typeof insertFraudDetectionRuleSchema>;
export type FraudDetectionRule = typeof fraudDetectionRules.$inferSelect;

export type InsertFraudDetectionAlert = z.infer<typeof insertFraudDetectionAlertSchema>;
export type FraudDetectionAlert = typeof fraudDetectionAlerts.$inferSelect;

export type InsertCreatorReputationScore = z.infer<typeof insertCreatorReputationScoreSchema>;
export type CreatorReputationScore = typeof creatorReputationScores.$inferSelect;

export type InsertAccessPattern = z.infer<typeof insertAccessPatternSchema>;
export type AccessPattern = typeof accessPatterns.$inferSelect;

export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;

export type InsertDomainVerification = z.infer<typeof insertDomainVerificationSchema>;
export type DomainVerification = typeof domainVerifications.$inferSelect;

export type InsertChannelContentMapping = z.infer<typeof insertChannelContentMappingSchema>;
export type ChannelContentMapping = typeof channelContentMappings.$inferSelect;

// Reward Pool Protection types
export type InsertRewardPoolLimits = z.infer<typeof insertRewardPoolLimitsSchema>;
export type RewardPoolLimits = typeof rewardPoolLimits.$inferSelect;

export type InsertPoolDrainProtection = z.infer<typeof insertPoolDrainProtectionSchema>;
export type PoolDrainProtection = typeof poolDrainProtection.$inferSelect;

export type InsertRewardPoolSecurity = z.infer<typeof insertRewardPoolSecuritySchema>;
export type RewardPoolSecurity = typeof rewardPoolSecurity.$inferSelect;

// Reentrancy Protection Schema
export const reentrancyProtectionLogs = pgTable("reentrancy_protection_logs", {
  id: serial("id").primaryKey(),
  contractAddress: text("contract_address").notNull(),
  functionSelector: text("function_selector").notNull(),
  callDepth: integer("call_depth").notNull(),
  gasUsed: integer("gas_used").notNull(),
  riskScore: integer("risk_score").notNull(),
  isReentrancyDetected: boolean("is_reentrancy_detected").notNull(),
  suspiciousPatterns: text("suspicious_patterns"),
  recommendedAction: text("recommended_action").notNull(), // allow, flag, block
  evidence: text("evidence"),
  blockNumber: integer("block_number").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertReentrancyProtectionLogSchema = createInsertSchema(reentrancyProtectionLogs);
export type InsertReentrancyProtectionLog = z.infer<typeof insertReentrancyProtectionLogSchema>;
export type ReentrancyProtectionLog = typeof reentrancyProtectionLogs.$inferSelect;

export type FakeCreatorDetection = typeof fakeCreatorDetection.$inferSelect;
export type InsertFakeCreatorDetection = typeof fakeCreatorDetection.$inferInsert;
