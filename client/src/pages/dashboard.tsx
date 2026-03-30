import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreatorPortal from "@/components/creators/CreatorPortal";
import ComplianceMonitor from "@/components/compliance/ComplianceMonitor";
import PoolDrainProtection from "@/components/pool/PoolDrainProtection";
import ReentrancyProtection from "@/components/security/ReentrancyProtection";
import { AlchemyUsageMonitor } from "@/components/monitoring/AlchemyUsageMonitor";
import { AIQueryProtectionDashboard } from "@/components/security/AIQueryProtectionDashboard";
import SimpleInfrastructure from "@/components/unified/SimpleInfrastructure";
import FraudAlerts from "@/components/fraud/FraudAlerts";
import CategoryContentStatistics from "@/components/analytics/CategoryContentStatistics";

import { Box, Wallet, Coins, Link, Shield, FileText, BookOpen, Activity, User, TrendingUp, AlertTriangle, CheckCircle, Zap, Users, Globe, ArrowUpRight, DollarSign, PieChart, BarChart3, Clock, RefreshCw, Eye, Rocket, Settings, ShieldAlert, ArrowRight, Cpu } from "lucide-react";
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
    compliance: [],
    alerts: []
  };
  
  const { 
    agents = [], 
    networks = [], 
    creators = [], 
    stats = {}, 
    rewards = [], 
    pool = [], 
    compliance = [],
    alerts = []
  } = data || {};

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-deep-space text-white">
      {/* Clean Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0 justify-start">
              <div className="flex-shrink-0">
                <img src="/logo.png" alt="WPT Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-electric-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              </div>
              <div className="hidden lg:flex items-center space-x-1 bg-glass-dark px-2 py-1 rounded-full whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-400 animate-pulse' : 'bg-neon-green'} pulse-animation`}></div>
                <span className="text-xs text-gray-300">System Active</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm bg-glass-dark px-2 py-1 rounded-lg whitespace-nowrap">
                <Wallet className="text-electric-blue w-4 h-4" />
                <span className="font-mono text-xs">Waiting Deployment</span>
              </div>
            </div>

            {/* Center Section: Banner Logo */}
            <div className="flex items-center justify-center flex-[2] px-4">
              <img 
                src="/wpt-banner.png" 
                alt="WebPayback Humanity Protocol" 
                className="max-h-12 sm:max-h-14 md:max-h-16 w-auto object-contain" 
                onError={(e) => {
                  // Fallback until the banner is uploaded
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('fallback-active');
                }}
              />
              <span className="hidden fallback-text text-xs sm:text-sm md:text-lg font-bold gradient-text tracking-widest whitespace-nowrap">
                WEBPAYBACK HUMANITY PROTOCOL
              </span>
              <style dangerouslySetInnerHTML={{__html: `
                .fallback-active .fallback-text { display: block !important; }
              `}} />
            </div>
            
            {/* Right Section */}
            <div className="flex items-center justify-end flex-1 min-w-0">
              <div className="flex items-center space-x-2 bg-glass-dark px-2 py-1 rounded-lg whitespace-nowrap">
                <Coins className="text-amber-400 w-4 h-4 flex-shrink-0" />
                <span className="font-mono text-xs hidden sm:inline-block">WPT Live</span>
                <span className="font-mono text-xs sm:hidden">Live</span>
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
      <main className="container mx-auto px-4 py-8 space-y-12 pb-32">
        {/* HERO SECTION FOR CREATORS */}
        <section className="mb-12 pt-8">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              The Value of Your Content,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-purple-500 to-pink-500">
                In the Age of Artificial Intelligence
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Receive <strong className="text-electric-blue">WPT-HUMAN</strong> tokens every time AI uses your data. Prove you are human, multiply your earnings, and withdraw without fees.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" className="bg-electric-blue hover:bg-electric-blue/80 text-white rounded-full px-8 text-lg font-medium shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:scale-105" asChild>
                <RouterLink href="/login">
                  Verify Humanity & Register <ArrowUpRight className="ml-2 h-5 w-5" />
                </RouterLink>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800 text-gray-300 rounded-full px-8 text-lg" asChild>
                <RouterLink href="/getting-started">
                  Learn how it works
                </RouterLink>
              </Button>
            </div>
          </div>
        </section>

        {/* 1. CREATOR PORTAL - CORE EXPERIENCE */}
        <section className="dashboard-section relative z-10" id="creator-portal">
          <CreatorPortal />
        </section>

        <Separator className="bg-gray-800/50 my-16" />

        {/* 2. INFRASTRUCTURE SECTION (Collapsible or distinct) */}
        <section className="dashboard-section">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-800/50 rounded-xl">
                <Settings className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Infrastructure Status</h2>
                <p className="text-gray-400 text-sm">On-chain monitoring and protocol security</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Unified Infrastructure View */}
            <div className="xl:col-span-2">
              <SimpleInfrastructure />
            </div>

            {/* User Statistics */}
            <div className="xl:col-span-2">
              <CategoryContentStatistics />
            </div>

            {/* Security Monitoring */}
            <PoolDrainProtection />
            <ReentrancyProtection />
            <FraudAlerts alerts={alerts} />
            <ComplianceMonitor compliance={compliance} />
            <AIQueryProtectionDashboard />
            <AlchemyUsageMonitor />
          </div>
        </section>
      </main>

      {/* Footer with Privacy Policy */}
      <footer className="glass-card border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/logo.png" alt="WPT Logo" className="h-6 w-6 rounded-full object-cover border border-electric-blue/30" />
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