import { describe, expect, it } from 'vitest';
import { supportedLanguageOptions } from './LanguageSelector';

describe('LanguageSelector language coverage', () => {
  it('includes all supported language options in stable order', () => {
    expect(supportedLanguageOptions.map((option) => option.value)).toEqual(['en', 'zh', 'ms', 'ja', 'ko', 'th']);
  });
});
