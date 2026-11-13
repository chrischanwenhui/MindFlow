export type LocalizedQuestionText = {
  prompt?: string;
  // Canonical question-bank order; bound to choice identity before localization.
  options?: string[];
  hint?: string;
  memoryPrompt?: string;
  memoryQuestion?: string;
};

export type QuestionTranslations = Record<string, LocalizedQuestionText>;
