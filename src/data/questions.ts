export type Section = 'mbti' | 'ocean' | 'riasec' | 'motivation' | 'cognitive';
export type CognitiveDomain = 'pattern' | 'verbal' | 'numerical' | 'spatial';

export type Question = {
  id: string;
  section: Section;
  prompt: string;
  options: { label: string; value: string; score: number }[];
  cognitiveDomain?: CognitiveDomain;
};

export const questions: Question[] = [
  { id: 'mbti-ei-1', section: 'mbti', prompt: 'After a busy week, you recharge best by…', options: [{ label: 'Solo time with reflection', value: 'I', score: 2 }, { label: 'Spending time with people', value: 'E', score: 2 }] },
  { id: 'mbti-sn-1', section: 'mbti', prompt: 'When learning something new, you trust…', options: [{ label: 'Concrete examples first', value: 'S', score: 2 }, { label: 'Patterns and future possibilities', value: 'N', score: 2 }] },
  { id: 'ocean-open-1', section: 'ocean', prompt: 'I enjoy experimenting with new approaches.', options: [{ label: 'Not really me', value: 'open', score: 1 }, { label: 'Somewhat me', value: 'open', score: 2 }, { label: 'Very much me', value: 'open', score: 3 }] },
  { id: 'ocean-cons-1', section: 'ocean', prompt: 'I naturally create plans and follow through.', options: [{ label: 'Not really me', value: 'conscientiousness', score: 1 }, { label: 'Somewhat me', value: 'conscientiousness', score: 2 }, { label: 'Very much me', value: 'conscientiousness', score: 3 }] },
  { id: 'riasec-1', section: 'riasec', prompt: 'What sounds most energizing?', options: [{ label: 'Building systems/tools', value: 'Realistic', score: 2 }, { label: 'Investigating a complex problem', value: 'Investigative', score: 2 }, { label: 'Creating a visual concept', value: 'Artistic', score: 2 }] },
  { id: 'riasec-2', section: 'riasec', prompt: 'Pick one preferred work style.', options: [{ label: 'Teaching or helping', value: 'Social', score: 2 }, { label: 'Leading teams and pitching ideas', value: 'Enterprising', score: 2 }, { label: 'Organizing details and operations', value: 'Conventional', score: 2 }] },
  { id: 'motivation-1', section: 'motivation', prompt: 'Which fear tends to push your behavior?', options: [{ label: 'Being without support', value: 'Security-Seeking', score: 2 }, { label: 'Being seen as inadequate', value: 'Achievement-Driven', score: 2 }, { label: 'Loss of control', value: 'Autonomy-Protective', score: 2 }] },
  { id: 'cog-pattern-1', section: 'cognitive', cognitiveDomain: 'pattern', prompt: 'Pattern: 2, 4, 8, 16, ?', options: [{ label: '18', value: 'pattern', score: 0 }, { label: '24', value: 'pattern', score: 0 }, { label: '32', value: 'pattern', score: 2 }] },
  { id: 'cog-verbal-1', section: 'cognitive', cognitiveDomain: 'verbal', prompt: 'Verbal analogy: Seed is to Tree as Idea is to…', options: [{ label: 'Blueprint', value: 'verbal', score: 0 }, { label: 'Innovation', value: 'verbal', score: 2 }, { label: 'Brain', value: 'verbal', score: 0 }] },
  { id: 'cog-spatial-1', section: 'cognitive', cognitiveDomain: 'spatial', prompt: 'Spatial intuition: Rotating a “b” by 180° resembles…', options: [{ label: 'q', value: 'spatial', score: 2 }, { label: 'd', value: 'spatial', score: 0 }, { label: 'p', value: 'spatial', score: 0 }] }
];
