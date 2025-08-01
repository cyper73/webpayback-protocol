import { ethers } from 'ethers';
import crypto from 'crypto';
import * as util from 'ethereumjs-util';

/**
 * WALLET CRYPTOGRAPHIC VERIFICATION SERVICE
 * Prevents wallet address spoofing by requiring cryptographic signature proof
 */

export class WalletVerificationService {
  
  /**
   * Generate a random verification message for wallet signing
   */
  generateVerificationMessage(walletAddress: string): { message: string; timestamp: number } {
    const timestamp = Date.now();
    const randomCode = crypto.randomBytes(16).toString('hex');
    
    const message = `WebPayback Protocol - Wallet Ownership Verification

By signing this message, you prove ownership of your wallet address.

Wallet Address: ${walletAddress}
Verification Code: ${randomCode}
Timestamp: ${timestamp}

This signature does not authorize any transactions.`;
    
    return { message, timestamp };
  }

  /**
   * Verify that the signature matches the wallet address and message
   * Uses the correct MetaMask signature verification method with Ethereum prefix
   */
  async verifyWalletSignature(
    walletAddress: string, 
    message: string, 
    signature: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      console.log('🔐 Verifying wallet signature (MetaMask method)...');
      console.log('🔐 Wallet:', walletAddress);
      console.log('🔐 Message length:', message.length);
      console.log('🔐 Signature:', signature.substring(0, 20) + '...');

      // Method 1: Try ethers.js first (handles most cases)
      try {
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        console.log('🔐 Ethers.js recovered address:', recoveredAddress);
        
        if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
          console.log('✅ Wallet signature verification SUCCESS (ethers.js method)');
          return { isValid: true };
        }
      } catch (ethersError) {
        console.log('🔐 Ethers.js method failed, trying manual method...', ethersError);
      }

      // Method 2: Manual verification with MetaMask prefix (from StackExchange guide)
      // MetaMask adds this prefix automatically when signing
      const prefixedMessage = "\x19Ethereum Signed Message:\n" + message.length + message;
      const messageHash = util.keccak(Buffer.from(prefixedMessage, "utf-8"));
      
      // Parse signature components
      const { v, r, s } = util.fromRpcSig(signature);
      
      // Recover public key from signature
      const pubKey = util.ecrecover(util.toBuffer(messageHash), v, r, s);
      
      // Convert public key to address
      const recoveredAddress = '0x' + util.pubToAddress(pubKey).toString('hex');
      
      console.log('🔐 Manual method recovered address:', recoveredAddress);
      
      // Compare addresses (case-insensitive)
      if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
        console.log('✅ Wallet signature verification SUCCESS (manual method)');
        return { isValid: true };
      } else {
        console.log('❌ Wallet signature verification FAILED - address mismatch');
        console.log('❌ Expected:', walletAddress.toLowerCase());
        console.log('❌ Recovered:', recoveredAddress.toLowerCase());
        return { 
          isValid: false, 
          error: 'Signature does not match wallet address' 
        };
      }
      
    } catch (error) {
      console.error('❌ Wallet signature verification ERROR:', error);
      return { 
        isValid: false, 
        error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Check if verification message is still valid (not expired)
   */
  isVerificationMessageValid(message: string, maxAgeMinutes: number = 10): boolean {
    try {
      // Extract timestamp from message
      const timestampMatch = message.match(/Timestamp: (\d+)/);
      if (!timestampMatch) {
        return false;
      }
      
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
   * Validate wallet address format
   */
  isValidWalletAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Get verification status summary
   */
  getVerificationSummary(creator: any): {
    hasSignature: boolean;
    isSignatureValid: boolean;
    isMessageExpired: boolean;
    canProceed: boolean;
    statusMessage: string;
  } {
    const hasSignature = !!(creator.walletSignature && creator.verificationMessage);
    const isSignatureValid = creator.signatureVerified || false;
    
    let isMessageExpired = false;
    if (creator.verificationMessage) {
      isMessageExpired = !this.isVerificationMessageValid(creator.verificationMessage, 60); // 1 hour expiry
    }
    
    const canProceed = hasSignature && isSignatureValid && !isMessageExpired;
    
    let statusMessage = '';
    if (!hasSignature) {
      statusMessage = 'Wallet signature required for verification';
    } else if (!isSignatureValid) {
      statusMessage = 'Invalid wallet signature';
    } else if (isMessageExpired) {
      statusMessage = 'Verification message expired - please sign again';
    } else {
      statusMessage = 'Wallet successfully verified';
    }
    
    return {
      hasSignature,
      isSignatureValid,
      isMessageExpired,
      canProceed,
      statusMessage
    };
  }
}

export const walletVerificationService = new WalletVerificationService();