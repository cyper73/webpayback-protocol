import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Coins, 
  Shield, 
  FileText, 
  Globe, 
  Bookmark, 
  Trophy,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Heart,
  ArrowLeft
} from "lucide-react";

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-deep-space text-white pb-20">
      {/* Header matching dashboard */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0 justify-start">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-shrink-0">
                <img src="/logo.png" alt="WPT Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-electric-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              </div>
            </div>

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
            
            <div className="flex items-center justify-end flex-1 min-w-0 gap-3">
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-electric-blue/10 rounded-xl border border-electric-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Coins className="h-8 w-8 text-electric-blue" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">Getting Started</h1>
          </div>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Learn how to protect your content from AI scraping and earn <strong className="text-electric-blue">WPT-HUMAN</strong> tokens when AI systems use your work.
          </p>
        </div>

        {/* What is WebPayback Protocol */}
        <Card className="border-gray-800 bg-black/40 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-neon-green" />
              What is WebPayback Protocol Token (WPT)?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 text-lg leading-relaxed">
              WebPayback Protocol Token (WPT) is a revolutionary blockchain-based solution that automatically rewards content creators 
              when AI systems use their work. Built on <strong className="text-electric-blue">Humanity Protocol</strong>, WPT creates a fair economy where creators are compensated 
              for their intellectual property.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-start gap-3 p-5 bg-electric-blue/10 border border-electric-blue/20 rounded-xl hover:bg-electric-blue/20 transition-colors">
                <Shield className="h-6 w-6 text-electric-blue mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Anti-AI Scraping</h4>
                  <p className="text-sm text-gray-400">Protect your content from unauthorized AI usage</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-5 bg-neon-green/10 border border-neon-green/20 rounded-xl hover:bg-neon-green/20 transition-colors">
                <Coins className="h-6 w-6 text-neon-green mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Automatic Rewards</h4>
                  <p className="text-sm text-gray-400">Earn WPT tokens when AI systems use your content</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors">
                <FileText className="h-6 w-6 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">NFT Certificates</h4>
                  <p className="text-sm text-gray-400">Blockchain-verified content ownership</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Process */}
        <Card className="border-gray-800 bg-black/40 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Globe className="h-6 w-6 text-electric-blue" />
              How to Register on the Platform
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Follow these simple steps to start protecting your content and earning WPT tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-electric-blue/20 border border-electric-blue text-electric-blue rounded-full flex items-center justify-center text-lg font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-white mb-2">Domain Verification</h4>
                  <p className="text-gray-400 mb-4">
                    Verify ownership of your website or content domain to establish authenticity.
                  </p>
                  <div className="bg-black/60 p-4 rounded-xl border border-gray-800">
                    <p className="text-sm font-medium text-gray-300 mb-3">Add this meta tag to your website's &lt;head&gt; section:</p>
                    <code className="text-sm bg-gray-900 text-neon-green p-4 rounded-lg border border-gray-800 block font-mono">
                      &lt;meta name="webpayback-verification" content="your-verification-code" /&gt;
                    </code>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-neon-green/20 border border-neon-green text-neon-green rounded-full flex items-center justify-center text-lg font-bold shadow-[0_0_10px_rgba(57,255,20,0.3)]">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-white mb-2">Creator Profile Setup</h4>
                  <p className="text-gray-400 mb-4">
                    Complete your creator profile with relevant information about your content and channels.
                  </p>
                  <div className="bg-black/60 p-5 rounded-xl border border-gray-800 mb-4">
                    <h5 className="font-semibold text-gray-300 mb-3">Required Information:</h5>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-sm bg-gray-900/50 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-neon-green" />
                        <span className="text-gray-300">Website URL verification</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm bg-gray-900/50 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-neon-green" />
                        <span className="text-gray-300">Content category selection</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm bg-gray-900/50 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-neon-green" />
                        <span className="text-gray-300">Social media links (optional)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm bg-gray-900/50 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-neon-green" />
                        <span className="text-gray-300">Digital wallet address for rewards</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-200">
                      <strong>Important:</strong> With the new Humanity Protocol integration, simply use the "Login" button to automatically generate your secure Embedded Wallet!
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500 text-purple-400 rounded-full flex items-center justify-center text-lg font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-xl text-white mb-2">Start Earning WPT</h4>
                  <p className="text-gray-400 text-lg">
                    Once verified, your content is automatically monitored. Earn WPT tokens when AI systems access your work.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta Tags and NFT Integration */}
        <Card className="border-gray-800 bg-black/40 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bookmark className="h-6 w-6 text-amber-400" />
              Meta Tags and NFT Content Certificates
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Advanced protection through blockchain-verified content ownership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Meta Tags Section */}
            <div>
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-electric-blue" />
                Enhanced Meta Tags Protection
              </h4>
              <p className="text-gray-400 mb-4">
                Add these advanced meta tags to your content pages for enhanced AI detection and protection:
              </p>
              
              <div className="bg-black/60 p-5 rounded-xl border border-gray-800 space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Basic Protection Meta Tag:</p>
                  <code className="text-sm bg-gray-900 text-neon-green p-3 rounded-lg border border-gray-800 block font-mono">
                    &lt;meta name="webpayback-protection" content="enabled" /&gt;
                  </code>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Content Fingerprint Meta Tag:</p>
                  <code className="text-sm bg-gray-900 text-neon-green p-3 rounded-lg border border-gray-800 block font-mono">
                    &lt;meta name="webpayback-fingerprint" content="sha256-a1b2c3d4e5f6..." /&gt;
                  </code>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> Replace with actual SHA-256 hash of your content
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Creator Attribution Meta Tag:</p>
                  <code className="text-sm bg-gray-900 text-neon-green p-3 rounded-lg border border-gray-800 block font-mono">
                    &lt;meta name="webpayback-creator" content="creator-12345" /&gt;
                  </code>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> Use your unique Creator ID from the platform
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* NFT Certificates Section */}
            <div>
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                NFT Content Certificates
              </h4>
              <p className="text-gray-400 mb-5">
                Mint blockchain certificates for your most valuable content to establish permanent ownership records.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                  <h5 className="font-bold text-white mb-3">What are Content Certificate NFTs?</h5>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-electric-blue"></div> Blockchain-verified ownership certificates</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-electric-blue"></div> SHA-256 content fingerprints</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-electric-blue"></div> Immutable timestamp records</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-electric-blue"></div> Legal proof of content creation</li>
                  </ul>
                </div>
                
                <div className="bg-black/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                  <h5 className="font-bold text-white mb-3">Benefits of NFT Certificates</h5>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-green"></div> Enhanced WPT reward rates</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-green"></div> Legal protection against content theft</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-green"></div> Priority in dispute resolution</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-green"></div> Tradeable ownership certificates</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Economy Manifesto */}
        <Card className="border-2 border-neon-green/30 bg-black/40 shadow-[0_0_30px_rgba(57,255,20,0.05)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-neon-green" />
              🚀 WebPayback Economy Manifesto - Community-Driven
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              The first self-sustaining creator ecosystem powered by transparency and collective growth
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-black/60 p-6 rounded-xl border border-gray-800">
              <div className="text-center mb-8">
                <h3 className="font-bold text-2xl mb-3 text-white">
                  The First Self-Sustaining Creator Ecosystem
                </h3>
                <p className="text-base text-gray-400 leading-relaxed max-w-3xl mx-auto">
                  WebPayback Protocol is not just another crypto platform. It's the first self-sustaining economy designed 
                  for creators, powered by transparency, fairness, and the collective strength of our community.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 hover:border-neon-green/50 transition-all duration-300 group">
                  <h4 className="font-bold text-lg flex items-center gap-2 mb-4 text-white group-hover:text-neon-green transition-colors">
                    <Users className="h-5 w-5 text-neon-green" />
                    Premium Creator
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-3">
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Support the project with small amounts (from $10)</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Get higher monthly rewards and exclusive features</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Vote and help govern the platform</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Be part of a sustainable community</li>
                  </ul>
                </div>

                <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 hover:border-electric-blue/50 transition-all duration-300 group">
                  <h4 className="font-bold text-lg flex items-center gap-2 mb-4 text-white group-hover:text-electric-blue transition-colors">
                    <Heart className="h-5 w-5 text-electric-blue" />
                    Basic Creator
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-3">
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Join for free and earn WPT rewards</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Access all open features of the ecosystem</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Protect your original content</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" /> Grow with the community</li>
                  </ul>
                </div>
              </div>

              <div className="bg-neon-green/5 p-5 rounded-xl border border-neon-green/20">
                <h4 className="font-bold text-base mb-3 text-neon-green flex items-center gap-2">
                  <span className="text-xl">🌱</span> Why It's Sustainable:
                </h4>
                <div className="text-sm text-gray-300 space-y-2 pl-7">
                  <p><strong className="text-white">Community Growth:</strong> Rewards grow as the community grows - no speculation</p>
                  <p><strong className="text-white">Real Usage:</strong> WPT value depends on ecosystem health, not investments</p>
                  <p><strong className="text-white">Transparency:</strong> Every token backed by smart contracts and growing creator pool</p>
                  <p className="text-neon-green font-bold text-base mt-4 block">
                    "A community that grows together, earns together"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-8 justify-center">
                <Badge variant="outline" className="flex items-center gap-1.5 justify-center py-1.5 px-3 bg-gray-900 border-gray-700 text-gray-300">
                  <CheckCircle className="h-3.5 w-3.5 text-neon-green" />
                  100% Transparent & Secure
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 justify-center py-1.5 px-3 bg-gray-900 border-gray-700 text-gray-300">
                  <Shield className="h-3.5 w-3.5 text-electric-blue" />
                  Smart Contract Verified
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 justify-center py-1.5 px-3 bg-gray-900 border-gray-700 text-gray-300">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  Zero Rug-Pull Risk
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Footer */}
        <Card className="border-electric-blue/30 bg-electric-blue/5 shadow-[0_0_20px_rgba(0,240,255,0.1)] backdrop-blur-sm mt-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <ArrowRight className="h-6 w-6 text-electric-blue" />
                  Ready to Get Started?
                </h3>
                <p className="text-gray-400">Access the main platform features to start protecting your content today</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link href="/">
                  <Button className="w-full sm:w-auto h-12 px-8 flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/80 text-white font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all hover:scale-105">
                    <Shield className="h-5 w-5" />
                    Enter Dashboard
                  </Button>
                </Link>
                <Link href="/content-certificate">
                  <Button className="w-full sm:w-auto h-12 px-8 flex items-center gap-2 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800" variant="outline">
                    <FileText className="h-5 w-5" />
                    Mint NFT
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}