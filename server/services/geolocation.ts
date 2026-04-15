/**
 * IP Geolocation Service for Automatic Privacy Compliance Detection
 * Detects user jurisdiction to apply appropriate privacy laws (GDPR/CCPA)
 */

import { Request } from 'express';

interface GeolocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  jurisdiction: 'EU' | 'US' | 'OTHER';
  privacyLaw: 'GDPR' | 'CCPA' | 'NONE';
  requiresCookieConsent: boolean;
  requiresOptOut: boolean;
}

// EU countries subject to GDPR
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 
  'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 
  'SE', 'SI', 'SK', 'IS', 'LI', 'NO', 'CH' // Including EEA countries
];

// US states subject to comprehensive privacy laws
const US_PRIVACY_STATES = ['CA', 'VA', 'CO', 'CT', 'UT']; // California, Virginia, Colorado, Connecticut, Utah

/**
 * Get user's geolocation from IP address
 */
export async function getGeolocationFromIP(req: Request): Promise<GeolocationData> {
  try {
    const clientIP = getClientIP(req);
    
    // For development/localhost, simulate based on headers or default
    if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.')) {
      return getSimulatedLocation(req);
    }

    // In production, use a real geolocation service
    const geoData = await fetchGeolocationData(clientIP);
    
    return {
      country: geoData.country || 'Unknown',
      countryCode: geoData.country_code?.toUpperCase() || 'XX',
      region: geoData.region || 'Unknown',
      city: geoData.city || 'Unknown',
      jurisdiction: determineJurisdiction(geoData.country_code, geoData.region),
      privacyLaw: determinePrivacyLaw(geoData.country_code, geoData.region),
      requiresCookieConsent: requiresCookieConsent(geoData.country_code),
      requiresOptOut: requiresOptOut(geoData.country_code, geoData.region)
    };
  } catch (error) {
    console.error('Geolocation detection failed:', error);
    return getDefaultLocation();
  }
}

/**
 * Extract client IP from request headers
 */
function getClientIP(req: Request): string {
  return (
    req.headers['cf-connecting-ip'] as string ||
    req.headers['x-real-ip'] as string ||
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

/**
 * Fetch geolocation data from IP
 * Using free ipapi.co service (100 requests/day limit)
 */
async function fetchGeolocationData(ip: string): Promise<any> {
  try {
    // Use multiple free services as fallback
    const services = [
      `http://ip-api.com/json/${ip}?fields=country,countryCode,region,city,status`,
      `https://ipapi.co/${ip}/json/`,
      `http://www.geoplugin.net/json.gp?ip=${ip}`
    ];

    for (const serviceUrl of services) {
      try {
        const response = await fetch(serviceUrl, {
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'WebPayback-Protocol/1.0' }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Normalize response format
          return {
            country: data.country || data.geoplugin_countryName,
            country_code: data.countryCode || data.country_code || data.geoplugin_countryCode,
            region: data.region || data.region_code || data.geoplugin_regionCode,
            city: data.city || data.geoplugin_city
          };
        }
      } catch (serviceError) {
        console.log(`Geolocation service failed: ${serviceUrl}`, serviceError);
        continue;
      }
    }
    
    throw new Error('All geolocation services failed');
  } catch (error) {
    console.error('Geolocation fetch error:', error);
    throw error;
  }
}

/**
 * Simulate location for development/testing
 */
function getSimulatedLocation(req: Request): GeolocationData {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  
  // Simulate based on headers
  if (acceptLanguage.includes('it-IT') || acceptLanguage.includes('it')) {
    return {
      country: 'Italy',
      countryCode: 'IT',
      region: 'Lazio',
      city: 'Rome',
      jurisdiction: 'EU',
      privacyLaw: 'GDPR',
      requiresCookieConsent: true,
      requiresOptOut: false
    };
  }
  
  if (acceptLanguage.includes('en-US') || acceptLanguage.includes('en')) {
    return {
      country: 'United States',
      countryCode: 'US',
      region: 'CA',
      city: 'Los Angeles',
      jurisdiction: 'US',
      privacyLaw: 'CCPA',
      requiresCookieConsent: false,
      requiresOptOut: true
    };
  }

  return getDefaultLocation();
}

/**
 * Default location when detection fails
 */
function getDefaultLocation(): GeolocationData {
  return {
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown',
    jurisdiction: 'OTHER',
    privacyLaw: 'NONE',
    requiresCookieConsent: false,
    requiresOptOut: false
  };
}

/**
 * Determine jurisdiction based on country/region
 */
function determineJurisdiction(countryCode: string, region: string): 'EU' | 'US' | 'OTHER' {
  if (!countryCode) return 'OTHER';
  
  const code = countryCode.toUpperCase();
  
  if (EU_COUNTRIES.includes(code)) {
    return 'EU';
  }
  
  if (code === 'US') {
    return 'US';
  }
  
  return 'OTHER';
}

/**
 * Determine applicable privacy law
 */
function determinePrivacyLaw(countryCode: string, region: string): 'GDPR' | 'CCPA' | 'NONE' {
  if (!countryCode) return 'NONE';
  
  const code = countryCode.toUpperCase();
  
  if (EU_COUNTRIES.includes(code)) {
    return 'GDPR';
  }
  
  if (code === 'US' && region && US_PRIVACY_STATES.includes(region.toUpperCase())) {
    return 'CCPA';
  }
  
  return 'NONE';
}

/**
 * Check if cookie consent is required
 */
function requiresCookieConsent(countryCode: string): boolean {
  return countryCode ? EU_COUNTRIES.includes(countryCode.toUpperCase()) : false;
}

/**
 * Check if opt-out is required (CCPA)
 */
function requiresOptOut(countryCode: string, region: string): boolean {
  if (countryCode !== 'US') return false;
  return region ? US_PRIVACY_STATES.includes(region.toUpperCase()) : false;
}

/**
 * Get privacy compliance configuration for frontend
 */
export function getPrivacyConfig(geoData: GeolocationData) {
  return {
    jurisdiction: geoData.jurisdiction,
    privacyLaw: geoData.privacyLaw,
    features: {
      cookieBanner: geoData.requiresCookieConsent,
      doNotSellButton: geoData.requiresOptOut,
      gdprRights: geoData.privacyLaw === 'GDPR',
      ccpaRights: geoData.privacyLaw === 'CCPA',
      dataRetention: geoData.privacyLaw !== 'NONE',
      rightToDelete: geoData.privacyLaw !== 'NONE',
      dataPortability: geoData.privacyLaw !== 'NONE'
    },
    location: {
      country: geoData.country,
      region: geoData.region,
      detectedAt: new Date().toISOString()
    }
  };
}