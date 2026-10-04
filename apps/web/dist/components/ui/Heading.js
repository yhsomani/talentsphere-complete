import { jsx as _jsx } from "react/jsx-runtime";
import { colors, spacing, typography } from '@talentsphere/ui';
/**
 * Shared heading primitives.
 *
 * These enforce one typographic scale across every page so users always know
 * what to look at first:
 *   - HeroTitle  : the single biggest thing on the screen (one per page)
 *   - SectionTitle + SectionIntro : page-level H1 and section H2 rhythm
 *   - MicroLabel : uppercase eyebrow labels (AA-safe color, wide tracking)
 */
export const HeroTitle = ({ children, style, }) => (_jsx("h1", { style: {
        fontSize: typography.fontSize['5xl'],
        fontWeight: typography.fontWeight.extrabold,
        color: colors.neutral[900],
        lineHeight: typography.lineHeight.tight,
        letterSpacing: typography.letterSpacing.tighter,
        margin: `0 0 ${spacing.md}`,
        textWrap: 'balance',
        ...style,
    }, children: children }));
export const PageTitle = ({ children, style, }) => (_jsx("h1", { style: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.extrabold,
        color: colors.neutral[900],
        lineHeight: typography.lineHeight.tight,
        letterSpacing: typography.letterSpacing.tight,
        margin: `0 0 ${spacing.xs}`,
        ...style,
    }, children: children }));
export const SectionTitle = ({ children, style, }) => (_jsx("h2", { style: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.extrabold,
        color: colors.neutral[900],
        lineHeight: typography.lineHeight.snug,
        letterSpacing: typography.letterSpacing.tight,
        margin: `0 0 ${spacing.xs}`,
        textWrap: 'balance',
        ...style,
    }, children: children }));
export const SectionIntro = ({ children, style, }) => (_jsx("p", { style: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[600],
        lineHeight: typography.lineHeight.relaxed,
        margin: 0,
        maxWidth: '60ch',
        ...style,
    }, children: children }));
export const MicroLabel = ({ children, tone = 'neutral', style }) => {
    const toneColor = tone === 'primary'
        ? colors.primary[700]
        : tone === 'success'
            ? colors.semantic.successText
            : colors.neutral[600];
    return (_jsx("span", { style: {
            display: 'block',
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.bold,
            textTransform: 'uppercase',
            letterSpacing: typography.letterSpacing.wide,
            color: toneColor,
            marginBottom: spacing.xs,
            ...style,
        }, children: children }));
};
//# sourceMappingURL=Heading.js.map