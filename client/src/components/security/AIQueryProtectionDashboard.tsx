import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Bot,
  Search,
  Clock,
  TrendingUp,
  Globe
} from 'lucide-react';

interface QueryAnalysis {
  isSpam: boolean;
  riskScore: number;
  reasons: string[];
  confidence: number;
  recommendation: 'BLOCK' | 'FLAG' | 'ALLOW';
}

interface VPNAnalysis {
  isVPN: boolean;
  riskScore: number;
  provider?: string;
  country?: string;
  confidence: number;
  reasons: string[];
  recommendation: 'BLOCK' | 'FLAG' | 'ALLOW';
}

export function AIQueryProtectionDashboard() {
  // Fetch AI Query Stats
  const { data: queryStats, isLoading: queryStatsLoading } = useQuery<any>({
    queryKey: ['/api/ai-query/stats'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Fetch VPN Stats
  const { data: vpnStats, isLoading: vpnStatsLoading } = useQuery<any>({
    queryKey: ['/api/vpn/stats'],
    refetchInterval: 10000
  });



  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'text-red-500';
    if (riskScore >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRecommendationBadge = (recommendation: string) => {
    const colors = {
      BLOCK: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      FLAG: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      ALLOW: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    return colors[recommendation as keyof typeof colors] || colors.ALLOW;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">AI Query & VPN Protection</h2>
          <p className="text-muted-foreground">
            Advanced spam detection and VPN/proxy analysis for AI reward queries
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
          <Shield className="h-4 w-4 mr-2" />
          Enhanced Security
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="query-analysis">Query Analysis</TabsTrigger>
          <TabsTrigger value="vpn-detection">VPN Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Query Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active IPs</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {queryStatsLoading ? '...' : queryStats?.stats?.totalActiveIPs || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  IPs monitored for AI queries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {queryStatsLoading ? '...' : queryStats?.stats?.totalQueries || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Queries analyzed total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VPN Detected</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vpnStatsLoading ? '...' : (vpnStats?.stats?.datacenterIPs + vpnStats?.stats?.proxyIPs) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  VPN/Proxy IPs found
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vpnStatsLoading ? '...' : vpnStats?.stats?.uniqueCountries || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique countries detected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Protection Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  AI Query Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Cache Size</span>
                  <Badge variant="outline">
                    {queryStats?.stats?.cacheSize || 0} entries
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Queries/Hour</span>
                  <Badge variant="outline">
                    {queryStats?.stats?.queriesLastHour || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Queries/IP</span>
                  <Badge variant="outline">
                    {queryStats?.stats?.averageQueriesPerIP || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  VPN Detection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Datacenter IPs</span>
                  <Badge variant="outline" className="text-yellow-600">
                    {vpnStats?.stats?.datacenterIPs || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Proxy IPs</span>
                  <Badge variant="outline" className="text-red-600">
                    {vpnStats?.stats?.proxyIPs || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tor IPs</span>
                  <Badge variant="outline" className="text-red-600">
                    {vpnStats?.stats?.torIPs || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="query-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Query Analysis Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                System analyzes queries for spam patterns, complexity, and suspicious behavior
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Protection Features:</strong>
                    <br />• Query complexity analysis (minimum 10 characters)
                    <br />• Semantic similarity detection (85% threshold)
                    <br />• Spam keyword filtering
                    <br />• Response time pattern analysis
                    <br />• IP query frequency limits (20/hour)
                    <br />• AI model diversity requirements
                  </AlertDescription>
                </Alert>

                {queryStats?.stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Current Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div>Active IPs: {queryStats.stats.totalActiveIPs}</div>
                        <div>Total Queries: {queryStats.stats.totalQueries}</div>
                        <div>Last Hour: {queryStats.stats.queriesLastHour}</div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div>Cache Entries: {queryStats.stats.cacheSize}</div>
                        <div>Avg/IP: {queryStats.stats.averageQueriesPerIP}</div>
                        <div>Status: <Badge className="ml-1">Active</Badge></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vpn-detection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>VPN & Proxy Detection Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced IP analysis to detect VPNs, proxies, and suspicious network traffic
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Detection Methods:</strong>
                    <br />• VPN provider identification
                    <br />• Datacenter IP detection
                    <br />• Geographic anomaly analysis
                    <br />• Proxy/Tor exit node detection
                    <br />• User-Agent consistency checks
                    <br />• Country switching frequency monitoring
                  </AlertDescription>
                </Alert>

                {vpnStats?.stats && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Detection Results</h4>
                        <div className="space-y-2 text-sm">
                          <div>Total IPs: {vpnStats.stats.totalIPsAnalyzed}</div>
                          <div>Datacenter: {vpnStats.stats.datacenterIPs}</div>
                          <div>Proxy: {vpnStats.stats.proxyIPs}</div>
                          <div>Tor: {vpnStats.stats.torIPs}</div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Geographic Data</h4>
                        <div className="space-y-2 text-sm">
                          <div>Countries: {vpnStats.stats.uniqueCountries}</div>
                          <div>Cache Hit Rate: {vpnStats.stats.cacheHitRate?.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Top Countries</h4>
                        <div className="space-y-1 text-sm">
                          {vpnStats.stats.topCountries?.slice(0, 3).map((country: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span>{country.country}</span>
                              <span>{country.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}