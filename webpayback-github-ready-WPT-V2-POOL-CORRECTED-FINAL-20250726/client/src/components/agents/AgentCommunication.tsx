import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, SearchCheck, Layers, Shield } from "lucide-react";

const agentIcons = {
  webpayback: Brain,
  autoregolator: SearchCheck,
  poolagent: Layers,
  transparentagent: Shield,
};

const agentColors = {
  webpayback: "text-electric-blue bg-electric-blue/20",
  autoregolator: "text-neon-green bg-neon-green/20",
  poolagent: "text-cyber-purple bg-cyber-purple/20",
  transparentagent: "text-amber-400 bg-amber-400/20",
};

export default function AgentCommunication() {
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ["/api/agents/communications"],
    refetchInterval: 30000, // Refresh every 30 seconds to reduce interruptions
  });

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text">Live Agent Collaboration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {communications.map((comm: any) => {
            const Icon = agentIcons[comm.fromAgent?.type as keyof typeof agentIcons] || Brain;
            const colorClass = agentColors[comm.fromAgent?.type as keyof typeof agentColors] || "text-gray-400 bg-gray-400/20";
            
            return (
              <div key={comm.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                  <Icon className="text-sm" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">{comm.fromAgent?.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comm.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{comm.message}</p>
                </div>
              </div>
            );
          })}
          
          {communications.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No agent communications yet. Agents will start collaborating once initialized.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
