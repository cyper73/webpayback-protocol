import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, ExternalLink } from 'lucide-react';

interface PhantomCompatibilityAlertProps {
  onDismiss?: () => void;
  showAlternatives?: boolean;
}

export function PhantomCompatibilityAlert({ onDismiss, showAlternatives = true }: PhantomCompatibilityAlertProps) {
  const recommendedWallets = [
    { 
      name: 'MetaMask', 
      url: 'https://metamask.io/download/',
      description: 'Most popular Ethereum wallet with full Web3 support'
    },
    { 
      name: 'Coinbase Wallet', 
      url: 'https://www.coinbase.com/wallet/downloads',
      description: 'User-friendly wallet with built-in DeFi features'
    },
    { 
      name: 'Trust Wallet', 
      url: 'https://trustwallet.com/download',
      description: 'Mobile-first wallet supporting multiple blockchains'
    }
  ];

  return (
    <div className="space-y-4">
      <Alert className="border-yellow-500/20 bg-yellow-500/10">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          <div className="space-y-3">
            <div>
              <strong>Phantom Wallet Compatibility Issue</strong>
            </div>
            <p className="text-sm">
              Phantom is primarily designed for Solana blockchain and has limited compatibility with 
              Ethereum-based features. For the best experience with WebPayback Protocol, we recommend 
              using a dedicated Ethereum wallet.
            </p>
            
            {showAlternatives && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-yellow-200">Recommended Ethereum Wallets:</h4>
                <div className="grid gap-2">
                  {recommendedWallets.map((wallet) => (
                    <div key={wallet.name} className="flex items-center justify-between p-2 bg-black/20 rounded">
                      <div>
                        <div className="font-medium text-white">{wallet.name}</div>
                        <div className="text-xs text-gray-300">{wallet.description}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(wallet.url, '_blank')}
                        className="border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Install
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 text-xs text-yellow-300">
              <strong>Technical Note:</strong> Phantom uses Solana's Ed25519 signature scheme, 
              which is incompatible with Ethereum's ECDSA signatures required for WebPayback Protocol verification.
            </div>
            
            {onDismiss && (
              <div className="flex justify-end mt-3">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onDismiss}
                  className="text-yellow-200 hover:bg-yellow-500/10"
                >
                  I understand
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default PhantomCompatibilityAlert;