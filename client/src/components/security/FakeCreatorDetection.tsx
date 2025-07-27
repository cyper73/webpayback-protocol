import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Check, X, TestTube, Search, Target } from "lucide-react";

interface FakeCreatorStats {
  totalBlocked: number;
  recentAlerts: number;
  topSuspiciousUrls: Array<{
    url: string;
    similarityScore: number;
    alerts: number;
  }>;
  protectionHealth: {
    blacklistMatches: number;
    fuzzyMatches: number;
    reputationBlocks: number;
    isHealthy: boolean;
  };
}

interface FakeCreatorAlert {
  id: number;
  creatorId: number;
  suspiciousUrl: string;
  suspiciousType: string;
  similarityScore: number;
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  actionTaken: string;
  isResolved: boolean;
  createdAt: Date;
  evidence: string;
}

const FakeCreatorDetection: React.FC = () => {
  const [stats, setStats] = useState<FakeCreatorStats | null>(null);
  const [alerts, setAlerts] = useState<FakeCreatorAlert[]>([]);
  const [testUrl, setTestUrl] = useState('');
  const [simulationType, setSimulationType] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica statistiche e alert
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          fetch('/api/fake-creator/stats'),
          fetch('/api/fake-creator/alerts')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts);
        }
      } catch (err) {
        setError('Failed to load fake creator detection data');
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh ogni 30 secondi
    return () => clearInterval(interval);
  }, []);

  // Esegui test di rilevamento
  const runTest = async () => {
    if (!simulationType) {
      setError('Please select a simulation type');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fake-creator/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testUrl,
          simulationType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Test failed');
      }
    } catch (err) {
      setError('Failed to run test');
    } finally {
      setIsLoading(false);
    }
  };

  // Ottieni colore per il livello di rischio
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Ottieni badge per il livello di rischio
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="default">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Fake Creator Detection</h2>
        </div>
        <Badge variant={stats?.protectionHealth.isHealthy ? "default" : "destructive"}>
          {stats?.protectionHealth.isHealthy ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <X className="h-4 w-4 mr-2 text-red-500" />
              Total Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.totalBlocked || 0}
            </div>
            <p className="text-xs text-gray-600">Fake creators detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.recentAlerts || 0}
            </div>
            <p className="text-xs text-gray-600">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-500" />
              Detection Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Fuzzy Match</span>
                <span>{stats?.protectionHealth.fuzzyMatches || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Pattern Match</span>
                <span>{stats?.protectionHealth.blacklistMatches || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Reputation Block</span>
                <span>{stats?.protectionHealth.reputationBlocks || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-4 w-4 mr-2" />
            Detection Testing
          </CardTitle>
          <CardDescription>
            Test the fake creator detection system with different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter URL to test (optional)"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1"
              />
              <Select value={simulationType} onValueChange={setSimulationType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typosquatting">Typosquatting</SelectItem>
                  <SelectItem value="homograph">Homograph Attack</SelectItem>
                  <SelectItem value="subdomain">Subdomain Fake</SelectItem>
                  <SelectItem value="legitimate">Legitimate Domain</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={runTest} disabled={isLoading}>
                {isLoading ? 'Testing...' : 'Test'}
              </Button>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {testResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Test Domain:</span>
                      <span className="font-mono text-sm">{testResult.testDomain}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Suspicious:</span>
                      <div className="flex items-center space-x-2">
                        {testResult.detection.isSuspicious ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        <span className={testResult.detection.isSuspicious ? 'text-red-600' : 'text-green-600'}>
                          {testResult.detection.isSuspicious ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Similarity Score:</span>
                      <span className="font-semibold">{testResult.detection.similarity?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Level:</span>
                      {getRiskBadge(testResult.detection.riskLevel)}
                    </div>
                    {testResult.detection.matchedDomain && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Matched Domain:</span>
                        <span className="font-mono text-sm">{testResult.detection.matchedDomain}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Would Block:</span>
                      <span className={testResult.detection.wouldBlock ? 'text-red-600' : 'text-green-600'}>
                        {testResult.detection.wouldBlock ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600">
                        <strong>Evidence:</strong> {testResult.detection.evidence}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Suspicious URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Top Suspicious URLs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.topSuspiciousUrls && stats.topSuspiciousUrls.length > 0 ? (
            <div className="space-y-3">
              {stats.topSuspiciousUrls.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-base font-bold text-black dark:text-white mb-1" style={{color: '#000000'}}>
                      {item.url}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Typosquatting domain detected
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{item.similarityScore.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">similarity</div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {item.alerts} alert{item.alerts !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No suspicious URLs detected</p>
              <p className="text-sm">Protection systems are monitoring for threats</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Recent Detection Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-mono text-sm truncate">{alert.suspiciousUrl}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {alert.suspiciousType} • {alert.similarityScore.toFixed(1)}% similarity
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {alert.evidence}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRiskBadge(alert.alertLevel)}
                    <Badge variant="outline" className="text-xs">
                      {alert.actionTaken}
                    </Badge>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  +{alerts.length - 5} more alerts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FakeCreatorDetection;