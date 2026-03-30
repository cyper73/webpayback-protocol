import React, { useState, useEffect } from 'react';
import { ContentCertificatePage } from '../../pages/ContentCertificatePage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogIn, User, ExternalLink } from 'lucide-react';

export default function ProtectedNFTModule() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated via wallet-first login
    const session = localStorage.getItem('webpayback_session');
    
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        
        // Check if session is still valid (24 hours)
        const loginTime = new Date(sessionData.loginTime).getTime();
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionData.isAuthenticated && (now - loginTime < maxAge)) {
          setIsAuthenticated(true);
          setSessionInfo(sessionData);
        } else {
          // Session expired
          localStorage.removeItem('webpayback_session');
        }
      } catch (error) {
        console.error('Invalid session data:', error);
        localStorage.removeItem('webpayback_session');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Listen for login events from other tabs/components
  useEffect(() => {
    const handleLogin = (event: CustomEvent) => {
      setIsAuthenticated(true);
      setSessionInfo(event.detail);
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
      setSessionInfo(null);
    };

    window.addEventListener('webpayback-login', handleLogin as EventListener);
    window.addEventListener('webpayback-logout', handleLogout as EventListener);

    return () => {
      window.removeEventListener('webpayback-login', handleLogin as EventListener);
      window.removeEventListener('webpayback-logout', handleLogout as EventListener);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Shield className="h-6 w-6 text-blue-600" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Please login with your wallet to access the <strong>NFT Content Certificate Module</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The new wallet-first authentication system provides:
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1 ml-4">
                  <li>• Multi-wallet support (MetaMask, Coinbase, Trust, etc.)</li>
                  <li>• Cryptographic signature verification</li>
                  <li>• Centralized access to all modules</li>
                  <li>• Enhanced security with 2FA</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-electric-blue hover:bg-electric-blue/80"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Humanity & Login
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Register as Creator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      {sessionInfo && (
        <div className="bg-green-50 dark:bg-green-950 border-b border-green-200 dark:border-green-800 p-2">
          <div className="container mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-800 dark:text-green-200">
                Authenticated as: {sessionInfo.walletAddress}
              </span>
            </div>
            <Button 
              onClick={() => {
                localStorage.removeItem('webpayback_session');
                window.location.reload();
              }}
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-800"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
      <ContentCertificatePage />
    </div>
  );
}