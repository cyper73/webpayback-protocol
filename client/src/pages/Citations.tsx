import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowRight, Shield, Eye, Zap } from "lucide-react";

export default function Citations() {
  const [walletAddress, setWalletAddress] = useState("");
  const [, setLocation] = useLocation();

  const handleWalletAccess = () => {
    if (walletAddress.trim()) {
      setLocation(`/citations/${walletAddress.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWalletAccess();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🔐 Citation Rewards Access
            </h1>
            <p className="text-gray-300 text-lg">
              Enter your wallet address to access your personalized citation dashboard
            </p>
          </div>

          <Card className="glass-card rounded-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2">
                <Wallet className="h-6 w-6 text-blue-400" />
                Wallet-Based Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-3">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">
                  Wallet Address
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button 
                    onClick={handleWalletAccess}
                    disabled={!walletAddress.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Secure Access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span>Personal Data</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span>Real-time Rewards</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border/20">
                Only you can access your citation data with your registered wallet address
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have a wallet address registered? 
              <a href="/" className="text-blue-400 hover:underline ml-1">
                Register as Creator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}