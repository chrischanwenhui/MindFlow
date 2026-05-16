import type { QuestionTranslations } from './types';

export const zhQuestionTranslations: QuestionTranslations = {
  'default-likert': { options: ['非常不同意', '不同意', '中立', '同意', '非常同意'] },
  'default-idk': { options: ['我不确定'] },
  'stress-hint': { hint: '请选择你在真实压力下最常见的状态，而不是理想状态。' },
  'pattern-hint': { hint: '先找出逐步变化规律，再验证每一项。' },
  'verbal-hint': { hint: '关注语义与逻辑，不只看关键词。' },
  'numerical-hint': { hint: '先把题意转成数字关系，再比较选项。' },
  'spatial-hint': { hint: '在脑中旋转、镜像或折叠，并保持相对位置。' },
  'memory-hint': { hint: '先记住顺序，再定位指定位置。' },

  'mbti-ei-1': {
    prompt: '经历高强度的一周后，你通常会通过什么方式恢复精力？',
    options: ['安静地独处与反思', '安排社交和交流']
  },
  'mbti-sn-1': {
    prompt: '启动一个复杂项目时，你会先寻找……',
    options: ['具体事实与已验证的方法', '潜在规律与可能性']
  },
  'riasec-1': {
    prompt: '哪类任务最让你有干劲？',
    options: ['搭建或修复实用系统', '深入追查复杂问题的根因', '设计原创概念或体验']
  },
  'riasec-6': {
    prompt: '当团队推进停滞时，你通常会……',
    options: ['澄清流程和职责归属', '调动成员并推动决策', '支持士气并促进对齐']
  },
  'motivation-1': {
    prompt: '什么最能长期支撑你的投入？',
    options: ['稳定与可预期', '挑战与可衡量的进展', '决策上的自主空间']
  },
  'stress-1': {
    prompt: '当我感到不堪重负时，我最常会……',
    options: ['先抽离一下重整状态', '过度规划细节', '寻求安抚与共识', '变得急躁、反应更快']
  },
  'leadership-1': {
    prompt: '在小组讨论中，我通常会……',
    options: ['快速设定方向', '先观察再提炼洞察', '守住协作一致与信任', '挑战薄弱假设']
  },
  'workstyle-1': {
    prompt: '学习一个新平台时，我更倾向于……',
    options: ['先直接上手试', '先读文档再操作', '先看演示流程', '先梳理整体架构']
  },
  'cog-pattern-1': {
    prompt: '图形/规律推理：5, 8, 11, 14, ?'
  },
  'cog-verbal-1': {
    prompt: '语言推理：蓝图之于建筑，正如食谱之于……',
    options: ['厨房', '餐点', '盘子', '厨师', '我不确定']
  },
  'cog-numerical-1': {
    prompt: '数字推理：200 的 15% 等于……'
  },
  'cog-spatial-1': {
    prompt: '空间推理：字母“L”顺时针旋转 90° 后，朝向是……',
    options: ['左上', '右上', '左下', '右下', '我不确定']
  },
  'cog-memory-1': {
    prompt: '工作记忆挑战',
    memoryPrompt: '7 - 1 - 4 - 9 - 2',
    memoryQuestion: '第 2 个数字是什么？',
    options: ['1', '4', '7', '9', '我不确定']
  },
  'cog-memory-2': {
    prompt: '工作记忆挑战',
    memoryPrompt: 'P - 3 - T - 8 - M - 6',
    memoryQuestion: '紧跟在 T 后面的是什么？',
    options: ['8', 'M', '3', '6', '我不确定']
  },
  'cog-memory-3': {
    prompt: '工作记忆挑战',
    memoryPrompt: 'D - 5 - K - 1 - R - 9 - B',
    memoryQuestion: '第 6 项是什么？',
    options: ['R', '9', '1', 'B', '我不确定']
  }
};
