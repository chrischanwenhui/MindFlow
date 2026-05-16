import type { QuestionTranslations } from './types';

export const zhQuestionTranslations: QuestionTranslations = {
  'default-likert': { options: ['非常不同意', '不同意', '中立', '同意', '非常同意'] },
  'default-idk': { options: ['我不确定'] },
  'stress-hint': { hint: '请选择你在真实压力下最常见的状态，而不是理想状态。' },
  'pattern-hint': { hint: '先找出逐步变化规律，再验证每一项。' },
  'verbal-hint': { hint: '关注语义与逻辑，不只看关键词。' },
  'numerical-hint': { hint: '先把题意转成数字关系，再比较选项。' },
  'spatial-hint': { hint: '在脑中旋转、镜像或折叠，并保持相对位置。' },
  'memory-hint': { hint: '先记住顺序，再定位指定位置。' }
};
