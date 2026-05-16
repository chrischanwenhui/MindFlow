import type { QuestionTranslations } from './types';

export const msQuestionTranslations: QuestionTranslations = {
  'default-likert': { options: ['Sangat tidak setuju', 'Tidak setuju', 'Neutral', 'Setuju', 'Sangat setuju'] },
  'default-idk': { options: ['Saya tidak pasti'] },
  'stress-hint': { hint: 'Pilih keadaan yang paling biasa ketika tekanan sebenar, bukan jawapan ideal.' },
  'pattern-hint': { hint: 'Jejak peraturan langkah demi langkah dan semak pada semua terma.' },
  'verbal-hint': { hint: 'Fokus pada makna dan logik, bukan kata kunci semata-mata.' },
  'numerical-hint': { hint: 'Tukar ayat kepada nombor dahulu sebelum banding pilihan.' },
  'spatial-hint': { hint: 'Putar, cermin, atau lipat secara mental sambil kekalkan kedudukan relatif.' },
  'memory-hint': { hint: 'Ingat turutan dahulu, kemudian cari posisi yang diminta dengan teliti.' },

  'mbti-ei-1': {
    prompt: 'Selepas seminggu yang memenatkan, anda biasanya pulih tenaga dengan…',
    options: ['Tenangkan diri dan refleksi secara sendiri', 'Rancang aktiviti sosial dan berbual']
  },
  'mbti-sn-1': {
    prompt: 'Apabila memulakan projek yang kompleks, anda terlebih dahulu mencari…',
    options: ['Fakta konkrit dan kaedah yang terbukti', 'Corak serta kemungkinan baharu']
  },
  'riasec-1': {
    prompt: 'Tugasan mana paling memberi anda semangat?',
    options: ['Bina atau baiki sistem praktikal', 'Siasat punca utama isu yang kompleks', 'Rangka konsep atau pengalaman yang asli']
  },
  'riasec-6': {
    prompt: 'Bila pasukan mula tersekat, anda biasanya…',
    options: ['Jelaskan proses dan pemilikan tugas', 'Gerakkan orang dan percepat keputusan', 'Sokong moral dan selaraskan pasukan']
  },
  'motivation-1': {
    prompt: 'Apa yang paling mengekalkan usaha anda untuk jangka panjang?',
    options: ['Kestabilan dan kebolehramalan', 'Cabaran serta kemajuan yang boleh diukur', 'Autonomi dalam membuat keputusan']
  },
  'stress-1': {
    prompt: 'Apabila rasa terlalu terbeban, saya paling kerap…',
    options: ['Undur seketika untuk reset', 'Terlalu merancang butiran', 'Cari sokongan dan keselarasan', 'Jadi lebih reaktif dan tidak sabar']
  },
  'leadership-1': {
    prompt: 'Dalam perbincangan kumpulan, saya biasanya…',
    options: ['Tetapkan arah dengan cepat', 'Perhati dahulu kemudian rangkumkan insight', 'Jaga keselarasan dan kepercayaan', 'Cabarkan andaian yang lemah']
  },
  'workstyle-1': {
    prompt: 'Bila belajar platform baharu, saya lebih suka…',
    options: ['Terus cuba dan eksperimen', 'Baca dokumentasi dahulu', 'Tonton demo langkah demi langkah', 'Peta seni bina dahulu']
  },
  'cog-pattern-1': {
    prompt: 'Penaakulan corak: 5, 8, 11, 14, ?'
  },
  'cog-verbal-1': {
    prompt: 'Penaakulan verbal: Pelan bangunan adalah kepada bangunan seperti resipi kepada…',
    options: ['Dapur', 'Hidangan', 'Pinggan', 'Chef', 'Saya tidak pasti']
  },
  'cog-numerical-1': {
    prompt: 'Penaakulan nombor: 15% daripada 200 ialah…'
  },
  'cog-spatial-1': {
    prompt: 'Penaakulan ruang: Putar huruf “L” 90° ikut arah jam. Arah akhirnya ialah…',
    options: ['Atas-kiri', 'Atas-kanan', 'Bawah-kiri', 'Bawah-kanan', 'Saya tidak pasti']
  },
  'cog-memory-1': {
    prompt: 'Cabaran memori kerja',
    memoryPrompt: '7 - 1 - 4 - 9 - 2',
    memoryQuestion: 'Apakah nombor ke-2?',
    options: ['1', '4', '7', '9', 'Saya tidak pasti']
  },
  'cog-memory-2': {
    prompt: 'Cabaran memori kerja',
    memoryPrompt: 'P - 3 - T - 8 - M - 6',
    memoryQuestion: 'Item yang datang sejurus selepas T ialah?',
    options: ['8', 'M', '3', '6', 'Saya tidak pasti']
  },
  'cog-memory-3': {
    prompt: 'Cabaran memori kerja',
    memoryPrompt: 'D - 5 - K - 1 - R - 9 - B',
    memoryQuestion: 'Yang manakah item ke-6?',
    options: ['R', '9', '1', 'B', 'Saya tidak pasti']
  }
};
