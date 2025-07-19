import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface AlchemyUsageData {
  success: boolean;
  usage: {
    callsUsed: number;
    maxCallsPerHour: number;
    remainingCalls: number;
    utilizationPercent: string;
    nextResetTime: string;
    monitoringInterval: string;
    mode: string;
  };
  recommendations: {
    currentTier: string;
    estimatedMonthlyCUs: number;
    isWithinLimits: boolean;
    optimizationActive: boolean;
    savings: string;
    frequency: string;
  };
}

export function AlchemyUsageMonitor() {
  const { data: usageData, refetch } = useQuery<AlchemyUsageData>({
    queryKey: ['/api/reentrancy/alchemy/usage'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const { data: statusData } = useQuery({
    queryKey: ['/api/reentrancy/alchemy/status'],
    refetchInterval: 30000,
  });

  if (!usageData?.success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Alchemy API Usage Monitor
          </CardTitle>
          <CardDescription>
            Real-time tracking of Alchemy API consumption for FREE TIER sustainability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Loading usage statistics...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const usage = usageData.usage;
  const recommendations = usageData.recommendations;
  const utilizationPercent = parseFloat(usage.utilizationPercent);

  // Determine status color based on usage
  const getStatusColor = (percent: number) => {
    if (percent < 50) return "bg-green-500";
    if (percent < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (percent: number) => {
    if (percent < 50) return "OPTIMAL";
    if (percent < 75) return "MODERATE";
    return "HIGH USAGE";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Alchemy API Usage Monitor
          <Badge variant="outline" className="ml-auto">
            {recommendations.currentTier}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time tracking optimized for FREE TIER sustainability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Usage Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Calls Used</span>
            </div>
            <div className="text-2xl font-bold">{usage.callsUsed}</div>
            <div className="text-xs text-gray-500">of {usage.maxCallsPerHour}/hour</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Remaining</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{usage.remainingCalls}</div>
            <div className="text-xs text-gray-500">calls available</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <Badge className={`${getStatusColor(utilizationPercent)} text-white`}>
              {getStatusText(utilizationPercent)}
            </Badge>
            <div className="text-xs text-gray-500">{usage.utilizationPercent}% used</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Mode</span>
            </div>
            <div className="text-sm font-bold text-purple-600">{usage.mode}</div>
            <div className="text-xs text-gray-500">Optimized</div>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Hourly Usage Progress</span>
            <span>{usage.utilizationPercent}%</span>
          </div>
          <Progress value={utilizationPercent} className="h-2" />
          <div className="text-xs text-gray-500">
            Resets at: {new Date(usage.nextResetTime).toLocaleTimeString()}
          </div>
        </div>

        {/* Monthly Projection */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Monthly Projection</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {(recommendations.estimatedMonthlyCUs / 1000000).toFixed(1)}M CUs
              </div>
              <div className="text-sm text-gray-500">Estimated monthly usage</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">300M CUs</div>
              <div className="text-sm text-gray-500">Free tier limit</div>
            </div>
          </div>
          
          {recommendations.isWithinLimits ? (
            <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
              ✅ Within FREE TIER limits
            </Badge>
          ) : (
            <Badge variant="destructive" className="mt-2">
              ⚠️ May exceed FREE TIER
            </Badge>
          )}
        </div>

        {/* Optimization Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
            Active Optimizations
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{recommendations.savings}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{recommendations.frequency}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Monitoring interval: {usage.monitoringInterval}</span>
            </div>
            {statusData?.status && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Status: {statusData.status.mode} mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => refetch()}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Now
          </button>
          {!recommendations.isWithinLimits && (
            <Badge variant="destructive">
              Consider upgrading to paid plan
            </Badge>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
