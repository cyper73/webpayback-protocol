import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, TrendingUp, Activity, Zap, Dices, Network, Globe } from 'lucide-react';
import { ChainlinkVRFDashboard } from './ChainlinkVRFDashboard';
import { ChainlinkFunctionsDashboard } from './ChainlinkFunctionsDashboard';

interface ChainlinkPrices {
  prices: {
    MATIC_USD: number;
    ETH_USD: number;
    WPT_USD: number;
  };
  timestamp: string;
  source: string;
}

interface AutomationStatus {
  automation: {
    enabled: boolean;
    lastBatch: string;
    nextBatch: string;
    pendingRewards: number;
    gasPoolHealth: boolean;
  };
  timestamp: string;
}

interface FeedHealth {
  status: string;
  feeds: Array<{
    feed: string;
    status: string;
    lastUpdate: string;
    price: number;
  }>;
  timestamp: string;
}

export default function ChainlinkDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Chainlink prices
  const { data: prices, isLoading: pricesLoading, refetch: refetchPrices } = useQuery<ChainlinkPrices>({
    queryKey: ['/api/chainlink/prices'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch automation status
  const { data: automation, isLoading: automationLoading, refetch: refetchAutomation } = useQuery<AutomationStatus>({
    queryKey: ['/api/chainlink/automation/status'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch feed health
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery<FeedHealth>({
    queryKey: ['/api/chainlink/health'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Manual refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchPrices(),
      refetchAutomation(),
      refetchHealth()
    ]);
    setRefreshing(false);
  };

  // Trigger manual automation
  const handleTriggerAutomation = async () => {
    try {
      const response = await fetch('/api/chainlink/automation/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('Manual automation triggered successfully');
        refetchAutomation();
      }
    } catch (error) {
      console.error('Error triggering automation:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chainlink Integration</h2>
          <p className="text-muted-foreground">
            Enterprise-grade oracle services: Data Feeds, VRF, and Functions
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="data-feeds" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data-feeds" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Data Feeds
          </TabsTrigger>
          <TabsTrigger value="vrf" className="flex items-center gap-2">
            <Dices className="h-4 w-4" />
            VRF
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Functions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-feeds" className="space-y-6 mt-6">
          <DataFeedsTab 
            prices={prices}
            automation={automation}
            health={health}
            pricesLoading={pricesLoading}
            automationLoading={automationLoading}
            healthLoading={healthLoading}
            handleTriggerAutomation={handleTriggerAutomation}
            refetchAutomation={refetchAutomation}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="vrf" className="space-y-6 mt-6">
          <ChainlinkVRFDashboard />
        </TabsContent>

        <TabsContent value="functions" className="space-y-6 mt-6">
          <ChainlinkFunctionsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Data Feeds Tab Component
function DataFeedsTab({ 
  prices, 
  automation, 
  health, 
  pricesLoading, 
  automationLoading, 
  healthLoading, 
  handleTriggerAutomation, 
  refetchAutomation, 
  formatCurrency, 
  formatDate 
}: any) {
  return (
    <div className="space-y-6">
      {/* Price Feeds */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MATIC/USD</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricesLoading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                formatCurrency(prices?.prices.MATIC_USD || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Chainlink Data Feed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH/USD</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricesLoading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                formatCurrency(prices?.prices.ETH_USD || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Chainlink Data Feed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WPT/USD</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricesLoading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                formatCurrency(prices?.prices.WPT_USD || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Calculated from MATIC pool
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Chainlink Automation
          </CardTitle>
          <CardDescription>
            Automated batch processing for reward distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {automationLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={automation?.automation.enabled ? "default" : "destructive"}>
                      {automation?.automation.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gas Pool Health</span>
                    <Badge variant={automation?.automation.gasPoolHealth ? "default" : "destructive"}>
                      {automation?.automation.gasPoolHealth ? "Healthy" : "Unhealthy"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Rewards</span>
                    <span className="font-medium">{automation?.automation.pendingRewards || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Batch</span>
                    <span className="font-medium text-xs">
                      {automation?.automation.lastBatch ? formatDate(automation.automation.lastBatch) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleTriggerAutomation} size="sm">
                  Trigger Manual Batch
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetchAutomation()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Price Feed Health
          </CardTitle>
          <CardDescription>
            Status of Chainlink price feeds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {health?.feeds.map((feed: any) => (
                <div key={feed.feed} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={feed.status === 'healthy' ? 'default' : 'destructive'}>
                      {feed.status}
                    </Badge>
                    <span className="font-medium">{feed.feed}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(feed.price)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(feed.lastUpdate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-xs text-muted-foreground">
        Last updated: {prices?.timestamp ? formatDate(prices.timestamp) : 'Never'}
      </div>
    </div>
  );
}