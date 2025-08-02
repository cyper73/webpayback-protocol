import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Smartphone, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import QRCode from 'qrcode';

interface TwoFactorGateProps {
  onAuthenticationSuccess: () => void;
  requiredFor: string; // "Creator Portal", "NFT Module", "Rewards Module"
}

export default function TwoFactorGate({ onAuthenticationSuccess, requiredFor }: TwoFactorGateProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'wallet-auth' | 'setup-2fa' | 'verify-2fa'>('wallet-auth');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [creatorId, setCreatorId] = useState<number | null>(null);

  // Check if user has a verified wallet first, then check 2FA
  useEffect(() => {
    // Start with wallet authentication check
    checkStoredWallet();
  }, []);

  const checkStoredWallet = () => {
    const storedWallet = localStorage.getItem('webpayback_wallet_address');
    if (storedWallet) {
      setWalletAddress(storedWallet);
      // Auto-start wallet verification
      verifyWalletAndCheck2FA(storedWallet);
    } else {
      // No wallet stored, start with wallet auth
      setStep('wallet-auth');
    }
  };

  const verifyWalletAndCheck2FA = async (wallet: string) => {
    setIsLoading(true);
    try {
      // Step 1: Verify wallet ownership through signature
      const walletResponse = await fetch('/api/content-certificate/verify-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet }),
      });
      
      if (!walletResponse.ok) {
        throw new Error('Wallet not verified as registered creator');
      }
      
      const walletData = await walletResponse.json();
      const creatorIdFound = walletData.creator.id;
      setCreatorId(creatorIdFound);
      
      console.log('✅ Wallet verified for creator:', creatorIdFound);

      // Step 2: Check 2FA status for this creator
      const response = await fetch(`/api/auth/2fa/status/${creatorIdFound}`);
      const data = await response.json();
      
      if (data.success && data.enabled) {
        console.log('✅ 2FA enabled, requiring verification');
        setStep('verify-2fa');
      } else {
        console.log('❌ 2FA not setup, starting setup process');
        setStep('setup-2fa');
      }
    } catch (error) {
      console.error('❌ Wallet verification failed:', error);
      toast({
        title: "Wallet Verification Failed",
        description: error instanceof Error ? error.message : "Please ensure your wallet is registered",
        variant: "destructive",
      });
      setStep('wallet-auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletAuth = async (inputWallet: string) => {
    if (!inputWallet.startsWith('0x') || inputWallet.length !== 42) {
      toast({
        title: "Invalid Wallet",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive",
      });
      return;
    }

    setWalletAddress(inputWallet);
    localStorage.setItem('webpayback_wallet_address', inputWallet);
    await verifyWalletAndCheck2FA(inputWallet);
  };

  const generateSetup = async () => {
    if (!creatorId) {
      toast({
        title: "Setup Failed",
        description: "Creator ID not found. Please verify your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Generating 2FA setup for creator:', creatorId);
      
      const response = await apiRequest('POST', '/api/auth/2fa/setup', {
        creatorId,
        email: `creator-${creatorId}@webpayback.com`
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ 2FA setup generated:', data);
      
      if (data.success && data.setup) {
        setSecret(data.setup.manualEntryCode);
        setBackupCodes(data.setup.backupCodes);
        
        // Generate QR code
        const qrUrl = await QRCode.toDataURL(data.setup.qrCodeUrl);
        setQrCodeUrl(qrUrl);
        
        toast({
          title: "2FA Setup Generated",
          description: "Scan the QR code with Google Authenticator",
        });
      } else {
        throw new Error(data.error || 'Failed to generate 2FA setup');
      }
    } catch (error) {
      console.error('❌ Error generating 2FA setup:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to generate setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    if (!creatorId) {
      toast({
        title: "Verification Failed",
        description: "Creator ID not found. Please verify your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Verifying 2FA code for creator:', creatorId);
      
      const response = await apiRequest('POST', '/api/auth/2fa/verify-setup', {
        creatorId,
        token: verificationCode
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ 2FA verification result:', data);
      
      if (data.success) {
        toast({
          title: "Authentication Successful!",
          description: `Access granted to ${requiredFor}`,
        });
        
        // Store authentication state in sessionStorage
        sessionStorage.setItem('webpayback_2fa_verified', 'true');
        sessionStorage.setItem('webpayback_2fa_timestamp', Date.now().toString());
        
        onAuthenticationSuccess();
      } else {
        toast({
          title: "Invalid Code",
          description: data.error || "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error verifying 2FA code:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setVerificationCode('');
    }
  };

  const completeSetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code to complete setup",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get wallet and creator info
      const walletAddress = localStorage.getItem('webpayback_wallet_address');
      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      const walletResponse = await fetch('/api/content-certificate/verify-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      
      if (!walletResponse.ok) {
        throw new Error('Wallet not verified');
      }
      
      const walletData = await walletResponse.json();
      const creatorId = walletData.creator.id;
      
      console.log('🔄 Completing 2FA setup for creator:', creatorId);
      
      const response = await apiRequest('POST', '/api/auth/2fa/verify-setup', {
        creatorId,
        token: verificationCode
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ 2FA setup completion result:', data);
      
      if (data.success) {
        toast({
          title: "2FA Enabled Successfully!",
          description: `Authentication complete. Access granted to ${requiredFor}`,
        });
        
        // Store authentication state
        sessionStorage.setItem('webpayback_2fa_verified', 'true');
        sessionStorage.setItem('webpayback_2fa_timestamp', Date.now().toString());
        
        onAuthenticationSuccess();
      } else {
        toast({
          title: "Setup Failed",
          description: data.error || "Failed to enable 2FA. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error completing 2FA setup:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to complete setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setVerificationCode('');
    }
  };

  // Wallet Authentication Component - Step 1
  const WalletAuthStep = () => {
    const [inputWallet, setInputWallet] = useState('');
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-electric-blue" />
            </div>
            <CardTitle className="text-xl font-bold gradient-text">
              Step 1: Wallet Authentication
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              Enter your registered creator wallet to access <strong>{requiredFor}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="wallet-address" className="text-sm font-medium text-gray-300">
                  Ethereum Wallet Address
                </Label>
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder="0x..."
                  value={inputWallet}
                  onChange={(e) => setInputWallet(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be a registered creator wallet with verified ownership
                </p>
              </div>
              
              <Button 
                onClick={() => handleWalletAuth(inputWallet)}
                disabled={isLoading || !inputWallet}
                className="w-full bg-electric-blue hover:bg-electric-blue/80"
              >
                {isLoading ? 'Verifying Wallet...' : 'Verify Wallet Ownership'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (step === 'wallet-auth') {
    return <WalletAuthStep />;
  }

  if (step === 'verify-2fa') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-electric-blue" />
            </div>
            <CardTitle className="text-xl font-bold gradient-text">
              Step 2: Two-Factor Authentication
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              Wallet verified ✓ | Now enter your 2FA code to access <strong>{requiredFor}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-300 text-sm">
                Open Google Authenticator and enter the 6-digit code
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            
            <Button
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-electric-blue hover:bg-electric-blue/80"
            >
              {isLoading ? "Verifying..." : "Verify & Access"}
            </Button>
            
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('setup-2fa')}
                className="text-gray-400 hover:text-white"
              >
                Need to setup 2FA?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-lg glass-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-electric-blue" />
          </div>
          <CardTitle className="text-xl font-bold gradient-text">
            Step 2: Setup Two-Factor Authentication
          </CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            Wallet verified ✓ | Setup 2FA to secure your access to <strong>{requiredFor}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!qrCodeUrl ? (
            <div className="text-center space-y-4">
              <Key className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-gray-300 text-sm">
                Two-Factor Authentication adds an extra layer of security to your account.
                You'll need Google Authenticator installed on your phone.
              </p>
              <Button
                onClick={generateSetup}
                disabled={isLoading}
                className="w-full bg-electric-blue hover:bg-electric-blue/80"
              >
                {isLoading ? "Generating..." : "Generate 2FA Setup"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-4">
                  1. Scan this QR code with Google Authenticator
                </p>
                {qrCodeUrl && (
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Manual Entry Secret (if needed)</Label>
                <div className="bg-gray-800 p-2 rounded text-sm font-mono break-all">
                  {secret}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Backup Codes (Save these safely)</Label>
                <div className="bg-gray-800 p-3 rounded text-xs font-mono">
                  {backupCodes.map((code, index) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="setup-verification">Enter code from your app to complete setup</Label>
                <Input
                  id="setup-verification"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <Button
                onClick={completeSetup}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-electric-blue hover:bg-electric-blue/80"
              >
                {isLoading ? "Completing Setup..." : "Complete Setup & Access"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}