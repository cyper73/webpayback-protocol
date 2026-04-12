import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePrivy } from '@privy-io/react-auth';
import Citations from '../../pages/Citations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, ArrowRight, Trophy } from 'lucide-react';

export default function ProtectedRewardsModule() {
  const { ready, authenticated, login } = usePrivy();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If Privy is ready and user is NOT authenticated, redirect to home
    if (ready && !authenticated) {
      const timer = setTimeout(() => {
        setLocation('/');
      }, 3000); // 3 seconds delay to show the message before redirecting
      
      return () => clearTimeout(timer);
    }
  }, [ready, authenticated, setLocation]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-amber-500/30 bg-black/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-center">
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20">
                  <Trophy className="h-6 w-6 text-amber-400" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
                <p className="text-gray-400">
                  You must be logged in to access the Citation Rewards module.
                </p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-left">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/80">
                  Redirecting to the public dashboard in a few seconds...
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={login}
                  className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] h-12"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Login with Privy
                </Button>
                
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-12"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <Citations />;
}