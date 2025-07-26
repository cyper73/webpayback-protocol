import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Fuel, TrendingUp, Activity, Zap, Dices, Network, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

// Types for Gas Pool
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

// Types for Chainlink
interface ChainlinkPrices {
  prices: {
    MATIC_USD: number;
    ETH_USD: number;
    WPT_USD: number;
  };
  timestamp: string;
  source: string;
}

interface AutomationStatus {
  automation: {
    enabled: boolean;
    lastBatch: string;
    nextBatch: string;
    pendingRewards: number;
    gasPoolHealth: boolean;
  };
  timestamp: string;
}

interface VRFStats {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  recentRequests: Array<{
    requestId: string;
    timestamp: string;
    purpose: string;
    fulfilled: boolean;
  }>;
}

interface FunctionsStats {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  successRate: number;
  functionTypes: Record<string, number>;
}

export default function UnifiedDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('gas-pool');

  // Gas Pool queries
  const { data: gasStatus, isLoading: gasLoading } = useQuery<GasSystemStatus>({
    queryKey: ['/api/gas/status'],
    refetchInterval: 5000,
    retry: 1
  });

  // Chainlink queries
  const { data: prices, isLoading: pricesLoading, refetch: refetchPrices } = useQuery<ChainlinkPrices>({
    queryKey: ['/api/chainlink/prices'],
    refetchInterval: 30000,
    retry: 1
  });

  const { data: automation, isLoading: automationLoading, refetch: refetchAutomation } = useQuery<AutomationStatus>({
    queryKey: ['/api/chainlink/automation/status'],
    refetchInterval: 15000,
    retry: 1
  });

  const { data: vrfStats, isLoading: vrfLoading, refetch: refetchVRF } = useQuery<VRFStats>({
    queryKey: ['/api/chainlink/vrf/stats'],
    refetchInterval: 30000,
    retry: 1
  });

  const { data: functionsStats, isLoading: functionsLoading, refetch: refetchFunctions } = useQuery<FunctionsStats>({
    queryKey: ['/api/chainlink/functions/stats'],
    refetchInterval: 30000,
    retry: 1
  });

  // Manual refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchPrices(),
      refetchAutomation(),
      refetchVRF(),
      refetchFunctions()
    ]);
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Infrastructure Dashboard</h2>
          <p className="text-gray-400">Gas Pool Management & Chainlink Integration</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-electric-blue hover:bg-electric-blue/80"
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gas-pool">Gas Pool Management</TabsTrigger>
          <TabsTrigger value="chainlink">Chainlink Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="gas-pool" className="space-y-6">
          {gasLoading || !gasStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass-card rounded-2xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <Badge variant={gasStatus.gasPool.isHealthy ? "default" : "destructive"}>
                          {gasStatus.gasPool.isHealthy ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {gasStatus.gasPool.isHealthy ? "Healthy" : "Low"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Current Balance</span>
                          <span className="font-mono text-sm">{gasStatus.gasPool.currentBalance.toFixed(6)} MATIC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Fees Collected</span>
                          <span className="font-mono text-sm">{gasStatus.gasPool.totalFeesCollected.toFixed(6)} MATIC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Gas Spent</span>
                          <span className="font-mono text-sm">{gasStatus.gasPool.totalGasSpent.toFixed(6)} MATIC</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                        <Badge variant={gasStatus.isProcessorActive ? "default" : "destructive"}>
                          {gasStatus.isProcessorActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Pending Rewards</span>
                          <span className="font-mono text-sm">{gasStatus.pendingRewards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Batch Size</span>
                          <span className="font-mono text-sm">{gasStatus.batchSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Protocol Fee</span>
                          <span className="font-mono text-sm">{gasStatus.protocolFeePercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="text-neon-green" />
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="chainlink" className="space-y-6">
          <Tabs defaultValue="data-feeds">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="data-feeds">Data Feeds</TabsTrigger>
              <TabsTrigger value="vrf">VRF</TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
            </TabsList>

            <TabsContent value="data-feeds" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="text-electric-blue" />
                      MATIC/USD
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-electric-blue">
                        ${prices?.prices.MATIC_USD || '0.00'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Last update: {prices ? new Date(prices.timestamp).toLocaleTimeString() : 'Loading...'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="text-purple-400" />
                      ETH/USD
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-purple-400">
                        ${prices?.prices.ETH_USD || '0.00'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Last update: {prices ? new Date(prices.timestamp).toLocaleTimeString() : 'Loading...'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="text-amber-400" />
                      WPT/USD
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-amber-400">
                        ${prices?.prices.WPT_USD || '0.00'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Last update: {prices ? new Date(prices.timestamp).toLocaleTimeString() : 'Loading...'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="text-neon-green" />
                    Automation Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Status</span>
                        <Badge variant={automation?.automation.enabled ? "default" : "destructive"}>
                          {automation?.automation.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Pending Rewards</span>
                        <span className="font-mono text-sm">{automation?.automation.pendingRewards || 0}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Last Batch</span>
                        <span className="font-mono text-sm">
                          {automation ? new Date(automation.automation.lastBatch).toLocaleTimeString() : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Next Batch</span>
                        <span className="font-mono text-sm">
                          {automation ? new Date(automation.automation.nextBatch).toLocaleTimeString() : 'Loading...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vrf" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Dices className="text-purple-400" />
                      VRF Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Total Requests</span>
                        <span className="font-mono text-sm">{vrfStats?.totalRequests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Fulfilled</span>
                        <span className="font-mono text-sm text-neon-green">{vrfStats?.fulfilledRequests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Pending</span>
                        <span className="font-mono text-sm text-amber-400">{vrfStats?.pendingRequests || 0}</span>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Success Rate</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-neon-green h-2 rounded-full transition-all duration-300"
                            style={{ width: `${vrfStats ? (vrfStats.fulfilledRequests / vrfStats.totalRequests * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Recent Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vrfStats?.recentRequests.slice(0, 3).map((request, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-glass-dark rounded">
                          <div>
                            <div className="text-sm font-medium">{request.purpose}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(request.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge variant={request.fulfilled ? "default" : "secondary"}>
                            {request.fulfilled ? "Fulfilled" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="functions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Network className="text-electric-blue" />
                      Functions Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Total Requests</span>
                        <span className="font-mono text-sm">{functionsStats?.totalRequests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Fulfilled</span>
                        <span className="font-mono text-sm text-neon-green">{functionsStats?.fulfilledRequests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Success Rate</span>
                        <span className="font-mono text-sm">{functionsStats?.successRate || 0}%</span>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Performance</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-electric-blue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${functionsStats?.successRate || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Function Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {functionsStats?.functionTypes && Object.entries(functionsStats.functionTypes).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                          <span className="font-mono text-sm">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}