import type { QuestionTranslations } from './types';

export const msQuestionTranslations: QuestionTranslations = {
  'default-likert': { options: ['Sangat tidak setuju', 'Tidak setuju', 'Neutral', 'Setuju', 'Sangat setuju'] },
  'default-idk': { options: ['Saya tidak pasti'] },
  'stress-hint': { hint: 'Pilih keadaan yang paling biasa ketika tekanan sebenar, bukan jawapan ideal.' },
  'pattern-hint': { hint: 'Jejak peraturan langkah demi langkah dan semak pada semua terma.' },
  'verbal-hint': { hint: 'Fokus pada makna dan logik, bukan kata kunci semata-mata.' },
  'numerical-hint': { hint: 'Tukar ayat kepada nombor dahulu sebelum banding pilihan.' },
  'spatial-hint': { hint: 'Putar, cermin, atau lipat secara mental sambil kekalkan kedudukan relatif.' },
  'memory-hint': { hint: 'Ingat turutan dahulu, kemudian cari posisi yang diminta dengan teliti.' }
};
