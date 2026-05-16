import { describe, expect, it } from 'vitest';
import { questions } from './questions';

describe('question quality checks', () => {
  it('ensures question bank integrity for required fields', () => {
    for (const q of questions) {
      expect(typeof q.id).toBe('string');
      expect(q.id.trim().length).toBeGreaterThan(0);
      expect(typeof q.prompt).toBe('string');
      expect(q.prompt.trim().length).toBeGreaterThan(0);
      expect(typeof q.section).toBe('string');
      expect(Array.isArray(q.options)).toBe(true);
      for (const option of q.options) {
        expect(typeof option.label).toBe('string');
        expect(option.label.trim().length).toBeGreaterThan(0);
        expect(typeof option.value).toBe('string');
        expect(option.value.trim().length).toBeGreaterThan(0);
        expect(typeof option.score).toBe('number');
      }
    }
  });

  it('has no duplicate question ids', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has at least 150 questions and expanded cognitive depth', () => {
    expect(questions.length).toBeGreaterThanOrEqual(150);
    expect(questions.filter((q) => q.section === 'cognitive').length).toBeGreaterThanOrEqual(50);
  });

  it('ensures cognitive questions have cognitiveDomain and include I don\'t know', () => {
    const cognitive = questions.filter((q) => q.section === 'cognitive');
    for (const q of cognitive) {
      expect(q.cognitiveDomain).toBeTruthy();
      expect(q.difficulty).toBeTruthy();
      expect(q.hint).toBeTruthy();
      expect(q.options.some((o) => o.label === "I don't know")).toBe(true);
      if (q.cognitiveDomain === 'memory') {
        expect(q.memoryPrompt?.trim().length).toBeGreaterThan(0);
        expect(q.memoryQuestion?.trim().length).toBeGreaterThan(0);
        expect((q.revealSeconds ?? 5)).toBeGreaterThan(0);
      }
    }
  });

  it('keeps OCEAN positive/reverse balance by trait', () => {
    for (const trait of ['open', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']) {
      const t = questions.filter((q) => q.section === 'ocean' && q.scoringDomain === trait);
      expect(t.length).toBe(8);
      expect(t.filter((q) => q.scoringDirection === 'positive').length).toBe(4);
      expect(t.filter((q) => q.scoringDirection === 'reverse').length).toBe(4);
    }
  });
});
