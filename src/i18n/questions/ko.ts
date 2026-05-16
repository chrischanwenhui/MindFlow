import type { QuestionTranslations } from './types';

export const koQuestionTranslations: QuestionTranslations = {
  'default-likert': { options: ['전혀 동의하지 않음', '동의하지 않음', '보통', '동의함', '매우 동의함'] },
  'default-idk': { options: ['잘 모르겠다'] },
  'stress-hint': { hint: '이상적인 모습이 아니라, 실제 스트레스 상황에서 가장 자주 나타나는 상태를 고르세요.' },
  'pattern-hint': { hint: '단계별 규칙을 먼저 찾고, 각 항목에 적용해 확인하세요.' },
  'verbal-hint': { hint: '키워드뿐 아니라 의미 관계와 논리를 보세요.' },
  'numerical-hint': { hint: '문장을 수식 관계로 바꾼 뒤 선택지를 비교하세요.' },
  'spatial-hint': { hint: '머릿속에서 회전·대칭·접기를 하며 상대 위치를 유지해 보세요.' },
  'memory-hint': { hint: '먼저 순서를 기억하고, 그다음 요청된 위치를 찾으세요.' }
};
