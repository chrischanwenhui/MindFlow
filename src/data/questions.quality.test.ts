import { describe, expect, it } from 'vitest';
import { en } from '../i18n/en';
import { questions } from './questions';

const bannedTerms = ['reflection item', 'scenario', 'Option A', 'Option B', 'Option C', 'Option D'];
const bannedCorporateTerms = [
  /\bstakeholders?\b/i,
  /\bdeliverables?\b/i,
  /\bproposals?\b/i,
  /\bbriefings?\b/i,
  /\balignment\b/i,
  /\bbandwidth\b/i,
  /\bsynergy\b/i,
  /\blaunch(?:ing)?\b/i,
  /\bdeploy(?:ing)?\b/i,
  /\boptimi[sz](?:e|ing)\b/i,
  /\bmapping\b/i,
  /\bescalat(?:e|ing|ion)\b/i,
  /\bboard room\b/i,
  /\bq3\b/i,
  /\bmetrics review\b/i
];
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

  it('keeps active English prompts and options free of unnecessary corporate jargon', () => {
    for (const q of questions) {
      const fields = [q.prompt, q.memoryPrompt, q.memoryQuestion, ...q.options.map((o) => o.label)].filter(Boolean) as string[];
      for (const field of fields) {
        for (const term of bannedCorporateTerms) expect(field).not.toMatch(term);
      }
    }
  });

  it('keeps core question data shape and scoring metadata present', () => {
    for (const q of questions) {
      expect(q.id).toMatch(/^[a-z0-9-]+$/);
      expect(q.section).toBeTruthy();
      expect(q.scoringDomain).toBeTruthy();
      expect(q.groupLabel).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      for (const option of q.options) {
        expect(option.label).toBeTruthy();
        expect(option.value).toBeTruthy();
        expect(typeof option.score).toBe('number');
      }
      if (q.section === 'ocean') expect(q.scoringDirection).toMatch(/^(positive|reverse)$/);
      if (q.section === 'cognitive') {
        expect(q.cognitiveDomain).toBeTruthy();
        expect(q.difficulty).toBeTruthy();
        expect(q.cognitiveFormat).toBeTruthy();
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

  it('applies cognitive timers by difficulty and keeps memory reveal timer separate', () => {
    const cognitive = questions.filter((q) => q.section === 'cognitive');
    for (const q of cognitive) {
      expect(q.recommendedSeconds).toBeTruthy();
      if (q.cognitiveDomain === 'memory') {
        expect(q.revealSeconds).toBeGreaterThanOrEqual(5);
        expect(q.revealSeconds).toBeLessThanOrEqual(12);
        continue;
      }
      if (q.difficulty === 'easy') expect(q.recommendedSeconds).toBe(60);
      if (q.difficulty === 'medium') expect(q.recommendedSeconds).toBe(75);
      if (q.difficulty === 'hard') expect(q.recommendedSeconds).toBe(90);
    }
  });

  it('marks every memory question as immediate with complete reveal metadata', () => {
    const memory = questions.filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory');
    expect(memory.length).toBeGreaterThanOrEqual(16);

    for (const q of memory) {
      expect(q.memoryPhase).toBe('immediate');
      expect(q.revealSeconds).toBeGreaterThanOrEqual(5);
      expect(q.revealSeconds).toBeLessThanOrEqual(12);
      expect(q.memoryPrompt?.trim().length).toBeGreaterThan(0);
      expect(q.memoryQuestion?.trim().length).toBeGreaterThan(0);
      expect(new Set(q.options.map((o) => o.value)).size).toBe(q.options.length);
      expect(q.options[q.options.length - 1]?.value).toBe('default-idk');
      expect(q.options[q.options.length - 1]?.label).toBe("I don't know");
      const nonIdk = q.options.filter((o) => o.value !== 'default-idk');
      expect(nonIdk.filter((o) => o.score === 2).length).toBe(1);
    }
  });


  it('keeps targeted cognitive wording clear while preserving scoring metadata', () => {
    const speedDistance = questions.find((q) => q.id === 'cog-numerical-8');
    expect(speedDistance).toBeTruthy();
    expect(speedDistance?.prompt).toBe('A train travels at a steady speed of 60 km/h for 2.5 hours. How far does it travel?');
    expect(speedDistance?.hint).toBe('Use D = S × T: distance = speed × time. Convert the wording into numbers, then compare the choices.');
    expect(speedDistance?.scoringDomain).toBe('numerical');
    expect(speedDistance?.groupLabel).toBe('Cognitive Workstyle');
    expect(speedDistance?.options.map((o) => [o.label, o.score])).toEqual([
      ['120 km', 0],
      ['140 km', 0],
      ['150 km', 2],
      ['160 km', 0],
      ["I don't know", 0]
    ]);

    const mirror = questions.find((q) => q.id === 'cog-spatial-8');
    expect(mirror).toBeTruthy();
    expect(mirror?.prompt).toBe('Imagine the letters ‘AB’ are reflected in a vertical mirror. Reading the mirrored version from left to right, which letter appears first?');
    expect(mirror?.scoringDomain).toBe('spatial');
    expect(mirror?.groupLabel).toBe('Cognitive Workstyle');
    expect(mirror?.options.map((o) => [o.label, o.score])).toEqual([
      ['Letter B', 2],
      ['Letter A', 0],
      ["I don't know", 0]
    ]);
  });

  it('uses 8 seconds for mixed five-item alphanumeric memory prompts', () => {
    const mixedMemory = questions.filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory' && q.memoryPrompt && /[A-Za-z]/.test(q.memoryPrompt) && /\d/.test(q.memoryPrompt));
    expect(mixedMemory.length).toBeGreaterThan(0);
    for (const q of mixedMemory) {
      expect(q.revealSeconds).toBe(8);
      expect(q.scoringDomain).toBe('memory');
      expect(q.groupLabel).toBe('Cognitive Workstyle');
      expect(q.memoryPhase).toBe('immediate');
    }
  });

  it('documents mixed alphanumeric detection expectations for uppercase and lowercase prompts', () => {
    const hasLetterAndDigit = (prompt: string) => /[A-Za-z]/.test(prompt) && /\d/.test(prompt);

    expect(hasLetterAndDigit('7 - 1 - M - 9 - T')).toBe(true);
    expect(hasLetterAndDigit('7 - 1 - m - 9 - t')).toBe(true);
  });

  it('keeps memory wording free of diagnostic terms', () => {
    const diagnosticTerms = [/dementia/i, /adhd/i, /\biq\b/i, /brain age/i, /diagnosis/i, /failed/i];
    const memoryQuestions = questions.filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory');
    const memoryQuestionFields = memoryQuestions.flatMap((q) => [
      q.prompt,
      q.hint,
      q.memoryPrompt,
      q.memoryQuestion,
      ...q.options.map((o) => o.label)
    ]).filter(Boolean) as string[];
    const memoryUxFields = [
      en.memoryTitle,
      en.memoryIntro,
      en.memoryReady,
      en.memoryReadyTitle,
      en.memoryReadyBody,
      en.memoryHiddenNotice,
      en.memorizeThis,
      en.memoryProtectionTitle,
      en.memoryProtectionBody,
      en.memoryPoolExhausted
    ];

    for (const field of [...memoryQuestionFields, ...memoryUxFields]) {
      const normalized = field.toLowerCase();
      for (const term of diagnosticTerms) expect(normalized).not.toMatch(term);
    }
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
