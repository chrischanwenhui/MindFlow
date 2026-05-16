import { describe, expect, it } from 'vitest';
import { questions } from './questions';

describe('question quality checks', () => {
  it('has at least 150 questions and expanded cognitive depth', () => {
    expect(questions.length).toBeGreaterThanOrEqual(150);
    expect(questions.filter((q) => q.section === 'cognitive').length).toBeGreaterThanOrEqual(50);
  });

  it('has no duplicate question ids and required fields', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of questions) {
      expect(q.id).toBeTruthy();
      expect(q.prompt).toBeTruthy();
      expect(q.section).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      for (const o of q.options) {
        expect(o.label).toBeTruthy();
        expect(o.value).toBeTruthy();
        expect(typeof o.score).toBe('number');
      }
    }
  });

  it('keeps MBTI dimension option values aligned with ids', () => {
    const check = (prefix: string, allowed: string[]) => {
      const subset = questions.filter((q) => q.id.startsWith(prefix));
      expect(subset.length).toBeGreaterThan(0);
      for (const q of subset) {
        const values = new Set(q.options.map((o) => o.value));
        expect([...values].every((v) => allowed.includes(v))).toBe(true);
      }
    };
    check('mbti-ei-', ['E', 'I']);
    check('mbti-sn-', ['S', 'N']);
    check('mbti-tf-', ['T', 'F']);
    check('mbti-jp-', ['J', 'P']);
  });

  it('validates cognitive depth and answer integrity', () => {
    const cognitive = questions.filter((q) => q.section === 'cognitive');
    const counts = Object.fromEntries(['pattern', 'verbal', 'numerical', 'spatial', 'memory'].map((d) => [d, cognitive.filter((q) => q.cognitiveDomain === d).length]));
    expect(counts.pattern).toBeGreaterThanOrEqual(12);
    expect(counts.verbal).toBeGreaterThanOrEqual(10);
    expect(counts.numerical).toBeGreaterThanOrEqual(10);
    expect(counts.spatial).toBeGreaterThanOrEqual(8);
    expect(counts.memory).toBeGreaterThanOrEqual(10);

    const correctPositions = new Set<number>();
    for (const q of cognitive) {
      expect(q.hint).toBeTruthy();
      expect(q.cognitiveDomain).toBeTruthy();
      expect(q.difficulty).toBeTruthy();
      expect(q.options.length).toBe(5);
      const idk = q.options[q.options.length - 1];
      expect(idk.label).toBe("I don't know");
      expect(idk.score).toBe(0);
      const scored = q.options.slice(0, 4).map((o) => o.score);
      const twos = scored.filter((s) => s === 2).length;
      expect(twos).toBe(1);
      expect(scored.filter((s) => s === 0).length).toBe(3);
      correctPositions.add(scored.findIndex((s) => s === 2));
      if (q.cognitiveDomain === 'memory') {
        expect(q.memoryPrompt).toBeTruthy();
        expect(q.memoryQuestion).toBeTruthy();
        expect(q.revealSeconds).toBeGreaterThan(0);
      }
    }
    expect(correctPositions.size).toBeGreaterThan(1);
  });
});
