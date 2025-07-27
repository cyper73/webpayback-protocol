import { InsertContentTracking, ContentTracking } from "@shared/schema";
import { storage } from "../storage";
import { web3Service } from "./web3";
import { fraudDetectionService } from "./fraudDetection";
import { gasManager } from "./gasManager";
import { channelMonitoringService } from "./channelMonitoring";
import { mevProtectionService } from "./mevProtection";
import { poolDrainProtectionService } from "./poolDrainProtection";
import { fakeCreatorDetection } from "./fakeCreatorDetection";
import { aiQueryProtection } from "./aiQueryProtection";
import { vpnDetection } from "./vpnDetection";

interface AIAccessDetection {
  userAgent: string;
  ipAddress: string;
  url: string;
  timestamp: Date;
  aiType: 'claude' | 'gpt' | 'gemini' | 'deepseek' | 'grok' | 'mistral' | 'llama' | 'cohere' | 'perplexity' | 'you' | 'bing' | 'character' | 'jasper' | 'writesonic' | 'copy' | 'anyword' | 'rytr' | 'bot' | 'unknown';
  confidence: number;
}

interface ContentFingerprint {
  contentHash: string;
  title: string;
  description: string;
  keywords: string[];
  length: number;
  language: string;
}

class ContentMonitoringService {
  private readonly AI_USER_AGENTS = [
    // Major AI Models
    'Claude', 'Anthropic',
    'GPT', 'OpenAI', 'ChatGPT',
    'Gemini', 'Bard', 'Google-AI',
    'DeepSeek', 'DeepSeek-V2', 'DeepSeek-Coder',
    'Grok', 'xAI', 'X-AI',
    'Mistral', 'Mixtral', 'Codestral',
    'Llama', 'Meta-AI', 'Code-Llama',
    'Cohere', 'Command', 'Coral',
    'Perplexity', 'Pplx', 'Sonar',
    'You.com', 'YouChat', 'YouCode',
    'Bing', 'CoPilot', 'Sydney',
    'Character.AI', 'Character',
    'Jasper', 'Jasper.ai',
    'Writesonic', 'ChatSonic',
    'Copy.ai', 'CopyAI',
    'Anyword', 'Rytr',
    // AI Coding Assistants
    'GitHub-Copilot', 'Copilot',
    'Cursor', 'Cursor-AI',
    'Tabnine', 'Tabnine-AI',
    'Kite', 'Kite-AI',
    'Codeium', 'Codeium-AI',
    'Sourcegraph', 'Cody',
    'Replit-AI', 'Ghostwriter',
    // AI Research & Analytics
    'Claude-Instant', 'Claude-2', 'Claude-3',
    'GPT-3.5', 'GPT-4', 'GPT-4-Turbo',
    'PaLM', 'Flamingo', 'Chinchilla',
    'AlphaCode', 'Codex', 'CodeT5',
    // Generic AI Indicators
    'AI-Agent', 'AI-Bot', 'AI-Assistant',
    'Bot', 'Crawler', 'Spider', 'Scraper',
    'Neural', 'Transformer', 'Language-Model',
    'LLM', 'NLP', 'ML-Model'
  ];

  private readonly AI_IP_PATTERNS = [
    // OpenAI IP ranges
    /^20\.102\./, /^13\.107\./, /^40\.83\./, /^52\.247\./,
    // Anthropic IP ranges  
    /^34\.102\./, /^35\.247\./, /^34\.168\./, /^35\.199\./,
    // Google AI IP ranges
    /^34\.149\./, /^35\.186\./, /^34\.107\./, /^35\.244\./,
    // DeepSeek IP ranges (China)
    /^114\.132\./, /^202\.147\./, /^39\.105\./, /^121\.40\./,
    // X.AI (Grok) IP ranges
    /^104\.18\./, /^172\.67\./, /^104\.16\./, /^172\.64\./,
    // Mistral AI IP ranges (France)
    /^51\.15\./, /^51\.158\./, /^163\.172\./, /^195\.154\./,
    // Meta AI IP ranges
    /^31\.13\./, /^157\.240\./, /^173\.252\./, /^179\.60\./,
    // Cohere IP ranges
    /^35\.203\./, /^34\.95\./, /^35\.247\./, /^34\.102\./,
    // Perplexity IP ranges
    /^52\.84\./, /^54\.230\./, /^99\.84\./, /^13\.224\./,
    // Microsoft/Bing IP ranges
    /^13\.107\./, /^20\.190\./, /^40\.76\./, /^52\.167\./,
    // Generic AI service IP ranges
    /^34\.80\./, /^35\.190\./, /^104\.199\./, /^146\.148\./,
    // AWS AI services
    /^52\.86\./, /^54\.147\./, /^3\.80\./, /^18\.206\./,
    // Azure AI services
    /^20\.42\./, /^40\.71\./, /^52\.177\./, /^13\.82\./,
    // GCP AI services
    /^35\.201\./, /^34\.73\./, /^35\.229\./, /^34\.122\./
  ];

  async detectAIAccess(userAgent: string, ipAddress: string, url: string): Promise<AIAccessDetection> {
    const aiType = this.identifyAIType(userAgent);
    const confidence = this.calculateConfidence(userAgent, ipAddress);
    
    return {
      userAgent,
      ipAddress,
      url,
      timestamp: new Date(),
      aiType,
      confidence
    };
  }

  private identifyAIType(userAgent: string): AIAccessDetection['aiType'] {
    const lowerUA = userAgent.toLowerCase();
    
    // Advanced AI Models
    if (lowerUA.includes('claude') || lowerUA.includes('anthropic')) return 'claude';
    if (lowerUA.includes('gpt') || lowerUA.includes('openai') || lowerUA.includes('chatgpt')) return 'gpt';
    if (lowerUA.includes('gemini') || lowerUA.includes('bard') || lowerUA.includes('google-ai')) return 'gemini';
    if (lowerUA.includes('deepseek') || lowerUA.includes('deepseek-v2') || lowerUA.includes('deepseek-coder')) return 'deepseek';
    if (lowerUA.includes('grok') || lowerUA.includes('xai') || lowerUA.includes('x-ai')) return 'grok';
    if (lowerUA.includes('mistral') || lowerUA.includes('mixtral') || lowerUA.includes('codestral')) return 'mistral';
    if (lowerUA.includes('llama') || lowerUA.includes('meta-ai') || lowerUA.includes('code-llama')) return 'llama';
    if (lowerUA.includes('cohere') || lowerUA.includes('command') || lowerUA.includes('coral')) return 'cohere';
    if (lowerUA.includes('perplexity') || lowerUA.includes('pplx') || lowerUA.includes('sonar')) return 'perplexity';
    if (lowerUA.includes('you.com') || lowerUA.includes('youchat') || lowerUA.includes('youcode')) return 'you';
    if (lowerUA.includes('bing') || lowerUA.includes('copilot') || lowerUA.includes('sydney')) return 'bing';
    if (lowerUA.includes('character.ai') || lowerUA.includes('character')) return 'character';
    if (lowerUA.includes('jasper') || lowerUA.includes('jasper.ai')) return 'jasper';
    if (lowerUA.includes('writesonic') || lowerUA.includes('chatsonic')) return 'writesonic';
    if (lowerUA.includes('copy.ai') || lowerUA.includes('copyai')) return 'copy';
    if (lowerUA.includes('anyword')) return 'anyword';
    if (lowerUA.includes('rytr')) return 'rytr';
    
    // Generic AI indicators
    if (this.AI_USER_AGENTS.some(agent => lowerUA.includes(agent.toLowerCase()))) return 'bot';
    
    return 'unknown';
  }

  private calculateConfidence(userAgent: string, ipAddress: string): number {
    let confidence = 0;
    
    // User agent analysis
    if (this.AI_USER_AGENTS.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()))) {
      confidence += 0.4;
    }
    
    // IP pattern analysis
    if (this.AI_IP_PATTERNS.some(pattern => pattern.test(ipAddress))) {
      confidence += 0.3;
    }
    
    // Behavioral patterns
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      confidence += 0.2;
    }
    
    // Missing typical browser headers
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  async createContentFingerprint(url: string): Promise<ContentFingerprint> {
    try {
      // In a real implementation, this would fetch and analyze the content
      // For now, we'll create a fingerprint based on URL and current data
      const contentHash = this.generateContentHash(url);
      
      return {
        contentHash,
        title: this.extractTitleFromURL(url),
        description: "AI-tracked content from registered creator",
        keywords: this.extractKeywords(url),
        length: Math.floor(Math.random() * 5000) + 1000,
        language: "en"
      };
    } catch (error) {
      throw new Error(`Failed to create content fingerprint: ${error}`);
    }
  }

  private generateContentHash(url: string): string {
    // Simple hash generation - in real implementation would use actual content
    const timestamp = Date.now().toString();
    const combined = url + timestamp;
    return this.simpleHash(combined);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private extractTitleFromURL(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || urlObj.hostname;
    } catch {
      return "Unknown Content";
    }
  }

  private extractKeywords(url: string): string[] {
    const keywords = [];
    if (url.includes('github')) keywords.push('github', 'code', 'repository');
    if (url.includes('webpayback')) keywords.push('webpayback', 'protocol', 'blockchain');
    if (url.includes('ai')) keywords.push('ai', 'artificial intelligence');
    return keywords.length > 0 ? keywords : ['content', 'web', 'creator'];
  }

  async processAIAccess(detection: AIAccessDetection): Promise<boolean> {
    try {
      // Check if URL belongs to a channel (priority check)
      const channelResult = await channelMonitoringService.isChannelContent(detection.url);
      let creator = null;
      
      if (channelResult.isChannelContent && channelResult.creatorId) {
        // URL belongs to a registered channel
        creator = await storage.getCreator(channelResult.creatorId);
        console.log(`Channel content detected for creator ${channelResult.creatorId}, URL: ${detection.url}`);
      } else {
        // Fallback to single URL lookup
        const creators = await storage.getAllCreators();
        creator = creators.find(c => detection.url.includes(c.websiteUrl) || c.websiteUrl.includes(detection.url));
      }
      
      if (!creator) {
        console.log(`No creator found for URL: ${detection.url}`);
        return false;
      }

      // Only process if confidence is high enough
      if (detection.confidence < 0.3) {
        console.log(`Low confidence AI detection: ${detection.confidence}`);
        return false;
      }

      // 🤖 AI QUERY ANALYSIS - Check for spam/bot queries
      console.log(`🤖 Analyzing AI query for spam detection...`);
      const queryAnalysis = await aiQueryProtection.analyzeAIQuery({
        query: detection.url, // Using URL as query for now
        aiModel: detection.aiType,
        ipAddress: detection.ipAddress,
        userAgent: detection.userAgent,
        timestamp: detection.timestamp,
        responseTime: 200
      });

      if (queryAnalysis.recommendation === 'BLOCK') {
        console.log(`🚨 AI QUERY BLOCKED - Spam/fraud detected:
          Risk Score: ${queryAnalysis.riskScore}%
          Reasons: ${queryAnalysis.reasons.join(', ')}
          Confidence: ${(queryAnalysis.confidence * 100).toFixed(1)}%`);
        return false;
      }

      // 🌐 VPN/PROXY DETECTION - Check IP legitimacy
      console.log(`🌐 Analyzing IP for VPN/proxy usage...`);
      const vpnAnalysis = await vpnDetection.analyzeIP(detection.ipAddress, detection.userAgent);

      if (vpnAnalysis.recommendation === 'BLOCK') {
        console.log(`🚨 VPN/PROXY BLOCKED - Suspicious IP detected:
          Risk Score: ${vpnAnalysis.riskScore}%
          Reasons: ${vpnAnalysis.reasons.join(', ')}
          Country: ${vpnAnalysis.country}
          Provider: ${vpnAnalysis.provider || 'Unknown'}`);
        return false;
      }

      // 🔒 ANTI-FRAUD ANALYSIS
      const fraudAnalysis = await fraudDetectionService.analyzeCreatorAccess(creator.id, {
        url: detection.url,
        ipAddress: detection.ipAddress,
        aiType: detection.aiType,
        userAgent: detection.userAgent,
        timestamp: detection.timestamp
      });

      // Block reward if fraudulent activity detected
      if (fraudAnalysis.isFraudulent) {
        console.log(`🚨 FRAUD DETECTED - Blocking reward:
          Creator: ${creator.id}
          Risk Score: ${fraudAnalysis.riskScore}%
          Reasons: ${fraudAnalysis.reasons.join(', ')}
          Action: ${fraudAnalysis.recommendedAction}`);
        
        return false; // Block the reward
      }

      // 🔍 FAKE CREATOR DETECTION CHECK
      console.log(`🔍 Checking for fake creator: ${creator.websiteUrl}`);
      try {
        const fakeCreatorCheck = await fakeCreatorDetection.detectFakeCreator(creator.id, creator.websiteUrl);
        
        if (fakeCreatorCheck.shouldBlock) {
          console.log(`🚨 FAKE CREATOR DETECTED - Blocking reward:
            Creator: ${creator.id}
            URL: ${creator.websiteUrl}
            Similarity Score: ${fakeCreatorCheck.similarityScore}%
            Risk Score: ${fakeCreatorCheck.riskScore}%
            Evidence: ${fakeCreatorCheck.evidence}`);
          return false; // Block the reward
        }

        console.log(`✅ Creator legitimacy verified: ${creator.websiteUrl}`);
      } catch (error) {
        console.error(`❌ Error checking fake creator: ${error}`);
        // Continue with reward process if fake detection fails
      }

      // Create content fingerprint
      const fingerprint = await this.createContentFingerprint(detection.url);
      
      // Track the content access
      const trackingData: InsertContentTracking = {
        creatorId: creator.id,
        contentHash: fingerprint.contentHash,
        accessType: "ai_access",
        aiModel: detection.aiType,
        detectionConfidence: detection.confidence.toString(),
        // metadata field removed - not needed for schema
      };

      await storage.createContentTracking(trackingData);
      
      // Calculate reward amount based on content type and AI model
      let rewardAmount = this.calculateReward(detection.aiType, fingerprint);
      
      // Apply reputation penalty if applicable
      const reputationScore = await storage.getCreatorReputationScore(creator.id);
      if (reputationScore && reputationScore.overallScore !== null && reputationScore.overallScore < 70) {
        const penaltyMultiplier = Math.max(0.1, reputationScore.overallScore / 100);
        rewardAmount = (parseFloat(rewardAmount) * penaltyMultiplier).toFixed(8);
        console.log(`⚠️ Reputation penalty applied: ${penaltyMultiplier.toFixed(2)}x`);
      }
      
      // 🛡️ POOL DRAIN PROTECTION CHECK
      console.log(`🛡️ Checking pool drain protection for creator ${creator.id}`);
      
      const poolProtectionStatus = await poolDrainProtectionService.canDistributeReward(
        creator.walletAddress,
        parseFloat(rewardAmount)
      );
      
      if (!poolProtectionStatus.canDistributeReward) {
        console.log(`🚨 POOL DRAIN PROTECTION TRIGGERED - Reward blocked for creator ${creator.id}`);
        console.log(`   Risk Score: ${poolProtectionStatus.riskScore}%`);
        console.log(`   Alerts: ${poolProtectionStatus.securityAlerts.join(', ')}`);
        
        return false; // Block the reward distribution
      }
      
      console.log(`✅ Pool protection passed - Risk Score: ${poolProtectionStatus.riskScore}%`);
      
      // 🔒 MEV-PROTECTED REWARD PROCESSING
      console.log(`🔒 Initiating MEV-protected reward for creator ${creator.id}`);
      
      // Phase 1: Commit the reward (hidden beneficiary)
      const commitResult = await mevProtectionService.commitReward(creator.id, rewardAmount);
      
      if (commitResult.success) {
        console.log(`✅ MEV Protection Active - Reward committed with hash: ${commitResult.commitHash}`);
        
        // Schedule reveal phase after commit delay
        setTimeout(async () => {
          try {
            // This would normally be called by the blockchain or external system
            // For now, we simulate the reveal process
            console.log(`🔓 Revealing reward for creator ${creator.id}`);
            
            // The actual reveal would happen through a secure process
            // For demo purposes, we'll still queue through gasManager but with anti-MEV hash
            await gasManager.queueReward({
              creatorId: creator.id,
              amount: rewardAmount,
              transactionHash: `mev-protected-${commitResult.commitHash.slice(0, 16)}`,
              status: "pending",
              // metadata removed for schema compatibility
            });
          } catch (error) {
            console.error("MEV-protected reveal failed:", error);
          }
        }, 10000); // 10 second delay for demo (normally 5 minutes)
      } else {
        // Fallback to regular processing if MEV protection fails
        console.warn("MEV protection failed, falling back to regular processing");
        await gasManager.queueReward({
          creatorId: creator.id,
          amount: rewardAmount,
          transactionHash: `0x${Date.now().toString(16)}`,
          status: "pending",
          // metadata removed for schema compatibility
        });
      }

      // Also process through web3Service for immediate wallet distribution
      await web3Service.processRewardDistribution(
        creator.id,
        rewardAmount,
        creator.walletAddress
      );

      console.log(`✅ AI Access Detected and Rewarded:
        Creator: ${creator.id}
        URL: ${detection.url}
        AI Type: ${detection.aiType}
        Confidence: ${(detection.confidence * 100).toFixed(1)}%
        Reward: ${rewardAmount} WPT
        Wallet: ${creator.walletAddress}
        Risk Score: ${fraudAnalysis.riskScore}%`);

      return true;
      
    } catch (error) {
      console.error(`Failed to process AI access: ${error}`);
      return false;
    }
  }

  private calculateReward(aiType: AIAccessDetection['aiType'], fingerprint: ContentFingerprint): string {
    let baseReward = 0.5; // Base reward in WPT
    
    // Adjust based on AI type - Enhanced for all new AI models
    switch (aiType) {
      case 'claude':
        baseReward *= 1.5; // Higher reward for Claude
        break;
      case 'gpt':
        baseReward *= 1.3;
        break;
      case 'gemini':
        baseReward *= 1.2;
        break;
      case 'deepseek':
        baseReward *= 1.4; // High reward for advanced coding AI
        break;
      case 'grok':
        baseReward *= 1.25; // X.AI premium model
        break;
      case 'mistral':
        baseReward *= 1.2; // European AI excellence
        break;
      case 'llama':
        baseReward *= 1.1; // Meta's open source
        break;
      case 'cohere':
        baseReward *= 1.05; // Enterprise focused
        break;
      case 'perplexity':
        baseReward *= 1.0; // Search-focused AI
        break;
      case 'you':
        baseReward *= 0.95; // You.com AI
        break;
      case 'bing':
        baseReward *= 0.9; // Microsoft Copilot
        break;
      case 'character':
        baseReward *= 0.85; // Character.AI
        break;
      case 'jasper':
        baseReward *= 0.8; // Content creation AI
        break;
      case 'writesonic':
        baseReward *= 0.75; // Writing assistant
        break;
      case 'copy':
        baseReward *= 0.7; // Copy.ai
        break;
      case 'anyword':
        baseReward *= 0.65; // Marketing AI
        break;
      case 'rytr':
        baseReward *= 0.6; // Writing tool
        break;
      case 'bot':
        baseReward *= 1.0;
        break;
      default:
        baseReward *= 0.8;
    }
    
    // Adjust based on content length
    if (fingerprint.length > 3000) {
      baseReward *= 1.2;
    }
    
    // Adjust based on keywords
    if (fingerprint.keywords.includes('blockchain') || fingerprint.keywords.includes('ai')) {
      baseReward *= 1.3;
    }
    
    // Add AI-specific bonuses
    const aiTypeBonuses = {
      'deepseek': 0.15,   // Bonus for advanced coding AI
      'grok': 0.10,       // Premium AI bonus
      'mistral': 0.08,    // European AI bonus
      'claude': 0.05,     // Anthropic quality bonus
      'gpt': 0.03         // OpenAI standard bonus
    };
    
    const bonus = aiTypeBonuses[aiType as keyof typeof aiTypeBonuses] || 0;
    baseReward += bonus;
    
    return baseReward.toFixed(8);
  }

  // Simulate AI access for testing - Enhanced for all AI types
  async simulateAIAccess(url: string, aiType: AIAccessDetection['aiType'] = 'claude'): Promise<boolean> {
    const aiUserAgents = {
      'claude': 'Claude-AI/2.1 (Anthropic)',
      'gpt': 'GPT-4/1.0 (OpenAI)',
      'gemini': 'Gemini-Pro/1.0 (Google)',
      'deepseek': 'DeepSeek-V2/1.0 (DeepSeek)',
      'grok': 'Grok-2/1.0 (X.AI)',
      'mistral': 'Mistral-Large/1.0 (Mistral AI)',
      'llama': 'Llama-3/1.0 (Meta)',
      'cohere': 'Command-R/1.0 (Cohere)',
      'perplexity': 'Perplexity-AI/1.0 (Perplexity)',
      'you': 'YouChat/1.0 (You.com)',
      'bing': 'Bing-Chat/1.0 (Microsoft)',
      'character': 'Character-AI/1.0 (Character.AI)',
      'jasper': 'Jasper-AI/1.0 (Jasper)',
      'writesonic': 'ChatSonic/1.0 (Writesonic)',
      'copy': 'Copy.ai/1.0 (Copy.ai)',
      'anyword': 'Anyword/1.0 (Anyword)',
      'rytr': 'Rytr/1.0 (Rytr)',
      'bot': 'Generic-AI-Bot/1.0',
      'unknown': 'Unknown-AI/1.0'
    };

    const aiIPAddresses = {
      'claude': '34.102.136.180',
      'gpt': '20.102.46.123',
      'gemini': '34.149.100.10',
      'deepseek': '114.132.45.67',
      'grok': '104.18.25.30',
      'mistral': '51.15.78.90',
      'llama': '31.13.64.35',
      'cohere': '35.203.85.40',
      'perplexity': '52.84.95.20',
      'you': '54.230.75.15',
      'bing': '13.107.42.14',
      'character': '35.190.65.25',
      'jasper': '34.73.88.50',
      'writesonic': '52.177.45.60',
      'copy': '18.206.90.75',
      'anyword': '40.71.55.80',
      'rytr': '52.167.33.90',
      'bot': '104.199.25.15',
      'unknown': '192.168.1.1'
    };

    const mockDetection: AIAccessDetection = {
      userAgent: aiUserAgents[aiType] || aiUserAgents['unknown'],
      ipAddress: aiIPAddresses[aiType] || aiIPAddresses['unknown'],
      url: url,
      timestamp: new Date(),
      aiType: aiType,
      confidence: 0.85
    };

    return await this.processAIAccess(mockDetection);
  }

  async getMonitoringStats(): Promise<any> {
    const stats = await storage.getContentTrackingStats();
    return {
      totalAIAccesses: stats.totalAccesses || 0,
      totalRewardsDistributed: stats.totalRewards || 0,
      topAIModels: stats.topModels || [],
      recentActivity: stats.recentActivity || []
    };
  }
}

export const contentMonitoringService = new ContentMonitoringService();