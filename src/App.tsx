import { useMemo, useState } from 'react';
import { questions } from './data/questions';
import { scoreAssessment, type Answer } from './engine/scoring';

type Screen = 'landing' | 'start' | 'question' | 'results' | 'report';
const STORAGE_KEY = 'mindflow_answers_v1';

export function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  const current = questions[index];
  const progress = Math.round((index / questions.length) * 100);

  const report = useMemo(() => scoreAssessment(questions, answers), [answers]);

  const choose = (value: string, score: number) => {
    const next = [...answers.filter((a) => a.questionId !== current.id), { questionId: current.id, value, score }];
    setAnswers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (index === questions.length - 1) setScreen('results');
    else setIndex((v) => v + 1);
  };

  return <main className="app">{screen === 'landing' && <section className="card"><h1>Mindflow <span>by Eirene Stack</span></h1><p>A calm self-discovery assessment for your cognitive-style profile, motivation, and career interests.</p><button onClick={() => setScreen('start')}>Begin</button></section>}
  {screen === 'start' && <section className="card"><h2>Assessment Start</h2><p>Estimated time: 6–10 minutes. This report is non-diagnostic and for personal reflection.</p><button onClick={() => { setIndex(0); setScreen('question'); }}>Start Questions</button></section>}
  {screen === 'question' && current && <section className="card"><div className="progress"><div style={{ width: `${progress}%` }} /></div><small>{index + 1} / {questions.length}</small><h3>{current.prompt}</h3><div className="stack">{current.options.map((o) => <button key={o.label} className="option" onClick={() => choose(o.value, o.score)}>{o.label}</button>)}</div></section>}
  {screen === 'results' && <section className="card"><h2>Results Summary</h2><p><b>Personality type estimate:</b> {report.personalityTypeEstimate}</p><p><b>Motivation pattern:</b> {report.motivationPattern}</p><p>{report.cognitiveStyleSummary}</p><button onClick={() => setScreen('report')}>View report preview</button></section>}
  {screen === 'report' && <section className="card"><h2>Self-Discovery Report Preview</h2><ul><li>Big Five: {JSON.stringify(report.bigFiveScores)}</li><li>RIASEC: {JSON.stringify(report.riasecScores)}</li><li>Strengths: {report.strengths.join(', ')}</li><li>Blind spots: {report.blindSpots.join(', ')}</li><li>Growth areas: {report.suggestedGrowthAreas.join(', ')}</li></ul><p className="disclaimer">This is not a clinical, diagnostic, or official IQ assessment.</p><button onClick={() => { localStorage.removeItem(STORAGE_KEY); setAnswers([]); setScreen('landing'); }}>Restart</button></section>}
  </main>;
}
