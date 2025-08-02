import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  QrCode, 
  Key, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Smartphone,
  Download,
  Lock,
  Unlock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TwoFactorAuthSetupProps {
  creatorId: number;
  creatorEmail: string;
  onSetupComplete?: () => void;
  preGeneratedSetup?: TwoFactorSetup; // Support auto-generated setup from registration
}

interface TwoFactorSetup {
  qrCodeUrl: string;
  manualEntryCode: string;
  backupCodes: string[];
}

interface SetupInstructions {
  steps: string[];
  recommendedApps: string[];
  troubleshooting: string[];
}

export default function TwoFactorAuthSetup({ 
  creatorId, 
  creatorEmail, 
  onSetupComplete,
  preGeneratedSetup 
}: TwoFactorAuthSetupProps) {
  // If pre-generated setup is available, skip to setup step automatically
  const [step, setStep] = useState<'start' | 'setup' | 'verify' | 'complete'>(
    preGeneratedSetup ? 'setup' : 'start'
  );
  const [setup, setSetup] = useState<TwoFactorSetup | null>(preGeneratedSetup || null);
  const [instructions, setInstructions] = useState<SetupInstructions | null>(
    preGeneratedSetup?.instructions || null
  );
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState<number | null>(null);

  const { toast } = useToast();

  const setupMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Starting 2FA setup for creator:', creatorId, 'email:', creatorEmail);
        
        // Get CSRF token first
        const tokenResponse = await fetch('/api/csrf/token', { credentials: 'include' });
        const tokenData = await tokenResponse.json();
        console.log('CSRF token obtained:', tokenData.csrfToken?.substring(0, 10) + '...');
        
        const response = await fetch('/api/auth/2fa/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': tokenData.csrfToken
          },
          credentials: 'include',
          body: JSON.stringify({
            creatorId,
            email: creatorEmail
          })
        });
        
        console.log('2FA setup response status:', response.status);
        const data = await response.json();
        console.log('2FA setup response data:', data);
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }
        return data;
      } catch (error) {
        console.error('2FA setup API error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setSetup(data.setup);
        setInstructions(data.instructions);
        setStep('setup');
        toast({
          title: "2FA Setup Generated",
          description: "Your QR code and backup codes are ready",
        });
      } else {
        setError(data.error || 'Failed to generate 2FA setup');
      }
    },
    onError: (error: any) => {
      console.error('2FA setup mutation error:', error);
      setError(`Setup error: ${error?.message || 'Please try again.'}`);
    }
  });

  const generateSetup = () => {
    console.log('🔐 generateSetup clicked for creator:', creatorId, 'email:', creatorEmail);
    setError(null);
    setupMutation.mutate();
  };

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      try {
        console.log('Starting 2FA verification for creator:', creatorId, 'token:', token);
        
        // Get CSRF token first
        const tokenResponse = await fetch('/api/csrf/token', { credentials: 'include' });
        const tokenData = await tokenResponse.json();
        console.log('CSRF token obtained for verification:', tokenData.csrfToken?.substring(0, 10) + '...');
        
        const response = await fetch('/api/auth/2fa/verify-setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': tokenData.csrfToken
          },
          credentials: 'include',
          body: JSON.stringify({
            creatorId,
            token: token.replace(/\s/g, '')
          })
        });
        
        console.log('2FA verify response status:', response.status);
        const data = await response.json();
        console.log('2FA verify response data:', data);
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }
        return data;
      } catch (error) {
        console.error('2FA verify API error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setStep('complete');
        toast({
          title: "2FA Enabled Successfully!",
          description: "Your account is now protected with Two-Factor Authentication",
        });
        onSetupComplete?.();
      } else {
        setError(data.error || 'Invalid verification code');
      }
    },
    onError: (error: any) => {
      console.error('2FA verify mutation error:', error);
      setError(`Verification error: ${error?.message || 'Please try again.'}`);
    }
  });

  const verifySetup = () => {
    if (!verificationToken.trim()) {
      setError('Please enter the 6-digit code from your authenticator app');
      return;
    }
    setError(null);
    verifyMutation.mutate(verificationToken);
  };

  const copyToClipboard = async (text: string, type: 'code' | 'backup', index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else if (type === 'backup' && typeof index === 'number') {
        setCopiedBackup(index);
        setTimeout(() => setCopiedBackup(null), 2000);
      }
      toast({
        title: "Copied!",
        description: `${type === 'code' ? 'Secret code' : 'Backup code'} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  if (step === 'start') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Enable Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">Enhanced Security for Creator Portal</div>
                <div>Two-Factor Authentication adds an extra layer of protection to your account, especially for sensitive operations like:</div>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>Claiming WPT rewards</li>
                  <li>Minting Content Certificate NFTs</li>
                  <li>Updating wallet addresses</li>
                  <li>Managing pool allowances</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                <span className="font-semibold">What You'll Need</span>
              </div>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Smartphone or tablet</li>
                <li>• Authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>• 2-3 minutes to complete setup</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">What You'll Get</span>
              </div>
              <ul className="text-sm space-y-1 ml-6">
                <li>• QR code for easy setup</li>
                <li>• 10 backup codes</li>
                <li>• Enhanced account security</li>
              </ul>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button 
              onClick={generateSetup}
              disabled={setupMutation.isPending}
              size="lg"
            >
              {setupMutation.isPending ? 'Generating...' : 'Start 2FA Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'setup' && setup && instructions) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            Scan QR Code with Your Authenticator App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-white p-6 rounded-lg border-2 border-gray-200 text-center">
                <img 
                  src={setup.qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="mx-auto max-w-full h-auto"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="font-semibold">Manual Entry Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded flex-1 font-mono text-sm break-all">
                    {setup.manualEntryCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setup.manualEntryCode, 'code')}
                  >
                    {copiedCode ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use this code if you can't scan the QR code
                </p>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Setup Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {instructions.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Recommended Apps:</h3>
                <div className="space-y-1">
                  {instructions.recommendedApps.map((app, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-1">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Backup Codes */}
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-orange-600" />
              <span className="font-semibold">Save These Backup Codes</span>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Store these backup codes in a safe place. Each code can only be used once and will help you regain access if you lose your device.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {setup.backupCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-1">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono flex-1">
                    {code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, 'backup', index)}
                    className="p-1 h-auto"
                  >
                    {copiedBackup === index ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Verification */}
          <div className="space-y-4">
            <h3 className="font-semibold">Verify Your Setup</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app to complete setup:
            </p>
            
            <div className="flex items-center gap-3 max-w-md">
              <Input
                type="text"
                placeholder="000000"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center font-mono text-lg"
                maxLength={6}
              />
              <Button 
                onClick={verifySetup}
                disabled={verifyMutation.isPending || verificationToken.length !== 6}
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            2FA Successfully Enabled!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="text-gray-900 dark:text-gray-100">
            <Lock className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            <AlertDescription className="text-gray-800 dark:text-gray-200">
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Your account is now protected</div>
                <div className="text-gray-700 dark:text-gray-300">Two-Factor Authentication has been enabled for your Creator Portal account. You'll need to provide a 6-digit code from your authenticator app when accessing sensitive features like:</div>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm mt-2 text-gray-700 dark:text-gray-300">
                  <li>Claiming WPT rewards</li>
                  <li>Minting Content Certificate NFTs</li>
                  <li>Updating wallet addresses</li>
                  <li>Managing emergency pool operations</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Important Reminders:</h3>
            <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
              <li>• Keep your backup codes safe and secure</li>
              <li>• Your authenticator app will generate new codes every 30 seconds</li>
              <li>• Contact support if you lose access to your device</li>
              <li>• You can regenerate backup codes anytime from Security Settings</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              Continue to Creator Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}