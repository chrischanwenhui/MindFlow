export type Section = 'mbti' | 'ocean' | 'riasec' | 'motivation' | 'stress' | 'leadership' | 'workstyle' | 'cognitive';
export type CognitiveDomain = 'pattern' | 'verbal' | 'numerical' | 'spatial' | 'memory';
export type CognitiveDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionOption = { label: string; value: string; score: number };

export type Question = {
  id: string;
  section: Section;
  prompt: string;
  options: QuestionOption[];
  hint?: string;
  cognitiveDomain?: CognitiveDomain;
  difficulty?: CognitiveDifficulty;
  groupLabel?: string;
  scoringDomain?: string;
};

const likert = (value: string): QuestionOption[] => [
  { label: 'Strongly disagree', value, score: 1 },
  { label: 'Disagree', value, score: 2 },
  { label: 'Neutral', value, score: 3 },
  { label: 'Agree', value, score: 4 },
  { label: 'Strongly agree', value, score: 5 }
];

const STRESS_HINT = 'Choose what is most typical under real pressure, not what sounds ideal.';
const COGNITIVE_HINTS = {
  pattern: 'Track the step-by-step rule and test it against all terms.',
  verbal: 'Focus on meaning and logic, not only keyword similarity.',
  numerical: 'Translate the wording into numbers before comparing choices.',
  spatial: 'Mentally rotate, reflect, or fold while preserving relative positions.',
  memory: 'Keep order stable first, then retrieve by position.'
} as const;
const cognitiveUnknownOption = (domain: CognitiveDomain): QuestionOption => ({ label: "I don't know", value: `${domain}-unknown`, score: 0 });
const c = (q: Question): Question => ({ ...q, groupLabel: q.groupLabel ?? q.section.toUpperCase(), scoringDomain: q.scoringDomain ?? q.section });

export const questions: Question[] = [
  ...[
    ['mbti-ei-1','After a demanding week, you usually recharge by…','Quiet reset and reflection','I','Social plans and conversation','E'],
    ['mbti-ei-2','In meetings with unfamiliar people, you usually…','Listen first and map the room','I','Think aloud and shape momentum','E'],
    ['mbti-ei-3','When solving problems with peers, you prefer to…','Prepare independently first','I','Work through options together','E'],
    ['mbti-sn-1','When starting a complex project, you first seek…','Concrete facts and proven methods','S','Emerging patterns and possibilities','N'],
    ['mbti-sn-2','When learning a new system, you prefer…','Step-by-step workflow examples','S','A model of the whole system','N'],
    ['mbti-sn-3','In ambiguous situations, your instinct is to trust…','Observed evidence','S','Inferred direction','N'],
    ['mbti-tf-1','In difficult decisions, your first anchor is…','Logic and consistency','T','Human impact and context','F'],
    ['mbti-tf-2','When giving feedback, you prioritize…','Precision and candor','T','Timing and encouragement','F'],
    ['mbti-tf-3','In conflict, you tend to resolve by…','Defining criteria and trade-offs','T','Restoring understanding first','F'],
    ['mbti-jp-1','Your preferred workflow is usually…','Structured milestones','J','Adaptive checkpoints','P'],
    ['mbti-jp-2','Before important deadlines, you tend to…','Lock the plan early','J','Keep options open longer','P'],
    ['mbti-jp-3','Calendar changes usually make you feel…','More focused with firm commitments','J','More creative with flexible space','P']
  ].map(([id,p,a,av,b,bv]) => c({id: id as string, section:'mbti', groupLabel:'MBTI Preference', scoringDomain:(id as string).split('-')[1], prompt:p as string, options:[{label:a as string,value:av as string,score:2},{label:b as string,value:bv as string,score:2}]})),

  ...[
    ['ocean-open-1','I intentionally explore ideas that challenge my assumptions.','open'],['ocean-open-2','I enjoy trying unfamiliar methods when improving a workflow.','open'],['ocean-open-3','I look for broader connections across different fields.','open'],['ocean-open-4','I prefer variety over repeating the same approach every week.','open'],
    ['ocean-cons-1','I deliver commitments even when supervision is low.','conscientiousness'],['ocean-cons-2','I break large goals into trackable actions.','conscientiousness'],['ocean-cons-3','I protect focus by limiting avoidable context switching.','conscientiousness'],['ocean-cons-4','I usually close loose ends before moving on.','conscientiousness'],
    ['ocean-extra-1','I gain energy from active collaboration.','extraversion'],['ocean-extra-2','I am comfortable initiating conversations in new groups.','extraversion'],['ocean-extra-3','I naturally become more expressive in team settings.','extraversion'],['ocean-extra-4','I often prefer discussing ideas live rather than asynchronously.','extraversion'],
    ['ocean-agree-1','I look for solutions where all parties can keep dignity.','agreeableness'],['ocean-agree-2','I make room for others before pushing my own view.','agreeableness'],['ocean-agree-3','I can challenge ideas without escalating tension.','agreeableness'],['ocean-agree-4','I am patient with different working paces.','agreeableness'],
    ['ocean-neuro-1','Uncertainty can affect my focus more than I want.','neuroticism'],['ocean-neuro-2','I replay unresolved issues after work hours.','neuroticism']
  ].map(([id,p,v]) => c({id:id as string, section:'ocean', groupLabel:'Big Five / OCEAN', scoringDomain:v as string, prompt:p as string, options:likert(v as string)})),

  ...[
    ['riasec-1','Which task feels most energizing?',[['Build or repair a practical system','Realistic'],['Investigate root causes in a complex issue','Investigative'],['Design an original concept or experience','Artistic']]],
    ['riasec-2','Which role feels most natural?',[['Coach and support people','Social'],['Lead strategy and influence outcomes','Enterprising'],['Organize systems and details','Conventional']]],
    ['riasec-3','Which outcome feels most satisfying?',[['A reliable process that works daily','Conventional'],['A persuasive launch with buy-in','Enterprising'],['A meaningful one-to-one impact','Social']]],
    ['riasec-4','In a new assignment, where do you add value fastest?',[['Hands-on execution','Realistic'],['Hypothesis-driven analysis','Investigative'],['Concept storytelling','Artistic']]],
    ['riasec-5','Which environment fits you best?',[['Field/operations heavy','Realistic'],['Research and data heavy','Investigative'],['Creative studio or design heavy','Artistic']]],
    ['riasec-6','When teams stall, you naturally…',[['Clarify process and ownership','Conventional'],['Mobilize people and decisions','Enterprising'],['Support morale and alignment','Social']]],
    ['riasec-7','What type of accomplishment is most meaningful?',[['A durable tool people use','Realistic'],['A new insight people trust','Investigative'],['A resonant message people remember','Artistic']]],
    ['riasec-8','You are most likely to volunteer for…',[['Process cleanup and documentation','Conventional'],['Pitching and stakeholder influence','Enterprising'],['Mentoring and team support','Social']]],
    ['riasec-9','Which challenge sounds most attractive?',[['Improve equipment reliability','Realistic'],['Model uncertain outcomes','Investigative'],['Create brand voice from scratch','Artistic']]],
    ['riasec-10','Which weekly rhythm sounds best?',[['Build-fix-test cycles','Realistic'],['Question-analyze-validate cycles','Investigative'],['Draft-review-iterate creative cycles','Artistic']]]
  ].map(([id,p,opts]) => c({id:id as string, section:'riasec', groupLabel:'RIASEC Interests', scoringDomain:'riasec', prompt:p as string, options:(opts as string[][]).map(([label,value]) => ({label,value,score:2}))})),

  ...[
    ['motivation-1','What most sustains your effort over time?',[['Stability and predictability','Security-Seeking'],['Challenge and measurable progress','Achievement-Driven'],['Autonomy in decisions','Autonomy-Protective']]],
    ['motivation-2','When a plan slips, your first impulse is to…',[['Reduce risk and stabilize','Security-Seeking'],['Push for a stronger target','Achievement-Driven'],['Redesign independently','Autonomy-Protective']]],
    ['motivation-3','Recognition matters most when it reflects…',[['Reliability and trust','Security-Seeking'],['Results and growth','Achievement-Driven'],['Original thinking','Autonomy-Protective']]],
    ['stress-1','When overwhelmed, I most commonly…',[['Withdraw to reset','Reset-Oriented'],['Over-plan details','Control-Oriented'],['Seek reassurance and alignment','Support-Oriented'],['Become reactive and impatient','Urgency-Oriented']]],
    ['stress-2','Under pressure, I worry most about…',[['Losing control of outcomes','Control-Oriented'],['Missing expectations','Achievement-Driven'],['Losing support','Support-Oriented'],['Being misunderstood','Reset-Oriented']]],
    ['stress-3','My recovery improves fastest when I…',[['Create distance and quiet','Reset-Oriented'],['Rebuild structure quickly','Control-Oriented'],['Talk through priorities with someone','Support-Oriented'],['Take immediate action on one lever','Urgency-Oriented']]],
    ['leadership-1','In group discussions, I usually…',[['Set direction quickly','Directive'],['Observe then frame insights','Analytical'],['Protect alignment and trust','Facilitative'],['Challenge weak assumptions','Challenger']]],
    ['leadership-2','Which role feels most natural?',[['Strategist','Directive'],['Operator','Analytical'],['Connector','Facilitative'],['Specialist critic','Challenger']]],
    ['leadership-3','When decisions are delayed, I tend to…',[['Narrow options and call a choice','Directive'],['Ask for clearer evidence','Analytical'],['Surface concerns and align stakeholders','Facilitative'],['Stress-test the proposal','Challenger']]],
    ['workstyle-1','When learning a new platform, I prefer to…',[['Experiment immediately','Explorer'],['Read documentation first','Planner'],['Watch a walkthrough','Observer'],['Map architecture first','Architect']]],
    ['workstyle-2','Which feels more satisfying?',[['Improve an existing system','Optimizer'],['Create a new concept','Builder']]],
    ['workstyle-3','In a fast-moving week, I stay effective by…',[['Trying quick prototypes','Explorer'],['Time-blocking priorities','Planner'],['Reviewing examples before execution','Observer'],['Designing dependencies up front','Architect']]]
  ].map(([id,p,opts]) => c({id:id as string, section:(id as string).split('-')[0] as Section, groupLabel:'Motivation/Stress/Leadership/Workstyle', scoringDomain:(id as string).split('-')[0], hint:(id as string).startsWith('stress-')?STRESS_HINT:undefined, prompt:p as string, options:(opts as string[][]).map(([label,value]) => ({label,value,score:2}))})),

  ...[
    ['pattern',1,'easy','Pattern reasoning: 5, 8, 11, 14, ?', [['16',0],['17',2],['18',0],['20',0]]],
    ['pattern',2,'medium','Pattern reasoning: 2, 6, 12, 20, 30, ?', [['36',0],['40',0],['42',2],['48',0]]],
    ['pattern',3,'hard','Pattern reasoning: 4, 7, 13, 25, 49, ?', [['73',0],['81',0],['97',2],['99',0]]],
    ['verbal',1,'easy','Verbal reasoning: Blueprint is to building as recipe is to…', [['Kitchen',0],['Meal',2],['Plate',0],['Chef',0]]],
    ['verbal',2,'medium','Verbal reasoning: All analysts write reports. Some managers are analysts. Which follows?', [['All managers write reports',0],['Some managers write reports',2],['No analysts are managers',0],['Reports are managers',0]]],
    ['verbal',3,'hard','Verbal reasoning: If no remote teams meet daily, and Team Z meets daily, Team Z is…', [['A remote team',0],['Not a remote team',2],['Partly remote',0],['Impossible to tell',0]]],
    ['numerical',1,'easy','Numerical reasoning: 15% of 200 equals…', [['20',0],['25',0],['30',2],['35',0]]],
    ['numerical',2,'medium','Numerical reasoning: A task takes 10h for 3 people at equal rate. 6 people need…', [['3h',0],['4h',0],['5h',2],['6h',0]]],
    ['numerical',3,'hard','Numerical reasoning: Revenue grows from 80 to 100, then to 115. Total % growth from 80 is…', [['35%',0],['40%',0],['43.75%',2],['47.5%',0]]],
    ['spatial',1,'easy','Spatial reasoning: Rotate letter “L” by 90° clockwise. It points…', [['Up-left',0],['Up-right',2],['Down-left',0],['Down-right',0]]],
    ['spatial',2,'medium','Spatial reasoning: A cube has opposite faces paired. If top is blue and bottom is green, they are…', [['Adjacent',0],['Opposite',2],['Same face',0],['Unknown by definition',0]]],
    ['spatial',3,'hard','Spatial reasoning: A paper arrow pointing right is reflected in a vertical mirror. It points…', [['Right',0],['Left',2],['Up',0],['Down',0]]],
    ['memory',1,'easy','Working memory: Remember 7 - 1 - 4 - 9 - 2. What is the 2nd number?', [['1',2],['4',0],['7',0],['9',0]]],
    ['memory',2,'medium','Working memory: Remember P - 3 - T - 8 - M - 6. Which came immediately after T?', [['8',2],['M',0],['3',0],['6',0]]],
    ['memory',3,'hard','Working memory: Remember D - 5 - K - 1 - R - 9 - B. Which is 6th?', [['R',0],['9',2],['1',0],['B',0]]]
  ].map(([d,n,diff,p,opts]) => c({id:`cog-${d}-${n}`, section:'cognitive', groupLabel:'Cognitive Style', scoringDomain:d as string, cognitiveDomain:d as CognitiveDomain, difficulty:diff as CognitiveDifficulty, hint:COGNITIVE_HINTS[d as CognitiveDomain], prompt:p as string, options:[...(opts as (string|number)[][]).map(([label,score])=>({label:label as string,value:d as string,score:score as number})), cognitiveUnknownOption(d as CognitiveDomain)]}))
];
