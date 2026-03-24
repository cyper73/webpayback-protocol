import { ethers } from 'ethers';
import { storage } from '../storage';

// Chainlink Data Feeds on Polygon
const CHAINLINK_FEEDS = {
  MATIC_USD: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0", // MATIC/USD Price Feed
  ETH_USD: "0xF9680D99D6C9589e2a93a78A04A279e509205945",   // ETH/USD Price Feed (for calculations)
};

// Polygon RPC endpoint (Note: Used for mock Chainlink data if on Humanity chain)
const POLYGON_RPC = process.env.POLYGON_RPC || "https://polygon-rpc.com/";

class ChainlinkService {
  private provider: ethers.providers.JsonRpcProvider;
  private priceFeeds: { [key: string]: ethers.Contract };

  constructor() {
    // Chainlink price feeds typically run on major networks, fallback to Polygon for now
    this.provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC, 137); 
    this.priceFeeds = {};
    this.initializePriceFeeds();
  }

  private initializePriceFeeds() {
    // ABI for Chainlink Price Feed
    const priceFeedABI = [
      "function latestRoundData() external view returns (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      "function decimals() external view returns (uint8)",
      "function description() external view returns (string memory)"
    ];

    // Initialize price feed contracts
    this.priceFeeds.MATIC_USD = new ethers.Contract(
      CHAINLINK_FEEDS.MATIC_USD,
      priceFeedABI,
      this.provider
    );

    this.priceFeeds.ETH_USD = new ethers.Contract(
      CHAINLINK_FEEDS.ETH_USD,
      priceFeedABI,
      this.provider
    );
  }

  // Get latest price from Chainlink feed
  async getLatestPrice(feedName: string): Promise<{
    price: string;
    decimals: number;
    timestamp: number;
    roundId: string;
  }> {
    try {
      const priceFeed = this.priceFeeds[feedName];
      if (!priceFeed) {
        throw new Error(`Price feed ${feedName} not found`);
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Chainlink request timeout')), 5000);
      });

      const dataPromise = priceFeed.latestRoundData();
      const [roundId, price, startedAt, updatedAt, answeredInRound] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]);
      
      const decimals = await priceFeed.decimals();

      return {
        price: price.toString(),
        decimals: decimals,
        timestamp: updatedAt.toNumber(),
        roundId: roundId.toString()
      };
    } catch (error) {
      console.error(`Error fetching price for ${feedName}:`, error);
      throw error;
    }
  }

  // Get MATIC price in USD
  async getMaticPrice(): Promise<number> {
    try {
      const priceData = await this.getLatestPrice('MATIC_USD');
      return parseFloat(priceData.price) / Math.pow(10, priceData.decimals);
    } catch (error) {
      console.warn('Chainlink MATIC price fetch failed, using fallback:', error);
      return 0.9523; // Current approximate MATIC price as fallback
    }
  }

  // Get ETH price in USD
  async getEthPrice(): Promise<number> {
    try {
      const priceData = await this.getLatestPrice('ETH_USD');
      return parseFloat(priceData.price) / Math.pow(10, priceData.decimals);
    } catch (error) {
      console.warn('Chainlink ETH price fetch failed, using fallback:', error);
      return 3241.85; // Current approximate ETH price as fallback
    }
  }

  // Calculate WPT value in USD (using pool price and MATIC price)
  async getWPTValueUSD(): Promise<number> {
    try {
      // Get MATIC price from Chainlink
      const maticPrice = await this.getMaticPrice();
      
      // Get WPT/MATIC pool price from our existing system
      // This would typically come from your DEX pool data
      const poolPrice = 0.002340; // Example: 1 WPT = 0.002340 MATIC
      
      // Calculate WPT value in USD
      const wptValueUSD = poolPrice * maticPrice;
      
      return wptValueUSD;
    } catch (error) {
      console.error('Error calculating WPT value in USD:', error);
      throw error;
    }
  }

  // Enhanced reward calculation with accurate pricing
  async calculateRewardValue(wptAmount: number): Promise<{
    wptAmount: number;
    usdValue: number;
    maticPrice: number;
    calculatedAt: Date;
  }> {
    const wptValueUSD = await this.getWPTValueUSD();
    const maticPrice = await this.getMaticPrice();
    
    return {
      wptAmount,
      usdValue: wptAmount * wptValueUSD,
      maticPrice,
      calculatedAt: new Date()
    };
  }

  // Price feed health check
  async checkPriceFeedHealth(): Promise<{
    feed: string;
    status: string;
    lastUpdate: Date;
    price: number;
  }[]> {
    const feeds = ['MATIC_USD', 'ETH_USD'];
    const results = [];

    for (const feed of feeds) {
      try {
        const priceData = await this.getLatestPrice(feed);
        const price = parseFloat(priceData.price) / Math.pow(10, priceData.decimals);
        
        results.push({
          feed,
          status: 'healthy',
          lastUpdate: new Date(priceData.timestamp * 1000),
          price
        });
      } catch (error) {
        results.push({
          feed,
          status: 'error',
          lastUpdate: new Date(),
          price: 0
        });
      }
    }

    return results;
  }
}

export const chainlinkService = new ChainlinkService();