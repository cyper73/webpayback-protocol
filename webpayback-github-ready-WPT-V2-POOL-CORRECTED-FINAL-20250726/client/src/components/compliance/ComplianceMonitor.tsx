import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplianceRecord } from "@shared/schema";

interface ComplianceMonitorProps {
  compliance: ComplianceRecord[];
}

export default function ComplianceMonitor({ compliance = [] }: ComplianceMonitorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-neon-green/20 text-neon-green";
      case "non_compliant":
        return "bg-red-400/20 text-red-400";
      case "under_review":
        return "bg-amber-400/20 text-amber-400";
      default:
        return "bg-gray-400/20 text-gray-400";
    }
  };

  // Mock compliance data if none provided
  const mockCompliance = compliance.length > 0 ? compliance : [
    {
      id: 1,
      auditType: "security",
      status: "compliant",
      score: "98.7",
      auditedAt: new Date().toISOString(),
      auditedBy: "SecurityAudit AI"
    },
    {
      id: 2,
      auditType: "legal",
      status: "compliant",
      score: "99.2",
      auditedAt: new Date().toISOString(),
      auditedBy: "LegalCompliance AI"
    },
    {
      id: 3,
      auditType: "transparency",
      status: "compliant",
      score: "97.8",
      auditedAt: new Date().toISOString(),
      auditedBy: "TransparencyAudit AI"
    }
  ];

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text">Legal Compliance Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-amber-400">Regulatory Status</h4>
              <Badge className="text-xs bg-neon-green/20 text-neon-green">COMPLIANT</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">License Type:</span>
                <span>MIT Open Source</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Audit Score:</span>
                <span className="text-neon-green">A+</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Review:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-electric-blue">Transparency Index</h4>
              <Badge className="text-xs bg-electric-blue/20 text-electric-blue">98.7%</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Public Transactions:</span>
                <span>2,847,392</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Open Source Code:</span>
                <span className="text-neon-green">100%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Community Governance:</span>
                <span className="text-amber-400">Active</span>
              </div>
            </div>
          </div>
          
          <div className="bg-glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-red-400">Risk Assessment</h4>
              <Badge className="text-xs bg-neon-green/20 text-neon-green">LOW</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fraud Detection:</span>
                <span className="text-neon-green">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Anomaly Score:</span>
                <span className="text-neon-green">0.03%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Security Rating:</span>
                <span className="text-amber-400">AA</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
