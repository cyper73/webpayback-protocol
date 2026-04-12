import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Wallet, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentCertificateManager } from "./ContentCertificateManager";
import type { Creator } from "@shared/schema";

interface WalletBasedAccessProps {
  onAccessGranted?: (creator: Creator) => void;
}

export function WalletBasedAccess({ onAccessGranted }: WalletBasedAccessProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [verifiedCreator, setVerifiedCreator] = useState<Creator | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Auto-fill wallet if authenticated via Privy
  useEffect(() => {
    if (authenticated) {
      const activeWallet = wallets?.[0];
      const privyWalletAddress = user?.wallet?.address || activeWallet?.address;
      
      if (privyWalletAddress && !walletAddress) {
        setWalletAddress(privyWalletAddress);
      }
    }
  }, [authenticated, user, wallets, walletAddress]);

  // Wallet verification mutation
  const verifyWallet = useMutation({
    mutationFn: async (address: string) => {
      const response = await fetch('/api/content-certificate/verify-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Wallet verification failed');
      }
      
      return response.json();
    },
    onSuccess: (data: { success: boolean; creator: Creator; message: string }) => {
      if (data.success && data.creator) {
        setInlineError(null);
        setAccessGranted(true);
        setVerifiedCreator(data.creator);
        onAccessGranted?.(data.creator);
        toast({
          title: "Access Granted!",
          description: `Welcome back, ${data.creator.websiteUrl}`,
        });
      }
    },
    onError: (error: any) => {
      const errorMsg = error.message || "Wallet verification failed";
      setInlineError(errorMsg);
      toast({
        title: "Access Denied",
        description: errorMsg,
        variant: "destructive",
      });
    }
  });

  const handleWalletSubmit = () => {
    setInlineError(null);
    if (!walletAddress) {
      setInlineError("Please enter your wallet address");
      return;
    }

    // Basic wallet address validation
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setInlineError("Please enter a valid Ethereum wallet address");
      return;
    }

    verifyWallet.mutate(walletAddress.toLowerCase());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWalletSubmit();
    }
  };

  // If access is granted, show the NFT manager
  if (accessGranted && verifiedCreator) {
    return (
      <div className="space-y-6">
        {/* Access Granted Header */}
        <Card className="bg-neon-green/10 border border-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-green text-xl">
              <CheckCircle className="h-6 w-6" />
              Content Certificate Access Granted
            </CardTitle>
            <CardDescription className="text-gray-300 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-500 block text-xs mb-1">Creator</span>
                  <strong className="text-white truncate block">{verifiedCreator.websiteUrl}</strong>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-500 block text-xs mb-1">Wallet</span>
                  <strong className="text-white truncate block font-mono">{verifiedCreator.walletAddress}</strong>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 block text-xs mb-1">Status</span>
                    <strong className="text-white block">Active</strong>
                  </div>
                  <Badge className="bg-neon-green/20 text-neon-green border border-neon-green/50">✓ Verified</Badge>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* NFT Manager */}
        <ContentCertificateManager creatorId={verifiedCreator.id} />
      </div>
    );
  }

  // Wallet access form
  return (
    <div className="bg-transparent py-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-electric-blue/10 rounded-xl border border-electric-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Shield className="h-8 w-8 text-electric-blue" />
            </div>
            <h2 className="text-3xl font-bold text-white">Content Certificate Access</h2>
          </div>
          <p className="text-lg text-gray-400">
            Enter your wallet address to access your personalized NFT certificate dashboard
          </p>
        </div>

        {/* Access Form */}
        <Card className="border-electric-blue/30 bg-black/40 shadow-[0_0_20px_rgba(0,240,255,0.1)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-electric-blue text-xl">
              <Wallet className="h-6 w-6" />
              Wallet-Based Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="wallet" className="text-gray-300">Wallet Address</Label>
              <div className="flex gap-3">
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-electric-blue font-mono"
                  disabled={verifyWallet.isPending}
                />
                <Button 
                  onClick={handleWalletSubmit}
                  disabled={verifyWallet.isPending || !walletAddress}
                  className="px-6 bg-electric-blue hover:bg-electric-blue/80 text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                >
                  {verifyWallet.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {inlineError && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p>{inlineError}</p>
                </div>
              )}
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div className="text-center space-y-3 p-4 bg-gray-900/40 rounded-xl border border-gray-800/50">
                <CheckCircle className="h-8 w-8 text-neon-green mx-auto" />
                <div className="font-bold text-white">Secure Access</div>
                <p className="text-xs text-gray-400">Cryptographic verification</p>
              </div>
              <div className="text-center space-y-3 p-4 bg-gray-900/40 rounded-xl border border-gray-800/50">
                <Shield className="h-8 w-8 text-electric-blue mx-auto" />
                <div className="font-bold text-white">Personal Data</div>
                <p className="text-xs text-gray-400">Your certificates only</p>
              </div>
              <div className="text-center space-y-3 p-4 bg-gray-900/40 rounded-xl border border-gray-800/50">
                <ArrowRight className="h-8 w-8 text-purple-400 mx-auto" />
                <div className="font-bold text-white">Real-time Protection</div>
                <p className="text-xs text-gray-400">AI theft monitoring</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400 bg-gray-900/80 border border-gray-800 p-4 rounded-lg flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              Only you can access your certificate data with your registered wallet address
            </div>
          </CardContent>
        </Card>

        {/* Registration Link */}
        <Card className="border-amber-500/30 bg-black/40 shadow-[0_0_20px_rgba(245,158,11,0.1)] backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="p-3 bg-amber-500/10 rounded-full inline-flex border border-amber-500/20">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
              <p className="text-gray-300">
                Don't have a wallet address registered? 
              </p>
              <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 hover:text-white transition-colors" asChild>
                <a href="/">Register as Creator</a>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}