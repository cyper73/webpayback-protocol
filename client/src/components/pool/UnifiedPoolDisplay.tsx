import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PoolInfo {
  poolAddress: string;
  token0: string;
  token1: string;
  version: string;
  poolType: string;
  totalValueLocked: string;
  volume24h: string;
  price: string;
  participants: number;
  fee: string;
  lastUpdated: number;
  dataSource: string;
}

interface NetworkStatus {
  chainId: number;
  networkName: string;
  explorerUrl: string;
}

export default function UnifiedPoolDisplay() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get both pools data
  const { data: usdtPoolInfo } = useQuery<PoolInfo>({
    queryKey: ['/api/web3/pool-info?type=usdt'],
    refetchInterval: 30000
  });

  const { data: wmaticPoolInfo } = useQuery<PoolInfo>({
    queryKey: ['/api/web3/pool-info?type=wmatic'],
    refetchInterval: 30000
  });

  const { data: networkStatus } = useQuery<NetworkStatus>({
    queryKey: ['/api/web3/network-status']
  });

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiRequest('/api/web3/refresh-pools', 'POST');
      // Refresh after 2 seconds to allow backend processing
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to refresh pools:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minuti fa`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} ore fa`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const poolsData = [
    usdtPoolInfo ? {
      ...usdtPoolInfo,
      name: "USDT/WPT Uniswap V2",
      subtitle: "Pool Primaria - Senza 'Out of Range'",
      isPrimary: true,
      status: "active",
      statusColor: "bg-green-500",
      description: "Pool V2 a range completo con USDT stabile"
    } : null,
    wmaticPoolInfo ? {
      ...wmaticPoolInfo,
      name: "WMATIC/WPT Uniswap V3",
      subtitle: "Pool Secondaria - Range Concentrata",
      isPrimary: false,
      status: "out_of_range",
      statusColor: "bg-yellow-500",
      description: "Pool V3 con liquidità concentrata"
    } : null
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Liquidity Pools Monitor</h2>
          <p className="text-gray-500">Monitoraggio completo di tutte le pool WebPayback</p>
        </div>
        <Button 
          onClick={handleForceRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Aggiorna Dati
        </Button>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {poolsData.map((pool, index) => {
          if (!pool) return null;
          return (
          <Card 
            key={pool.poolAddress} 
            className={`relative ${pool.isPrimary ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300'}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {pool.name}
                    {pool.isPrimary && (
                      <Badge variant="default" className="bg-blue-600">
                        PRIMARIA
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {pool.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${pool.statusColor}`} />
                  <Badge variant="outline" className="text-xs">
                    {pool.version}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pool Address - Full ID */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pool Address (ID Completo):</span>
                  {networkStatus && (
                    <a 
                      href={`${networkStatus.explorerUrl}/address/${pool.poolAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs break-all">
                  {pool.poolAddress}
                </div>
              </div>

              {/* Pool Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">TVL</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {pool.totalValueLocked || "$0"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Volume 24h</span>
                  </div>
                  <div className="text-lg font-bold">
                    {pool.volume24h || "$0"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Prezzo</span>
                  </div>
                  <div className="text-sm font-mono">
                    {pool.price} {pool.token0 === 'USDT' ? 'USDT/WPT' : 'WMATIC/WPT'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Partecipanti</span>
                  </div>
                  <div className="text-lg font-bold">
                    {pool.participants || 0}
                  </div>
                </div>
              </div>

              {/* Pool Details */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Fee Tier:</span>
                    <div className="font-medium">{pool.fee}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Pair:</span>
                    <div className="font-medium">{pool.token0}/{pool.token1}</div>
                  </div>
                </div>
              </div>

              {/* Status and Last Update */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {pool.status === 'active' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="capitalize">
                      {pool.status === 'active' ? 'Attiva' : 'Fuori Range'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    {pool.lastUpdated && formatLastUpdate(pool.lastUpdated)}
                  </div>
                </div>
              </div>

              {/* Pool Description */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                {pool.description}
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      {/* Data Source Info */}
      <Card className="border-gray-300">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Dati autentici dalla blockchain Polygon</span>
            </div>
            <Badge variant="outline">
              Refresh ogni 12 ore
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}