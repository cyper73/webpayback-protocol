import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  DollarSign, 
  Settings, 
  Shield, 
  Activity, 
  AlertTriangle,
  PlayCircle,
  StopCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AutomationStatus {
  enabled: boolean;
  emergencyStop: boolean;
  dailySpend: {
    used: number;
    limit: number;
    remaining: number;
    resetDate: string;
  };
  lastAction?: {
    id: string;
    action: string;
    reason: string;
    status: string;
    timestamp: number;
  };
  totalActions: number;
}

interface AutomationConfig {
  enabled: boolean;
  rebalanceThreshold: number;
  maxDailySpend: number;
  maxTransactionSize: number;
  emergencyStop: boolean;
  notifications: boolean;
}

interface AutomationAction {
  id: string;
  timestamp: number;
  action: string;
  poolAddress: string;
  reason: string;
  gasUsed: string;
  status: string;
  txHash?: string;
}

export default function AutomationDashboard() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch automation status
  const { data: statusData, isLoading: statusLoading } = useQuery<{
    success: boolean;
    status: AutomationStatus;
  }>({
    queryKey: ['/api/automation/status'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Fetch automation config
  const { data: configData } = useQuery<{
    success: boolean;
    config: AutomationConfig;
  }>({
    queryKey: ['/api/automation/config'],
    enabled: isConfigOpen
  });

  // Fetch action history
  const { data: historyData } = useQuery<{
    success: boolean;
    history: AutomationAction[];
  }>({
    queryKey: ['/api/automation/history'],
    refetchInterval: 15000
  });

  // Emergency stop mutation
  const emergencyStopMutation = useMutation({
    mutationFn: () => apiRequest('/api/automation/emergency-stop', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/status'] });
    }
  });

  // Resume automation mutation
  const resumeMutation = useMutation({
    mutationFn: () => apiRequest('/api/automation/resume', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/status'] });
    }
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<AutomationConfig>) => 
      apiRequest('/api/automation/config', 'POST', config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/status'] });
    }
  });

  const status = statusData?.status;
  const config = configData?.config;
  const history = historyData?.history || [];

  const getStatusColor = () => {
    if (!status?.enabled || status?.emergencyStop) return "bg-red-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!status?.enabled) return "Disabled";
    if (status?.emergencyStop) return "Emergency Stop";
    return "Active";
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading automation status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Automated Pool Manager
          </h2>
          <p className="text-gray-500">Zero-touch pool management without MetaMask</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <Badge variant={status?.enabled && !status?.emergencyStop ? "default" : "destructive"}>
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Budget */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              Daily Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Used</span>
                <span className="font-semibold">${status?.dailySpend.used.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Remaining</span>
                <span className="font-semibold text-green-600">
                  ${status?.dailySpend.remaining.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${((status?.dailySpend.used || 0) / (status?.dailySpend.limit || 1)) * 100}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-500">
                Limit: ${status?.dailySpend.limit}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.totalActions || 0}</div>
            <div className="text-sm text-gray-500">
              Automated transactions
            </div>
          </CardContent>
        </Card>

        {/* Last Action */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Last Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status?.lastAction ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {status.lastAction.action}
                  </Badge>
                  {status.lastAction.status === 'completed' && (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                  {status.lastAction.status === 'failed' && (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimestamp(status.lastAction.timestamp)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No actions yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Control Panel
          </CardTitle>
          <CardDescription>
            Emergency controls and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Emergency Stop</h3>
              <p className="text-sm text-gray-500">
                Immediately halt all automated actions
              </p>
            </div>
            <Button
              variant={status?.emergencyStop ? "default" : "destructive"}
              size="sm"
              onClick={() => {
                if (status?.emergencyStop) {
                  resumeMutation.mutate();
                } else {
                  emergencyStopMutation.mutate();
                }
              }}
              disabled={emergencyStopMutation.isPending || resumeMutation.isPending}
            >
              {status?.emergencyStop ? (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Emergency Stop
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Configuration</h3>
              <p className="text-sm text-gray-500">
                Adjust automation parameters
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      {isConfigOpen && config && (
        <Card>
          <CardHeader>
            <CardTitle>Automation Configuration</CardTitle>
            <CardDescription>
              Adjust parameters for automated pool management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rebalanceThreshold">Rebalance Threshold (%)</Label>
                <Input
                  id="rebalanceThreshold"
                  type="number"
                  value={config.rebalanceThreshold * 100}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value) / 100;
                    updateConfigMutation.mutate({ rebalanceThreshold: newValue });
                  }}
                  min="5"
                  max="50"
                  step="1"
                />
                <p className="text-xs text-gray-500">
                  Trigger automation when price moves by this percentage
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDailySpend">Max Daily Spend ($)</Label>
                <Input
                  id="maxDailySpend"
                  type="number"
                  value={config.maxDailySpend}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    updateConfigMutation.mutate({ maxDailySpend: newValue });
                  }}
                  min="10"
                  max="500"
                  step="5"
                />
                <p className="text-xs text-gray-500">
                  Maximum USD to spend on automation per day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTransactionSize">Max Transaction Size ($)</Label>
                <Input
                  id="maxTransactionSize"
                  type="number"
                  value={config.maxTransactionSize}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    updateConfigMutation.mutate({ maxTransactionSize: newValue });
                  }}
                  min="5"
                  max="100"
                  step="1"
                />
                <p className="text-xs text-gray-500">
                  Maximum USD per single transaction
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications"
                    checked={config.notifications}
                    onCheckedChange={(checked) => {
                      updateConfigMutation.mutate({ notifications: checked });
                    }}
                  />
                  <Label htmlFor="notifications">Enable Notifications</Label>
                </div>
                <p className="text-xs text-gray-500">
                  Receive alerts for automated actions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
          <CardDescription>
            History of automated pool management actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(-10).reverse().map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {action.action}
                      </Badge>
                      {action.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {action.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {action.status === 'pending' && (
                        <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {action.reason}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(action.timestamp)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Gas: ${action.gasUsed}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No automated actions yet</p>
              <p className="text-sm">The system will start managing your pools automatically</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}