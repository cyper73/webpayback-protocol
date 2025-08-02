import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Copy, Shield, Zap, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MultiWalletSelector } from './MultiWalletSelector';

// MetaMask types
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

interface WalletVerificationProps {
  walletAddress: string;
  onVerificationComplete: (signature: string, message: string) => void;
  onWalletChange: (address: string) => void;
  showMultiWalletSupport?: boolean;
}

export function WalletVerification({ 
  walletAddress, 
  onVerificationComplete, 
  onWalletChange,
  showMultiWalletSupport = false
}: WalletVerificationProps) {
  const [verificationMessage, setVerificationMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isSigningWithMetaMask, setIsSigningWithMetaMask] = useState(false);
  const [useMultiWallet, setUseMultiWallet] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<string>('');
  const [selectedWalletName, setSelectedWalletName] = useState<string>('');
  const [walletInstructions, setWalletInstructions] = useState<any>(null);
  const { toast } = useToast();

  const generateVerificationMessage = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address first');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('🔐 Generating verification message for wallet:', walletAddress);
      
      // Use multi-wallet API if wallet type is selected
      const endpoint = useMultiWallet && selectedWalletType 
        ? '/api/wallet/generate-verification-multi'
        : '/api/wallet/generate-verification';
      
      const payload = useMultiWallet && selectedWalletType 
        ? { 
            walletAddress,
            walletType: selectedWalletType,
            userAgent: navigator.userAgent,
            walletInfo: { name: selectedWalletName.toLowerCase() }
          }
        : { walletAddress };
      
      const response = await apiRequest('POST', endpoint, payload);
      const result = await response.json();
      console.log('🔐 Server response:', result);

      if (result.success && result.message) {
        console.log('🔐 Setting verification message:', result.message);
        console.log('🔐 Message length:', result.message.length);
        // Force update without sanitization for display
        setVerificationMessage(String(result.message));
        
        // Store wallet-specific instructions if using multi-wallet
        if (result.instructions) {
          setWalletInstructions(result.instructions);
        }
        
        const walletName = result.walletName || 'your wallet';
        toast({
          title: "Verification message generated",
          description: `Copy the message and sign it with ${walletName}`,
        });
      } else {
        console.error('🔐 Server error:', result.error);
        setError(result.error || 'Failed to generate verification message');
      }
    } catch (err) {
      console.error('🔐 Network error:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationMessage);
    toast({
      title: "Message copied",
      description: "Paste it in your wallet to sign",
    });
  };

  // Sign message automatically with MetaMask
  const signWithMetaMask = async () => {
    if (!verificationMessage) {
      setError('No verification message available');
      return;
    }

    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    setIsSigningWithMetaMask(true);
    setError('');

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const account = accounts[0];

      if (account.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error(`MetaMask account (${account}) does not match the entered wallet address (${walletAddress})`);
      }

      // Sign the message
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [verificationMessage, account],
      });

      console.log('🔐 MetaMask signature generated:', signature);
      setSignature(signature);
      
      toast({
        title: "Message signed successfully!",
        description: "Now verifying the signature...",
      });

      // Auto-verify the signature
      await verifySignatureAutomatically(signature);

    } catch (err: any) {
      console.error('🔐 MetaMask signing error:', err);
      if (err.code === 4001) {
        setError('User rejected the signature request');
      } else {
        setError(err.message || 'Failed to sign message with MetaMask');
      }
    } finally {
      setIsSigningWithMetaMask(false);
    }
  };

  const verifySignatureAutomatically = async (sig: string) => {
    setIsVerifying(true);
    
    try {
      const response = await apiRequest('POST', '/api/wallet/verify-signature', {
        walletAddress,
        message: verificationMessage,
        signature: sig
      });
      const result = await response.json();

      if (result.success && result.verified) {
        setVerificationStatus('success');
        onVerificationComplete(sig, verificationMessage);
        toast({
          title: "Wallet verified!",
          description: "Your wallet ownership has been cryptographically verified",
        });
      } else {
        setError(result.error || 'Signature verification failed');
        setVerificationStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifySignature = async () => {
    if (!signature.trim()) {
      setError('Please enter the signature from your wallet');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      // Use multi-wallet API if wallet type is selected
      const endpoint = useMultiWallet && selectedWalletType 
        ? '/api/wallet/verify-signature-multi'
        : '/api/wallet/verify-signature';
      
      const payload = useMultiWallet && selectedWalletType 
        ? { 
            walletAddress,
            message: verificationMessage,
            signature,
            walletType: selectedWalletType,
            userAgent: navigator.userAgent,
            walletInfo: { name: selectedWalletName.toLowerCase() }
          }
        : { walletAddress, message: verificationMessage, signature };
      
      const response = await apiRequest('POST', endpoint, payload);
      const result = await response.json();

      if (result.success) {
        setVerificationStatus('success');
        onVerificationComplete(signature, verificationMessage);
        const walletName = result.walletName || 'Wallet';
        const method = result.verificationMethod || 'standard';
        toast({
          title: `${walletName} verified successfully`,
          description: `Your wallet ownership has been confirmed using ${method} method`,
        });
      } else {
        setVerificationStatus('error');
        setError(result.error || 'Signature verification failed');
      }
    } catch (err) {
      setVerificationStatus('error');
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsVerifying(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          onWalletChange(accounts[0]);
          toast({
            title: "Wallet connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      } catch (err) {
        toast({
          title: "Connection failed",
          description: "Failed to connect to wallet",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive",
      });
    }
  };

  const handleWalletSelect = (walletType: string, walletName: string) => {
    setSelectedWalletType(walletType);
    setSelectedWalletName(walletName);
    setUseMultiWallet(true);
    // Reset previous states
    setVerificationMessage('');
    setSignature('');
    setError('');
    setVerificationStatus('idle');
    setWalletInstructions(null);
  };

  return (
    <div className="space-y-6">
      {/* Multi-Wallet Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Wallet Verification Method</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseMultiWallet(!useMultiWallet)}
            >
              {useMultiWallet ? 'Use Standard Mode' : 'Use Advanced Mode'}
            </Button>
          </div>
          
          {useMultiWallet && (
            <MultiWalletSelector
              onWalletSelect={handleWalletSelect}
              selectedWalletType={selectedWalletType}
            />
          )}
          
          {!useMultiWallet && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Standard mode works with most Ethereum-compatible wallets. 
                Use Advanced mode for wallet-specific optimizations and better Phantom/hardware wallet support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Verification Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Wallet Verification
            {selectedWalletName && (
              <span className="text-sm font-normal text-gray-500">
                ({selectedWalletName})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> We require cryptographic proof that you own the wallet address. 
            This prevents others from registering with addresses they don't control.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Wallet Address</label>
          <div className="flex gap-2">
            <Input
              value={walletAddress}
              onChange={(e) => onWalletChange(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <Button onClick={connectWallet} variant="outline">
              Connect Wallet
            </Button>
          </div>
        </div>

        {!verificationMessage && (
          <Button 
            onClick={generateVerificationMessage} 
            disabled={isGenerating || !walletAddress}
            className="w-full"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Verification Message
          </Button>
        )}

        {verificationMessage && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Message to Sign</label>
                <Button onClick={copyToClipboard} size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={verificationMessage}
                readOnly
                className="font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                rows={8}
                placeholder="Verification message will appear here..."
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <AlertDescription>
                <div className="space-y-3">
                  <div className="font-semibold text-blue-700 dark:text-blue-300">📋 Step-by-Step MetaMask Guide:</div>
                  
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li>
                      <strong>Copy the message</strong> using the "Copy" button above
                    </li>
                    <li>
                      <strong>Open MetaMask extension</strong> in your browser
                    </li>
                    <li>
                      <strong>Click the three dots menu (⋮)</strong> in the top-right corner
                    </li>
                    <li>
                      <strong>Select "Account Details"</strong> from the dropdown
                    </li>
                    <li>
                      <strong>Click "Sign Message"</strong> button (not "Send" or "Swap")
                    </li>
                    <li>
                      <strong>Paste the verification message</strong> in the text field
                    </li>
                    <li>
                      <strong>Click "Sign"</strong> to generate the signature
                    </li>
                    <li>
                      <strong>Copy the signature</strong> and paste it in the field below
                    </li>
                  </ol>
                  
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-md border border-amber-300 dark:border-amber-700">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                      <div>
                        <div className="font-semibold text-amber-800 dark:text-amber-200">Important:</div>
                        <div className="text-amber-700 dark:text-amber-300 text-sm">
                          This is NOT a transaction - you're only proving wallet ownership. No gas fees required.
                          Look for "Sign Message" not "Send Transaction".
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Automatic Signing Options */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-3">Choose your preferred method:</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={signWithMetaMask}
                    disabled={isSigningWithMetaMask || isVerifying}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                  >
                    {isSigningWithMetaMask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Zap className="mr-2 h-4 w-4" />
                    Sign Automatically with MetaMask
                  </Button>
                  <div className="text-sm text-muted-foreground self-center px-3">or</div>
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Manual Signing (Copy Message)
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Signature from Wallet (for manual signing)</label>
              <Textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Paste the signature from your wallet here..."
                className="font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                rows={3}
              />
            </div>

            <Button 
              onClick={verifySignature} 
              disabled={isVerifying || !signature}
              className="w-full"
            >
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Signature
            </Button>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✅ Wallet ownership verified! You can now complete your registration.
            </AlertDescription>
          </Alert>
        )}
        </CardContent>
      </Card>
    </div>
  );
}