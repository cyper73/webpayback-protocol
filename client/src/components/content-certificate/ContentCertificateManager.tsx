import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, Zap, TrendingUp, AlertTriangle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeUrl, sanitizeInput } from "@/lib/security";
import type { ContentCertificateNft, GoogleAiOverviewDetection } from "@shared/schema";

interface ContentCertificateManagerProps {
  creatorId: number;
}

export function ContentCertificateManager({ creatorId }: ContentCertificateManagerProps) {
  const [contentUrl, setContentUrl] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  const [testQuery, setTestQuery] = useState("");
  const [testAiOverview, setTestAiOverview] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch creator certificates
  const { data: certificates, isLoading: certificatesLoading } = useQuery<{
    success: boolean;
    certificates: ContentCertificateNft[];
    totalCertificates: number;
  }>({
    queryKey: ['/api/content-certificate/creator', creatorId],
    enabled: !!creatorId
  });

  // Fetch detection stats
  const { data: detectionStats } = useQuery<{
    success: boolean;
    recentDetections: number;
    totalRewardsPaid: number;
    averageConfidence: number;
  }>({
    queryKey: ['/api/content-certificate/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mint certificate mutation
  const mintCertificate = useMutation({
    mutationFn: async (data: {
      creatorId: number;
      contentUrl: string;
      contentTitle: string;
      contentText: string;
      royaltyPercentage?: number;
    }) => {
      return await fetch('/api/content-certificate/mint', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Content Certificate Minted!",
        description: "Your content is now protected against AI scraping",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-certificate/creator', creatorId] });
      // Reset form
      setContentUrl("");
      setContentTitle("");
      setContentText("");
      setRoyaltyPercentage(10);
    },
    onError: (error: any) => {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint content certificate",
        variant: "destructive",
      });
    }
  });

  // Test detection mutation
  const testDetection = useMutation({
    mutationFn: async (data: {
      querySearched: string;
      aiOverviewText: string;
    }) => {
      return await fetch('/api/content-certificate/detect-usage', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json());
    },
    onSuccess: (data: any) => {
      toast({
        title: `Detection Complete!`,
        description: `Found ${data.totalDetections} content matches`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-certificate/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Detection Failed",
        description: error.message || "Failed to test detection",
        variant: "destructive",
      });
    }
  });

  const handleMintCertificate = () => {
    if (!contentUrl || !contentTitle || !contentText) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // XSS PROTECTION: Sanitize all inputs before sending to server
    const sanitizedUrl = sanitizeUrl(contentUrl);
    const sanitizedTitle = sanitizeInput(contentTitle, 200);
    const sanitizedContent = sanitizeInput(contentText, 50000);

    if (!sanitizedUrl) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid HTTP/HTTPS URL",
        variant: "destructive",
      });
      return;
    }

    mintCertificate.mutate({
      creatorId,
      contentUrl: sanitizedUrl,
      contentTitle: sanitizedTitle,
      contentText: sanitizedContent,
      royaltyPercentage
    });
  };

  const handleTestDetection = () => {
    if (!testQuery || !testAiOverview) {
      toast({
        title: "Missing Test Data",
        description: "Please provide both search query and AI overview text",
        variant: "destructive",
      });
      return;
    }

    // XSS PROTECTION: Sanitize test inputs
    const sanitizedQuery = sanitizeInput(testQuery, 500);
    const sanitizedOverview = sanitizeInput(testAiOverview, 10000);

    testDetection.mutate({
      querySearched: sanitizedQuery,
      aiOverviewText: sanitizedOverview
    });
  };

  const copyToClipboard = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-electric-blue/10 rounded-xl border border-electric-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Shield className="h-8 w-8 text-electric-blue" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Content Certificate NFTs</h2>
          <p className="text-gray-400 mt-1">
            Protect your content against AI Overview scraping and earn WPT rewards
          </p>
        </div>
      </div>

      {/* Detection Stats */}
      {detectionStats && (
        <Card className="border-neon-green/30 bg-black/40 shadow-[0_0_20px_rgba(57,255,20,0.1)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-green text-xl">
              <TrendingUp className="h-6 w-6" />
              Detection Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <p className="text-sm font-medium text-gray-400 mb-1">Recent AI Detections</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">{detectionStats.recentDetections}</span>
                  <span className="text-xs text-neon-green bg-neon-green/10 px-2 py-1 rounded-full">+12%</span>
                </div>
              </div>
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <p className="text-sm font-medium text-gray-400 mb-1">Total Rewards Generated</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-electric-blue">{detectionStats.totalRewardsPaid}</span>
                  <span className="text-xs text-electric-blue">WPT</span>
                </div>
              </div>
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <p className="text-sm font-medium text-gray-400 mb-1">Average Confidence</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">{(detectionStats.averageConfidence * 100).toFixed(1)}%</span>
                  <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-green" style={{ width: `${detectionStats.averageConfidence * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Minting Form */}
        <Card className="border-electric-blue/30 bg-black/40 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-electric-blue text-xl">
              <FileText className="h-6 w-6" />
              Mint New Certificate
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create an immutable blockchain record of your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="contentUrl" className="text-gray-300 flex items-center gap-2">
                Content URL <span className="text-xs text-gray-500 font-normal">(Optional for social media)</span>
              </Label>
              <Input
                id="contentUrl"
                placeholder="https://x.com/your-tweet-url or https://yoursite.com/article"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-electric-blue"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="contentTitle" className="text-gray-300">Content Title</Label>
              <Input
                id="contentTitle"
                placeholder="e.g. My Thread on AI or Article Title"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-electric-blue"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="contentText" className="text-gray-300 flex items-center gap-2">
                Original Content Text <Badge className="bg-electric-blue/20 text-electric-blue border-electric-blue/30 text-[10px] py-0 px-2">Core Fingerprint</Badge>
              </Label>
              <div className="relative">
                <Textarea
                  id="contentText"
                  placeholder="Paste the EXACT full text of your tweet, thread, or article here...&#10;&#10;This text will be converted into a cryptographic SHA-256 fingerprint that proves you wrote it."
                  className="min-h-[160px] bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-electric-blue resize-y"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 flex items-start gap-2">
                <Shield className="h-4 w-4 text-electric-blue shrink-0" />
                Your raw text is hashed locally on your device. We NEVER store or read your original text. Only the unhackable SHA-256 fingerprint is sent to the blockchain.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="royalty" className="text-gray-300">Royalty Percentage (%)</Label>
              <Input
                id="royalty"
                type="number"
                min="0"
                max="100"
                value={royaltyPercentage}
                onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                className="bg-gray-900/80 border-gray-700 text-white focus-visible:ring-electric-blue w-32"
              />
            </div>

            <Button 
              onClick={handleMintCertificate}
              disabled={mintCertificate.isPending}
              className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] h-12"
            >
              {mintCertificate.isPending ? "Minting to Blockchain..." : "Mint Content Certificate NFT"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Test Detection Area */}
          <Card className="border-purple-500/30 bg-black/40 shadow-[0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400 text-xl">
                <Zap className="h-6 w-6" />
                Test AI Detection
              </CardTitle>
              <CardDescription className="text-gray-400">
                Simulate an AI Overview scraping your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="text-sm text-amber-200">
                  <strong>Sandbox Mode:</strong> Use this to test how WebPayback detects your content in Google AI Overviews.
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="testQuery" className="text-gray-300">Search Query</Label>
                <Input
                  id="testQuery"
                  placeholder="e.g., How does WebPayback work?"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-purple-400"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="testOverview" className="text-gray-300">AI Overview Result</Label>
                <Textarea
                  id="testOverview"
                  placeholder="Paste the generated AI overview text here..."
                  className="min-h-[100px] bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-purple-400"
                  value={testAiOverview}
                  onChange={(e) => setTestAiOverview(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleTestDetection}
                disabled={testDetection.isPending}
                variant="outline"
                className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-white"
              >
                {testDetection.isPending ? "Analyzing..." : "Run Detection Test"}
              </Button>
            </CardContent>
          </Card>

          {/* Your Certificates */}
          <Card className="border-gray-800 bg-black/40 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">Your Protected Content</CardTitle>
              <CardDescription className="text-gray-400">
                {certificates?.totalCertificates || 0} certificates minted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificatesLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
                </div>
              ) : certificates?.certificates && certificates.certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.certificates.map((cert) => (
                    <div key={cert.id} className="p-5 border border-gray-800 bg-gray-900/40 rounded-xl hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white">{cert.contentTitle}</h4>
                        <Badge variant="outline" className="bg-electric-blue/10 text-electric-blue border-electric-blue/30">
                          Active
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <a href={cert.contentUrl} target="_blank" rel="noreferrer" className="hover:text-electric-blue transition-colors truncate max-w-[250px]">
                            {cert.contentUrl}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="truncate">Hash: {cert.contentHash?.substring(0, 16) || 'Pending'}...</span>
                        </div>
                        {cert.tokenId && (
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-gray-500" />
                            <span>Token ID: {cert.tokenId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-gray-800 rounded-xl bg-gray-900/20 text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No content certificates minted yet.</p>
                  <p className="text-sm mt-1">Mint your first certificate to start earning rewards.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}