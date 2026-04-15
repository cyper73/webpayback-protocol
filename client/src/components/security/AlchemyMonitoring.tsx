import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Shield, AlertTriangle, CheckCircle, XCircle, Play, Square } from 'lucide-react';

interface AlchemyStatus {
  isActive: boolean;
  network: string;
  apiKey: string;
  lastCheck: string;
}

interface BlockchainActivity {
  latestBlock: number;
  transactionCount: number;
  timestamp: string;
  gasUsed: string;
  difficulty: string;
}

export function AlchemyMonitoring() {
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Query for monitoring status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/reentrancy/alchemy/status'],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Query for blockchain activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/reentrancy/alchemy/activity'],
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // Mutation to start monitoring
  const startMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/reentrancy/alchemy/start'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reentrancy/alchemy/status'] });
    },
  });

  // Mutation to stop monitoring
  const stopMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/reentrancy/alchemy/stop'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reentrancy/alchemy/status'] });
    },
  });

  const status: AlchemyStatus | undefined = statusData?.status;
  const activity: BlockchainActivity | undefined = activityData?.activity;

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alchemy Real-time Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading monitoring status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alchemy Real-time Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {status?.isActive ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={status?.isActive ? "default" : "destructive"}>
                {status?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="font-medium">{status?.network || 'Unknown'}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-sm text-muted-foreground">API Key</p>
              <Badge variant={status?.apiKey === 'Set' ? "default" : "destructive"}>
                {status?.apiKey || 'Missing'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground">Last Check</p>
              <p className="text-xs font-medium">
                {status?.lastCheck ? new Date(status.lastCheck).toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Control Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending || status?.isActive}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Monitoring
            </Button>
            <Button
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending || !status?.isActive}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Monitoring
            </Button>
          </div>

          {(startMutation.isPending || stopMutation.isPending) && (
            <div className="text-center text-sm text-muted-foreground">
              {startMutation.isPending ? 'Starting monitoring...' : 'Stopping monitoring...'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blockchain Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Blockchain Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="text-center py-4">Loading blockchain activity...</div>
          ) : activity ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Latest Block</p>
                <p className="text-lg font-bold text-blue-600">#{activity.latestBlock}</p>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold text-green-600">{activity.transactionCount}</p>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Gas Used</p>
                <p className="text-lg font-bold text-purple-600">
                  {parseInt(activity.gasUsed).toLocaleString()}
                </p>
              </div>

              <div className="col-span-2 md:col-span-3 text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Block Timestamp</p>
                <p className="text-sm font-medium">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No blockchain activity data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Information */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Protection Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Pending transaction analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">High-risk function detection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Gas pattern analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Mempool monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Automatic threat blocking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-refresh toggle */}
      <div className="flex items-center justify-center gap-2">
        <label className="text-sm">Auto-refresh</label>
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="w-4 h-4"
        />
      </div>
    </div>
  );
}