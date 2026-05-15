import { describe, expect, it } from 'vitest';
import { questions } from './questions';

describe('question quality checks', () => {
  it('has no duplicate question ids', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ensures cognitive questions have cognitiveDomain and include I don\'t know', () => {
    const cognitive = questions.filter((q) => q.section === 'cognitive');
    for (const q of cognitive) {
      expect(q.cognitiveDomain).toBeTruthy();
      expect(q.options.some((o) => o.label === "I don't know")).toBe(true);
    }
  });

  it('ensures each question has at least 2 options and each option has label/value/score', () => {
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      for (const o of q.options) {
        expect(typeof o.label).toBe('string');
        expect(o.label.length).toBeGreaterThan(0);
        expect(typeof o.value).toBe('string');
        expect(o.value.length).toBeGreaterThan(0);
        expect(typeof o.score).toBe('number');
      }
    }
  });
});
