import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingUp, Shield, AlertCircle } from "lucide-react";

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

export function GasTracker() {
  const { data: gasStatus } = useQuery<GasSystemStatus>({
    queryKey: ["/api/gas/status"],
    refetchInterval: 30000
  });

  if (!gasStatus) {
    return (
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
            <Fuel className="text-electric-blue" />
            Gas Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { gasPool, pendingRewards, batchSize, protocolFeePercentage } = gasStatus;

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
          <Fuel className="text-electric-blue" />
          Gas Management System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Gas Pool Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-glass-dark rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pool Balance</span>
              <Badge variant={gasPool.isHealthy ? "default" : "destructive"} className="text-xs">
                {gasPool.isHealthy ? "Healthy" : "Low"}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-neon-green">
              {gasPool.currentBalance.toFixed(3)} MATIC
            </div>
          </div>

          <div className="bg-glass-dark rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Protocol Fee</span>
              <TrendingUp className="text-electric-blue w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-electric-blue">
              {protocolFeePercentage}%
            </div>
          </div>
        </div>

        {/* Fees vs Gas Costs */}
        <div className="bg-glass-dark rounded-lg p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="text-neon-green w-4 h-4" />
            Protocol Covers All Gas Fees
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Total Fees Collected</div>
              <div className="text-neon-green font-mono">
                +{gasPool.totalFeesCollected.toFixed(3)} MATIC
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Total Gas Paid</div>
              <div className="text-amber-400 font-mono">
                -{gasPool.totalGasSpent.toFixed(3)} MATIC
              </div>
            </div>
          </div>
        </div>

        {/* Batch Processing Status */}
        <div className="bg-glass-dark rounded-lg p-4">
          <h3 className="font-semibold mb-4">Batch Processing</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Pending Rewards</div>
              <div className="text-white font-mono">{pendingRewards}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Batch Size</div>
              <div className="text-white font-mono">{batchSize}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Next Batch</div>
              <div className="text-white font-mono">~3 min</div>
            </div>
          </div>
        </div>

        {/* Gas-Free Promise */}
        <div className="bg-gradient-to-r from-electric-blue/20 to-neon-green/20 rounded-lg p-4 border border-electric-blue/30">
          <div className="flex items-start gap-3">
            <Shield className="text-neon-green w-5 h-5 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neon-green mb-1">Gas-Free Guarantee</h3>
              <p className="text-sm text-gray-300">
                WebPayback Protocol covers all blockchain gas fees for creators. 
                Your rewards are never reduced by transaction costs.
              </p>
            </div>
          </div>
        </div>

        {/* Fallback Mode Warning (only shown when gas pool is low) */}
        {!gasPool.isHealthy && (
          <div className="bg-amber-500/20 rounded-lg p-4 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-400 w-5 h-5 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-400 mb-1">Temporary Gas Deduction</h3>
                <p className="text-sm text-gray-300">
                  Due to high network congestion, minimal gas fees may be deducted from rewards. 
                  Normal gas-free operation will resume automatically.
                </p>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}