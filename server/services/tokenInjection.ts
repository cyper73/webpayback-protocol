import * as ethers from "ethers";

/**
 * 🚀 WPT Token Injection Service
 * Secure service for founder to inject WPT tokens into contracts
 */

export interface TokenInjectionResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: string;
  gasUsed?: string;
  error?: string;
}

export class TokenInjectionService {
  private readonly WPT_CONTRACT = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825";
  private readonly provider: ethers.providers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly wptContract: ethers.Contract;

  constructor() {
    // Initialize provider and wallet (ethers v5 API)
    this.provider = new ethers.providers.JsonRpcProvider(
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` // [REDACTED_FOR_GITHUB_SECURITY]
    );
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider); // [REDACTED_FOR_GITHUB_SECURITY]

    // WPT contract ABI (minimal for transfer)
    const wptABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];

    this.wptContract = new ethers.Contract(
      this.WPT_CONTRACT,
      wptABI,
      this.wallet
    );
  }

  /**
   * Inject WPT tokens from founder wallet to target contract
   */
  async injectTokens(
    targetContract: string,
    amount: string,
    founderWallet: string
  ): Promise<TokenInjectionResult> {
    try {
      console.log(`🚀 FOUNDER TOKEN INJECTION: ${amount} WPT to ${targetContract}`);

      // Security validation
      if (!targetContract || !targetContract.match(/^0x[a-fA-F0-9]{40}$/)) {
        return {
          success: false,
          error: "Valid target contract address required"
        };
      }

      // Convert amount to wei (18 decimals) - ethers v5 API
      const amountWei = ethers.utils.parseUnits(amount.toString(), 18);

      // Use actual wallet address instead of passed founderWallet
      const actualWalletAddress = this.wallet.address;
      
      // Check current balance
      const currentBalance = await this.wptContract.balanceOf(actualWalletAddress);
      console.log(`💰 Current WPT balance: ${ethers.utils.formatUnits(currentBalance, 18)} WPT`);

      if (currentBalance.lt(amountWei)) {
        return {
          success: false,
          error: `Insufficient WPT balance. Have: ${ethers.utils.formatUnits(currentBalance, 18)} WPT, Need: ${amount} WPT`
        };
      }

      // Execute transfer
      console.log(`🔄 Transferring ${amount} WPT to ${targetContract}...`);
      const tx = await this.wptContract.transfer(targetContract, amountWei, {
        gasLimit: 100000, // Safe gas limit for simple transfer
      });

      console.log(`✅ Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`🎯 Transaction confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error("❌ Token injection failed:", error);
      return {
        success: false,
        error: error?.message || String(error)
      };
    }
  }

  /**
   * Get current WPT balance for a wallet
   */
  async getWPTBalance(walletAddress: string): Promise<string> {
    try {
      const balance = await this.wptContract.balanceOf(walletAddress);
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error("Failed to get WPT balance:", error);
      return "0";
    }
  }
}

// Export singleton instance
export const tokenInjectionService = new TokenInjectionService();