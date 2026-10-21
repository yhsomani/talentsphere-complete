import React from 'react';
import { colors, spacing } from '@talentsphere/ui';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: colors.neutral[800],
  marginBottom: spacing.xs,
};

const controlStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '4px',
  // The border is the field's only visible edge on a white card: neutral-500
  // gives it 4.76:1 against white (WCAG 1.4.11 needs 3:1; neutral-300 was
  // 1.48:1 — audit FE-07).
  border: `1px solid ${colors.neutral[500]}`,
  fontSize: '0.875rem',
  color: colors.neutral[900],
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const helperStyle: React.CSSProperties = {
  marginTop: spacing.xs,
  fontSize: '0.75rem',
  color: colors.neutral[600],
};

interface FieldShellProps {
  id: string;
  label: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FieldShell: React.FC<FieldShellProps> = ({ id, label, helperText, required, children }) => (
  <div style={{ marginBottom: spacing.md, width: '100%' }}>
    <label htmlFor={id} style={labelStyle}>
      {label} {required && <span style={{ color: colors.semantic.errorText }}>*</span>}
    </label>
    {children}
    {helperText && (
      <p id={`${id}-helper`} style={helperStyle}>
        {helperText}
      </p>
    )}
  </div>
);

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  helperText?: string;
}

/** Labelled multi-line input sharing Input's visual language. */
export const TextArea: React.FC<TextAreaProps> = ({ id, label, helperText, style, ...props }) => (
  <FieldShell id={id} label={label} helperText={helperText} required={props.required}>
    <textarea
      id={id}
      aria-describedby={helperText ? `${id}-helper` : undefined}
      rows={4}
      style={{ ...controlStyle, resize: 'vertical', lineHeight: 1.5, ...style }}
      {...props}
    />
  </FieldShell>
);

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  helperText?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

/** Labelled native select (keeps platform keyboard and screen-reader behaviour). */
export const Select: React.FC<SelectProps> = ({
  id,
  label,
  helperText,
  options,
  style,
  ...props
}) => (
  <FieldShell id={id} label={label} helperText={helperText} required={props.required}>
    <select
      id={id}
      aria-describedby={helperText ? `${id}-helper` : undefined}
      style={{ ...controlStyle, ...style }}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </FieldShell>
);
