import type { Question } from '../data/questions';
import type { ProfileReport } from '../engine/scoring';

function titleize(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export type SortedScoreItem = {
  key: string;
  label: string;
  score: number;
};

export function deriveRiasecMaxScores(allQuestions: Question[]): Record<string, number> {
  const maxes: Record<string, number> = {};

  for (const question of allQuestions) {
    if (question.section !== 'riasec') continue;

    for (const option of question.options) {
      maxes[option.value] = (maxes[option.value] ?? 0) + option.score;
    }
  }

  return maxes;
}

export function toSortedScores(record: Record<string, number>): SortedScoreItem[] {
  return Object.entries(record)
    .map(([key, score]) => ({ key, label: titleize(key), score }))
    .sort((a, b) => b.score - a.score);
}

export function buildReportReflection(_report: ProfileReport): string {
  return 'This reflection profile summarizes estimated traits and reasoning signals from your current responses. It is non-diagnostic and for self-discovery use.';
}
