import { ethers } from 'ethers';
import crypto from 'crypto';
import * as util from 'ethereumjs-util';

/**
 * MULTI-WALLET CRYPTOGRAPHIC VERIFICATION SERVICE
 * Supports all major wallet types with specific signature verification methods
 */

// Supported wallet types with their specific characteristics
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  PHANTOM = 'phantom',
  TRUST_WALLET = 'trust',
  UNISWAP_WALLET = 'uniswap',
  RAINBOW = 'rainbow',
  ARGENT = 'argent',
  GNOSIS_SAFE = 'gnosis',
  LEDGER = 'ledger',
  TREZOR = 'trezor',
  BRAVE_WALLET = 'brave',
  FRAME = 'frame',
  UNKNOWN = 'unknown'
}

interface WalletConfiguration {
  name: string;
  signingMethods: string[];
  messagePrefix?: string;
  verificationNotes: string;
  isHardwareWallet: boolean;
  supportedChains: string[];
}

// Comprehensive wallet configurations
const WALLET_CONFIGS: Record<WalletType, WalletConfiguration> = {
  [WalletType.METAMASK]: {
    name: 'MetaMask',
    signingMethods: ['personal_sign', 'eth_sign'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Standard Ethereum message signing with automatic prefix',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism']
  },
  [WalletType.PHANTOM]: {
    name: 'Phantom',
    signingMethods: ['signMessage', 'signTransaction'],
    messagePrefix: 'SOLANA_INCOMPATIBLE',
    verificationNotes: 'Phantom is primarily a Solana wallet. Ethereum features have limited compatibility. Please use MetaMask, Coinbase, or Trust Wallet for full Ethereum support.',
    isHardwareWallet: false,
    supportedChains: ['solana']
  },
  [WalletType.WALLET_CONNECT]: {
    name: 'WalletConnect',
    signingMethods: ['personal_sign', 'eth_signTypedData_v4'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Protocol for connecting mobile wallets, uses standard Ethereum signing',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'avalanche']
  },
  [WalletType.COINBASE]: {
    name: 'Coinbase Wallet',
    signingMethods: ['personal_sign', 'eth_signTypedData_v4'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Coinbase Wallet uses standard Ethereum signing but may have additional validation',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'base']
  },
  [WalletType.TRUST_WALLET]: {
    name: 'Trust Wallet',
    signingMethods: ['personal_sign', 'eth_sign'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Mobile-first wallet with standard Ethereum signing',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'avalanche']
  },
  [WalletType.UNISWAP_WALLET]: {
    name: 'Uniswap Wallet',
    signingMethods: ['personal_sign', 'eth_signTypedData_v4'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Uniswap mobile wallet with DeFi focus, standard Ethereum signing',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base']
  },
  [WalletType.RAINBOW]: {
    name: 'Rainbow',
    signingMethods: ['personal_sign', 'eth_signTypedData_v4'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Mobile Ethereum wallet with NFT focus, standard signing',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base']
  },
  [WalletType.ARGENT]: {
    name: 'Argent',
    signingMethods: ['personal_sign', 'eth_signTypedData_v4'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Smart contract wallet with social recovery, may use proxy signatures',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'arbitrum']
  },
  [WalletType.GNOSIS_SAFE]: {
    name: 'Gnosis Safe',
    signingMethods: ['eth_signTypedData_v4', 'personal_sign'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Multi-signature wallet, requires multiple signatures for transactions',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'gnosis']
  },
  [WalletType.LEDGER]: {
    name: 'Ledger',
    signingMethods: ['personal_sign', 'eth_sign'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Hardware wallet with strict security, may require device confirmation',
    isHardwareWallet: true,
    supportedChains: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'solana']
  },
  [WalletType.TREZOR]: {
    name: 'Trezor',
    signingMethods: ['personal_sign', 'eth_sign'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Hardware wallet with device confirmation required',
    isHardwareWallet: true,
    supportedChains: ['ethereum', 'polygon', 'bsc', 'arbitrum']
  },
  [WalletType.BRAVE_WALLET]: {
    name: 'Brave Wallet',
    signingMethods: ['personal_sign', 'eth_signTypedData_v4'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Built-in browser wallet, standard Ethereum signing',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'solana']
  },
  [WalletType.FRAME]: {
    name: 'Frame',
    signingMethods: ['personal_sign', 'eth_signTypedData_v4'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Desktop wallet with hardware wallet integration',
    isHardwareWallet: false,
    supportedChains: ['ethereum', 'polygon', 'arbitrum', 'optimism']
  },
  [WalletType.UNKNOWN]: {
    name: 'Unknown Wallet',
    signingMethods: ['personal_sign', 'eth_sign'],
    messagePrefix: '\x19Ethereum Signed Message:\n',
    verificationNotes: 'Fallback for unrecognized wallets, uses standard methods',
    isHardwareWallet: false,
    supportedChains: ['ethereum']
  }
};

export class MultiWalletVerificationService {
  
  /**
   * Detect wallet type from user agent, window objects, or signature patterns
   */
  detectWalletType(userAgent?: string, walletInfo?: any): WalletType {
    // Check for specific wallet objects in window (client-side detection)
    if (typeof window !== 'undefined') {
      if ((window as any).phantom?.solana) return WalletType.PHANTOM;
      if ((window as any).ethereum?.isMetaMask) return WalletType.METAMASK;
      if ((window as any).ethereum?.isCoinbaseWallet) return WalletType.COINBASE;
      if ((window as any).ethereum?.isTrust) return WalletType.TRUST_WALLET;
      if ((window as any).ethereum?.isRainbow) return WalletType.RAINBOW;
      if ((window as any).ethereum?.isBraveWallet) return WalletType.BRAVE_WALLET;
      if ((window as any).ethereum?.isFrame) return WalletType.FRAME;
    }

    // Check user agent for mobile wallets
    if (userAgent) {
      if (userAgent.includes('Trust')) return WalletType.TRUST_WALLET;
      if (userAgent.includes('Coinbase')) return WalletType.COINBASE;
      if (userAgent.includes('Rainbow')) return WalletType.RAINBOW;
      if (userAgent.includes('Argent')) return WalletType.ARGENT;
    }

    // Check wallet info if provided
    if (walletInfo?.name) {
      const name = walletInfo.name.toLowerCase();
      if (name.includes('metamask')) return WalletType.METAMASK;
      if (name.includes('phantom')) return WalletType.PHANTOM;
      if (name.includes('walletconnect')) return WalletType.WALLET_CONNECT;
      if (name.includes('coinbase')) return WalletType.COINBASE;
      if (name.includes('trust')) return WalletType.TRUST_WALLET;
      if (name.includes('uniswap')) return WalletType.UNISWAP_WALLET;
      if (name.includes('rainbow')) return WalletType.RAINBOW;
      if (name.includes('argent')) return WalletType.ARGENT;
      if (name.includes('gnosis') || name.includes('safe')) return WalletType.GNOSIS_SAFE;
      if (name.includes('ledger')) return WalletType.LEDGER;
      if (name.includes('trezor')) return WalletType.TREZOR;
      if (name.includes('brave')) return WalletType.BRAVE_WALLET;
      if (name.includes('frame')) return WalletType.FRAME;
    }

    return WalletType.UNKNOWN;
  }

  /**
   * Get wallet configuration
   */
  getWalletConfig(walletType: WalletType): WalletConfiguration {
    return WALLET_CONFIGS[walletType];
  }

  /**
   * Generate verification message optimized for specific wallet type
   */
  generateVerificationMessage(
    walletAddress: string, 
    walletType: WalletType = WalletType.UNKNOWN
  ): { message: string; timestamp: number; walletType: WalletType } {
    const timestamp = Date.now();
    const randomCode = crypto.randomBytes(16).toString('hex');
    const config = this.getWalletConfig(walletType);
    
    // Customize message based on wallet type
    let message = `WebPayback Protocol - Wallet Ownership Verification

By signing this message, you prove ownership of your wallet address.

Wallet Address: ${walletAddress}
Wallet Type: ${config.name}
Verification Code: ${randomCode}
Timestamp: ${timestamp}

This signature does not authorize any transactions.`;

    // Add wallet-specific instructions
    if (config.isHardwareWallet) {
      message += `\n\nHardware Wallet Notice: Please confirm signing on your ${config.name} device.`;
    }

    if (walletType === WalletType.PHANTOM) {
      message += '\n\nPhantom Wallet: This message will be converted for Solana compatibility if needed.';
    }

    if (walletType === WalletType.GNOSIS_SAFE) {
      message += '\n\nGnosis Safe: Multiple signatures may be required depending on your safe configuration.';
    }
    
    return { message, timestamp, walletType };
  }

  /**
   * Verify wallet signature with wallet-specific methods
   */
  async verifyWalletSignature(
    walletAddress: string, 
    message: string, 
    signature: string,
    walletType: WalletType = WalletType.UNKNOWN
  ): Promise<{ isValid: boolean; error?: string; method?: string }> {
    try {
      const config = this.getWalletConfig(walletType);
      console.log(`🔐 Verifying signature for ${config.name} wallet...`);
      console.log('🔐 Wallet:', walletAddress);
      console.log('🔐 Message length:', message.length);
      console.log('🔐 Signature:', signature.substring(0, 20) + '...');

      // Method 1: Try ethers.js (works for most Ethereum-compatible wallets)
      if (walletType !== WalletType.PHANTOM) {
        try {
          const recoveredAddress = ethers.utils.verifyMessage(message, signature);
          console.log(`🔐 Ethers.js recovered address for ${config.name}:`, recoveredAddress);
          
          if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
            console.log(`✅ ${config.name} signature verification SUCCESS (ethers.js)`);
            return { isValid: true, method: 'ethers.js' };
          }
        } catch (ethersError) {
          console.log(`🔐 Ethers.js method failed for ${config.name}, trying alternatives...`);
        }
      }

      // Method 2: Manual verification with wallet-specific prefix
      try {
        const prefix = config.messagePrefix || '\x19Ethereum Signed Message:\n';
        const prefixedMessage = prefix + message.length + message;
        const messageHash = util.keccak(Buffer.from(prefixedMessage, "utf-8"));
        
        const { v, r, s } = util.fromRpcSig(signature);
        const pubKey = util.ecrecover(util.toBuffer(messageHash), v, r, s);
        const recoveredAddress = '0x' + util.pubToAddress(pubKey).toString('hex');
        
        console.log(`🔐 Manual method recovered address for ${config.name}:`, recoveredAddress);
        
        if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
          console.log(`✅ ${config.name} signature verification SUCCESS (manual method)`);
          return { isValid: true, method: 'manual' };
        }
      } catch (manualError) {
        console.log(`🔐 Manual method failed for ${config.name}:`, manualError);
      }

      // Method 3: Phantom-specific verification (limited compatibility)
      if (walletType === WalletType.PHANTOM) {
        console.log('⚠️ Phantom wallet detected - limited Ethereum compatibility');
        return { 
          isValid: false, 
          error: 'Phantom wallet is primarily for Solana. For full Ethereum support, please use MetaMask, Coinbase Wallet, or Trust Wallet.' 
        };
      }

      // Method 4: Try without prefix (some wallets don't add it)
      try {
        const messageHash = util.keccak(Buffer.from(message, "utf-8"));
        const { v, r, s } = util.fromRpcSig(signature);
        const pubKey = util.ecrecover(util.toBuffer(messageHash), v, r, s);
        const recoveredAddress = '0x' + util.pubToAddress(pubKey).toString('hex');
        
        if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
          console.log(`✅ ${config.name} signature verification SUCCESS (no prefix)`);
          return { isValid: true, method: 'no-prefix' };
        }
      } catch (noPrefixError) {
        console.log(`🔐 No-prefix method failed for ${config.name}`);
      }

      console.log(`❌ All verification methods failed for ${config.name}`);
      return { 
        isValid: false, 
        error: `${config.name} signature verification failed: signature does not match wallet address`
      };
      
    } catch (error) {
      console.error(`❌ ${walletType} wallet signature verification ERROR:`, error);
      return { 
        isValid: false, 
        error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Get wallet-specific signing instructions
   */
  getSigningInstructions(walletType: WalletType): {
    steps: string[];
    notes: string[];
    troubleshooting: string[];
  } {
    const config = this.getWalletConfig(walletType);
    
    const baseSteps = [
      "Copy the verification message from above",
      `Open your ${config.name} wallet`,
      "Look for a 'Sign Message' or 'Sign' option",
      "Paste the message and confirm signing",
      "Copy the signature and paste it below"
    ];

    const walletSpecificInstructions: Record<WalletType, Partial<{
      steps: string[];
      notes: string[];
      troubleshooting: string[];
    }>> = {
      [WalletType.PHANTOM]: {
        steps: [
          ...baseSteps.slice(0, 2),
          "Click the settings menu (gear icon)",
          "Select 'Sign Message' or use the message signing feature",
          ...baseSteps.slice(3)
        ],
        notes: [
          "Phantom wallet supports both Solana and Ethereum networks",
          "Make sure you're connected to the correct network",
          "The message may be displayed differently but the signature will work"
        ]
      },
      [WalletType.LEDGER]: {
        notes: [
          "Connect your Ledger device and unlock it",
          "Open the Ethereum app on your device",
          "You'll need to confirm the signature on your device screen"
        ],
        troubleshooting: [
          "Make sure your Ledger is connected and unlocked",
          "Ensure the Ethereum app is open on your device",
          "Try reconnecting if the signing fails"
        ]
      },
      [WalletType.GNOSIS_SAFE]: {
        notes: [
          "Multi-signature wallets may require multiple confirmations",
          "Check if other owners need to sign",
          "The signing process may take longer than usual"
        ]
      }
    };

    const specific = walletSpecificInstructions[walletType] || {};
    
    return {
      steps: specific.steps || baseSteps,
      notes: [
        ...config.verificationNotes ? [config.verificationNotes] : [],
        ...(specific.notes || [])
      ],
      troubleshooting: [
        "Make sure your wallet is connected to the correct network",
        "Try refreshing the page if signing fails",
        "Ensure your wallet is unlocked and ready",
        ...(specific.troubleshooting || [])
      ]
    };
  }

  /**
   * Check if verification message is still valid
   */
  isVerificationMessageValid(message: string, maxAgeMinutes: number = 10): boolean {
    try {
      const timestampMatch = message.match(/Timestamp: (\d+)/);
      if (!timestampMatch) return false;
      
      const messageTimestamp = parseInt(timestampMatch[1]);
      const now = Date.now();
      const ageInMinutes = (now - messageTimestamp) / (1000 * 60);
      
      return ageInMinutes <= maxAgeMinutes;
    } catch (error) {
      console.error('❌ Verification message validation error:', error);
      return false;
    }
  }

  /**
   * Get list of supported wallets
   */
  getSupportedWallets(): Array<{
    type: WalletType;
    name: string;
    isHardwareWallet: boolean;
    supportedChains: string[];
  }> {
    return Object.entries(WALLET_CONFIGS)
      .filter(([type]) => type !== WalletType.UNKNOWN)
      .map(([type, config]) => ({
        type: type as WalletType,
        name: config.name,
        isHardwareWallet: config.isHardwareWallet,
        supportedChains: config.supportedChains
      }));
  }
}

// Export singleton instance
export const multiWalletVerificationService = new MultiWalletVerificationService();