import React from 'react';
import { Globe } from 'lucide-react';

// Simplified English-only global banner
export default function LanguageBanner() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 border-b border-white/20 py-3">
      <div className="flex items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">
            Global Platform
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">
            Available Worldwide
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-base">🌍</span>
          <span className="text-sm text-gray-300">
            English Interface
          </span>
        </div>
      </div>
    </div>
  );
}