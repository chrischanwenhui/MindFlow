// TODO: New expanded question bank falls back to English until translation coverage is expanded.
export type Section = 'mbti' | 'ocean' | 'riasec' | 'motivation' | 'stress' | 'leadership' | 'workstyle' | 'cognitive';
export type CognitiveDomain = 'pattern' | 'verbal' | 'numerical' | 'spatial' | 'memory';
export type CognitiveDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionOption = { label: string; value: string; score: number };
export type Question = { id: string; section: Section; prompt: string; options: QuestionOption[]; hint?: string; cognitiveDomain?: CognitiveDomain; difficulty?: CognitiveDifficulty; groupLabel?: string; scoringDomain?: string; scoringDirection?: 'positive'|'reverse'; memoryPrompt?: string; memoryQuestion?: string; revealSeconds?: number };

const likert = (value: string): QuestionOption[] => [
  { label: 'Strongly disagree', value, score: 1 },
  { label: 'Disagree', value, score: 2 },
  { label: 'Neutral', value, score: 3 },
  { label: 'Agree', value, score: 4 },
  { label: 'Strongly agree', value, score: 5 }
];
const COG_HINTS = {
  pattern: 'Track the step-by-step rule and test it against all terms.',
  verbal: 'Focus on meaning and logic, not only keyword similarity.',
  numerical: 'Translate the wording into numbers before comparing choices.',
  spatial: 'Mentally rotate, reflect, or fold while preserving relative positions.',
  memory: 'Keep the sequence order in mind, then locate the requested position carefully.'
} as const;

const mk2 = (id:string, section:'mbti', prompt:string, a:[string,'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P'], b:[string,'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P'], scoringDomain:string): Question => ({ id, section, prompt, options:[{label:a[0],value:a[1],score:2},{label:b[0],value:b[1],score:2}], scoringDomain, groupLabel:'MBTI Preference' });
const mkCog = (id:string, d:CognitiveDomain, difficulty:CognitiveDifficulty, prompt:string, opts:[string,number][], extra:Partial<Question>={}):Question => ({ id, section:'cognitive', cognitiveDomain:d, difficulty, hint:COG_HINTS[d], prompt, options:[...opts.map(([label,score])=>({label,value:d,score})), {label:"I don't know", value:`${d}-unknown`, score:0}], scoringDomain:d, groupLabel:'Cognitive Style', ...extra });

const mbti: Question[] = [
  mk2('mbti-ei-1','mbti','After a long week, your reset is usually…',['Quiet time alone','I'],['Time with people','E'],'ei'),
  mk2('mbti-ei-2','mbti','In unfamiliar groups, you usually…',['Observe before speaking','I'],['Start conversation quickly','E'],'ei'),
  mk2('mbti-ei-3','mbti','When solving a tough issue, you prefer…',['Think privately first','I'],['Brainstorm out loud','E'],'ei'),
  mk2('mbti-ei-4','mbti','During events, you tend to…',['Take short social breaks','I'],['Stay socially active','E'],'ei'),
  mk2('mbti-ei-5','mbti','Your best reflection time is often…',['Solo review sessions','I'],['Discussion with others','E'],'ei'),
  mk2('mbti-ei-6','mbti','For ideas you care about, you usually…',['Refine internally first','I'],['Share early to shape it','E'],'ei'),
  mk2('mbti-sn-1','mbti','At project kickoff, you first look for…',['Reliable facts and examples','S'],['Themes and possibilities','N'],'sn'),
  mk2('mbti-sn-2','mbti','When learning tools, you prefer…',['Hands-on steps','S'],['Big-picture model','N'],'sn'),
  mk2('mbti-sn-3','mbti','In ambiguous choices, you trust…',['Observed evidence','S'],['Inferred direction','N'],'sn'),
  mk2('mbti-sn-4','mbti','In planning, you rely more on…',['What worked before','S'],['What could emerge next','N'],'sn'),
  mk2('mbti-sn-5','mbti','You notice details mainly about…',['Practical constraints','S'],['Pattern connections','N'],'sn'),
  mk2('mbti-sn-6','mbti','When describing ideas, you use…',['Concrete examples','S'],['Conceptual framing','N'],'sn'),
  mk2('mbti-tf-1','mbti','For hard decisions, your first anchor is…',['Logic and consistency','T'],['People impact and context','F'],'tf'),
  mk2('mbti-tf-2','mbti','In feedback, you prioritize…',['Accuracy and directness','T'],['Tone and encouragement','F'],'tf'),
  mk2('mbti-tf-3','mbti','In conflict, you first try to…',['Clarify criteria','T'],['Restore understanding','F'],'tf'),
  mk2('mbti-tf-4','mbti','When a policy feels unfair, you tend to…',['Re-evaluate the rule logic','T'],['Re-evaluate human impact','F'],'tf'),
  mk2('mbti-tf-5','mbti','When judging options, you weigh…',['Trade-offs and structure','T'],['Values and relationships','F'],'tf'),
  mk2('mbti-tf-6','mbti','If a teammate struggles, you start by…',['Defining practical fixes','T'],['Checking emotional context','F'],'tf'),
  mk2('mbti-jp-1','mbti','Your workflow preference is usually…',['Structured milestones','J'],['Flexible checkpoints','P'],'jp'),
  mk2('mbti-jp-2','mbti','Before deadlines, you usually…',['Lock a plan early','J'],['Keep options open longer','P'],'jp'),
  mk2('mbti-jp-3','mbti','Calendar changes make you feel…',['More stable with certainty','J'],['More energized with flexibility','P'],'jp'),
  mk2('mbti-jp-4','mbti','When traveling, you prefer…',['Defined itinerary','J'],['Loose exploration plan','P'],'jp'),
  mk2('mbti-jp-5','mbti','For daily tasks, you prefer…',['Completion before switching','J'],['Switching as priorities shift','P'],'jp'),
  mk2('mbti-jp-6','mbti','In uncertain timelines, you lean toward…',['Earlier closure','J'],['Later adaptation','P'],'jp')
];

const oceanTraits = ['open','conscientiousness','extraversion','agreeableness','neuroticism'] as const;
const ocean = oceanTraits.flatMap((trait)=>Array.from({length:8}).map((_,i)=>({
  id:`ocean-${trait==='conscientiousness'?'cons':trait==='extraversion'?'extra':trait==='agreeableness'?'agree':trait==='neuroticism'?'neuro':'open'}-${i+1}`,
  section:'ocean' as const,
  prompt:`${trait} reflection item ${i+1}: ${i<4?'I often':'I rarely'} show this pattern in daily work decisions.`,
  options:likert(trait), scoringDomain:trait, scoringDirection:([0,1,4,5].includes(i)?'positive':'reverse') as 'positive'|'reverse', groupLabel:'Big Five / OCEAN'
})));

const riasecValues = ['Realistic','Investigative','Artistic','Social','Enterprising','Conventional'];
const riasec = Array.from({length:20}).map((_,i)=>({id:`riasec-${i+1}`,section:'riasec' as const,prompt:`Which activity sounds most engaging in scenario ${i+1}?`,options:[0,1,2].map((o)=>({label:`Option ${o+1} for scenario ${i+1}`,value:riasecValues[(i+o)%6],score:2})),scoringDomain:'riasec',groupLabel:'RIASEC Interests'}));
const mslwSections: Section[] = ['motivation','stress','leadership','workstyle'];
const mslw = Array.from({length:32}).map((_,i)=>({id:`${mslwSections[i%4]}-${i+1}`,section:mslwSections[i%4],prompt:`${mslwSections[i%4]} prompt ${i+1}: choose the response that fits your usual approach.`,options:[{label:'Option A',value:'A',score:2},{label:'Option B',value:'B',score:2},{label:'Option C',value:'C',score:2}],scoringDomain:mslwSections[i%4],groupLabel:'Motivation/Stress/Leadership/Workstyle'}));

const pattern = [
  mkCog('cog-pattern-1','pattern','easy','Pattern: 4, 7, 11, 16, 22, ?', [['27',2],['28',0],['29',0],['30',0]]),
  mkCog('cog-pattern-2','pattern','easy','Pattern: 3, 6, 12, 24, ?', [['36',0],['48',2],['54',0],['60',0]]),
  mkCog('cog-pattern-3','pattern','easy','Pattern: 2, 6, 18, 54, ?', [['108',0],['126',0],['162',2],['180',0]]),
  mkCog('cog-pattern-4','pattern','easy','Pattern: 10, 13, 16, 19, ?', [['20',0],['21',0],['22',2],['23',0]]),
  mkCog('cog-pattern-5','pattern','medium','Pattern: 1, 4, 9, 16, 25, ?', [['30',0],['34',0],['36',2],['49',0]]),
  mkCog('cog-pattern-6','pattern','medium','Pattern: 2, 5, 10, 17, 26, ?', [['37',2],['38',0],['39',0],['40',0]]),
  mkCog('cog-pattern-7','pattern','medium','Pattern: 81, 27, 9, 3, ?', [['2',0],['1',2],['0',0],['3',0]]),
  mkCog('cog-pattern-8','pattern','medium','Pattern: 7, 10, 16, 25, 37, ?', [['48',0],['49',0],['50',2],['52',0]]),
  mkCog('cog-pattern-9','pattern','medium','Pattern: 5, 9, 17, 33, ?', [['49',0],['57',0],['61',0],['65',2]]),
  mkCog('cog-pattern-10','pattern','hard','Pattern: 1, 2, 6, 24, 120, ?', [['240',0],['600',0],['720',2],['840',0]]),
  mkCog('cog-pattern-11','pattern','hard','Pattern: 8, 6, 9, 7, 10, 8, ?', [['11',2],['12',0],['13',0],['14',0]]),
  mkCog('cog-pattern-12','pattern','hard','Pattern: 2, 3, 5, 8, 12, 17, ?', [['21',0],['23',0],['24',2],['26',0]])
];
const verbal = Array.from({length:10}).map((_,i)=>mkCog(`cog-verbal-${i+1}`,'verbal',i<3?'easy':i<8?'medium':'hard',[
  'Map is to route as blueprint is to ?',
  'Cause is to effect as question is to ?',
  'Seed is to tree as idea is to ?',
  'All pilots are trained. Mei is a pilot. Therefore Mei is…',
  'No silent room has loud music. Room A has loud music. Room A is…',
  'Book is to reading as code is to ?',
  'If some designers are managers, which must be true?',
  'Honest is to trust as accurate is to ?',
  'Clock is to time as compass is to ?',
  'If no interns lead projects, and Ana leads a project, Ana is…'
][i],[['Route plan',0],['Building',0],['Construction guide',2],['Road',0],['Answer',2],['Question',0],['Cause',0],['Noise',0],['Project',2],['Seed',0],['Tree',0],['Leaf',0],['Trained',2],['Experienced',0],['Manager',0],['Senior',0],['Silent',0],['Not silent',2],['Unknown',0],['Echoing',0],['Debugging',2],['Reading',0],['Typing',0],['Internet',0],['All designers are managers',0],['Some managers are designers',2],['No designers are managers',0],['Managers design all things',0],['Precision',2],['Speed',0],['Popularity',0],['Decoration',0],['Direction',2],['Distance',0],['North pole',0],['Map',0],['An intern',0],['Not an intern',2],['A manager',0],['Impossible to tell',0]][i*4] ? [['A',0],['B',0],['C',2],['D',0]]:[['A',2],['B',0],['C',0],['D',0]]));
const numerical = Array.from({length:10}).map((_,i)=>mkCog(`cog-numerical-${i+1}`,'numerical',i<3?'easy':i<8?'medium':'hard',[
  '18 is 30% of what number?', 'A price rises 20% then falls 20%. Final is…', 'If 6 people finish work in 8h, 12 people need…', '25% of 240 equals…', 'A number doubles then +6 gives 30. Original?', 'Ratio 3:5 equals ? : 20', 'If x + 7 = 19, x = ?', 'Train speed 60 km/h for 2.5h distance?', 'Increase 80 to 100 is what percent?', 'Average of 12, 18, 24 ?'
][i],[['40',0],['50',0],['60',2],['70',0],['Higher',0],['Lower',2],['Same',0],['Cannot tell',0],['2 hours',0],['4 hours',2],['6 hours',0],['8 hours',0],['50',0],['55',0],['60',2],['65',0],['9',0],['12',2],['15',0],['18',0],['10',0],['12',2],['15',0],['18',0],['10',0],['12',2],['14',0],['16',0],['120 km',0],['140 km',0],['150 km',2],['160 km',0],['20%',0],['25%',2],['30%',0],['40%',0],['16',0],['18',2],['20',0],['22',0]].slice(i*4,i*4+4).map((v,j)=>[String(v[0]), Number(v[1])] as [string,number])));
const spatial = Array.from({length:8}).map((_,i)=>mkCog(`cog-spatial-${i+1}`,'spatial',i<2?'easy':i<6?'medium':'hard',[
  'Rotate the letter L by 90° clockwise. Base points…','Mirror a right-pointing arrow on vertical line. It points…','On a cube, top opposite bottom. If top is red, bottom is…','Paper fold once vertically, punch near left edge, unfold holes appear…','Facing north, turn right then right. Now facing…','A shape rotated 180° appears…','If east is right on map, north is…','Mirror the text AB. First visible character is…'
][i],[['Right',2],['Left',0],['Up',0],['Down',0],['Left',2],['Right',0],['Up',0],['Down',0],['Red opposite face',2],['Adjacent red',0],['Same face',0],['Unknown',0],['Two symmetric holes',2],['One hole',0],['Four holes',0],['No hole',0],['South',2],['East',0],['West',0],['North',0],['Upside-down same shape',2],['Mirror only',0],['No change',0],['Random shape',0],['Up',2],['Down',0],['Left',0],['Right',0],['B',2],['A',0],['AB',0],['BA',0]].slice(i*4,i*4+4).map((v)=>[String(v[0]),Number(v[1])] as [string,number])));
const memory = Array.from({length:10}).map((_,i)=>mkCog(`cog-memory-${i+1}`,'memory',i<3?'easy':i<7?'medium':'hard','Working memory challenge',[
  ['7',0],['T',0],['M',2],['9',0],
  ['3',2],['4',0],['5',0],['6',0],
  ['K',0],['L',2],['M',0],['N',0],
  ['8',0],['1',0],['5',2],['7',0],
  ['Q',2],['R',0],['S',0],['T',0],
  ['B',0],['D',0],['F',2],['H',0],
  ['2',0],['3',2],['4',0],['5',0],
  ['P',0],['M',2],['N',0],['O',0],
  ['9',2],['7',0],['5',0],['3',0],
  ['C',0],['A',2],['B',0],['D',0]
].slice(i*4,i*4+4) as [string,number][], {memoryPrompt:[
  '7 - 1 - M - 9 - T','3 - 8 - 4 - A - 5','K - 2 - L - 9 - M','8 - 3 - 1 - 5 - R','Q - 4 - R - 6 - S','B - C - D - F - H','2 - 9 - 3 - P - 4','P - L - M - N - O','9 - 7 - 5 - 3 - 1','C - B - A - D - E'
][i], memoryQuestion:['What was the 3rd item?','What was the 1st number?','Which came immediately after 2?','What was the 4th item?','What was the 1st item?','Which letter is in 4th position?','What came right after 9?','Which came immediately after L?','What was the first number?','What was the 3rd item?'][i], revealSeconds:5}));

export const questions: Question[] = [...mbti, ...ocean, ...riasec, ...mslw, ...pattern, ...verbal, ...numerical, ...spatial, ...memory];
