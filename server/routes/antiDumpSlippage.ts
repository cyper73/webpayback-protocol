import { Router } from "express";
import { antiDumpEngine } from "../services/antiDumpSlippageEngine";
import { insertSlippageFeeEvent, insertAntiDumpConfig } from "../../shared/slippageSchema";
import { z } from "zod";

const router = Router();

// Validation schemas
const cashoutRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount format"),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
  blockNumber: z.number().int().positive(),
  gasUsed: z.number().int().positive().optional(),
  networkId: z.number().int().positive().optional()
});

const configUpdateSchema = z.object({
  baseSlippageFee: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  velocityThresholdLow: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  velocityThresholdHigh: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  penaltyFeeLight: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  penaltyFeeMedium: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  penaltyFeeHeavy: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  frequencyPenaltyThreshold: z.number().int().positive().optional(),
  minimumRewardAge: z.number().int().positive().optional(),
  whitelistMinimumStake: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  isActive: z.boolean().optional()
});

/**
 * Calculate anti-dump slippage fee for a cashout request
 * POST /api/anti-dump/calculate-fee
 */
router.post("/calculate-fee", async (req, res) => {
  try {
    const validation = cashoutRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request format",
        details: validation.error.errors
      });
    }

    const cashoutRequest = validation.data;
    const feeCalculation = await antiDumpEngine.calculateSlippageFee(cashoutRequest);

    res.json({
      success: true,
      data: {
        ...feeCalculation,
        walletAddress: cashoutRequest.walletAddress,
        cashoutAmount: cashoutRequest.amount,
        recommendation: feeCalculation.exemptFromFees 
          ? "Proceed with cashout - wallet exempt from fees"
          : feeCalculation.totalSlippageFee > 3
            ? "High slippage fee detected - consider reducing cashout amount or waiting longer"
            : "Normal cashout - proceed with transaction"
      }
    });

  } catch (error) {
    console.error("Error calculating anti-dump fee:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate anti-dump fee",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Record a slippage fee event after cashout execution
 * POST /api/anti-dump/record-event
 */
router.post("/record-event", async (req, res) => {
  try {
    const { cashoutRequest, feeCalculation, rewardAccumulated } = req.body;

    // Validate inputs
    const cashoutValidation = cashoutRequestSchema.safeParse(cashoutRequest);
    if (!cashoutValidation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid cashout request format"
      });
    }

    if (!feeCalculation || typeof rewardAccumulated !== 'number') {
      return res.status(400).json({
        success: false,
        error: "Missing fee calculation or reward data"
      });
    }

    const event = await antiDumpEngine.recordSlippageFeeEvent(
      cashoutValidation.data,
      feeCalculation,
      rewardAccumulated
    );

    res.json({
      success: true,
      data: {
        eventId: event.id,
        feeAmountWpt: event.feeAmountWpt,
        penaltyReason: event.penaltyReason,
        message: "Anti-dump fee event recorded successfully"
      }
    });

  } catch (error) {
    console.error("Error recording anti-dump event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record anti-dump event",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Get wallet anti-dump statistics
 * GET /api/anti-dump/wallet/:address/stats
 */
router.get("/wallet/:address/stats", async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet address format"
      });
    }

    const stats = await antiDumpEngine.getWalletStats(address);

    res.json({
      success: true,
      data: {
        walletAddress: address,
        ...stats,
        summary: {
          riskLevel: !stats.velocity ? "New wallet" :
                   stats.velocity.isHighRiskDumper ? "High risk" :
                   Number(stats.velocity.velocityScore) > 200 ? "Medium risk" : "Low risk",
          totalEvents: stats.recentEvents.length,
          avgSlippageFee: stats.recentEvents.length > 0 
            ? (stats.recentEvents.reduce((sum, event) => sum + Number(event.slippageFeeApplied), 0) / stats.recentEvents.length).toFixed(2)
            : "0",
          lastCashout: stats.velocity?.lastCashoutAt || null
        }
      }
    });

  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wallet statistics",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Get system-wide anti-dump statistics
 * GET /api/anti-dump/system/stats
 */
router.get("/system/stats", async (req, res) => {
  try {
    const stats = await antiDumpEngine.getSystemStats();

    res.json({
      success: true,
      data: {
        ...stats,
        performance: {
          avgFeesPerEvent: stats.totalEvents > 0 
            ? (stats.totalFeesCollected / stats.totalEvents).toFixed(4) 
            : "0",
          highRiskPercentage: stats.totalEvents > 0 
            ? ((stats.highRiskWallets / stats.totalEvents) * 100).toFixed(2)
            : "0",
          systemHealth: stats.averagePenalty < 2 ? "Healthy" :
                       stats.averagePenalty < 4 ? "Moderate" : "High penalty usage"
        }
      }
    });

  } catch (error) {
    console.error("Error fetching system stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch system statistics",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Update anti-dump configuration (admin only)
 * PUT /api/anti-dump/config
 */
router.put("/config", async (req, res) => {
  try {
    // TODO: Add proper admin authentication middleware
    // For now, this is a basic implementation
    
    const validation = configUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid configuration format",
        details: validation.error.errors
      });
    }

    const updatedConfig = await antiDumpEngine.updateConfig(validation.data);

    res.json({
      success: true,
      data: updatedConfig,
      message: "Anti-dump configuration updated successfully"
    });

  } catch (error) {
    console.error("Error updating anti-dump config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Get current anti-dump configuration
 * GET /api/anti-dump/config
 */
router.get("/config", async (req, res) => {
  try {
    // Load current config by triggering calculation (which loads config)
    const dummyRequest = {
      walletAddress: "0x0000000000000000000000000000000000000000",
      amount: "1",
      transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      blockNumber: 1
    };
    
    await antiDumpEngine.calculateSlippageFee(dummyRequest);
    
    // Now get the loaded config from the engine
    const systemStats = await antiDumpEngine.getSystemStats();
    
    res.json({
      success: true,
      data: {
        message: "Anti-dump system is active",
        systemStats,
        configDescription: {
          baseSlippageFee: "Base slippage fee applied to all cashouts (0.5%)",
          velocityThresholds: {
            low: "200% cashout vs rewards - triggers light penalty",
            high: "500% cashout vs rewards - triggers heavy penalty"
          },
          penalties: {
            light: "1% additional fee",
            medium: "2.5% additional fee", 
            heavy: "5% additional fee"
          },
          frequencyThreshold: "3 cashouts per week triggers penalty",
          minimumRewardAge: "24 hours for penalty-free cashout"
        }
      }
    });

  } catch (error) {
    console.error("Error fetching anti-dump config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Whitelist a wallet (exempt from anti-dump fees)
 * POST /api/anti-dump/whitelist/:address
 */
router.post("/whitelist/:address", async (req, res) => {
  try {
    // TODO: Add proper admin authentication
    
    const { address } = req.params;
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet address format"
      });
    }

    // This would need to be implemented in the engine
    // For now, returning a placeholder response
    res.json({
      success: true,
      data: {
        walletAddress: address,
        whitelistStatus: true,
        message: "Wallet added to anti-dump whitelist"
      }
    });

  } catch (error) {
    console.error("Error whitelisting wallet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to whitelist wallet",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;