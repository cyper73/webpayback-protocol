/**
 * CCPA Compliance Component for USA Market
 * Implements California Consumer Privacy Act requirements
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, User, Download, Trash2, Edit, ExternalLink } from 'lucide-react';

interface CCPAPreferences {
  doNotSell: boolean;
  limitSensitiveData: boolean;
  marketingOptOut: boolean;
  thirdPartySharing: boolean;
}

const CCPACompliance: React.FC = () => {
  const [preferences, setPreferences] = useState<CCPAPreferences>({
    doNotSell: false,
    limitSensitiveData: false,
    marketingOptOut: false,
    thirdPartySharing: false
  });

  const [showRights, setShowRights] = useState(false);
  const [dataRequests, setDataRequests] = useState<any[]>([]);

  // Load CCPA preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ccpa-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const updatePreferences = (key: keyof CCPAPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('ccpa-preferences', JSON.stringify(updated));
  };

  const handleDataRequest = async (requestType: 'access' | 'delete' | 'portability' | 'correct') => {
    try {
      const response = await fetch('/api/ccpa/data-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestType,
          userPreferences: preferences,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        const result = await response.json();
        setDataRequests(prev => [...prev, {
          id: result.requestId,
          type: requestType,
          status: 'pending',
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('CCPA data request failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* CCPA Header */}
      <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">🇺🇸 California Consumer Privacy Act (CCPA)</CardTitle>
              <CardDescription>
                Your privacy rights under California law
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">USA Compliant</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Do Not Sell Button - Prominent CCPA Requirement */}
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <User className="h-5 w-5" />
            Do Not Sell My Personal Information
          </CardTitle>
          <CardDescription>
            As required by CCPA, you can opt-out of the sale of your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="do-not-sell" className="text-sm font-medium">
              Opt-out of personal information sale
            </Label>
            <Switch
              id="do-not-sell"
              checked={preferences.doNotSell}
              onCheckedChange={(value) => updatePreferences('doNotSell', value)}
            />
          </div>
          {preferences.doNotSell && (
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-md">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                ✓ You have opted out of the sale of your personal information
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Preferences</CardTitle>
          <CardDescription>
            Control how your personal information is used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="limit-sensitive" className="text-sm font-medium">
              Limit use of sensitive personal information
            </Label>
            <Switch
              id="limit-sensitive"
              checked={preferences.limitSensitiveData}
              onCheckedChange={(value) => updatePreferences('limitSensitiveData', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="marketing-opt-out" className="text-sm font-medium">
              Opt-out of marketing communications
            </Label>
            <Switch
              id="marketing-opt-out"
              checked={preferences.marketingOptOut}
              onCheckedChange={(value) => updatePreferences('marketingOptOut', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="third-party" className="text-sm font-medium">
              Limit third-party data sharing
            </Label>
            <Switch
              id="third-party"
              checked={preferences.thirdPartySharing}
              onCheckedChange={(value) => updatePreferences('thirdPartySharing', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* CCPA Consumer Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your CCPA Rights</CardTitle>
          <CardDescription>
            Exercise your California consumer rights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleDataRequest('access')}
              className="flex items-center gap-2 h-auto p-4 text-left"
            >
              <Download className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-medium">Right to Know</div>
                <div className="text-xs text-muted-foreground">
                  Request access to your personal information
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDataRequest('delete')}
              className="flex items-center gap-2 h-auto p-4 text-left"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <div>
                <div className="font-medium">Right to Delete</div>
                <div className="text-xs text-muted-foreground">
                  Request deletion of your personal information
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDataRequest('portability')}
              className="flex items-center gap-2 h-auto p-4 text-left"
            >
              <ExternalLink className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-medium">Right to Portability</div>
                <div className="text-xs text-muted-foreground">
                  Export your data in portable format
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDataRequest('correct')}
              className="flex items-center gap-2 h-auto p-4 text-left"
            >
              <Edit className="h-4 w-4 text-purple-500" />
              <div>
                <div className="font-medium">Right to Correct</div>
                <div className="text-xs text-muted-foreground">
                  Request correction of inaccurate information
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Requests Status */}
      {dataRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Data Requests</CardTitle>
            <CardDescription>
              Track the status of your CCPA requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dataRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium capitalize">{request.type} Request</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="secondary">{request.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CCPA Information */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-sm">CCPA Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Data Controller:</strong> WebPayback Protocol<br />
            <strong>Contact:</strong> cyper73@gmail.com<br />
            <strong>Response Time:</strong> Within 45 days of request
          </p>
          <p>
            This platform is compliant with the California Consumer Privacy Act (CCPA) and provides 
            California residents with enhanced privacy rights and controls over their personal information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CCPACompliance;