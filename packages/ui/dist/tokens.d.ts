/**
 * TalentSphere Canonical Design Tokens
 * Conforming to WCAG 2.2 AA contrast rules and docs/experience/UI_UX_DESIGN_SYSTEM.md
 */
export declare const colors: {
    readonly primary: {
        readonly 50: "#f0f7ff";
        readonly 100: "#e0effe";
        readonly 200: "#bae0fd";
        readonly 300: "#7cc7fb";
        readonly 400: "#38a8f8";
        readonly 500: "#0e8ce9";
        readonly 600: "#026fc7";
        readonly 700: "#0358a1";
        readonly 800: "#074b85";
        readonly 900: "#0c3f6e";
    };
    readonly neutral: {
        readonly 50: "#f8fafc";
        readonly 100: "#f1f5f9";
        readonly 200: "#e2e8f0";
        readonly 300: "#cbd5e1";
        readonly 400: "#94a3b8";
        readonly 500: "#64748b";
        readonly 600: "#475569";
        readonly 700: "#334155";
        readonly 800: "#1e293b";
        readonly 900: "#0f172a";
        readonly 950: "#020617";
    };
    readonly semantic: {
        readonly success: "#10b981";
        readonly warning: "#f59e0b";
        readonly error: "#ef4444";
        readonly info: "#3b82f6";
        readonly successText: "#047857";
        readonly warningText: "#92400e";
        readonly errorText: "#b91c1c";
        readonly infoText: "#1d4ed8";
    };
    readonly surface: {
        readonly background: "#ffffff";
        readonly card: "#ffffff";
        readonly subtle: "#f8fafc";
        readonly overlay: "rgba(15, 23, 42, 0.5)";
    };
};
export declare const spacing: {
    readonly none: "0px";
    readonly xs: "4px";
    readonly sm: "8px";
    readonly md: "16px";
    readonly lg: "24px";
    readonly xl: "32px";
    readonly '2xl': "48px";
    readonly '3xl': "64px";
};
export declare const typography: {
    readonly fontFamily: {
        readonly sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif";
        readonly mono: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    };
    readonly fontSize: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
        readonly '5xl': "clamp(2.5rem, 1.6rem + 3.2vw, 3.75rem)";
        readonly '6xl': "clamp(3rem, 1.9rem + 4.2vw, 4.5rem)";
    };
    readonly lineHeight: {
        readonly none: "1";
        readonly tight: "1.15";
        readonly snug: "1.35";
        readonly normal: "1.5";
        readonly relaxed: "1.65";
    };
    readonly letterSpacing: {
        readonly tighter: "-0.025em";
        readonly tight: "-0.02em";
        readonly normal: "0";
        readonly wide: "0.06em";
    };
    readonly fontWeight: {
        readonly normal: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
        readonly extrabold: 800;
    };
};
/**
 * Text colors guaranteed to pass WCAG AA on light surfaces.
 * Use these instead of neutral[400]/neutral[500] for meaningful copy.
 */
export declare const textColors: {
    readonly heading: "#0f172a";
    readonly body: "#334155";
    readonly muted: "#475569";
    readonly label: "#475569";
    readonly faint: "#64748b";
};
export declare const motion: {
    readonly duration: {
        readonly instant: "0ms";
        readonly fast: "150ms";
        readonly normal: "250ms";
        readonly slow: "400ms";
    };
    readonly easing: {
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
export declare const breakpoints: {
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
};
//# sourceMappingURL=tokens.d.ts.map