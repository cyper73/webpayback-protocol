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
  Heart
} from "lucide-react";

export default function GettingStarted() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Coins className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Getting Started with WebPayback Protocol</h1>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-3xl mx-auto">
          Learn how to protect your content from AI scraping and earn WPT tokens when AI systems use your work
        </p>
      </div>

      {/* What is WebPayback Protocol */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            What is WebPayback Protocol Token (WPT)?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            WebPayback Protocol Token (WPT) is a revolutionary blockchain-based solution that automatically rewards content creators 
            when AI systems use their work. Built on Polygon network, WPT creates a fair economy where creators are compensated 
            for their intellectual property.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Anti-AI Scraping</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">Protect your content from unauthorized AI usage</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Coins className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Automatic Rewards</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">Earn WPT tokens when AI systems use your content</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">NFT Certificates</h4>
                <p className="text-xs text-gray-700 dark:text-gray-300">Blockchain-verified content ownership</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            How to Register on the Platform
          </CardTitle>
          <CardDescription>
            Follow these simple steps to start protecting your content and earning WPT tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-2">Domain Verification</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Verify ownership of your website or content domain to establish authenticity.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md border">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Add this meta tag to your website's &lt;head&gt; section:</p>
                  <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                    &lt;meta name="webpayback-verification" content="your-verification-code" /&gt;
                  </code>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-2">Creator Profile Setup</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Complete your creator profile with relevant information about your content and channels.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border mb-3">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Required Information:</h5>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Website URL verification</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Content category selection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Social media links (optional)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Digital wallet address for rewards</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Important:</strong> Make sure your digital wallet (MetaMask, etc.) is connected to Polygon network to receive WPT token rewards automatically.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-2">Start Earning WPT</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Once verified, your content is automatically monitored. Earn WPT tokens when AI systems access your work.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Tags and NFT Integration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-orange-500" />
            Meta Tags and NFT Content Certificates
          </CardTitle>
          <CardDescription>
            Advanced protection through blockchain-verified content ownership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Tags Section */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Enhanced Meta Tags Protection
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Add these advanced meta tags to your content pages for enhanced AI detection and protection:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Basic Protection Meta Tag:</p>
                <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                  &lt;meta name="webpayback-protection" content="enabled" /&gt;
                </code>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Content Fingerprint Meta Tag:</p>
                <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                  &lt;meta name="webpayback-fingerprint" content="sha256-a1b2c3d4e5f6..." /&gt;
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Replace with actual SHA-256 hash of your content
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Creator Attribution Meta Tag:</p>
                <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                  &lt;meta name="webpayback-creator" content="creator-12345" /&gt;
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Use your unique Creator ID from the platform
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* NFT Certificates Section */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              NFT Content Certificates
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mint blockchain certificates for your most valuable content to establish permanent ownership records.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">What are Content Certificate NFTs?</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Blockchain-verified ownership certificates</li>
                  <li>• SHA-256 content fingerprints</li>
                  <li>• Immutable timestamp records</li>
                  <li>• Legal proof of content creation</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">Benefits of NFT Certificates</h5>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Enhanced WPT reward rates</li>
                  <li>• Legal protection against content theft</li>
                  <li>• Priority in dispute resolution</li>
                  <li>• Tradeable ownership certificates</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            Ready to Get Started?
          </CardTitle>
          <CardDescription>
            Access the main platform features to start protecting your content today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/login">
              <Button className="w-full h-12 flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/80 text-white" variant="default">
                <Shield className="h-4 w-4" />
                Verify Humanity & Register
              </Button>
            </Link>
            
            <Link href="/content-certificate">
              <Button className="w-full h-12 flex items-center gap-2" variant="outline">
                <FileText className="h-4 w-4" />
                Mint NFT Certificate
              </Button>
            </Link>
            

          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              No upfront costs - earn while you protect
            </Badge>
            
            <a 
              href="https://github.com/cyper73/webpayback-protocol/tree/webpayback" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View Documentation
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Economy Manifesto */}
      <Card className="mb-8 border-2 border-dashed border-green-300 dark:border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            🚀 WebPayback Economy Manifesto - Community-Driven
          </CardTitle>
          <CardDescription>
            The first self-sustaining creator ecosystem powered by transparency and collective growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border">
            <div className="text-center mb-6">
              <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">
                The First Self-Sustaining Creator Ecosystem
              </h3>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                WebPayback Protocol is not just another crypto platform. It's the first self-sustaining economy designed 
                for creators, powered by transparency, fairness, and the collective strength of our community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-900 p-4 rounded border">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100">
                  <Users className="h-4 w-4 text-green-600" />
                  Premium Creator
                </h4>
                <ul className="text-xs text-gray-900 dark:text-gray-100 space-y-1">
                  <li>• Support the project with small amounts (from $10)</li>
                  <li>• Get higher monthly rewards and exclusive features</li>
                  <li>• Vote and help govern the platform</li>
                  <li>• Be part of a sustainable community</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded border">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100">
                  <Heart className="h-4 w-4 text-blue-600" />
                  Basic Creator
                </h4>
                <ul className="text-xs text-gray-900 dark:text-gray-100 space-y-1">
                  <li>• Join for free and earn WPT rewards</li>
                  <li>• Access all open features of the ecosystem</li>
                  <li>• Protect your original content</li>
                  <li>• Grow with the community</li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded border-l-4 border-l-green-500">
              <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">🌱 Why It's Sustainable:</h4>
              <div className="text-xs text-gray-900 dark:text-gray-100 space-y-1">
                <p><strong>Community Growth:</strong> Rewards grow as the community grows - no speculation</p>
                <p><strong>Real Usage:</strong> WPT value depends on ecosystem health, not investments</p>
                <p><strong>Transparency:</strong> Every token backed by smart contracts and growing creator pool</p>
                <p className="text-green-700 dark:text-green-300 font-bold text-sm mt-2">
                  "A community that grows together, earns together"
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Badge variant="outline" className="flex items-center gap-1 justify-center">
                <CheckCircle className="h-3 w-3 text-green-500" />
                100% Transparent & Secure
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 justify-center">
                <Shield className="h-3 w-3 text-blue-500" />
                Smart Contract Verified
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 justify-center">
                <Coins className="h-3 w-3 text-orange-500" />
                Zero Rug-Pull Risk
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button variant="outline" size="sm" disabled>
              <Trophy className="h-4 w-4 mr-2" />
              Activate at 1,000 Creators
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              📊 Current: ~50 creators | Target: 1,000 creators for launch
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}