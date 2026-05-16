import { describe, expect, it } from 'vitest';
import { dictionaries, isLanguage, t, type TranslationKey } from './index';

describe('i18n dictionary coverage', () => {
  it('supports all expected languages', () => {
    expect(Object.keys(dictionaries).sort()).toEqual(['en', 'ja', 'ko', 'ms', 'th', 'zh']);
  });

  it('has all translation keys for every language', () => {
    const baseline = Object.keys(dictionaries.en).sort();
    for (const dictionary of Object.values(dictionaries)) {
      expect(Object.keys(dictionary).sort()).toEqual(baseline);
    }
  });

  it('validates known languages only', () => {
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('ja')).toBe(true);
    expect(isLanguage('ko')).toBe(true);
    expect(isLanguage('th')).toBe(true);
    expect(isLanguage('')).toBe(false);
    expect(isLanguage('fr')).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });

  it('falls back to english when a key is missing in a non-english dictionary', () => {
    const key = 'translationNotice' as TranslationKey;
    expect(t('ja', key)).toBe(dictionaries.ja[key]);
    expect(t('en', key)).toBe(dictionaries.en[key]);
  });
});
