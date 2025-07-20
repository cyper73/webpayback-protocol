import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Eye, TrendingUp, Users, Ban } from "lucide-react";
// Removed useTranslations import

interface FraudRule {
  id: number;
  ruleName: string;
  ruleType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  parameters: any;
}

interface FraudDetectionRulesProps {
  rules?: FraudRule[];
}

const FRAUD_RULES = [
  {
    id: 1,
    ruleName: "Domain/IP Limits",
    ruleType: "domain_limit",
    description: "Limits to prevent attacks from single domain or IP",
    severity: "high" as const,
    isActive: true,
    parameters: {
      maxDailyAccessesPerDomain: 500,
      maxDailyAccessesPerIP: 200,
      maxDomainConcentration: 90,
      maxIPConcentration: 85
    }
  },
  {
    id: 2,
    ruleName: "Proof of Personhood",
    ruleType: "pattern_analysis",
    description: "Verifies diversity and authenticity of AI requests",
    severity: "medium" as const,
    isActive: true,
    parameters: {
      minAIModelDiversity: 2,
      minEntropyScore: 0.3,
      maxIdenticalRequests: 20,
      minTimeSpread: 3600
    }
  },
  {
    id: 3,
    ruleName: "Suspicious Pattern Analysis",
    ruleType: "pattern_analysis",
    description: "Detects auto-farming and coordinated bot patterns",
    severity: "high" as const,
    isActive: true,
    parameters: {
      maxBurstRequests: 50,
      burstTimeWindow: 600,
      maxRepeatedPatterns: 10,
      minHumanLikeVariation: 0.2
    }
  },
  {
    id: 4,
    ruleName: "Reward Thresholds",
    ruleType: "threshold_check",
    description: "Threshold controls for legitimate rewards",
    severity: "medium" as const,
    isActive: true,
    parameters: {
      minDailyRewardThreshold: 0.1,
      maxDailyRewardThreshold: 100,
      minWeeklyEntropy: 0.3,
      maxSuspiciousScore: 80
    }
  },
  {
    id: 5,
    ruleName: "Reputation System",
    ruleType: "reputation_check",
    description: "Reputation management and penalties for creators",
    severity: "critical" as const,
    isActive: true,
    parameters: {
      minReputationScore: 20,
      maxFraudCount: 5,
      penaltyMultiplier: 0.3,
      trustScoreThreshold: 60
    }
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getRuleIcon = (ruleType: string) => {
  switch (ruleType) {
    case 'domain_limit':
      return <Shield className="h-4 w-4" />;
    case 'pattern_analysis':
      return <Eye className="h-4 w-4" />;
    case 'threshold_check':
      return <TrendingUp className="h-4 w-4" />;
    case 'reputation_check':
      return <Users className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

export default function FraudDetectionRules({ rules = FRAUD_RULES }: FraudDetectionRulesProps) {
  
  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <Ban className="h-4 w-4" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>WARNING TO FRAUDSTERS!</strong> WebPayback system has advanced protections against fraud and manipulation.
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Sybil attacks and auto-farming will be banned automatically</li>
            <li>Traffic concentration from single IP/domain is monitored</li>
            <li>Suspicious patterns of coordinated bots are detected in real-time</li>
            <li>Repeated violations result in permanent system exclusion</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Fraud Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getRuleIcon(rule.ruleType)}
                    <div>
                      <h3 className="font-semibold text-sm">{rule.ruleName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getSeverityColor(rule.severity)} text-white border-0`}
                  >
                    {rule.severity.toUpperCase()}
                  </Badge>
                </div>

                {/* Rule Parameters */}
                <div className="mt-3 pl-7">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {rule.ruleType === 'domain_limit' && (
                      <>
                        <div>• Max daily accesses per domain: {rule.parameters.maxDailyAccessesPerDomain}</div>
                        <div>• Max daily accesses per IP: {rule.parameters.maxDailyAccessesPerIP}</div>
                        <div>• Max domain concentration: {rule.parameters.maxDomainConcentration}%</div>
                        <div>• Max IP concentration: {rule.parameters.maxIPConcentration}%</div>
                      </>
                    )}
                    {rule.ruleType === 'pattern_analysis' && rule.parameters.minAIModelDiversity && (
                      <>
                        <div>• Min AI model diversity: {rule.parameters.minAIModelDiversity}</div>
                        <div>• Min entropy score: {rule.parameters.minEntropyScore}</div>
                        <div>• Max identical requests: {rule.parameters.maxIdenticalRequests}</div>
                        <div>• Min time spread: {rule.parameters.minTimeSpread}s</div>
                      </>
                    )}
                    {rule.ruleType === 'pattern_analysis' && rule.parameters.maxBurstRequests && (
                      <>
                        <div>• Max burst requests: {rule.parameters.maxBurstRequests}</div>
                        <div>• Burst time window: {rule.parameters.burstTimeWindow}s</div>
                        <div>• Max repeated patterns: {rule.parameters.maxRepeatedPatterns}</div>
                        <div>• Min human-like variation: {rule.parameters.minHumanLikeVariation}</div>
                      </>
                    )}
                    {rule.ruleType === 'threshold_check' && (
                      <>
                        <div>• Min daily reward threshold: {rule.parameters.minDailyRewardThreshold} WPT</div>
                        <div>• Max daily reward threshold: {rule.parameters.maxDailyRewardThreshold} WPT</div>
                        <div>• Min weekly entropy: {rule.parameters.minWeeklyEntropy}</div>
                        <div>• Max suspicious score: {rule.parameters.maxSuspiciousScore}%</div>
                      </>
                    )}
                    {rule.ruleType === 'reputation_check' && (
                      <>
                        <div>• Min reputation score: {rule.parameters.minReputationScore}</div>
                        <div>• Max fraud count before ban: {rule.parameters.maxFraudCount}</div>
                        <div>• Penalty multiplier: {rule.parameters.penaltyMultiplier}x</div>
                        <div>• Trust score threshold: {rule.parameters.trustScoreThreshold}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
How the System Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium">Real-time Monitoring</p>
                <p className="text-muted-foreground">
                  Every AI access is analyzed for suspicious patterns, IP/domain concentration and request diversity.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="font-medium">Intelligent Scoring</p>
                <p className="text-muted-foreground">
                  The system calculates a risk score based on multiple metrics and anomalous behaviors.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div>
                <p className="font-medium">Automatic Actions</p>
                <p className="text-muted-foreground">
                  Rewards blocked, reputation penalties and alerts generated automatically for suspicious activities.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <div>
                <p className="font-medium">Total Transparency</p>
                <p className="text-muted-foreground">
                  All controls are visible and documented to ensure a fair and transparent system.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}