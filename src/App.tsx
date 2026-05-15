import { useMemo, useState } from 'react';
import { ReportSection } from './components/ReportSection';
import { ScoreBar } from './components/ScoreBar';
import { questions } from './data/questions';
import { scoreAssessment, type Answer } from './engine/scoring';
import {
  BIG_FIVE_MAX_SCORES,
  buildReportReflection,
  deriveRiasecMaxScores,
  toSortedScores
} from './utils/formatReport';

const NON_DIAGNOSTIC_NOTICE = 'This experience is designed for self-discovery and reflection only. It is not a clinical, medical, diagnostic, or official IQ assessment.';
const LOCAL_SAVE_NOTICE = 'Progress is saved locally on this device/browser.';
const COGNITIVE_UNKNOWN_NOTICE = "Using 'I don’t know' is treated as an unanswered reasoning signal, not a penalty.";

type Screen = 'assessment' | 'about' | 'provide';
type AssessmentView = 'landing' | 'start' | 'question' | 'results' | 'report';
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
  const [screen, setScreen] = useState<Screen>('assessment');
  const [assessmentView, setAssessmentView] = useState<AssessmentView>('landing');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => parseStoredAnswers(localStorage.getItem(STORAGE_KEY)));
  const hasSavedProgress = answers.length > 0;
  const current = questions[index];
  const progress = Math.round((index / questions.length) * 100);

  const report = useMemo(() => scoreAssessment(questions, answers), [answers]);
  const bigFiveScores = useMemo(() => toSortedScores(report.bigFiveScores), [report]);
  const riasecScores = useMemo(() => toSortedScores(report.riasecScores), [report]);
  const riasecMaxScores = useMemo(() => deriveRiasecMaxScores(questions), []);

  const choose = (value: string, score: number) => {
    if (!current) return;
    const next = [...answers.filter((a) => a.questionId !== current.id), { questionId: current.id, value, score }];
    setAnswers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (index === questions.length - 1) setAssessmentView('results');
    else setIndex((v) => v + 1);
  };

  const startFreshAssessment = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers([]);
    setIndex(0);
    setAssessmentView('question');
  };

  const resumeAssessment = () => {
    if (answers.length >= questions.length) return setAssessmentView('results');
    setIndex(answers.length);
    setAssessmentView('question');
  };

  const restartToLanding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers([]);
    setIndex(0);
    setAssessmentView('landing');
  };

  const saveAndContinueLater = () => {
    setScreen('assessment');
    setAssessmentView('landing');
  };

  const isQuestionFlow = screen === 'assessment' && assessmentView === 'question';

  return (
    <main className={`app ${isQuestionFlow ? 'assessment-shell' : ''}`.trim()}>
      <nav className={`top-nav no-print ${isQuestionFlow ? 'top-nav--compact' : ''}`}>
        {isQuestionFlow ? (
          <>
            <strong className="brand">MindFlow</strong>
            <button className="link-btn" onClick={() => setScreen('about')}>About</button>
            <button className="link-btn" onClick={() => setScreen('provide')}>What We Provide</button>
            <button className="link-btn" onClick={saveAndContinueLater}>Save & Exit</button>
          </>
        ) : (
          <>
            <button className="option" onClick={() => setScreen('assessment')}>
              Assessment
            </button>
            <button className="option" onClick={() => setScreen('about')}>
              About MindFlow
            </button>
            <button className="option" onClick={() => setScreen('provide')}>
              What We Provide
            </button>
          </>
        )}
      </nav>

      {screen === 'assessment' && assessmentView === 'landing' && (
        <section className="card">
          <h1>Mindflow <span>by Eirene Stack</span></h1>
          <p>A self-discovery assessment for reflection profile signals, estimated traits, career direction, and cognitive-style awareness.</p>
          <button onClick={() => setAssessmentView('start')}>Begin</button>
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'start' && (
        <section className="card">
          <h2>Assessment Start</h2>
          <p>Estimated time: 12–18 minutes. This report is non-diagnostic and intended for reflection only.</p>
          <p className="disclaimer">{LOCAL_SAVE_NOTICE}</p>
          <div className="stack">
            <button onClick={startFreshAssessment}>Start Questions</button>
            <button className="option" onClick={resumeAssessment} disabled={!hasSavedProgress}>
              Resume saved progress
            </button>
          </div>
          {!hasSavedProgress && <p className="disclaimer">No saved responses found yet. Start a new assessment to begin.</p>}
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'question' && current && (
        <section className="card question-card" aria-live="polite">
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
          <small>{index + 1} / {questions.length}</small>
          <h3>{current.prompt}</h3>
          <div className="stack">
            {current.options.map((o) => (
              <button key={o.label} className="option" onClick={() => choose(o.value, o.score)}>
                {o.label}
              </button>
            ))}
          </div>
          {current.hint && (
            <details className="hint">
              <summary>Need help understanding the question?</summary>
              <p>{current.hint}</p>
            </details>
          )}
          <p className="disclaimer">{LOCAL_SAVE_NOTICE}</p>
          <button className="secondary-action" onClick={saveAndContinueLater}>Save & Exit</button>
          {current.section === 'cognitive' && <p className="disclaimer">{NON_DIAGNOSTIC_NOTICE}</p>}
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'results' && (
        <section className="card">
          <h2>Results Summary</h2>
          <p><b>Personality type estimate:</b> {report.personalityTypeEstimate}</p>
          <p><b>Motivation pattern:</b> {report.motivationPattern}</p>
          <p>{report.cognitiveStyleSummary}</p>
          <button onClick={() => setAssessmentView('report')}>View report preview</button>
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'report' && (
        <section className="card report-card print-report">
          <h2>Self-Discovery Report Preview</h2>
          <p className="disclaimer">{buildReportReflection(report)}</p>
          <p className="disclaimer">{NON_DIAGNOSTIC_NOTICE}</p>
          <div className="no-print">
            <button onClick={() => window.print()}>Print or Save as PDF</button>
          </div>
          <ReportSection title="Personality Type Estimate">
            <p>
              Your estimated personality type signal is <strong>{report.personalityTypeEstimate}</strong>.
            </p>
          </ReportSection>
          <ReportSection title="Big Five / OCEAN">
            <div className="score-grid">
              {bigFiveScores.map((item) => (
                <ScoreBar
                  key={item.key}
                  label={item.label}
                  score={item.score}
                  max={BIG_FIVE_MAX_SCORES[item.key]}
                />
              ))}
            </div>
          </ReportSection>
          <ReportSection title="RIASEC Career Interests">
            <div className="score-grid">
              {riasecScores.map((item) => (
                <ScoreBar
                  key={item.key}
                  label={item.label}
                  score={item.score}
                  max={riasecMaxScores[item.key]}
                />
              ))}
            </div>
          </ReportSection>
          <ReportSection title="Motivation Pattern">
            <p>{report.motivationPattern} is your strongest estimated reflection signal right now.</p>
          </ReportSection>
          <ReportSection title="Cognitive-Style Summary">
            <p>{report.cognitiveStyleSummary}</p>
            <p className="disclaimer">{COGNITIVE_UNKNOWN_NOTICE}</p>
            <p className="disclaimer">{NON_DIAGNOSTIC_NOTICE}</p>
          </ReportSection>
          <ReportSection title="Strengths">
            <ul>{report.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <ReportSection title="Blind Spots">
            <ul>{report.blindSpots.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <ReportSection title="Growth Areas">
            <ul>{report.suggestedGrowthAreas.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <p className="disclaimer">{NON_DIAGNOSTIC_NOTICE}</p>
          <button className="no-print" onClick={restartToLanding}>Restart</button>
        </section>
      )}

      {screen === 'about' && (
        <section className="card">
          <h2>About MindFlow</h2>
          <p>MindFlow by Eirene Stack is built for self-discovery, reflection, career direction, and cognitive-style awareness.</p>
          <p className="disclaimer">MindFlow is non-diagnostic and does not provide clinical accuracy, official IQ claims, or psychological diagnosis.</p>
          <p className="disclaimer">Local-first privacy note: this MVP stores responses locally in your browser only.</p>
        </section>
      )}

      {screen === 'provide' && (
        <section className="card">
          <h2>What We Provide</h2>
          <ul>
            <li>Self-discovery assessment</li><li>Personality and trait reflection</li><li>Career-interest signals</li><li>Motivation patterns</li><li>Cognitive-style prompts</li><li>Printable report</li><li>Future: saved profiles, shareable reports, deeper analytics</li>
          </ul>
        </section>
      )}
    </main>
  );
}
