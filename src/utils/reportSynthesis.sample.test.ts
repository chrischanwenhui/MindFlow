import { describe, expect, it } from 'vitest';
import { fictionalSampleReport } from '../data/sampleAssessment';
import { dictionaries } from '../i18n';
import { generateExecutiveSummary } from './reportSynthesis';
import { readableOperatingSignal } from './reportLabels';

describe('fictional report language integrity', () => {
  it('never addresses the real reader in English sample executive narratives (F02)', () => {
    const result = generateExecutiveSummary(fictionalSampleReport, 'sample');
    const text = [
      result.primaryWorkstyle.body, result.cognitiveStyle.body,
      result.operationalDrive.body, result.strengthZone.body,
      result.watchArea.body, result.optimizationStrategy.body
    ].join(' ');
    expect(text).toMatch(/fictional/i);
    expect(text).not.toMatch(/\b(?:your|you)\b/i);
    expect(text).not.toMatch(/current responses/i);
    const readable = readableOperatingSignal('workstyle', fictionalSampleReport.workstylePattern, 'en').toLowerCase();
    expect(result.operationalDrive.body).toContain(`workstyle cue: ${readable}`);
    expect(result.operationalDrive.body).not.toContain(`${fictionalSampleReport.workstylePattern.toLowerCase()} workstyle cues`);
  });

  it('renders known workstyle codes as display labels rather than raw IDs', () => {
    for (const raw of ['systems', 'planfirst', 'deepwork', 'createstructure']) {
      const sample = { ...fictionalSampleReport, workstylePattern: raw };
      const result = generateExecutiveSummary(sample, 'sample');
      const label = readableOperatingSignal('workstyle', raw, 'en').toLowerCase();
      expect(result.operationalDrive.body).toContain(`workstyle cue: ${label}`);
      expect(result.operationalDrive.body).not.toContain(`${raw} workstyle cues`);
    }
  });

  it('does not change the personal executive narrative', () => {
    const personal = generateExecutiveSummary(fictionalSampleReport);
    const explicit = generateExecutiveSummary(fictionalSampleReport, 'personal');
    expect(explicit).toEqual(personal);
    expect(personal.primaryWorkstyle.body).toContain('Your current response pattern');
  });

  it('has sample-specific report, cognitive, MBTI and executive wording in six languages', () => {
    for (const [language, dictionary] of Object.entries(dictionaries)) {
      expect(dictionary.sampleReportReflection.length, language).toBeGreaterThan(12);
      expect(dictionary.sampleExecutiveSummaryTemplate, language).toContain('{personalityTypeEstimate}');
      expect(dictionary.sampleCognitiveSummaryTemplate, language).toContain('{topCognitiveLabel}');
      expect(dictionary.sampleMbtiBestFitTemplate, language).toContain('{confidenceLevel}');
      expect(dictionary.sampleReportNoticeTitle.length, language).toBeGreaterThan(8);
    }
  });
});
