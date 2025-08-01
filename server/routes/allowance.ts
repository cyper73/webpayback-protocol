import type { Express } from "express";
import { db } from "../db";
import { tokenInjectionService } from "../services/tokenInjection";
import { authenticateAdmin } from "../adminAuth";
import { 
  allowanceManagement, 
  allowanceTransactions, 
  reservePoolStatus,
  allowanceSecurity,
  type InsertAllowanceManagement,
  type InsertAllowanceTransaction,
  type InsertReservePoolStatus,
  type InsertAllowanceSecurity
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
// Founder-only access control for Allowance Management
const isFounderAuthenticated = (req: any, res: any, next: any) => {
  const founderWallet = "0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8";
  
  // Get wallet address from params (GET requests) or body (POST requests)
  const walletAddress = req.params?.walletAddress || req.body?.walletAddress;
  
  // Check if requesting access to founder's wallet data
  if (walletAddress && walletAddress.toLowerCase() !== founderWallet.toLowerCase()) {
    return res.status(403).json({ 
      success: false, 
      error: "Access denied. Allowance management is restricted to protocol founder." 
    });
  }
  
  // Additional session-based check for founder's device (Firefox + Windows OK)
  const userAgent = req.headers['user-agent'] || '';
  const isFounderDevice = userAgent.includes('Windows') && (userAgent.includes('Chrome') || userAgent.includes('Firefox'));
  
  if (!isFounderDevice) {
    return res.status(403).json({ 
      success: false, 
      error: "Access denied. Please access from authorized device." 
    });
  }
  
  next();
};

export function registerAllowanceRoutes(app: Express) {
  
  // Get allowance configuration for a wallet (Admin authentication required)
  app.get("/api/allowance/config/:walletAddress", authenticateAdmin, async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const config = await db
        .select()
        .from(allowanceManagement)
        .where(eq(allowanceManagement.walletAddress, walletAddress))
        .limit(1);
      
      res.json({ success: true, config: config[0] || null });
    } catch (error) {
      console.error("Error fetching allowance config:", error);
      res.status(500).json({ success: false, error: "Failed to fetch allowance config" });
    }
  });

  // Create or update allowance configuration (Admin authentication required)
  app.post("/api/allowance/setup", authenticateAdmin, async (req, res) => {
    try {
      const configData: InsertAllowanceManagement = req.body;
      
      // Check if config already exists
      const existing = await db
        .select()
        .from(allowanceManagement)
        .where(eq(allowanceManagement.walletAddress, configData.walletAddress))
        .limit(1);
      
      let result;
      if (existing.length > 0) {
        // Update existing config
        result = await db
          .update(allowanceManagement)
          .set({
            ...configData,
            updatedAt: new Date(),
          })
          .where(eq(allowanceManagement.walletAddress, configData.walletAddress))
          .returning();
      } else {
        // Create new config
        result = await db
          .insert(allowanceManagement)
          .values(configData)
          .returning();
      }
      
      res.json({ success: true, config: result[0] });
    } catch (error) {
      console.error("Error setting up allowance:", error);
      res.status(500).json({ success: false, error: "Failed to setup allowance" });
    }
  });

  // Get allowance transaction history (Admin authentication required)
  app.get("/api/allowance/transactions/:allowanceId", authenticateAdmin, async (req, res) => {
    try {
      const { allowanceId } = req.params;
      const { limit = "20", offset = "0" } = req.query;
      
      const transactions = await db
        .select()
        .from(allowanceTransactions)
        .where(eq(allowanceTransactions.allowanceId, parseInt(allowanceId)))
        .orderBy(desc(allowanceTransactions.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json({ success: true, transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ success: false, error: "Failed to fetch transactions" });
    }
  });

  // Record a new allowance transaction (Admin authentication required)
  app.post("/api/allowance/transaction", authenticateAdmin, async (req, res) => {
    try {
      const transactionData: InsertAllowanceTransaction = req.body;
      
      const result = await db
        .insert(allowanceTransactions)
        .values(transactionData)
        .returning();
      
      // Update current allowance if this is a successful refill
      if (transactionData.transactionType === "refill" && transactionData.status === "confirmed") {
        await db
          .update(allowanceManagement)
          .set({
            usedAllowance: transactionData.amount,
            lastRefillAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(allowanceManagement.id, transactionData.allowanceId));
      }
      
      res.json({ success: true, transaction: result[0] });
    } catch (error) {
      console.error("Error recording transaction:", error);
      res.status(500).json({ success: false, error: "Failed to record transaction" });
    }
  });

  // Get reserve pool status
  app.get("/api/allowance/reserve-status/:contractAddress", isFounderAuthenticated, async (req, res) => {
    try {
      const { contractAddress } = req.params;
      
      const status = await db
        .select()
        .from(reservePoolStatus)
        .where(eq(reservePoolStatus.contractAddress, contractAddress))
        .orderBy(desc(reservePoolStatus.updatedAt))
        .limit(1);
      
      res.json({ success: true, status: status[0] || null });
    } catch (error) {
      console.error("Error fetching reserve status:", error);
      res.status(500).json({ success: false, error: "Failed to fetch reserve status" });
    }
  });

  // Update reserve pool status
  app.post("/api/allowance/reserve-status", isFounderAuthenticated, async (req, res) => {
    try {
      const statusData: InsertReservePoolStatus = req.body;
      
      // Check if status record exists
      const existing = await db
        .select()
        .from(reservePoolStatus)
        .where(eq(reservePoolStatus.contractAddress, statusData.contractAddress))
        .limit(1);
      
      let result;
      if (existing.length > 0) {
        // Update existing status
        result = await db
          .update(reservePoolStatus)
          .set({
            ...statusData,
            updatedAt: new Date(),
          })
          .where(eq(reservePoolStatus.contractAddress, statusData.contractAddress))
          .returning();
      } else {
        // Create new status record
        result = await db
          .insert(reservePoolStatus)
          .values(statusData)
          .returning();
      }
      
      res.json({ success: true, status: result[0] });
    } catch (error) {
      console.error("Error updating reserve status:", error);
      res.status(500).json({ success: false, error: "Failed to update reserve status" });
    }
  });

  // Get security events for an allowance
  app.get("/api/allowance/security/:allowanceId", isFounderAuthenticated, async (req, res) => {
    try {
      const { allowanceId } = req.params;
      const { limit = "10" } = req.query;
      
      const events = await db
        .select()
        .from(allowanceSecurity)
        .where(eq(allowanceSecurity.allowanceId, parseInt(allowanceId)))
        .orderBy(desc(allowanceSecurity.createdAt))
        .limit(parseInt(limit as string));
      
      res.json({ success: true, events });
    } catch (error) {
      console.error("Error fetching security events:", error);
      res.status(500).json({ success: false, error: "Failed to fetch security events" });
    }
  });

  // Create security event
  app.post("/api/allowance/security", isFounderAuthenticated, async (req, res) => {
    try {
      const eventData: InsertAllowanceSecurity = req.body;
      
      const result = await db
        .insert(allowanceSecurity)
        .values(eventData)
        .returning();
      
      res.json({ success: true, event: result[0] });
    } catch (error) {
      console.error("Error creating security event:", error);
      res.status(500).json({ success: false, error: "Failed to create security event" });
    }
  });

  // Get allowance statistics dashboard
  app.get("/api/allowance/dashboard/:walletAddress", isFounderAuthenticated, async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      // Get allowance config
      const config = await db
        .select()
        .from(allowanceManagement)
        .where(eq(allowanceManagement.walletAddress, walletAddress))
        .limit(1);
      
      if (!config.length) {
        return res.json({ 
          success: false, 
          error: "Allowance not configured for this wallet" 
        });
      }
      
      const allowanceId = config[0].id;
      
      // Get recent transactions
      const recentTransactions = await db
        .select()
        .from(allowanceTransactions)
        .where(eq(allowanceTransactions.allowanceId, allowanceId))
        .orderBy(desc(allowanceTransactions.createdAt))
        .limit(5);
      
      // Get reserve status
      const reserveStatus = await db
        .select()
        .from(reservePoolStatus)
        .where(eq(reservePoolStatus.contractAddress, config[0].contractAddress))
        .orderBy(desc(reservePoolStatus.updatedAt))
        .limit(1);
      
      // Get security events count
      const securityEventsCount = await db
        .select()
        .from(allowanceSecurity)
        .where(and(
          eq(allowanceSecurity.allowanceId, allowanceId),
          eq(allowanceSecurity.isResolved, false)
        ));
      
      res.json({
        success: true,
        dashboard: {
          config: config[0],
          recentTransactions,
          reserveStatus: reserveStatus[0] || null,
          activeSecurityEvents: securityEventsCount.length,
          utilizationPercent: ((parseFloat(config[0].usedAllowance || "0") / parseFloat(config[0].maxAllowance || "1")) * 100).toFixed(2)
        }
      });
    } catch (error) {
      console.error("Error fetching allowance dashboard:", error);
      res.status(500).json({ success: false, error: "Failed to fetch dashboard data" });
    }
  });

  // IMMEDIATE TOKEN INJECTION - Inject 1M WPT tokens to contract
  app.post("/api/allowance/inject-tokens", isFounderAuthenticated, async (req, res) => {
    try {
      const { amount = "1000000", targetContract } = req.body;
      const founderWallet = "0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8";
      
      // Security validation
      if (!targetContract || !targetContract.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({ 
          success: false, 
          error: "Valid target contract address required" 
        });
      }

      // Use token injection service
      const injectionResult = await tokenInjectionService.injectTokens(
        targetContract,
        amount,
        founderWallet
      );

      if (!injectionResult.success) {
        return res.status(400).json({
          success: false,
          error: injectionResult.error
        });
      }
      
      // Record transaction in database
      const allowanceId = 1; // Founder's allowance ID (number)
      await db
        .insert(allowanceTransactions)
        .values({
          allowanceId,
          transactionType: "injection",
          amount: amount.toString(),
          transactionHash: injectionResult.transactionHash!,
          gasUsed: injectionResult.gasUsed!,
          blockNumber: injectionResult.blockNumber!,
          status: "confirmed",
        });
      
      // Update allowance usage
      await db
        .update(allowanceManagement)
        .set({
          usedAllowance: amount.toString(),
          lastRefillAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(allowanceManagement.walletAddress, founderWallet));
      
      res.json({
        success: true,
        message: `Successfully injected ${amount} WPT tokens`,
        transactionHash: injectionResult.transactionHash!,
        blockNumber: injectionResult.blockNumber!,
        gasUsed: injectionResult.gasUsed!,
        targetContract,
        amount: amount
      });
      
    } catch (error: any) {
      console.error("❌ Token injection failed:", error);
      res.status(500).json({ 
        success: false, 
        error: "Token injection failed: " + (error?.message || String(error))
      });
    }
  });
}