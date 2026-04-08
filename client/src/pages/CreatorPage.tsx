import CreatorPortal from "@/components/creators/CreatorPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Coins, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";
import { Link as RouterLink } from "wouter";
import { Button } from "@/components/ui/button";

export default function CreatorPage() {
  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* Clean Navigation Header (Matched with Dashboard) */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0 justify-start">
              <div className="flex-shrink-0">
                <img src="/logo.png" alt="WPT Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-electric-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              </div>
              <div className="hidden lg:flex items-center space-x-1 bg-glass-dark px-2 py-1 rounded-full whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full bg-neon-green pulse-animation`}></div>
                <span className="text-xs text-gray-300">System Active</span>
              </div>
            </div>

            {/* Center Section: Typography Logo */}
            <div className="flex items-center justify-center flex-[2] px-2 sm:px-4 whitespace-nowrap overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 select-none">
                <span className="text-xl sm:text-2xl font-normal tracking-[0.1em] text-electric-blue font-bladerunner drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] mt-1">
                  webpayback
                </span>
                <span className="hidden sm:inline-block text-gray-600 font-light text-xl">×</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                  <span className="text-xs sm:text-lg font-light tracking-[0.3em] text-gray-300">
                    HUMANITY <span className="font-bold text-white">PROTOCOL</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center justify-end flex-1 min-w-0 gap-3">
              <div className="hidden sm:flex items-center space-x-2 bg-glass-dark px-2 py-1 rounded-lg whitespace-nowrap">
                <Coins className="text-amber-400 w-4 h-4 flex-shrink-0" />
                <span className="font-mono text-xs">WPT Live</span>
              </div>
              <Button size="sm" variant="outline" className="bg-electric-blue/10 border-electric-blue/30 text-electric-blue hover:bg-electric-blue hover:text-white" asChild>
                <RouterLink href="/">
                  Back to Dashboard <ArrowUpRight className="ml-1 w-3 h-3" />
                </RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center space-x-3">
          <div className="p-2 bg-electric-blue/10 rounded-lg border border-electric-blue/20 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Users className="h-6 w-6 text-electric-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-orbitron tracking-wide drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
              Creator Portal
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Register your content and start earning rewards when AI systems use your work
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Creator Portal - Main Content */}
          <div className="lg:col-span-2">
            <CreatorPortal />
          </div>

          {/* Sidebar with Info Cards */}
          <div className="space-y-6">
            
            {/* Benefits Card */}
            <Card className="glass-card border-gray-800 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-200">
                  <TrendingUp className="h-5 w-5 text-neon-green" />
                  <span>Creator Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <Coins className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-200">Earn WPT Rewards</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Get compensated when AI systems use your content
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <Shield className="h-5 w-5 text-electric-blue mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-200">Content Protection</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Advanced AI detection and NFT certificates
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <Users className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-200">Creator Network</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Join a community of protected creators
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-green-500/30 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-2 text-green-400">
                  <Shield className="h-5 w-5" />
                  <span>Biometric Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-green-300/80 text-sm leading-relaxed">
                  Your account is protected by Humanity Protocol. No passwords or 2FA required. 
                  <span className="block mt-2 font-medium text-green-400">Your identity is your key.</span>
                </p>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="glass-card border-gray-800 bg-black/40">
              <CardHeader>
                <CardTitle className="text-gray-200">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400 text-sm">
                  New to WebPayback Protocol? Check out our resources:
                </p>
                <div className="space-y-3 pt-2">
                  <a 
                    href="/getting-started" 
                    className="flex items-center text-electric-blue hover:text-white transition-colors text-sm group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">Getting Started Guide</span>
                    <ArrowUpRight className="ml-1 w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                  <a 
                    href="/terms" 
                    className="flex items-center text-gray-500 hover:text-gray-300 transition-colors text-sm"
                  >
                    Terms of Service
                  </a>
                  <a 
                    href="/privacy" 
                    className="flex items-center text-gray-500 hover:text-gray-300 transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}