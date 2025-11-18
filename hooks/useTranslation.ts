/**
 * Translation Hook (Placeholder)
 * Basic translation structure for future i18n implementation
 * 
 * To implement full i18n:
 * 1. Install: npm install react-i18next i18next
 * 2. Replace this with actual i18next hook
 * 3. Load locale files dynamically
 */

import enTranslations from '@/locales/en.json';

type TranslationKey = string;

/**
 * Basic translation hook placeholder
 * Returns hardcoded English for now
 * Replace with react-i18next when ready
 */
export function useTranslation() {
  const t = (key: TranslationKey, params?: Record<string, any>): string => {
    // For now, just return the English value
    // Navigate nested keys (e.g., "feed.title")
    const keys = key.split('.');
    let value: any = enTranslations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value === 'string') {
      // Simple placeholder replacement
      if (params) {
        let result = value;
        Object.keys(params).forEach(param => {
          result = result.replace(`{{${param}}}`, String(params[param]));
        });
        return result;
      }
      return value;
    }
    
    return key; // Fallback to key if not found
  };

  return { t };
}

/**
 * Get current locale
 */
export function useLocale() {
  return 'en';
}

export default useTranslation;

