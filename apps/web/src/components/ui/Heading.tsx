import React from 'react';
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

export const HeroTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <h1
    style={{
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.extrabold,
      color: colors.neutral[900],
      lineHeight: typography.lineHeight.tight,
      letterSpacing: typography.letterSpacing.tighter,
      margin: `0 0 ${spacing.md}`,
      textWrap: 'balance',
      ...style,
    } as React.CSSProperties}
  >
    {children}
  </h1>
);

export const PageTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <h1
    style={{
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.extrabold,
      color: colors.neutral[900],
      lineHeight: typography.lineHeight.tight,
      letterSpacing: typography.letterSpacing.tight,
      margin: `0 0 ${spacing.xs}`,
      ...style,
    }}
  >
    {children}
  </h1>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <h2
    style={{
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.extrabold,
      color: colors.neutral[900],
      lineHeight: typography.lineHeight.snug,
      letterSpacing: typography.letterSpacing.tight,
      margin: `0 0 ${spacing.xs}`,
      textWrap: 'balance',
      ...style,
    }}
  >
    {children}
  </h2>
);

export const SectionIntro: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <p
    style={{
      fontSize: typography.fontSize.base,
      color: colors.neutral[600],
      lineHeight: typography.lineHeight.relaxed,
      margin: 0,
      maxWidth: '60ch',
      ...style,
    }}
  >
    {children}
  </p>
);

export const MicroLabel: React.FC<{
  children: React.ReactNode;
  tone?: 'neutral' | 'primary' | 'success';
  style?: React.CSSProperties;
}> = ({ children, tone = 'neutral', style }) => {
  const toneColor =
    tone === 'primary'
      ? colors.primary[700]
      : tone === 'success'
        ? colors.semantic.successText
        : colors.neutral[600];
  return (
    <span
      style={{
        display: 'block',
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: typography.letterSpacing.wide,
        color: toneColor,
        marginBottom: spacing.xs,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
