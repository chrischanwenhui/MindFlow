export type Section = 'mbti' | 'ocean' | 'riasec' | 'motivation' | 'stress' | 'leadership' | 'workstyle' | 'cognitive';
export type CognitiveDomain = 'pattern' | 'verbal' | 'numerical' | 'spatial' | 'memory';
export type CognitiveDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionOption = { label: string; value: string; score: number };

export type Question = {
  id: string;
  section: Section;
  prompt: string;
  options: QuestionOption[];
  hint?: string;
  cognitiveDomain?: CognitiveDomain;
  difficulty?: CognitiveDifficulty;
};

const likert = (value: string): QuestionOption[] => [
  { label: 'Strongly disagree', value, score: 1 },
  { label: 'Disagree', value, score: 2 },
  { label: 'Neutral', value, score: 3 },
  { label: 'Agree', value, score: 4 },
  { label: 'Strongly agree', value, score: 5 }
];

const STRESS_HINT = 'Choose the option that feels closest most of the time, not what sounds ideal.';
const COGNITIVE_HINTS: Record<CognitiveDomain, string> = {
  pattern: 'Look for how the numbers change from one step to the next.',
  verbal: 'Find the relationship between the first pair, then apply the same relationship to the second pair.',
  numerical: 'Think about the original amount and how each percentage change is applied in sequence.',
  spatial: 'Focus on how shape orientation changes after rotation or folding.',
  memory: 'Keep the sequence order in mind, then locate the requested position carefully.'
};

const cognitiveUnknownOption = (domain?: CognitiveDomain): QuestionOption => ({
  label: "I don't know",
  value: domain ? `${domain}-unknown` : 'unknown',
  score: 0
});

export const questions: Question[] = [
  { id: 'mbti-ei-1', section: 'mbti', prompt: 'After a demanding week, you usually recharge by…', options: [{ label: 'Quiet reset and reflection', value: 'I', score: 2 }, { label: 'Social activity and conversation', value: 'E', score: 2 }] },
  { id: 'mbti-ei-2', section: 'mbti', prompt: 'In group discussions, you usually…', options: [{ label: 'Observe first, then contribute', value: 'I', score: 2 }, { label: 'Contribute early and often', value: 'E', score: 2 }] },
  { id: 'mbti-sn-1', section: 'mbti', prompt: 'When solving a new problem, you start with…', options: [{ label: 'Practical examples and evidence', value: 'S', score: 2 }, { label: 'Patterns and future possibilities', value: 'N', score: 2 }] },
  { id: 'mbti-sn-2', section: 'mbti', prompt: 'When learning a new system, you prefer…', options: [{ label: 'Step-by-step usage first', value: 'S', score: 2 }, { label: 'Overall framework first', value: 'N', score: 2 }] },
  { id: 'mbti-tf-1', section: 'mbti', prompt: 'In a hard decision, your first anchor is…', options: [{ label: 'Logic and consistency', value: 'T', score: 2 }, { label: 'Human impact and context', value: 'F', score: 2 }] },
  { id: 'mbti-tf-2', section: 'mbti', prompt: 'When giving feedback, you emphasize…', options: [{ label: 'Directness and precision', value: 'T', score: 2 }, { label: 'Tone and encouragement', value: 'F', score: 2 }] },
  { id: 'mbti-jp-1', section: 'mbti', prompt: 'Your preferred workflow is usually…', options: [{ label: 'Structured with checkpoints', value: 'J', score: 2 }, { label: 'Flexible and adaptive', value: 'P', score: 2 }] },
  { id: 'mbti-jp-2', section: 'mbti', prompt: 'Before important tasks, you tend to…', options: [{ label: 'Plan details ahead of time', value: 'J', score: 2 }, { label: 'Keep options open until later', value: 'P', score: 2 }] },

  { id: 'ocean-open-1', section: 'ocean', prompt: 'I enjoy exploring ideas that challenge my current views.', options: likert('open') },
  { id: 'ocean-open-2', section: 'ocean', prompt: 'I seek variety in how I learn and create.', options: likert('open') },
  { id: 'ocean-cons-1', section: 'ocean', prompt: 'I keep track of tasks even when nobody is checking.', options: likert('conscientiousness') },
  { id: 'ocean-cons-2', section: 'ocean', prompt: 'I complete priorities before switching attention.', options: likert('conscientiousness') },
  { id: 'ocean-extra-1', section: 'ocean', prompt: 'I gain momentum through active interaction with others.', options: likert('extraversion') },
  { id: 'ocean-extra-2', section: 'ocean', prompt: 'I am comfortable initiating conversations in unfamiliar groups.', options: likert('extraversion') },
  { id: 'ocean-agree-1', section: 'ocean', prompt: 'I look for cooperative outcomes in disagreement.', options: likert('agreeableness') },
  { id: 'ocean-neuro-1', section: 'ocean', prompt: 'Under uncertainty, I feel tension that affects focus.', options: likert('neuroticism') },

  { id: 'riasec-1', section: 'riasec', prompt: 'Which task feels most energizing?', options: [{ label: 'Build or repair a practical system', value: 'Realistic', score: 2 }, { label: 'Investigate a complex problem', value: 'Investigative', score: 2 }, { label: 'Design an original concept', value: 'Artistic', score: 2 }] },
  { id: 'riasec-2', section: 'riasec', prompt: 'Which role feels most natural?', options: [{ label: 'Coach and support people', value: 'Social', score: 2 }, { label: 'Lead strategy and influence outcomes', value: 'Enterprising', score: 2 }, { label: 'Organize systems and details', value: 'Conventional', score: 2 }] },
  { id: 'riasec-3', section: 'riasec', prompt: 'Which outcome is most satisfying?', options: [{ label: 'A reliable process that works daily', value: 'Conventional', score: 2 }, { label: 'A persuasive launch with buy-in', value: 'Enterprising', score: 2 }, { label: 'A meaningful person-to-person impact', value: 'Social', score: 2 }] },

  { id: 'motivation-1', section: 'motivation', prompt: 'What most sustains your effort over time?', options: [{ label: 'Stability and predictability', value: 'Security-Seeking', score: 2 }, { label: 'Challenge and measurable progress', value: 'Achievement-Driven', score: 2 }, { label: 'Autonomy in decisions', value: 'Autonomy-Protective', score: 2 }] },
  { id: 'motivation-2', section: 'motivation', prompt: 'When a plan slips, your first impulse is to…', options: [{ label: 'Reduce risk and stabilize', value: 'Security-Seeking', score: 2 }, { label: 'Push for a stronger target', value: 'Achievement-Driven', score: 2 }, { label: 'Redesign the path independently', value: 'Autonomy-Protective', score: 2 }] },

  { id: 'stress-1', section: 'stress', hint: STRESS_HINT, prompt: 'When overwhelmed, I most commonly…', options: [{ label: 'Withdraw to reset', value: 'Reset-Oriented', score: 2 }, { label: 'Over-plan details', value: 'Control-Oriented', score: 2 }, { label: 'Seek reassurance and alignment', value: 'Support-Oriented', score: 2 }, { label: 'Become reactive and impatient', value: 'Urgency-Oriented', score: 2 }] },
  { id: 'stress-2', section: 'stress', hint: STRESS_HINT, prompt: 'Under pressure, I worry most about…', options: [{ label: 'Losing control of outcomes', value: 'Control-Oriented', score: 2 }, { label: 'Failing expectations', value: 'Achievement-Driven', score: 2 }, { label: 'Being unsupported', value: 'Support-Oriented', score: 2 }, { label: 'Being misunderstood', value: 'Reset-Oriented', score: 2 }] },

  { id: 'leadership-1', section: 'leadership', prompt: 'In group discussions, I usually…', options: [{ label: 'Lead direction quickly', value: 'Directive', score: 2 }, { label: 'Observe first, then frame insights', value: 'Analytical', score: 2 }, { label: 'Protect harmony and alignment', value: 'Facilitative', score: 2 }, { label: 'Challenge weak assumptions', value: 'Challenger', score: 2 }] },
  { id: 'leadership-2', section: 'leadership', prompt: 'Which role feels most natural?', options: [{ label: 'Strategist', value: 'Directive', score: 2 }, { label: 'Operator', value: 'Analytical', score: 2 }, { label: 'Communicator', value: 'Facilitative', score: 2 }, { label: 'Specialist', value: 'Challenger', score: 2 }] },

  { id: 'workstyle-1', section: 'workstyle', prompt: 'When learning a new platform, I prefer to…', options: [{ label: 'Experiment immediately', value: 'Explorer', score: 2 }, { label: 'Read docs first', value: 'Planner', score: 2 }, { label: 'Watch a walkthrough', value: 'Observer', score: 2 }, { label: 'Map the whole system first', value: 'Architect', score: 2 }] },
  { id: 'workstyle-2', section: 'workstyle', prompt: 'Which feels more satisfying?', options: [{ label: 'Improve an existing system', value: 'Optimizer', score: 2 }, { label: 'Create a new concept', value: 'Builder', score: 2 }] },

  { id: 'cog-pattern-1', section: 'cognitive', cognitiveDomain: 'pattern', difficulty: 'easy', hint: COGNITIVE_HINTS.pattern, prompt: 'Pattern reasoning: 3, 6, 9, 12, ?', options: [{ label: '14', value: 'pattern', score: 0 }, { label: '15', value: 'pattern', score: 2 }, { label: '16', value: 'pattern', score: 0 }, { label: '18', value: 'pattern', score: 0 }, cognitiveUnknownOption('pattern')] },
  { id: 'cog-pattern-2', section: 'cognitive', cognitiveDomain: 'pattern', difficulty: 'medium', hint: COGNITIVE_HINTS.pattern, prompt: 'Pattern reasoning: 1, 4, 9, 16, 25, ?', options: [{ label: '30', value: 'pattern', score: 0 }, { label: '35', value: 'pattern', score: 0 }, { label: '36', value: 'pattern', score: 2 }, { label: '49', value: 'pattern', score: 0 }, cognitiveUnknownOption('pattern')] },
  { id: 'cog-pattern-3', section: 'cognitive', cognitiveDomain: 'pattern', difficulty: 'hard', hint: COGNITIVE_HINTS.pattern, prompt: 'Pattern reasoning: 2, 5, 11, 23, 47, ?', options: [{ label: '71', value: 'pattern', score: 0 }, { label: '81', value: 'pattern', score: 0 }, { label: '95', value: 'pattern', score: 2 }, { label: '99', value: 'pattern', score: 0 }, cognitiveUnknownOption('pattern')] },

  { id: 'cog-verbal-1', section: 'cognitive', cognitiveDomain: 'verbal', difficulty: 'easy', hint: COGNITIVE_HINTS.verbal, prompt: 'Verbal reasoning: Compass is to direction as thermometer is to…', options: [{ label: 'Heat', value: 'verbal', score: 0 }, { label: 'Temperature', value: 'verbal', score: 2 }, { label: 'Medicine', value: 'verbal', score: 0 }, { label: 'Weather', value: 'verbal', score: 0 }, cognitiveUnknownOption('verbal')] },
  { id: 'cog-verbal-2', section: 'cognitive', cognitiveDomain: 'verbal', difficulty: 'medium', hint: COGNITIVE_HINTS.verbal, prompt: 'Verbal reasoning: All blue birds can fly. Some flying animals swim. Most reasonable statement?', options: [{ label: 'All blue birds swim', value: 'verbal', score: 0 }, { label: 'Some blue birds may swim', value: 'verbal', score: 2 }, { label: 'No swimming animals fly', value: 'verbal', score: 0 }, { label: 'All birds swim', value: 'verbal', score: 0 }, cognitiveUnknownOption('verbal')] },

  { id: 'cog-numerical-1', section: 'cognitive', cognitiveDomain: 'numerical', difficulty: 'medium', hint: COGNITIVE_HINTS.numerical, prompt: 'Numerical reasoning: Price up 10%, then down 10%. Final price vs original?', options: [{ label: 'Higher', value: 'numerical', score: 0 }, { label: 'Lower', value: 'numerical', score: 2 }, { label: 'The same', value: 'numerical', score: 0 }, { label: 'Cannot determine', value: 'numerical', score: 0 }, cognitiveUnknownOption('numerical')] },
  { id: 'cog-numerical-2', section: 'cognitive', cognitiveDomain: 'numerical', difficulty: 'easy', hint: COGNITIVE_HINTS.numerical, prompt: 'Numerical reasoning: 4 workers finish in 12h. 8 workers need…', options: [{ label: '3h', value: 'numerical', score: 0 }, { label: '4h', value: 'numerical', score: 0 }, { label: '6h', value: 'numerical', score: 2 }, { label: '8h', value: 'numerical', score: 0 }, cognitiveUnknownOption('numerical')] },

  { id: 'cog-spatial-1', section: 'cognitive', cognitiveDomain: 'spatial', difficulty: 'easy', hint: COGNITIVE_HINTS.spatial, prompt: 'Spatial reasoning: Rotating “b” by 180° most closely looks like…', options: [{ label: 'q', value: 'spatial', score: 2 }, { label: 'd', value: 'spatial', score: 0 }, { label: 'p', value: 'spatial', score: 0 }, { label: 'g', value: 'spatial', score: 0 }, cognitiveUnknownOption('spatial')] },
  { id: 'cog-spatial-2', section: 'cognitive', cognitiveDomain: 'spatial', difficulty: 'medium', hint: COGNITIVE_HINTS.spatial, prompt: 'Spatial reasoning: A rectangle is folded vertically. Which must match on both sides?', options: [{ label: 'Distance from fold line', value: 'spatial', score: 2 }, { label: 'Word orientation', value: 'spatial', score: 0 }, { label: 'Color labels', value: 'spatial', score: 0 }, { label: 'Reading order', value: 'spatial', score: 0 }, cognitiveUnknownOption('spatial')] },

  { id: 'cog-memory-1', section: 'cognitive', cognitiveDomain: 'memory', difficulty: 'easy', hint: COGNITIVE_HINTS.memory, prompt: 'Working memory: Remember 8 - 3 - 1 - 9 - 4. What was the 4th number?', options: [{ label: '1', value: 'memory', score: 0 }, { label: '9', value: 'memory', score: 2 }, { label: '4', value: 'memory', score: 0 }, { label: '8', value: 'memory', score: 0 }, cognitiveUnknownOption('memory')] },
  { id: 'cog-memory-2', section: 'cognitive', cognitiveDomain: 'memory', difficulty: 'hard', hint: COGNITIVE_HINTS.memory, prompt: 'Working memory: Remember K - 2 - M - 7 - P - 4. Which symbol came immediately before P?', options: [{ label: '7', value: 'memory', score: 2 }, { label: 'M', value: 'memory', score: 0 }, { label: '4', value: 'memory', score: 0 }, { label: '2', value: 'memory', score: 0 }, cognitiveUnknownOption('memory')] }
];
