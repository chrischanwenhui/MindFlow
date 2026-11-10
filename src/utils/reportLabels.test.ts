import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { fictionalSampleQuestions, fictionalSampleAnswers, fictionalSampleReport } from '../data/sampleAssessment';
import { scoreAssessment } from '../engine/scoring';
import { dictionaries, type Language } from '../i18n';
import { readableOperatingSignal, readableTopOperating, readableGeneralPrompt, operatingSignalKeys, operatingTranslations, OPERATING_SECTIONS } from './reportLabels';

const operatingQuestions = questions.filter(q => OPERATING_SECTIONS.some(section => section === q.section));
const allLanguages = Object.keys(dictionaries) as Language[];

describe('report presentation label completeness', () => {
  it('provides a non-code, nonempty label for all 96 operating options across six languages', () => {
    expect(operatingQuestions).toHaveLength(32);
    expect(operatingSignalKeys()).toHaveLength(96);
    for (const language of allLanguages) {
      for (const question of operatingQuestions) {
        for (const option of question.options) {
          const result = readableOperatingSignal(question.section as typeof OPERATING_SECTIONS[number], option.value, language);
          expect(result.length).toBeGreaterThan(3);
          expect(result).not.toBe(option.value);
          expect(result).not.toBe(dictionaries[language].reportUnknownSignal);
        }
      }
    }
    for (const language of allLanguages.filter(l => l !== 'en')) {
      const mapped = operatingTranslations(language as Exclude<Language, 'en'>);
      expect(Object.keys(mapped).sort()).toEqual(operatingSignalKeys().sort());
      for (const label of Object.values(mapped)) expect(label.trim().length).toBeGreaterThan(3);
    }
  });

  it('resolves a top operating response only with an unambiguous known section', () => {
    expect(readableTopOperating('why', 'en')).toBe('Clarify why it matters');
    expect(readableTopOperating('systems', 'en')).toBe('Stable personal systems');
    expect(readableOperatingSignal('stress', 'scope', 'en')).toBe('Trim scope and protect the most important tasks');
    expect(readableOperatingSignal('leadership', 'alignconstraints', 'en')).toBe('Make priorities and constraints explicit');
    expect(readableTopOperating('unexpected_code', 'en')).toBe(dictionaries.en.reportUnknownSignal);
    expect(readableOperatingSignal('motivation', 'unknown', 'th')).toBe(dictionaries.th.reportUnknownSignal);
    expect(readableOperatingSignal('stress', 'Balanced', 'ja')).toBe(dictionaries.ja.reportBalancedSignal);
  });

  it('presents the eight fixed advice strings as translatable general prompts', () => {
    const items = [...fictionalSampleReport.strengths, ...fictionalSampleReport.blindSpots, ...fictionalSampleReport.suggestedGrowthAreas];
    expect(items).toHaveLength(8);
    for (const language of allLanguages) for (const item of items) {
      const result = readableGeneralPrompt(item, language);
      expect(result).not.toBe(dictionaries[language].reportUnknownPrompt);
      expect(result.trim().length).toBeGreaterThan(8);
    }
    expect(readableGeneralPrompt('new unknown text', 'en')).toBe(dictionaries.en.reportUnknownPrompt);
  });

  it('keeps the scoring result and raw identifiers unchanged during presentation', () => {
    const before = JSON.stringify(fictionalSampleAnswers);
    const original = scoreAssessment(fictionalSampleQuestions, fictionalSampleAnswers);
    readableOperatingSignal('motivation', original.motivationPattern, 'zh');
    readableTopOperating(original.executiveSummaryParts.topOperating, 'ja');
    readableGeneralPrompt(original.strengths[0], 'ko');
    const after = scoreAssessment(fictionalSampleQuestions, fictionalSampleAnswers);
    expect(after).toEqual(original);
    expect(JSON.stringify(fictionalSampleAnswers)).toBe(before);
  });
});
