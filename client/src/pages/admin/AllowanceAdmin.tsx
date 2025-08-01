import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AllowanceAdmin() {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState("[WALLET_ADDRESS_FROM_ENV]");
  
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
                Admin Access Control
              </CardTitle>
              <CardDescription className="text-gray-300">
                Secure administration of token allowance system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white">Authentication Status</span>
                </div>
                <Badge variant="default">Authenticated</Badge>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={() => testMutation.mutate()}
                  disabled={testMutation.isPending}
                  className="w-full"
                >
                  {testMutation.isPending ? "Testing..." : "Test Access"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}