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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold">Content Certificate NFTs</h2>
          <p className="text-muted-foreground">
            Protect your content against Google AI Overview scraping and earn WPT rewards
          </p>
        </div>
      </div>

      {/* Detection Stats */}
      {detectionStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detection Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {detectionStats.recentDetections}
                </div>
                <div className="text-sm text-muted-foreground">Recent Detections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {detectionStats.totalRewardsPaid.toFixed(4)} WPT
                </div>
                <div className="text-sm text-muted-foreground">Total Rewards Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {detectionStats.averageConfidence.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Average Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mint New Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mint Content Certificate
            </CardTitle>
            <CardDescription>
              Create an NFT certificate to protect your content and earn rewards when AI systems use it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contentUrl">Content URL *</Label>
              <Input
                id="contentUrl"
                placeholder="https://example.com/my-article"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="contentTitle">Content Title *</Label>
              <Input
                id="contentTitle"
                placeholder="My Amazing Article"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="contentText">Content Text * (min 50 characters)</Label>
              <Textarea
                id="contentText"
                placeholder="Paste your full article content here for fingerprinting..."
                rows={4}
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
              />
              <div className="text-sm text-muted-foreground mt-1">
                {contentText.length}/50 characters minimum
              </div>
            </div>

            <div>
              <Label htmlFor="royalty">Royalty Percentage</Label>
              <Input
                id="royalty"
                type="number"
                min="0"
                max="50"
                value={royaltyPercentage}
                onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
              />
              <div className="text-sm text-muted-foreground mt-1">
                Percentage of WPT rewards you'll earn from detections
              </div>
            </div>

            <Button 
              onClick={handleMintCertificate} 
              disabled={mintCertificate.isPending}
              className="w-full"
            >
              {mintCertificate.isPending ? "Minting..." : "Mint Certificate NFT"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Test AI Overview Detection
            </CardTitle>
            <CardDescription>
              Test how our system detects content usage in Google AI Overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testQuery">Search Query</Label>
              <Input
                id="testQuery"
                placeholder="what is blockchain technology"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="testAiOverview">AI Overview Text</Label>
              <Textarea
                id="testAiOverview"
                placeholder="Paste the Google AI Overview text here..."
                rows={4}
                value={testAiOverview}
                onChange={(e) => setTestAiOverview(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleTestDetection} 
              disabled={testDetection.isPending}
              className="w-full"
              variant="outline"
            >
              {testDetection.isPending ? "Testing..." : "Test Detection"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Your Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Your Content Certificates</CardTitle>
          <CardDescription>
            All your minted content certificates and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certificatesLoading ? (
            <div className="text-center py-8">Loading certificates...</div>
          ) : certificates?.certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No certificates minted yet. Create your first one above!
            </div>
          ) : (
            <div className="space-y-4">
              {certificates?.certificates.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{cert.contentTitle}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <a 
                          href={cert.contentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {cert.contentUrl}
                        </a>
                      </div>
                    </div>
                    <Badge variant={cert.isActive ? "default" : "secondary"}>
                      {cert.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Detections</div>
                      <div className="font-semibold">{cert.totalDetectedUses}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">WPT Earned</div>
                      <div className="font-semibold">{parseFloat(cert.totalWptEarned).toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Royalty</div>
                      <div className="font-semibold">{parseFloat(cert.royaltyPercentage)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Network</div>
                      <div className="font-semibold capitalize">{cert.blockchainNetwork}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">NFT Token ID:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {cert.nftTokenId}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(cert.nftTokenId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contract:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {cert.nftContractAddress.slice(0, 8)}...{cert.nftContractAddress.slice(-6)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(cert.nftContractAddress)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                How Anti-AI Scraping Works
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-200 mt-2 space-y-2">
                <p>
                  <strong>1. Content Fingerprinting:</strong> We create a unique SHA-256 hash of your content
                </p>
                <p>
                  <strong>2. Google AI Overview Monitoring:</strong> Our system scans AI overviews for matching content
                </p>
                <p>
                  <strong>3. Automatic WPT Rewards:</strong> When we detect unauthorized use, you automatically earn WPT tokens
                </p>
                <p>
                  <strong>4. Legal Protection:</strong> Your NFT certificate serves as blockchain proof of ownership
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}