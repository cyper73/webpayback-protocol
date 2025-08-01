import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
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
  walletSignature: text("wallet_signature"), // Cryptographic signature proving wallet ownership
  verificationMessage: text("verification_message"), // Message that was signed
  signatureVerified: boolean("signature_verified").default(false), // Backend compatibility field
  signatureVerifiedAt: timestamp("signature_verified_at"), // Verification timestamp
  isWalletVerified: boolean("is_wallet_verified").default(false), // True if signature is valid
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

// Content Certificate NFTs for Google AI Overview Protection
export const contentCertificateNfts = pgTable("content_certificate_nfts", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  contentUrl: text("content_url").notNull(),
  contentTitle: text("content_title").notNull(),
  contentFingerprint: text("content_fingerprint").notNull(), // SHA-256 hash of content
  nftTokenId: text("nft_token_id").notNull(),
  nftContractAddress: text("nft_contract_address").notNull(),
  blockchainNetwork: text("blockchain_network").default("polygon"),
  mintTransactionHash: text("mint_transaction_hash").notNull(),
  royaltyPercentage: decimal("royalty_percentage", { precision: 5, scale: 2 }).default("10.00"), // 10% royalty
  totalDetectedUses: integer("total_detected_uses").default(0),
  totalWptEarned: decimal("total_wpt_earned", { precision: 18, scale: 8 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Google AI Overview Detection Logs
export const googleAiOverviewDetections = pgTable("google_ai_overview_detections", {
  id: serial("id").primaryKey(),
  certificateNftId: integer("certificate_nft_id").references(() => contentCertificateNfts.id),
  querySearched: text("query_searched").notNull(),
  detectedFragment: text("detected_fragment").notNull(), // The text fragment found in AI Overview
  matchingConfidence: decimal("matching_confidence", { precision: 5, scale: 2 }).notNull(), // 0-100%
  googleSnippetUrl: text("google_snippet_url"), // URL to the AI Overview result
  wptRewardAmount: decimal("wpt_reward_amount", { precision: 18, scale: 8 }).notNull(),
  rewardTransactionHash: text("reward_transaction_hash"),
  detectionMethod: text("detection_method").default("content_fingerprint"), // content_fingerprint, semantic_matching
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
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
  poolType: text("pool_type").default("uniswap_v3"), // uniswap_v3, pol_staking, dual_rewards
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
export const dualRewards = pgTable("dual_rewards", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Allowance Management System for Automated Token Reserve Refills
export const allowanceManagement = pgTable("allowance_management", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  contractAddress: text("contract_address").notNull(),
  tokenAddress: text("token_address").notNull(), // WPT token address
  maxAllowance: decimal("max_allowance", { precision: 18, scale: 8 }).notNull(), // 5M WPT
  currentAllowance: decimal("current_allowance", { precision: 18, scale: 8 }).default("0"),
  usedAllowance: decimal("used_allowance", { precision: 18, scale: 8 }).default("0"),
  refillThreshold: decimal("refill_threshold", { precision: 18, scale: 8 }).default("50000"), // Auto-refill when reserves < 50k WPT
  refillAmount: decimal("refill_amount", { precision: 18, scale: 8 }).default("500000"), // 500k WPT per refill
  isActive: boolean("is_active").default(true),
  lastRefillAt: timestamp("last_refill_at"),
  alertThreshold: decimal("alert_threshold", { precision: 18, scale: 8 }).default("100000"), // Alert when < 100k WPT
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auto-Refill Transaction History
export const allowanceTransactions = pgTable("allowance_transactions", {
  id: serial("id").primaryKey(),
  allowanceId: integer("allowance_id").references(() => allowanceManagement.id).notNull(),
  transactionType: text("transaction_type").notNull(), // approve, refill, revoke
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  gasUsed: text("gas_used"),
  gasPrice: text("gas_price"),
  blockNumber: integer("block_number"),
  status: text("status").default("pending"), // pending, confirmed, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Reserve Pool Monitoring
export const reservePoolStatus = pgTable("reserve_pool_status", {
  id: serial("id").primaryKey(),
  contractAddress: text("contract_address").notNull(),
  currentBalance: decimal("current_balance", { precision: 18, scale: 8 }).notNull(),
  minimumThreshold: decimal("minimum_threshold", { precision: 18, scale: 8 }).default("50000"),
  optimalBalance: decimal("optimal_balance", { precision: 18, scale: 8 }).default("2000000"), // 2M WPT
  totalDistributedToday: decimal("total_distributed_today", { precision: 18, scale: 8 }).default("0"),
  totalDistributedWeek: decimal("total_distributed_week", { precision: 18, scale: 8 }).default("0"),
  totalDistributedMonth: decimal("total_distributed_month", { precision: 18, scale: 8 }).default("0"),
  averageDailyUsage: decimal("average_daily_usage", { precision: 18, scale: 8 }).default("0"),
  projectedDaysRemaining: integer("projected_days_remaining"),
  lastRefillAmount: decimal("last_refill_amount", { precision: 18, scale: 8 }),
  lastRefillAt: timestamp("last_refill_at"),
  nextScheduledRefill: timestamp("next_scheduled_refill"),
  alertLevel: text("alert_level").default("normal"), // normal, warning, critical, emergency
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Allowance Security Monitoring
export const allowanceSecurity = pgTable("allowance_security", {
  id: serial("id").primaryKey(),
  allowanceId: integer("allowance_id").references(() => allowanceManagement.id).notNull(),
  securityEventType: text("security_event_type").notNull(), // unusual_usage, threshold_breach, unauthorized_access
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  affectedAmount: decimal("affected_amount", { precision: 18, scale: 8 }),
  actionTaken: text("action_taken"), // monitored, throttled, blocked, manual_review
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  evidence: jsonb("evidence").default({}),
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
  reviewNotes: text("review_notes"), // Manual review notes for famous domains
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== CITATION-BASED REWARDS SYSTEM =====

// Citation tracking table - tracks each time AI systems cite creator content
export const citationTracking = pgTable("citation_tracking", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  sourceUrl: text("source_url").notNull(), // Original creator content URL
  citationContext: text("citation_context").notNull(), // What part was cited/used
  citationType: text("citation_type").default("content_reference"), // content_reference, direct_quote, paraphrase, factual_data
  querySource: text("query_source").notNull(), // User query that triggered the citation
  aiModel: text("ai_model").notNull(), // AI that provided the citation
  userAgent: text("user_agent"), // Browser/app that made the query
  sessionId: text("session_id"), // To track related queries
  citationConfidence: decimal("citation_confidence", { precision: 3, scale: 2 }).default("0.95"),
  rewardAmount: decimal("reward_amount", { precision: 18, scale: 8 }).default("0"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}), // Additional context
});

// AI Knowledge Index - tracks what content each AI system has learned from
export const aiKnowledgeIndex = pgTable("ai_knowledge_index", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  sourceUrl: text("source_url").notNull(),
  contentHash: text("content_hash").notNull(), // Hash of content for deduplication
  aiModel: text("ai_model").notNull(), // Which AI system learned this content
  knowledgeType: text("knowledge_type").default("general_content"), // general_content, factual_data, code_snippet, creative_work
  learningConfidence: decimal("learning_confidence", { precision: 3, scale: 2 }).default("0.90"),
  accessTimestamp: timestamp("access_timestamp").defaultNow(), // When AI first accessed/learned
  citationCount: integer("citation_count").default(0), // How many times this content has been cited
  totalRewardsGenerated: decimal("total_rewards_generated", { precision: 18, scale: 8 }).default("0"),
  lastCitationDate: timestamp("last_citation_date"),
  isActive: boolean("is_active").default(true), // Whether this content is still generating citations
  metadata: jsonb("metadata").default({}),
});

// Pool Health Metrics - tracks pool liquidity health for auto-scaling rewards
export const poolHealthMetrics = pgTable("pool_health_metrics", {
  id: serial("id").primaryKey(),
  usdtPoolTvl: decimal("usdt_pool_tvl", { precision: 18, scale: 8 }).notNull(),
  wmaticPoolTvl: decimal("wmatic_pool_tvl", { precision: 18, scale: 8 }).notNull(),
  usdtHealthLevel: text("usdt_health_level").notNull(), // healthy, warning, critical, emergency
  wmaticHealthLevel: text("wmatic_health_level").notNull(), // healthy, warning, critical, emergency
  rewardScaleFactor: decimal("reward_scale_factor", { precision: 5, scale: 4 }).notNull(), // 0.6-1.05
  belowActivationThreshold: boolean("below_activation_threshold").default(true), // Below $20K threshold
  alertsGenerated: jsonb("alerts_generated").default([]),
  checkedAt: timestamp("checked_at").defaultNow(),
});

export type PoolHealthMetrics = typeof poolHealthMetrics.$inferSelect;
export type InsertPoolHealthMetrics = typeof poolHealthMetrics.$inferInsert;

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

// Allowance Management Relations
export const allowanceManagementRelations = relations(allowanceManagement, ({ many }) => ({
  transactions: many(allowanceTransactions),
  securityEvents: many(allowanceSecurity),
}));

export const allowanceTransactionsRelations = relations(allowanceTransactions, ({ one }) => ({
  allowance: one(allowanceManagement, {
    fields: [allowanceTransactions.allowanceId],
    references: [allowanceManagement.id],
  }),
}));

export const allowanceSecurityRelations = relations(allowanceSecurity, ({ one }) => ({
  allowance: one(allowanceManagement, {
    fields: [allowanceSecurity.allowanceId],
    references: [allowanceManagement.id],
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
  walletSignature: true,
  verificationMessage: true,
  isWalletVerified: true,
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
});

// Allowance Management insert schemas
export const insertAllowanceManagementSchema = createInsertSchema(allowanceManagement).pick({
  walletAddress: true,
  contractAddress: true,
  tokenAddress: true,
  maxAllowance: true,
  currentAllowance: true,
  usedAllowance: true,
  refillThreshold: true,
  refillAmount: true,
  isActive: true,
  alertThreshold: true,
});

export const insertAllowanceTransactionSchema = createInsertSchema(allowanceTransactions).pick({
  allowanceId: true,
  transactionType: true,
  amount: true,
  transactionHash: true,
  gasUsed: true,
  gasPrice: true,
  blockNumber: true,
  status: true,
  errorMessage: true,
});

export const insertReservePoolStatusSchema = createInsertSchema(reservePoolStatus).pick({
  contractAddress: true,
  currentBalance: true,
  minimumThreshold: true,
  optimalBalance: true,
  totalDistributedToday: true,
  totalDistributedWeek: true,
  totalDistributedMonth: true,
  averageDailyUsage: true,
  projectedDaysRemaining: true,
  lastRefillAmount: true,
  lastRefillAt: true,
  nextScheduledRefill: true,
  alertLevel: true,
});

export const insertAllowanceSecuritySchema = createInsertSchema(allowanceSecurity).pick({
  allowanceId: true,
  securityEventType: true,
  riskLevel: true,
  description: true,
  affectedAmount: true,
  actionTaken: true,
  isResolved: true,
  resolvedAt: true,
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

export const insertPoolDrainProtectionSchema = createInsertSchema(poolDrainProtection).omit({
  id: true,
  createdAt: true,
});

export const insertCitationTrackingSchema = createInsertSchema(citationTracking).omit({
  id: true,
  timestamp: true,
});

export const insertAiKnowledgeIndexSchema = createInsertSchema(aiKnowledgeIndex).omit({
  id: true,
  accessTimestamp: true,
  lastCitationDate: true,
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

// Citation-based reward types
export type InsertCitationTracking = z.infer<typeof insertCitationTrackingSchema>;
export type CitationTracking = typeof citationTracking.$inferSelect;

export type InsertAiKnowledgeIndex = z.infer<typeof insertAiKnowledgeIndexSchema>;

// Anti-dump slippage fee tracking
export const slippageFeeEvents = pgTable("slippage_fee_events", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  slippageFeeApplied: decimal("slippage_fee_applied", { precision: 10, scale: 4 }).notNull(),
  feeAmountWpt: decimal("fee_amount_wpt", { precision: 18, scale: 6 }).notNull(),
  penaltyReason: text("penalty_reason"),
  blockNumber: integer("block_number").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const walletCashoutVelocity = pgTable("wallet_cashout_velocity", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  totalRewardsAccumulated: decimal("total_rewards_accumulated", { precision: 18, scale: 6 }).notNull().default("0"),
  totalCashoutAmount: decimal("total_cashout_amount", { precision: 18, scale: 6 }).notNull().default("0"),
  velocityScore: decimal("velocity_score", { precision: 10, scale: 4 }).notNull().default("0"),
  isHighRiskDumper: boolean("is_high_risk_dumper").notNull().default(false),
  lastUpdated: timestamp("last_updated").defaultNow()
});

export const antiDumpConfig = pgTable("anti_dump_config", {
  id: serial("id").primaryKey(),
  configName: varchar("config_name", { length: 50 }).notNull().unique(),
  baseSlippageFee: decimal("base_slippage_fee", { precision: 10, scale: 4 }).notNull().default("0.5"),
  velocityThresholdLow: decimal("velocity_threshold_low", { precision: 10, scale: 4 }).notNull().default("2.0"),
  velocityThresholdHigh: decimal("velocity_threshold_high", { precision: 10, scale: 4 }).notNull().default("5.0"),
  penaltyFeeLight: decimal("penalty_fee_light", { precision: 10, scale: 4 }).notNull().default("1.0"),
  penaltyFeeMedium: decimal("penalty_fee_medium", { precision: 10, scale: 4 }).notNull().default("2.5"),
  penaltyFeeHeavy: decimal("penalty_fee_heavy", { precision: 10, scale: 4 }).notNull().default("5.0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export type SlippageFeeEvent = typeof slippageFeeEvents.$inferSelect;
export type WalletCashoutVelocity = typeof walletCashoutVelocity.$inferSelect;
export type AntiDumpConfig = typeof antiDumpConfig.$inferSelect;

// Insert schemas for Content Certificate NFTs
export const insertContentCertificateNftSchema = createInsertSchema(contentCertificateNfts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoogleAiOverviewDetectionSchema = createInsertSchema(googleAiOverviewDetections).omit({
  id: true,
  createdAt: true,
});

export type ContentCertificateNft = typeof contentCertificateNfts.$inferSelect;
export type InsertContentCertificateNft = z.infer<typeof insertContentCertificateNftSchema>;
export type GoogleAiOverviewDetection = typeof googleAiOverviewDetections.$inferSelect;
export type InsertGoogleAiOverviewDetection = z.infer<typeof insertGoogleAiOverviewDetectionSchema>;
export type AiKnowledgeIndex = typeof aiKnowledgeIndex.$inferSelect;

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

// Allowance Management Types
export type AllowanceManagement = typeof allowanceManagement.$inferSelect;
export type InsertAllowanceManagement = z.infer<typeof insertAllowanceManagementSchema>;

export type AllowanceTransaction = typeof allowanceTransactions.$inferSelect;
export type InsertAllowanceTransaction = z.infer<typeof insertAllowanceTransactionSchema>;

export type ReservePoolStatus = typeof reservePoolStatus.$inferSelect;
export type InsertReservePoolStatus = z.infer<typeof insertReservePoolStatusSchema>;

export type AllowanceSecurity = typeof allowanceSecurity.$inferSelect;
export type InsertAllowanceSecurity = z.infer<typeof insertAllowanceSecuritySchema>;
