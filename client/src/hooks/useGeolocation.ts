/**
 * React Hook for Automatic Jurisdiction Detection
 * Detects user location to apply appropriate privacy laws
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PrivacyConfig {
  jurisdiction: 'EU' | 'US' | 'OTHER';
  privacyLaw: 'GDPR' | 'CCPA' | 'NONE';
  features: {
    cookieBanner: boolean;
    doNotSellButton: boolean;
    gdprRights: boolean;
    ccpaRights: boolean;
    dataRetention: boolean;
    rightToDelete: boolean;
    dataPortability: boolean;
  };
  location: {
    country: string;
    region: string;
    detectedAt: string;
  };
}

interface GeolocationHookResult {
  privacyConfig: PrivacyConfig | null;
  isLoading: boolean;
  error: Error | null;
  isEU: boolean;
  isUS: boolean;
  showCookieBanner: boolean;
  showDoNotSell: boolean;
  supportedRights: string[];
}

export const useGeolocation = (): GeolocationHookResult => {
  const [privacyConfig, setPrivacyConfig] = useState<PrivacyConfig | null>(null);

  // Query jurisdiction detection API
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['/api/privacy/detect-jurisdiction'],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (data?.success) {
      setPrivacyConfig({
        jurisdiction: data.jurisdiction,
        privacyLaw: data.privacyLaw,
        features: data.features,
        location: data.location
      });

      // Store in localStorage for faster subsequent loads
      localStorage.setItem('webpayback-jurisdiction', JSON.stringify({
        ...data,
        cachedAt: Date.now()
      }));
    } else if (data?.fallback) {
      // Use fallback configuration if detection fails
      setPrivacyConfig({
        jurisdiction: data.fallback.jurisdiction,
        privacyLaw: data.fallback.privacyLaw,
        features: data.fallback.features,
        location: {
          country: 'Unknown',
          region: 'Unknown',
          detectedAt: new Date().toISOString()
        }
      });
    }
  }, [data]);

  // Load cached jurisdiction on mount
  useEffect(() => {
    const cached = localStorage.getItem('webpayback-jurisdiction');
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const isStale = Date.now() - cachedData.cachedAt > (1000 * 60 * 60); // 1 hour
        
        if (!isStale && cachedData.success) {
          setPrivacyConfig({
            jurisdiction: cachedData.jurisdiction,
            privacyLaw: cachedData.privacyLaw,
            features: cachedData.features,
            location: cachedData.location
          });
        }
      } catch (e) {
        console.warn('Failed to parse cached jurisdiction data');
      }
    }
  }, []);

  // Derived values for convenience
  const isEU = privacyConfig?.jurisdiction === 'EU';
  const isUS = privacyConfig?.jurisdiction === 'US';
  const showCookieBanner = privacyConfig?.features.cookieBanner ?? true;
  const showDoNotSell = privacyConfig?.features.doNotSellButton ?? true;

  // Supported privacy rights based on jurisdiction
  const supportedRights = privacyConfig ? [
    ...(privacyConfig.features.gdprRights ? ['GDPR Rights', 'Cookie Consent', 'Data Portability'] : []),
    ...(privacyConfig.features.ccpaRights ? ['CCPA Rights', 'Do Not Sell', 'Data Correction'] : []),
    ...(privacyConfig.features.rightToDelete ? ['Right to Delete'] : []),
    ...(privacyConfig.features.dataRetention ? ['Data Retention Control'] : [])
  ] : [];

  return {
    privacyConfig,
    isLoading,
    error: error as Error | null,
    isEU,
    isUS,
    showCookieBanner,
    showDoNotSell,
    supportedRights
  };
};

/**
 * Hook for getting jurisdiction-specific privacy message
 */
export const usePrivacyMessage = () => {
  const { privacyConfig, isEU, isUS } = useGeolocation();

  const getJurisdictionMessage = () => {
    if (isEU) {
      return {
        title: "🇪🇺 European Privacy Rights",
        message: "Your data is protected under GDPR. Manage your privacy preferences below.",
        law: "GDPR",
        color: "blue"
      };
    }
    
    if (isUS) {
      return {
        title: "🇺🇸 California Privacy Rights", 
        message: "Your data is protected under CCPA. Control how your information is used.",
        law: "CCPA",
        color: "orange"
      };
    }

    return {
      title: "🌍 Global Privacy Protection",
      message: "Your privacy is important to us. Explore your data protection options.",
      law: "Standard",
      color: "gray"
    };
  };

  const getRecommendedSettings = () => {
    if (isEU) {
      return {
        cookieConsent: 'required',
        dataProcessing: 'explicit_consent',
        marketing: 'opt_in',
        analytics: 'opt_in'
      };
    }
    
    if (isUS) {
      return {
        cookieConsent: 'optional',
        dataProcessing: 'opt_out_available',
        marketing: 'opt_out',
        analytics: 'opt_out'
      };
    }

    return {
      cookieConsent: 'recommended',
      dataProcessing: 'transparent',
      marketing: 'opt_in',
      analytics: 'opt_in'
    };
  };

  return {
    privacyConfig,
    jurisdictionMessage: getJurisdictionMessage(),
    recommendedSettings: getRecommendedSettings(),
    isEU,
    isUS
  };
};