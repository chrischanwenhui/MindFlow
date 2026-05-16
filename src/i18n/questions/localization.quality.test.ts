import { describe, expect, it } from 'vitest';
import { questions } from '../../data/questions';
import { localizeQuestion } from './index';
import { zhQuestionTranslations } from './zh';
import { msQuestionTranslations } from './ms';
import { jaQuestionTranslations } from './ja';
import { koQuestionTranslations } from './ko';
import { thQuestionTranslations } from './th';

describe('question localization quality checks', () => {
  it('keeps translated question IDs aligned with source IDs', () => {
    const ids = questions.map((q) => q.id);
    const localizedIds = questions.map((q) => localizeQuestion(q, 'zh').id);
    expect(localizedIds).toEqual(ids);
  });

  it('keeps translated option count aligned with source', () => {
    for (const language of ['en', 'zh', 'ms', 'ja', 'ko', 'th'] as const) {
      for (const q of questions) {
        expect(localizeQuestion(q, language).options).toHaveLength(q.options.length);
      }
    }
  });

  it('keeps memory prompts/questions available where needed', () => {
    const memory = questions.filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory');
    for (const language of ['en', 'zh', 'ms', 'ja', 'ko', 'th'] as const) {
      for (const q of memory) {
        const localized = localizeQuestion(q, language);
        expect(localized.memoryPrompt?.trim().length).toBeGreaterThan(0);
        expect(localized.memoryQuestion?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('keeps explicit translated option arrays aligned with source option counts', () => {
    const maps = [zhQuestionTranslations, msQuestionTranslations, jaQuestionTranslations, koQuestionTranslations, thQuestionTranslations];
    for (const map of maps) {
      for (const q of questions) {
        const translatedOptions = map[q.id]?.options;
        if (translatedOptions) {
          expect(translatedOptions).toHaveLength(q.options.length);
        }
      }
    }
  });

  it('falls back to English/source values if translation is missing', () => {
    const q = questions.find((item) => item.id === 'mbti-ei-2');
    if (!q) throw new Error('expected question');
    const localized = localizeQuestion(q, 'zh');
    expect(localized.prompt).toBe(q.prompt);
  });
});
