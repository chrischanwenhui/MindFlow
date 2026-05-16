// TODO: New expanded question bank falls back to English until translation coverage is expanded.
export type Section = 'mbti' | 'ocean' | 'riasec' | 'motivation' | 'stress' | 'leadership' | 'workstyle' | 'cognitive';
export type CognitiveDomain = 'pattern' | 'verbal' | 'numerical' | 'spatial' | 'memory';
export type CognitiveDifficulty = 'easy' | 'medium' | 'hard';
export type CognitiveFormat = 'sequence' | 'analogy' | 'data-interpretation' | 'matrix' | 'memory-grid' | 'spatial-rotation';
export type QuestionOption = { label: string; value: string; score: number };
export type Question = { id: string; section: Section; prompt: string; options: QuestionOption[]; hint?: string; cognitiveDomain?: CognitiveDomain; difficulty?: CognitiveDifficulty; cognitiveFormat?: CognitiveFormat; timed?: boolean; recommendedSeconds?: number; groupLabel?: string; scoringDomain?: string; scoringDirection?: 'positive'|'reverse'; memoryPrompt?: string; memoryQuestion?: string; revealSeconds?: number };

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

const mk2 = (id:string, prompt:string, a:[string,'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P'], b:[string,'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P'], scoringDomain:string): Question => ({ id, section:'mbti', prompt, options:[{label:a[0],value:a[1],score:2},{label:b[0],value:b[1],score:2}], scoringDomain, groupLabel:'MBTI Preference' });
const mkCog = (id:string, d:CognitiveDomain, difficulty:CognitiveDifficulty, prompt:string, opts:[string,number][], extra:Partial<Question>={}):Question => ({ id, section:'cognitive', cognitiveDomain:d, difficulty, hint:COG_HINTS[d], prompt, options:[...opts.map(([label,score])=>({label,value:d,score})), {label:"I don't know", value:'default-idk', score:0}], scoringDomain:d, groupLabel:'Cognitive Workstyle', ...extra });

const mbti: Question[] = [
  mk2('mbti-ei-1','After a long week, your reset is usually…',['Quiet time alone','I'],['Time with people','E'],'ei'),
  mk2('mbti-ei-2','In unfamiliar groups, you usually…',['Observe before speaking','I'],['Start conversation quickly','E'],'ei'),
  mk2('mbti-ei-3','When solving a tough issue, you prefer…',['Think privately first','I'],['Brainstorm out loud','E'],'ei'),
  mk2('mbti-ei-4','During events, you tend to…',['Take short social breaks','I'],['Stay socially active','E'],'ei'),
  mk2('mbti-ei-5','Your best reflection time is often…',['Solo review sessions','I'],['Discussion with others','E'],'ei'),
  mk2('mbti-ei-6','For ideas you care about, you usually…',['Refine internally first','I'],['Share early to shape it','E'],'ei'),
  mk2('mbti-sn-1','At project kickoff, you first look for…',['Reliable facts and examples','S'],['Themes and possibilities','N'],'sn'),
  mk2('mbti-sn-2','When learning tools, you prefer…',['Hands-on steps','S'],['Big-picture model','N'],'sn'),
  mk2('mbti-sn-3','In ambiguous choices, you trust…',['Observed evidence','S'],['Inferred direction','N'],'sn'),
  mk2('mbti-sn-4','In planning, you rely more on…',['What worked before','S'],['What could emerge next','N'],'sn'),
  mk2('mbti-sn-5','You notice details mainly about…',['Practical constraints','S'],['Pattern connections','N'],'sn'),
  mk2('mbti-sn-6','When describing ideas, you use…',['Concrete examples','S'],['Conceptual framing','N'],'sn'),
  mk2('mbti-tf-1','For hard decisions, your first anchor is…',['Logic and consistency','T'],['People impact and context','F'],'tf'),
  mk2('mbti-tf-2','In feedback, you prioritize…',['Accuracy and directness','T'],['Tone and encouragement','F'],'tf'),
  mk2('mbti-tf-3','In conflict, you first try to…',['Clarify criteria','T'],['Restore understanding','F'],'tf'),
  mk2('mbti-tf-4','When a policy feels unfair, you tend to…',['Re-evaluate the rule logic','T'],['Re-evaluate human impact','F'],'tf'),
  mk2('mbti-tf-5','When judging options, you weigh…',['Trade-offs and structure','T'],['Values and relationships','F'],'tf'),
  mk2('mbti-tf-6','If a teammate struggles, you start by…',['Defining practical fixes','T'],['Checking emotional context','F'],'tf'),
  mk2('mbti-jp-1','Your workflow preference is usually…',['Structured milestones','J'],['Flexible checkpoints','P'],'jp'),
  mk2('mbti-jp-2','Before deadlines, you usually…',['Lock a plan early','J'],['Keep options open longer','P'],'jp'),
  mk2('mbti-jp-3','Calendar changes make you feel…',['More stable with certainty','J'],['More energized with flexibility','P'],'jp'),
  mk2('mbti-jp-4','When traveling, you prefer…',['Defined itinerary','J'],['Loose exploration plan','P'],'jp'),
  mk2('mbti-jp-5','For daily tasks, you prefer…',['Completion before switching','J'],['Switching as priorities shift','P'],'jp'),
  mk2('mbti-jp-6','In uncertain timelines, you lean toward…',['Earlier closure','J'],['Later adaptation','P'],'jp')
];

const oceanSeeds = {
  open: ['I enjoy exploring ideas outside my usual field.','I like testing a different approach when routines stall.','I am curious about perspectives very different from mine.','I seek out books, talks, or media that challenge my assumptions.','I avoid unfamiliar topics unless required.','I prefer familiar methods even when alternatives look promising.','I lose interest when discussions become abstract or conceptual.','I rarely experiment with new ways of solving everyday problems.'],
  conscientiousness: ['I break large goals into clear, trackable steps.','I follow through on commitments even when motivation drops.','I usually check details before submitting work.','I keep calendars, notes, or reminders to stay organized.','I often start tasks later than I intended.','I leave loose ends when a project gets tedious.','I skip planning and rely on last-minute urgency.','I misplace important details when juggling many tasks.'],
  extraversion: ['I gain energy from active conversation and group momentum.','I am comfortable speaking up in meetings without being asked first.','I often initiate plans to connect with friends or colleagues.','I think better when ideas are discussed out loud.','After social events, I need significant quiet time to recharge.','I avoid being the center of attention whenever possible.','I hesitate to start conversations with new people.','I prefer to process ideas privately before sharing anything.'],
  agreeableness: ['I try to understand people’s constraints before judging their choices.','I usually look for solutions that preserve relationships.','I make space for quieter voices in group decisions.','I can disagree directly while still being respectful.','I become impatient when others need extra explanation.','I prioritize being right over maintaining trust in tense moments.','I dismiss feedback quickly when it conflicts with my view.','I can be blunt enough that people feel shut down.'],
  neuroticism: ['Small uncertainties can stay on my mind longer than I want.','I notice stress signals in my body early during pressure periods.','After conflict, I may replay the conversation for hours.','Unexpected setbacks can affect my mood for the rest of the day.','I recover quickly and let go after a stressful moment passes.','I remain calm even when plans change suddenly.','Critical feedback rarely lingers in my thoughts.','I stay steady when multiple problems hit at once.']
} as const;
const ocean = (Object.entries(oceanSeeds) as [keyof typeof oceanSeeds, readonly string[]][]).flatMap(([trait, prompts]) =>
  prompts.map((prompt, i) => ({ id:`ocean-${trait === 'conscientiousness' ? 'cons' : trait === 'extraversion' ? 'extra' : trait === 'agreeableness' ? 'agree' : trait === 'neuroticism' ? 'neuro' : 'open'}-${i+1}`, section:'ocean' as const, prompt, options:likert(trait), scoringDomain:trait, scoringDirection:(i >= 4 ? 'reverse':'positive') as 'positive'|'reverse', groupLabel:'Big Five / OCEAN' }))
);

const riasecTriples:[string,[string,string][]][] = [
['Which task would you volunteer for in a community workshop?',[['Set up tools and fix equipment','Realistic'],['Review the data and diagnose causes','Investigative'],['Design the event visuals and theme','Artistic']]],
['In a new project, which part sounds most satisfying?',[['Coach a beginner one-on-one','Social'],['Pitch ideas to sponsors','Enterprising'],['Track budgets and timelines','Conventional']]],
['Which side project would you start first?',[['Restore a bike or device','Realistic'],['Analyze market trends','Investigative'],['Write songs or short scripts','Artistic']]],
['In group work, where do you naturally step in?',[['Support people who feel stuck','Social'],['Coordinate external partners','Enterprising'],['Create clean documentation','Conventional']]],
['Which class would you take by choice?',[['Practical mechanics lab','Realistic'],['Statistics and experiment design','Investigative'],['Creative writing studio','Artistic']]],
['Which volunteer task would you choose?',[['Peer coaching','Social'],['Lead outreach calls','Enterprising'],['Maintain event records','Conventional']]],
['At work, where do you often add value first?',[['Executing concrete tasks quickly','Realistic'],['Finding patterns in complex information','Investigative'],['Generating original concepts','Artistic']]],
['What role do others often ask you to take?',[['Trainer or helper','Social'],['Spokesperson or negotiator','Enterprising'],['Process organizer','Conventional']]],
['Which activity would feel most energizing this weekend?',[['Woodworking or home repairs','Realistic'],['Learning a technical topic deeply','Investigative'],['Photography or illustration','Artistic']]],
['Which environment helps you do your best work?',[['Helping people build confidence','Social'],['Influencing decisions at scale','Enterprising'],['Defined processes and reliable systems','Conventional']]],
['What kind of challenge keeps your attention longest?',[['Operating machinery safely','Realistic'],['Solving analytical puzzles','Investigative'],['Producing expressive work','Artistic']]],
['During conflict, what approach fits you best?',[['Listen and support each side','Social'],['Persuade others toward a direction','Enterprising'],['Structure a workable process','Conventional']]],
['Which contribution would you make in a team event?',[['Set up the physical logistics','Realistic'],['Evaluate what metrics matter','Investigative'],['Shape the visual narrative','Artistic']]],
['Which workstream sounds appealing in a startup?',[['Client support and onboarding','Social'],['Business development','Enterprising'],['Quality checks and compliance','Conventional']]],
['What kind of assignment would you pick first?',[['Repair and optimize a workspace','Realistic'],['Investigate root causes of recurring errors','Investigative'],['Draft a campaign concept and copy','Artistic']]],
['Which impact feels most satisfying by year end?',[['Seeing people grow through your guidance','Social'],['Winning support for a bold initiative','Enterprising'],['Keeping operations accurate and stable','Conventional']]],
['Which task would you choose on a busy day?',[['Build or assemble a practical solution','Realistic'],['Compare evidence before deciding','Investigative'],['Create a compelling presentation','Artistic']]],
['Which responsibility fits your strengths best?',[['Mentor a new teammate','Social'],['Negotiate scope with stakeholders','Enterprising'],['Coordinate schedules and dependencies','Conventional']]],
['Which project phase do you enjoy most?',[['Hands-on implementation','Realistic'],['Testing assumptions and models','Investigative'],['Concept development and design','Artistic']]],
['Which role feels most natural in a cross-functional team?',[['Facilitating communication between people','Social'],['Driving decisions toward outcomes','Enterprising'],['Standardizing workflows and templates','Conventional']]]
];
const riasec = riasecTriples.map(([prompt, labels], i) => ({ id:`riasec-${i+1}`, section:'riasec' as const, prompt, options: labels.map(([label, value])=>({label, value, score:2})), scoringDomain:'riasec', groupLabel:'RIASEC Interests' }));

const mkMS = (id:string, section:Section, prompt:string, options:[string,string,string][]) => ({id, section, prompt, options:options.map(([label,value,score])=>({label,value,score:Number(score)})), scoringDomain:section, groupLabel:'Motivation/Stress/Leadership/Workstyle'});
const mslw = [
  mkMS('mslw-motivation-1','motivation','When a project loses momentum, what helps you re-engage?',[['Reconnect to the purpose and impact','purpose','2'],['Set a measurable short-term target','target','2'],['Ask for external accountability','accountability','2']]),
  mkMS('mslw-motivation-2','motivation','What most consistently drives your effort?',[['Mastering a difficult skill','mastery','2'],['Seeing visible progress each week','progress','2'],['Contributing to people you care about','contribution','2']]),
  mkMS('mslw-motivation-3','motivation','When work feels repetitive, what renews your motivation?',[['Taking on a stretch challenge','challenge','2'],['Connecting tasks to long-term goals','longterm','2'],['Collaborating with people who energize you','collab','2']]),
  mkMS('mslw-motivation-4','motivation','Which reward matters most after finishing hard work?',[['Deeper competence','competence','2'],['Visible outcomes','outcomes','2'],['Positive impact on others','impact','2']]),
  mkMS('mslw-motivation-5','motivation','What keeps you committed during slow progress periods?',[['Daily discipline and routines','discipline','2'],['Tracking small wins','smallwins','2'],['Supportive peer commitments','peercommit','2']]),
  mkMS('mslw-motivation-6','motivation','Before starting a major task, what best boosts your drive?',[['Clarify why it matters','why','2'],['Break it into milestones','milestones','2'],['Coordinate with a partner','partner','2']]),
  mkMS('mslw-motivation-7','motivation','What most increases your ownership of a project?',[['Freedom to shape execution','autonomy','2'],['Clear success criteria','criteria','2'],['Trust from the team','trust','2']]),
  mkMS('mslw-motivation-8','motivation','When priorities shift, what helps you stay engaged?',[['Reframe the challenge as learning','learning','2'],['Reset the plan quickly','replan','2'],['Align expectations with others','align','2']]),
  mkMS('mslw-stress-1','stress','Under heavy pressure, your first stabilizing move is usually…',[['Prioritize tasks by urgency and impact','prioritize','2'],['Take a short reset to lower tension','reset','2'],['Talk through the situation with someone trusted','support','2']]),
  mkMS('mslw-stress-2','stress','When deadlines stack up, you tend to…',[['Trim scope and protect core deliverables','scope','2'],['Work in focused time blocks','focus','2'],['Delegate where possible','delegate','2']]),
  mkMS('mslw-stress-3','stress','When you notice stress building, what do you do first?',[['List controllable next actions','control','2'],['Pause and regulate breathing','breathe','2'],['Ask for perspective early','perspective','2']]),
  mkMS('mslw-stress-4','stress','If a plan suddenly fails, how do you usually respond?',[['Create a practical fallback','fallback','2'],['Take a brief cooldown before acting','cooldown','2'],['Call a quick alignment conversation','quickalign','2']]),
  mkMS('mslw-stress-5','stress','During uncertainty, what helps you stay steady?',[['Focus on immediate priorities','immediate','2'],['Maintain healthy routines','routines','2'],['Lean on trusted collaborators','collaborators','2']]),
  mkMS('mslw-stress-6','stress','After a tense meeting, what is your typical reset?',[['Document decisions and next steps','document','2'],['Take a short walk to decompress','walk','2'],['Debrief with a teammate','debrief','2']]),
  mkMS('mslw-stress-7','stress','When workload peaks, what prevents overload best?',[['Negotiate realistic trade-offs','tradeoffs','2'],['Protect recovery time','recovery','2'],['Redistribute tasks across the team','redistribute','2']]),
  mkMS('mslw-stress-8','stress','When faced with conflicting requests, you usually…',[['Clarify decision criteria','decisioncriteria','2'],['Reduce emotional reactivity first','reactivity','2'],['Escalate for alignment when needed','escalate','2']]),
  mkMS('mslw-leadership-1','leadership','When leading a project kickoff, what do you emphasize first?',[['Clear goals and responsibilities','clarity','2'],['Team trust and psychological safety','safety','2'],['Momentum through early wins','momentum','2']]),
  mkMS('mslw-leadership-2','leadership','When a teammate underperforms, how do you respond?',[['Set concrete expectations and checkpoints','checkpoints','2'],['Explore barriers and support needed','barriers','2'],['Reassign work to protect delivery','protectdelivery','2']]),
  mkMS('mslw-leadership-3','leadership','In decision making, your leadership default is to…',[['Define criteria before debating options','definecriteria','2'],['Invite broad input first','broadinput','2'],['Move quickly once enough signal exists','decisive','2']]),
  mkMS('mslw-leadership-4','leadership','What is most important when giving feedback?',[['Specific behavior and impact','specificity','2'],['Respectful tone and timing','tone','2'],['Actionable next steps','actionable','2']]),
  mkMS('mslw-leadership-5','leadership','When conflicts appear within a team, you usually…',[['Clarify roles and boundaries','roles','2'],['Facilitate mutual understanding','mutual','2'],['Drive a clear resolution quickly','resolution','2']]),
  mkMS('mslw-leadership-6','leadership','How do you build accountability across a team?',[['Set transparent metrics','metrics','2'],['Create shared ownership norms','ownershipnorms','2'],['Review progress on a fixed cadence','cadence','2']]),
  mkMS('mslw-leadership-7','leadership','When mentoring someone, what approach fits you best?',[['Teach frameworks and standards','frameworks','2'],['Coach through questions','coachquestions','2'],['Provide direct stretch opportunities','stretchops','2']]),
  mkMS('mslw-leadership-8','leadership','In cross-functional work, what leadership move helps most?',[['Align priorities and constraints explicitly','alignconstraints','2'],['Build trust between groups','buildtrust','2'],['Secure commitment on deadlines','commitdeadlines','2']]),
  mkMS('mslw-workstyle-1','workstyle','How do you usually begin a complex assignment?',[['Plan the structure before execution','planfirst','2'],['Start a rough draft and iterate','iteratefirst','2'],['Discuss assumptions with collaborators','discussfirst','2']]),
  mkMS('mslw-workstyle-2','workstyle','What workflow produces your best quality?',[['Focused deep-work blocks','deepwork','2'],['Frequent small iterations','smalliterations','2'],['Alternating solo and team sessions','blend','2']]),
  mkMS('mslw-workstyle-3','workstyle','When managing multiple tasks, you prefer to…',[['Sequence work by priority','sequence','2'],['Switch based on energy and context','contextswtch','2'],['Coordinate dependencies continuously','dependencies','2']]),
  mkMS('mslw-workstyle-4','workstyle','For communication, what style fits you best?',[['Concise updates with key decisions','concise','2'],['Context-rich notes with rationale','context','2'],['Interactive check-ins and dialogue','dialogue','2']]),
  mkMS('mslw-workstyle-5','workstyle','When reviewing your own work, what do you focus on first?',[['Accuracy and consistency','accuracy','2'],['Clarity and user experience','uxclarity','2'],['Fit with stakeholder needs','stakeholderfit','2']]),
  mkMS('mslw-workstyle-6','workstyle','In collaboration, which rhythm suits you?',[['Defined agendas and outcomes','agendas','2'],['Flexible brainstorming then convergence','brainstorm','2'],['Frequent async coordination','async','2']]),
  mkMS('mslw-workstyle-7','workstyle','When priorities are unclear, your default is to…',[['Create structure and assumptions','createstructure','2'],['Run a small experiment','experiment','2'],['Seek alignment with decision-makers','seekalignment','2']]),
  mkMS('mslw-workstyle-8','workstyle','What helps you deliver reliably over time?',[['Stable personal systems','systems','2'],['Continuous adaptation','adaptation','2'],['Strong coordination habits','coordination','2']])
];
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
const verbal = [
mkCog('cog-verbal-1','verbal','easy','Map is to route as blueprint is to…',[['Construction plan',2],['Highway',0],['Compass',0],['Blueprint color',0]]),
mkCog('cog-verbal-2','verbal','easy','Cause is to effect as question is to…',[['Silence',0],['A response',2],['Memory',0],['Problem',0]]),
mkCog('cog-verbal-3','verbal','easy','Seed is to tree as idea is to…',[['Outline',0],['Project',2],['Debate',0],['Archive',0]]),
mkCog('cog-verbal-4','verbal','medium','All pilots are trained. Mei is a pilot. Therefore Mei is…',[['Certified',0],['Trained',2],['Retired',0],['Uncertain',0]]),
mkCog('cog-verbal-5','verbal','medium','No silent room has loud music. Room A has loud music. Room A is…',[['Silent',0],['Soundproof',0],['Not silent',2],['Unknown',0]]),
mkCog('cog-verbal-6','verbal','medium','Book is to reading as code is to…',[['Debugging',2],['Printing',0],['Archiving',0],['Licensing',0]]),
mkCog('cog-verbal-7','verbal','medium','If some designers are managers, which must be true?',[['All managers design',0],['Some managers are designers',2],['No designers manage',0],['Only managers design',0]]),
mkCog('cog-verbal-8','verbal','medium','Honest is to trust as accurate is to…',[['Precision',2],['Speed',0],['Novelty',0],['Popularity',0]]),
mkCog('cog-verbal-9','verbal','hard','Clock is to time as compass is to…',[['Distance',0],['Direction',2],['Latitude',0],['Speed',0]]),
mkCog('cog-verbal-10','verbal','hard','If no interns lead projects, and Ana leads a project, Ana is…',[['An intern',0],['Not an intern',2],['A director',0],['Impossible to tell',0]])
];
// numerical/spatial/memory kept meaningful
const numerical = Array.from({length:10}).map((_,i)=>mkCog(`cog-numerical-${i+1}`,'numerical',i<3?'easy':i<8?'medium':'hard',['18 is 30% of what number?','A price rises 20% then falls 20%. Final is…','If 6 people finish work in 8h, 12 people need…','25% of 240 equals…','A number doubles then +6 gives 30. Original?','Ratio 3:5 equals ? : 20','If x + 7 = 19, x = ?','Train speed 60 km/h for 2.5h distance?','Increase 80 to 100 is what percent?','Average of 12, 18, 24 ?'][i],[['40',0],['50',0],['60',2],['70',0],['Higher than start',0],['Lower than start',2],['Exactly unchanged',0],['Cannot be determined',0],['2 hours',0],['4 hours',2],['6 hours',0],['8 hours',0],['50',0],['55',0],['60',2],['65',0],['9',0],['12',2],['15',0],['18',0],['10',0],['12',2],['15',0],['18',0],['10',0],['12',2],['14',0],['16',0],['120 km',0],['140 km',0],['150 km',2],['160 km',0],['20%',0],['25%',2],['30%',0],['40%',0],['16',0],['18',2],['20',0],['22',0]].slice(i*4,i*4+4).map((v)=>[String(v[0]), Number(v[1])] as [string,number])));
const spatial = Array.from({length:8}).map((_,i)=>mkCog(`cog-spatial-${i+1}`,'spatial',i<2?'easy':i<6?'medium':'hard',['Rotate the letter L by 90° clockwise. Base points…','Mirror a right-pointing arrow on vertical line. It points…','On a cube, top is opposite bottom. If top is red, bottom is…','Paper folded once vertically, hole punched near left edge, then unfolded shows…','Facing north, turn right then right. Now facing…','A shape rotated 180° appears…','If east is right on a map, north is…','Mirror the text AB. First visible character is…'][i],[['Right',2],['Left',0],['Up',0],['Down',0],['Left',2],['Right',0],['Up',0],['Down',0],['Opposite the red top face',2],['Adjacent to red',0],['The same as red',0],['Not enough information',0],['Two symmetric holes',2],['One hole',0],['Four holes',0],['No hole',0],['South',2],['East',0],['West',0],['North',0],['Upside-down equivalent',2],['Mirror only',0],['No change',0],['Random distortion',0],['Up',2],['Down',0],['Left',0],['Right',0],['Letter B',2],['Letter A',0],['AB',0],['BA',0]].slice(i*4,i*4+4).map((v)=>[String(v[0]),Number(v[1])] as [string,number])));
// TODO(next-cognitive-pr): Add visual matrix reasoning component with richer rendering.
// TODO(next-cognitive-pr): Add data interpretation questions with charts/tables.
// TODO(next-cognitive-pr): Add memory grid component for non-verbal working memory.
const memory = Array.from({length:10}).map((_,i)=>mkCog(`cog-memory-${i+1}`,'memory',i<3?'easy':i<7?'medium':'hard','Working memory challenge',[['7',0],['T',0],['M',2],['9',0],['3',2],['4',0],['5',0],['6',0],['K',0],['L',2],['M',0],['N',0],['8',0],['1',0],['5',2],['7',0],['Q',2],['R',0],['S',0],['T',0],['Letter B',0],['Letter D',0],['F',2],['H',0],['2',0],['3',2],['4',0],['5',0],['P',0],['M',2],['N',0],['O',0],['9',2],['7',0],['5',0],['3',0],['Letter C',0],['Letter A',2],['Letter B',0],['Letter D',0]].slice(i*4,i*4+4) as [string,number][], {memoryPrompt:['7 - 1 - M - 9 - T','3 - 8 - 4 - A - 5','K - 2 - L - 9 - M','8 - 3 - 1 - 5 - R','Q - 4 - R - 6 - S','B - C - D - F - H','2 - 9 - 3 - P - 4','P - L - M - N - O','9 - 7 - 5 - 3 - 1','C - B - A - D - E'][i], memoryQuestion:['What was the 3rd item?','What was the 1st number?','Which came immediately after 2?','What was the 4th item?','What was the 1st item?','Which letter is in 4th position?','What came right after 9?','Which came immediately after L?','What was the first number?','What was the 3rd item?'][i], revealSeconds:5, recommendedSeconds:25}));

const COGNITIVE_METADATA: Record<CognitiveDomain, Partial<Question>> = {
  pattern: { cognitiveFormat: 'sequence', timed: true, recommendedSeconds: 35 },
  verbal: { cognitiveFormat: 'analogy', timed: true, recommendedSeconds: 40 },
  numerical: { cognitiveFormat: 'data-interpretation', timed: true, recommendedSeconds: 45 },
  spatial: { cognitiveFormat: 'spatial-rotation', timed: true, recommendedSeconds: 50 },
  memory: { cognitiveFormat: 'memory-grid', timed: true, recommendedSeconds: 20 }
};

const withCognitiveMetadata = (q: Question): Question => {
  if (q.section !== 'cognitive' || !q.cognitiveDomain) return q;
  return { ...COGNITIVE_METADATA[q.cognitiveDomain], ...q };
};

export const questions: Question[] = [...mbti, ...ocean, ...riasec, ...mslw, ...pattern, ...verbal, ...numerical, ...spatial, ...memory].map(withCognitiveMetadata);
