import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Network, Globe } from "lucide-react";

export default function NetworkSwitcher() {
  const [selectedNetwork, setSelectedNetwork] = useState<'polygon' | 'ethereum'>('polygon');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const switchNetworkMutation = useMutation({
    mutationFn: async (network: 'polygon' | 'ethereum') => {
      return apiRequest('POST', '/api/web3/switch-network', { network });
    },
    onSuccess: (data) => {
      toast({
        title: "Network Changed",
        description: `Now using ${selectedNetwork === 'ethereum' ? 'Ethereum Mainnet' : 'Polygon'} network`,
      });
      
      // Invalidate all web3 queries to update data
      queryClient.invalidateQueries({ queryKey: ['/api/web3/token-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/pool-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/network-status'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Unable to switch network",
        variant: "destructive"
      });
    }
  });

  const handleNetworkSwitch = () => {
    switchNetworkMutation.mutate(selectedNetwork);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="text-electric-blue" />
          <span>Blockchain Network</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Network</label>
            <Badge variant="outline" className="w-full justify-center">
              <Network className="w-4 h-4 mr-2" />
              Polygon
            </Badge>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Switch Network</label>
            <div className="space-y-2">
              <Button
                variant={selectedNetwork === 'polygon' ? 'default' : 'outline'}
                onClick={() => setSelectedNetwork('polygon')}
                className="w-full justify-start"
              >
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Polygon
              </Button>
              <Button
                variant={selectedNetwork === 'ethereum' ? 'default' : 'outline'}
                onClick={() => setSelectedNetwork('ethereum')}
                className="w-full justify-start"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Ethereum Mainnet
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleNetworkSwitch}
            disabled={switchNetworkMutation.isPending}
            className="w-full"
          >
            {switchNetworkMutation.isPending ? 'Switching...' : 'Switch Network'}
          </Button>
          
          <div className="text-sm text-gray-400">
            <p>
              <strong>Polygon:</strong> WPT token currently active
            </p>
            <p>
              <strong>Ethereum:</strong> Ready for when WPT launches on mainnet
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}