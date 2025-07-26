import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Cookie, Settings, X } from "lucide-react";
import { Link as RouterLink } from "wouter";
import { useGeolocation } from '@/hooks/useGeolocation';

const COOKIE_CONSENT_KEY = 'webpayback_cookie_consent';
const CONSENT_VERSION = '1.0';

interface CookieConsentState {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  version: string;
  timestamp: number;
}

const CookieConsentBanner: React.FC = () => {
  const { showCookieBanner, isEU, isLoading, privacyConfig } = useGeolocation();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    version: CONSENT_VERSION,
    timestamp: Date.now()
  });

  useEffect(() => {
    // Only show cookie banner if user is in EU jurisdiction
    if (isLoading || !showCookieBanner) {
      return;
    }

    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
          return; // User has already given consent for this version
        }
      } catch (e) {
        // Invalid consent data, show banner
      }
    }
    
    // Show banner after 1 second to not interrupt page load
    const timer = setTimeout(() => setShowBanner(true), 1000);
    return () => clearTimeout(timer);
  }, [isLoading, showCookieBanner]);

  const saveConsent = (consentState: CookieConsentState) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentState));
    setShowBanner(false);
    
    // Apply consent settings to existing cookies
    if (!consentState.functional) {
      // Remove functional cookies
      document.cookie = 'sidebar_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const acceptAll = () => {
    const fullConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      version: CONSENT_VERSION,
      timestamp: Date.now()
    };
    setConsent(fullConsent);
    saveConsent(fullConsent);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      version: CONSENT_VERSION,
      timestamp: Date.now()
    };
    setConsent(necessaryOnly);
    saveConsent(necessaryOnly);
  };

  const acceptCustom = () => {
    const customConsent = {
      ...consent,
      version: CONSENT_VERSION,
      timestamp: Date.now()
    };
    saveConsent(customConsent);
  };

  // Don't render if:
  // - Banner shouldn't be shown
  // - Still loading geolocation
  // - User not in EU (cookie consent not required)
  if (!showBanner || isLoading || !showCookieBanner) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-4xl glass-card border-electric-blue/20">
        <CardContent className="p-6">
          {!showDetails ? (
            // Simple Banner
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cookie className="h-6 w-6 text-electric-blue" />
                  <h3 className="text-lg font-semibold text-white">Cookie Consent Required</h3>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    GDPR Compliance
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBanner(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-gray-300">
                WebPayback Protocol uses cookies to ensure security, improve user experience, and comply with GDPR regulations. 
                We use necessary cookies for CSRF protection and optional cookies for UI preferences.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={acceptAll} className="bg-electric-blue hover:bg-electric-blue/90">
                  Accept All Cookies
                </Button>
                <Button onClick={acceptNecessary} variant="outline">
                  Necessary Only
                </Button>
                <Button 
                  onClick={() => setShowDetails(true)}
                  variant="ghost"
                  className="text-electric-blue hover:text-electric-blue/90"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>

              <p className="text-xs text-gray-400">
                By continuing, you agree to our{' '}
                <RouterLink href="/privacy" className="text-electric-blue hover:underline">
                  Privacy Policy
                </RouterLink>{' '}
                and{' '}
                <RouterLink href="/terms" className="text-electric-blue hover:underline">
                  Terms & Conditions
                </RouterLink>
              </p>
            </div>
          ) : (
            // Detailed Settings
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-electric-blue" />
                  <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Back
                </Button>
              </div>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-400">Necessary Cookies</h4>
                    <Badge className="bg-green-500 text-black">Always Active</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    Essential for security and basic functionality. Required for CSRF protection and user authentication.
                  </p>
                  <p className="text-xs text-gray-400">
                    Cookies: csrf_token (24 hours)
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-400">Functional Cookies</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent.functional}
                        onChange={(e) => setConsent(prev => ({...prev, functional: e.target.checked}))}
                        className="rounded border-gray-600 bg-gray-700 text-blue-500"
                      />
                      <span className="text-sm text-gray-300">Enable</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    Remember your preferences and settings to improve your experience.
                  </p>
                  <p className="text-xs text-gray-400">
                    Cookies: sidebar_state (7 days)
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-400">Analytics Cookies</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent.analytics}
                        onChange={(e) => setConsent(prev => ({...prev, analytics: e.target.checked}))}
                        className="rounded border-gray-600 bg-gray-700 text-purple-500"
                      />
                      <span className="text-sm text-gray-300">Enable</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    Help us understand how you use the platform to improve our services.
                  </p>
                  <p className="text-xs text-gray-400">
                    Currently: None implemented (privacy-first approach)
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={acceptCustom} className="bg-electric-blue hover:bg-electric-blue/90">
                  Save Preferences
                </Button>
                <Button onClick={acceptAll} variant="outline">
                  Accept All
                </Button>
                <Button onClick={acceptNecessary} variant="ghost">
                  Necessary Only
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsentBanner;