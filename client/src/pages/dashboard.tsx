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
import PoolDataMonitoring from "@/components/pool/PoolDataMonitoring";
import RewardDistribution from "@/components/web3/RewardDistribution";
import NetworkSwitcher from "@/components/web3/NetworkSwitcher";
import { GasTracker } from "@/components/gas/GasTracker";
import PoolDrainProtection from "@/components/pool/PoolDrainProtection";
import FakeCreatorDetection from "@/components/security/FakeCreatorDetection";
import ReentrancyProtection from "@/components/security/ReentrancyProtection";
import { AlchemyUsageMonitor } from "@/components/monitoring/AlchemyUsageMonitor";
import QlooCulturalDashboard from "@/components/cultural/QlooCulturalDashboard";
import { AIQueryProtectionDashboard } from "@/components/security/AIQueryProtectionDashboard";

import { Box, Wallet, Coins, Link, Shield, FileText, BookOpen, Activity, User, TrendingUp, AlertTriangle, CheckCircle, Zap, Users, Globe, ArrowUpRight, DollarSign, PieChart, BarChart3, Clock, RefreshCw, Eye, Rocket } from "lucide-react";
import { Link as RouterLink } from "wouter";
import { ErrorBoundary } from "@/components/ui/error-boundary";
// import wptLogo from "@assets/wpt-logo_1752556131899.png"; // Rimosso temporaneamente finché l'asset non è disponibile
import { useState, useEffect } from "react";

// Founder device detection (Firefox + Windows OK)
const isFounderDevice = () => {
  const userAgent = navigator.userAgent;
  return userAgent.includes('Windows') && (userAgent.includes('Chrome') || userAgent.includes('Firefox'));
};

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
    gcTime: 5 * 60 * 1000,
  });

  // Always show content, never loading screen
  // This prevents the initialization message from appearing

  const data = dashboardData || {
    agents: [],
    networks: [],
    creators: [],
    stats: { totalRequests: 0, totalRewards: 0, uniqueCreators: 0, averageUsage: 0 },
    rewards: [],
    pool: [],
    compliance: []
  };
  
  const { 
    agents = [], 
    networks = [], 
    creators = [], 
    stats = {}, 
    rewards = [], 
    pool = [], 
    compliance = [] 
  } = data || {};

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-deep-space text-white">
      {/* Clean Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-electric-blue to-purple-500 flex items-center justify-center text-white font-bold text-xs">WPT</div>
                <span className="text-lg font-bold gradient-text">WebPayback Protocol</span>
              </div>
              <div className="hidden sm:flex items-center space-x-1 bg-glass-dark px-2 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-400 animate-pulse' : 'bg-neon-green'} pulse-animation`}></div>
                <span className="text-xs text-gray-300">Level 280 AI Active</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <Wallet className="text-electric-blue w-4 h-4" />
                <span className="font-mono text-xs">0x9408...825</span>
              </div>
              <div className="flex items-center space-x-2 bg-glass-dark px-2 py-1 rounded-lg">
                <Coins className="text-amber-400 w-4 h-4" />
                <span className="font-mono text-xs">WPT Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions Bar */}
      <div className="bg-glass-dark/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <RouterLink to="/getting-started">
              <Button variant="outline" size="sm" className="bg-glass-dark border-blue-500/30 hover:bg-blue-500/20 text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Getting Started
              </Button>
            </RouterLink>
            
            <RouterLink to="/content-certificate">
              <Button variant="outline" size="sm" className="bg-glass-dark border-orange-500/30 hover:bg-orange-500/20 text-white">
                <Shield className="w-4 h-4 mr-2" />
                Content Certificate (2FA)
              </Button>
            </RouterLink>
            
            <RouterLink to="/citations">
              <Button variant="outline" size="sm" className="bg-glass-dark border-electric-blue/30 hover:bg-electric-blue/20 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Citations Rewards (2FA)
              </Button>
            </RouterLink>
            
            <RouterLink to="/pool-health">
              <Button variant="outline" size="sm" className="bg-glass-dark border-blue-500/30 hover:bg-blue-500/20 text-white">
                <Activity className="w-4 h-4 mr-2" />
                Pool Health
              </Button>
            </RouterLink>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 dashboard-container">
        {/* 🔧 INFRASTRUCTURE DASHBOARD - TOP PRIORITY */}
        <section className="dashboard-section">
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
        </section>

        {/* Creator Registration Portal - Priority Section */}
        <section className="dashboard-section dashboard-grid grid-cols-1 xl:grid-cols-2">
          <CreatorPortal />
          <GasTracker />
        </section>

        {/* Agent Collaboration Panel */}
        <section className="dashboard-section">
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
                {agents.map((agent: any) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Inter-Agent Communication */}
        <section className="dashboard-section">
          <AgentCommunication />
        </section>

        {/* Analytics & Multi-Chain Deployment */}
        <section className="dashboard-section dashboard-grid grid-cols-1 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <MultiChainDeployment networks={networks} />
          </div>
          <div>
            <LiveStats stats={stats} />
          </div>
        </section>

        {/* Token Economics and Pool Management */}
        <section className="dashboard-section dashboard-grid grid-cols-1 xl:grid-cols-3">
          <TokenEconomics stats={stats} pool={pool} rewards={rewards} />
          <TokenInfo />
          <PoolDataMonitoring />
        </section>

        {/* Creator Rewards & Governance */}
        <section className="dashboard-section dashboard-grid grid-cols-1 xl:grid-cols-2">
          <RewardDistribution />
          <ComplianceMonitor compliance={compliance} />
        </section>

        {/* Qloo Cultural Intelligence Dashboard */}
        <section className="dashboard-section">
          <Card className="glass-card rounded-2xl shadow-neon-purple border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold gradient-text">
                  🧠 Qloo Cultural Intelligence System
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">LLM → Qloo → WebPayback Active</span>
                </div>
              </div>
              <p className="text-gray-400">Taste-aware WPT rewards powered by cultural AI intelligence</p>
            </CardHeader>
            <CardContent>
              <QlooCulturalDashboard />
            </CardContent>
          </Card>
        </section>

        {/* Security & Monitoring Systems */}
        <section className="dashboard-section dashboard-grid grid-cols-1 xl:grid-cols-2">
          <div className="space-y-6">
            <PoolDrainProtection />
            <ReentrancyProtection />
          </div>
          <div className="space-y-6">
            <FakeCreatorDetection />
            <AlchemyUsageMonitor />
          </div>
        </section>

        {/* AI Query & VPN Protection */}
        <section className="dashboard-section">
          <Card className="glass-card rounded-2xl shadow-neon-purple">
            <CardHeader>
              <CardTitle className="text-2xl font-bold gradient-text">
                Advanced AI Query & VPN Protection
              </CardTitle>
              <p className="text-gray-400">Enhanced fraud detection with semantic analysis and geo-intelligence</p>
            </CardHeader>
            <CardContent>
              <AIQueryProtectionDashboard />
            </CardContent>
          </Card>
        </section>

        {/* Network Switcher */}
        <section className="dashboard-section">
          <NetworkSwitcher />
        </section>
      </main>

      {/* Footer with Privacy Policy */}
      <footer className="glass-card border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-electric-blue to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">WPT</div>
              <span className="text-sm text-gray-400">WebPayback Protocol - Where AI meets fair compensation for creators</span>
            </div>
            <div className="flex items-center space-x-6">
              <RouterLink href="/privacy" className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors">
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </RouterLink>
              <RouterLink href="/terms" className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors">
                <FileText className="h-4 w-4" />
                <span>Terms & Conditions</span>
              </RouterLink>
              <a 
                href="https://github.com/cyper73/webpayback-protocol/tree/webpayback" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Link className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a 
                href="mailto:cyper73@gmail.com" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  );
}