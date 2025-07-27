import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/agents/AgentCard";
import AgentCommunication from "@/components/agents/AgentCommunication";
import MultiChainDeployment from "@/components/blockchain/MultiChainDeployment";
import TokenEconomics from "@/components/blockchain/TokenEconomics";
import CreatorPortal from "@/components/creators/CreatorPortal";
import LiveStats from "@/components/analytics/LiveStats";
import ComplianceMonitor from "@/components/compliance/ComplianceMonitor";
import FraudDetectionRules from "@/components/fraud/FraudDetectionRules";
import FraudAlerts from "@/components/fraud/FraudAlerts";
import TokenInfo from "@/components/web3/TokenInfo";
import RewardDistribution from "@/components/web3/RewardDistribution";
import NetworkSwitcher from "@/components/web3/NetworkSwitcher";

import { Box, Wallet, Coins, Shield, AlertTriangle } from "lucide-react";
import wptLogo from "@assets/wpt-logo_1752556131899.png";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    agents: [],
    networks: [],
    creators: [],
    stats: { totalRequests: 0, totalRewards: 0, uniqueCreators: 0, averageUsage: 0 },
    rewards: [],
    pool: [],
    compliance: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }
      
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      setDashboardData(data);
      
      if (isLoading) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // Initial load
    fetchDashboardData();
    
    // Set up interval for refresh
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const { agents, networks, creators, stats, rewards, pool, compliance } = dashboardData;



  return (
    <div className="min-h-screen bg-deep-space text-white">
      
      {/* Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src={wptLogo} alt="WPT Logo" className="w-8 h-8" />
                <span className="text-xl font-bold gradient-text">WebPayback Protocol</span>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-glass-dark px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-neon-green'} pulse-animation`}></div>
                <span className="text-sm text-gray-300">
                  {isRefreshing ? 'Syncing...' : 'Level 280 AI Agents'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Wallet className="text-electric-blue" />
                <span className="font-mono">0x9077...91e</span>
              </div>
              <div className="flex items-center space-x-2 bg-glass-dark px-3 py-1 rounded-lg">
                <Coins className="text-amber-400" />
                <span className="font-mono">WPT Token Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard - Always show content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Registration Portal - Priority Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreatorPortal />
            
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold gradient-text">Recent Creator Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {rewards.slice(0, 3).map((reward, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-glass-dark rounded-lg">
                      <div className="w-8 h-8 bg-electric-blue/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-globe text-electric-blue text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">Creator #{reward.creatorId}</span>
                          <span className="text-neon-green font-mono text-sm">+{reward.amount} WPT</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Status: {reward.status}</span>
                          <span>{new Date(reward.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {rewards.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-gray-400">
                        +{rewards.length - 3} more rewards
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Rewards Today:</span>
                    <span className="font-mono text-neon-green">
                      {rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2)} WPT
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agent Collaboration Panel */}
        <div className="mb-8">
          <Card className="glass-card rounded-2xl shadow-neon-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold gradient-text">
                  Multi-Agent Orchestration
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
              
              <div className="mb-8">
                <AgentCommunication />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Analytics & Blockchain Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <LiveStats stats={stats} />
          </div>
          <div>
            <TokenInfo />
          </div>
        </div>

        {/* Multi-Chain Deployment & Token Economics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MultiChainDeployment networks={networks} />
          <TokenEconomics pool={pool} rewards={rewards} />
        </div>

        {/* Reward Distribution System */}
        <div className="mb-8">
          <RewardDistribution />
        </div>

        {/* Anti-Fraud Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
                <Shield className="text-electric-blue" />
                Anti-Fraud System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FraudDetectionRules />
            </CardContent>
          </Card>
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
                <AlertTriangle className="text-amber-400" />
                Fraud Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FraudAlerts />
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Governance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ComplianceMonitor compliance={compliance} />
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text">Network Switcher</CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkSwitcher />
            </CardContent>
          </Card>
          
          {/* GitHub Repository Link */}
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold gradient-text flex items-center gap-2">
                <i className="fab fa-github text-electric-blue"></i>
                Open Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fab fa-github text-electric-blue text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">WebPayback Protocol</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Complete source code available on GitHub
                  </p>
                  <a
                    href="https://github.com/cyper73/webpayback-protocol/tree/webpayback"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-glass-dark hover:bg-electric-blue/20 text-electric-blue border border-electric-blue/30 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                  >
                    <i className="fab fa-github"></i>
                    View on GitHub
                  </a>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>MIT License</span>
                    <span>Public Repository</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}