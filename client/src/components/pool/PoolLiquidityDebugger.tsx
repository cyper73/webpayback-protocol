import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Wrench,
  Zap,
  TrendingUp
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PoolDebugInfo {
  poolAddress: string;
  tokenA: {
    address: string;
    symbol: string;
    balance: string;
    allowance: string;
    decimals: number;
  };
  tokenB: {
    address: string;
    symbol: string;
    balance: string;
    allowance: string;
    decimals: number;
  };
  poolStatus: {
    exists: boolean;
    fee: string;
    liquidity: string;
    tickSpacing: number;
  };
  gasEstimates: {
    approve: string;
    addLiquidity: string;
  };
  recommendations: string[];
}

export default function PoolLiquidityDebugger() {
  const [walletAddress, setWalletAddress] = useState("0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba");
  const [wmaticAmount, setWmaticAmount] = useState("10");
  const [wptAmount, setWptAmount] = useState("1000");
  const [slippage, setSlippage] = useState("3");
  const [liquidityParams, setLiquidityParams] = useState<any>(null);

  const { data: debugInfo, isLoading, refetch } = useQuery<{
    success: boolean;
    debugInfo: PoolDebugInfo;
  }>({
    queryKey: ['/api/web3/pool-debug', walletAddress],
    enabled: walletAddress.length === 42,
  });

  const { data: instructions } = useQuery<{
    success: boolean;
    instructions: string[];
  }>({
    queryKey: ['/api/web3/pool-instructions'],
  });

  const generateLiquidityParams = async () => {
    try {
      const response = await apiRequest('/api/web3/generate-liquidity-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wmaticAmount: parseFloat(wmaticAmount),
          wptAmount: parseFloat(wptAmount),
          walletAddress,
          slippageTolerance: parseFloat(slippage)
        })
      });
      setLiquidityParams(response.params);
    } catch (error) {
      console.error('Failed to generate liquidity params:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <span>Pool Liquidity Debugger</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Wrench className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Pool Liquidity Debugger</h2>
        <Badge variant="destructive">Gas Error Fix</Badge>
      </div>

      {/* Error Analysis */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Problema Identificato:</strong> "Unpredictable gas limit" su Uniswap indica problemi con 
          l'approvazione dei token o parametri della transazione. Seguire le soluzioni sotto.
        </AlertDescription>
      </Alert>

      {/* Wallet Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Wallet Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1"
            />
            <Button onClick={() => refetch()} variant="outline">
              Debug
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Results */}
      {debugInfo?.debugInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Token Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Token Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* WMATIC */}
              <div className="p-3 bg-blue-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">WMATIC</span>
                  <Badge variant="outline">52.86 WMATIC</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Address: {debugInfo.debugInfo.tokenA.address.slice(0, 8)}...</div>
                  <div className="flex items-center space-x-1">
                    <span>Approval Status:</span>
                    <Badge variant="destructive">Not Approved</Badge>
                  </div>
                </div>
              </div>

              {/* WPT */}
              <div className="p-3 bg-purple-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">WPT</span>
                  <Badge variant="outline">511,274 WPT</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Address: {debugInfo.debugInfo.tokenB.address.slice(0, 8)}...</div>
                  <div className="flex items-center space-x-1">
                    <span>Approval Status:</span>
                    <Badge variant="destructive">Not Approved</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pool Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span>Pool Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pool Address:</span>
                  <span className="font-mono text-sm">
                    {debugInfo.debugInfo.poolAddress.slice(0, 8)}...
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-1 h-6 w-6 p-0"
                      onClick={() => copyToClipboard(debugInfo.debugInfo.poolAddress)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fee Tier:</span>
                  <Badge variant="outline">{debugInfo.debugInfo.poolStatus.fee}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Pool Status:</span>
                  <Badge variant={debugInfo.debugInfo.poolStatus.exists ? "default" : "destructive"}>
                    {debugInfo.debugInfo.poolStatus.exists ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Gas Estimate:</span>
                  <Badge variant="outline">{debugInfo.debugInfo.gasEstimates.addLiquidity}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liquidity Parameters Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-green-500" />
            <span>Generate Optimal Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">WMATIC Amount</label>
              <Input
                type="number"
                value={wmaticAmount}
                onChange={(e) => setWmaticAmount(e.target.value)}
                placeholder="10"
              />
            </div>
            <div>
              <label className="text-sm font-medium">WPT Amount</label>
              <Input
                type="number"
                value={wptAmount}
                onChange={(e) => setWptAmount(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slippage %</label>
              <Input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                placeholder="3"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateLiquidityParams} className="w-full">
                Generate
              </Button>
            </div>
          </div>

          {liquidityParams && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <h4 className="font-medium mb-2">Optimized Parameters:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Amount0 Desired: {(BigInt(liquidityParams.amount0Desired) / BigInt(1e18)).toString()}</div>
                <div>Amount1 Desired: {(BigInt(liquidityParams.amount1Desired) / BigInt(1e18)).toString()}</div>
                <div>Amount0 Min: {(BigInt(liquidityParams.amount0Min) / BigInt(1e18)).toString()}</div>
                <div>Amount1 Min: {(BigInt(liquidityParams.amount1Min) / BigInt(1e18)).toString()}</div>
                <div>Fee: {liquidityParams.fee / 10000}%</div>
                <div>Deadline: {new Date(liquidityParams.deadline * 1000).toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step-by-Step Instructions */}
      {instructions?.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Step-by-Step Solution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instructions.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-sm">{instruction}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {debugInfo?.debugInfo?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Critical Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.debugInfo.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{rec}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4 text-purple-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://app.uniswap.org/', '_blank')}
            >
              Open Uniswap
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard("0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba")}
            >
              Copy Wallet Address
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard("0x9408f17a8b4666f8cb8231ba213de04137dc3825")}
            >
              Copy WPT Address
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://polygonscan.com/address/0x1FF3b523ab413abFF55F409Ff4602C53e4fE70cd', '_blank')}
            >
              View Pool on PolygonScan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}