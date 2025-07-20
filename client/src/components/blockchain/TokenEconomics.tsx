import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PoolManagement, RewardDistribution } from "@shared/schema";

interface TokenEconomicsProps {
  stats: any;
  pool?: PoolManagement[];
  rewards?: RewardDistribution[];
}

export default function TokenEconomics({ stats, pool = [], rewards = [] }: TokenEconomicsProps) {
  const totalPool = pool.reduce((sum, p) => sum + parseFloat(p.totalStaked || "0"), 0);
  const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
  const avgApy = pool.length > 0 ? pool.reduce((sum, p) => sum + parseFloat(p.apy || "0"), 0) / pool.length : 0;

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text">Token Economics Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-electric-blue">Creator Fee Distribution</h4>
              <Badge className="text-xs bg-neon-green/20 text-neon-green">3.0%</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Collected:</span>
                <span className="font-mono">{isNaN(totalRewards * 0.03) ? "0" : (totalRewards * 0.03).toFixed(0)} WPT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Creator Wallet:</span>
                <span className="font-mono text-xs">0xca5E...508Ba</span>
              </div>
              <Progress value={75} className="w-full h-2" />
            </div>
          </div>
          
          <div className="bg-glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-neon-green">Reward Pool Status</h4>
              <Badge className="text-xs bg-neon-green/20 text-neon-green">
                {totalPool > 500000 ? "HEALTHY" : "LOW"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pool Balance:</span>
                <span className="font-mono">{totalPool.toFixed(0)} WPT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Daily Rewards:</span>
                <span className="font-mono">{isNaN(totalRewards * 0.1) ? "0" : (totalRewards * 0.1).toFixed(0)} WPT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sustainability:</span>
                <span className="text-neon-green">{isNaN(totalPool / (totalRewards * 0.1)) ? "∞" : Math.floor(totalPool / (totalRewards * 0.1)) || 0} days</span>
              </div>
            </div>
          </div>
          
          <div className="bg-glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-cyber-purple">Staking Rewards</h4>
              <Badge className="text-xs bg-cyber-purple/20 text-cyber-purple">
                {avgApy.toFixed(1)}% APY
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Staked:</span>
                <span className="font-mono">{totalPool.toFixed(0)} WPT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stakers:</span>
                <span className="font-mono">{pool.reduce((sum, p) => sum + (p.stakersCount || 0), 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rewards Today:</span>
                <span className="font-mono">{isNaN(totalRewards * 0.05) ? "0" : (totalRewards * 0.05).toFixed(0)} WPT</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
