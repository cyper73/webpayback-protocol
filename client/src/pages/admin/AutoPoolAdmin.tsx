import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, AlertTriangle, Activity, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AutoPoolAdmin() {
  const { toast } = useToast();
  const authToken = localStorage.getItem("admin_token") || "";

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["/api/auto-pool-manager/status"],
    queryFn: async () => {
      const response = await fetch("/api/auto-pool-manager/status", {
        headers: { "Authorization": authToken }
      });
      return response.json();
    },
    enabled: !!authToken,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const emergencyStopMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auto-pool-manager/emergency-stop", {
        method: "POST",
        headers: { "Authorization": authToken }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🚨 Emergency Stop Activated",
        description: "All automated operations halted"
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "❌ Emergency stop failed",
        description: "Operation failed",
        variant: "destructive"
      });
    }
  });

  if (!authToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 border border-white/20 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">Admin authentication required</p>
            <Button onClick={() => window.location.href = "/admin"} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Auto Pool Manager</h1>
          <p className="text-gray-300">Automated liquidity pool management system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card className="bg-white/10 border border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-gray-400">Loading status...</div>
              ) : status?.success ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Status</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      {status.status.currentMode}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Pools Managed</span>
                    <span className="text-white font-semibold">{status.status.poolsManaged}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Gas Saved</span>
                    <span className="text-green-400 font-semibold">{status.status.totalGasSaved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Balance Threshold</span>
                    <span className="text-white">{status.status.balanceThreshold}</span>
                  </div>
                </div>
              ) : (
                <div className="text-red-400">Failed to load status</div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card className="bg-red-500/10 border border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Controls
              </CardTitle>
              <CardDescription className="text-red-200">
                Critical system controls - use with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => emergencyStopMutation.mutate()}
                disabled={emergencyStopMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {emergencyStopMutation.isPending ? "Stopping..." : "Emergency Stop"}
              </Button>
              <p className="text-red-200 text-xs mt-2">
                This will halt all automated pool operations immediately
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pool List */}
        {status?.success && status.pools && (
          <Card className="mt-6 bg-white/10 border border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Managed Pools</CardTitle>
              <CardDescription className="text-gray-300">
                Currently monitored liquidity pools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {status.pools.map((pool: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <div className="text-white font-semibold">{pool.name}</div>
                      <div className="text-gray-400 text-sm">{pool.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{pool.tvl}</div>
                      <Badge 
                        variant="secondary" 
                        className={
                          pool.status === "optimal" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {pool.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => window.location.href = "/admin"}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}