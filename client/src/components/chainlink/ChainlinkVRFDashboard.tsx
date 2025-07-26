import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dices, TrendingUp, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface VRFStats {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  recentRequests: Array<{
    requestId: string;
    timestamp: string;
    purpose: string;
    fulfilled: boolean;
  }>;
  purposes: Record<string, number>;
}

interface VRFHealth {
  status: string;
  coordinator: string;
  keyHash: string;
  subscriptionId: string;
  requestConfirmations: number;
  callbackGasLimit: number;
  pendingRequests: number;
  network: string;
  lastUpdate: string;
}

export function ChainlinkVRFDashboard() {
  const [vrfStats, setVrfStats] = useState<VRFStats | null>(null);
  const [vrfHealth, setVrfHealth] = useState<VRFHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchVRFData = async () => {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        fetch('/api/chainlink/vrf/stats'),
        fetch('/api/chainlink/vrf/health')
      ]);

      const statsData = await statsResponse.json();
      const healthData = await healthResponse.json();

      setVrfStats(statsData);
      setVrfHealth(healthData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch VRF data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestRandomness = async (purpose: string) => {
    try {
      const response = await fetch('/api/chainlink/vrf/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose,
          minValue: 0,
          maxValue: 1000000,
          numWords: 1
        })
      });

      const result = await response.json();
      console.log('VRF request submitted:', result);
      
      // Refresh data after request
      setTimeout(() => fetchVRFData(), 1000);
    } catch (error) {
      console.error('Failed to request randomness:', error);
    }
  };

  useEffect(() => {
    fetchVRFData();
    const interval = setInterval(fetchVRFData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Dices className="h-5 w-5 text-blue-400" />
            Chainlink VRF Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400">Loading VRF data...</div>
        </CardContent>
      </Card>
    );
  }

  const successRate = vrfStats ? (vrfStats.fulfilledRequests / vrfStats.totalRequests) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* VRF Status Overview */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Dices className="h-5 w-5 text-blue-400" />
            Chainlink VRF Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {vrfStats?.totalRequests || 0}
              </div>
              <div className="text-sm text-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {vrfStats?.pendingRequests || 0}
              </div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Fulfillment Progress</span>
              <span>{vrfStats?.fulfilledRequests || 0} / {vrfStats?.totalRequests || 0}</span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* VRF Health Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-green-400" />
            VRF Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Network</div>
              <div className="text-white font-mono">{vrfHealth?.network || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <Badge variant={vrfHealth?.status === 'healthy' ? 'default' : 'destructive'}>
                {vrfHealth?.status || 'Unknown'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Subscription ID</div>
              <div className="text-white font-mono">{vrfHealth?.subscriptionId || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Confirmations</div>
              <div className="text-white font-mono">{vrfHealth?.requestConfirmations || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Purposes */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            VRF Request Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vrfStats?.purposes && Object.entries(vrfStats.purposes).map(([purpose, count]) => (
              <div key={purpose} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-white capitalize">{purpose.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{count} requests</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => requestRandomness(purpose)}
                    className="text-xs"
                  >
                    Request
                  </Button>
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
            Recent VRF Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vrfStats?.recentRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {request.fulfilled ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-yellow-400" />
                  )}
                  <div>
                    <div className="text-white text-sm font-medium capitalize">
                      {request.purpose.replace('_', ' ')}
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
                    {request.fulfilled ? 'Fulfilled' : 'Pending'}
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