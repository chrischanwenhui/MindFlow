import { useId } from 'react';
import { type Language } from '../i18n';

type LanguageSelectorProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  label: string;
  englishLabel: string;
  chineseLabel: string;
  malayLabel: string;
  compact?: boolean;
};

export function LanguageSelector({
  language,
  onLanguageChange,
  label,
  englishLabel,
  chineseLabel,
  malayLabel,
  compact = false
}: LanguageSelectorProps) {
  const selectId = useId();

  return (
    <label
      className={`language-select ${compact ? 'language-select--compact' : ''}`.trim()}
      htmlFor={selectId}
    >
      <span>{label}</span>
      <select
        id={selectId}
        value={language}
        onChange={(event) => onLanguageChange(event.target.value as Language)}
      >
        <option value="en">{englishLabel}</option>
        <option value="zh">{chineseLabel}</option>
        <option value="ms">{malayLabel}</option>
      </select>
    </label>
  );
}
