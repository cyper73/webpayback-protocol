import React, { useState, useEffect } from 'react';
import TwoFactorGate from './TwoFactorGate';
import CreatorPortal from '../creators/CreatorPortal';

export default function ProtectedCreatorPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const isVerified = sessionStorage.getItem('webpayback_2fa_verified');
    const timestamp = sessionStorage.getItem('webpayback_2fa_timestamp');
    
    if (isVerified === 'true' && timestamp) {
      const authTime = parseInt(timestamp);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - authTime < maxAge) {
        setIsAuthenticated(true);
      } else {
        // Session expired, clear storage
        sessionStorage.removeItem('webpayback_2fa_verified');
        sessionStorage.removeItem('webpayback_2fa_timestamp');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleAuthenticationSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <TwoFactorGate
        onAuthenticationSuccess={handleAuthenticationSuccess}
        requiredFor="Creator Portal"
      />
    );
  }

  return <CreatorPortal />;
}