/**
 * TalentSphere Canonical Design Tokens
 * Conforming to WCAG 2.2 AA contrast rules and docs/experience/UI_UX_DESIGN_SYSTEM.md
 */
export const colors = {
    primary: {
        50: '#f0f7ff',
        100: '#e0effe',
        200: '#bae0fd',
        300: '#7cc7fb',
        400: '#38a8f8',
        500: '#0e8ce9',
        600: '#026fc7',
        700: '#0358a1',
        800: '#074b85',
        900: '#0c3f6e',
    },
    neutral: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    },
    semantic: {
        // Bright display tones — icons/badges/large graphics ONLY, never body text.
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // Text-safe tones — >=4.5:1 contrast on white surfaces (WCAG AA).
        successText: '#047857',
        warningText: '#92400e',
        errorText: '#b91c1c',
        infoText: '#1d4ed8',
    },
    surface: {
        background: '#ffffff',
        card: '#ffffff',
        subtle: '#f8fafc',
        overlay: 'rgba(15, 23, 42, 0.5)',
    },
};
export const spacing = {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
};
export const typography = {
    fontFamily: {
        sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
};
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
};
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
};
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};
//# sourceMappingURL=tokens.js.map