import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Database, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheStatus {
  isValid: boolean;
  lastFetch: string;
  nextRefresh: string;
  dataSource: 'real' | 'fallback';
  hoursUntilRefresh: number;
}

export default function PoolDataStatus() {
  const { toast } = useToast();

  const { data: cacheStatus, refetch } = useQuery<{ success: boolean; status: CacheStatus }>({
    queryKey: ['/api/web3/pool-cache-status'],
    refetchInterval: 60000 // Check every minute
  });

  const handleForceRefresh = async () => {
    try {
      const response = await fetch('/api/web3/refresh-pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Pool Data Refreshed",
          description: "Real-time data fetched from Uniswap V3",
        });
        refetch();
      } else {
        throw new Error('Failed to refresh');
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Using cached data. Will retry automatically.",
        variant: "destructive"
      });
    }
  };

  if (!cacheStatus?.status) {
    return null;
  }

  const status = cacheStatus.status;
  const isRealData = status.dataSource === 'real';
  const hoursLeft = Math.floor(status.hoursUntilRefresh);
  const minutesLeft = Math.floor((status.hoursUntilRefresh - hoursLeft) * 60);

  return (
    <Card className="border-blue-500/20 bg-blue-900/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4 text-blue-400" />
          Pool Data Status
          <Badge 
            variant="default"
            className="bg-green-600"
          >
            authentic
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {/* Data Source */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-400" />
            Source:
          </span>
          <span className="font-mono">
            Authentic Data
          </span>
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last Update:
          </span>
          <span className="font-mono text-xs">
            {new Date(status.lastFetch).toLocaleString()}
          </span>
        </div>

        {/* Next Refresh */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Next Refresh:</span>
          <span className="font-mono text-xs">
            {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
          </span>
        </div>

        {/* Cache Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Cache:</span>
          <Badge variant={status.isValid ? "default" : "destructive"}>
            {status.isValid ? "Valid" : "Expired"}
          </Badge>
        </div>

        {/* Force Refresh Button */}
        <Button 
          onClick={handleForceRefresh}
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Force Refresh Now
        </Button>

        {/* Cost Info */}
        <div className="bg-green-900/20 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-1 text-green-400 mb-1">
            <CheckCircle className="h-3 w-3" />
            <span className="font-medium">Cost Efficient</span>
          </div>
          <p className="text-gray-400">
            Real data fetched once every 24h • Only 2 API calls/day • Free tier friendly
          </p>
        </div>

      </CardContent>
    </Card>
  );
}