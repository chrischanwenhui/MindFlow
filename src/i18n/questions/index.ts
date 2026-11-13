import { questions, type Question, type QuestionOption } from '../../data/questions';
import type { Language } from '../index';
import type { LocalizedQuestionText, QuestionTranslations } from './types';
import { enQuestionTranslations } from './en';
import { zhQuestionTranslations } from './zh';
import { msQuestionTranslations } from './ms';
import { jaQuestionTranslations } from './ja';
import { koQuestionTranslations } from './ko';
import { thQuestionTranslations } from './th';

// Values alone are not identities: cognitive distractors share value and score.
// The canonical label disambiguates them without changing any stored value or
// depending on a score that may need correction. This key is only used in memory.
const optionKey = (option: QuestionOption): string => JSON.stringify([option.value, option.label]);

type BoundTranslation = Omit<LocalizedQuestionText, 'options'> & { optionLabels: Map<string, string> };

function isLikertOptionSet(options: Question['options']): boolean {
  const scores = options.map((option) => option.score);
  return scores.length === 5 && [1, 2, 3, 4, 5].every((score) => scores.includes(score));
}

export function createQuestionLocalizer(langMap: QuestionTranslations): (question: Question) => Question {
  const entries = new Map<string, BoundTranslation>();
  // Translation arrays describe canonical bank order, never session order.
  // Bind once, before any session shuffling. Unknown legacy IDs are ignored.
  for (const canonical of questions) {
    const entry = langMap[canonical.id];
    if (!entry) continue;
    // An incompatible choice set is evidence of a stale task; reject the entire
    // override (including prompt/stimulus) instead of assembling a hybrid task.
    if (entry.options && entry.options.length !== canonical.options.length) continue;
    const { options, ...text } = entry;
    entries.set(canonical.id, {
      ...text,
      optionLabels: new Map(canonical.options.flatMap((option, index) => {
        const label = options?.[index];
        return label ? [[optionKey(option), label]] : [];
      }))
    });
  }

  return (question) => {
    const entry = entries.get(question.id);
    const likertOverride = langMap['default-likert']?.options;
    const idkOverride = langMap['default-idk']?.options?.[0];
    const isLikert = isLikertOptionSet(question.options);
    const options = question.options.map((option) => {
      const label = entry?.optionLabels.get(optionKey(option))
        ?? (option.value === 'default-idk' ? idkOverride : undefined)
        ?? (isLikert ? likertOverride?.[option.score - 1] : undefined);
      return label ? { ...option, label } : option;
    });

    const hintKey = question.section === 'stress' ? 'stress-hint' : question.cognitiveDomain ? `${question.cognitiveDomain}-hint` : undefined;
    const fallbackHint = hintKey ? langMap[hintKey]?.hint : undefined;
    return {
      ...question,
      prompt: entry?.prompt ?? question.prompt,
      options,
      hint: entry?.hint ?? fallbackHint ?? question.hint,
      memoryPrompt: entry?.memoryPrompt ?? question.memoryPrompt,
      memoryQuestion: entry?.memoryQuestion ?? question.memoryQuestion
    };
  };
}

const localizers = {
  en: createQuestionLocalizer(enQuestionTranslations),
  zh: createQuestionLocalizer(zhQuestionTranslations),
  ms: createQuestionLocalizer(msQuestionTranslations),
  ja: createQuestionLocalizer(jaQuestionTranslations),
  ko: createQuestionLocalizer(koQuestionTranslations),
  th: createQuestionLocalizer(thQuestionTranslations)
};

export function localizeQuestion(question: Question, language: Language): Question {
  return (localizers[language] ?? localizers.en)(question);
}
