import React from 'react';
import { colors, spacing } from '@talentsphere/ui';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  id,
  required,
  style,
  ...props
}) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = generatedId ? `${generatedId}-error` : undefined;
  const helperId = generatedId ? `${generatedId}-helper` : undefined;

  return (
    <div style={{ marginBottom: spacing.md, width: '100%' }}>
      {label && (
        <label
          htmlFor={generatedId}
          style={{
            display: 'block',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: colors.neutral[800],
            marginBottom: spacing.xs,
          }}
        >
          {label} {required && <span style={{ color: colors.semantic.error }}>*</span>}
        </label>
      )}
      <input
        id={generatedId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          border: `1px solid ${error ? colors.semantic.error : colors.neutral[300]}`,
          fontSize: '0.875rem',
          color: colors.neutral[900],
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? colors.semantic.error : colors.primary[600];
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? '#fee2e2' : colors.primary[100]}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.semantic.error : colors.neutral[300];
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: colors.semantic.error,
            margin: `${spacing.xs} 0 0`,
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p
          id={helperId}
          style={{
            fontSize: '0.75rem',
            color: colors.neutral[500],
            margin: `${spacing.xs} 0 0`,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
