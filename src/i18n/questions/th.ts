import type { QuestionTranslations } from './types';

export const thQuestionTranslations: QuestionTranslations = {
  'default-likert': { options: ['ไม่เห็นด้วยอย่างยิ่ง', 'ไม่เห็นด้วย', 'เป็นกลาง', 'เห็นด้วย', 'เห็นด้วยอย่างยิ่ง'] },
  'default-idk': { options: ['ไม่ทราบ'] },
  'stress-hint': { hint: 'โปรดเลือกสภาวะที่เกิดกับคุณบ่อยที่สุดเมื่อมีความเครียดจริง ไม่ใช่คำตอบในอุดมคติ' },
  'pattern-hint': { hint: 'หาแพตเทิร์นแบบเป็นขั้นตอนก่อน แล้วค่อยตรวจสอบกับทุกตัวเลือก' },
  'verbal-hint': { hint: 'โฟกัสที่ความหมายและตรรกะ ไม่ใช่แค่คำสำคัญ' },
  'numerical-hint': { hint: 'แปลงโจทย์เป็นความสัมพันธ์เชิงตัวเลขก่อน แล้วค่อยเทียบตัวเลือก' },
  'spatial-hint': { hint: 'หมุน สะท้อน หรือพับในใจ โดยคงตำแหน่งสัมพัทธ์ไว้' },
  'memory-hint': { hint: 'จำลำดับก่อน แล้วค่อยระบุตำแหน่งที่ถูกถาม' }
};
