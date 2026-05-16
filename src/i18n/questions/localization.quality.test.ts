import { describe, expect, it } from 'vitest';
import { questions } from '../../data/questions';
import { localizeQuestion } from './index';

describe('question localization quality checks', () => {
  it('keeps translated question IDs aligned with source IDs', () => {
    const ids = questions.map((q) => q.id);
    const localizedIds = questions.map((q) => localizeQuestion(q, 'zh').id);
    expect(localizedIds).toEqual(ids);
  });

  it('keeps translated option count aligned with source', () => {
    for (const language of ['en', 'zh', 'ms'] as const) {
      for (const q of questions) {
        expect(localizeQuestion(q, language).options).toHaveLength(q.options.length);
      }
    }
  });

  it('keeps memory prompts/questions available where needed', () => {
    const memory = questions.filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory');
    for (const language of ['en', 'zh', 'ms'] as const) {
      for (const q of memory) {
        const localized = localizeQuestion(q, language);
        expect(localized.memoryPrompt?.trim().length).toBeGreaterThan(0);
        expect(localized.memoryQuestion?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('falls back to English/source values if translation is missing', () => {
    const q = questions.find((item) => item.id === 'mbti-ei-1');
    if (!q) throw new Error('expected question');
    const localized = localizeQuestion(q, 'zh');
    expect(localized.prompt).toBe(q.prompt);
  });
});
