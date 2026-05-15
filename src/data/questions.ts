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
  { id: 'mbti-ei-1', section: 'mbti', prompt: 'After a demanding week, you usually recover energy by…', options: [{ label: 'Quiet time to reset and reflect', value: 'I', score: 2 }, { label: 'Connecting with people and activity', value: 'E', score: 2 }] },
  { id: 'mbti-ei-2', section: 'mbti', prompt: 'In meetings, your default style is to…', options: [{ label: 'Think first, then share when ready', value: 'I', score: 2 }, { label: 'Think out loud with the group', value: 'E', score: 2 }] },
  { id: 'mbti-sn-1', section: 'mbti', prompt: 'When learning a new tool, you prefer to start with…', options: [{ label: 'Hands-on steps and concrete examples', value: 'S', score: 2 }, { label: 'The overall model and future possibilities', value: 'N', score: 2 }] },
  { id: 'mbti-sn-2', section: 'mbti', prompt: 'When planning a project, you focus first on…', options: [{ label: 'Practical constraints and immediate facts', value: 'S', score: 2 }, { label: 'Potential directions and strategic patterns', value: 'N', score: 2 }] },
  { id: 'mbti-tf-1', section: 'mbti', prompt: 'In a difficult decision, your strongest guide is…', options: [{ label: 'Consistency, logic, and trade-offs', value: 'T', score: 2 }, { label: 'Impact on people and team harmony', value: 'F', score: 2 }] },
  { id: 'mbti-tf-2', section: 'mbti', prompt: 'When giving feedback, you naturally prioritize…', options: [{ label: 'Clarity and direct improvement points', value: 'T', score: 2 }, { label: 'Tone, encouragement, and trust', value: 'F', score: 2 }] },
  { id: 'mbti-jp-1', section: 'mbti', prompt: 'Your work rhythm usually feels best when it is…', options: [{ label: 'Structured with clear milestones', value: 'J', score: 2 }, { label: 'Flexible with room to adapt', value: 'P', score: 2 }] },
  { id: 'mbti-jp-2', section: 'mbti', prompt: 'Before travel or events, you usually…', options: [{ label: 'Prepare details in advance', value: 'J', score: 2 }, { label: 'Keep options open and decide later', value: 'P', score: 2 }] },

  { id: 'ocean-open-1', section: 'ocean', prompt: 'I enjoy exploring unfamiliar ideas and viewpoints.', options: [{ label: 'Rarely', value: 'open', score: 1 }, { label: 'Sometimes', value: 'open', score: 2 }, { label: 'Often', value: 'open', score: 3 }] },
  { id: 'ocean-open-2', section: 'ocean', prompt: 'I like experimenting with new methods even when the old method works.', options: [{ label: 'Rarely', value: 'open', score: 1 }, { label: 'Sometimes', value: 'open', score: 2 }, { label: 'Often', value: 'open', score: 3 }] },
  { id: 'ocean-cons-1', section: 'ocean', prompt: 'I follow through on plans I set for myself.', options: [{ label: 'Rarely', value: 'conscientiousness', score: 1 }, { label: 'Sometimes', value: 'conscientiousness', score: 2 }, { label: 'Often', value: 'conscientiousness', score: 3 }] },
  { id: 'ocean-cons-2', section: 'ocean', prompt: 'I keep track of deadlines and details with intention.', options: [{ label: 'Rarely', value: 'conscientiousness', score: 1 }, { label: 'Sometimes', value: 'conscientiousness', score: 2 }, { label: 'Often', value: 'conscientiousness', score: 3 }] },
  { id: 'ocean-extra-1', section: 'ocean', prompt: 'I gain momentum from social interaction.', options: [{ label: 'Rarely', value: 'extraversion', score: 1 }, { label: 'Sometimes', value: 'extraversion', score: 2 }, { label: 'Often', value: 'extraversion', score: 3 }] },
  { id: 'ocean-agree-1', section: 'ocean', prompt: 'I naturally look for cooperative solutions in conflict.', options: [{ label: 'Rarely', value: 'agreeableness', score: 1 }, { label: 'Sometimes', value: 'agreeableness', score: 2 }, { label: 'Often', value: 'agreeableness', score: 3 }] },
  { id: 'ocean-neuro-1', section: 'ocean', prompt: 'Under uncertainty, I feel tension that is hard to ignore.', options: [{ label: 'Rarely', value: 'neuroticism', score: 1 }, { label: 'Sometimes', value: 'neuroticism', score: 2 }, { label: 'Often', value: 'neuroticism', score: 3 }] },

  { id: 'riasec-1', section: 'riasec', prompt: 'Which project sounds most naturally appealing?', options: [{ label: 'Build or repair a practical system', value: 'Realistic', score: 2 }, { label: 'Investigate a complex question', value: 'Investigative', score: 2 }, { label: 'Design an original concept', value: 'Artistic', score: 2 }] },
  { id: 'riasec-2', section: 'riasec', prompt: 'Which contribution feels most meaningful to you?', options: [{ label: 'Coach, support, or guide others', value: 'Social', score: 2 }, { label: 'Lead an initiative and influence outcomes', value: 'Enterprising', score: 2 }, { label: 'Organize processes and improve reliability', value: 'Conventional', score: 2 }] },
  { id: 'riasec-3', section: 'riasec', prompt: 'In a new role, you are most motivated to…', options: [{ label: 'Create tangible results with tools', value: 'Realistic', score: 2 }, { label: 'Discover insights from data or evidence', value: 'Investigative', score: 2 }, { label: 'Craft stories, visuals, or experiences', value: 'Artistic', score: 2 }] },
  { id: 'riasec-4', section: 'riasec', prompt: 'You feel most in flow when your work centers on…', options: [{ label: 'Helping people develop and collaborate', value: 'Social', score: 2 }, { label: 'Driving strategy, persuasion, or direction', value: 'Enterprising', score: 2 }, { label: 'Improving order, systems, and standards', value: 'Conventional', score: 2 }] },

  { id: 'motivation-1', section: 'motivation', prompt: 'What most often sustains your effort over time?', options: [{ label: 'A sense of safety and stability', value: 'Security-Seeking', score: 2 }, { label: 'Progress and achievement milestones', value: 'Achievement-Driven', score: 2 }, { label: 'Autonomy and ownership of choices', value: 'Autonomy-Protective', score: 2 }] },
  { id: 'motivation-2', section: 'motivation', prompt: 'When a plan fails, your next move is usually driven by…', options: [{ label: 'Reducing risk before trying again', value: 'Security-Seeking', score: 2 }, { label: 'Raising standards and trying harder', value: 'Achievement-Driven', score: 2 }, { label: 'Reframing the path on your own terms', value: 'Autonomy-Protective', score: 2 }] },
  { id: 'motivation-3', section: 'motivation', prompt: 'In teams, you feel strongest when you can…', options: [{ label: 'Count on predictable support and roles', value: 'Security-Seeking', score: 2 }, { label: 'Take on stretch goals and deliver impact', value: 'Achievement-Driven', score: 2 }, { label: 'Shape your own approach with flexibility', value: 'Autonomy-Protective', score: 2 }] },

  { id: 'cog-pattern-1', section: 'cognitive', cognitiveDomain: 'pattern', prompt: 'Pattern reasoning: 3, 6, 12, 24, ?', options: [{ label: '30', value: 'pattern', score: 0 }, { label: '36', value: 'pattern', score: 0 }, { label: '48', value: 'pattern', score: 2 }] },
  { id: 'cog-pattern-2', section: 'cognitive', cognitiveDomain: 'pattern', prompt: 'Pattern reasoning: 5, 9, 13, 17, ?', options: [{ label: '19', value: 'pattern', score: 0 }, { label: '21', value: 'pattern', score: 2 }, { label: '23', value: 'pattern', score: 0 }] },
  { id: 'cog-pattern-3', section: 'cognitive', cognitiveDomain: 'pattern', prompt: 'Pattern reasoning: 2, 3, 5, 8, 12, ?', options: [{ label: '15', value: 'pattern', score: 0 }, { label: '17', value: 'pattern', score: 2 }, { label: '18', value: 'pattern', score: 0 }] },

  { id: 'cog-verbal-1', section: 'cognitive', cognitiveDomain: 'verbal', prompt: 'Verbal reasoning: Bird is to nest as bee is to…', options: [{ label: 'Hive', value: 'verbal', score: 2 }, { label: 'Flower', value: 'verbal', score: 0 }, { label: 'Wing', value: 'verbal', score: 0 }] },
  { id: 'cog-verbal-2', section: 'cognitive', cognitiveDomain: 'verbal', prompt: 'Verbal reasoning: Which word is closest in meaning to “concise”?', options: [{ label: 'Brief', value: 'verbal', score: 2 }, { label: 'Unclear', value: 'verbal', score: 0 }, { label: 'Decorative', value: 'verbal', score: 0 }] },
  { id: 'cog-verbal-3', section: 'cognitive', cognitiveDomain: 'verbal', prompt: 'Verbal reasoning: If all mentors are learners and Maya is a mentor, then Maya is…', options: [{ label: 'A learner', value: 'verbal', score: 2 }, { label: 'Not a learner', value: 'verbal', score: 0 }, { label: 'Only a teacher', value: 'verbal', score: 0 }] },

  { id: 'cog-numerical-1', section: 'cognitive', cognitiveDomain: 'numerical', prompt: 'Numerical reasoning: A notebook costs $8. What is the cost of 3 notebooks?', options: [{ label: '$16', value: 'numerical', score: 0 }, { label: '$24', value: 'numerical', score: 2 }, { label: '$28', value: 'numerical', score: 0 }] },
  { id: 'cog-numerical-2', section: 'cognitive', cognitiveDomain: 'numerical', prompt: 'Numerical reasoning: 40% of 50 equals…', options: [{ label: '15', value: 'numerical', score: 0 }, { label: '20', value: 'numerical', score: 2 }, { label: '25', value: 'numerical', score: 0 }] },
  { id: 'cog-numerical-3', section: 'cognitive', cognitiveDomain: 'numerical', prompt: 'Numerical reasoning: Which is the next number? 1, 4, 9, 16, ?', options: [{ label: '20', value: 'numerical', score: 0 }, { label: '25', value: 'numerical', score: 2 }, { label: '36', value: 'numerical', score: 0 }] },

  { id: 'cog-spatial-1', section: 'cognitive', cognitiveDomain: 'spatial', prompt: 'Spatial reasoning: Rotating the letter “b” by 180° most closely looks like…', options: [{ label: 'q', value: 'spatial', score: 2 }, { label: 'd', value: 'spatial', score: 0 }, { label: 'p', value: 'spatial', score: 0 }] },
  { id: 'cog-spatial-2', section: 'cognitive', cognitiveDomain: 'spatial', prompt: 'Spatial reasoning: A shape is folded in half vertically. Which feature must match on both sides?', options: [{ label: 'Distance from fold line', value: 'spatial', score: 2 }, { label: 'Color name', value: 'spatial', score: 0 }, { label: 'Reading direction', value: 'spatial', score: 0 }] },
  { id: 'cog-spatial-3', section: 'cognitive', cognitiveDomain: 'spatial', prompt: 'Spatial reasoning: A cube has 6 faces. If one face is top and opposite is bottom, how many side faces remain?', options: [{ label: '2', value: 'spatial', score: 0 }, { label: '3', value: 'spatial', score: 0 }, { label: '4', value: 'spatial', score: 2 }] }
];
