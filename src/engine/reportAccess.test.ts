import { describe, expect, it } from 'vitest';
import type { Question } from '../data/questions';
import { canViewPersonalReport, getNextUnansweredQuestionIndex } from './reportAccess';
import type { Answer } from './scoring';

const questions: Question[] = [
  { id: 'q-1', section: 'mbti', prompt: 'A?', options: [
    { label: 'A', value: 'I', score: 2 }, { label: 'B', value: 'E', score: 2 }
  ] },
  { id: 'q-2', section: 'ocean', prompt: 'B?', options: [
    { label: '1', value: 'open', score: 1 }, { label: '2', value: 'open', score: 2 }
  ] }
];
const complete: Answer[] = [
  { questionId: 'q-1', value: 'I', score: 2 },
  { questionId: 'q-2', value: 'open', score: 2 }
];

describe('personal report access', () => {
  it('requires at least one question and all current valid answers', () => {
    expect(canViewPersonalReport([], [])).toBe(false);
    expect(canViewPersonalReport(questions, [])).toBe(false);
    expect(canViewPersonalReport(questions, complete)).toBe(true);
    expect(getNextUnansweredQuestionIndex(questions, complete)).toBeNull();
  });

  it('resumes at the first missing answer rather than trusting raw array length', () => {
    expect(getNextUnansweredQuestionIndex(questions, [complete[1]])).toBe(0);
    expect(getNextUnansweredQuestionIndex(questions, [complete[0]])).toBe(1);
  });

  it('rejects duplicate, mismatched and non-finite responses', () => {
    expect(canViewPersonalReport(questions, [...complete, complete[0]])).toBe(false);
    expect(canViewPersonalReport(questions, [{ ...complete[0], value: 'invalid' }, complete[1]])).toBe(false);
    expect(canViewPersonalReport(questions, [{ ...complete[0], score: 99 }, complete[1]])).toBe(false);
    expect(canViewPersonalReport(questions, [{ ...complete[0], score: Number.NaN }, complete[1]])).toBe(false);
  });

  it('ignores unrelated legacy answers but never accepts duplicated session IDs', () => {
    expect(canViewPersonalReport(questions, [...complete, { questionId: 'old-id', value: 'x', score: 1 }])).toBe(true);
    expect(canViewPersonalReport([questions[0], questions[0]], complete)).toBe(false);
  });
});
