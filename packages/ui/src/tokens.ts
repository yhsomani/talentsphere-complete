/**
 * TalentSphere Canonical Design Tokens
 * Conforming to WCAG 2.2 AA contrast rules and docs/experience/UI_UX_DESIGN_SYSTEM.md
 */

/*
 * Palette: spruce is the brand (verified state, primary actions), ink is the
 * text, paper is the page. Neutrals are green-grey, not blue-grey, so nothing
 * reads as a default SaaS slate. Every text tone is AA on paper (#f4f5f1).
 */
export const colors = {
  primary: {
    50: '#eef5f1',
    100: '#d9e9e0',
    200: '#b3d3c2',
    300: '#7fb29a',
    400: '#4f8f75',
    500: '#2f7559',
    600: '#25634a',
    700: '#1e5b45',
    800: '#17493a',
    900: '#10342a',
  },
  neutral: {
    50: '#fafbf8',
    100: '#f4f5f1',
    200: '#e4e7e1',
    300: '#c9cfc8',
    400: '#9aa39c',
    500: '#6f7971',
    600: '#55605a',
    700: '#3f4a44',
    800: '#2a342f',
    900: '#17201c',
    950: '#0c110e',
  },
  semantic: {
    // Bright display tones — icons/badges/large graphics ONLY, never body text.
    success: '#1e5b45',
    warning: '#c98a1b',
    error: '#c2410c',
    info: '#4a6b8a',
    // Text-safe tones — >=4.5:1 contrast on paper (WCAG AA).
    successText: '#1e5b45',
    warningText: '#8a5a12',
    errorText: '#a8360a',
    infoText: '#3d5a75',
  },
  surface: {
    background: '#f4f5f1',
    card: '#fafbf8',
    subtle: '#eceee8',
    overlay: 'rgba(23, 32, 28, 0.55)',
  },
} as const;

export const spacing = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const typography = {
  fontFamily: {
    sans: '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    serif: 'Newsreader, "Iowan Old Style", Georgia, "Times New Roman", serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    // Fluid display sizes for hero-level hierarchy (clamp keeps mobile sane).
    '5xl': 'clamp(2.5rem, 1.6rem + 3.2vw, 3.75rem)',
    '6xl': 'clamp(3rem, 1.9rem + 4.2vw, 4.5rem)',
  },
  lineHeight: {
    none: '1',
    tight: '1.15',
    snug: '1.35',
    normal: '1.5',
    relaxed: '1.65',
  },
  letterSpacing: {
    tighter: '-0.025em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.06em',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

/**
 * Text colors guaranteed to pass WCAG AA on light surfaces.
 * Use these instead of neutral[400]/neutral[500] for meaningful copy.
 */
export const textColors = {
  heading: colors.neutral[900],
  body: colors.neutral[700],
  muted: colors.neutral[600],
  label: colors.neutral[600], // uppercase micro-labels: AA on white & neutral-50
  faint: colors.neutral[500], // decorative/large text only
} as const;

export const motion = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
