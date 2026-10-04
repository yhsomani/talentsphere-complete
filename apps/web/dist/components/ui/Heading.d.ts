import React from 'react';
/**
 * Shared heading primitives.
 *
 * These enforce one typographic scale across every page so users always know
 * what to look at first:
 *   - HeroTitle  : the single biggest thing on the screen (one per page)
 *   - SectionTitle + SectionIntro : page-level H1 and section H2 rhythm
 *   - MicroLabel : uppercase eyebrow labels (AA-safe color, wide tracking)
 */
export declare const HeroTitle: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
}>;
export declare const PageTitle: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
}>;
export declare const SectionTitle: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
}>;
export declare const SectionIntro: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
}>;
export declare const MicroLabel: React.FC<{
    children: React.ReactNode;
    tone?: 'neutral' | 'primary' | 'success';
    style?: React.CSSProperties;
}>;
//# sourceMappingURL=Heading.d.ts.map