import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Network, Globe, Zap, Activity, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface FunctionsStats {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  errorRequests: number;
  successRate: number;
  recentRequests: Array<{
    requestId: string;
    timestamp: string;
    functionType: string;
    fulfilled: boolean;
  }>;
  functionTypes: Record<string, number>;
  crossChainData: Array<{
    sourceChain: string;
    targetChain: string;
    data: any;
    timestamp: string;
  }>;
}

interface FunctionsHealth {
  status: string;
  router: string;
  donId: string;
  subscriptionId: string;
  gasLimit: number;
  pendingRequests: number;
  network: string;
  supportedChains: string[];
  lastUpdate: string;
}

export function ChainlinkFunctionsDashboard() {
  const [functionsStats, setFunctionsStats] = useState<FunctionsStats | null>(null);
  const [functionsHealth, setFunctionsHealth] = useState<FunctionsHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchFunctionsData = async () => {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        fetch('/api/chainlink/functions/stats'),
        fetch('/api/chainlink/functions/health')
      ]);

      const statsData = await statsResponse.json();
      const healthData = await healthResponse.json();

      setFunctionsStats(statsData);
      setFunctionsHealth(healthData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch Functions data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestFunction = async (functionType: string, args: any[] = []) => {
    try {
      const response = await fetch('/api/chainlink/functions/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionType,
          args
        })
      });

      const result = await response.json();
      console.log('Functions request submitted:', result);
      
      // Refresh data after request
      setTimeout(() => fetchFunctionsData(), 1000);
    } catch (error) {
      console.error('Failed to request function:', error);
    }
  };

  useEffect(() => {
    fetchFunctionsData();
    const interval = setInterval(fetchFunctionsData, 20000); // Refresh every 20 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-400" />
            Chainlink Functions Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400">Loading Functions data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Functions Status Overview */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-400" />
            Chainlink Functions Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {functionsStats?.totalRequests || 0}
              </div>
              <div className="text-sm text-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {functionsStats?.pendingRequests || 0}
              </div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {functionsStats?.errorRequests || 0}
              </div>
              <div className="text-sm text-gray-400">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {functionsStats?.successRate.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Success Rate</span>
              <span>{functionsStats?.fulfilledRequests || 0} / {functionsStats?.totalRequests || 0}</span>
            </div>
            <Progress value={functionsStats?.successRate || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Functions Health Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Functions Network Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Network</div>
              <div className="text-white font-mono">{functionsHealth?.network || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <Badge variant={functionsHealth?.status === 'healthy' ? 'default' : 'destructive'}>
                {functionsHealth?.status || 'Unknown'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Subscription ID</div>
              <div className="text-white font-mono">{functionsHealth?.subscriptionId || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Gas Limit</div>
              <div className="text-white font-mono">{functionsHealth?.gasLimit?.toLocaleString() || 'N/A'}</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Supported Chains</div>
            <div className="flex flex-wrap gap-2">
              {functionsHealth?.supportedChains.map((chain) => (
                <Badge key={chain} variant="outline" className="text-xs">
                  {chain}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Function Types */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-400" />
            Function Types & Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {functionsStats?.functionTypes && Object.entries(functionsStats.functionTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-white capitalize">{type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{count} requests</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => requestFunction(type)}
                    className="text-xs"
                  >
                    Execute
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Chain Data */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            Cross-Chain Data Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {functionsStats?.crossChainData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {data.sourceChain} → {data.targetChain}
                    </div>
                    <div className="text-xs text-gray-400">
                      Data: {data.data.WPT_USD ? `WPT $${data.data.WPT_USD}` : 'Various'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {new Date(data.timestamp).toLocaleTimeString()}
                  </div>
                  <Badge variant="default" className="text-xs">
                    Synced
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Recent Function Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {functionsStats?.recentRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {request.fulfilled ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-400" />
                  )}
                  <div>
                    <div className="text-white text-sm font-medium capitalize">
                      {request.functionType.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {request.requestId.slice(0, 20)}...
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </div>
                  <Badge variant={request.fulfilled ? 'default' : 'secondary'} className="text-xs">
                    {request.fulfilled ? 'Complete' : 'Processing'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-400">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}