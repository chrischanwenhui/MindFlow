import { questions } from '../../data/questions';
import type { QuestionTranslations } from './types';

export const enQuestionTranslations: QuestionTranslations = Object.fromEntries(
  questions.map((q) => [
    q.id,
    {
      prompt: q.prompt,
      options: q.options.map((o) => o.label),
      hint: q.hint,
      memoryPrompt: q.memoryPrompt,
      memoryQuestion: q.memoryQuestion
    }
  ])
);
