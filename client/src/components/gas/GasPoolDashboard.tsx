import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Fuel, TrendingUp, TrendingDown, Clock, Users, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { GasPoolMetrics } from "./GasPoolMetrics";

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

interface RewardDistribution {
  id: number;
  creatorId: number;
  amount: string;
  tokenType: string;
  transactionHash: string;
  status: string;
  completedAt: string;
  metadata: {
    aiModel?: string;
    batchProcessed?: boolean;
    gasFeeDeducted?: boolean;
  };
}

export function GasPoolDashboard() {
  const { data: gasStatus, isLoading: gasLoading, error: gasError } = useQuery<GasSystemStatus>({
    queryKey: ["/api/gas/status"],
    refetchInterval: 5000, // Update every 5 seconds
    retry: 3
  });

  const { data: rewards } = useQuery<RewardDistribution[]>({
    queryKey: ["/api/rewards"],
    refetchInterval: 10000 // Update every 10 seconds
  });

  if (gasLoading || !gasStatus) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Gas Pool Dashboard</h2>
            <p className="text-gray-400">
              {gasLoading ? "Loading gas pool data..." : gasError ? "Error loading gas pool data" : "Real-time gas fee management"}
            </p>
          </div>
        </div>
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
      </div>
    );
  }

  const { gasPool, pendingRewards, batchSize, protocolFeePercentage, isProcessorActive } = gasStatus;
  
  // Calculate pool health percentage
  const poolHealthPercentage = Math.min(100, (gasPool.currentBalance / 10) * 100); // 10 MATIC = 100%
  
  // Calculate efficiency metrics
  const totalProcessed = rewards?.length || 0;
  const batchProcessedCount = rewards?.filter(r => r.metadata?.batchProcessed).length || 0;
  const batchEfficiency = totalProcessed > 0 ? (batchProcessedCount / totalProcessed) * 100 : 0;
  
  // Calculate recent activity
  const recentRewards = rewards?.slice(0, 5) || [];
  const totalRewardsValue = rewards?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Gas Pool Dashboard</h2>
          <p className="text-gray-400">Real-time gas fee management and reward processing</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isProcessorActive ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300">
            {isProcessorActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Gas Pool Balance */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              Pool Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-neon-green">
                {gasPool.currentBalance.toFixed(4)} MATIC
              </div>
              <Progress value={poolHealthPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Health: {poolHealthPercentage.toFixed(0)}%</span>
                <Badge variant={gasPool.isHealthy ? "default" : "destructive"} className="text-xs">
                  {gasPool.isHealthy ? "Healthy" : "Low"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees Collected */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Fees Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-electric-blue">
                {gasPool.totalFeesCollected.toFixed(4)} MATIC
              </div>
              <div className="text-sm text-gray-500">
                {protocolFeePercentage}% protocol fee
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gas Spent */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Gas Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-amber-400">
                {gasPool.totalGasSpent.toFixed(4)} MATIC
              </div>
              <div className="text-sm text-gray-500">
                Total network fees paid
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Rewards */}
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-400">
                {pendingRewards}
              </div>
              <div className="text-sm text-gray-500">
                Next batch: {batchSize} rewards
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gas Pool Status & Batch Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gas Pool Status */}
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
              <Zap className="text-electric-blue" />
              Gas Pool Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Balance Trend */}
            <div className="bg-glass-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Balance</span>
                {gasPool.isHealthy ? (
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="text-2xl font-bold text-neon-green mb-2">
                {gasPool.currentBalance.toFixed(4)} MATIC
              </div>
              <Progress value={poolHealthPercentage} className="h-2" />
            </div>

            {/* Revenue vs Costs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-glass-dark rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Revenue</div>
                <div className="text-lg font-bold text-neon-green">
                  +{gasPool.totalFeesCollected.toFixed(4)}
                </div>
              </div>
              <div className="bg-glass-dark rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Costs</div>
                <div className="text-lg font-bold text-amber-400">
                  -{gasPool.totalGasSpent.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Profitability */}
            <div className="bg-glass-dark rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Net Profit</div>
              <div className={`text-lg font-bold ${gasPool.currentBalance > 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {gasPool.currentBalance > 0 ? '+' : ''}{gasPool.currentBalance.toFixed(4)} MATIC
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Processing Stats */}
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
              <Users className="text-purple-400" />
              Batch Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Batch Efficiency */}
            <div className="bg-glass-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Batch Efficiency</span>
                <span className="text-sm text-gray-400">{batchEfficiency.toFixed(1)}%</span>
              </div>
              <Progress value={batchEfficiency} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {batchProcessedCount} of {totalProcessed} rewards batched
              </div>
            </div>

            {/* Current Batch */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-glass-dark rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Queue Size</div>
                <div className="text-lg font-bold text-purple-400">{pendingRewards}</div>
              </div>
              <div className="bg-glass-dark rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Batch Size</div>
                <div className="text-lg font-bold text-electric-blue">{batchSize}</div>
              </div>
            </div>

            {/* Processing Status */}
            <div className="bg-glass-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processor Status</span>
                <Badge variant={isProcessorActive ? "default" : "destructive"}>
                  {isProcessorActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-sm text-gray-400">
                Next batch in ~{Math.ceil((300000 - (Date.now() % 300000)) / 60000)} minutes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <div className="mb-8">
        <GasPoolMetrics />
      </div>

      {/* Recent Rewards Activity */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
            <TrendingUp className="text-neon-green" />
            Recent Rewards Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-glass-dark rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Total Rewards</div>
                <div className="text-lg font-bold text-neon-green">
                  {totalRewardsValue.toFixed(2)} WPT
                </div>
              </div>
              <div className="bg-glass-dark rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Transactions</div>
                <div className="text-lg font-bold text-electric-blue">
                  {totalProcessed}
                </div>
              </div>
              <div className="bg-glass-dark rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Gas Saved</div>
                <div className="text-lg font-bold text-amber-400">
                  {(batchProcessedCount * 0.001).toFixed(4)} MATIC
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-300 mb-2">Recent Transactions</h4>
              {recentRewards.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentRewards.map((reward) => (
                    <div key={reward.id} className="bg-glass-dark rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-electric-blue/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-electric-blue">
                              #{reward.creatorId}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {isNaN(parseFloat(reward.amount)) ? "0.000" : parseFloat(reward.amount).toFixed(3)} {reward.tokenType}
                            </div>
                            <div className="text-xs text-gray-500">
                              {reward.metadata?.aiModel || 'AI Model'} • {reward.status}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={reward.metadata?.batchProcessed ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {reward.metadata?.batchProcessed ? "Batched" : "Individual"}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(reward.completedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}