import { describe, expect, it } from 'vitest';
import { getReplacementMemoryQuestion } from './engine/session';
import { questions } from './data/questions';

describe('memory anti-cheat replacement', () => {
  it('returns a different memory question when alternatives exist', () => {
    const session = questions.slice(0, 30);
    const currentMemory = questions.find((q) => q.id === 'cog-memory-1');
    if (!currentMemory) throw new Error('missing memory question');
    const replacement = getReplacementMemoryQuestion(questions, session, new Set([currentMemory.id]), currentMemory.id);
    expect(replacement).toBeTruthy();
    expect(replacement?.id).not.toBe(currentMemory.id);
  });

  it('returns null when memory pool is exhausted', () => {
    const memoryIds = new Set(questions.filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory').map((q) => q.id));
    const session = questions;
    const current = 'cog-memory-1';
    const replacement = getReplacementMemoryQuestion(questions, session, memoryIds, current);
    expect(replacement).toBeNull();
  });
});
