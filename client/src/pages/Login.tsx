import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, CheckCircle, Mail, LogOut, Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';
import { HumanityConnect, useHumanity } from "@humanity-org/react-sdk";

interface LoginSession {
  walletAddress: string;
  loginTime: string;
}

export default function Login() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { toast } = useToast();
  const { isAuthenticated: isHumanityAuthenticated, getAccessToken, user: humanityUser, login: humanityLogin } = useHumanity();
  const [loginSession, setLoginSession] = useState<LoginSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleHumanityLoginClick = async () => {
    try {
      setIsConnecting(true);
      toast({ title: "Connecting", description: "Initiating Humanity SDK..." });
      
      // Add a race condition to prevent humanityLogin from hanging indefinitely
      await Promise.race([
        humanityLogin({
          mode: 'redirect',
          scopes: ['openid']
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Humanity SDK login timeout")), 10000))
      ]);
      
      toast({ title: "Redirecting", description: "You should be redirected shortly..." });
    } catch (error: any) {
      console.error("Login initialization failed:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to Humanity Protocol.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  // Monitor Humanity SDK authentication state to sync with backend and complete login
  useEffect(() => {
    const syncHumanityLogin = async () => {
      // If Humanity SDK says we are authenticated, but we haven't synced yet
      if (isHumanityAuthenticated && !loginSession && !isConnecting) {
        setIsConnecting(true);
        toast({ title: "Sync Started", description: "Authenticating with backend..." });
        
        try {
          // Promise.race to prevent getting stuck on getAccessToken
          const accessToken = await Promise.race([
            getAccessToken(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout getting access token from Humanity SDK")), 15000))
          ]) as string;
          
          if (!accessToken) throw new Error("No access token found from Humanity SDK");

          toast({ title: "Token Obtained", description: "Finalizing session..." });

          // Call backend to complete the login/registration process
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
          
          const response = await fetch('/api/humanity/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              accessToken,
              humanityId: humanityUser?.id 
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          const data = await response.json();
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || data.error || 'Login failed on backend');
          }

          // We got a successful login with a wallet created by backend
          const session = {
            creatorId: data.creator.id,
            walletAddress: data.creator.walletAddress,
            loginTime: new Date().toISOString()
          };
          
          setLoginSession(session);
          localStorage.setItem('webpayback_session', JSON.stringify({
            ...session,
            isAuthenticated: true,
            token: data.sessionToken
          }));

          window.dispatchEvent(new CustomEvent('webpayback-login', {
            detail: session
          }));

          toast({
            title: "Humanity Verified",
            description: "Wallet automatically generated and assigned.",
          });

          // Redirect to Creator Portal
          setTimeout(() => {
            window.location.href = '/creators';
          }, 1000);

        } catch (err: any) {
          console.error("Error during Humanity sync:", err);
          toast({
            title: "Login Sync Error",
            description: err.message || "Failed to complete login with backend.",
            variant: "destructive"
          });
        } finally {
          setIsConnecting(false);
        }
      }
    };

    syncHumanityLogin();
  }, [isHumanityAuthenticated, loginSession, isConnecting, getAccessToken, humanityUser, toast]);

  // Sync Privy state with local session state
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      const session = {
        walletAddress: user.wallet.address,
        loginTime: new Date().toISOString()
      };
      
      setLoginSession(session);
      
      // Store minimal session info
      localStorage.setItem('webpayback_session', JSON.stringify({
        ...session,
        isAuthenticated: true
      }));

      // Trigger global event
      window.dispatchEvent(new CustomEvent('webpayback-login', {
        detail: session
      }));
      
    } 
    // We removed the 'else if (ready && !authenticated)' block here
    // because it was aggressively deleting the Humanity session we just created!
  }, [ready, authenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.log('Privy logout skipped or failed', e);
    }
    
    // Manual cleanup since we removed the aggressive auto-cleanup
    setLoginSession(null);
    localStorage.removeItem('webpayback_session');
    window.dispatchEvent(new CustomEvent('webpayback-logout'));
    
    toast({
      title: "Logout successful",
      description: "You have been securely logged out."
    });
    
    // Redirect to home
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  if (authenticated && loginSession) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="border-gray-800 bg-black/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-6 w-6" />
                WebPayback Login Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-white">
                  You are securely authenticated.
                </p>
                <p className="text-sm text-gray-400">
                  Your Embedded Wallet is active and ready to interact with the blockchain.
                </p>
              </div>

              <div className="bg-electric-blue/10 border border-electric-blue/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-electric-blue" />
                  <span className="text-sm font-medium text-electric-blue">
                    Assigned Wallet Address
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-300 bg-black/50 border border-gray-800 p-3 rounded break-all">
                  {loginSession.walletAddress}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Unlocked Modules
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-none">
                      Creator Dashboard ✓
                    </Badge>
                    <Badge className="bg-electric-blue/20 text-electric-blue border-none">
                      Humanity Protocol ✓
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => window.location.href = '/creators'}
                  className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-white"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative">
        {/* Glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center space-y-4 relative z-10">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 text-electric-blue" />
            <h1 className="text-3xl font-bold text-white tracking-tight">
              WebPayback Protocol
            </h1>
          </div>
          <p className="text-md text-gray-400 max-w-md mx-auto">
            Sign in without a password. We'll automatically create a secure wallet for you.
          </p>
        </div>

        <Card className="border-gray-800 bg-black/60 backdrop-blur-xl relative z-10">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-electric-blue/10 p-4 rounded-full mb-2">
                <Shield className="h-10 w-10 text-electric-blue" />
              </div>
              <h3 className="text-xl font-medium text-white text-center">Prove Your Humanity</h3>
              <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
                We use Humanity Protocol to ensure you are a real person. 
                A secure wallet will be created automatically for you.
              </p>
              
              <div className="w-full flex justify-center">
                <Button 
                  onClick={handleHumanityLoginClick}
                  disabled={isConnecting}
                  className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-5 w-5" />
                  )}
                  {isConnecting ? "Connecting..." : "Verify & Sign In"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-electric-blue"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}