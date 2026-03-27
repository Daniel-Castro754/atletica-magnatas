import { createTypographyClassName, TYPOGRAPHY_FONT_OPTIONS, TYPOGRAPHY_SIZE_OPTIONS } from '../../lib/typography';
import type { TextTypographyStyle, TypographyFontFamily, TypographyFontSize } from '../../types/typography';

type AdminTypographyControlProps = {
  label: string;
  value: TextTypographyStyle;
  previewText: string;
  onChange: (value: TextTypographyStyle) => void;
};

export default function AdminTypographyControl({
  label,
  value,
  previewText,
  onChange,
}: AdminTypographyControlProps) {
  const selectedFontLabel =
    TYPOGRAPHY_FONT_OPTIONS.find((option) => option.value === value.fontFamily)?.label || '';
  const selectedSizeLabel =
    TYPOGRAPHY_SIZE_OPTIONS.find((option) => option.value === value.fontSize)?.label || '';

  return (
    <article className="admin-typography-control">
      <div className="admin-typography-head">
        <strong>{label}</strong>
        <span className="admin-typography-summary">
          {selectedFontLabel} • {selectedSizeLabel}
        </span>
      </div>

      <div className="admin-typography-selects">
        <label className="admin-typography-select-field">
          <span className="admin-typography-select-label">Fonte</span>
          <select
            className="input admin-typography-select-input"
            value={value.fontFamily}
            onChange={(event) =>
              onChange({
                ...value,
                fontFamily: event.target.value as TypographyFontFamily,
              })
            }
          >
            {TYPOGRAPHY_FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-typography-select-field">
          <span className="admin-typography-select-label">Tamanho</span>
          <select
            className="input admin-typography-select-input"
            value={value.fontSize}
            onChange={(event) =>
              onChange({
                ...value,
                fontSize: event.target.value as TypographyFontSize,
              })
            }
          >
            {TYPOGRAPHY_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-typography-preview-shell">
        <p className={createTypographyClassName(value, 'admin-typography-preview')}>
          {previewText}
        </p>
      </div>
    </article>
  );
}
