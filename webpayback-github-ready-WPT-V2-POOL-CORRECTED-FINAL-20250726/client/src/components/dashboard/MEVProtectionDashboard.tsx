import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Unlock, Clock, TrendingUp } from "lucide-react";

interface MEVProtectionStats {
  activeCommitments: number;
  queuedReveals: number;
  totalProtectedRewards: number;
  avgProcessingDelay: number;
}

export default function MEVProtectionDashboard() {
  const [testingMode, setTestingMode] = useState(false);
  
  const { data: mevStats } = useQuery<MEVProtectionStats>({
    queryKey: ["/api/mev/stats"],
    refetchInterval: 10000 // Update every 10 seconds
  });

  const { data: recentProtectedRewards } = useQuery({
    queryKey: ["/api/mev/recent-rewards"],
    refetchInterval: 15000
  });

  const handleTestMEVProtection = async () => {
    setTestingMode(true);
    try {
      const response = await fetch("/api/mev/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: 1,
          amount: "1.0",
          testMode: true
        })
      });
      
      if (response.ok) {
        console.log("MEV protection test initiated");
      }
    } catch (error) {
      console.error("MEV test failed:", error);
    } finally {
      setTimeout(() => setTestingMode(false), 15000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold">MEV Protection Dashboard</h2>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
          Anti-Front-Running Active
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Active Commitments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-yellow-500" />
                  <span className="text-2xl font-bold">
                    {mevStats?.activeCommitments || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Queued Reveals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">
                    {mevStats?.queuedReveals || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Protected Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {mevStats?.totalProtectedRewards || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Avg Delay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-2xl font-bold">
                    {mevStats?.avgProcessingDelay ? `${Math.round(mevStats.avgProcessingDelay / 1000)}s` : "0s"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>MEV Protection Features</CardTitle>
              <CardDescription>
                Advanced protection against front-running and MEV attacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Lock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Commit-Reveal Scheme</h4>
                    <p className="text-sm text-muted-foreground">
                      Hides beneficiary addresses during commit phase
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Random Jitter</h4>
                    <p className="text-sm text-muted-foreground">
                      Unpredictable timing prevents timing attacks
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Batch Shuffling</h4>
                    <p className="text-sm text-muted-foreground">
                      Randomizes processing order to prevent exploitation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Time-Locked Reveals</h4>
                    <p className="text-sm text-muted-foreground">
                      Enforces minimum delays before reward distribution
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Protected Rewards</CardTitle>
              <CardDescription>
                Latest rewards processed through MEV protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentProtectedRewards && recentProtectedRewards.length > 0 ? (
                <div className="space-y-3">
                  {recentProtectedRewards.slice(0, 5).map((reward: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">Creator #{reward.creatorId}</p>
                          <p className="text-sm text-muted-foreground">
                            {reward.amount} WPT • {reward.aiModel}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Protected
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No protected rewards yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MEV Protection Testing</CardTitle>
              <CardDescription>
                Test the commit-reveal mechanism and anti-front-running features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-semibold text-yellow-700 mb-2">Test Process</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-600">
                  <li>Initiates a test reward commitment</li>
                  <li>Simulates front-running attempts</li>
                  <li>Verifies protection mechanisms</li>
                  <li>Processes reward after reveal phase</li>
                </ol>
              </div>

              <Button 
                onClick={handleTestMEVProtection}
                disabled={testingMode}
                className="w-full"
              >
                {testingMode ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    Testing MEV Protection...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Test MEV Protection
                  </div>
                )}
              </Button>

              {testingMode && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                    <span className="text-sm text-blue-700">
                      MEV protection test in progress... Watch the console for real-time updates.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}