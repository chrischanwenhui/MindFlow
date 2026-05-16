import { describe, expect, it } from 'vitest';
import { questions } from './questions';

const bannedTerms = ['reflection item', 'scenario', 'Option A', 'Option B', 'Option C', 'Option D'];
const genericOptionLabels = new Set(['option', 'choice', 'select', 'answer']);

describe('question quality checks', () => {
  it('bank size and cognitive depth stay expanded', () => {
    expect(questions.length).toBeGreaterThanOrEqual(150);
    expect(questions.filter((q) => q.section === 'cognitive').length).toBeGreaterThanOrEqual(50);
  });

  it('prevents placeholder wording in all user-facing fields', () => {
    for (const q of questions) {
      const fields = [q.prompt, q.hint, q.memoryPrompt, q.memoryQuestion, ...q.options.map((o) => o.label)].filter(Boolean) as string[];
      for (const field of fields) {
        const lower = field.toLowerCase();
        expect(bannedTerms.some((term) => lower.includes(term.toLowerCase()))).toBe(false);
      }
    }
  });

  it('ensures meaningful prompt and option labels', () => {
    for (const q of questions) {
      expect(q.prompt.trim().length).toBeGreaterThanOrEqual(12);
      for (const o of q.options) {
        const normalized = o.label.trim();
        expect(normalized.length).toBeGreaterThanOrEqual(2);
        expect(genericOptionLabels.has(normalized.toLowerCase())).toBe(false);
      }
    }
  });

  it('rejects cognitive single-letter labels and validates cognitive structure', () => {
    const cognitive = questions.filter((q) => q.section === 'cognitive');
    const singleLetter = new Set(['A', 'B', 'C', 'D']);
    for (const q of cognitive) {
      expect(q.cognitiveDomain).toBeTruthy();
      expect(q.difficulty).toBeTruthy();
      expect(q.hint).toBeTruthy();
      expect(q.options[q.options.length - 1].label).toBe("I don't know");
      expect(q.options[q.options.length - 1].score).toBe(0);
      for (const o of q.options) {
        expect(singleLetter.has(o.label.trim())).toBe(false);
      }
      const nonIdk = q.options.slice(0, -1);
      expect(nonIdk.filter((o) => o.score === 2).length).toBe(1);
      expect(nonIdk.filter((o) => o.score === 0).length).toBe(nonIdk.length - 1);
    }
  });

  it('keeps OCEAN at 8 per trait with 4 positive and 4 reverse', () => {
    const ocean = questions.filter((q) => q.section === 'ocean');
    const traits = ['open', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    for (const trait of traits) {
      const traitQuestions = ocean.filter((q) => q.scoringDomain === trait);
      expect(traitQuestions.length).toBe(8);
      expect(traitQuestions.filter((q) => q.scoringDirection === 'positive').length).toBe(4);
      expect(traitQuestions.filter((q) => q.scoringDirection === 'reverse').length).toBe(4);
    }
  });
});
