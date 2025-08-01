// Simplified English-only translation hook
export const useTranslations = () => {
  const t = (key: string, fallback?: string): string => {
    // Return the fallback or key for English-only interface
    return fallback || key;
  };
  
  return {
    t,
    currentLanguage: 'en',
    changeLanguage: () => {}, // No-op for English-only
    supportedLanguages: ['en']
  };
};

export default useTranslations;