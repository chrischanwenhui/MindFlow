/** Neutral line icons for the six landing categories. No emoji or icon dependency. */
const drawings = {
  personality: (
    <>
      <path d="M12 5a3.5 3.5 0 0 0-6.6-1.6 4.3 4.3 0 0 0-1.3 7.1 4 4 0 0 0 1.8 6.9A3.4 3.4 0 0 0 12 17V5Z" />
      <path d="M12 5a3.5 3.5 0 0 1 6.6-1.6 4.3 4.3 0 0 1 1.3 7.1 4 4 0 0 1-1.8 6.9A3.4 3.4 0 0 1 12 17V5Z" />
      <path d="M7 9c1 .1 1.5.6 2 1.5M17 9c-1 .1-1.5.6-2 1.5" />
    </>
  ),
  career: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
    </>
  ),
  cognitive: (
    <>
      <circle cx="12" cy="12" r="4" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="m7 7 2.2 2.2m7.6 0L17 7m-7.8 9.8L7 17m9.8-.2L17 17" />
    </>
  ),
  growth: (
    <>
      <path d="m3 17 6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  motivation: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  learning: (
    <>
      <path d="M12 6C9 4 6 4 3 5v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z" />
      <path d="M12 6v15" />
    </>
  )
} as const;

export type AssessmentCategoryIconKind = keyof typeof drawings;

export function AssessmentCategoryIcon({ kind }: { kind: AssessmentCategoryIconKind }) {
  return (
    <svg
      className="assessment-category-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[kind]}
    </svg>
  );
}
