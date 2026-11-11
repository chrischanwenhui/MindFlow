import { beforeEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App';
import appSource from './App.tsx?raw';
import { dictionaries } from './i18n';

describe('fictional sample report UI safeguards', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => { values.set(key, value); },
        removeItem: (key: string) => { values.delete(key); }
      }
    });
  });

  it('renders a dedicated sample entry point on the landing page', () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain(dictionaries.en.viewExampleReport);
    expect(html).toContain(dictionaries.en.begin);
    expect(html).not.toContain(dictionaries.en.sampleReportNoticeTitle);
  });

  it('puts the assessment and example actions before the category details', () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html.indexOf(dictionaries.en.viewExampleReport)).toBeGreaterThan(-1);
    expect(html.indexOf(dictionaries.en.viewExampleReport)).toBeLessThan(html.indexOf(dictionaries.en.assessmentCategoriesDisclaimer));
    expect(html).toContain('<h1 class="hero-title">MindFlow</h1>');
    expect((html.match(/class="assessment-category-icon"/g) ?? [])).toHaveLength(6);
    expect((html.match(/Work &amp; Learning/g) ?? [])).toHaveLength(1);
    expect(html).not.toContain('🧭');
  });

  it('retains a branded navigation header and separate sample action', () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain('class="brand brand--nav"');
    expect(html).toContain('class="hero-secondary-cta"');
    expect(html).toContain('aria-current="page"');
  });

  it('places a report overview before the existing detail sections without altering report gating', () => {
    expect(appSource).toContain("<ReportOverview");
    expect(appSource).toContain('<h1 className="report-main-title">');
    expect(appSource).toContain('<h2 className="report-group-heading">');
    expect(appSource).toContain('<h4>{section.heading}</h4>');
    expect(appSource.indexOf("<ReportOverview")).toBeLessThan(appSource.indexOf("<ReportSection title={tx('executiveSummarySection')}>"));
    expect(appSource).toContain("tx('reportGroupProfile')");
    expect(appSource).toContain("tx('reportGroupWork')");
    expect(appSource).toContain("tx('reportGroupGrowth')");
    expect(appSource).toContain("coLeadingInterestLabels(riasecScores)");
  });

  it('places product discovery on the landing and safe report/about screens, not inside questions', () => {
    expect(appSource).toContain('<EcosystemProducts language={language} />');
    expect(appSource).toContain("<EcosystemProductLink language={language} />");
    expect(appSource).toContain("screen === 'assessment' && assessmentView === 'landing' && <EcosystemProducts");
    expect(appSource.match(/<EcosystemProductLink language={language} \/>/g)).toHaveLength(2);
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain('Try our other products');
    expect(html).toContain('https://cashflow.eireneos.com/');
    expect(html).not.toContain('Start Questions');
    expect(appSource).toContain("commitVerifiedRecovery(localStorage, candidate)");
  });

  it('uses separate sources and routes for fictional and personal reports', () => {
    expect(appSource).toContain("setAssessmentView('sample-report')");
    expect(appSource).toContain("const report = isSampleReport ? fictionalSampleReport : personalReport;");
    expect(appSource).toContain("(isSampleReport || (assessmentView === 'report' && isPersonalComplete))");
    expect(appSource).toContain("inspectAssessmentAccess(sessionQuestions, answers, sessionSeed)");
    expect(appSource).toContain("access.canonicalAnswers");
    expect(appSource).toContain("!recovery && access.status === 'complete'");
  });

  it('does not reuse destructive navigation for the fictional example', () => {
    expect(appSource).toContain("onClick={() => setAssessmentView('start')}>{tx('startFromSample')}");
    expect(appSource).toContain("onClick={() => setAssessmentView('landing')}>{tx('backToHome')}");
    expect(appSource).toContain("if (window.confirm(tx('restartConfirm'))) restartToLanding()");
    expect(appSource).toContain("if (hasStoredAssessmentData() && !window.confirm(tx('startFreshConfirm'))) return");
    expect(appSource).toContain("commitVerifiedRecovery(localStorage, candidate)");
    expect(appSource).toContain("setAssessmentView('recovery')");
  });

  it('identifies example content on screen and on printed pages', () => {
    expect(appSource).toContain('className="sample-report-notice" role="note"');
    expect(appSource).toContain("tx('sampleReportNoticeTitle')");
    expect(appSource).toContain("tx('sampleReportNoticeBody')");
    expect(appSource).toContain('className="sample-report-print-footer"');
  });

  it('provides explicit localized labels, warnings and safe navigation in all six languages', () => {
    for (const dictionary of Object.values(dictionaries)) {
      for (const key of [
        'viewExampleReport',
        'sampleReportTitle',
        'sampleReportNoticeTitle',
        'sampleReportNoticeBody',
        'personalReportTitle',
        'viewMyReport',
        'startFromSample',
        'backToHome',
        'restartConfirm',
        'startFreshConfirm'
      ] as const) {
        expect(dictionary[key].trim().length).toBeGreaterThan(0);
      }
      expect(dictionary.sampleReportNoticeBody.trim().length).toBeGreaterThan(20);
    }
  });
});
