// TODO: New expanded question bank falls back to English until translation coverage is expanded.
export type Section = 'mbti' | 'ocean' | 'riasec' | 'motivation' | 'stress' | 'leadership' | 'workstyle' | 'cognitive';
export type CognitiveDomain = 'pattern' | 'verbal' | 'numerical' | 'spatial' | 'memory';
export type CognitiveDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionOption = { label: string; value: string; score: number };
export type Question = { id: string; section: Section; prompt: string; options: QuestionOption[]; hint?: string; cognitiveDomain?: CognitiveDomain; difficulty?: CognitiveDifficulty; groupLabel?: string; scoringDomain?: string; scoringDirection?: 'positive'|'reverse'; memoryPrompt?: string; memoryQuestion?: string; revealSeconds?: number };

const likertOptions = (value: string): QuestionOption[] => [1,2,3,4,5].map((s,i)=>({label:['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'][i],value,score:s}));
const idk = (d: CognitiveDomain): QuestionOption => ({ label: "I don't know", value: `${d}-unknown`, score: 0 });
const cog = (id:string, cognitiveDomain:CognitiveDomain, difficulty:CognitiveDifficulty, prompt:string, options:[string,number][], extra:Partial<Question> = {}): Question => ({ id, section:'cognitive', prompt, cognitiveDomain, difficulty, hint:'Use the format and constraints in the prompt; avoid guessing if uncertain.', options:[...options.map(([label,score])=>({label,value:cognitiveDomain,score})), idk(cognitiveDomain)], scoringDomain:cognitiveDomain, groupLabel:'Cognitive Style', ...extra });

const mbti: Question[] = Array.from({length:26}).map((_,i)=>({
  id:['mbti-ei-1','mbti-ei-2','mbti-ei-3','mbti-ei-4','mbti-ei-5','mbti-ei-6','mbti-sn-1','mbti-sn-2','mbti-sn-3','mbti-sn-4','mbti-sn-5','mbti-sn-6','mbti-tf-1','mbti-tf-2','mbti-tf-3','mbti-tf-4','mbti-tf-5','mbti-tf-6','mbti-jp-1','mbti-jp-2','mbti-jp-3','mbti-jp-4','mbti-jp-5','mbti-jp-6','mbti-ei-7','mbti-sn-7'][i],
  section:'mbti' as const,
  prompt:[
    'In a busy week, I restore energy best by quiet solo time vs active social time.',
    'When beginning a project, I prefer clear facts vs future possibilities.',
    'In hard choices, I prioritize consistent logic vs interpersonal impact.',
    'I work best with a fixed plan vs flexible adjustments.'
  ][i%4],
  options:[{label:['Quiet solo reset','Concrete facts first','Logical consistency first','Structured milestones first'][i%4],value:['I','S','T','J'][i%4],score:2},{label:['Conversation and momentum','Possibilities first','Human impact first','Adaptive checkpoints first'][i%4],value:['E','N','F','P'][i%4],score:2}],
  scoringDomain:['ei','sn','tf','jp'][i%4],
  groupLabel:'MBTI Preference'
}));

const oceanTraits = ['open','conscientiousness','extraversion','agreeableness','neuroticism'] as const;
const ocean: Question[] = oceanTraits.flatMap((trait)=>Array.from({length:8}).map((_,i)=>({id:`ocean-${trait==='conscientiousness'?'cons':trait==='extraversion'?'extra':trait==='agreeableness'?'agree':trait==='neuroticism'?'neuro':'open'}-${i+1}`,section:'ocean' as const,prompt:`${trait} reflection item ${i+1}: ${i<4?'I often':'I rarely'} show this pattern in daily work decisions.`,options:likertOptions(trait),scoringDomain:trait,scoringDirection:([0,1,4,5].includes(i)?'positive':'reverse'),groupLabel:'Big Five / OCEAN'})));

const riasecValues = ['Realistic','Investigative','Artistic','Social','Enterprising','Conventional'];
const riasec: Question[] = Array.from({length:20}).map((_,i)=>({id:`riasec-${i+1}`,section:'riasec',prompt:`Which activity sounds most engaging in scenario ${i+1}?`,options:[0,1,2].map((o)=>({label:`Option ${o+1} for scenario ${i+1}`,value:riasecValues[(i+o)%6],score:2})),scoringDomain:'riasec',groupLabel:'RIASEC Interests'}));

const mslwSections: Section[] = ['motivation','stress','leadership','workstyle'];
const mslw: Question[] = Array.from({length:32}).map((_,i)=>({id:`${mslwSections[i%4]}-${i+1}`,section:mslwSections[i%4],prompt:`${mslwSections[i%4]} prompt ${i+1}: choose the response that fits your usual approach.`,options:[{label:'Option A',value:'A',score:2},{label:'Option B',value:'B',score:2},{label:'Option C',value:'C',score:2}],scoringDomain:mslwSections[i%4],groupLabel:'Motivation/Stress/Leadership/Workstyle'}));

const pattern = Array.from({length:13}).map((_,i)=>cog(`cog-pattern-${i+1}`, 'pattern', i<4?'easy':i<10?'medium':'hard', `Pattern reasoning ${i+1}: detect the rule and select the next term.`, [['A',0],['B',2],['C',0],['D',0]]));
const verbal = Array.from({length:11}).map((_,i)=>cog(`cog-verbal-${i+1}`, 'verbal', i<3?'easy':i<8?'medium':'hard', `Verbal reasoning ${i+1}: choose the best logical relation.`, [['A',0],['B',2],['C',0],['D',0]]));
const numerical = Array.from({length:11}).map((_,i)=>cog(`cog-numerical-${i+1}`, 'numerical', i<3?'easy':i<8?'medium':'hard', `Numerical reasoning ${i+1}: convert wording to numbers then compare.`, [['A',0],['B',2],['C',0],['D',0]]));
const spatial = Array.from({length:9}).map((_,i)=>cog(`cog-spatial-${i+1}`, 'spatial', i<3?'easy':i<7?'medium':'hard', `Spatial reasoning ${i+1}: rotate, mirror, or fold mentally.`, [['A',0],['B',2],['C',0],['D',0]]));
const memory = Array.from({length:10}).map((_,i)=>cog(`cog-memory-${i+1}`,'memory', i<3?'easy':i<7?'medium':'hard', 'Working memory prompt', [['A',0],['B',2],['C',0],['D',0]], {memoryPrompt:`Sequence ${i+1}: 7 - T - 3 - M - 9`, memoryQuestion:['What was the 4th item?','Which came immediately before M?','Select the reversed order.'][i%3], revealSeconds:5}));

export const questions: Question[] = [...mbti, ...ocean, ...riasec, ...mslw, ...pattern, ...verbal, ...numerical, ...spatial, ...memory];
