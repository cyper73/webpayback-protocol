import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, ExternalLink } from "lucide-react";

interface SecurityTestResult {
  success: boolean;
  isBlacklisted: boolean;
  redirectUrl?: string;
  message: string;
  rickrollActivated?: boolean;
}

export function RickrollTest() {
  const [walletAddress, setWalletAddress] = useState('');
  const [result, setResult] = useState<SecurityTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testWalletSecurity = async () => {
    if (!walletAddress.trim()) {
      setResult({
        success: false,
        isBlacklisted: false,
        message: 'Please enter a wallet address'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet/security-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress.trim() })
      });

      const data = await response.json();
      setResult(data);

      // If rickroll is activated, open in new tab after a short delay
      if (data.rickrollActivated && data.redirectUrl) {
        setTimeout(() => {
          window.open(data.redirectUrl, '_blank');
        }, 1000);
      }
    } catch (error) {
      setResult({
        success: false,
        isBlacklisted: false,
        message: 'Failed to check wallet security'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testWallets = [
    {
      name: 'Uniswap Universal Router',
      address: '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b',
      type: 'DEX Contract'
    },
    {
      name: 'QuickSwap Router',
      address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      type: 'DEX Contract'
    },
    {
      name: 'Fake Test Wallet',
      address: '0x1234567890123456789012345678901234567890',
      type: 'Test/Fake'
    },
    {
      name: 'Bitcoin Address (Invalid)',
      address: '15q4LNSX3g8XFGLsjHi1PaZyuvkX4cu3wx',
      type: 'Wrong Network'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Wallet Security Test
          </CardTitle>
          <CardDescription>
            Test the DEX wallet blacklist and rickroll protection system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter wallet address to test..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={testWalletSecurity}
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Security'}
            </Button>
          </div>

          {result && (
            <Alert className={result.isBlacklisted ? 'border-red-500' : 'border-green-500'}>
              {result.isBlacklisted ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.isBlacklisted ? 'Wallet Blocked!' : 'Wallet Safe'}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{result.message}</p>
                {result.rickrollActivated && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-3 w-3" />
                    <span>Rickroll activated! Opening in new tab...</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
          <CardDescription>
            Quick test buttons for known malicious wallet addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testWallets.map((wallet) => (
              <Button
                key={wallet.address}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => setWalletAddress(wallet.address)}
              >
                <div className="text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {wallet.type}
                  </div>
                  <div className="text-xs font-mono text-gray-400 dark:text-gray-500 truncate">
                    {wallet.address}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}