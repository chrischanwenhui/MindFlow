import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { dictionaries } from '../i18n';
import { ReportOverview, coLeadingInterestLabels } from './ReportOverview';

describe('ReportOverview', () => {
  const entries = [
    { label: 'Estimated type', value: 'INTJ' },
    { label: 'Motivation', value: 'Clarify why it matters' },
    { label: 'Cognitive style', value: 'working memory' },
    { label: 'Career interests', value: 'Investigative / Social' }
  ];

  it('shows every tied highest career-interest direction and omits zero or invalid scores', () => {
    expect(coLeadingInterestLabels([
      { label: 'Investigative', score: 8 },
      { label: 'Social', score: 8 },
      { label: 'Artistic', score: 8 },
      { label: 'Realistic', score: 2 }
    ])).toEqual(['Investigative', 'Social', 'Artistic']);
    expect(coLeadingInterestLabels([
      { label: 'Investigative', score: 0 },
      { label: 'Social', score: Number.NaN }
    ])).toEqual([]);
  });

  it('renders all four existing-value tiles with semantic descriptions', () => {
    const markup = renderToStaticMarkup(createElement(ReportOverview, {
      title: 'Profile at a Glance', note: 'Non-diagnostic', items: entries
    }));
    expect(markup).toContain('<h2 class="report-overview__title">Profile at a Glance</h2>');
    expect(markup).toContain('<dl');
    expect(markup.match(/class="report-overview__item"/g)).toHaveLength(4);
    for (const entry of entries) {
      expect(markup).toContain(entry.label);
      expect(markup).toContain(entry.value);
    }
    expect(markup).toContain('aria-label="Profile at a Glance"');
  });

  it('has a distinct sample disclaimer and localized headings in all six languages', () => {
    for (const dictionary of Object.values(dictionaries)) {
      expect(dictionary.reportOverviewTitle.length).toBeGreaterThan(3);
      expect(dictionary.reportOverviewSampleNote.length).toBeGreaterThan(12);
      expect(dictionary.reportOverviewPersonalNote.length).toBeGreaterThan(12);
      expect(dictionary.reportOverviewSampleNote).not.toBe(dictionary.reportOverviewPersonalNote);
      for (const key of ['reportOverviewTypeLabel','reportOverviewInterestsLabel','reportOverviewMotivationLabel','reportOverviewCognitiveLabel','reportGroupProfile','reportGroupWork','reportGroupGrowth'] as const) {
        expect(dictionary[key].length).toBeGreaterThan(2);
      }
    }
    expect(dictionaries.en.reportOverviewSampleNote).toMatch(/fictional/i);
  });
});
