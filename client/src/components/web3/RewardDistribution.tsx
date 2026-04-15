import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Creator {
  id: number;
  userId: number;
  websiteUrl: string;
  walletAddress: string;
  contentCategory: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RewardDistribution {
  id: number;
  creatorId: number;
  amount: string;
  transactionHash: string | null;
  networkId: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export default function RewardDistribution() {
  const { data: creators } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
    refetchInterval: 30000
  });

  const { data: rewards } = useQuery<RewardDistribution[]>({
    queryKey: ["/api/rewards"],
    refetchInterval: 30000
  });

  return (
    <div className="space-y-6">

      {/* Distribution Statistics */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold gradient-text">Distribution Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Total Rewards */}
            <div className="bg-glass-dark rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-coins text-neon-green text-sm"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Distributed</div>
                    <div className="font-bold text-neon-green">
                      {rewards?.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2) || '0.00'} WPT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Creators */}
            <div className="bg-glass-dark rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-electric-blue/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-users text-electric-blue text-sm"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Active Creators</div>
                    <div className="font-bold text-electric-blue">
                      {rewards ? Array.from(new Set(rewards.map((r: any) => r.creatorId))).length : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-glass-dark rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-amber-400 text-sm"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                    <div className="font-bold text-amber-400">
                      {rewards ? 
                        Math.round((rewards.filter(r => r.status === 'completed').length / rewards.length) * 100) 
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}