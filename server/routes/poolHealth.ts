import { Router } from "express";
import { PoolHealthRewardScaler } from "../services/poolHealthRewardScaler";

const router = Router();

/**
 * Get current pool health status
 * Returns TVL, health levels, and reward scaling factor
 */
router.get("/status", async (req, res) => {
  try {
    const scaler = PoolHealthRewardScaler.getInstance();
    const healthStatus = await scaler.getCurrentPoolHealth();

    // Format response for dashboard
    const response = {
      usdtPool: {
        tvl: parseFloat(healthStatus.usdtPoolTvl.toString()),
        healthLevel: healthStatus.usdtHealthLevel,
        threshold: getThresholdDescription(healthStatus.usdtHealthLevel, "usdt")
      },
      wmaticPool: {
        tvl: parseFloat(healthStatus.wmaticPoolTvl.toString()),
        healthLevel: healthStatus.wmaticHealthLevel,
        threshold: getThresholdDescription(healthStatus.wmaticHealthLevel, "wmatic")
      },
      rewardScaling: {
        currentFactor: healthStatus.rewardScaleFactor,
        percentage: Math.round(healthStatus.rewardScaleFactor * 100),
        status: healthStatus.belowActivationThreshold ? "reduced" : "normal"
      },
      ethicalEquilibrium: {
        isActive: !healthStatus.belowActivationThreshold,
        activationThreshold: 20000,
        currentUsdtTvl: parseFloat(healthStatus.usdtPoolTvl.toString()),
        progressToActivation: Math.min(100, (parseFloat(healthStatus.usdtPoolTvl.toString()) / 20000) * 100)
      },
      lastUpdated: healthStatus.lastUpdated.toISOString()
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Pool health status error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch pool health status",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get pool health alerts and recommendations
 */
router.get("/alerts", async (req, res) => {
  try {
    const scaler = PoolHealthRewardScaler.getInstance();
    const alerts = await scaler.getPoolHealthAlerts();

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Pool health alerts error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch pool health alerts",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get pool health thresholds configuration
 */
router.get("/thresholds", async (req, res) => {
  try {
    const thresholds = {
      usdt: {
        healthy: {
          min: 50000,
          max: null,
          rewardFactor: 1.05,
          description: "Highly liquid pool - 5% ethical bonus"
        },
        warning: {
          min: 30000,
          max: 50000,
          rewardFactor: 1.0,
          description: "Pool in normal state - standard rewards"
        },
        critical: {
          min: 20000,
          max: 30000,
          rewardFactor: 0.95,
          description: "Pool near threshold - slight reduction"
        },
        emergency: {
          min: null,
          max: 20000,
          rewardFactor: 0.6,
          description: "Below activation threshold - reduced rewards for protection"
        }
      },
      wmatic: {
        healthy: {
          min: 40000,
          max: null,
          rewardFactor: 1.05,
          description: "WMATIC pool very liquid - ethical bonus"
        },
        warning: {
          min: 25000,
          max: 40000,
          rewardFactor: 1.0,
          description: "WMATIC pool normal - standard rewards"
        },
        critical: {
          min: 20000,
          max: 25000,
          rewardFactor: 0.95,
          description: "WMATIC pool in slight difficulty"
        },
        emergency: {
          min: null,
          max: 20000,
          rewardFactor: 0.6,
          description: "WMATIC pool with limited liquidity"
        }
      },
      ethicalEquilibrium: {
        activationThreshold: 20000,
        description: "L'algoritmo di equilibrio etico si attiva solo quando la pool USDT supera $20,000",
        currentLogic: "Sotto $20K = rewards ridotti al 60%. Sopra $20K = scaling graduale 95%-105%"
      }
    };

    res.json({ success: true, data: thresholds });
  } catch (error) {
    console.error("Pool health thresholds error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch pool health thresholds",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get pool health history (last 24h)
 */
router.get("/history", async (req, res) => {
  try {
    // TODO: Implement history tracking in database
    // For now, return empty array
    res.json({ 
      success: true, 
      data: [],
      message: "History tracking will be implemented in next iteration" 
    });
  } catch (error) {
    console.error("Pool health history error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch pool health history",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Test reward scaling with a sample amount
 */
router.post("/test-scaling", async (req, res) => {
  try {
    const { baseReward } = req.body;
    
    if (!baseReward || isNaN(baseReward)) {
      return res.status(400).json({
        success: false,
        error: "Base reward amount is required and must be a number"
      });
    }

    const scaler = PoolHealthRewardScaler.getInstance();
    const result = await scaler.scaleRewardByPoolHealth(parseFloat(baseReward));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Pool health test scaling error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to test reward scaling",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Helper function to get threshold descriptions
function getThresholdDescription(healthLevel: string, poolType: string): string {
  const thresholds = {
    usdt: {
      healthy: "> $50,000 (5% Bonus)",
      warning: "$30,000 - $50,000 (Normal)",
      critical: "$20,000 - $30,000 (5% Reduced)",
      emergency: "< $20,000 (40% Reduced)"
    },
    wmatic: {
      healthy: "> $40,000 (5% Bonus)",
      warning: "$25,000 - $40,000 (Normal)",
      critical: "$20,000 - $25,000 (5% Reduced)",
      emergency: "< $20,000 (40% Reduced)"
    }
  };

  return thresholds[poolType as keyof typeof thresholds]?.[healthLevel as keyof typeof thresholds.usdt] || "Unknown";
}

export default router;