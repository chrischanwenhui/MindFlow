import type { ReactNode } from 'react';

type ReportSectionProps = {
  title: string;
  children: ReactNode;
};

export function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <section className="report-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
