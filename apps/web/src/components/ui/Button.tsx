import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, motion } from '@talentsphere/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export interface ButtonLinkProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  'style'
> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

// Static per-variant/size tables live at module scope: they never change
// between renders, so they are computed once, not per button per render.
const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '0.8125rem', height: '34px' },
  md: { padding: '9px 18px', fontSize: '0.9375rem', height: '42px' },
  lg: { padding: '13px 26px', fontSize: '1.0625rem', height: '52px' },
};

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

/**
 * Shared surface (styles + hover/focus/press state) for Button and ButtonLink,
 * so a link that looks like a button cannot drift from the button it imitates.
 * Declarative state-driven styles, never imperative DOM mutation — hover/focus/
 * active must survive re-renders and respect the global reduced-motion kill
 * switch.
 *
 * Motion contract: only colour/shadow/ring changes at `motion.duration.fast`
 * with token easings. No lift, no bounce. The single deliberate exception is
 * the active press (-1px), which communicates cause-and-effect on click.
 */
const useButtonSurface = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  isDisabled: boolean,
  extraStyle?: React.CSSProperties
) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const v = variantStyles[variant];
  const interactive = !isDisabled;
  const stateOverlay = interactive && hovered ? v.hover : {};
  const focusRing =
    interactive && focused
      ? { boxShadow: `0 0 0 2px #ffffff, 0 0 0 4px ${colors.primary[600]}` }
      : {};

  const handlers = {
    onMouseEnter: () => {
      if (interactive) setHovered(true);
    },
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onFocus: () => {
      setFocused(true);
    },
    onBlur: () => {
      setFocused(false);
    },
    onMouseDown: () => {
      if (interactive) setPressed(true);
    },
    onMouseUp: () => {
      setPressed(false);
    },
    onTouchStart: () => {
      if (interactive) setPressed(true);
    },
    onTouchEnd: () => {
      setPressed(false);
    },
  };

  const surfaceStyle: React.CSSProperties = {
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
    textDecoration: 'none',
    boxSizing: 'border-box',
    letterSpacing: '-0.01em',
    transform: pressed && interactive ? 'translateY(1px)' : 'none',
    ...sizeStyles[size],
    ...v.base,
    ...stateOverlay,
    ...focusRing,
    ...extraStyle,
  };

  return { surfaceStyle, handlers };
};

/**
 * Canonical button. States are declarative (React state-driven styles), never
 * imperative DOM mutation — hover/focus/active must survive re-renders and
 * respect prefers-reduced-motion via the global CSS kill-switch.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const { surfaceStyle, handlers } = useButtonSurface(variant, size, isDisabled, style);

  return (
    <button disabled={isDisabled} {...handlers} {...props} style={surfaceStyle}>
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

/**
 * A link that carries the Button visual language. Use this for every
 * navigation styled as a button: nesting <Button> inside <Link> is invalid
 * HTML (interactive content inside interactive content) and gives screen
 * readers a "button inside link" while adding a second tab stop per action.
 */
export const ButtonLink: React.FC<ButtonLinkProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
  ...props
}) => {
  const { surfaceStyle, handlers } = useButtonSurface(variant, size, false, style);

  return (
    <Link {...props} {...handlers} style={surfaceStyle}>
      {children}
    </Link>
  );
};
