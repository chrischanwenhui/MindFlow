import { describe, expect, it } from 'vitest';
import { questions } from '../../data/questions';
import { buildAssessmentSession } from '../../engine/session';
import { inspectStoredAssessment } from '../../engine/sessionIntegrity';
import { inspectAssessmentAccess } from '../../engine/reportAccess';
import { dictionaries, type Language } from '../index';
import { createQuestionLocalizer, localizeQuestion } from './index';
import { enQuestionTranslations } from './en';
import { zhQuestionTranslations } from './zh';
import { msQuestionTranslations } from './ms';
import { jaQuestionTranslations } from './ja';
import { koQuestionTranslations } from './ko';
import { thQuestionTranslations } from './th';

const maps = { en: enQuestionTranslations, zh: zhQuestionTranslations, ms: msQuestionTranslations,
  ja: jaQuestionTranslations, ko: koQuestionTranslations, th: thQuestionTranslations };
const languages = Object.keys(dictionaries) as Language[];

function expectedOptions(questionId: string, language: Language) {
  const source = questions.find((q) => q.id === questionId)!;
  const map = maps[language];
  const likert = source.options.length === 5 && [1, 2, 3, 4, 5].every((score) => source.options.some((o) => o.score === score));
  return source.options.map((option, index) => ({
    ...option,
    label: map[source.id]?.options?.[index]
      ?? (option.value === 'default-idk' ? map['default-idk']?.options?.[0] : undefined)
      ?? (likert ? map['default-likert']?.options?.[option.score - 1] : undefined)
      ?? option.label
  }));
}

const optionSet = (options: typeof questions[number]['options']) =>
  options.map((o) => JSON.stringify([o.label, o.value, o.score])).sort();

describe('assessment display and submission integrity', () => {
  it.each(languages)('preserves intended label/value/score tuples across 100 seeded sessions in %s', (language) => {
    const expected = new Map(questions.map((q) => [q.id, optionSet(expectedOptions(q.id, language))]));
    const seenOrders = new Set<string>();
    for (let seedIndex = 0; seedIndex < 100; seedIndex += 1) {
      const sessionSeed = `assessment-integrity-${seedIndex}`;
      const session = buildAssessmentSession(questions, { sessionSeed });
      const resumed = buildAssessmentSession(questions, { sessionSeed, sessionIds: session.map((q) => q.id) });
      expect(resumed).toEqual(session);
      const answers = session.map((q, index) => {
        const option = q.options[(seedIndex + index) % q.options.length];
        return { questionId: q.id, value: option.value, score: option.score };
      });
      const snapshot = { seedRaw: sessionSeed, idsRaw: JSON.stringify(session.map((q) => q.id)),
        answersRaw: JSON.stringify(answers), versionRaw: null };
      const hydrated = inspectStoredAssessment(snapshot);
      expect(hydrated.recovery).toBeNull();
      expect(hydrated.questions).toEqual(session);
      expect(hydrated.answers).toEqual(answers);
      expect(hydrated.snapshot).toEqual(snapshot);
      expect(inspectAssessmentAccess(hydrated.questions, hydrated.answers, sessionSeed).status).toBe('complete');
      for (const question of session) {
        const localized = localizeQuestion(question, language);
        expect(optionSet(localized.options), `${sessionSeed}:${question.id}`).toEqual(expected.get(question.id));
        // The UI submits these exact two fields from the displayed option.
        expect(localized.options.map(({ value, score }) => ({ value, score })))
          .toEqual(question.options.map(({ value, score }) => ({ value, score })));
        if (question.id === 'mbti-ei-1') seenOrders.add(question.options.map((o) => o.value).join(','));
      }
    }
    expect(seenOrders).toEqual(new Set(['I,E', 'E,I']));
  });

  it.each(languages)('commutes with shuffling and supports reversed question/option order in %s', (language) => {
    // Covers every bank item, including items absent from a particular sampled session.
    const sessionIds = questions.map((q) => q.id);
    const sessionSeed = 'localization-before-or-after-shuffle';
    const before = buildAssessmentSession(questions.map((q) => localizeQuestion(q, language)), { sessionSeed, sessionIds });
    const after = buildAssessmentSession(questions, { sessionSeed, sessionIds }).map((q) => localizeQuestion(q, language));
    after.forEach((question, index) => expect(question, question.id).toEqual(before[index]));
    for (const question of [...questions].reverse()) {
      const reversed = { ...question, options: [...question.options].reverse() };
      expect(localizeQuestion(reversed, language).options).toEqual([...localizeQuestion(question, language).options].reverse());
    }
  });

  it.each(['zh', 'ms'] as const)('uses canonical tasks where %s overrides described obsolete questions', (language) => {
    for (const id of ['mbti-ei-1', 'mbti-sn-1', 'riasec-1', 'riasec-6', 'cog-pattern-1',
      'cog-verbal-1', 'cog-numerical-1', 'cog-spatial-1', 'cog-memory-1', 'cog-memory-2', 'cog-memory-3']) {
      const source = questions.find((q) => q.id === id)!;
      const localized = localizeQuestion(source, language);
      expect(localized.prompt, id).toBe(source.prompt);
      expect(localized.memoryPrompt, id).toBe(source.memoryPrompt);
      expect(localized.memoryQuestion, id).toBe(source.memoryQuestion);
      expect(localized.options.filter((o) => o.value !== 'default-idk'))
        .toEqual(source.options.filter((o) => o.value !== 'default-idk'));
    }
  });
});


describe('canonical translation binding and safe fallbacks', () => {
  it('distinguishes cognitive choices that have identical values and scores', () => {
    const source = questions.find((q) => q.id === 'cog-numerical-1')!;
    const labels = ['forty', 'fifty', 'sixty', 'seventy', 'unsure'];
    const localize = createQuestionLocalizer({ [source.id]: { options: labels } });
    const shuffled = { ...source, options: [...source.options].reverse() };
    expect(localize(shuffled).options).toEqual(source.options.map((o, i) => ({ ...o, label: labels[i] })).reverse());
    // Correcting a weight must not change choice identity or translation binding.
    const corrected = { ...shuffled, options: shuffled.options.map((o) => ({ ...o, score: 123 })) };
    expect(localize(corrected).options.map((o) => o.label)).toEqual([...labels].reverse());
    expect(source.options.map((o) => o.label)).toEqual(['40', '50', '60', '70', "I don't know"]);
  });

  it('ignores obsolete IDs and rejects an entire override with an incompatible choice count', () => {
    const source = questions.find((q) => q.id === 'cog-memory-1')!;
    const localize = createQuestionLocalizer({
      'motivation-1': { prompt: 'obsolete task', options: ['obsolete choice'] },
      [source.id]: { prompt: 'stale task', memoryPrompt: 'stale stimulus',
        memoryQuestion: 'stale recall', options: ['too', 'few'] }
    });
    expect(localize(source)).toEqual(source);
    const legacy = { ...source, id: 'motivation-1' };
    expect(localize(legacy)).toEqual(legacy);
  });

  it('falls back per missing label and keeps default-idk attached to its value', () => {
    const source = questions.find((q) => q.id === 'cog-numerical-1')!;
    const localize = createQuestionLocalizer({
      [source.id]: { options: ['forty', '', 'sixty', '', ''] },
      'default-idk': { options: ['unsure'] }
    });
    const input = { ...source, options: source.options.map((o) => o.value === 'default-idk' ? { ...o, label: 'Not sure' } : o).reverse() };
    expect(localize(input).options.map((o) => o.label)).toEqual(['unsure', '70', 'sixty', '50', 'forty']);
    expect(localize(input).options.map(({ value, score }) => ({ value, score })))
      .toEqual(input.options.map(({ value, score }) => ({ value, score })));
  });

  it('has unique canonical identities even where values and scores are shared', () => {
    for (const question of questions) {
      const keys = question.options.map((option) => JSON.stringify([option.value, option.label]));
      expect(new Set(keys).size, question.id).toBe(keys.length);
    }
  });
});
