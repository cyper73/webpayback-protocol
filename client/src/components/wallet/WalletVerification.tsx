import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, Shield, Wallet, Mail, LogOut, Info, Copy, Zap, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiWalletSelector } from './MultiWalletSelector';
import { apiRequest } from '@/lib/queryClient';

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
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSigningWithMetaMask, setIsSigningWithMetaMask] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  
  const [useMultiWallet, setUseMultiWallet] = useState(showMultiWalletSupport);
  const [selectedWalletType, setSelectedWalletType] = useState<string>('');
  const [selectedWalletName, setSelectedWalletName] = useState<string>('');
  const [walletInstructions, setWalletInstructions] = useState<string | null>(null);

  // When Privy auth state changes, update the parent component
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      onWalletChange(user.wallet.address);
      
      // Auto-verify if authenticated
      if (verificationStatus === 'idle') {
        handleAutoVerify();
      }
    } else if (ready && !authenticated && walletAddress) {
      // If user logs out, clear the wallet address in parent
      onWalletChange('');
      setVerificationStatus('idle');
    }
  }, [ready, authenticated, user, walletAddress, verificationStatus]);

  const handleAutoVerify = async () => {
    setIsVerifying(true);
    try {
      // With Privy, if they are authenticated, we know they own the wallet.
      // We can generate a dummy signature or ask the Privy wallet to sign a specific message
      // for the backend to verify, but for now, we'll use a simplified flow
      
      const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
      
      if (embeddedWallet) {
        const message = `WebPayback Login Verification: ${Date.now()}`;
        const provider = await embeddedWallet.getEthereumProvider();
        
        // Use standard eth_personalSign
        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, embeddedWallet.address],
        });

        onVerificationComplete(signature, message);
        setVerificationStatus('success');
        toast({
          title: "Wallet Verificato",
          description: "Il tuo account è stato collegato con successo.",
        });
      } else {
        // Fallback if they logged in with an external wallet via Privy
        setVerificationStatus('success');
        onVerificationComplete('privy-auth-success', 'privy-auth');
      }
    } catch (err) {
      console.error('Signature error:', err);
      setVerificationStatus('error');
      toast({
        title: "Errore di Verifica",
        description: "Impossibile verificare il wallet.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const generateVerificationMessage = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address first');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/wallet/generate-message', {
        walletAddress
      });
      const data = await response.json();
      
      if (data.message) {
        setVerificationMessage(data.message);
      } else {
        setError('Failed to generate verification message');
      }
    } catch (err) {
      setError('Network error while generating message');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationMessage);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const signWithMetaMask = async () => {
    if (!verificationMessage) return;
    
    setIsSigningWithMetaMask(true);
    setError('');

    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = (window as any).ethereum;
      
      // Ensure we're connected to the right account
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];
      
      if (currentAccount.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error(`Please switch MetaMask to the account you entered: ${walletAddress.slice(0,6)}...`);
      }

      toast({
        title: "Check MetaMask",
        description: "Please sign the message in your MetaMask popup...",
      });

      // Request signature
      const signature = await provider.request({
        method: 'personal_sign',
        params: [verificationMessage, currentAccount],
      });

      setSignature(signature);
      
      toast({
        title: "Signature received",
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

  if (!ready) {
    return (
      <Card className="border-gray-800 bg-black/40">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800 bg-black/40">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Shield className="h-5 w-5 text-electric-blue" />
          Registrazione Account
        </CardTitle>
        <CardDescription>
          Accedi con Email o Social. Creeremo automaticamente un wallet sicuro per te, senza bisogno di estensioni o password complesse.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!authenticated ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="bg-electric-blue/10 p-4 rounded-full mb-2">
              <Mail className="h-12 w-12 text-electric-blue" />
            </div>
            <h3 className="text-lg font-medium text-white text-center">Nessun Wallet Richiesto</h3>
            <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
              Usa il tuo account Google, Apple o la tua Email. Gestiremo noi la crittografia in modo sicuro.
            </p>
            <Button 
              onClick={login}
              className="w-full sm:w-auto bg-electric-blue hover:bg-electric-blue/80 text-white px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Accedi / Registrati
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-500/10 border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-200">
                Sei autenticato! Il tuo wallet è pronto all'uso.
              </AlertDescription>
            </Alert>
            
            <div className="bg-black/60 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Il tuo Indirizzo Wallet:</span>
                <span className="text-xs bg-electric-blue/20 text-electric-blue px-2 py-1 rounded">Privy Embedded</span>
              </div>
              <code className="text-sm text-white break-all">{user?.wallet?.address || walletAddress}</code>
            </div>

            {verificationStatus === 'success' ? (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center text-green-400 text-sm">
                  <Shield className="h-4 w-4 mr-1" /> Account Verificato e Sicuro
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-white">
                  <LogOut className="h-4 w-4 mr-2" /> Disconnetti
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleAutoVerify} 
                disabled={isVerifying}
                className="w-full bg-electric-blue hover:bg-electric-blue/80"
              >
                {isVerifying ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifica in corso...</>
                ) : (
                  <><Shield className="mr-2 h-4 w-4" /> Completa Registrazione</>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}