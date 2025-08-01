import { storage } from "../storage";

interface VPNAnalysis {
  isVPN: boolean;
  riskScore: number;
  provider?: string;
  country?: string;
  confidence: number;
  reasons: string[];
  recommendation: 'BLOCK' | 'FLAG' | 'ALLOW';
}

interface IPInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  organization: string;
  asn: string;
  timezone: string;
  isDatacenter: boolean;
  isProxy: boolean;
  isTor: boolean;
  lastChecked: Date;
}

interface GeographicAnomaly {
  previousCountry: string;
  currentCountry: string;
  timeElapsed: number;
  physicalDistance: number;
  impossibleTravel: boolean;
}

export class VPNDetectionService {
  private readonly VPN_PROVIDERS = [
    'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'purevpn',
    'hotspot shield', 'tunnelbear', 'windscribe', 'protonvpn',
    'mullvad', 'private internet access', 'ipvanish', 'vypr',
    'hide.me', 'hola', 'zenmate', 'opera vpn'
  ];

  private readonly DATACENTER_PROVIDERS = [
    'amazon', 'google', 'microsoft', 'digitalocean', 'linode',
    'vultr', 'hetzner', 'contabo', 'scaleway', 'ovh'
  ];

  private readonly SUSPICIOUS_ASNS = [
    'AS13335', // Cloudflare
    'AS16509', // Amazon
    'AS15169', // Google
    'AS8075',  // Microsoft
    'AS14061', // DigitalOcean
  ];

  private readonly MAX_COUNTRY_SWITCHES_PER_DAY = 3;
  private readonly MIN_TRAVEL_TIME_HOURS = 2; // Minimum realistic travel time between countries
  
  private ipCache = new Map<string, IPInfo>();
  private ipHistory = new Map<string, Array<{ country: string; timestamp: Date }>>();

  async analyzeIP(ipAddress: string, userAgent?: string): Promise<VPNAnalysis> {
    // Skip localhost and private IPs
    if (this.isPrivateIP(ipAddress)) {
      return {
        isVPN: false,
        riskScore: 0,
        confidence: 1.0,
        reasons: ['Private/Local IP address'],
        recommendation: 'ALLOW'
      };
    }

    let reasons: string[] = [];
    let riskScore = 0;
    let confidence = 0.8;

    // Get IP information (with caching)
    const ipInfo = await this.getIPInfo(ipAddress);
    
    // 1. VPN Provider Detection
    const providerCheck = this.checkVPNProvider(ipInfo);
    if (providerCheck.isVPN) {
      riskScore += 60;
      reasons.push(`Known VPN provider: ${providerCheck.provider}`);
    }

    // 2. Datacenter Detection
    const datacenterCheck = this.checkDatacenter(ipInfo);
    if (datacenterCheck.isDatacenter) {
      riskScore += 40;
      reasons.push(`Datacenter IP: ${datacenterCheck.provider}`);
    }

    // 3. ASN Analysis
    const asnCheck = this.checkSuspiciousASN(ipInfo);
    if (asnCheck.isSuspicious) {
      riskScore += 30;
      reasons.push(`Suspicious ASN: ${ipInfo.asn}`);
    }

    // 4. Geographic Anomaly Detection
    const geoCheck = await this.checkGeographicAnomalies(ipAddress, ipInfo.country);
    if (geoCheck.hasAnomaly) {
      riskScore += 35;
      reasons.push(`Geographic anomaly: ${geoCheck.description}`);
    }

    // 5. Proxy/Tor Detection
    if (ipInfo.isProxy) {
      riskScore += 50;
      reasons.push('Proxy server detected');
    }

    if (ipInfo.isTor) {
      riskScore += 70;
      reasons.push('Tor exit node detected');
    }

    // 6. User Agent Consistency Check
    if (userAgent) {
      const consistencyCheck = this.checkUserAgentConsistency(ipInfo, userAgent);
      if (consistencyCheck.isInconsistent) {
        riskScore += 20;
        reasons.push(`User-Agent inconsistency: ${consistencyCheck.reason}`);
      }
    }

    // 7. Country Switching Frequency
    const switchingCheck = await this.checkCountrySwitching(ipAddress);
    if (switchingCheck.isExcessive) {
      riskScore += 25;
      reasons.push(`Excessive country switching: ${switchingCheck.switches} times today`);
    }

    // Determine recommendation
    let recommendation: 'BLOCK' | 'FLAG' | 'ALLOW' = 'ALLOW';
    if (riskScore >= 70) {
      recommendation = 'BLOCK';
      confidence = 0.9;
    } else if (riskScore >= 40) {
      recommendation = 'FLAG';
      confidence = 0.8;
    }

    // Store in history for future analysis
    await this.storeIPHistory(ipAddress, ipInfo.country);

    return {
      isVPN: riskScore >= 40,
      riskScore,
      provider: providerCheck.provider,
      country: ipInfo.country,
      confidence,
      reasons,
      recommendation
    };
  }

  private async getIPInfo(ipAddress: string): Promise<IPInfo> {
    // Check cache first
    const cached = this.ipCache.get(ipAddress);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    // In production, integrate with real IP geolocation service
    // For now, simulate with intelligent defaults based on IP patterns
    const ipInfo = await this.simulateIPLookup(ipAddress);
    
    // Cache the result
    this.ipCache.set(ipAddress, ipInfo);
    
    return ipInfo;
  }

  private async simulateIPLookup(ipAddress: string): Promise<IPInfo> {
    // Simulate IP geolocation lookup with realistic patterns
    const isDatacenter = this.detectDatacenterPattern(ipAddress);
    const isTor = this.detectTorPattern(ipAddress);
    const isProxy = this.detectProxyPattern(ipAddress);
    
    // Generate realistic country based on IP range
    const country = this.guessCountryFromIP(ipAddress);
    
    return {
      ip: ipAddress,
      country,
      region: 'Unknown',
      city: 'Unknown',
      isp: isDatacenter ? 'DataCenter Corp' : 'Regular ISP',
      organization: isDatacenter ? 'Cloud Provider' : 'Internet Service Provider',
      asn: isDatacenter ? 'AS16509' : 'AS7922',
      timezone: 'UTC',
      isDatacenter,
      isProxy,
      isTor,
      lastChecked: new Date()
    };
  }

  private checkVPNProvider(ipInfo: IPInfo): { isVPN: boolean; provider?: string } {
    const orgLower = ipInfo.organization.toLowerCase();
    const ispLower = ipInfo.isp.toLowerCase();
    
    for (const provider of this.VPN_PROVIDERS) {
      if (orgLower.includes(provider) || ispLower.includes(provider)) {
        return { isVPN: true, provider };
      }
    }
    
    return { isVPN: false };
  }

  private checkDatacenter(ipInfo: IPInfo): { isDatacenter: boolean; provider?: string } {
    if (ipInfo.isDatacenter) {
      const orgLower = ipInfo.organization.toLowerCase();
      
      for (const provider of this.DATACENTER_PROVIDERS) {
        if (orgLower.includes(provider)) {
          return { isDatacenter: true, provider };
        }
      }
      
      return { isDatacenter: true, provider: 'Unknown datacenter' };
    }
    
    return { isDatacenter: false };
  }

  private checkSuspiciousASN(ipInfo: IPInfo): { isSuspicious: boolean } {
    return {
      isSuspicious: this.SUSPICIOUS_ASNS.includes(ipInfo.asn)
    };
  }

  private async checkGeographicAnomalies(ipAddress: string, currentCountry: string): Promise<{ hasAnomaly: boolean; description?: string }> {
    const history = this.ipHistory.get(ipAddress) || [];
    
    if (history.length === 0) {
      return { hasAnomaly: false };
    }
    
    const lastEntry = history[history.length - 1];
    
    if (lastEntry.country !== currentCountry) {
      const timeElapsed = Date.now() - lastEntry.timestamp.getTime();
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);
      
      // Check if travel time is physically impossible
      if (hoursElapsed < this.MIN_TRAVEL_TIME_HOURS) {
        return {
          hasAnomaly: true,
          description: `Impossible travel: ${lastEntry.country} to ${currentCountry} in ${hoursElapsed.toFixed(1)} hours`
        };
      }
    }
    
    return { hasAnomaly: false };
  }

  private checkUserAgentConsistency(ipInfo: IPInfo, userAgent: string): { isInconsistent: boolean; reason?: string } {
    // Basic User-Agent analysis
    const isWindows = userAgent.includes('Windows');
    const isMac = userAgent.includes('Mac');
    const isLinux = userAgent.includes('Linux');
    const isMobile = userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone');
    
    // Check for common VPN user agent patterns
    if (userAgent.includes('anonymized') || userAgent.includes('proxy')) {
      return { isInconsistent: true, reason: 'Anonymized user agent' };
    }
    
    // Check for datacenter + desktop combination (suspicious)
    if (ipInfo.isDatacenter && (isWindows || isMac) && !isMobile) {
      return { isInconsistent: true, reason: 'Desktop browser from datacenter IP' };
    }
    
    return { isInconsistent: false };
  }

  private async checkCountrySwitching(ipAddress: string): Promise<{ isExcessive: boolean; switches: number }> {
    const history = this.ipHistory.get(ipAddress) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEntries = history.filter(entry => entry.timestamp >= today);
    const uniqueCountries = new Set(todayEntries.map(entry => entry.country));
    
    return {
      isExcessive: uniqueCountries.size > this.MAX_COUNTRY_SWITCHES_PER_DAY,
      switches: uniqueCountries.size
    };
  }

  private async storeIPHistory(ipAddress: string, country: string): Promise<void> {
    let history = this.ipHistory.get(ipAddress) || [];
    
    // Add new entry
    history.push({ country, timestamp: new Date() });
    
    // Keep only last 50 entries
    if (history.length > 50) {
      history = history.slice(-50);
    }
    
    this.ipHistory.set(ipAddress, history);
  }

  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^127\./, // Localhost
      /^192\.168\./, // Private class C
      /^10\./, // Private class A
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 private
    ];
    
    return privateRanges.some(range => range.test(ip));
  }

  private isCacheValid(ipInfo: IPInfo): boolean {
    const cacheAge = Date.now() - ipInfo.lastChecked.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return cacheAge < maxAge;
  }

  private detectDatacenterPattern(ip: string): boolean {
    // Simple pattern detection for common datacenter IP ranges
    const datacenterPatterns = [
      /^54\./, // AWS EC2
      /^52\./, // AWS EC2
      /^18\./, // AWS EC2
      /^34\./, // Google Cloud
      /^35\./, // Google Cloud
      /^104\./, // Various datacenters
      /^138\./, // Various datacenters
    ];
    
    return datacenterPatterns.some(pattern => pattern.test(ip));
  }

  private detectTorPattern(ip: string): boolean {
    // Simulate Tor detection (in production, use real Tor exit node list)
    return Math.random() < 0.01; // 1% chance for simulation
  }

  private detectProxyPattern(ip: string): boolean {
    // Simulate proxy detection
    return Math.random() < 0.05; // 5% chance for simulation
  }

  private guessCountryFromIP(ip: string): string {
    // Very basic IP to country mapping for simulation
    const firstOctet = parseInt(ip.split('.')[0]);
    
    if (firstOctet >= 1 && firstOctet <= 50) return 'US';
    if (firstOctet >= 51 && firstOctet <= 100) return 'GB';
    if (firstOctet >= 101 && firstOctet <= 150) return 'DE';
    if (firstOctet >= 151 && firstOctet <= 200) return 'FR';
    if (firstOctet >= 201 && firstOctet <= 255) return 'IT';
    
    return 'Unknown';
  }

  // Public methods for API endpoints
  async getVPNStats(): Promise<any> {
    const totalIPs = this.ipCache.size;
    const datacenterIPs = Array.from(this.ipCache.values()).filter(ip => ip.isDatacenter).length;
    const proxyIPs = Array.from(this.ipCache.values()).filter(ip => ip.isProxy).length;
    const torIPs = Array.from(this.ipCache.values()).filter(ip => ip.isTor).length;
    
    const countries = Array.from(this.ipCache.values()).map(ip => ip.country);
    const uniqueCountries = new Set(countries).size;
    
    return {
      totalIPsAnalyzed: totalIPs,
      datacenterIPs,
      proxyIPs,
      torIPs,
      uniqueCountries,
      cacheHitRate: this.calculateCacheHitRate(),
      topCountries: this.getTopCountries(countries)
    };
  }

  async testIP(ipAddress: string): Promise<VPNAnalysis> {
    return this.analyzeIP(ipAddress, 'Mozilla/5.0 (Test Agent)');
  }

  private calculateCacheHitRate(): number {
    // Simplified cache hit rate calculation
    return Math.random() * 100; // Simulate for now
  }

  private getTopCountries(countries: string[]): Array<{ country: string; count: number }> {
    const countMap = new Map<string, number>();
    
    countries.forEach(country => {
      countMap.set(country, (countMap.get(country) || 0) + 1);
    });
    
    return Array.from(countMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

export const vpnDetection = new VPNDetectionService();