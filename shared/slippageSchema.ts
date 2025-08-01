import { pgTable, serial, varchar, decimal, timestamp, integer, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Anti-dump slippage fee tracking
export const slippageFeeEvents = pgTable("slippage_fee_events", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // 'cashout', 'reward_claim', 'liquidity_add'
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  rewardAccumulatedAmount: decimal("reward_accumulated_amount", { precision: 18, scale: 6 }).notNull(),
  cashoutSpeedRatio: decimal("cashout_speed_ratio", { precision: 10, scale: 4 }).notNull(), // cashout/accumulated ratio
  slippageFeeApplied: decimal("slippage_fee_applied", { precision: 10, scale: 4 }).notNull(), // percentage fee
  feeAmountWpt: decimal("fee_amount_wpt", { precision: 18, scale: 6 }).notNull(),
  baseSlippageFee: decimal("base_slippage_fee", { precision: 10, scale: 4 }).notNull(),
  antiDumpPenalty: decimal("anti_dump_penalty", { precision: 10, scale: 4 }).notNull(),
  penaltyReason: text("penalty_reason"),
  blockNumber: integer("block_number").notNull(),
  gasUsed: integer("gas_used"),
  networkId: integer("network_id").notNull().default(137), // Polygon mainnet
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata") // Additional transaction context
});

// Wallet cashout velocity tracking
export const walletCashoutVelocity = pgTable("wallet_cashout_velocity", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  totalRewardsAccumulated: decimal("total_rewards_accumulated", { precision: 18, scale: 6 }).notNull().default("0"),
  totalCashoutAmount: decimal("total_cashout_amount", { precision: 18, scale: 6 }).notNull().default("0"),
  lastCashoutAt: timestamp("last_cashout_at"),
  lastRewardAt: timestamp("last_reward_at"),
  cashoutFrequency: integer("cashout_frequency").notNull().default(0), // times per week
  velocityScore: decimal("velocity_score", { precision: 10, scale: 4 }).notNull().default("0"), // risk score 0-100
  isHighRiskDumper: boolean("is_high_risk_dumper").notNull().default(false),
  penaltyMultiplier: decimal("penalty_multiplier", { precision: 10, scale: 4 }).notNull().default("1.0"),
  whitelistStatus: boolean("whitelist_status").notNull().default(false), // exempt from anti-dump fees
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Anti-dump configuration
export const antiDumpConfig = pgTable("anti_dump_config", {
  id: serial("id").primaryKey(),
  configName: varchar("config_name", { length: 50 }).notNull().unique(),
  baseSlippageFee: decimal("base_slippage_fee", { precision: 10, scale: 4 }).notNull().default("0.5"), // 0.5% base
  velocityThresholdLow: decimal("velocity_threshold_low", { precision: 10, scale: 4 }).notNull().default("2.0"), // 200% cashout vs rewards
  velocityThresholdHigh: decimal("velocity_threshold_high", { precision: 10, scale: 4 }).notNull().default("5.0"), // 500% cashout vs rewards
  penaltyFeeLight: decimal("penalty_fee_light", { precision: 10, scale: 4 }).notNull().default("1.0"), // +1% extra fee
  penaltyFeeMedium: decimal("penalty_fee_medium", { precision: 10, scale: 4 }).notNull().default("2.5"), // +2.5% extra fee
  penaltyFeeHeavy: decimal("penalty_fee_heavy", { precision: 10, scale: 4 }).notNull().default("5.0"), // +5% extra fee
  frequencyPenaltyThreshold: integer("frequency_penalty_threshold").notNull().default(3), // cashouts per week
  minimumRewardAge: integer("minimum_reward_age").notNull().default(24), // hours before penalty-free cashout
  whitelistMinimumStake: decimal("whitelist_minimum_stake", { precision: 18, scale: 6 }).notNull().default("10000"), // 10K WPT minimum
  isActive: boolean("is_active").notNull().default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schemas
export const insertSlippageFeeEvent = createInsertSchema(slippageFeeEvents);
export const insertWalletCashoutVelocity = createInsertSchema(walletCashoutVelocity);
export const insertAntiDumpConfig = createInsertSchema(antiDumpConfig);

export type SlippageFeeEvent = typeof slippageFeeEvents.$inferSelect;
export type InsertSlippageFeeEvent = z.infer<typeof insertSlippageFeeEvent>;

export type WalletCashoutVelocity = typeof walletCashoutVelocity.$inferSelect;
export type InsertWalletCashoutVelocity = z.infer<typeof insertWalletCashoutVelocity>;

export type AntiDumpConfig = typeof antiDumpConfig.$inferSelect;
export type InsertAntiDumpConfig = z.infer<typeof insertAntiDumpConfig>;