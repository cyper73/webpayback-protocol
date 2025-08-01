import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  
  const { toast } = useToast();

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
      toast({
        title: "Access Denied",
        description: error.message || "Wallet verification failed",
        variant: "destructive",
      });
    }
  });

  const handleWalletSubmit = () => {
    if (!walletAddress) {
      toast({
        title: "Missing Wallet Address",
        description: "Please enter your wallet address",
        variant: "destructive",
      });
      return;
    }

    // Basic wallet address validation
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive",
      });
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
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              Content Certificate Access Granted
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <strong>Creator:</strong> {verifiedCreator.websiteUrl}
                </div>
                <div>
                  <strong>Wallet:</strong> {verifiedCreator.walletAddress}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  <Badge className="bg-green-600 text-white">✓ Verified</Badge>
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-12 w-12 text-blue-500" />
            <h1 className="text-4xl font-bold">Content Certificate Access</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Enter your wallet address to access your personalized NFT certificate dashboard
          </p>
        </div>

        {/* Access Form */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Wallet className="h-5 w-5" />
              Wallet-Based Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={verifyWallet.isPending}
                />
                <Button 
                  onClick={handleWalletSubmit}
                  disabled={verifyWallet.isPending || !walletAddress}
                  className="px-6"
                >
                  {verifyWallet.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <div className="font-semibold">Secure Access</div>
                <p className="text-sm text-muted-foreground">Cryptographic verification</p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 text-blue-500 mx-auto" />
                <div className="font-semibold">Personal Data</div>
                <p className="text-sm text-muted-foreground">Your certificates only</p>
              </div>
              <div className="text-center space-y-2">
                <ArrowRight className="h-8 w-8 text-purple-500 mx-auto" />
                <div className="font-semibold">Real-time Protection</div>
                <p className="text-sm text-muted-foreground">AI theft monitoring</p>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              Only you can access your certificate data with your registered wallet address
            </div>
          </CardContent>
        </Card>

        {/* Registration Link */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto" />
              <p className="text-amber-700 dark:text-amber-300">
                Don't have a wallet address registered? 
              </p>
              <Button variant="outline" className="border-amber-300" asChild>
                <a href="/creator-portal">Register as Creator</a>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}