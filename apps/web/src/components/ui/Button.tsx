import React, { useState } from 'react';
import { colors, motion } from '@talentsphere/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

/**
 * Canonical button. States are declarative (React state-driven styles), never
 * imperative DOM mutation — hover/focus/active must survive re-renders and
 * respect prefers-reduced-motion via the global CSS kill-switch.
 *
 * Motion contract: only colour/shadow/ring changes at `motion.duration.fast`
 * with token easings. No lift, no bounce. The single deliberate exception is
 * the active press (-1px), which communicates cause-and-effect on click.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Generous hit targets (WCAG 2.5.5 / 2.5.8) and a clear size ladder so the
  // primary CTA on any screen reads as the loudest element.
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '0.8125rem', height: '34px' },
    md: { padding: '9px 18px', fontSize: '0.9375rem', height: '42px' },
    lg: { padding: '13px 26px', fontSize: '1.0625rem', height: '52px' },
  };

  // Base + hover values per variant, selected declaratively.
  const variantStyles: Record<string, { base: React.CSSProperties; hover: React.CSSProperties }> = {
    primary: {
      base: {
        backgroundColor: colors.primary[700],
        color: '#ffffff',
        border: '1px solid transparent',
        fontWeight: 700,
        boxShadow: '0 1px 2px rgba(3, 88, 161, 0.25), 0 4px 12px rgba(3, 88, 161, 0.22)',
      },
      hover: {
        backgroundColor: colors.primary[800],
        boxShadow: '0 2px 4px rgba(3, 88, 161, 0.28), 0 8px 20px rgba(3, 88, 161, 0.28)',
      },
    },
    secondary: {
      base: {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[800],
        border: `1px solid ${colors.neutral[300]}`,
        fontWeight: 600,
      },
      hover: {
        backgroundColor: colors.neutral[200],
        borderColor: colors.neutral[400],
      },
    },
    outline: {
      base: {
        backgroundColor: '#ffffff',
        color: colors.primary[700],
        border: `1.5px solid ${colors.primary[300]}`,
        fontWeight: 600,
      },
      hover: {
        borderColor: colors.primary[600],
        backgroundColor: colors.primary[50],
      },
    },
    ghost: {
      base: {
        backgroundColor: 'transparent',
        color: colors.neutral[700],
        border: '1px solid transparent',
        fontWeight: 600,
      },
      hover: {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[900],
      },
    },
  };

  const v = variantStyles[variant];
  const interactive = !isDisabled;
  const stateOverlay = interactive && hovered ? v.hover : {};
  const focusRing =
    interactive && focused
      ? { boxShadow: `0 0 0 2px #ffffff, 0 0 0 4px ${colors.primary[600]}` }
      : {};

  return (
    <button
      disabled={isDisabled}
      onMouseEnter={(e) => {
        if (interactive) setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        setPressed(false);
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onMouseDown={(e) => {
        if (interactive) setPressed(true);
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setPressed(false);
        onMouseUp?.(e);
      }}
      onTouchStart={(e) => {
        if (interactive) setPressed(true);
        onTouchStart?.(e);
      }}
      onTouchEnd={(e) => {
        setPressed(false);
        onTouchEnd?.(e);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '8px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        transition: `background-color ${motion.duration.fast} ${motion.easing.easeOut}, border-color ${motion.duration.fast} ${motion.easing.easeOut}, box-shadow ${motion.duration.fast} ${motion.easing.easeOut}, transform ${motion.duration.fast} ${motion.easing.easeOut}, color ${motion.duration.fast} ${motion.easing.easeOut}`,
        outline: 'none',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        letterSpacing: '-0.01em',
        transform: pressed && interactive ? 'translateY(1px)' : 'none',
        ...sizeStyles[size],
        ...v.base,
        ...stateOverlay,
        ...focusRing,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
