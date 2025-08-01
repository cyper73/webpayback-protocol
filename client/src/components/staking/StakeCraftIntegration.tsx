import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, TrendingUp, Coins } from "lucide-react";

export default function StakeCraftIntegration() {
  const { data: validators } = useQuery({
    queryKey: ['/api/pol-staking/validators'],
    refetchInterval: 30000,
  });

  const { data: poolInfo } = useQuery({
    queryKey: ['/api/web3/pool-info'],
    refetchInterval: 30000,
  });

  const { data: stakeCraftStatus } = useQuery({
    queryKey: ['/api/pol-staking/stakecraft-status'],
    refetchInterval: 30000,
  });

  const stakeCraftValidator = validators?.validators?.find(v => v.name.includes('StakeCraft'));
  const isUserDelegated = stakeCraftStatus?.validator?.userDelegated;

  return (
    <div className="space-y-6">
      {/* User Delegation Status */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              StakeCraft Delegation Active
            </CardTitle>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {stakeCraftStatus?.validator?.commission || 0}%
              </div>
              <div className="text-sm text-gray-400">Commission</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stakeCraftStatus?.rewards?.currentApy || 6.8}%
              </div>
              <div className="text-sm text-gray-400">Staking APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {stakeCraftStatus?.validator?.performance || 96.71}%
              </div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {stakeCraftStatus?.validator?.totalStaked || '585k POL'}
              </div>
              <div className="text-sm text-gray-400">Total Staked</div>
            </div>
          </div>

          {isUserDelegated && (
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-sm text-green-400 font-medium">
                ✅ Your delegation is active since {stakeCraftStatus?.validator?.delegationDate}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Next reward: {stakeCraftStatus?.rewards?.nextReward}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.open('https://staking.polygon.technology/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Delegation
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://staking.polygon.technology/', '_blank')}
            >
              View on Polygon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dual Rewards Summary */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <TrendingUp className="w-5 h-5" />
            Dual Rewards System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-blue-400">WMATIC/WPT Pool</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stakeCraftStatus?.dualRewards?.poolApy || 8.5}%
                </div>
                <div className="text-sm text-gray-400">Trading Fees APY</div>
              </div>

              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-green-400">POL Staking</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stakeCraftStatus?.dualRewards?.stakingApy || 6.8}%
                </div>
                <div className="text-sm text-gray-400">StakeCraft APY</div>
              </div>

              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-purple-400">Combined Total</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {stakeCraftStatus?.dualRewards?.combinedApy || 15.3}%
                </div>
                <div className="text-sm text-gray-400">Total APY</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-400 mb-2">
                  🏆 WebPayback Protocol Achievement
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  {stakeCraftStatus?.dualRewards?.description || 'First creator economy platform with native Polygon staking integration providing maximum yield for creators'}
                </div>
                <div className="text-xs text-yellow-400/80">
                  {stakeCraftStatus?.comparison?.savings || '100% commission savings vs Google Cloud'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Information */}
      {poolInfo && (
        <Card className="bg-glass-dark border-gray-700">
          <CardHeader>
            <CardTitle className="text-electric-blue">Live Pool Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-white">{poolInfo.totalValueLocked}</div>
                <div className="text-sm text-gray-400">TVL</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{poolInfo.volume24h}</div>
                <div className="text-sm text-gray-400">24h Volume</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{poolInfo.participants}</div>
                <div className="text-sm text-gray-400">Participants</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{poolInfo.fees24h}</div>
                <div className="text-sm text-gray-400">24h Fees</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}