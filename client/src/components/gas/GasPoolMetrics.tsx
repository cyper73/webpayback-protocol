import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Zap,
  Target,
  BarChart3,
  PieChart
} from "lucide-react";

interface GasEfficiency {
  saved: number;
  individualCost: number;
  batchCost: number;
}

interface GasMetrics {
  totalRewards: number;
  recentRewards: number;
  batchProcessedCount: number;
  batchEfficiency: number;
  totalValue: number;
  avgRewardValue: number;
  gasEfficiency: GasEfficiency;
}

interface GasSystemStatus {
  gasPool: {
    totalFeesCollected: number;
    totalGasSpent: number;
    currentBalance: number;
    isHealthy: boolean;
  };
  pendingRewards: number;
  batchSize: number;
  batchInterval: number;
  protocolFeePercentage: number;
  isProcessorActive: boolean;
  metrics: GasMetrics;
}

export function GasPoolMetrics() {
  const { data: gasStatus } = useQuery<GasSystemStatus>({
    queryKey: ["/api/gas/status"],
    refetchInterval: 5000,
    retry: 3
  });

  if (!gasStatus) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card rounded-xl">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { metrics, gasPool } = gasStatus;
  const gasSavings = metrics.gasEfficiency.saved;
  const savingsPercentage = metrics.gasEfficiency.individualCost > 0 
    ? ((gasSavings / metrics.gasEfficiency.individualCost) * 100) 
    : 0;
  const displaySavingsPercentage = isNaN(savingsPercentage) ? 0 : savingsPercentage;

  return (
    <div className="space-y-6">
      
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Value Processed */}
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-neon-green">
                  {metrics.totalValue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">WPT processed</p>
              </div>
              <DollarSign className="w-8 h-8 text-neon-green opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Batch Efficiency */}
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Batch Efficiency</p>
                <p className="text-2xl font-bold text-electric-blue">
                  {metrics.batchEfficiency.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500">of rewards batched</p>
              </div>
              <Target className="w-8 h-8 text-electric-blue opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Gas Savings */}
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Gas Saved</p>
                <p className="text-2xl font-bold text-amber-400">
                  {gasSavings.toFixed(4)}
                </p>
                <p className="text-xs text-gray-500">MATIC saved</p>
              </div>
              <Zap className="w-8 h-8 text-amber-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Recent Activity</p>
                <p className="text-2xl font-bold text-purple-400">
                  {metrics.recentRewards}
                </p>
                <p className="text-xs text-gray-500">rewards (1h)</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost Analysis */}
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold gradient-text flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Individual Processing</span>
                <span className="text-sm font-mono text-red-400">
                  {metrics.gasEfficiency.individualCost.toFixed(4)} MATIC
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Batch Processing</span>
                <span className="text-sm font-mono text-neon-green">
                  {metrics.gasEfficiency.batchCost.toFixed(4)} MATIC
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-sm font-medium text-gray-300">Total Saved</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {gasSavings.toFixed(4)} MATIC
                </span>
              </div>
            </div>

            {/* Savings Percentage */}
            <div className="bg-glass-dark rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Savings Rate</span>
                <span className="text-sm font-bold text-amber-400">
                  {savingsPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={savingsPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold gradient-text flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Average Reward Value */}
            <div className="bg-glass-dark rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Avg. Reward Value</span>
                <span className="text-lg font-bold text-neon-green">
                  {metrics.avgRewardValue.toFixed(3)} WPT
                </span>
              </div>
            </div>

            {/* Processing Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-glass-dark rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">Total Processed</div>
                <div className="text-lg font-bold text-electric-blue">
                  {metrics.totalRewards}
                </div>
              </div>
              
              <div className="bg-glass-dark rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">Batch Processed</div>
                <div className="text-lg font-bold text-purple-400">
                  {metrics.batchProcessedCount}
                </div>
              </div>
            </div>

            {/* Pool Health */}
            <div className="bg-glass-dark rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Pool Health</span>
                <Badge variant={gasPool.isHealthy ? "default" : "destructive"}>
                  {gasPool.isHealthy ? "Healthy" : "Critical"}
                </Badge>
              </div>
              <div className="text-lg font-bold text-neon-green">
                {gasPool.currentBalance.toFixed(4)} MATIC
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}