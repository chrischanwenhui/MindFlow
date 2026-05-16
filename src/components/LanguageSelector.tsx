import { useId, useMemo } from 'react';
import { type Language } from '../i18n';

type LanguageSelectorProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  label: string;
  englishLabel: string;
  chineseLabel: string;
  malayLabel: string;
  japaneseLabel: string;
  koreanLabel: string;
  thaiLabel: string;
  compact?: boolean;
};

export const supportedLanguageOptions = [
  { value: 'en', labelKey: 'englishLabel' },
  { value: 'zh', labelKey: 'chineseLabel' },
  { value: 'ms', labelKey: 'malayLabel' },
  { value: 'ja', labelKey: 'japaneseLabel' },
  { value: 'ko', labelKey: 'koreanLabel' },
  { value: 'th', labelKey: 'thaiLabel' }
] as const;

export function LanguageSelector({
  language,
  onLanguageChange,
  label,
  englishLabel,
  chineseLabel,
  malayLabel,
  japaneseLabel,
  koreanLabel,
  thaiLabel,
  compact = false
}: LanguageSelectorProps) {
  const selectId = useId();

  const optionLabels = useMemo(
    () => ({
      englishLabel,
      chineseLabel,
      malayLabel,
      japaneseLabel,
      koreanLabel,
      thaiLabel
    }),
    [englishLabel, chineseLabel, malayLabel, japaneseLabel, koreanLabel, thaiLabel]
  );

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
        {supportedLanguageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {optionLabels[option.labelKey]}
          </option>
        ))}
      </select>
    </label>
  );
}
