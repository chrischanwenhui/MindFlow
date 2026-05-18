import { describe, expect, it } from 'vitest';
import { questions } from './questions';

const bannedTerms = ['reflection item', 'scenario', 'Option A', 'Option B', 'Option C', 'Option D'];
const validRiasec = new Set(['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional']);

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
      expect(q.prompt).not.toMatch(/\(\d+\)/);
      for (const o of q.options) {
        const normalized = o.label.trim();
        expect(normalized.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('rejects cognitive single-letter labels and validates cognitive structure', () => {
    const cognitive = questions.filter((q) => q.section === 'cognitive');
    const singleLetter = new Set(['A', 'B', 'C', 'D']);
    for (const q of cognitive) {
      expect(q.cognitiveDomain).toBeTruthy();
      expect(q.difficulty).toBeTruthy();
      expect(q.cognitiveFormat).toBeTruthy();
      expect(q.hint).toBeTruthy();
      if (q.timed) expect(q.recommendedSeconds).toBeTruthy();
      expect(q.options[q.options.length - 1].label).toBe("I don't know");
      expect(q.options[q.options.length - 1].score).toBe(0);
      for (const o of q.options) expect(singleLetter.has(o.label.trim())).toBe(false);
      const nonIdk = q.options.slice(0, -1);
      expect(nonIdk.filter((o) => o.score === 2).length).toBe(1);
      expect(nonIdk.filter((o) => o.score === 0).length).toBe(nonIdk.length - 1);
    }
  });

  it('prevents user-facing IQ score phrasing', () => {
    for (const q of questions) {
      const fields = [q.prompt, q.hint, q.memoryPrompt, q.memoryQuestion, ...q.options.map((o) => o.label)].filter(Boolean) as string[];
      for (const field of fields) expect(field.toLowerCase()).not.toContain('iq score');
    }
  });

  it('preserves question-specific cognitive metadata overrides', () => {
    const customTimedMemory = questions.find((q) => q.id === 'cog-memory-1');
    expect(customTimedMemory).toBeTruthy();
    expect(customTimedMemory?.timed).toBe(true);
    expect(customTimedMemory?.recommendedSeconds).toBe(25);
  });

  it('keeps OCEAN at 8 per trait with first 4 positive and last 4 reverse', () => {
    const ocean = questions.filter((q) => q.section === 'ocean');
    for (const trait of ['open', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']) {
      const t = ocean.filter((q) => q.scoringDomain === trait).sort((a, b) => a.id.localeCompare(b.id));
      expect(t.length).toBe(8);
      t.forEach((q, i) => expect(q.scoringDirection).toBe(i >= 4 ? 'reverse' : 'positive'));
    }
  });



  it('keeps MBTI pool balanced at 20 items per dichotomy', () => {
    const mbti = questions.filter((q) => q.section === 'mbti');
    expect(mbti.length).toBe(80);
    expect(mbti.filter((q) => q.scoringDomain === 'ei').length).toBe(20);
    expect(mbti.filter((q) => q.scoringDomain === 'sn').length).toBe(20);
    expect(mbti.filter((q) => q.scoringDomain === 'tf').length).toBe(20);
    expect(mbti.filter((q) => q.scoringDomain === 'jp').length).toBe(20);
  });

  it('blocks low-quality MBTI stereotype wording', () => {
    const banned = ['outgoing', 'emotional', 'messy', 'organized', 'introvert', 'extrovert'];
    for (const q of questions.filter((item) => item.section === 'mbti')) {
      const fields = [q.prompt, ...q.options.map((o) => o.label)].map((v) => v.toLowerCase());
      for (const field of fields) {
        for (const term of banned) expect(field).not.toContain(term);
      }
    }
  });


  it('keeps MBTI first-option polarity statically balanced by dichotomy', () => {
    const mbti = questions.filter((q) => q.section === 'mbti');
    const pairs: Array<[string, string]> = [['ei', 'E'], ['sn', 'S'], ['tf', 'T'], ['jp', 'J']];
    for (const [domain, firstPolarity] of pairs) {
      const domainQuestions = mbti.filter((q) => q.scoringDomain === domain);
      const firstCount = domainQuestions.filter((q) => q.options[0]?.value === firstPolarity).length;
      expect(firstCount).toBeGreaterThanOrEqual(8);
      expect(firstCount).toBeLessThanOrEqual(12);
    }
  });

  it('keeps MBTI IDs unique and option scoring valid', () => {
    const mbti = questions.filter((q) => q.section === 'mbti');
    expect(new Set(mbti.map((q) => q.id)).size).toBe(mbti.length);
    for (const q of mbti) {
      expect(q.options.length).toBe(2);
      expect(q.options[0].score).toBe(2);
      expect(q.options[1].score).toBe(2);
      expect(q.options[0].value).not.toBe(q.options[1].value);
    }
  });

  it('validates RIASEC option categories and no fallback bias', () => {
    const riasec = questions.filter((q) => q.section === 'riasec');
    for (const q of riasec) {
      for (const o of q.options) {
        expect(validRiasec.has(o.value)).toBe(true);
      }
      expect(new Set(q.options.map((o) => o.value)).size).toBe(3);
    }
  });
});
