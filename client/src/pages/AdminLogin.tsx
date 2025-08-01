import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, Lock, Settings, Database } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required")
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("admin_token");
    return !!token;
  });
  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem("admin_token") || "";
  });
  const { toast } = useToast();

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginForm) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsAuthenticated(true);
      setAuthToken(data.token);
      localStorage.setItem("admin_token", data.token);
      toast({
        title: "✅ Login OK",
        description: "Admin access granted"
      });
    },
    onError: () => {
      toast({
        title: "❌ Login failed",
        description: "Check credentials",
        variant: "destructive"
      });
    }
  });

  const testModuleMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      const response = await fetch(endpoint, {
        headers: {
          "Authorization": authToken
        }
      });
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Module OK",
        description: "Access working"
      });
    },
    onError: () => {
      toast({
        title: "❌ Module failed",
        description: "Access denied",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AdminLoginForm) => {
    loginMutation.mutate(data);
  };

  const testModule = (endpoint: string) => {
    testModuleMutation.mutate(endpoint);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setAuthToken("");
    toast({
      title: "🔓 Logged out",
      description: "Admin session ended"
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
            <CardDescription className="text-gray-300">
              Login to access Allowance Management and Auto Pool Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter username"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter password"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={loginMutation.isPending}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Access to protected modules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allowance Management */}
          <Card className="bg-white/10 border border-white/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Allowance Management</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage token allowances and founder access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => window.location.href = "/admin/allowance"}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Access Allowance Management
              </Button>
              <div className="text-sm text-gray-400">
                Test access to founder wallet allowance configuration
              </div>
            </CardContent>
          </Card>

          {/* Auto Pool Manager */}
          <Card className="bg-white/10 border border-white/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Auto Pool Manager</CardTitle>
                  <CardDescription className="text-gray-300">
                    Automated liquidity pool management
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => window.location.href = "/admin/auto-pool"}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Access Auto Pool Manager
              </Button>
              <div className="text-sm text-gray-400">
                Check auto pool manager system status
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => {
              setIsAuthenticated(false);
              setAuthToken("");
              localStorage.removeItem("admin_token");
              toast({
                title: "Logged out",
                description: "Admin session ended"
              });
            }}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}