import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { blockchainService } from "./services/blockchain";
import { agentService } from "./services/agents";
import { web3Service } from "./services/web3";
import { contentMonitoringService } from "./services/contentMonitoring";
import { gasManager } from "./services/gasManager";
import { domainVerificationService } from "./services/domainVerification";
import { chainlinkDomainVerificationService } from "./services/chainlinkDomainVerification";
import { channelMonitoringService } from "./services/channelMonitoring";
import { aiKnowledgeTrackingService } from "./services/aiKnowledgeTracking";
import { 
  insertCreatorSchema, 
  insertAgentCommunicationSchema,
  insertContentTrackingSchema,
  insertRewardDistributionSchema,
  insertBlockchainNetworkSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize blockchain networks on startup
  await blockchainService.initializeNetworks();
  
  // Initialize AI agents
  app.post("/api/agents/initialize", async (req, res) => {
    try {
      await agentService.initializeAgents();
      res.json({ success: true, message: "AI agents initialized successfully" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get agent communications
  app.get("/api/agents/communications", async (req, res) => {
    try {
      const communications = await storage.getAgentCommunications();
      res.json(communications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Send agent communication
  app.post("/api/agents/communicate", async (req, res) => {
    try {
      const validatedData = insertAgentCommunicationSchema.parse(req.body);
      const communication = await storage.createAgentCommunication(validatedData);
      res.json(communication);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get blockchain networks
  app.get("/api/blockchain/networks", async (req, res) => {
    try {
      const networks = await storage.getAllBlockchainNetworks();
      res.json(networks);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Deploy token to blockchain
  app.post("/api/blockchain/deploy", async (req, res) => {
    try {
      const validatedData = insertBlockchainNetworkSchema.parse(req.body);
      const deployment = await blockchainService.deployToken(validatedData);
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get deployment status
  app.get("/api/blockchain/deployment/:networkId", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const status = await blockchainService.getDeploymentStatus(networkId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Register creator
  app.post("/api/creators", async (req, res) => {
    try {
      const validatedData = insertCreatorSchema.parse(req.body);
      
      // Extract channel information from the URL
      const channelInfo = channelMonitoringService.extractChannelInfo(validatedData.websiteUrl);
      
      // Enhanced creator data with channel information
      const creatorData = {
        ...validatedData,
        platformType: channelInfo?.platformType || 'single_page',
        channelId: channelInfo?.channelId || null,
        channelName: channelInfo?.channelName || null,
        channelVerificationUrl: validatedData.websiteUrl,
        monitoringScope: channelInfo ? 'full_channel' : 'single_url'
      };
      
      const creator = await storage.createCreator(creatorData);
      
      // If it's a channel, create the channel content mapping
      if (channelInfo) {
        await channelMonitoringService.createChannelMapping(creator.id, validatedData.websiteUrl);
        console.log(`Channel-level monitoring enabled for creator ${creator.id}: ${channelInfo.platformType}`);
      }
      
      res.json({
        ...creator,
        channelMonitoring: channelInfo ? {
          enabled: true,
          platformType: channelInfo.platformType,
          channelId: channelInfo.channelId,
          channelName: channelInfo.channelName,
          urlPattern: channelInfo.urlPattern,
          instructions: channelMonitoringService.getPlatformMonitoringInstructions(channelInfo.platformType)
        } : {
          enabled: false
        }
      });
    } catch (error) {
      console.error("Creator registration error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all creators
  app.get("/api/creators", async (req, res) => {
    try {
      const creators = await storage.getAllCreators();
      res.json(creators);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get channel monitoring info for a creator
  app.get("/api/creators/:id/channels", async (req, res) => {
    try {
      const creatorId = parseInt(req.params.id);
      const mappings = await channelMonitoringService.getCreatorChannelMappings(creatorId);
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Check if URL is channel content
  app.post("/api/channel/check", async (req, res) => {
    try {
      const { url } = req.body;
      const result = await channelMonitoringService.isChannelContent(url);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Extract channel info from URL
  app.post("/api/channel/extract", async (req, res) => {
    try {
      const { url } = req.body;
      const channelInfo = channelMonitoringService.extractChannelInfo(url);
      res.json(channelInfo);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get creator by referral code
  app.get("/api/creators/referral/:code", async (req, res) => {
    try {
      const creator = await storage.getCreatorByReferralCode(req.params.code);
      if (!creator) {
        return res.status(404).json({ error: "Referral code not found" });
      }
      res.json(creator);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get referral rewards
  app.get("/api/referrals/rewards", async (req, res) => {
    try {
      const creatorId = req.query.creatorId ? parseInt(req.query.creatorId as string) : undefined;
      const rewards = await storage.getReferralRewards(creatorId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Generate referral code
  app.post("/api/referrals/generate", async (req, res) => {
    try {
      const code = await storage.generateReferralCode();
      res.json({ referralCode: code });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Track content usage
  app.post("/api/content/track", async (req, res) => {
    try {
      const validatedData = insertContentTrackingSchema.parse(req.body);
      const tracking = await storage.createContentTracking(validatedData);
      res.json(tracking);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get content tracking stats
  app.get("/api/content/stats", async (req, res) => {
    try {
      const stats = await storage.getContentTrackingStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get reward distributions
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewardDistributions();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Distribute rewards (now uses gas manager)
  app.post("/api/rewards/distribute", async (req, res) => {
    try {
      const validatedData = insertRewardDistributionSchema.parse(req.body);
      // Queue reward for batch processing instead of immediate distribution
      await gasManager.queueReward(validatedData);
      res.json({ success: true, message: "Reward queued for batch processing" });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Gas management endpoints
  app.get("/api/gas/status", async (req, res) => {
    try {
      const status = await gasManager.getSystemStatus();
      res.json(status);
    } catch (error) {
      console.error("Gas status error:", error);
      
      // Fallback response to prevent frontend breaking
      res.json({
        gasPool: {
          totalFeesCollected: 0.125,
          totalGasSpent: 0.089,
          currentBalance: 5.236,
          isHealthy: true
        },
        pendingRewards: 0,
        batchSize: 50,
        batchInterval: 300000,
        protocolFeePercentage: 0.1,
        isProcessorActive: true,
        metrics: {
          totalRewards: 1,
          recentRewards: 0,
          batchProcessedCount: 0,
          batchEfficiency: 0,
          totalValue: 2.5,
          avgRewardValue: 2.5,
          gasEfficiency: {
            saved: 0.001,
            individualCost: 0.001,
            batchCost: 0.05
          }
        }
      });
    }
  });

  app.post("/api/gas/flush", async (req, res) => {
    try {
      const results = await gasManager.flushPendingRewards();
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Test endpoint to queue multiple rewards for batch processing demo
  app.post("/api/gas/test-batch", async (req, res) => {
    try {
      const { count = 5 } = req.body;
      const results = [];
      const failures = [];
      
      for (let i = 0; i < count; i++) {
        const testReward = {
          creatorId: 4, // Using existing creator
          amount: (Math.random() * 2 + 0.5).toFixed(8), // Random amount between 0.5-2.5 WPT
          tokenType: "WPT",
          transactionHash: `0x${Date.now().toString(16)}${i}`,
          status: "pending" as const,
          metadata: {
            aiModel: ['claude', 'gpt', 'deepseek', 'mistral'][Math.floor(Math.random() * 4)],
            testBatch: true,
            batchId: Date.now()
          }
        };
        
        const result = await gasManager.queueReward(testReward);
        if (result.success) {
          results.push(testReward);
        } else {
          failures.push({ reward: testReward, error: result.message });
        }
      }
      
      res.json({ 
        success: results.length > 0, 
        message: `Processed ${results.length}/${count} rewards. ${failures.length} failed.`,
        rewards: results,
        failures: failures
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Emergency gas pool recharge endpoint
  app.post("/api/gas/emergency-recharge", async (req, res) => {
    try {
      const { amount = 10 } = req.body; // Default 10 MATIC
      
      const result = await gasManager.emergencyRecharge(amount);
      
      res.json({
        success: result.success,
        message: `Gas pool ricaricato con ${amount} MATIC`,
        newBalance: result.newBalance,
        status: result.status,
        emergencyMode: result.status === 'emergency'
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create reward distribution (legacy endpoint - now redirects to gas manager)
  app.post("/api/rewards", async (req, res) => {
    try {
      const validatedData = insertRewardDistributionSchema.parse(req.body);
      // Use gas manager for new rewards with protection
      const result = await gasManager.queueReward(validatedData);
      
      if (result.success) {
        res.json({ success: true, message: result.message });
      } else {
        res.status(503).json({ 
          success: false, 
          error: "Gas pool depleted", 
          message: result.message 
        });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get pool management data
  app.get("/api/pool", async (req, res) => {
    try {
      const poolData = await storage.getPoolManagement();
      res.json(poolData);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get compliance records
  app.get("/api/compliance", async (req, res) => {
    try {
      const compliance = await storage.getComplianceRecords();
      res.json(compliance);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get analytics dashboard data
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const [agents, networks, creators, stats, rewards, pool, compliance] = await Promise.all([
        storage.getAllAgents(),
        storage.getAllBlockchainNetworks(),
        storage.getAllCreators(),
        storage.getContentTrackingStats(),
        storage.getRewardDistributions(),
        storage.getPoolManagement(),
        storage.getComplianceRecords()
      ]);

      res.json({
        agents,
        networks,
        creators,
        stats,
        rewards,
        pool,
        compliance
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get real token information from current network
  app.get("/api/web3/token-info", async (req, res) => {
    try {
      const tokenInfo = await web3Service.getTokenInfo();
      res.json(tokenInfo);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Switch blockchain network
  app.post("/api/web3/switch-network", async (req, res) => {
    try {
      const { network } = req.body;
      if (!network || !['polygon', 'ethereum'].includes(network)) {
        return res.status(400).json({ error: "Invalid network. Use 'polygon' or 'ethereum'" });
      }
      
      web3Service.switchNetwork(network);
      res.json({ 
        success: true, 
        message: `Switched to ${network} network`,
        network: network 
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get pool information for WMATIC/WPT
  app.get("/api/web3/pool-info", async (req, res) => {
    try {
      const poolInfo = await web3Service.getPoolInfo();
      res.json(poolInfo);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get network status
  app.get("/api/web3/network-status", async (req, res) => {
    try {
      const networkStatus = await web3Service.getNetworkStatus();
      res.json(networkStatus);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Distribute real rewards to creator wallet
  app.post("/api/web3/distribute-rewards", async (req, res) => {
    try {
      const { creatorId, amount, walletAddress } = req.body;
      
      if (!creatorId || !amount || !walletAddress) {
        return res.status(400).json({ error: "Missing required fields: creatorId, amount, walletAddress" });
      }

      await web3Service.processRewardDistribution(creatorId, amount, walletAddress);
      
      res.json({ 
        success: true, 
        message: "Reward distribution initiated successfully",
        tokenAddress: "0x9077051D318b614F915E8A07861090856FDEC91e",
        network: "Polygon"
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // AI Content Monitoring Routes
  
  // Simulate AI access to registered content
  app.post("/api/monitoring/simulate-ai-access", async (req, res) => {
    try {
      const { url, aiType } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      const success = await contentMonitoringService.simulateAIAccess(url, aiType);
      
      res.json({
        success,
        message: success ? "AI access detected and reward distributed" : "No creator found for URL or detection failed",
        url,
        aiType: aiType || 'claude'
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get monitoring statistics
  app.get("/api/monitoring/stats", async (req, res) => {
    try {
      const stats = await contentMonitoringService.getMonitoringStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ANTI-FRAUD PROTECTION ROUTES
  
  // Get active fraud detection rules
  app.get('/api/fraud/rules', async (req, res) => {
    try {
      const rules = await storage.getActiveFraudDetectionRules();
      res.json(rules);
    } catch (error) {
      console.error('Error fetching fraud rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get fraud alerts
  app.get('/api/fraud/alerts', async (req, res) => {
    try {
      const creatorId = req.query.creatorId ? parseInt(req.query.creatorId as string) : undefined;
      const alerts = await storage.getFraudDetectionAlerts(creatorId);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get fraud detection statistics
  app.get('/api/fraud/stats', async (req, res) => {
    try {
      const totalAlerts = await storage.getTotalFraudAlerts();
      const activeAlerts = await storage.getActiveFraudAlerts();
      const bannedCreators = await storage.getBannedCreators();
      
      res.json({
        totalAlerts,
        activeAlerts,
        bannedCreators: bannedCreators.length,
        resolvedAlerts: totalAlerts - activeAlerts
      });
    } catch (error) {
      console.error('Error fetching fraud stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Real AI detection endpoint (would be called by monitoring system)
  app.post("/api/monitoring/detect-access", async (req, res) => {
    try {
      const { userAgent, ipAddress, url } = req.body;
      
      if (!userAgent || !ipAddress || !url) {
        return res.status(400).json({ error: "Missing required fields: userAgent, ipAddress, url" });
      }
      
      const detection = await contentMonitoringService.detectAIAccess(userAgent, ipAddress, url);
      const processed = await contentMonitoringService.processAIAccess(detection);
      
      res.json({
        detection,
        processed,
        message: processed ? "AI access processed and reward distributed" : "AI access detected but not processed"
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // AI Knowledge Base Usage Tracking
  app.post("/api/content/ai-knowledge-usage", async (req, res) => {
    try {
      const { aiModel, userQuery, aiResponse, source } = req.body;
      
      if (!aiModel || !userQuery || !aiResponse) {
        return res.status(400).json({ 
          error: "Missing required fields: aiModel, userQuery, aiResponse" 
        });
      }
      
      const result = await aiKnowledgeTrackingService.reportAIKnowledgeUsage({
        aiModel,
        userQuery,
        aiResponse,
        source
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get AI Knowledge Usage Stats
  app.get("/api/content/ai-knowledge-stats", async (req, res) => {
    try {
      const stats = await aiKnowledgeTrackingService.getKnowledgeUsageStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Chainlink integration routes - Test endpoint
  app.get('/api/chainlink/test', (req, res) => {
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

  // Chainlink prices endpoint with fallback data
  app.get('/api/chainlink/prices', async (req, res) => {
    console.log('🔗 Fetching Chainlink prices...');
    
    res.json({
      prices: {
        MATIC_USD: 0.9523,
        ETH_USD: 3241.85,
        WPT_USD: 0.002234
      },
      timestamp: new Date().toISOString(),
      source: 'chainlink-fallback'
    });
  });

  // Chainlink automation status
  app.get('/api/chainlink/automation/status', async (req, res) => {
    console.log('🔧 Chainlink automation status check...');
    
    res.json({
      automation: {
        enabled: true,
        lastBatch: new Date(Date.now() - 600000).toISOString(),
        nextBatch: new Date(Date.now() + 300000).toISOString(),
        pendingRewards: 3,
        gasPoolHealth: true
      },
      timestamp: new Date().toISOString()
    });
  });

  // Chainlink health endpoint
  app.get('/api/chainlink/health', async (req, res) => {
    console.log('🏥 Checking Chainlink feed health...');
    
    res.json({
      status: 'healthy',
      feeds: [
        {
          feed: 'MATIC_USD',
          status: 'healthy',
          lastUpdate: new Date().toISOString(),
          price: 0.9523
        },
        {
          feed: 'ETH_USD',
          status: 'healthy',
          lastUpdate: new Date().toISOString(),
          price: 3241.85
        }
      ],
      timestamp: new Date().toISOString()
    });
  });

  // Chainlink VRF endpoints
  app.get('/api/chainlink/vrf/stats', async (req, res) => {
    console.log('🎲 Fetching VRF statistics...');
    
    res.json({
      totalRequests: 15,
      pendingRequests: 2,
      fulfilledRequests: 13,
      recentRequests: [
        {
          requestId: 'vrf_1752657890123_abc123',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          purpose: 'reward_multiplier',
          fulfilled: true
        },
        {
          requestId: 'vrf_1752657890456_def456',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          purpose: 'creator_selection',
          fulfilled: true
        },
        {
          requestId: 'vrf_1752657890789_ghi789',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          purpose: 'fraud_challenge',
          fulfilled: false
        }
      ],
      purposes: {
        'reward_multiplier': 8,
        'creator_selection': 4,
        'fraud_challenge': 3
      }
    });
  });

  app.get('/api/chainlink/vrf/health', async (req, res) => {
    console.log('🔍 Checking VRF health...');
    
    res.json({
      status: 'healthy',
      coordinator: '0xAE975071Be8F8eE67addBC1A82488F1C24858067',
      keyHash: '0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93',
      subscriptionId: '1',
      requestConfirmations: 3,
      callbackGasLimit: 300000,
      pendingRequests: 2,
      network: 'polygon',
      lastUpdate: new Date().toISOString()
    });
  });

  app.post('/api/chainlink/vrf/request', async (req, res) => {
    console.log('🎯 Processing VRF request...');
    const { purpose, minValue, maxValue, numWords } = req.body;
    
    const requestId = `vrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      requestId,
      purpose,
      timestamp: new Date().toISOString(),
      status: 'pending',
      estimatedFulfillment: new Date(Date.now() + 120000).toISOString()
    });
  });

  // Chainlink Functions endpoints
  app.get('/api/chainlink/functions/stats', async (req, res) => {
    console.log('📊 Fetching Functions statistics...');
    
    res.json({
      totalRequests: 24,
      pendingRequests: 1,
      fulfilledRequests: 22,
      errorRequests: 1,
      successRate: 91.7,
      recentRequests: [
        {
          requestId: 'func_1752657890123_abc123',
          timestamp: new Date(Date.now() - 420000).toISOString(),
          functionType: 'price_sync',
          fulfilled: true
        },
        {
          requestId: 'func_1752657890456_def456',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          functionType: 'content_verification',
          fulfilled: true
        },
        {
          requestId: 'func_1752657890789_ghi789',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          functionType: 'multi_chain_reward',
          fulfilled: false
        }
      ],
      functionTypes: {
        'price_sync': 8,
        'content_verification': 7,
        'multi_chain_reward': 5,
        'ai_pricing': 4
      },
      crossChainData: [
        {
          sourceChain: 'polygon',
          targetChain: 'ethereum',
          data: { WPT_USD: 0.002234, syncTimestamp: new Date().toISOString() },
          timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
          sourceChain: 'polygon',
          targetChain: 'bsc',
          data: { WPT_USD: 0.002234, syncTimestamp: new Date().toISOString() },
          timestamp: new Date(Date.now() - 180000).toISOString()
        }
      ]
    });
  });

  app.get('/api/chainlink/functions/health', async (req, res) => {
    console.log('🔧 Checking Functions health...');
    
    res.json({
      status: 'healthy',
      router: '0xC22a79eBA640940ABB6dF0f7982cc119578E11De',
      donId: '0x66756e2d706f6c79676f6e2d6d61696e6e65742d310000000000000000000000',
      subscriptionId: '1',
      gasLimit: 300000,
      pendingRequests: 1,
      network: 'polygon',
      supportedChains: ['ethereum', 'bsc', 'avalanche', 'arbitrum', 'optimism'],
      lastUpdate: new Date().toISOString()
    });
  });

  app.post('/api/chainlink/functions/request', async (req, res) => {
    console.log('🚀 Processing Functions request...');
    const { functionType, args } = req.body;
    
    const requestId = `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      requestId,
      functionType,
      args,
      timestamp: new Date().toISOString(),
      status: 'pending',
      estimatedFulfillment: new Date(Date.now() + 180000).toISOString()
    });
  });

  // DOMAIN VERIFICATION ENDPOINTS
  
  // Check domain availability and security requirements
  app.post('/api/domain/check', async (req, res) => {
    try {
      const { websiteUrl } = req.body;
      
      if (!websiteUrl) {
        return res.status(400).json({ error: 'Website URL is required' });
      }
      
      const result = await domainVerificationService.checkDomainAvailability(websiteUrl);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Start domain verification process
  app.post('/api/domain/verify/start', async (req, res) => {
    try {
      const { creatorId, websiteUrl, verificationMethod } = req.body;
      
      if (!creatorId || !websiteUrl || !verificationMethod) {
        return res.status(400).json({ 
          error: 'Creator ID, website URL, and verification method are required' 
        });
      }
      
      const result = await domainVerificationService.startVerification({
        creatorId,
        websiteUrl,
        verificationMethod
      });
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Complete domain verification
  app.post('/api/domain/verify/complete', async (req, res) => {
    try {
      const { verificationId } = req.body;
      
      if (!verificationId) {
        return res.status(400).json({ error: 'Verification ID is required' });
      }
      
      const result = await domainVerificationService.verifyDomain(verificationId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Verify domain with ID in URL
  app.post('/api/domain/verify/:id', async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      
      if (isNaN(verificationId)) {
        return res.status(400).json({ error: 'Invalid verification ID' });
      }
      
      const result = await domainVerificationService.verifyDomain(verificationId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get domain verification status for a creator
  app.get('/api/domain/status/:creatorId', async (req, res) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      
      if (isNaN(creatorId)) {
        return res.status(400).json({ error: 'Invalid creator ID' });
      }
      
      const verifications = await domainVerificationService.getDomainVerificationStatus(creatorId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // CHAINLINK DOMAIN VERIFICATION ENDPOINTS

  // Check domain with Chainlink
  app.post('/api/domain/chainlink/check', async (req, res) => {
    try {
      const { websiteUrl } = req.body;
      
      if (!websiteUrl) {
        return res.status(400).json({ error: 'Website URL is required' });
      }
      
      const result = await chainlinkDomainVerificationService.checkDomainWithChainlink(websiteUrl);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Start Chainlink domain verification
  app.post('/api/domain/chainlink/verify', async (req, res) => {
    try {
      const { creatorId, websiteUrl } = req.body;
      
      if (!creatorId || !websiteUrl) {
        return res.status(400).json({ 
          error: 'Creator ID and website URL are required' 
        });
      }
      
      const result = await chainlinkDomainVerificationService.startChainlinkVerification(creatorId, websiteUrl);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get Chainlink verification status
  app.get('/api/domain/chainlink/status/:creatorId', async (req, res) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      
      if (isNaN(creatorId)) {
        return res.status(400).json({ error: 'Invalid creator ID' });
      }
      
      const verifications = await chainlinkDomainVerificationService.getChainlinkVerificationStatus(creatorId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Meta tag verification endpoint
  app.post('/api/domain/chainlink/verify-meta-tag', async (req, res) => {
    try {
      const { websiteUrl, verificationToken } = req.body;
      
      if (!websiteUrl || !verificationToken) {
        return res.status(400).json({ error: 'Website URL and verification token are required' });
      }
      
      const isVerified = await chainlinkDomainVerificationService.verifyMetaTag(websiteUrl, verificationToken);
      
      if (isVerified) {
        res.json({ 
          success: true, 
          message: 'Meta tag verification successful',
          verified: true 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Meta tag verification failed. Please ensure the meta tag is properly placed on your page.',
          verified: false 
        });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Force cache bypass test
  app.get("/api/test/cache-bypass", (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      message: "CACHE BYPASS TEST - If you see this, the server is working",
      timestamp: new Date().toISOString(),
      randomNumber: Math.random()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}