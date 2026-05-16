import type { Question } from '../../data/questions';
import type { Language } from '../index';
import { enQuestionTranslations } from './en';
import { zhQuestionTranslations } from './zh';
import { msQuestionTranslations } from './ms';

const maps = { en: enQuestionTranslations, zh: zhQuestionTranslations, ms: msQuestionTranslations } as const;

export function localizeQuestion(question: Question, language: Language): Question {
  const langMap = maps[language] ?? maps.en;
  const entry = langMap[question.id] ?? {};

  const likertOverride = langMap['default-likert']?.options;
  const idkOverride = langMap['default-idk']?.options?.[0];

  const options = question.options.map((option, idx) => {
    const labelFromEntry = entry.options?.[idx];
    if (labelFromEntry) return { ...option, label: labelFromEntry };
    if (option.label === "I don't know" && idkOverride) return { ...option, label: idkOverride };
    if (likertOverride && idx < 5 && ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'].includes(option.label)) {
      return { ...option, label: likertOverride[idx] };
    }
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
