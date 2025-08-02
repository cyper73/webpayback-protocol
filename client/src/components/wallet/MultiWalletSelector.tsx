import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Wallet, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';

interface WalletType {
  type: string;
  name: string;
  isHardwareWallet: boolean;
  supportedChains: string[];
}

interface MultiWalletSelectorProps {
  onWalletSelect: (walletType: string, walletName: string) => void;
  selectedWalletType?: string;
}

export function MultiWalletSelector({ onWalletSelect, selectedWalletType }: MultiWalletSelectorProps) {
  const [supportedWallets, setSupportedWallets] = useState<WalletType[]>([]);
  const [detectedWallet, setDetectedWallet] = useState<{
    type: string;
    name: string;
    isHardwareWallet: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSupportedWallets();
    detectCurrentWallet();
  }, []);

  const loadSupportedWallets = async () => {
    try {
      const response = await apiRequest('GET', '/api/wallet/supported-types');
      const result = await response.json();
      
      if (result.success) {
        setSupportedWallets(result.supportedWallets);
      } else {
        setError('Failed to load supported wallets');
      }
    } catch (err) {
      setError('Network error loading wallet types');
    } finally {
      setIsLoading(false);
    }
  };

  const detectCurrentWallet = async () => {
    try {
      // Detect wallet from browser environment
      const walletInfo = {
        name: 'unknown'
      };

      // Check for specific wallet providers
      if (typeof window !== 'undefined') {
        if ((window as any).phantom?.solana) {
          walletInfo.name = 'phantom';
          // Show compatibility warning for Phantom
          toast({
            title: "Phantom Wallet Detected",
            description: "Phantom is primarily for Solana. For full Ethereum support, please use MetaMask, Coinbase, or Trust Wallet.",
            variant: "destructive",
          });
        } else if ((window as any).ethereum?.isMetaMask) {
          walletInfo.name = 'metamask';
        } else if ((window as any).ethereum?.isCoinbaseWallet) {
          walletInfo.name = 'coinbase';
        } else if ((window as any).ethereum?.isTrust) {
          walletInfo.name = 'trust';
        } else if ((window as any).ethereum?.isRainbow) {
          walletInfo.name = 'rainbow';
        } else if ((window as any).ethereum?.isBraveWallet) {
          walletInfo.name = 'brave';
        }
      }

      const response = await apiRequest('POST', '/api/wallet/detect-type', {
        userAgent: navigator.userAgent,
        walletInfo
      });
      
      const result = await response.json();
      
      if (result.success && result.walletType !== 'unknown') {
        setDetectedWallet({
          type: result.walletType,
          name: result.walletName,
          isHardwareWallet: result.isHardwareWallet
        });
      }
    } catch (err) {
      console.log('Wallet detection failed:', err);
    }
  };

  const selectWallet = (walletType: string, walletName: string) => {
    onWalletSelect(walletType, walletName);
    toast({
      title: "Wallet selected",
      description: `${walletName} has been selected for verification`,
    });
  };

  const getWalletIcon = (walletType: string) => {
    // Return appropriate icon based on wallet type
    switch (walletType) {
      case 'phantom':
        return '👻';
      case 'metamask':
        return '🦊';
      case 'coinbase':
        return '🔵';
      case 'trust':
        return '🛡️';
      case 'rainbow':
        return '🌈';
      case 'uniswap':
        return '🦄';
      case 'ledger':
      case 'trezor':
        return '🔒';
      case 'gnosis':
        return '🏦';
      default:
        return '👛';
    }
  };

  const getChainsDisplay = (chains: string[]) => {
    const displayChains = chains.slice(0, 3);
    const remaining = chains.length - 3;
    
    return (
      <div className="flex flex-wrap gap-1">
        {displayChains.map(chain => (
          <Badge key={chain} variant="outline" className="text-xs">
            {chain}
          </Badge>
        ))}
        {remaining > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remaining}
          </Badge>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading wallet types...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Select Your Wallet Type
        </CardTitle>
        <CardDescription>
          Choose your wallet type for optimized signature verification. We support {supportedWallets.length} wallet types.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-detected wallet */}
        {detectedWallet && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Auto-detected:</strong> {detectedWallet.name}
              {detectedWallet.isHardwareWallet && ' (Hardware Wallet)'}
              <Button
                variant="link"
                size="sm"
                className="ml-2 p-0 h-auto text-blue-600"
                onClick={() => selectWallet(detectedWallet.type, detectedWallet.name)}
              >
                Use This
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Wallet grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {supportedWallets.map((wallet) => (
            <div
              key={wallet.type}
              className={`
                relative p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950
                ${selectedWalletType === wallet.type ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'}
              `}
              onClick={() => selectWallet(wallet.type, wallet.name)}
            >
              {/* Selection indicator */}
              {selectedWalletType === wallet.type && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              )}

              {/* Wallet info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getWalletIcon(wallet.type)}</span>
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    {wallet.isHardwareWallet && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Hardware
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Supported chains */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Supported chains:</div>
                  {getChainsDisplay(wallet.supportedChains)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special notices */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Phantom Wallet Notice:</strong> Phantom uses Solana-based message signing which may require special handling. 
              Other Ethereum-compatible wallets are recommended for best experience.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Hardware Wallets:</strong> Ledger and Trezor require device confirmation for signing.
              Make sure your device is connected and unlocked.
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Multi-sig Wallets:</strong> Gnosis Safe may require multiple signatures depending on your safe configuration.
            </div>
          </div>
        </div>

        {/* Help link */}
        <div className="pt-2 border-t">
          <Button variant="link" size="sm" className="p-0 h-auto">
            <ExternalLink className="h-3 w-3 mr-1" />
            Don't see your wallet? Contact support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}