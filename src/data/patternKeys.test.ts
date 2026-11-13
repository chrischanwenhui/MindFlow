import { describe, expect, it } from 'vitest';
import { questions } from './questions';

// Derive the next term from the displayed sequence; no expected-answer table.
// These three items have a constant second difference (successive gaps grow).
describe('pattern keys derived independently from finite differences', () => {
  it.each(['cog-pattern-1', 'cog-pattern-8', 'cog-pattern-12'])('%s rewards only the next term implied by its rule', (id) => {
    const question = questions.find((q) => q.id === id)!;
    const terms = question.prompt.split(':')[1].split(',').slice(0, -1).map(Number);
    const differences = terms.slice(1).map((term, i) => term - terms[i]);
    const secondDifferences = differences.slice(1).map((gap, i) => gap - differences[i]);
    expect(terms.every(Number.isFinite)).toBe(true);
    expect(new Set(secondDifferences).size).toBe(1);
    expect(secondDifferences[0]).toBeGreaterThan(0);
    const nextTerm = terms[terms.length - 1] + differences[differences.length - 1] + secondDifferences[0];
    const correct = question.options.filter((o) => Number(o.label) === nextTerm);
    expect(correct).toHaveLength(1);
    expect(correct[0].score).toBe(2);
    expect(question.options.filter((o) => Number(o.label) !== nextTerm).every((o) => o.score === 0)).toBe(true);
  });
});
