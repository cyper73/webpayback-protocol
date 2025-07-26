import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, SearchCheck, Layers, Shield } from "lucide-react";
import { AiAgent } from "@shared/schema";

interface AgentCardProps {
  agent: AiAgent;
}

const agentIcons = {
  webpayback: Brain,
  autoregolator: SearchCheck,
  poolagent: Layers,
  transparentagent: Shield,
};

const agentColors = {
  webpayback: "text-electric-blue border-electric-blue/30 shadow-neon-blue",
  autoregolator: "text-neon-green border-neon-green/30 shadow-neon-green",
  poolagent: "text-cyber-purple border-cyber-purple/30 shadow-neon-purple",
  transparentagent: "text-amber-400 border-amber-400/30 shadow-lg",
};

const agentDescriptions = {
  webpayback: "Protocol orchestration and token economics",
  autoregolator: "AI tracking and fair distribution algorithms",
  poolagent: "Liquidity management and reward mechanisms",
  transparentagent: "Legal compliance and automated auditing",
};

export default function AgentCard({ agent }: AgentCardProps) {
  const Icon = agentIcons[agent.type as keyof typeof agentIcons] || Brain;
  const colorClass = agentColors[agent.type as keyof typeof agentColors] || "text-gray-400";
  const description = agentDescriptions[agent.type as keyof typeof agentDescriptions] || "AI Agent";

  const metrics = agent.metrics as any || {};

  return (
    <Card className={`glass-card rounded-xl ${colorClass}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{agent.name}</h3>
          <Icon className="text-lg floating-animation" />
        </div>
        
        <p className="text-sm text-gray-300 mb-3">{description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Status</span>
            <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-xs">
              {agent.status}
            </Badge>
          </div>
          
          <div className="flex justify-between text-xs">
            <span>Tasks Completed</span>
            <span className="text-neon-green">{metrics.tasksCompleted || 0}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span>Accuracy</span>
            <span className="text-neon-green">{metrics.accuracy || 0}%</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span>Expertise Level</span>
            <span className="text-amber-400">{agent.expertiseLevel}/280</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
