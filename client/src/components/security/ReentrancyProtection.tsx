import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Zap, Target, Activity } from "lucide-react";

interface ReentrancyStats {
  totalChecks: number;
  blockedAttempts: number;
  flaggedTransactions: number;
  avgCallDepth: number;
  isActive: boolean;
  protectionHealth: string;
  riskPatterns: {
    infiniteLoops: number;
    callbackExploits: number;
    fundDrainage: number;
    gasGriefing: number;
  };
}

const ReentrancyProtection: React.FC = () => {
  const [stats, setStats] = useState<ReentrancyStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carica statistiche
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/reentrancy/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (err) {
        setError('Failed to load reentrancy protection stats');
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh ogni 30 secondi
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Reentrancy Protection</h2>
        </div>
        <Badge variant={stats?.isActive ? "default" : "destructive"}>
          {stats?.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
              Total Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalChecks || 0}
            </div>
            <p className="text-xs text-gray-600">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Blocked Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.blockedAttempts || 0}
            </div>
            <p className="text-xs text-gray-600">Reentrancy attacks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
              Flagged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.flaggedTransactions || 0}
            </div>
            <p className="text-xs text-gray-600">Suspicious transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500" />
              Avg Call Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.avgCallDepth?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-gray-600">Function calls</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReentrancyProtection;