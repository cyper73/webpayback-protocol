import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Shield, DollarSign, TrendingUp, Clock, Users, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface WalletStats {
  walletAddress: string;
  velocity: {
    velocityScore: string;
    isHighRiskDumper: boolean;
    cashoutFrequency: number;
    totalCashoutAmount: string;
    totalRewardsAccumulated: string;
    lastCashoutAt: string | null;
  } | null;
  recentEvents: Array<{
    id: number;
    amount: string;
    slippageFeeApplied: string;
    feeAmountWpt: string;
    penaltyReason: string;
    createdAt: string;
  }>;
  totalFeePaid: number;
  summary: {
    riskLevel: string;
    totalEvents: number;
    avgSlippageFee: string;
    lastCashout: string | null;
  };
}

interface SystemStats {
  totalFeesCollected: number;
  highRiskWallets: number;
  totalEvents: number;
  averagePenalty: number;
  performance: {
    avgFeesPerEvent: string;
    highRiskPercentage: string;
    systemHealth: string;
  };
}

interface AntiDumpConfig {
  message: string;
  systemStats: SystemStats;
  configDescription: {
    baseSlippageFee: string;
    velocityThresholds: {
      low: string;
      high: string;
    };
    penalties: {
      light: string;
      medium: string;
      heavy: string;
    };
    frequencyThreshold: string;
    minimumRewardAge: string;
  };
}

export default function AntiDumpSlippageDashboard() {
  const [walletAddress, setWalletAddress] = useState("");
  const [testCashoutAmount, setTestCashoutAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system configuration and stats
  const { data: config, isLoading: configLoading } = useQuery<{ data: AntiDumpConfig }>({
    queryKey: ["/api/anti-dump/config"],
    refetchInterval: 30000
  });

  // Calculate fee for test cashout
  const calculateFeeMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; amount: string }) => {
      return apiRequest("/api/anti-dump/calculate-fee", "POST", {
        walletAddress: data.walletAddress,
        amount: data.amount,
        transactionHash: "0x" + "0".repeat(64), // Dummy hash for testing
        blockNumber: Math.floor(Date.now() / 1000)
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Fetch wallet statistics
  const { data: walletStats, refetch: refetchWalletStats } = useQuery<{ data: WalletStats }>({
    queryKey: ["/api/anti-dump/wallet", walletAddress, "stats"],
    enabled: !!walletAddress && !!walletAddress.match(/^0x[a-fA-F0-9]{40}$/),
    refetchInterval: 15000
  });

  const handleCalculateFee = () => {
    if (!walletAddress || !testCashoutAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter both wallet address and cashout amount",
        variant: "destructive"
      });
      return;
    }

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive"
      });
      return;
    }

    calculateFeeMutation.mutate({
      walletAddress,
      amount: testCashoutAmount
    });
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "high risk": return "destructive";
      case "medium risk": return "secondary";
      case "low risk": return "default";
      default: return "outline";
    }
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case "healthy": return "default";
      case "moderate": return "secondary";
      case "high penalty usage": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Anti-Dump Slippage Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced protection against rapid cashout dumping with dynamic fee penalties
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="calculator">Fee Calculator</TabsTrigger>
            <TabsTrigger value="wallet">Wallet Analysis</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {configLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-900">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fees Collected</p>
                        <p className="text-2xl font-bold">{config?.data?.systemStats?.totalFeesCollected?.toFixed(2) || "0"} WPT</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk Wallets</p>
                        <p className="text-2xl font-bold">{config?.data?.systemStats?.highRiskWallets || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Activity className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                        <p className="text-2xl font-bold">{config?.data?.systemStats?.totalEvents || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Penalty</p>
                        <p className="text-2xl font-bold">{config?.data?.systemStats?.averagePenalty?.toFixed(2) || "0"}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* System Health */}
            <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">System Health</p>
                    <Badge variant={getHealthBadgeColor(config?.data?.systemStats?.performance?.systemHealth || "")}>
                      {config?.data?.systemStats?.performance?.systemHealth || "Unknown"}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Fees/Event</p>
                    <p className="font-semibold">{config?.data?.systemStats?.performance?.avgFeesPerEvent || "0"} WPT</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High Risk %</p>
                    <p className="font-semibold">{config?.data?.systemStats?.performance?.highRiskPercentage || "0"}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
              <CardHeader>
                <CardTitle>Slippage Fee Calculator</CardTitle>
                <CardDescription>
                  Calculate anti-dump fees for a specific wallet and cashout amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wallet">Wallet Address</Label>
                    <Input
                      id="wallet"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Cashout Amount (WPT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1000"
                      value={testCashoutAmount}
                      onChange={(e) => setTestCashoutAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleCalculateFee}
                  disabled={calculateFeeMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {calculateFeeMutation.isPending ? "Calculating..." : "Calculate Fees"}
                </Button>

                {calculateFeeMutation.data && (
                  <Card className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="text-blue-900 dark:text-blue-100">Fee Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-800 dark:text-blue-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Base Fee</p>
                          <p className="text-lg font-bold">{(calculateFeeMutation.data as any)?.data?.baseSlippageFee}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Anti-Dump Penalty</p>
                          <p className="text-lg font-bold">{(calculateFeeMutation.data as any)?.data?.antiDumpPenalty}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Fee</p>
                          <p className="text-lg font-bold">{(calculateFeeMutation.data as any)?.data?.totalSlippageFee}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Fee Amount</p>
                          <p className="text-lg font-bold">{(calculateFeeMutation.data as any)?.data?.feeAmountWpt?.toFixed(2)} WPT</p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm font-medium mb-1">Penalty Reason</p>
                        <p className="text-sm">{(calculateFeeMutation.data as any)?.data?.penaltyReason}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Recommendation</p>
                        <p className="text-sm">{(calculateFeeMutation.data as any)?.data?.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Analysis Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
              <CardHeader>
                <CardTitle>Wallet Risk Analysis</CardTitle>
                <CardDescription>
                  Analyze the cashout behavior and risk profile of a specific wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter wallet address (0x...)"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => refetchWalletStats()}>Analyze</Button>
                </div>

                {walletStats && (
                  <div className="mt-6 space-y-4">
                    {/* Wallet Summary */}
                    <Card className="bg-gray-50 dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-sm">Wallet Risk Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                            <Badge variant={getRiskBadgeColor(walletStats?.data?.summary?.riskLevel || "")}>
                              {walletStats?.data?.summary?.riskLevel}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Events</p>
                            <p className="font-semibold">{walletStats?.data?.summary?.totalEvents}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Fee</p>
                            <p className="font-semibold">{walletStats?.data?.summary?.avgSlippageFee}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Fees Paid</p>
                            <p className="font-semibold">{walletStats?.data?.totalFeePaid?.toFixed(2)} WPT</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Velocity Details */}
                    {walletStats?.data?.velocity && (
                      <Card className="bg-gray-50 dark:bg-gray-800">
                        <CardHeader>
                          <CardTitle className="text-sm">Velocity Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Velocity Score</p>
                              <p className="font-semibold">{Number(walletStats.data.velocity.velocityScore).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Cashout Frequency</p>
                              <p className="font-semibold">{walletStats.data.velocity.cashoutFrequency}/week</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">High Risk Status</p>
                              <Badge variant={walletStats.data.velocity.isHighRiskDumper ? "destructive" : "default"}>
                                {walletStats.data.velocity.isHighRiskDumper ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Events */}
                    <Card className="bg-gray-50 dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-sm">Recent Cashout Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(walletStats?.data?.recentEvents?.length || 0) === 0 ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400">No recent cashout events found</p>
                        ) : (
                          <div className="space-y-2">
                            {walletStats?.data?.recentEvents?.map((event: any) => (
                              <div key={event.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded">
                                <div>
                                  <p className="text-sm font-medium">{Number(event.amount).toFixed(2)} WPT</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{event.penaltyReason}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{Number(event.slippageFeeApplied).toFixed(2)}% fee</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {new Date(event.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
              <CardHeader>
                <CardTitle>Anti-Dump Configuration</CardTitle>
                <CardDescription>
                  System configuration and thresholds for the anti-dump slippage engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                {config && (
                  <div className="space-y-6">
                    {/* Base Configuration */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Base Settings</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{config?.data?.configDescription?.baseSlippageFee}</p>
                    </div>

                    <Separator />

                    {/* Velocity Thresholds */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Velocity Thresholds</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="font-medium">Low Threshold</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{config?.data?.configDescription?.velocityThresholds?.low}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="font-medium">High Threshold</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{config?.data?.configDescription?.velocityThresholds?.high}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Penalty Structure */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Penalty Structure</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                          <p className="font-medium text-green-800 dark:text-green-200">Light Penalty</p>
                          <p className="text-sm text-green-600 dark:text-green-400">{config?.data?.configDescription?.penalties?.light}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                          <p className="font-medium text-yellow-800 dark:text-yellow-200">Medium Penalty</p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">{config?.data?.configDescription?.penalties?.medium}</p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                          <p className="font-medium text-red-800 dark:text-red-200">Heavy Penalty</p>
                          <p className="text-sm text-red-600 dark:text-red-400">{config?.data?.configDescription?.penalties?.heavy}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Rules */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Additional Rules</h3>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Frequency Threshold:</strong> {config?.data?.configDescription?.frequencyThreshold}</p>
                        <p className="text-sm"><strong>Minimum Reward Age:</strong> {config?.data?.configDescription?.minimumRewardAge}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}