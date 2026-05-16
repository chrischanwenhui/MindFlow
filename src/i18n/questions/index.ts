import type { Question } from '../../data/questions';
import type { Language } from '../index';
import { enQuestionTranslations } from './en';
import { zhQuestionTranslations } from './zh';
import { msQuestionTranslations } from './ms';

const maps = { en: enQuestionTranslations, zh: zhQuestionTranslations, ms: msQuestionTranslations } as const;

function isLikertOptionSet(options: Question['options']): boolean {
  const scores = options.map((option) => option.score);
  return scores.length === 5 && [1, 2, 3, 4, 5].every((score) => scores.includes(score));
}

export function localizeQuestion(question: Question, language: Language): Question {
  const langMap = maps[language] ?? maps.en;
  const entry = langMap[question.id] ?? {};

  const likertOverride = langMap['default-likert']?.options;
  const idkOverride = langMap['default-idk']?.options?.[0];

  const isLikert = isLikertOptionSet(question.options);

  const options = question.options.map((option, idx) => {
    const labelFromEntry = entry.options?.[idx];
    if (labelFromEntry) return { ...option, label: labelFromEntry };
    if (option.label === "I don't know" && idkOverride) return { ...option, label: idkOverride };
    const override = likertOverride?.[idx];
    if (isLikert && override) return { ...option, label: override };
    return option;
  });

  const hintKey = question.section === 'stress' ? 'stress-hint' : question.cognitiveDomain ? `${question.cognitiveDomain}-hint` : undefined;
  const fallbackHint = hintKey ? langMap[hintKey]?.hint : undefined;

  return {
    ...question,
    prompt: entry.prompt ?? question.prompt,
    options,
    hint: entry.hint ?? fallbackHint ?? question.hint,
    memoryPrompt: entry.memoryPrompt ?? question.memoryPrompt,
    memoryQuestion: entry.memoryQuestion ?? question.memoryQuestion
  };
}
