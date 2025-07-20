import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Activity, ArrowLeftRight } from "lucide-react";
import PoolDataStatus from "./PoolDataStatus";

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  poolAddress: string;
  poolLiquidity: string;
}

interface PoolInfo {
  poolAddress: string;
  token0: string;
  token1: string;
  liquidity: string;
  price: string;
  volume24h: string;
  fees24h: string;
  totalValueLocked?: string;
  fee?: string;
  apy?: string;
  stakingApy?: string;
  combinedApy?: string;
  name?: string;
  dataSource?: string;
  lastUpdated?: number;
}

interface NetworkStatus {
  chainId: number;
  networkName: string;
  rpcUrl: string;
  explorerUrl: string;
  tokenAddress: string;
  poolAddress: string;
  isConnected: boolean;
  blockHeight: number;
}

export default function TokenInfo() {
  const [selectedPool, setSelectedPool] = useState<'pol' | 'wmatic'>('pol');

  const { data: tokenInfo } = useQuery<TokenInfo>({
    queryKey: ["/api/web3/token-info"],
    refetchInterval: 30000
  });

  const { data: poolInfo } = useQuery<PoolInfo>({
    queryKey: ["/api/web3/pool-info", selectedPool],
    queryFn: () => fetch(`/api/web3/pool-info?pool=${selectedPool}`).then(r => r.json()),
    refetchInterval: 30000
  });

  const { data: networkStatus } = useQuery<NetworkStatus>({
    queryKey: ["/api/web3/network-status"],
    refetchInterval: 30000
  });

  const formatNumber = (value: string, decimals: number = 18) => {
    // If value is null, undefined, or empty, return default
    if (!value || value === "0") return "$0";
    
    // Check if value already contains currency symbols or is pre-formatted
    if (value && (value.includes('$') || value.includes(',') || value.includes('.'))) {
      return value; // Return as-is if already formatted from real data
    }
    
    // Only apply decimal conversion for raw wei values (very large numbers)
    if (value.length > 10) {
      const num = parseFloat(value) / Math.pow(10, decimals);
      return `$${num.toLocaleString()}`;
    }
    
    // For smaller numbers, treat as already formatted
    return value;
  };

  const formatPrice = (value: string) => {
    return parseFloat(value).toFixed(6);
  };

  // Show empty state instead of loading to prevent refresh issues
  if (!tokenInfo || !poolInfo || !networkStatus) {
    return (
      <div className="space-y-6">
        <Card className="border-gray-500/20 bg-gray-900/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              Loading Network Status...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-400">Connecting to blockchain...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card className="border-green-500/20 bg-green-900/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Network Status
          </CardTitle>
          <CardDescription>
            Connected to {networkStatus.networkName} (Chain ID: {networkStatus.chainId})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Block</p>
              <p className="text-lg font-semibold">{networkStatus.blockHeight.toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {networkStatus.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pool Data Status */}
      <PoolDataStatus />

      {/* Token Information */}
      <Card className="border-blue-500/20 bg-blue-900/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            WPT Token Information
          </CardTitle>
          <CardDescription>
            Real token deployed on Polygon blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm text-gray-500 mb-2">Contract Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono truncate">{tokenInfo.address.slice(0, 8)}...{tokenInfo.address.slice(-6)}</p>
                  <a 
                    href={`${networkStatus.explorerUrl}/token/${tokenInfo.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-500 mb-2">Symbol</p>
                <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm text-gray-500 mb-2">Total Supply</p>
                <p className="text-lg font-semibold break-words">{formatNumber(tokenInfo.totalSupply)} WPT</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-500 mb-2">Decimals</p>
                <p className="text-lg font-semibold">{tokenInfo.decimals}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Information */}
      <Card className="border-purple-500/20 bg-purple-900/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Liquidity Pool ({poolInfo.token0}/{poolInfo.token1})
            <Badge variant="outline" className="ml-auto">
              {poolInfo?.name || `${poolInfo?.token0}/${poolInfo?.token1} Pool`}
            </Badge>
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Live pool data from Polygon DEX</span>
            <div className="flex gap-2">
              <Button
                variant={selectedPool === 'pol' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPool('pol')}
                className={`text-xs ${selectedPool === 'pol' ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-100'}`}
              >
                💎 POL/WPT (Primary)
              </Button>
              <Button
                variant={selectedPool === 'wmatic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPool('wmatic')}
                className={`text-xs ${selectedPool === 'wmatic' ? 'bg-orange-600 hover:bg-orange-700' : 'hover:bg-orange-100'}`}
              >
                🔄 WMATIC/WPT (Legacy)
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm text-gray-500 mb-2">Pool Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono truncate">{poolInfo.poolAddress.slice(0, 8)}...{poolInfo.poolAddress.slice(-6)}</p>
                  <a 
                    href={`${networkStatus.explorerUrl}/address/${poolInfo.poolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-500 mb-2">Current Price</p>
                <p className="text-lg font-semibold">{formatPrice(poolInfo.price)} {poolInfo.token0}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm text-gray-500 mb-2">Liquidity</p>
                  <p className="text-lg font-semibold break-words">{poolInfo.totalValueLocked || formatNumber(poolInfo.liquidity) + ' WPT'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-500 mb-2">24h Fees</p>
                  <p className="text-lg font-semibold">{formatNumber(poolInfo.fees24h)}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">24h Volume</p>
                <p className="text-lg font-semibold">{formatNumber(poolInfo.volume24h)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Blockchain Integration Notice */}
      <Card className="border-amber-500/20 bg-amber-900/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-amber-400 rounded-full mt-2 shrink-0"></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-400">Real Blockchain Integration</p>
              <p className="text-sm text-gray-400 mt-1 break-words">
                This is connected to your actual WPT token on Polygon. All reward distributions will be processed through the real smart contract.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}