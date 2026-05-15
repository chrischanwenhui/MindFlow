import type { ReactNode } from 'react';

type ScoreBarProps = {
  label: string;
  score: number;
  max?: number;
  hint?: ReactNode;
};

export function ScoreBar({ label, score, max = 15, hint }: ScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(score, max));
  const percent = Math.round((clampedScore / max) * 100);

  return (
    <div className="scorebar" role="group" aria-label={`${label} score`}>
      <div className="scorebar__head">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="scorebar__track" aria-hidden="true">
        <div className="scorebar__fill" style={{ width: `${percent}%` }} />
      </div>
      {hint ? <small className="scorebar__hint">{hint}</small> : null}
    </div>
  );
}
