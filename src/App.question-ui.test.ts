/// <reference types="vite/client" />

import { describe, expect, it } from 'vitest';

import appSource from './App.tsx?raw';
import { shouldShowForcedChoiceHelper } from './App';
import { questions } from './data/questions';


describe('assessment question UI structure', () => {
  it('renders navigation actions as separate elements inside a shared question-actions container', () => {
    expect(appSource).toContain('className="question-actions no-print"');
    expect(appSource).toContain("{tx('backPrev')}");
    expect(appSource).toContain("{tx('navSaveExit')}");
    expect(appSource).toContain('<button className="secondary-action" onClick={goToPreviousQuestion}');
    expect(appSource).toContain('<button className="secondary-action" onClick={saveAndContinueLater}');
  });

  it('marks the assessment question card with a dedicated constrained-card class and styles', () => {
    expect(appSource).toContain('card question-card assessment-question-card');
    expect(appSource).toContain('<section className="card question-card assessment-question-card"');
  });

  it('shows forced-choice helper eligibility for two-option preference questions only', () => {
    const preference = questions.find((q) => q.section === 'mbti' && q.options.length === 2);
    const cognitive = questions.find((q) => q.section === 'cognitive' && q.options.length > 2);

    expect(preference).toBeTruthy();
    expect(cognitive).toBeTruthy();
    expect(shouldShowForcedChoiceHelper(preference)).toBe(true);
    expect(shouldShowForcedChoiceHelper(cognitive)).toBe(false);
    expect(appSource).toContain("{tx('forcedChoiceHelper')}");
  });

  it('separates timed memory content from countdown timer text', () => {
    expect(appSource).toContain('memory-encoding__label');
    expect(appSource).toContain('memory-encoding__content');
    expect(appSource).toContain('memory-encoding__timer');
    expect(appSource).toContain("{tx('studyThisSequence')}");
    expect(appSource).toContain("{tx('timeRemaining')}: <strong>{revealRemaining}s</strong>");
    expect(appSource).not.toContain("{tx('memorizeThis')}: {revealRemaining}");
  });
});
