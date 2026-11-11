/** Preserve all equally highest career-interest labels instead of arbitrarily truncating ties. */
export function coLeadingInterestLabels(scores: ReadonlyArray<{ label: string; score: number }>): string[] {
  const highest = Math.max(0, ...scores.map(item => Number.isFinite(item.score) ? item.score : 0));
  if (highest <= 0) return [];
  return scores.filter(item => item.score === highest).map(item => item.label);
}

export interface ReportOverviewItem {
  label: string;
  value: string;
}

interface ReportOverviewProps {
  title: string;
  note: string;
  items: ReportOverviewItem[];
}

/** Summary of existing scored report fields; no new predictions are calculated. */
export function ReportOverview({ title, note, items }: ReportOverviewProps) {
  return (
    <section className="report-overview" aria-label={title}>
      <h2 className="report-overview__title">{title}</h2>
      <p className="report-overview__note">{note}</p>
      <dl className="report-overview__grid">
        {items.map(item => (
          <div className="report-overview__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
