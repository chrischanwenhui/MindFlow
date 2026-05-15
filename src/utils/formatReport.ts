import type { ProfileReport } from '../engine/scoring';

function titleize(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function toSortedScores(record: Record<string, number>) {
  return Object.entries(record)
    .map(([label, score]) => ({ label: titleize(label), score }))
    .sort((a, b) => b.score - a.score);
}

export function buildReportReflection(_report: ProfileReport): string {
  return `This estimated profile is a reflection signal of current preferences and cognitive-style tendencies. It is non-diagnostic and designed for self-discovery only.`;
}
