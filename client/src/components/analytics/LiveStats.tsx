import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiveStatsProps {
  stats: any;
}

export default function LiveStats({ stats }: LiveStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const mockStats = {
    totalTransactions: 2847392,
    activeValidators: 1247,
    networkTvl: 24700000,
    creatorRewards: 184392,
    sitesMonitored: 45892,
    aiRequestsPerHour: 147200,
    accuracyRate: 99.7,
    antiFraudScore: "A+"
  };

  return (
    <>
      <Card className="glass-card rounded-2xl h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold gradient-text">Live Network Stats</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Total Transactions</p>
              <p className="font-mono text-neon-green text-lg font-bold">{formatNumber(mockStats.totalTransactions)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Active Validators</p>
              <p className="font-mono text-electric-blue text-lg font-bold">{formatNumber(mockStats.activeValidators)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Network TVL</p>
              <p className="font-mono text-amber-400 text-lg font-bold">${formatNumber(mockStats.networkTvl)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Creator Rewards</p>
              <p className="font-mono text-cyber-purple text-lg font-bold">{formatNumber(mockStats.creatorRewards)} WPT</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card rounded-2xl h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold gradient-text">AI Content Tracking</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Sites Monitored</p>
              <p className="font-mono text-neon-green text-lg font-bold">{formatNumber(mockStats.sitesMonitored)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">AI Requests/hr</p>
              <p className="font-mono text-electric-blue text-lg font-bold">{formatNumber(mockStats.aiRequestsPerHour)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Accuracy Rate</p>
              <p className="font-mono text-amber-400 text-lg font-bold">{mockStats.accuracyRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Anti-Fraud Score</p>
              <p className="font-mono text-cyber-purple text-lg font-bold">{mockStats.antiFraudScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
