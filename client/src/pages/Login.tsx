import { useState } from 'react';
import { WalletLogin } from '@/components/auth/WalletLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, CheckCircle } from 'lucide-react';

interface Creator {
  id: number;
  websiteUrl: string;
  contentCategory: string;
}

interface LoginSession {
  walletAddress: string;
  creators: Creator[];
  sessionToken: string;
}

export default function Login() {
  const [loginSession, setLoginSession] = useState<LoginSession | null>(null);

  const handleLoginSuccess = (session: LoginSession) => {
    setLoginSession(session);
    
    // Store session in localStorage for persistence
    localStorage.setItem('webpayback_session', JSON.stringify({
      walletAddress: session.walletAddress,
      sessionToken: session.sessionToken,
      loginTime: new Date().toISOString(),
      isAuthenticated: true
    }));

    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('webpayback-login', {
      detail: session
    }));

    console.log('✅ Login session established:', session);
  };

  const handleLogout = () => {
    setLoginSession(null);
    localStorage.removeItem('webpayback_session');
    
    // Trigger logout event
    window.dispatchEvent(new CustomEvent('webpayback-logout'));
    
    console.log('✅ Logged out successfully');
  };

  if (loginSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Welcome to WebPayback Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Login Successful! 🎉
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You now have access to all WebPayback Protocol modules
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Authenticated Wallet
                  </span>
                </div>
                <p className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 p-2 rounded">
                  {loginSession.walletAddress}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Registered Sites ({loginSession.creators.length})
                </h3>
                <div className="space-y-2">
                  {loginSession.creators.map((creator, index) => (
                    <div 
                      key={creator.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {creator.websiteUrl}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {creator.contentCategory}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Available Modules
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      All modules now accessible
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Content Certificate ✓
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Citation Rewards ✓
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => window.location.href = '/nft'}
                  className="flex-1"
                >
                  Access Content Certificate
                </Button>
                <Button 
                  onClick={() => window.location.href = '/rewards'}
                  variant="outline"
                  className="flex-1"
                >
                  Access Citation Rewards
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              WebPayback Protocol
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Secure wallet-based authentication for content creators and AI protection
          </p>
        </div>

        <WalletLogin onLoginSuccess={handleLoginSuccess} />

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            New to WebPayback Protocol?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/creators'}
              className="text-blue-600 dark:text-blue-400"
            >
              Register as Creator
            </Button>
            <span className="text-gray-300">•</span>
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/'}
              className="text-blue-600 dark:text-blue-400"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}