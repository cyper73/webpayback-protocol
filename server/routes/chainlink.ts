import { Router } from 'express';
import { chainlinkService } from '../services/chainlink';
import { chainlinkAutomationService } from '../services/chainlinkAutomation';

const router = Router();

// Get latest price data from Chainlink feeds
router.get('/prices', async (req, res) => {
  try {
    console.log('🔗 Fetching Chainlink prices...');
    
    const [maticPrice, ethPrice, wptValueUSD] = await Promise.all([
      chainlinkService.getMaticPrice(),
      chainlinkService.getEthPrice(),
      chainlinkService.getWPTValueUSD()
    ]);

    console.log('📊 Chainlink prices fetched successfully:', { maticPrice, ethPrice, wptValueUSD });

    res.json({
      prices: {
        MATIC_USD: maticPrice,
        ETH_USD: ethPrice,
        WPT_USD: wptValueUSD
      },
      timestamp: new Date().toISOString(),
      source: 'chainlink'
    });
  } catch (error) {
    console.error('Error fetching Chainlink prices:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

// Get specific price feed data
router.get('/feed/:feedName', async (req, res) => {
  try {
    const { feedName } = req.params;
    const priceData = await chainlinkService.getLatestPrice(feedName);
    
    res.json({
      feed: feedName,
      data: priceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.feedName} feed:`, error);
    res.status(500).json({ error: 'Failed to fetch feed data' });
  }
});

// Calculate reward value with Chainlink pricing
router.post('/calculate-reward', async (req, res) => {
  try {
    const { wptAmount } = req.body;
    
    if (!wptAmount || isNaN(wptAmount)) {
      return res.status(400).json({ error: 'Valid WPT amount required' });
    }

    const rewardValue = await chainlinkService.calculateRewardValue(parseFloat(wptAmount));
    
    res.json({
      calculation: rewardValue,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating reward value:', error);
    res.status(500).json({ error: 'Failed to calculate reward value' });
  }
});

// Check price feed health
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Checking Chainlink feed health...');
    
    const healthStatus = await chainlinkService.checkPriceFeedHealth();
    
    console.log('✅ Feed health check completed:', healthStatus);
    
    res.json({
      status: 'healthy',
      feeds: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error checking feed health:', error);
    res.status(500).json({ error: 'Failed to check feed health' });
  }
});

// Automation endpoints
router.get('/automation/status', async (req, res) => {
  try {
    const status = await chainlinkAutomationService.getAutomationStatus();
    
    res.json({
      automation: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting automation status:', error);
    res.status(500).json({ error: 'Failed to get automation status' });
  }
});

// Check if upkeep is needed (Chainlink Automation compatible)
router.post('/automation/check-upkeep', async (req, res) => {
  try {
    const { checkData = "0x" } = req.body;
    const result = await chainlinkAutomationService.checkUpkeep(checkData);
    
    res.json({
      upkeep: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking upkeep:', error);
    res.status(500).json({ error: 'Failed to check upkeep' });
  }
});

// Perform upkeep (Chainlink Automation compatible)
router.post('/automation/perform-upkeep', async (req, res) => {
  try {
    const { performData } = req.body;
    
    if (!performData) {
      return res.status(400).json({ error: 'performData required' });
    }

    const result = await chainlinkAutomationService.performUpkeep(performData);
    
    res.json({
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error performing upkeep:', error);
    res.status(500).json({ error: 'Failed to perform upkeep' });
  }
});

// Manual trigger for testing
router.post('/automation/trigger', async (req, res) => {
  try {
    const result = await chainlinkAutomationService.triggerManualUpkeep();
    
    res.json({
      trigger: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering manual upkeep:', error);
    res.status(500).json({ error: 'Failed to trigger upkeep' });
  }
});

// Simple test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 Chainlink test endpoint called');
  res.json({
    message: 'Chainlink integration is working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/chainlink/prices',
      '/api/chainlink/health',
      '/api/chainlink/automation/status'
    ]
  });
});

export default router;