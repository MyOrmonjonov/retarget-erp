import { useAuthStore } from '@/features/auth/store/authStore';
import { translations, type Language } from './translations';

/** Looks up a static UI string in the current language, falling back to Uzbek (and then the
 * raw key) if a translation is missing - never used for user-entered content. */
export function useT() {
  const uiLanguage = useAuthStore((s) => s.uiLanguage) as Language;
  return (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[uiLanguage] ?? entry.uz ?? key;
  };
}
