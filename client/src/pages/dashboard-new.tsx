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
import UnifiedPoolDisplay from "@/components/pool/UnifiedPoolDisplay";
import RewardDistribution from "@/components/web3/RewardDistribution";
import NetworkSwitcher from "@/components/web3/NetworkSwitcher";
import { Box, Wallet, Coins } from "lucide-react";
import wptLogo from "@assets/wpt-logo_1752556131899.png";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  // Disable auto-refresh when user is interacting
  useEffect(() => {
    const handleUserActivity = () => {
      setIsUserInteracting(true);
      setTimeout(() => setIsUserInteracting(false), 5000);
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
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Always render content, never show loading
  const { agents = [], networks = [], creators = [], stats = {}, rewards = [], pool = [], compliance = [] } = dashboardData || {};

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src={wptLogo} alt="WPT Logo" className="w-8 h-8" />
                <span className="text-xl font-bold gradient-text">WebPayback Protocol</span>
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
<<<<<<< HEAD
                <span className="font-mono">0x9408...825</span>
=======
                <span className="font-mono">0x9077...91e</span>
>>>>>>> 311f543f194f46e11a56aa7a6d731da287f53cc5
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
        {/* Creator Registration Portal - Priority Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreatorPortal />
            
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold gradient-text">Recent Creator Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewards.slice(0, 4).map((reward, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-glass-dark rounded-lg">
                      <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-globe text-electric-blue text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Creator #{reward.creatorId}</span>
                          <span className="text-neon-green font-mono">+{reward.amount} WPT</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Status: {reward.status}</span>
                          <span>{new Date(reward.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  Multi-Agent Orchestration Command Center
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">Live</span>
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
            <UnifiedPoolDisplay />
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

        {/* Compliance & Governance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ComplianceMonitor compliance={compliance} />
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text">Network Switcher</CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkSwitcher />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}