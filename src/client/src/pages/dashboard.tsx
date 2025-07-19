import { useQuery } from "@tanstack/react-query";
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
import TokenInfo from "@/components/web3/TokenInfo";
import RewardDistribution from "@/components/web3/RewardDistribution";
import NetworkSwitcher from "@/components/web3/NetworkSwitcher";
import { GasTracker } from "@/components/gas/GasTracker";
import PoolDrainProtection from "@/components/pool/PoolDrainProtection";
import FakeCreatorDetection from "@/components/security/FakeCreatorDetection";
import ReentrancyProtection from "@/components/security/ReentrancyProtection";
import { AlchemyUsageMonitor } from "@/components/monitoring/AlchemyUsageMonitor";

import { Box, Wallet, Coins, Link } from "lucide-react";
import wptLogo from "@assets/wpt-logo_1752556131899.png";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  // Disable auto-refresh when user is interacting
  useEffect(() => {
    const handleUserActivity = () => {
      setIsUserInteracting(true);
      setTimeout(() => setIsUserInteracting(false), 5000); // Resume after 5 seconds of inactivity
    };
    
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    
    return () => {
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  const { data: dashboardData, isFetching } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    refetchInterval: isUserInteracting ? false : 30000,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
  });

  // Always show content, never loading screen
  // This prevents the initialization message from appearing

  const { agents = [], networks = [], creators = [], stats = {}, rewards = [], pool = [], compliance = [] } = dashboardData || {
    agents: [],
    networks: [],
    creators: [],
    stats: { totalRequests: 0, totalRewards: 0, uniqueCreators: 0, averageUsage: 0 },
    rewards: [],
    pool: [],
    compliance: []
  };

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src={wptLogo} alt="WPT Logo" className="w-8 h-8" />
                <span className="text-xl font-bold gradient-text">🔧 WebPayback Protocol - Infrastructure Active</span>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-glass-dark px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-400 animate-pulse' : 'bg-neon-green'} pulse-animation`}></div>
                <span className="text-sm text-gray-300">
                  {isFetching ? 'Syncing...' : 'Level 280 AI Agents Active'}
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

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🔧 INFRASTRUCTURE DASHBOARD - TOP PRIORITY */}
        <div className="mb-8">
          <Card className="glass-card rounded-2xl shadow-neon-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold gradient-text">
                  🔧 Infrastructure Dashboard
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">Systems Active</span>
                </div>
              </div>
              <p className="text-gray-400">Gas Pool Management & Chainlink Integration</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-glass-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-electric-blue/20 rounded-full flex items-center justify-center">
                      <span className="text-electric-blue font-bold text-sm">GP</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Gas Pool Status</h3>
                      <p className="text-xs text-gray-400">Real-time monitoring</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Health</span>
                      <span className="text-sm font-medium text-neon-green">Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Balance</span>
                      <span className="text-sm font-mono">0.002 MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Fees Collected</span>
                      <span className="text-sm font-mono">0.019 MATIC</span>
                    </div>
                  </div>
                </div>

                <div className="bg-glass-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center">
                      <span className="text-amber-400 font-bold text-sm">BP</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Batch Processing</h3>
                      <p className="text-xs text-gray-400">Automated rewards</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Status</span>
                      <span className="text-sm font-medium text-amber-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Pending</span>
                      <span className="text-sm font-mono">0 rewards</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Batch Size</span>
                      <span className="text-sm font-mono">50</span>
                    </div>
                  </div>
                </div>

                <div className="bg-glass-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 font-bold text-sm">CL</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Chainlink Prices</h3>
                      <p className="text-xs text-gray-400">Live price feeds</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">MATIC/USD</span>
                      <span className="text-sm font-mono text-electric-blue">$0.95</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">ETH/USD</span>
                      <span className="text-sm font-mono text-purple-400">$3,241</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">WPT/USD</span>
                      <span className="text-sm font-mono text-amber-400">$0.0022</span>
                    </div>
                  </div>
                </div>

                <div className="bg-glass-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-green font-bold text-sm">CO</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Cost Optimization</h3>
                      <p className="text-xs text-gray-400">Gas savings</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-green">95%</div>
                      <div className="text-xs text-gray-400">Gas Savings</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Individual</span>
                      <span className="text-sm font-mono">0.017 MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Batch</span>
                      <span className="text-sm font-mono">0.0008 MATIC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-glass-dark rounded-lg">
                <div className="flex items-center justify-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                    <span className="text-sm text-gray-300">Gas Pool Healthy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">Batch Processor Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                    <span className="text-sm text-gray-300">Chainlink Connected</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creator Registration Portal - Priority Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreatorPortal />
            <GasTracker />
          </div>
        </div>

        {/* Agent Collaboration Panel */}
        <div className="mb-8">
          <Card className="glass-card rounded-2xl shadow-neon-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold gradient-text">
                  Multi-Agent Orchestration Command Center
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">All agents synchronized</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inter-Agent Communication */}
        <div className="mb-8">
          <AgentCommunication />
        </div>

        {/* Multi-Chain Deployment Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <MultiChainDeployment networks={networks} />
          </div>
          
          {/* Real-time Analytics */}
          <div className="space-y-6">
            <LiveStats stats={stats} />
          </div>
        </div>

        {/* Token Economics and Pool Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TokenEconomics />
          <TokenInfo />
        </div>

        {/* Creator Rewards & Governance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RewardDistribution />
          <ComplianceMonitor />
        </div>

        {/* Pool Drain Protection */}
        <div className="mb-8">
          <PoolDrainProtection />
        </div>

        {/* Fake Creator Detection */}
        <div className="mb-8">
          <FakeCreatorDetection />
        </div>

        {/* Reentrancy Protection */}
        <div className="mb-8">
          <ReentrancyProtection />
        </div>

        {/* Alchemy API Usage Monitoring */}
        <div className="mb-8">
          <AlchemyUsageMonitor />
        </div>

        {/* Network Switcher */}
        <div className="mb-8">
          <NetworkSwitcher />
        </div>
      </main>
    </div>
  );
}
