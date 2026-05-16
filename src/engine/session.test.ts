import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { buildAssessmentSession } from './session';

describe('buildAssessmentSession', () => {
  it('builds >=75 with no duplicates and cognitive last', () => {
    const session = buildAssessmentSession(questions);
    expect(session.length).toBeGreaterThanOrEqual(75);
    expect(new Set(session.map((q) => q.id)).size).toBe(session.length);
    const firstCognitive = session.findIndex((q) => q.section === 'cognitive');
    expect(firstCognitive).toBeGreaterThan(0);
    expect(session.slice(firstCognitive).every((q) => q.section === 'cognitive')).toBe(true);
    expect(session.filter((q) => q.section === 'cognitive').length).toBeGreaterThanOrEqual(20);
  });

  it('can produce different randomized sessions', () => {
    const a = buildAssessmentSession(questions).map((q) => q.id).join(',');
    const b = buildAssessmentSession(questions).map((q) => q.id).join(',');
    expect(a).not.toBe(b);
  });
});
