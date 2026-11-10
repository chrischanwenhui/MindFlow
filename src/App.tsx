import { useEffect, useMemo, useState } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { MbtiFluiditySpectrum } from './components/MbtiFluiditySpectrum';
import { ReportSection } from './components/ReportSection';
import { ScoreBar } from './components/ScoreBar';
import { questions } from './data/questions';
import { fictionalSampleQuestions, fictionalSampleReport } from './data/sampleAssessment';
import { inspectAssessmentAccess } from './engine/reportAccess';
import { CURRENT_SESSION_VERSION, inspectStoredAssessment, isValidSession, RECOVERY_BACKUP_PREFIX, SESSION_VERSION_STORAGE_KEY, type AssessmentSnapshot, type RecoveryOffer } from './engine/sessionIntegrity';
import { buildAssessmentSession, createSessionSeed, getReplacementMemoryQuestion, saveSessionIds, saveSessionSeed, SESSION_IDS_STORAGE_KEY, SESSION_SEED_STORAGE_KEY } from './engine/session';
import { scoreAssessment, type Answer, type DichotomyResult, type SignalStrength } from './engine/scoring';
import { getInitialLanguage, t, type Language, type TranslationKey, LANGUAGE_STORAGE_KEY } from './i18n';
import { localizeQuestion } from './i18n/questions';
import {
  buildReportReflection,
  deriveRiasecMaxScores,
  toSortedScores
} from './utils/formatReport';
import { generateExecutiveSummary } from './utils/reportSynthesis';


type Screen = 'assessment' | 'about' | 'provide';
type AssessmentView = 'landing' | 'start' | 'question' | 'results' | 'report' | 'sample-report' | 'recovery';
type MemoryPhase = 'ready' | 'reveal' | 'answer';
const STORAGE_KEY = 'mindflow_answers_v1';

function isMemoryQuestionItem(question: (typeof questions)[number] | undefined): boolean {
  return Boolean(question?.section === 'cognitive' && question.cognitiveDomain === 'memory');
}

export function shouldShowForcedChoiceHelper(question: (typeof questions)[number] | undefined): boolean {
  return Boolean(question && question.section === 'mbti' && question.options.length === 2);
}


function getMbtiSignalKey(signal: SignalStrength): TranslationKey {
  if (signal === 'strong') return 'mbtiStrongSignal';
  if (signal === 'moderate') return 'mbtiModerateSignal';
  return 'mbtiLowSignal';
}

function getMbtiLeanKey(signal: SignalStrength): TranslationKey {
  if (signal === 'strong') return 'mbtiStrongLean';
  if (signal === 'moderate') return 'mbtiModerateLean';
  return 'mbtiSlightLean';
}

function getMbtiDimensionLabelKey(dimension: DichotomyResult['dimension']): TranslationKey {
  if (dimension === 'E/I') return 'mbtiDimensionEnergyFocus';
  if (dimension === 'S/N') return 'mbtiDimensionInformationStyle';
  if (dimension === 'T/F') return 'mbtiDimensionDecisionAnchor';
  return 'mbtiDimensionStructurePreference';
}

const MBTI_POLE_KEYS: Record<DichotomyResult['dominantPole'], TranslationKey> = {
  E: 'mbtiPoleE',
  I: 'mbtiPoleI',
  S: 'mbtiPoleS',
  N: 'mbtiPoleN',
  T: 'mbtiPoleT',
  F: 'mbtiPoleF',
  J: 'mbtiPoleJ',
  P: 'mbtiPoleP'
};

function getMbtiPoleLabelKey(pole: DichotomyResult['dominantPole']): TranslationKey {
  return MBTI_POLE_KEYS[pole];
}

export function shouldRenderMbtiFluiditySpectrum(language: Language): boolean {
  return language === 'en';
}

export function getInitialSessionState() {
  const snapshot: AssessmentSnapshot = {
    answersRaw: localStorage.getItem(STORAGE_KEY),
    idsRaw: localStorage.getItem(SESSION_IDS_STORAGE_KEY),
    seedRaw: localStorage.getItem(SESSION_SEED_STORAGE_KEY),
    versionRaw: localStorage.getItem(SESSION_VERSION_STORAGE_KEY)
  };
  return inspectStoredAssessment(snapshot);
}

export function App() {
  const [screen, setScreen] = useState<Screen>('assessment');
  const [assessmentView, setAssessmentView] = useState<AssessmentView>('landing');
  const [index, setIndex] = useState(0);
  const [initialSession] = useState(getInitialSessionState);
  const [answers, setAnswers] = useState<Answer[]>(initialSession.answers);
  const [recovery, setRecovery] = useState<RecoveryOffer | null>(initialSession.recovery);
  const [recoveryError, setRecoveryError] = useState('');
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const [memoryPhase, setMemoryPhase] = useState<MemoryPhase>('ready');
  const [revealRemaining, setRevealRemaining] = useState(5);
  const [questionTimerRemaining, setQuestionTimerRemaining] = useState<number | null>(null);
  const [sessionSeed, setSessionSeed] = useState(initialSession.seed);
  const [sessionQuestions, setSessionQuestions] = useState(initialSession.questions);
  const [usedMemoryQuestionIds, setUsedMemoryQuestionIds] = useState<Set<string>>(new Set());
  const [showMemoryProtectionModal, setShowMemoryProtectionModal] = useState(false);
  const [memoryPoolExhaustedNotice, setMemoryPoolExhaustedNotice] = useState('');
  const hasSavedProgress = answers.length > 0 && sessionQuestions.length > 0;
  const hasStoredAssessmentData = () => [
    STORAGE_KEY, SESSION_IDS_STORAGE_KEY, SESSION_SEED_STORAGE_KEY, SESSION_VERSION_STORAGE_KEY
  ].some((key) => localStorage.getItem(key) !== null);
  const recoveryBackupText = JSON.stringify({
    answersRaw: localStorage.getItem(STORAGE_KEY),
    idsRaw: localStorage.getItem(SESSION_IDS_STORAGE_KEY),
    seedRaw: localStorage.getItem(SESSION_SEED_STORAGE_KEY),
    versionRaw: localStorage.getItem(SESSION_VERSION_STORAGE_KEY)
  }, null, 2);
  const tx = (key: TranslationKey) => t(language, key);
  const current = useMemo(() => localizeQuestion(sessionQuestions[index], language), [index, language, sessionQuestions]);
  const isMemoryQuestion = current?.section === 'cognitive' && current.cognitiveDomain === 'memory';
  const progress = Math.round((index / Math.max(1, sessionQuestions.length)) * 100);
  const canAnswerCurrent = !isMemoryQuestion || memoryPhase === 'answer';
  const hasTimedCountdown = Boolean(current?.timed && (current.recommendedSeconds ?? 0) > 0);
  const isLate = hasTimedCountdown && questionTimerRemaining === 0;
  const previousQuestion = sessionQuestions[index - 1];
  const previousIsMemoryQuestion = isMemoryQuestionItem(previousQuestion);
  const showForcedChoiceHelper = shouldShowForcedChoiceHelper(current);

  useEffect(() => {
    if (!current) return;
    setMemoryPoolExhaustedNotice('');
    if (current.section === 'cognitive' && current.cognitiveDomain === 'memory') {
      setMemoryPhase('ready');
      setRevealRemaining(current.revealSeconds ?? 5);
      setUsedMemoryQuestionIds((prev) => new Set(prev).add(current.id));
    } else {
      setMemoryPhase('answer');
    }
    if (current.timed && (current.recommendedSeconds ?? 0) > 0) setQuestionTimerRemaining(current.recommendedSeconds ?? 0);
    else setQuestionTimerRemaining(null);
  }, [current?.id]);


  useEffect(() => {
    if (!current || !isMemoryQuestion || memoryPhase !== 'reveal' || revealRemaining <= 0) return;
    const interval = window.setInterval(() => {
      setRevealRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [current?.id, isMemoryQuestion, memoryPhase, revealRemaining]);
  useEffect(() => {
    if (memoryPhase === 'reveal' && revealRemaining === 0) setMemoryPhase('answer');
  }, [memoryPhase, revealRemaining]);
  useEffect(() => {
    if (!hasTimedCountdown) return;
    const interval = window.setInterval(() => {
      setQuestionTimerRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [hasTimedCountdown, current?.id]);

  const access = useMemo(() => inspectAssessmentAccess(sessionQuestions, answers), [sessionQuestions, answers]);
  const personalReport = useMemo(() => scoreAssessment(
    access.status === 'invalid-session' ? [] : sessionQuestions,
    access.canonicalAnswers
  ), [access, sessionQuestions]);
  const isSampleReport = assessmentView === 'sample-report';
  const isPersonalComplete = !recovery && access.status === 'complete';
  const report = isSampleReport ? fictionalSampleReport : personalReport;
  const bigFiveScores = useMemo(() => toSortedScores(report.bigFiveScores), [report]);
  const riasecScores = useMemo(() => toSortedScores(report.riasecScores), [report]);
  const riasecMaxScores = useMemo(
    () => deriveRiasecMaxScores(isSampleReport ? fictionalSampleQuestions : sessionQuestions),
    [isSampleReport, sessionQuestions]
  );

  const choose = (value: string, score: number) => {
    if (!current) return;
    const next = [...answers.filter((a) => a.questionId !== current.id), { questionId: current.id, value, score }];
    setAnswers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (index === sessionQuestions.length - 1) {
      const nextAccess = inspectAssessmentAccess(sessionQuestions, next);
      if (nextAccess.status === 'complete') setAssessmentView('results');
      else if (nextAccess.status === 'incomplete' && nextAccess.nextIndex !== null) setIndex(nextAccess.nextIndex);
      else {
        setRecovery({
          reasons: nextAccess.reasons,
          candidate: isValidSession(sessionQuestions)
            ? { seed: sessionSeed, questions: sessionQuestions, answers: nextAccess.canonicalAnswers }
            : null,
          preservedAnswerCount: next.length
        });
        setAssessmentView('recovery');
      }
    } else {
      setIndex((v) => v + 1);
    }
  };

  const startFreshAssessment = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers([]);
    localStorage.removeItem(SESSION_IDS_STORAGE_KEY);
    localStorage.removeItem(SESSION_SEED_STORAGE_KEY);
    const nextSeed = createSessionSeed();
    setSessionSeed(nextSeed);
    const fresh = buildAssessmentSession(questions, { sessionSeed: nextSeed });
    setSessionQuestions(fresh);
    saveSessionIds(fresh);
    saveSessionSeed(nextSeed);
    localStorage.setItem(SESSION_VERSION_STORAGE_KEY, CURRENT_SESSION_VERSION);
    setRecovery(null);
    setRecoveryError('');
    setIndex(0);
    setAssessmentView('question');
  };

  const resumeAssessment = () => {
    if (recovery || access.status === 'invalid-session' || access.status === 'invalid-answers') {
      setAssessmentView('recovery');
      return;
    }
    if (access.status === 'complete') {
      setAssessmentView('results');
      return;
    }
    setIndex(access.nextIndex ?? 0);
    setAssessmentView('question');
  };

  const restartToLanding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers([]);
    setIndex(0);
    setAssessmentView('landing');
  };
  const confirmRestartToLanding = () => {
    if (window.confirm(tx('restartConfirm'))) restartToLanding();
  };
  const beginFreshAssessment = () => {
    if (hasStoredAssessmentData() && !window.confirm(tx('startFreshConfirm'))) return;
    startFreshAssessment();
  };
  const acceptRecovery = () => {
    const candidate = recovery?.candidate;
    if (!candidate || !isValidSession(candidate.questions)) return;
    const candidateAccess = inspectAssessmentAccess(candidate.questions, candidate.answers);
    if (candidateAccess.status === 'invalid-session' || candidateAccess.status === 'invalid-answers') return;
    const before = {
      answersRaw: localStorage.getItem(STORAGE_KEY),
      idsRaw: localStorage.getItem(SESSION_IDS_STORAGE_KEY),
      seedRaw: localStorage.getItem(SESSION_SEED_STORAGE_KEY),
      versionRaw: localStorage.getItem(SESSION_VERSION_STORAGE_KEY)
    };
    const changes: Array<[string, string]> = [
      [STORAGE_KEY, JSON.stringify(candidateAccess.canonicalAnswers)],
      [SESSION_IDS_STORAGE_KEY, JSON.stringify(candidate.questions.map((q) => q.id))],
      [SESSION_SEED_STORAGE_KEY, candidate.seed],
      [SESSION_VERSION_STORAGE_KEY, CURRENT_SESSION_VERSION]
    ];
    const backupKey = RECOVERY_BACKUP_PREFIX + createSessionSeed();
    try {
      // The immutable backup must be persisted before changing assessment keys.
      localStorage.setItem(backupKey, JSON.stringify(before));
      for (const [key, value] of changes) localStorage.setItem(key, value);
    } catch {
      try {
        const originals: Array<[string, string | null]> = [
          [STORAGE_KEY, before.answersRaw],
          [SESSION_IDS_STORAGE_KEY, before.idsRaw],
          [SESSION_SEED_STORAGE_KEY, before.seedRaw],
          [SESSION_VERSION_STORAGE_KEY, before.versionRaw]
        ];
        for (const [key, value] of originals) {
          if (value === null) localStorage.removeItem(key);
          else localStorage.setItem(key, value);
        }
      } catch {
        // Retain the immutable backup and surface an error; never claim success.
      }
      setRecoveryError(tx('recoveryWriteFailed'));
      return;
    }
    setAnswers(candidateAccess.canonicalAnswers);
    setSessionQuestions(candidate.questions);
    setSessionSeed(candidate.seed);
    setRecovery(null);
    setRecoveryError('');
    setIndex(candidateAccess.nextIndex ?? 0);
    setAssessmentView(candidateAccess.status === 'complete' ? 'results' : 'question');
  };
  const openPersonalReport = () => {
    if (isPersonalComplete) setAssessmentView('report');
    else resumeAssessment();
  };

  const saveAndContinueLater = () => {
    setScreen('assessment');
    setAssessmentView('landing');
  };
  const goToPreviousQuestion = () => {
    if (index <= 0) return;
    if (previousIsMemoryQuestion) {
      setShowMemoryProtectionModal(true);
      return;
    }
    setIndex((v) => Math.max(0, v - 1));
  };
  const confirmMemoryBack = () => {
    if (index <= 0 || !previousQuestion || !isMemoryQuestionItem(previousQuestion)) return;
    const replacement = getReplacementMemoryQuestion(questions, sessionQuestions, usedMemoryQuestionIds, previousQuestion.id, sessionSeed);
    if (!replacement) {
      setMemoryPoolExhaustedNotice(tx('memoryPoolExhausted'));
      setShowMemoryProtectionModal(false);
      return;
    }
    const nextQuestions = [...sessionQuestions];
    nextQuestions[index - 1] = replacement;
    setSessionQuestions(nextQuestions);
    saveSessionIds(nextQuestions);
    const nextAnswers = answers.filter((a) => a.questionId !== previousQuestion.id);
    setAnswers(nextAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAnswers));
    setShowMemoryProtectionModal(false);
    setIndex((v) => Math.max(0, v - 1));
  };
  const startMemoryReveal = () => {
    if (!current || !isMemoryQuestion) return;
    setRevealRemaining(current.revealSeconds ?? 5);
    setMemoryPhase('reveal');
  };


  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const isQuestionFlow = screen === 'assessment' && assessmentView === 'question' && !recovery;
  const formatTemplate = (template: string, values: Record<string, string>) =>
    Object.entries(values).reduce((acc, [key, value]) => acc.split(`{${key}}`).join(value), template);
  const executiveSummaryText = formatTemplate(tx(isSampleReport ? 'sampleExecutiveSummaryTemplate' : 'executiveSummaryTemplate'), {
    personalityTypeEstimate: report.executiveSummaryParts.personalityTypeEstimate,
    topBigFive: report.executiveSummaryParts.topBigFive,
    topRiasec: report.executiveSummaryParts.topRiasec,
    topOperating: report.executiveSummaryParts.topOperating,
    topCognitiveLabel: report.executiveSummaryParts.topCognitiveLabel
  });
  const executiveSummary = useMemo(() => generateExecutiveSummary(report, isSampleReport ? 'sample' : 'personal'), [report, isSampleReport]);
  const executiveSummarySections = [
    executiveSummary.primaryWorkstyle,
    executiveSummary.cognitiveStyle,
    executiveSummary.operationalDrive,
    executiveSummary.strengthZone,
    executiveSummary.watchArea,
    executiveSummary.optimizationStrategy
  ];
  const cognitiveSummaryText = formatTemplate(
    isSampleReport ? tx('sampleCognitiveSummaryTemplate')
      : report.cognitiveSignalLevel === 'light' ? tx('cognitiveLightSummaryTemplate') : tx('cognitiveStandardSummaryTemplate'),
    { topCognitiveLabel: report.topCognitiveLabel }
  );
  const mbtiConfidenceLabel = tx(getMbtiSignalKey(report.mbtiScoreState.overallConfidence));
  const mbtiSummaryText = formatTemplate(tx(isSampleReport ? 'sampleMbtiBestFitTemplate' : 'mbtiBestFitTemplate'), {
    personalityTypeEstimate: report.mbtiScoreState.estimatedType,
    confidenceLevel: mbtiConfidenceLabel
  });
  const confidenceNote = formatTemplate(tx('confidenceNoteTemplate'), { confidenceLevel: report.confidenceLevel });
  const assessmentCategories = [
    { icon: '🧭', titleKey: 'categoryPersonalityTitle', descriptionKey: 'categoryPersonalityDesc' },
    { icon: '💼', titleKey: 'categoryCareerTitle', descriptionKey: 'categoryCareerDesc' },
    { icon: '🧠', titleKey: 'categoryCognitiveTitle', descriptionKey: 'categoryCognitiveDesc' },
    { icon: '🌱', titleKey: 'categoryStrengthsTitle', descriptionKey: 'categoryStrengthsDesc' },
    { icon: '🔍', titleKey: 'categoryPatternsTitle', descriptionKey: 'categoryPatternsDesc' },
    { icon: '📚', titleKey: 'categoryWorkLearningTitle', descriptionKey: 'categoryWorkLearningDesc' }
  ] as const;

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
              japaneseLabel={tx('langJapanese')}
              koreanLabel={tx('langKorean')}
              thaiLabel={tx('langThai')}
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
              japaneseLabel={tx('langJapanese')}
              koreanLabel={tx('langKorean')}
              thaiLabel={tx('langThai')}
            />
          </>
        )}
      </nav>

      {screen === 'assessment' && assessmentView === 'landing' && (
        <section className="card hero-card">
          {recovery && (
            <div className="sample-report-notice" role="alert">
              <strong>{tx('recoveryTitle')}</strong>
              <p>{tx('recoveryNotice')}</p>
              <button onClick={() => setAssessmentView('recovery')}>{tx('recoveryBackupLabel')}</button>
            </div>
          )}
          <p className="hero-kicker">{tx('heroKicker')}</p>
          <h1 className="hero-title">{tx('landingTitle')}</h1>
          <p className="hero-subtitle">
            {tx('landingDesc')}
          </p>
          <p className="disclaimer hero-disclaimer">
            {tx('nonDiagnosticNotice')}
          </p>
          <section className="assessment-categories" aria-label={tx('assessmentCategoriesAriaLabel')}>
            <p className="disclaimer">{tx('assessmentCategoriesDisclaimer')}</p>
            {assessmentCategories.map((category) => (
              <article key={category.titleKey} className="assessment-category-card">
                <div className="assessment-category-card__icon" aria-hidden="true">{category.icon}</div>
                <h2>{tx(category.titleKey)}</h2>
                <p>{tx(category.descriptionKey)}</p>
              </article>
            ))}
          </section>
          <div className="hero-actions">
            <button onClick={() => setAssessmentView('start')}>{tx('begin')}</button>
            <button className="hero-secondary-cta" onClick={() => setAssessmentView('sample-report')}>
              {tx('viewExampleReport')}
            </button>
          </div>
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'start' && (
        <section className="card">
          {recovery && (
            <div className="sample-report-notice" role="alert">
              <strong>{tx('recoveryTitle')}</strong>
              <p>{tx('recoveryNotice')}</p>
              <button onClick={() => setAssessmentView('recovery')}>{tx('recoveryBackupLabel')}</button>
            </div>
          )}
          <h2>{tx('startTitle')}</h2>
          <p>{formatTemplate(tx('sessionCountNotice'), { count: String(sessionQuestions.length) })}</p>
          <p>{tx('sessionOrderNotice')}</p>
          <p>{tx('sessionSaveNotice')}</p>
          <p className="disclaimer">{tx('localSaveNotice')}</p>
          <div className="stack">
            <button onClick={beginFreshAssessment}>{tx('startQuestions')}</button>
            <button className="option" onClick={resumeAssessment} disabled={!hasSavedProgress && !recovery}>
              {tx('resumeSaved')}
            </button>
          </div>
          {!hasSavedProgress && <p className="disclaimer">{tx('noSaved')}</p>}
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'recovery' && (
        <section className="card" aria-label={tx('recoveryTitle')}>
          <h2>{tx('recoveryTitle')}</h2>
          <p>{tx('recoveryNotice')}</p>
          <p className="disclaimer">{tx('recoveryPreservedCount')} {recovery?.candidate?.answers.length ?? 0}</p>
          {recovery?.candidate ? (
            <button onClick={acceptRecovery}>{tx('recoveryAccept')}</button>
          ) : (
            <p className="disclaimer">{tx('recoveryNoCandidate')}</p>
          )}
          {recoveryError && <p role="alert">{recoveryError}</p>}
          <details>
            <summary>{tx('recoveryBackupLabel')}</summary>
            <p className="disclaimer">{tx('recoveryBackupHint')}</p>
            <textarea readOnly rows={9} value={recoveryBackupText} aria-label={tx('recoveryBackupLabel')} style={{ width: '100%' }} />
          </details>
          <div className="stack">
            <button className="option" onClick={() => setAssessmentView('landing')}>{tx('backToHome')}</button>
            <button className="option" onClick={beginFreshAssessment}>{tx('recoveryStartOver')}</button>
          </div>
        </section>
      )}
      {screen === 'assessment' && assessmentView === 'question' && !recovery && current && (
        <section className="card question-card assessment-question-card" aria-live="polite">
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
          {hasTimedCountdown && questionTimerRemaining !== null && (
            <p className="disclaimer">{tx('timeRemaining')}: <strong>{questionTimerRemaining}s</strong></p>
          )}
          {isMemoryQuestion && memoryPhase === 'ready' ? (
            <>
              <h3>{tx('memoryReadyTitle')}</h3>
              <p>{tx('memoryReadyBody')}</p>
              <button onClick={startMemoryReveal}>{tx('readyReveal')}</button>
            </>
          ) : isMemoryQuestion && memoryPhase === 'reveal' ? (
            <div className="memory-encoding" aria-live="polite">
              <p className="memory-encoding__label">{tx('studyThisSequence')}</p>
              <p className="memory-encoding__content"><strong>{current.memoryPrompt}</strong></p>
              <p className="memory-encoding__timer">{tx('timeRemaining')}: <strong>{revealRemaining}s</strong></p>
            </div>
          ) : (
            <>
              <h3>{isMemoryQuestion ? current.memoryQuestion : current.prompt}</h3>
              {showForcedChoiceHelper && <p className="forced-choice-helper disclaimer">{tx('forcedChoiceHelper')}</p>}
              {isMemoryQuestion && <p className="disclaimer">{tx('memoryHiddenNotice')}</p>}
              <div className="stack">
                {canAnswerCurrent && current.options.map((o) => (
                  <button key={o.label} className="option" onClick={() => choose(o.value, o.score)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {isLate && <p className="disclaimer">{tx('timeUpNotice')}</p>}
          {current.section === 'cognitive' && !isMemoryQuestion && <p className="disclaimer">{tx('cognitiveNoBackNotice')}</p>}
          {current.section === 'cognitive' && !isMemoryQuestion && <p className="disclaimer">{tx('cognitiveSkipReassurance')}</p>}
          {memoryPoolExhaustedNotice && <p className="disclaimer">{memoryPoolExhaustedNotice}</p>}
          {current.hint && memoryPhase !== 'reveal' && (
            <details className="hint">
              <summary>{tx('needHelp')}</summary>
              <p>{current.hint}</p>
            </details>
          )}
          <div className="question-actions no-print">
            {index > 0 && <button className="secondary-action" onClick={goToPreviousQuestion} disabled={isMemoryQuestion && memoryPhase === 'reveal'}>{tx('backPrev')}</button>}
            <button className="secondary-action" onClick={saveAndContinueLater}>{tx('navSaveExit')}</button>
          </div>
          <p className="disclaimer">{tx('localSaveNotice')}</p>
          {current.section === 'cognitive' && <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>}
        </section>
      )}
      {showMemoryProtectionModal && (
        <section className="card" role="dialog" aria-modal="true">
          <h3>{tx('memoryProtectionTitle')}</h3>
          <p>{tx('memoryProtectionBody')}</p>
          <div className="stack">
            <button onClick={confirmMemoryBack}>{tx('regenerateMemoryQuestion')}</button>
            <button className="option" onClick={() => setShowMemoryProtectionModal(false)}>{tx('navCancel')}</button>
          </div>
        </section>
      )}

      {screen === 'assessment' && assessmentView === 'results' && isPersonalComplete && (
        <section className="card">
          <h2>{tx('resultsTitle')}</h2>
          <p><b>{tx('personalityEstimate')}</b> {mbtiSummaryText}</p>
          <p><b>{tx('motivationPattern')}</b> {report.motivationPattern}</p>
          <p>{cognitiveSummaryText}</p>
          <button onClick={openPersonalReport}>{tx('viewMyReport')}</button>
        </section>
      )}

      {screen === 'assessment' && (isSampleReport || (assessmentView === 'report' && isPersonalComplete)) && (
        <section className="card report-card print-report" aria-label={isSampleReport ? tx('sampleReportTitle') : tx('personalReportTitle')}>
          <h2>{isSampleReport ? tx('sampleReportTitle') : tx('personalReportTitle')}</h2>
          {isSampleReport && (
            <div className="sample-report-notice" role="note">
              <strong>{tx('sampleReportNoticeTitle')}</strong>
              <p>{tx('sampleReportNoticeBody')}</p>
            </div>
          )}
          <p className="disclaimer">{isSampleReport ? tx('sampleReportReflection') : buildReportReflection(report)}</p>
          <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>
          <div className="report-actions no-print">
            <button onClick={() => window.print()}>{tx('printPdf')}</button>
          </div>
          <ReportSection title={tx('executiveSummarySection')}>
            {language === 'en' ? (
              <>
                {executiveSummarySections.map((section) => (
                  <div key={section.heading}>
                    <h3>{section.heading}</h3>
                    <p>{section.body}</p>
                  </div>
                ))}
                <p className="disclaimer">{executiveSummary.disclaimer}</p>
              </>
            ) : (
              // TODO: Localize generated executive-summary synthesis in a dedicated i18n PR.
              <p>{executiveSummaryText}</p>
            )}
          </ReportSection>
          <ReportSection title={tx('personalitySection')}>
            <p>{mbtiSummaryText}</p>
            <p className="disclaimer">{tx('personalitySignalDisclaimer')}</p>
            {shouldRenderMbtiFluiditySpectrum(language) && <MbtiFluiditySpectrum dimensions={report.mbtiScoreState.dimensions} />}
            <ul>
              {report.mbtiScoreState.dimensions.map((dimension) => (
                <li key={dimension.dimension}>
                  <strong>{tx(getMbtiDimensionLabelKey(dimension.dimension))}:</strong>{' '}
                  {formatTemplate(tx('mbtiDimensionDetailTemplate'), {
                    leanStrength: tx(getMbtiLeanKey(dimension.signalStrength)),
                    poleLabel: tx(getMbtiPoleLabelKey(dimension.dominantPole)),
                    signalLabel: tx(getMbtiSignalKey(dimension.signalStrength))
                  })}
                </li>
              ))}
            </ul>
            <div className="score-grid">
              {bigFiveScores.map((item) => (
                <ScoreBar
                  key={item.key}
                  label={`${item.label} — ${report.bigFiveSignalStrength[item.key] ?? 'Low signal'}`}
                  score={report.bigFiveNormalizedScores[item.key] ?? 0}
                  max={100}
                  hint={tx('scoreBarReflectionHint')}
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
            <p>{tx('workstyleLabel')} <strong>{report.workstylePattern}</strong>.</p>
          </ReportSection>
          <ReportSection title={tx('workOperatingSection')}>
            <p>{tx('stressLabel')} <strong>{report.stressPattern}</strong>.</p>
            <p>{tx('leadershipLabel')} <strong>{report.leadershipPattern}</strong>.</p>
          </ReportSection>
          <ReportSection title={tx('cognitiveSection')}>
            <p>{cognitiveSummaryText}</p>
            <p className="disclaimer">{tx('cognitiveUnknownNotice')}</p>
            <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>
          </ReportSection>
          <ReportSection title={tx('strengthsSection')}>
            <ul>{report.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <ReportSection title={tx('blindSpotsSection')}>
            <ul>{report.blindSpots.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <ReportSection title={tx('combinedInsightsSection')}>
            <ul>{report.combinedInsightKeys.map((item) => <li key={item}>{tx(item as TranslationKey)}</li>)}</ul>
          </ReportSection>
          <ReportSection title={tx('growthAreasSection')}>
            <ul>{report.suggestedGrowthAreas.map((item) => <li key={item}>{item}</li>)}</ul>
          </ReportSection>
          <ReportSection title={tx('confidenceSection')}>
            <p>{confidenceNote}</p>
          </ReportSection>
          <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>
          {isSampleReport && (
            <p className="sample-report-print-footer">{tx('sampleReportNoticeTitle')}</p>
          )}
          <div className="report-actions no-print">
            {isSampleReport ? (
              <>
                <button onClick={() => setAssessmentView('start')}>{tx('startFromSample')}</button>
                <button className="option" onClick={() => setAssessmentView('landing')}>{tx('backToHome')}</button>
              </>
            ) : (
              <>
                <button className="option" onClick={() => setAssessmentView('landing')}>{tx('backToHome')}</button>
                <button onClick={confirmRestartToLanding}>{tx('restart')}</button>
              </>
            )}
          </div>
        </section>
      )}

      {screen === 'about' && (
        <section className="card">
          <h2>{tx('navAboutMindflow')}</h2>
          <p>MindFlow by Eirene Stack is built for self-discovery, reflection, career direction, and cognitive-style awareness.</p>
          <p className="disclaimer">{tx('nonDiagnosticNotice')}</p>
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
