import { useEffect, useMemo, useState } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { ReportSection } from './components/ReportSection';
import { ScoreBar } from './components/ScoreBar';
import { questions } from './data/questions';
import { buildAssessmentSession, readStoredSessionIds, saveSessionIds, SESSION_IDS_STORAGE_KEY } from './engine/session';
import { scoreAssessment, type Answer } from './engine/scoring';
import { getInitialLanguage, t, type Language, type TranslationKey, LANGUAGE_STORAGE_KEY } from './i18n';
import { localizeQuestion } from './i18n/questions';
import {
  buildReportReflection,
  deriveRiasecMaxScores,
  toSortedScores
} from './utils/formatReport';


type Screen = 'assessment' | 'about' | 'provide';
type AssessmentView = 'landing' | 'start' | 'question' | 'results' | 'report';
type MemoryPhase = 'idle' | 'ready' | 'revealing' | 'answering';
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
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const [memoryPhase, setMemoryPhase] = useState<MemoryPhase>('idle');
  const [memoryCountdown, setMemoryCountdown] = useState(5);
  const [sessionQuestions, setSessionQuestions] = useState(() => buildAssessmentSession(questions, { sessionIds: readStoredSessionIds() }));
  const hasSavedProgress = answers.length > 0 && sessionQuestions.length > 0;
  const tx = (key: TranslationKey) => t(language, key);
  const current = useMemo(() => localizeQuestion(sessionQuestions[index], language), [index, language, sessionQuestions]);
  const isMemoryQuestion = current?.section === 'cognitive' && current.cognitiveDomain === 'memory';
  const progress = Math.round((index / Math.max(1, sessionQuestions.length)) * 100);
  const canAnswerCurrent = !isMemoryQuestion || memoryPhase === 'answering';

  useEffect(() => {
    if (!current) return;
    if (current.section === 'cognitive' && current.cognitiveDomain === 'memory') {
      setMemoryPhase('ready');
      setMemoryCountdown(current.revealSeconds ?? 5);
      return;
    }
    setMemoryPhase('idle');
  }, [current?.id]);

  useEffect(() => {
    if (!current || !isMemoryQuestion || memoryPhase !== 'revealing') return;
    const interval = window.setInterval(() => {
      setMemoryCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setMemoryPhase('answering');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [current, isMemoryQuestion, memoryPhase]);

  const report = useMemo(() => scoreAssessment(sessionQuestions, answers), [answers, sessionQuestions]);
  const bigFiveScores = useMemo(() => toSortedScores(report.bigFiveScores), [report]);
  const riasecScores = useMemo(() => toSortedScores(report.riasecScores), [report]);
  const riasecMaxScores = useMemo(() => deriveRiasecMaxScores(sessionQuestions), [sessionQuestions]);

  const choose = (value: string, score: number) => {
    if (!current) return;
    const next = [...answers.filter((a) => a.questionId !== current.id), { questionId: current.id, value, score }];
    setAnswers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (index === sessionQuestions.length - 1) setAssessmentView('results');
    else setIndex((v) => v + 1);
  };

  const startFreshAssessment = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers([]);
    localStorage.removeItem(SESSION_IDS_STORAGE_KEY);
    const fresh = buildAssessmentSession(questions);
    setSessionQuestions(fresh);
    saveSessionIds(fresh);
    setIndex(0);
    setAssessmentView('question');
  };

  const resumeAssessment = () => {
    if (answers.length >= sessionQuestions.length) return setAssessmentView('results');
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
  const goToPreviousQuestion = () => {
    if (index <= 0) return;
    setIndex((v) => Math.max(0, v - 1));
  };
  const startMemoryReveal = () => {
    if (!current || !isMemoryQuestion) return;
    setMemoryCountdown(current.revealSeconds ?? 5);
    setMemoryPhase('revealing');
  };


  useEffect(() => {
    if (sessionQuestions.length > 0) saveSessionIds(sessionQuestions);
  }, [sessionQuestions]);
  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const isQuestionFlow = screen === 'assessment' && assessmentView === 'question';

  return (
    <main className={`app ${isQuestionFlow ? 'assessment-shell' : ''}`.trim()}>
      <nav className={`top-nav no-print ${isQuestionFlow ? 'top-nav--compact' : ''}`}>
        {isQuestionFlow ? (
          <>
            <strong className="brand">{tx('navBrand')}</strong>
            <LanguageSelector
              compact
              language={language}
              onLanguageChange={setLanguage}
              label={tx('langLabel')}
              englishLabel={tx('langEnglish')}
              chineseLabel={tx('langChinese')}
              malayLabel={tx('langMalay')}
            />
            <button className="link-btn" onClick={() => setScreen('about')}>{tx('navAbout')}</button>
            <button className="link-btn" onClick={() => setScreen('provide')}>{tx('navProvide')}</button>
            <button className="link-btn" onClick={saveAndContinueLater}>{tx('navSaveExit')}</button>
          </>
        ) : (
          <>
            <button className="option" onClick={() => setScreen('assessment')}>
              {tx('navAssessment')}
            </button>
            <button className="option" onClick={() => setScreen('about')}>
              {tx('navAboutMindflow')}
            </button>
            <button className="option" onClick={() => setScreen('provide')}>
              {tx('navProvide')}
            </button>
            <LanguageSelector
              language={language}
              onLanguageChange={setLanguage}
              label={tx('langLabel')}
              englishLabel={tx('langEnglish')}
              chineseLabel={tx('langChinese')}
              malayLabel={tx('langMalay')}
            />
          </>
        )}
      </nav>

      {screen === 'assessment' && assessmentView === 'landing' && (
        <section className="card">
          <h1>{tx('landingTitle')} <span>{tx('landingByline')}</span></h1>
          <p>{tx('landingDesc')}</p>
          <button onClick={() => setAssessmentView('start')}>{tx('begin')}</button>
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'start' && (
        <section className="card">
          <h2>{tx('startTitle')}</h2>
          <p>{tx('sessionCountNotice')}</p>
          <p>{tx('sessionOrderNotice')}</p>
          <p>{tx('sessionSaveNotice')}</p>
          <p className="disclaimer">{tx('localSaveNotice')}</p>
          <div className="stack">
            <button onClick={startFreshAssessment}>{tx('startQuestions')}</button>
            <button className="option" onClick={resumeAssessment} disabled={!hasSavedProgress}>
              {tx('resumeSaved')}
            </button>
          </div>
          {!hasSavedProgress && <p className="disclaimer">{tx('noSaved')}</p>}
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'question' && current && (
        <section className="card question-card" aria-live="polite">
          <div
            className="progress"
            role="progressbar"
            aria-label={tx('progressAria')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
          <small>{index + 1} / {sessionQuestions.length}</small>
          {isMemoryQuestion && memoryPhase === 'ready' ? (
            <>
              <h3>{tx('memoryTitle')}</h3>
              <p>{tx('memoryIntro')}</p>
              <button onClick={startMemoryReveal}>{tx('memoryReady')}</button>
            </>
          ) : isMemoryQuestion && memoryPhase === 'revealing' ? (
            <>
              <h3>{current.memoryPrompt}</h3>
              <p><strong>{tx('memorizeThis')}: {memoryCountdown}</strong></p>
            </>
          ) : (
            <>
              <h3>{isMemoryQuestion ? current.memoryQuestion : current.prompt}</h3>
              <div className="stack">
                {canAnswerCurrent && current.options.map((o) => (
                  <button key={o.label} className="option" onClick={() => choose(o.value, o.score)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {current.hint && memoryPhase !== 'revealing' && (
            <details className="hint">
              <summary>{tx('needHelp')}</summary>
              <p>{current.hint}</p>
            </details>
          )}
          {index > 0 && <button className="secondary-action" onClick={goToPreviousQuestion}>{tx('backPrev')}</button>}
          <button className="secondary-action" onClick={saveAndContinueLater}>{tx('navSaveExit')}</button>
          <p className="disclaimer">{tx('localSaveNotice')}</p>
          {current.section === 'cognitive' && <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>}
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'results' && (
        <section className="card">
          <h2>{tx('resultsTitle')}</h2>
          <p><b>{tx('personalityEstimate')}</b> {report.personalityTypeEstimate}</p>
          <p><b>{tx('motivationPattern')}</b> {report.motivationPattern}</p>
          <p>{report.cognitiveStyleSummary}</p>
          <button onClick={() => setAssessmentView('report')}>{tx('viewReport')}</button>
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'report' && (
        <section className="card report-card print-report">
          <h2>{tx('reportPreview')}</h2>
          <p className="disclaimer">{buildReportReflection(report)}</p>
          <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>
          <div className="no-print">
            <button onClick={() => window.print()}>{tx('printPdf')}</button>
          </div>
          <ReportSection title={tx('personalitySection')}>
            <p>
              Your estimated personality type signal is <strong>{report.personalityTypeEstimate}</strong>.
            </p>
          </ReportSection>
          <ReportSection title="Big Five / OCEAN">
            <p className="disclaimer">These scores are normalized reflection signals based on your responses, not clinical measurements.</p>
            <div className="score-grid">
              {bigFiveScores.map((item) => (
                <ScoreBar
                  key={item.key}
                  label={`${item.label} — ${report.bigFiveSignalStrength[item.key] ?? 'Low signal'}`}
                  score={report.bigFiveNormalizedScores[item.key] ?? 0}
                  max={100}
                  hint="Interpret this as a reflection signal, not a fixed identity."
                />
              ))}
            </div>
          </ReportSection>
          <ReportSection title={tx('riasecSection')}>
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
          <ReportSection title={tx('motivationSection')}>
            <p>{report.motivationPattern} {tx('motivationSuffix')}</p>
          </ReportSection>
          <ReportSection title={tx('stressSection')}>
            <p>{tx('stressLabel')} <strong>{report.stressPattern}</strong>.</p>
          </ReportSection>
          <ReportSection title={tx('leadershipSection')}>
            <p>{tx('leadershipLabel')} <strong>{report.leadershipPattern}</strong>.</p>
          </ReportSection>
          <ReportSection title={tx('workstyleSection')}>
            <p>{tx('workstyleLabel')} <strong>{report.workstylePattern}</strong>.</p>
          </ReportSection>
          <ReportSection title={tx('cognitiveSection')}>
            <p>{report.cognitiveStyleSummary}</p>
            <p className="disclaimer">{tx('cognitiveUnknownNotice')}</p>
            <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>
          </ReportSection>
          <ReportSection title={tx('strengthsSection')}>
            <ul>{report.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <ReportSection title={tx('blindSpotsSection')}>
            <ul>{report.blindSpots.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <ReportSection title={tx('growthAreasSection')}>
            <ul>{report.suggestedGrowthAreas.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>
          <button className="no-print" onClick={restartToLanding}>{tx('restart')}</button>
        </section>
      )}

      {screen === 'about' && (
        <section className="card">
          <h2>{tx('navAboutMindflow')}</h2>
          <p>MindFlow by Eirene Stack is built for self-discovery, reflection, career direction, and cognitive-style awareness.</p>
          <p className="disclaimer">MindFlow is non-diagnostic and does not provide clinical accuracy, official IQ claims, or psychological diagnosis.</p>
          <p className="disclaimer">Local-first privacy note: this MVP stores responses locally in your browser only.</p>
          <p className="disclaimer">{tx('translationNotice')}</p>
        </section>
      )}

      {screen === 'provide' && (
        <section className="card">
          <h2>{tx('navProvide')}</h2>
          <ul>
            <li>Self-discovery assessment</li><li>Personality and trait reflection</li><li>Career-interest signals</li><li>Motivation patterns</li><li>Cognitive-style prompts</li><li>Printable report</li><li>Future: saved profiles, shareable reports, deeper analytics</li>
          </ul>
        </section>
      )}
    </main>
  );
}
