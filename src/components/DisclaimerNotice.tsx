interface DisclaimerNoticeProps {
  text: string;
  compact?: boolean;
}

export function DisclaimerNotice({ text, compact = false }: DisclaimerNoticeProps) {
  return <p className={`disclaimer ${compact ? 'disclaimer--compact' : ''}`.trim()}>{text}</p>;
}
