import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Clock } from "lucide-react";
import { BlockchainNetwork } from "@shared/schema";

interface MultiChainDeploymentProps {
  networks: BlockchainNetwork[];
}

const networkIcons = {
  Ethereum: "fab fa-ethereum",
  BSC: "fas fa-coins",
  Polygon: "fas fa-gem",
  Arbitrum: "fas fa-layer-group",
};

const networkColors = {
  Ethereum: "border-blue-500/30",
  BSC: "border-amber-500/30",
  Polygon: "border-purple-500/30",
  Arbitrum: "border-blue-600/30",
};

const statusColors = {
  deployed: "text-neon-green bg-neon-green/20",
  deploying: "text-amber-400 bg-amber-400/20",
  pending: "text-gray-400 bg-gray-600/20",
  failed: "text-red-400 bg-red-400/20",
};

export default function MultiChainDeployment({ networks }: MultiChainDeploymentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deployingNetwork, setDeployingNetwork] = useState<string | null>(null);

  const deployMutation = useMutation({
    mutationFn: async (networkName: string) => {
      const network = networks.find(n => n.name === networkName);
      if (!network) throw new Error("Network not found");
      
      const response = await apiRequest("POST", "/api/blockchain/deploy", {
        name: network.name,
        chainId: network.chainId,
        rpcUrl: network.rpcUrl,
        deploymentStatus: "deploying"
      });
      return response.json();
    },
    onSuccess: (data, networkName) => {
      setDeployingNetwork(null);
      toast({
        title: "Deployment Successful",
        description: `${networkName} token deployed successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
    },
    onError: (error, networkName) => {
      setDeployingNetwork(null);
      toast({
        title: "Deployment Failed",
        description: `Failed to deploy ${networkName} token: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeploy = (networkName: string) => {
    setDeployingNetwork(networkName);
    deployMutation.mutate(networkName);
  };

  const getNextDeployableNetwork = () => {
    return networks.find(n => n.deploymentStatus === "pending");
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "deployed": return 100;
      case "deploying": return 75;
      case "pending": return 0;
      case "failed": return 0;
      default: return 0;
    }
  };

  return (
    <Card className="glass-card rounded-2xl shadow-neon-blue">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text">Multi-Chain Token Deployment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="blockchain-grid rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {networks.map((network) => {
              const iconClass = networkIcons[network.name as keyof typeof networkIcons] || "fas fa-circle";
              const colorClass = networkColors[network.name as keyof typeof networkColors] || "border-gray-500/30";
              const statusClass = statusColors[network.deploymentStatus as keyof typeof statusColors] || "text-gray-400 bg-gray-400/20";
              
              return (
                <Card key={network.id} className={`glass-card rounded-lg ${colorClass}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <i className={`${iconClass} text-lg`}></i>
                        <span className="font-semibold">{network.name}</span>
                      </div>
                      <Badge className={`text-xs ${statusClass}`}>
                        {network.deploymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {network.deploymentStatus === "deployed" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Contract:</span>
                            <span className="font-mono text-xs">
                              {network.contractAddress?.slice(0, 6)}...{network.contractAddress?.slice(-4)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Supply:</span>
                            <span>1,000,000 WPT</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Gas Used:</span>
                            <span>{network.gasUsed || "N/A"}</span>
                          </div>
                        </>
                      )}
                      
                      {network.deploymentStatus === "deploying" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span>Deploying...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Progress:</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="w-full h-2" />
                        </>
                      )}
                      
                      {network.deploymentStatus === "pending" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Estimated Gas:</span>
                            <span>
                              {network.name === "Ethereum" && "0.05 ETH"}
                              {network.name === "BSC" && "0.001 BNB"}
                              {network.name === "Polygon" && "0.001 MATIC"}
                              {network.name === "Arbitrum" && "0.002 ETH"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">ETA:</span>
                            <span>
                              {network.name === "Ethereum" && "30 seconds"}
                              {network.name === "BSC" && "15 seconds"}
                              {network.name === "Polygon" && "10 seconds"}
                              {network.name === "Arbitrum" && "20 seconds"}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {network.deploymentStatus === "failed" && (
                        <div className="text-red-400 text-xs">
                          Deployment failed. Please try again.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              const nextNetwork = getNextDeployableNetwork();
              if (nextNetwork) {
                handleDeploy(nextNetwork.name);
              }
            }}
            disabled={deployMutation.isPending || !getNextDeployableNetwork()}
            className="bg-electric-blue hover:bg-electric-blue/80 text-white font-medium transition-colors"
          >
            <Rocket className="mr-2 h-4 w-4" />
            {deployMutation.isPending ? "Deploying..." : "Deploy Next Chain"}
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              Estimated completion: {networks.filter(n => n.deploymentStatus === "pending").length * 2} minutes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
