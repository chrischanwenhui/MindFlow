import { en } from './en';
import { zh } from './zh';
import { ms } from './ms';

export const dictionaries = { en, zh, ms } as const;
export type Language = keyof typeof dictionaries;
export type TranslationKey = keyof typeof en;

export const DEFAULT_LANGUAGE: Language = 'en';
export const LANGUAGE_STORAGE_KEY = 'mindflow_language_v1';

export function isLanguage(value: string | null): value is Language {
  return !!value && Object.keys(dictionaries).includes(value);
}

export function getInitialLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(saved) ? saved : DEFAULT_LANGUAGE;
}

export function t(language: Language, key: TranslationKey): string {
  return dictionaries[language]?.[key] ?? dictionaries.en[key];
}
