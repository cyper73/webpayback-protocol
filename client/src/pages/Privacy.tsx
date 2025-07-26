/**
 * Privacy Rights Management Page
 * Combines GDPR (EU) and CCPA (USA) compliance in one interface
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, Flag, MapPin } from 'lucide-react';
import CookieConsentBanner from '@/components/gdpr/CookieConsentBanner';
import GDPRDataRequest from '@/components/gdpr/GDPRDataRequest';
import CCPACompliance from '@/components/ccpa/CCPACompliance';
import { useGeolocation, usePrivacyMessage } from '@/hooks/useGeolocation';

const Privacy: React.FC = () => {
  const { privacyConfig, isLoading, isEU, isUS } = useGeolocation();
  const { jurisdictionMessage } = usePrivacyMessage();
  const [activeRegion, setActiveRegion] = useState<string>('overview');

  // Auto-switch to appropriate tab based on detected jurisdiction
  React.useEffect(() => {
    if (privacyConfig && !isLoading) {
      if (isEU && activeRegion === 'overview') {
        setActiveRegion('gdpr');
      } else if (isUS && activeRegion === 'overview') {
        setActiveRegion('ccpa');
      }
    }
  }, [privacyConfig, isLoading, isEU, isUS, activeRegion]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Privacy Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Privacy Rights Management</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your privacy rights and data protection preferences across different jurisdictions
          </p>

          {/* Geolocation Detection Status */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 animate-pulse" />
              Detecting your location for compliance...
            </div>
          ) : privacyConfig && (
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Detected location: <strong>{privacyConfig.location.country}</strong>
              </span>
              <Badge 
                variant={privacyConfig.privacyLaw === 'GDPR' ? 'secondary' : privacyConfig.privacyLaw === 'CCPA' ? 'destructive' : 'outline'}
                className="ml-2"
              >
                {privacyConfig.privacyLaw || 'Standard'}
              </Badge>
            </div>
          )}
        </div>

        {/* Regional Compliance Tabs */}
        <Tabs value={activeRegion} onValueChange={setActiveRegion} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="gdpr" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              🇪🇺 GDPR (EU)
            </TabsTrigger>
            <TabsTrigger value="ccpa" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              🇺🇸 CCPA (USA)
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  WebPayback Protocol Privacy Compliance
                </CardTitle>
                <CardDescription>
                  We are committed to protecting your privacy across all major jurisdictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">🇪🇺 European Union (GDPR)</h3>
                        <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Cookie consent management</li>
                      <li>• Data subject rights (access, delete, portability)</li>
                      <li>• Legal basis documentation</li>
                      <li>• Data Protection Officer contact</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">🇺🇸 California, USA (CCPA)</h3>
                        <p className="text-sm text-muted-foreground">California Consumer Privacy Act</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• "Do Not Sell" opt-out rights</li>
                      <li>• Consumer data access rights</li>
                      <li>• Sensitive data limitation controls</li>
                      <li>• Data portability and correction</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Global Privacy Principles</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Transparency</div>
                      <div className="text-muted-foreground">Clear privacy policies</div>
                    </div>
                    <div>
                      <div className="font-medium">User Control</div>
                      <div className="text-muted-foreground">Granular preferences</div>
                    </div>
                    <div>
                      <div className="font-medium">Data Minimization</div>
                      <div className="text-muted-foreground">Collect only what's needed</div>
                    </div>
                    <div>
                      <div className="font-medium">Security</div>
                      <div className="text-muted-foreground">Enterprise-grade protection</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  For privacy-related questions or concerns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Data Protection Officer:</strong> cyper73@gmail.com</p>
                  <p><strong>Privacy Contact:</strong> cyper73@gmail.com</p>
                  <p><strong>Platform:</strong> WebPayback Protocol</p>
                  <p><strong>Response Time:</strong> Within 30 days (GDPR) / 45 days (CCPA)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GDPR Tab */}
          <TabsContent value="gdpr" className="space-y-6">
            <Card className="border-2 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  🇪🇺 GDPR Compliance (European Union)
                </CardTitle>
                <CardDescription>
                  General Data Protection Regulation - Your European privacy rights
                </CardDescription>
              </CardHeader>
            </Card>
            
            <GDPRDataRequest />
          </TabsContent>

          {/* CCPA Tab */}
          <TabsContent value="ccpa" className="space-y-6">
            <Card className="border-2 border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  🇺🇸 CCPA Compliance (California, USA)
                </CardTitle>
                <CardDescription>
                  California Consumer Privacy Act - Your California privacy rights
                </CardDescription>
              </CardHeader>
            </Card>

            <CCPACompliance />
          </TabsContent>
        </Tabs>
      </div>

      {/* Cookie Consent Banner (only shows if not already accepted) */}
      <CookieConsentBanner />
    </div>
  );
};

export default Privacy;