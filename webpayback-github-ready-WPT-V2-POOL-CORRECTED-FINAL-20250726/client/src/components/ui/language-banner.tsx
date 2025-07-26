import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
  region: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', region: 'US' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', region: 'IT' },
  { code: 'es', name: 'Español', flag: '🇪🇸', region: 'ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', region: 'FR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', region: 'DE' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', region: 'PT' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', region: 'RU' },
  { code: 'zh', name: '中文', flag: '🇨🇳', region: 'CN' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', region: 'JP' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', region: 'KR' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', region: 'SA' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', region: 'IN' }
];

interface LanguageBannerProps {
  onLanguageChange?: (language: Language) => void;
  currentLanguage?: string;
}

export default function LanguageBanner({ 
  onLanguageChange, 
  currentLanguage = 'en' 
}: LanguageBannerProps) {
  const [isScrolling, setIsScrolling] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Auto-scroll animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScrolling(false);
    }, 10000); // Stop scrolling after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsDropdownOpen(false);
    onLanguageChange?.(language);
  };

  const getTranslation = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'select_language': {
        'en': 'Select Language',
        'it': 'Seleziona Lingua',
        'es': 'Seleccionar Idioma',
        'fr': 'Sélectionner la Langue',
        'de': 'Sprache auswählen',
        'pt': 'Selecionar Idioma',
        'ru': 'Выбрать язык',
        'zh': '选择语言',
        'ja': '言語を選択',
        'ko': '언어 선택',
        'ar': 'اختر اللغة',
        'hi': 'भाषा चुनें'
      },
      'global_platform': {
        'en': 'Global Platform',
        'it': 'Piattaforma Globale',
        'es': 'Plataforma Global',
        'fr': 'Plateforme Mondiale',
        'de': 'Globale Plattform',
        'pt': 'Plataforma Global',
        'ru': 'Глобальная платформа',
        'zh': '全球平台',
        'ja': 'グローバルプラットフォーム',
        'ko': '글로벌 플랫폼',
        'ar': 'منصة عالمية',
        'hi': 'वैश्विक मंच'
      },
      'available_worldwide': {
        'en': 'Available Worldwide',
        'it': 'Disponibile in tutto il mondo',
        'es': 'Disponible en todo el mundo',
        'fr': 'Disponible dans le monde entier',
        'de': 'Weltweit verfügbar',
        'pt': 'Disponível em todo o mundo',
        'ru': 'Доступно по всему миру',
        'zh': '全球可用',
        'ja': '世界中で利用可能',
        'ko': '전 세계 이용 가능',
        'ar': 'متاح في جميع أنحاء العالم',
        'hi': 'दुनिया भर में उपलब्ध'
      }
    };

    return translations[key]?.[selectedLanguage.code] || translations[key]?.['en'] || key;
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 border-b border-white/20 py-3">
      {/* Scrolling Languages */}
      <div className="overflow-hidden">
        <div className={`flex items-center gap-8 px-4 ${isScrolling ? 'animate-scroll' : ''}`}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              {getTranslation('global_platform')}
            </span>
          </div>
          
          {/* Scrolling Languages */}
          <div className="flex items-center gap-6">
            {SUPPORTED_LANGUAGES.concat(SUPPORTED_LANGUAGES).map((lang, index) => (
              <div 
                key={`${lang.code}-${index}`} 
                className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => handleLanguageSelect(lang)}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="text-sm text-gray-300 hover:text-white">
                  {lang.name}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-gray-300">
              {getTranslation('available_worldwide')}
            </span>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-slate-800/70 hover:bg-slate-700/70 px-3 py-1.5 rounded-lg border border-white/10 transition-all duration-200"
          >
            <span className="text-sm">{selectedLanguage.flag}</span>
            <span className="text-xs font-medium text-white">
              {selectedLanguage.name}
            </span>
            <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-400 px-2 py-1 mb-1">
                  {getTranslation('select_language')}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedLanguage.code === lang.code
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {lang.region}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}