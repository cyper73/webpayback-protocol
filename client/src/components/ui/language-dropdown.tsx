import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

interface LanguageDropdownProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

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

export default function LanguageDropdown({ currentLanguage, onLanguageChange }: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  useEffect(() => {
    setSelectedLang(currentLanguage);
  }, [currentLanguage]);

  const getCurrentLanguageData = () => {
    return LANGUAGES.find(lang => lang.code === selectedLang) || LANGUAGES[0];
  };

  const handleLanguageSelect = (langCode: string) => {
    console.log('Language selected:', langCode);
    setSelectedLang(langCode);
    setIsOpen(false);
    onLanguageChange(langCode);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-dropdown')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentLang = getCurrentLanguageData();

  return (
    <div className="language-dropdown fixed top-4 right-4 z-[10000]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 border border-blue-500"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 min-w-[200px] max-h-[300px] overflow-y-auto z-[10001]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                selectedLang === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}