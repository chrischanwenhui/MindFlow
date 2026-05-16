export type LocalizedQuestionText = {
  prompt?: string;
  options?: string[];
  hint?: string;
  memoryPrompt?: string;
  memoryQuestion?: string;
};

export type QuestionTranslations = Record<string, LocalizedQuestionText>;
