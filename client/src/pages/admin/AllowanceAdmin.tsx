import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AllowanceAdmin() {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState("0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba");
  
  const authToken = localStorage.getItem("admin_token") || "";

  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/allowance/config", selectedWallet],
    queryFn: async () => {
      const response = await fetch(`/api/allowance/config/${selectedWallet}`, {
        headers: { "Authorization": authToken }
      });
      return response.json();
    },
    enabled: !!authToken
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/allowance/config/${selectedWallet}`, {
        headers: { "Authorization": authToken }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Access granted",
        description: "Allowance module working correctly"
      });
    },
    onError: () => {
      toast({
        title: "❌ Access denied",
        description: "Authentication required",
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Allowance Management</h1>
          <p className="text-gray-300">Founder wallet token allowance administration</p>
        </div>

        <div className="grid gap-6">
          {/* Status Card */}
          <Card className="bg-white/10 border border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <span className="text-gray-300">Admin access authenticated</span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Configuration */}
          <Card className="bg-white/10 border border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Founder Wallet Configuration</CardTitle>
              <CardDescription className="text-gray-300">
                Current wallet: {selectedWallet}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending || isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {testMutation.isPending ? "Testing..." : "Test Allowance Access"}
              </Button>
              
              {config && (
                <div className="p-4 bg-black/20 rounded-lg">
                  <pre className="text-green-400 text-sm overflow-auto">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-orange-500/10 border border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <h3 className="text-orange-400 font-semibold">Security Notice</h3>
                  <p className="text-orange-200 text-sm">
                    This module manages founder wallet allowances. Only authorized admin users can access these functions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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