import { useMemo, useState } from 'react';
import { questions } from './data/questions';
import { scoreAssessment, type Answer } from './engine/scoring';

type Screen = 'landing' | 'start' | 'question' | 'results' | 'report';
const STORAGE_KEY = 'mindflow_answers_v1';

function parseStoredAnswers(raw: string | null): Answer[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is Answer => {
      if (typeof item !== 'object' || item === null) return false;
      const record = item as Record<string, unknown>;
      return typeof record.questionId === 'string' && typeof record.value === 'string' && typeof record.score === 'number';
    });
  } catch {
    return [];
  }
}

export function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => parseStoredAnswers(localStorage.getItem(STORAGE_KEY)));
  const hasSavedProgress = answers.length > 0;
  const current = questions[index];
  const progress = Math.round((index / questions.length) * 100);

  const report = useMemo(() => scoreAssessment(questions, answers), [answers]);

  const choose = (value: string, score: number) => {
    if (!current) return;

    const next = [...answers.filter((a) => a.questionId !== current.id), { questionId: current.id, value, score }];
    setAnswers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (index === questions.length - 1) setScreen('results');
    else setIndex((v) => v + 1);
  };

  const startFreshAssessment = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers([]);
    setIndex(0);
    setScreen('question');
  };

  const resumeAssessment = () => {
    if (answers.length >= questions.length) {
      setScreen('results');
      return;
    }

    setIndex(answers.length);
    setScreen('question');
  };

  const restartToLanding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers([]);
    setIndex(0);
    setScreen('landing');
  };

  return (
    <main className="app">
      {screen === 'landing' && (
        <section className="card">
          <h1>
            Mindflow <span>by Eirene Stack</span>
          </h1>
          <p>A calm self-discovery assessment for your cognitive-style profile, motivation, and career interests.</p>
          <button onClick={() => setScreen('start')}>Begin</button>
        </section>
      )}

      {screen === 'start' && (
        <section className="card">
          <h2>Assessment Start</h2>
          <p>Estimated time: 6–10 minutes. This report is non-diagnostic and for personal reflection.</p>
          <div className="stack">
            <button onClick={startFreshAssessment}>Start Questions</button>
            <button className="option" onClick={resumeAssessment} disabled={!hasSavedProgress}>
              Resume saved progress
            </button>
          </div>
          {!hasSavedProgress && <p className="disclaimer">No saved responses found yet. Start a new assessment to begin.</p>}
        </section>
      )}

      {screen === 'question' && current && (
        <section className="card" aria-live="polite">
          <div
            className="progress"
            role="progressbar"
            aria-label="Assessment progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
          <small>
            {index + 1} / {questions.length}
          </small>
          <h3>{current.prompt}</h3>
          <div className="stack">
            {current.options.map((o) => (
              <button key={o.label} className="option" onClick={() => choose(o.value, o.score)}>
                {o.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {screen === 'results' && (
        <section className="card">
          <h2>Results Summary</h2>
          <p>
            <b>Personality type estimate:</b> {report.personalityTypeEstimate}
          </p>
          <p>
            <b>Motivation pattern:</b> {report.motivationPattern}
          </p>
          <p>{report.cognitiveStyleSummary}</p>
          <button onClick={() => setScreen('report')}>View report preview</button>
        </section>
      )}

      {screen === 'report' && (
        <section className="card">
          <h2>Self-Discovery Report Preview</h2>
          <ul>
            <li>Big Five: {JSON.stringify(report.bigFiveScores)}</li>
            <li>RIASEC: {JSON.stringify(report.riasecScores)}</li>
            <li>Strengths: {report.strengths.join(', ')}</li>
            <li>Blind spots: {report.blindSpots.join(', ')}</li>
            <li>Growth areas: {report.suggestedGrowthAreas.join(', ')}</li>
          </ul>
          <p className="disclaimer">This is not a clinical, diagnostic, or official IQ assessment.</p>
          <button onClick={restartToLanding}>Restart</button>
        </section>
      )}
    </main>
  );
}
