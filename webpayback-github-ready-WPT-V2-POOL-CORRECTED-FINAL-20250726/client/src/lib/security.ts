/**
 * Security utilities for XSS prevention and input sanitization
 */

// XSS Prevention: HTML entity encoding
export const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

// XSS Prevention: URL validation and sanitization
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return '';
    }
    
    // Remove dangerous characters
    return url.replace(/[<>"']/g, '');
  } catch {
    return '';
  }
}

// XSS Prevention: Input field sanitization
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove basic HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, maxLength);
}

// XSS Prevention: Wallet address validation
export const sanitizeWalletAddress = (address: string): string => {
  if (typeof address !== 'string') return '';
  
  // Ethereum address format: 0x followed by 40 hex characters
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  if (ethAddressRegex.test(address)) {
    return address;
  }
  
  return '';
}

// XSS Prevention: Error message sanitization
export const sanitizeErrorMessage = (message: string): string => {
  if (typeof message !== 'string') return 'An error occurred';
  
  return escapeHtml(message)
    .substring(0, 500) // Limit error message length
    .replace(/\n/g, ' '); // Remove newlines
}

// XSS Prevention: Toast notification sanitization
export const sanitizeToastContent = (content: { title?: string; description?: string }) => {
  return {
    title: content.title ? escapeHtml(content.title).substring(0, 100) : '',
    description: content.description ? escapeHtml(content.description).substring(0, 300) : ''
  };
}

// Content Security Policy helpers
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// XSS Prevention: Domain validation for creator registration
export const validateDomain = (domain: string): boolean => {
  if (!domain || typeof domain !== 'string') return false;
  
  try {
    const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
    
    // Check for suspicious patterns
    if (url.hostname.includes('<') || url.hostname.includes('>')) return false;
    if (url.pathname.includes('<script') || url.pathname.includes('javascript:')) return false;
    
    return true;
  } catch {
    return false;
  }
}

// XSS Prevention: Content category sanitization
export const sanitizeContentCategory = (category: string): string => {
  if (typeof category !== 'string') return '';
  
  const allowedCategories = [
    'Blog/Articles', 'Video Content', 'Social Media', 'Academic Papers',
    'News/Journalism', 'Creative Writing', 'Technical Documentation',
    'Photography', 'Art/Design', 'Music', 'Podcast', 'Educational Content',
    'Business Content', 'Other'
  ];
  
  return allowedCategories.includes(category) ? category : 'Other';
}