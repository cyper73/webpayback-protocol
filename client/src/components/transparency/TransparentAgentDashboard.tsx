/**
 * Transparent Agent Dashboard Component
 * Shows privacy compliance monitoring and transparency metrics
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Eye, FileText, CheckCircle, AlertTriangle, Globe, Users } from 'lucide-react';

const TransparentAgentDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/transparency/stats'],
    refetchInterval: 30000
  });

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/transparency/report'],
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 240000 // Consider stale after 4 minutes
  });

  if (statsLoading && reportLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-pulse flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Loading Transparent Agent...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const complianceStats = stats?.stats;
  const transparencyReport = reportData?.report;

  return (
    <div className="space-y-6">
      {/* Agent Status Header */}
      <Card className="glass-card border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Transparent Agent (Level 280)</CardTitle>
                <CardDescription>Privacy Compliance & Transparency Monitor</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                98.9% Accuracy
              </Badge>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Statistics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Privacy Compliance Stats
            </CardTitle>
            <CardDescription>Real-time compliance monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceStats ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Compliance Rate</span>
                  <span className="text-lg font-bold text-green-400">
                    {complianceStats.complianceRate.toFixed(1)}%
                  </span>
                </div>
                
                <Progress value={complianceStats.complianceRate} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Checks</span>
                    <div className="font-mono font-semibold">{complianceStats.totalComplianceChecks}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recent Checks</span>
                    <div className="font-mono font-semibold">{complianceStats.recentChecks}</div>
                  </div>
                </div>

                {/* Jurisdiction Breakdown */}
                {complianceStats.jurisdictionBreakdown && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Jurisdiction Activity</h4>
                    <div className="space-y-1">
                      {Object.entries(complianceStats.jurisdictionBreakdown).map(([jurisdiction, count]) => (
                        <div key={jurisdiction} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            {jurisdiction === 'EU' && '🇪🇺'}
                            {jurisdiction === 'US' && '🇺🇸'}
                            {jurisdiction === 'OTHER' && '🌍'}
                            {jurisdiction}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                No compliance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transparency Report */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Transparency Report
            </CardTitle>
            <CardDescription>Latest transparency assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transparencyReport ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Status</span>
                  <div className="flex items-center gap-2">
                    {transparencyReport.complianceStatus === 'COMPLIANT' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <Badge 
                      variant={transparencyReport.complianceStatus === 'COMPLIANT' ? 'secondary' : 'destructive'}
                    >
                      {transparencyReport.complianceStatus}
                    </Badge>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">GDPR Compliance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={transparencyReport.metrics.gdprCompliance} className="h-1 flex-1" />
                      <span className="font-mono">{transparencyReport.metrics.gdprCompliance.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">CCPA Compliance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={transparencyReport.metrics.ccpaCompliance} className="h-1 flex-1" />
                      <span className="font-mono">{transparencyReport.metrics.ccpaCompliance.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground">Transparency</span>
                    <div className="flex items-center gap-2">
                      <Progress value={transparencyReport.metrics.transparencyScore} className="h-1 flex-1" />
                      <span className="font-mono">{transparencyReport.metrics.transparencyScore.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground">User Rights</span>
                    <div className="flex items-center gap-2">
                      <Progress value={transparencyReport.metrics.userRightsAvailability} className="h-1 flex-1" />
                      <span className="font-mono">{transparencyReport.metrics.userRightsAvailability.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {transparencyReport.recommendations && transparencyReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recommendations</h4>
                    <div className="space-y-1">
                      {transparencyReport.recommendations.slice(0, 2).map((recommendation, index) => (
                        <div key={index} className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                          • {recommendation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Report ID: {transparencyReport.reportId}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                Generating transparency report...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            Transparent Agent Actions
          </CardTitle>
          <CardDescription>Privacy compliance and transparency tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              View Full Report
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Export Audit Log
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransparentAgentDashboard;