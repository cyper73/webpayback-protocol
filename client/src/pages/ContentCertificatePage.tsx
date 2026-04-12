import { useQuery } from "@tanstack/react-query";
import { WalletBasedAccess } from "@/components/content-certificate/WalletBasedAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, Wallet, ArrowLeft, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function ContentCertificatePage() {
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

      <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8 pt-12">
        
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">Content Certificate NFTs</h1>
          </div>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Revolutionary protection against <strong className="text-white">AI Overview content theft</strong> through blockchain-verified ownership certificates
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1">Combat 15-40% Traffic Loss</Badge>
            <Badge className="bg-neon-green/20 text-neon-green border border-neon-green/30 px-3 py-1">ERC-2981 Royalty Standard</Badge>
            <Badge className="bg-electric-blue/20 text-electric-blue border border-electric-blue/30 px-3 py-1">Legal Blockchain Proof</Badge>
          </div>
        </div>

        {/* Important Information */}
        <Card className="border-electric-blue/30 bg-black/40 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-electric-blue">
              <AlertCircle className="h-6 w-6" />
              How Content Certificates Work
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-white block mb-1">Mint NFT Certificates</strong>
                    <span className="text-sm text-gray-400">Create blockchain proof of content ownership</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-white block mb-1">SHA-256 Fingerprinting</strong>
                    <span className="text-sm text-gray-400">Generate unique cryptographic fingerprints</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-white block mb-1">AI Detection</strong>
                    <span className="text-sm text-gray-400">Monitor AI Overview for unauthorized usage</span>
                  </div>
                </li>
              </ul>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-neon-green/10 p-3 rounded-lg border border-neon-green/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-neon-green block mb-1">Automatic Rewards</strong>
                    <span className="text-sm text-gray-300">Earn WPT tokens when content theft is detected</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-purple-400 block mb-1">Legal Protection</strong>
                    <span className="text-sm text-gray-300">Use blockchain certificates for legal action</span>
                  </div>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Social Media & No-Code Use Case */}
        <Card className="border-neon-green/30 bg-black/40 shadow-[0_0_20px_rgba(57,255,20,0.1)] backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield className="h-32 w-32 text-neon-green" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-neon-green">
              <Shield className="h-6 w-6" />
              The Solution for Social Media & Platforms
            </CardTitle>
            <CardDescription className="text-gray-300 text-base mt-2">
              Perfect for X (Twitter), Medium, Substack, Reddit, and anywhere you can't edit the code.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-300 relative z-10">
            <p className="mb-4 leading-relaxed">
              If you post content on platforms where you don't own the infrastructure, you can't insert meta-tags or `robots.txt` to block AI scraping. 
              <strong> Content Certificate NFTs solve this completely.</strong>
            </p>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="flex-1 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <div className="text-neon-green font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-neon-green/20 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  Write
                </div>
                <p className="text-sm text-gray-400">Write your viral post, thread, or article.</p>
              </div>
              <div className="flex-1 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <div className="text-neon-green font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-neon-green/20 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  Mint
                </div>
                <p className="text-sm text-gray-400">Paste the exact text here and mint it as an NFT <strong>before</strong> publishing.</p>
              </div>
              <div className="flex-1 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <div className="text-neon-green font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-neon-green/20 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                  Publish & Earn
                </div>
                <p className="text-sm text-gray-400">Post it online. The blockchain proves you own it. When AI copies it, you earn WPT.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet-Based Access System */}
        <WalletBasedAccess />
        
      </div>
    </div>
  );
}