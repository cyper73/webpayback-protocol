import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Shield, CheckCircle, AlertTriangle, Copy, Smartphone } from 'lucide-react';
import { WalletVerification } from '@/components/wallet/WalletVerification';
import { TwoFactorAuthSetup } from '@/components/security/TwoFactorAuthSetup';
import { apiRequest } from '@/lib/queryClient';

interface Creator {
  id: number;
  websiteUrl: string;
  walletAddress: string;
  isWalletVerified: boolean;
  twoFactorEnabled: boolean;
  contentCategory: string;
}

interface WalletLoginProps {
  onLoginSuccess: (session: { walletAddress: string; creators: Creator[]; sessionToken: string }) => void;
}

export function WalletLogin({ onLoginSuccess }: WalletLoginProps) {
  const [step, setStep] = useState<'wallet-input' | 'wallet-verify' | '2fa-auth' | 'completed'>('wallet-input');
  const [walletAddress, setWalletAddress] = useState('');
  const [foundCreators, setFoundCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // Step 1: Check if wallet is registered
  const checkWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest('POST', '/api/auth/wallet/check', {
        walletAddress: address
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.creators?.length > 0) {
        setFoundCreators(data.creators);
        // If wallet is verified, go to wallet verification, otherwise reject
        const verifiedCreators = data.creators.filter((c: Creator) => c.isWalletVerified);
        if (verifiedCreators.length > 0) {
          setStep('wallet-verify');
          toast({
            title: "Wallet Found",
            description: `Found ${data.creators.length} registered site(s) for this wallet`,
          });
        } else {
          setError('Wallet found but not cryptographically verified. Please complete wallet verification in Creator Portal first.');
        }
      } else {
        setError('Wallet not registered. Please register your wallet in Creator Portal first.');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to check wallet registration');
    }
  });

  // Step 2: Verify wallet signature (cryptographic proof)
  const handleWalletVerificationComplete = (signature: string, message: string) => {
    console.log('Wallet verification completed:', walletAddress);
    
    // Check if any creator has 2FA enabled
    const creatorsWithTwoFactor = foundCreators.filter(c => c.twoFactorEnabled);
    
    if (creatorsWithTwoFactor.length > 0) {
      setSelectedCreator(creatorsWithTwoFactor[0]); // Select first creator with 2FA
      setStep('2fa-auth');
      toast({
        title: "Wallet Verified",
        description: "Please enter your 2FA code to complete login",
      });
    } else {
      // No 2FA required, complete login
      completeLogin();
    }
  };

  // Step 3: Verify 2FA code
  const verify2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/auth/2fa/verify', {
        creatorId: selectedCreator?.id,
        token: code
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        completeLogin();
      } else {
        setError(data.error || '2FA verification failed');
      }
    },
    onError: (error: any) => {
      setError(error.message || '2FA verification failed');
    }
  });

  // Complete login and create session
  const completeLogin = async () => {
    try {
      const response = await apiRequest('POST', '/api/auth/wallet/login', {
        walletAddress,
        creatorIds: foundCreators.map(c => c.id)
      });
      const data = await response.json();
      
      if (data.success) {
        setStep('completed');
        onLoginSuccess({
          walletAddress,
          creators: foundCreators,
          sessionToken: data.sessionToken
        });
        toast({
          title: "Login Successful",
          description: "Welcome to WebPayback Protocol",
        });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  const handleWalletSubmit = () => {
    if (!walletAddress.trim()) {
      setError('Please enter your wallet address');
      return;
    }

    // Basic wallet address validation
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setError('Please enter a valid Ethereum wallet address');
      return;
    }

    setError('');
    checkWalletMutation.mutate(walletAddress.toLowerCase());
  };

  const handle2FASubmit = () => {
    if (!twoFactorCode.trim()) {
      setError('Please enter your 2FA code');
      return;
    }

    if (twoFactorCode.length !== 6) {
      setError('2FA code must be 6 digits');
      return;
    }

    setError('');
    verify2FAMutation.mutate(twoFactorCode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'wallet-input') {
        handleWalletSubmit();
      } else if (step === '2fa-auth') {
        handle2FASubmit();
      }
    }
  };

  if (step === 'completed') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Login Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back! You now have access to all WebPayback Protocol modules.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <Badge variant="secondary">{foundCreators.length} site(s)</Badge>
              <Badge variant="secondary">{walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'wallet-verify') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Step 2: Verify Wallet Ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Found {foundCreators.length} registered site(s) for wallet: {walletAddress}
                </p>
                <div className="mt-2 space-y-1">
                  {foundCreators.map((creator, index) => (
                    <div key={creator.id} className="text-xs text-blue-700 dark:text-blue-300">
                      {index + 1}. {creator.websiteUrl}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚡ Multi-Wallet Support
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Connect with MetaMask, Coinbase, Trust Wallet, WalletConnect, or any other supported wallet to sign the verification message.
                </p>
              </div>
              
              <WalletVerification
                walletAddress={walletAddress}
                onVerificationComplete={handleWalletVerificationComplete}
                onWalletChange={setWalletAddress}
                showMultiWalletSupport={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === '2fa-auth') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Step 3: Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your Google Authenticator app
            </p>
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                Site: {selectedCreator?.websiteUrl}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="000000"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleKeyPress}
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handle2FASubmit}
              disabled={verify2FAMutation.isPending || twoFactorCode.length !== 6}
              className="w-full"
            >
              {verify2FAMutation.isPending ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Wallet Input
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          Login to WebPayback Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your registered wallet address to access all modules
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.trim())}
              onKeyPress={handleKeyPress}
              className="font-mono"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleWalletSubmit}
            disabled={checkWalletMutation.isPending || !walletAddress.trim()}
            className="w-full"
          >
            {checkWalletMutation.isPending ? 'Checking...' : 'Continue'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Don't have an account? Register in{' '}
            <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">
              Creator Portal
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}