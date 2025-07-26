import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface GasPoolStats {
  totalFeesCollected: number;
  totalGasSpent: number;
  currentBalance: number;
  isHealthy: boolean;
}

interface GasSystemStatus {
  gasPool: GasPoolStats;
  pendingRewards: number;
  batchSize: number;
  batchInterval: number;
  protocolFeePercentage: number;
  isProcessorActive: boolean;
}

interface ChainlinkPrices {
  prices: {
    MATIC_USD: number;
    ETH_USD: number;
    WPT_USD: number;
  };
  timestamp: string;
  source: string;
}

export default function SimpleInfrastructure() {
  // Gas Pool data
  const { data: gasStatus } = useQuery<GasSystemStatus>({
    queryKey: ['/api/gas/status'],
    refetchInterval: 5000,
    retry: 1
  });

  // Chainlink data
  const { data: prices } = useQuery<ChainlinkPrices>({
    queryKey: ['/api/chainlink/prices'],
    refetchInterval: 30000,
    retry: 1
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Infrastructure Dashboard</h2>
          <p className="text-gray-400">Gas Pool Management & Chainlink Integration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Gas Pool Status */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Fuel className="text-electric-blue" />
              Gas Pool Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Pool Health</span>
                <Badge variant={gasStatus?.gasPool.isHealthy ? "default" : "destructive"}>
                  {gasStatus?.gasPool.isHealthy ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {gasStatus?.gasPool.isHealthy ? "Healthy" : "Low"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Current Balance</span>
                  <span className="font-mono text-sm">{gasStatus?.gasPool.currentBalance.toFixed(6) || '0.000000'} MATIC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Fees Collected</span>
                  <span className="font-mono text-sm">{gasStatus?.gasPool.totalFeesCollected.toFixed(6) || '0.000000'} MATIC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Gas Spent</span>
                  <span className="font-mono text-sm">{gasStatus?.gasPool.totalGasSpent.toFixed(6) || '0.000000'} MATIC</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Processing */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="text-amber-400" />
              Batch Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Processor Status</span>
                <Badge variant={gasStatus?.isProcessorActive ? "default" : "destructive"}>
                  {gasStatus?.isProcessorActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Pending Rewards</span>
                  <span className="font-mono text-sm">{gasStatus?.pendingRewards || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Batch Size</span>
                  <span className="font-mono text-sm">{gasStatus?.batchSize || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Protocol Fee</span>
                  <span className="font-mono text-sm">{gasStatus?.protocolFeePercentage || 0}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chainlink Price Feeds */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="text-electric-blue" />
              Chainlink Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">MATIC/USD</span>
                <span className="font-mono text-sm text-electric-blue">${prices?.prices.MATIC_USD || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">ETH/USD</span>
                <span className="font-mono text-sm text-purple-400">${prices?.prices.ETH_USD || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">WPT/USD</span>
                <span className="font-mono text-sm text-amber-400">${prices?.prices.WPT_USD || '0.00'}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Updated: {prices ? new Date(prices.timestamp).toLocaleTimeString() : 'Loading...'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Optimization */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="text-neon-green" />
              Cost Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green mb-1">95%</div>
                <div className="text-sm text-gray-400">Gas Savings</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Individual Cost</span>
                  <span className="font-mono text-sm">0.017 MATIC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Batch Cost</span>
                  <span className="font-mono text-sm">0.0008 MATIC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Chainlink Oracle</span>
                  <span className="font-mono text-sm text-neon-green">40-60% Savings</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Gas Pool</span>
              <Badge variant={gasStatus?.gasPool.isHealthy ? "default" : "destructive"}>
                {gasStatus?.gasPool.isHealthy ? "Healthy" : "Low Balance"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Batch Processor</span>
              <Badge variant={gasStatus?.isProcessorActive ? "default" : "destructive"}>
                {gasStatus?.isProcessorActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Chainlink Feed</span>
              <Badge variant={prices ? "default" : "destructive"}>
                {prices ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}