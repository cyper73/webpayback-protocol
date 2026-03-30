import { Request, Response, NextFunction } from "express";

/**
 * List of known AI Crawler User-Agents
 * This list identifies bots used for scraping data to train AI models.
 */
const KNOWN_AI_BOTS = [
  // US Giants
  "GPTBot",          // OpenAI
  "ChatGPT-User",    // OpenAI web browsing
  "Anthropic-ai",    // Anthropic (Claude)
  "Claude-Web",      // Anthropic web browsing
  "Google-Extended", // Google Gemini/Bard
  "CCBot",           // Common Crawl (often used for AI training)
  "meta-externalagent", // Meta (Facebook) AI
  "OAI-SearchBot",   // OpenAI Search
  "PerplexityBot",   // Perplexity AI
  "Cohere-ai",       // Cohere
  "grok",            // xAI (Elon Musk)
  "bingbot",         // Microsoft Bing/Copilot
  "Copilot",         // Microsoft Copilot
  
  // European AI
  "Mistral",         // Mistral AI (France)
  "AlephAlpha",      // Aleph Alpha (Germany)
  
  // Chinese AI
  "DeepSeek",        // DeepSeek
  "Qwen",            // Alibaba Qwen
  "Baiduspider",     // Baidu (used for Ernie)
  "YisouSpider",     // AliYun
  "Bytespider",      // ByteDance / TikTok AI
  "Sogou web spider",// Sogou (Tencent)
  
  // Audio & Music AI
  "Suno",            // Suno AI (Music generation)
  "Udio",            // Udio (Music generation)
  "ElevenLabs"       // ElevenLabs (Voice/Audio AI)
];

interface AiShieldOptions {
  walletAddress?: string;
  webhookUrl?: string;
}

/**
 * Express middleware that intercepts requests from AI bots and returns
 * a 402 Payment Required status code with a legal machine-readable payload.
 */
export function aiShieldMiddleware(options: AiShieldOptions = {}) {
  return function(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers["user-agent"] || "";
    
    // Check if the request comes from a known AI bot
    const isAiBot = KNOWN_AI_BOTS.some(bot => 
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    if (isAiBot) {
      // Determine the protected resource (for logging and dynamic payload)
      const protectedResource = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      
      // Log the interception for the dashboard analytics
      console.log(`[AI-SHIELD] Blocked scraping attempt from ${userAgent} on ${protectedResource}`);
      
      // Ping WebPayback central server if wallet address is provided
      if (options.walletAddress || options.webhookUrl) {
        const pingUrl = options.webhookUrl || "https://api.webpayback.com/api/ai/access";
        // Fire and forget webhook
        fetch(pingUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent
          },
          body: JSON.stringify({
            url: protectedResource,
            walletAddress: options.walletAddress,
            source: 'express_middleware'
          })
        }).catch(err => console.error('[AI-SHIELD] Failed to ping WebPayback:', err));
      }

      // Set headers according to the HTTP 402 spec and EU AI Act requirements
      res.setHeader("Content-Type", "application/json");
      res.setHeader("X-AI-Opt-Out", "true"); // Machine-readable opt-out
      res.setHeader("WWW-Authenticate", "WebPayback-Token realm=\"Data Licensing\"");

      // Return 402 Payment Required with the legal payload
      return res.status(402).json({
        error: "Payment Required",
        code: 402,
        message: "Access to this content for AI training or automated scraping requires a commercial license.",
        legal_notice: {
          jurisdiction: "EU AI Act (Art. 70-septies) / Digital Single Market Directive (Art. 4)",
          status: "Machine-readable opt-out active. TDM (Text and Data Mining) exception DOES NOT apply.",
          requirement: "You must purchase a WebPayback Token (WPT) license to access this payload."
        },
        licensing_endpoint: "https://webpayback.com/api/license/acquire",
        protected_resource: protectedResource,
        client_agent: userAgent
      });
    }

    // If not an AI bot, allow the request to proceed normally
    next();
  };
}
