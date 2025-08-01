import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PoolProtectionStats {
  totalBlocked: number;
  recentAlerts: number;
  topRiskWallets: Array<{
    wallet: string;
    riskScore: number;
    alerts: number;
  }>;
  poolHealth: {
    hourlyDrain: number;
    dailyDrain: number;
    isHealthy: boolean;
  };
}

interface SecurityEvent {
  id: number;
  walletAddress: string;
  suspiciousActivity: string;
  riskScore: number;
  alertLevel: string;
  actionTaken: string;
  isResolved: boolean;
  createdAt: string;
}

interface ProtectionTestResult {
  success: boolean;
  simulationType: string;
  testAmount: number;
  originalAmount: number;
  protection: {
    canDistribute: boolean;
    riskScore: number;
    remainingQuota: {
      hourly: number;
      daily: number;
      weekly: number;
      monthly: number;
    };
    securityAlerts: string[];
  };
}

export default function PoolDrainProtection() {
  const [testResult, setTestResult] = useState<ProtectionTestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<PoolProtectionStats>({
    queryKey: ['/api/pool/drain-protection/stats'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: securityEvents, isLoading: eventsLoading } = useQuery<{ 
    success: boolean; 
    events: SecurityEvent[]; 
    timestamp: string; 
  }>({
    queryKey: ['/api/pool/drain-protection/security-events'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const testProtection = async (simulationType: string) => {
    setTestLoading(true);
    try {
      const response = await apiRequest('/api/pool/drain-protection/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: selectedWallet,
          rewardAmount: 1.0,
          simulationType
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
      }
    } catch (error) {
      console.error('Protection test failed:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-500';
    if (riskScore >= 40) return 'text-yellow-500';
    return 'text-green-600';
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (statsLoading || eventsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Pool Drain Protection</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Loading...</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Pool Drain Protection</h2>
        </div>
        <Badge variant={stats?.poolHealth?.isHealthy ? "default" : "destructive"}>
          {stats?.poolHealth?.isHealthy ? "Healthy" : "At Risk"}
        </Badge>
      </div>

      {/* Protection Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Threats Blocked</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBlocked || 0}</div>
            <p className="text-sm text-gray-600">Total security blocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>Pool Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hourly Drain</span>
                <span className={getRiskColor(stats?.poolHealth?.hourlyDrain || 0)}>
                  {(stats?.poolHealth?.hourlyDrain || 0).toFixed(2)}%
                </span>
              </div>
              <Progress value={stats?.poolHealth?.hourlyDrain || 0} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>Daily Drain</span>
                <span className={getRiskColor(stats?.poolHealth?.dailyDrain || 0)}>
                  {(stats?.poolHealth?.dailyDrain || 0).toFixed(2)}%
                </span>
              </div>
              <Progress value={stats?.poolHealth?.dailyDrain || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span>Active Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentAlerts || 0}</div>
            <p className="text-sm text-gray-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Wallets */}
      {stats?.topRiskWallets && stats.topRiskWallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>High Risk Wallets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topRiskWallets.map((wallet, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono">
                      {wallet.wallet.slice(0, 6)}...{wallet.wallet.slice(-4)}
                    </code>
                    <Badge variant="outline" className="text-xs">
                      {wallet.alerts} alerts
                    </Badge>
                  </div>
                  <div className={`text-sm font-medium ${getRiskColor(wallet.riskScore)}`}>
                    {wallet.riskScore.toFixed(1)}% risk
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Events */}
      {securityEvents?.events && securityEvents.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span>Recent Security Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityEvents.events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getAlertColor(event.alertLevel)}>
                        {event.alertLevel.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{event.suspiciousActivity}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Wallet: {event.walletAddress.slice(0, 6)}...{event.walletAddress.slice(-4)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Risk Score: {event.riskScore}% • Action: {event.actionTaken}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Protection Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span>Protection Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => testProtection('normal')}
                disabled={testLoading}
                variant="outline"
                size="sm"
              >
                Normal Test
              </Button>
              <Button 
                onClick={() => testProtection('high_frequency')}
                disabled={testLoading}
                variant="outline"
                size="sm"
              >
                High Frequency
              </Button>
              <Button 
                onClick={() => testProtection('large_amount')}
                disabled={testLoading}
                variant="outline"
                size="sm"
              >
                Large Amount
              </Button>
              <Button 
                onClick={() => testProtection('drain_attempt')}
                disabled={testLoading}
                variant="destructive"
                size="sm"
              >
                Drain Attempt
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.protection.canDistribute ? "border-green-200" : "border-red-200"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Test Type:</span>
                      <Badge variant="outline">{testResult.simulationType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>{testResult.testAmount} WPT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Result:</span>
                      <Badge variant={testResult.protection.canDistribute ? "default" : "destructive"}>
                        {testResult.protection.canDistribute ? "ALLOWED" : "BLOCKED"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <span className={getRiskColor(testResult.protection.riskScore)}>
                        {testResult.protection.riskScore.toFixed(1)}%
                      </span>
                    </div>
                    {testResult.protection.securityAlerts.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">Security Alerts:</div>
                        <div className="space-y-1">
                          {testResult.protection.securityAlerts.map((alert, index) => (
                            <div key={index} className="text-xs text-red-600 bg-red-50 p-1 rounded">
                              {alert}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}