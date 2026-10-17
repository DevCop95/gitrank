import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGES, translations } from './translations';

const STORAGE_KEY = 'gittop_lang';
const LOCALES = { en: 'en-US', es: 'es-ES' };

/** Replaces {name} placeholders in a template. Exported for tests. */
export function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    params[key] === undefined || params[key] === null ? match : String(params[key])
  );
}

/** URL ?ui= wins, then the saved choice, then the browser language. */
export function detectLanguage() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('ui');
    if (LANGUAGES.includes(fromUrl)) return fromUrl;
  } catch {
    // ignore malformed URLs
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.includes(stored)) return stored;
  } catch {
    // storage can be blocked
  }
  const browser = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return browser.toLowerCase().startsWith('es') ? 'es' : 'en';
}

const I18nContext = createContext(null);

export function I18nProvider({ children, initialLang }) {
  const [lang, setLangState] = useState(() => initialLang || detectLanguage());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage can be blocked
    }
  }, []);

  const value = useMemo(() => {
    const dictionary = translations[lang];
    const locale = LOCALES[lang];
    const numberFormat = new Intl.NumberFormat(locale);
    return {
      lang,
      setLang,
      locale,
      t: (key, params) => interpolate(dictionary[key] ?? translations.en[key] ?? key, params),
      formatNumber: (n) => numberFormat.format(n || 0)
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
