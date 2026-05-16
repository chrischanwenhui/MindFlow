import type { QuestionTranslations } from './types';

export const jaQuestionTranslations: QuestionTranslations = {
  'default-likert': { options: ['まったくそう思わない', 'そう思わない', 'どちらともいえない', 'そう思う', 'とてもそう思う'] },
  'default-idk': { options: ['わからない'] },
  'stress-hint': { hint: '理想ではなく、実際に強いストレス下で最も起こりやすい状態を選んでください。' },
  'pattern-hint': { hint: '段階的な規則を見つけて、各項目で検証しましょう。' },
  'verbal-hint': { hint: 'キーワードだけでなく、意味関係と論理に注目してください。' },
  'numerical-hint': { hint: '文章を数の関係に置き換えてから選択肢を比較しましょう。' },
  'spatial-hint': { hint: '頭の中で回転・反転・折りたたみを行い、相対位置を保って考えましょう。' },
  'memory-hint': { hint: 'まず順序を覚え、その後に指定位置を確認しましょう。' }
};
