import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, CheckCircle, Mail, LogOut, Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';

interface LoginSession {
  walletAddress: string;
  loginTime: string;
}

export default function Login() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { toast } = useToast();
  const [loginSession, setLoginSession] = useState<LoginSession | null>(null);

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
      
    } else if (ready && !authenticated) {
      setLoginSession(null);
      localStorage.removeItem('webpayback_session');
      window.dispatchEvent(new CustomEvent('webpayback-logout'));
    }
  }, [ready, authenticated, user]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logout successful",
      description: "You have been securely logged out."
    });
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
                Accesso WebPayback Completato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-white">
                  Sei autenticato in modo sicuro.
                </p>
                <p className="text-sm text-gray-400">
                  Il tuo Embedded Wallet è attivo e pronto per interagire con la blockchain.
                </p>
              </div>

              <div className="bg-electric-blue/10 border border-electric-blue/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-electric-blue" />
                  <span className="text-sm font-medium text-electric-blue">
                    Indirizzo Wallet Assegnato
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
                      Moduli Sbloccati
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-none">
                      Dashboard Creatori ✓
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
                  Vai alla Dashboard
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Disconnetti
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
            Accedi senza password. Creeremo automaticamente un wallet sicuro per te.
          </p>
        </div>

        <Card className="border-gray-800 bg-black/60 backdrop-blur-xl relative z-10">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-electric-blue/10 p-4 rounded-full mb-2">
                <Mail className="h-10 w-10 text-electric-blue" />
              </div>
              <h3 className="text-xl font-medium text-white text-center">Inizia da qui</h3>
              <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
                Usa Email, Google o il tuo Wallet Web3. 
                L'accesso è unificato e sicuro grazie a Privy.
              </p>
              <Button 
                onClick={login}
                className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Accedi / Registrati
              </Button>
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
              Torna alla Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}