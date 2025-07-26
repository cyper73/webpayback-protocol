import React from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
];

export default function LanguageBannerSimple() {
  return (
    <div className="bg-blue-600/20 text-white py-2 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">
              🌍 WebPayback - Piattaforma Globale
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {LANGUAGES.slice(0, 8).map((lang) => (
              <button
                key={lang.code}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                onClick={() => console.log(`Lingua selezionata: ${lang.name}`)}
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="text-xs text-gray-300 hidden sm:inline">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
          
          <span className="text-sm text-gray-300">
            ✨ Disponibile in 12 lingue
          </span>
        </div>
      </div>
    </div>
  );
}