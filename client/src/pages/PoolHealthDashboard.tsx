import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface PoolHealthStatus {
  usdtPool: {
    tvl: number;
    healthLevel: string;
    threshold: string;
  };
  wmaticPool: {
    tvl: number;
    healthLevel: string; 
    threshold: string;
  };
  rewardScaling: {
    currentFactor: number;
    percentage: number;
    status: string;
  };
  lastUpdated: string;
}

interface PoolHealthAlert {
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  pool: 'usdt' | 'wmatic';
  message: string;
  recommendation: string;
}

export default function PoolHealthDashboard() {
  const [testReward, setTestReward] = useState(1000);

  // Fetch pool health status
  const { data: healthStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/pool-health/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch pool health alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/pool-health/alerts'],
    refetchInterval: 30000,
  });

  // Fetch pool health thresholds
  const { data: thresholds } = useQuery({
    queryKey: ['/api/pool-health/thresholds'],
  });

  const getHealthColor = (level: string) => {
    switch (level) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-orange-600 bg-orange-50';
      case 'emergency': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (level: string) => {
    switch (level) {
      case 'healthy': return <Shield className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <TrendingDown className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'border-blue-200 text-blue-800';
      case 'warning': return 'border-yellow-200 text-yellow-800';
      case 'critical': return 'border-orange-200 text-orange-800';
      case 'emergency': return 'border-red-200 text-red-800';
      default: return 'border-gray-200 text-gray-800';
    }
  };

  if (statusLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const status = healthStatus?.data as PoolHealthStatus;
  const alerts = alertsData?.data?.alerts as PoolHealthAlert[];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pool Health Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ethical Equilibrium Algorithm - Real-time Monitoring
          </p>
        </div>
      </div>

      {/* Ethical Equilibrium Status Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Target className="h-4 w-4" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">
          Ethical Equilibrium Algorithm ACTIVE
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <strong>Activation Threshold:</strong> $20,000 USDT • 
          <strong> Current Liquidity:</strong> ${status?.usdtPool.tvl?.toFixed(2)} USDT • 
          <strong> Status:</strong> Rewards maintained at reduced values (60%) until threshold is reached
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pools">Pools Status</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Reward Factor */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Reward Factor</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status?.rewardScaling.percentage}%
                </div>
                <Badge 
                  className={`mt-2 ${
                    status?.rewardScaling.status === 'normal' ? 'bg-green-100 text-green-800' :
                    status?.rewardScaling.status === 'reduced' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {status?.rewardScaling.status === 'normal' ? 'Normal' :
                   status?.rewardScaling.status === 'reduced' ? 'Reduced' : 'Critical'}
                </Badge>
                <Progress 
                  value={status?.rewardScaling.percentage} 
                  className="mt-3" 
                />
              </CardContent>
            </Card>

            {/* USDT Pool TVL */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">USDT Pool TVL</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${status?.usdtPool.tvl?.toFixed(2)}
                </div>
                <div className="flex items-center mt-2">
                  <Badge className={getHealthColor(status?.usdtPool.healthLevel)}>
                    {getHealthIcon(status?.usdtPool.healthLevel)}
                    <span className="ml-1 capitalize">{status?.usdtPool.healthLevel}</span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Activation threshold: $20,000
                </p>
              </CardContent>
            </Card>

            {/* WMATIC Pool TVL */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WMATIC Pool TVL</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${status?.wmaticPool.tvl?.toFixed(2)}
                </div>
                <div className="flex items-center mt-2">
                  <Badge className={getHealthColor(status?.wmaticPool.healthLevel)}>
                    {getHealthIcon(status?.wmaticPool.healthLevel)}
                    <span className="ml-1 capitalize">{status?.wmaticPool.healthLevel}</span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  USD equivalent
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reward Scaling Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Ethical Equilibrium Algorithm</CardTitle>
              <CardDescription>
                How the automatic reward scaling system works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">🎯 Current State (&lt; $20K)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rewards maintained at <strong>60%</strong> of original values to protect WPT reserves.
                    This ensures protocol sustainability.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">🚀 Future State (&gt; $20K)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When liquidity exceeds $20,000 USDT, the algorithm can gradually increase 
                    rewards up to <strong>105%</strong> while maintaining ethical equilibrium.
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Future Scaling (after $20K USDT):</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-gray-700 dark:text-gray-300">
                    <strong>Healthy (&gt;$50K):</strong> 105% rewards
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-gray-700 dark:text-gray-300">
                    <strong>Normal ($30-50K):</strong> 100% rewards
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-gray-700 dark:text-gray-300">
                    <strong>Warning ($20-30K):</strong> 95% rewards
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded text-gray-700 dark:text-gray-300">
                    <strong>Below threshold:</strong> 60% rewards (current)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* USDT Pool Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  USDT/WPT Pool
                </CardTitle>
                <CardDescription>Primary pool for rewards system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current TVL:</span>
                  <span className="text-lg font-bold">${status?.usdtPool.tvl?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getHealthColor(status?.usdtPool.healthLevel)}>
                    {status?.usdtPool.healthLevel}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Threshold:</span>
                  <span className="text-sm">{status?.usdtPool.threshold}</span>
                </div>
                <Progress 
                  value={(status?.usdtPool.tvl / 20000) * 100} 
                  className="mt-3"
                />
                <p className="text-xs text-muted-foreground">
                  Progress toward activation threshold ($20,000)
                </p>
              </CardContent>
            </Card>

            {/* WMATIC Pool Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  WMATIC/WPT Pool
                </CardTitle>
                <CardDescription>Secondary pool for diversification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current TVL:</span>
                  <span className="text-lg font-bold">${status?.wmaticPool.tvl?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getHealthColor(status?.wmaticPool.healthLevel)}>
                    {status?.wmaticPool.healthLevel}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Threshold:</span>
                  <span className="text-sm">{status?.wmaticPool.threshold}</span>
                </div>
                <Progress 
                  value={(status?.wmaticPool.tvl / 15000) * 100} 
                  className="mt-3"
                />
                <p className="text-xs text-muted-foreground">
                  Support pool for the system
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Health Alerts</CardTitle>
              <CardDescription>
                Notifications and recommendations for maintaining equilibrium
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <Alert key={index} className={getSeverityColor(alert.severity)}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="capitalize">
                        {alert.severity} - {alert.pool.toUpperCase()} Pool
                      </AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">{alert.message}</p>
                        <p className="text-sm font-medium">
                          <strong>Raccomandazione:</strong> {alert.recommendation}
                        </p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active alerts. System in stable state.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threshold Configuration</CardTitle>
              <CardDescription>
                System threshold configuration for ethical equilibrium in both pools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thresholds?.data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* USDT Thresholds */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">USDT Pool</h3>
                    {Object.entries(thresholds.data.usdt).map(([level, config]: [string, any]) => (
                      <div key={level} className="border rounded p-3 bg-white dark:bg-gray-900">
                        <div className="flex justify-between items-center mb-2">
                          <Badge className={getHealthColor(level)}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {Math.round(config.rewardFactor * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {config.description}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {config.min ? `$${config.min}` : ''} 
                          {config.min && config.max ? ' - ' : ''}
                          {config.max ? `$${config.max}` : ''}
                          {!config.min && !config.max ? `< $${config.max || 'N/A'}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* WMATIC Thresholds */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">WMATIC Pool</h3>
                    {Object.entries(thresholds.data.wmatic).map(([level, config]: [string, any]) => (
                      <div key={level} className="border rounded p-3 bg-white dark:bg-gray-900">
                        <div className="flex justify-between items-center mb-2">
                          <Badge className={getHealthColor(level)}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {Math.round(config.rewardFactor * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {config.description}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {config.min ? `$${config.min}` : ''} 
                          {config.min && config.max ? ' - ' : ''}
                          {config.max ? `$${config.max}` : ''}
                          {!config.min && !config.max ? `< $${config.max || 'N/A'}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  System Logic
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  The system uses the most restrictive health level between the two pools. 
                  The ethical equilibrium algorithm activates only when the USDT pool exceeds $20,000, 
                  ensuring sustainability and protection of WPT reserves.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {status?.lastUpdated ? new Date(status.lastUpdated).toLocaleString('en-US') : 'N/A'}
      </div>
    </div>
  );
}