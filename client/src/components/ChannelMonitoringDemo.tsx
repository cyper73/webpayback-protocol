import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Play, Users, Shield, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChannelResult {
  isChannelContent: boolean;
  creatorId?: number;
  channelMapping?: {
    id: number;
    creatorId: number;
    originalUrl: string;
    channelBaseUrl: string;
    urlPattern: string;
    isActive: boolean;
    createdAt: string;
  };
}

export default function ChannelMonitoringDemo() {
  const [testUrl, setTestUrl] = useState("");
  const [testResults, setTestResults] = useState<ChannelResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);

  const testChannelDetection = async () => {
    if (!testUrl) return;
    
    setIsLoading(true);
    try {
      // Test channel detection
      const detectionResult = await apiRequest('/api/channel/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });
      
      setTestResults(detectionResult);
      
      // Extract channel info
      const infoResult = await apiRequest('/api/channel/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });
      
      setExtractedInfo(infoResult);
    } catch (error) {
      console.error('Error testing channel detection:', error);
      setTestResults({ isChannelContent: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Channel-Level Monitoring Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Interface */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-url">Test URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="test-url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="flex-1"
                />
                <Button onClick={testChannelDetection} disabled={isLoading || !testUrl}>
                  <Play className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>

            {/* Quick Test URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestUrl("https://www.youtube.com/watch?v=abcd1234test")}
              >
                Registered Channel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestUrl("https://www.youtube.com/watch?v=abcd1234newvideo")}
              >
                Same Channel (New Video)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestUrl("https://www.youtube.com/watch?v=differentchannel")}
              >
                Different Channel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestUrl("https://example.com/page")}
              >
                Non-YouTube URL
              </Button>
            </div>
          </div>

          {/* Results */}
          {testResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {testResults.isChannelContent ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {testResults.isChannelContent ? "Channel Content Detected" : "No Channel Match"}
                </span>
                <Badge variant={testResults.isChannelContent ? "default" : "secondary"}>
                  {testResults.isChannelContent ? "MONITORED" : "UNMONITORED"}
                </Badge>
              </div>

              {testResults.isChannelContent && testResults.channelMapping && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Channel Mapping Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Creator ID:</strong> {testResults.creatorId}</div>
                    <div><strong>Original URL:</strong> {testResults.channelMapping.originalUrl}</div>
                    <div><strong>Channel Base:</strong> {testResults.channelMapping.channelBaseUrl}</div>
                    <div><strong>URL Pattern:</strong> {testResults.channelMapping.urlPattern}</div>
                    <div><strong>Active:</strong> {testResults.channelMapping.isActive ? "✅ Yes" : "❌ No"}</div>
                    <div><strong>Created:</strong> {new Date(testResults.channelMapping.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {extractedInfo && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Extracted Channel Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Platform:</strong> {extractedInfo.platformType}</div>
                    <div><strong>Channel ID:</strong> {extractedInfo.channelId}</div>
                    <div><strong>Channel Name:</strong> {extractedInfo.channelName}</div>
                    <div><strong>Base URL:</strong> {extractedInfo.baseUrl}</div>
                    <div><strong>URL Pattern:</strong> {extractedInfo.urlPattern}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 rounded-lg">
            <h4 className="font-medium mb-2">Channel-Level Monitoring Benefits:</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Register once with a single video URL</li>
              <li>• Monitor entire channel for AI access</li>
              <li>• Automatic WPT rewards for all channel content</li>
              <li>• No need to register individual videos</li>
              <li>• Comprehensive creator protection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}