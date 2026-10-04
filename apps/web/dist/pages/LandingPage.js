import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { colors, spacing, typography } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Button, Badge, Card, CardContent, ShieldCheckIcon, GitBranchIcon, LockIcon, ArrowRightIcon, CheckIcon, HeroTitle, SectionTitle, SectionIntro, MicroLabel, } from '../components/ui/index.js';
export const LandingPage = () => {
    usePageMeta('Career Operating System \u2014 Verified Talent & Evidence Graph', 'Prove your capabilities with verifiable projects, proctored code assessments, and an immutable evidence graph that employers trust. Explore TalentSphere.');
    return (_jsxs("div", { style: { maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }, children: [_jsxs("section", { style: {
                    paddingTop: spacing['3xl'],
                    paddingBottom: spacing['3xl'],
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                }, children: [_jsxs("div", { style: { maxWidth: '840px' }, children: [_jsxs("div", { style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: spacing.lg,
                                }, children: [_jsx(Badge, { variant: "info", children: "TalentSphere OS v0.4.0" }), _jsx("span", { style: {
                                            fontSize: typography.fontSize.sm,
                                            color: colors.neutral[600],
                                            fontWeight: typography.fontWeight.medium,
                                        }, children: "Deterministic Verification & Evidence Network" })] }), _jsxs(HeroTitle, { children: ["The Career Operating System Built on", ' ', _jsx("span", { style: { color: colors.primary[700] }, children: "Verified Evidence" })] }), _jsx("p", { style: {
                                    fontSize: typography.fontSize.xl,
                                    color: colors.neutral[700],
                                    lineHeight: typography.lineHeight.relaxed,
                                    marginBottom: spacing['2xl'],
                                    maxWidth: '65ch',
                                }, children: "Move beyond unverified resumes and keyword games. Prove your capabilities through verifiable projects, proctored code assessments, and an immutable evidence graph employers trust." }), _jsxs("div", { style: {
                                    display: 'flex',
                                    gap: spacing.md,
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                }, children: [_jsx(Link, { to: "/dashboard", style: { textDecoration: 'none' }, children: _jsxs(Button, { size: "lg", "data-testid": "cta-dashboard", children: ["Launch Career Cockpit ", _jsx(ArrowRightIcon, { size: 18 })] }) }), _jsx(Link, { to: "/evidence", style: { textDecoration: 'none' }, children: _jsx(Button, { variant: "outline", size: "lg", "data-testid": "cta-evidence", children: "Explore Evidence Hub" }) })] })] }), _jsx("div", { style: { marginTop: spacing['2xl'] }, children: _jsxs("div", { style: {
                                backgroundColor: '#ffffff',
                                border: `1px solid ${colors.neutral[300]}`,
                                borderRadius: '12px',
                                padding: spacing.xl,
                                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                            }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom: `1px solid ${colors.neutral[100]}`,
                                        paddingBottom: spacing.md,
                                        marginBottom: spacing.lg,
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: spacing.sm }, children: [_jsx(ShieldCheckIcon, { size: 24, style: { color: colors.semantic.successText } }), _jsx("span", { style: {
                                                        fontWeight: typography.fontWeight.bold,
                                                        fontSize: typography.fontSize.base,
                                                        color: colors.neutral[900],
                                                    }, children: "Verifiable Employment Credential \u2022 Acme Infrastructure Corp" })] }), _jsx(Badge, { variant: "gold", mono: true, children: "GOLD TIER \u2022 96/100" })] }), _jsxs("div", { style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
                                        gap: spacing.lg,
                                    }, children: [_jsxs("div", { children: [_jsx(MicroLabel, { children: "Role & Tenure" }), _jsx("strong", { style: {
                                                        fontSize: typography.fontSize.base,
                                                        color: colors.neutral[800],
                                                        fontWeight: typography.fontWeight.semibold,
                                                    }, children: "Staff Systems Architect (2.8 yrs)" })] }), _jsxs("div", { children: [_jsx(MicroLabel, { children: "Corporate Attestation" }), _jsxs("span", { style: {
                                                        fontSize: typography.fontSize.base,
                                                        color: colors.semantic.successText,
                                                        fontWeight: typography.fontWeight.semibold,
                                                    }, children: [_jsx(CheckIcon, { size: 16, style: { display: 'inline', verticalAlign: '-3px' } }), ' ', "jordan@acme.corp (DKIM Verified)"] })] }), _jsxs("div", { children: [_jsx(MicroLabel, { children: "Structured Referee" }), _jsx("strong", { style: {
                                                        fontSize: typography.fontSize.base,
                                                        color: colors.neutral[800],
                                                        fontWeight: typography.fontWeight.semibold,
                                                    }, children: "VP of Engineering \u2022 5/5 Scorecard" })] }), _jsxs("div", { children: [_jsx(MicroLabel, { children: "Provenance Hash" }), _jsx("code", { style: {
                                                        fontFamily: typography.fontFamily.mono,
                                                        fontSize: typography.fontSize.sm,
                                                        color: colors.neutral[700],
                                                    }, children: "sha256:e3b0c44298fc..." })] })] })] }) })] }), _jsxs("section", { style: { paddingTop: spacing['3xl'], paddingBottom: spacing['3xl'] }, children: [_jsxs("div", { style: { marginBottom: spacing['2xl'] }, children: [_jsx(SectionTitle, { children: "Engineering-Grade Verification Pillars" }), _jsx(SectionIntro, { children: "Built around strict cryptographic provenance, anti-fraud employment validation, and deterministic skills." })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                            gap: spacing.xl,
                        }, children: [_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx("div", { style: {
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '8px',
                                                backgroundColor: colors.primary[50],
                                                color: colors.primary[700],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: spacing.md,
                                            }, children: _jsx(GitBranchIcon, { size: 24 }) }), _jsx("h3", { style: {
                                                fontSize: typography.fontSize.xl,
                                                fontWeight: typography.fontWeight.bold,
                                                color: colors.neutral[900],
                                                marginBottom: spacing.sm,
                                                letterSpacing: typography.letterSpacing.tight,
                                            }, children: "1. Talent Graph" }), _jsx("p", { style: {
                                                fontSize: typography.fontSize.base,
                                                color: colors.neutral[600],
                                                lineHeight: typography.lineHeight.relaxed,
                                                marginBottom: spacing.md,
                                            }, children: "Maps verified competencies, prerequisite graphs, and transferability without reliance on keyword gaming, endorsement inflation, or self-reported LinkedIn claims." }), _jsxs("ul", { style: {
                                                paddingLeft: '20px',
                                                margin: 0,
                                                fontSize: typography.fontSize.sm,
                                                color: colors.neutral[700],
                                                lineHeight: typography.lineHeight.relaxed,
                                            }, children: [_jsx("li", { style: { marginBottom: spacing.xs }, children: "Hierarchical capability prerequisites" }), _jsx("li", { style: { marginBottom: spacing.xs }, children: "Skill decay and recency measurement" }), _jsx("li", { children: "Cross-domain transferability vectors" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx("div", { style: {
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '8px',
                                                backgroundColor: '#ecfdf5',
                                                color: colors.semantic.successText,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: spacing.md,
                                            }, children: _jsx(ShieldCheckIcon, { size: 24 }) }), _jsx("h3", { style: {
                                                fontSize: typography.fontSize.xl,
                                                fontWeight: typography.fontWeight.bold,
                                                color: colors.neutral[900],
                                                marginBottom: spacing.sm,
                                                letterSpacing: typography.letterSpacing.tight,
                                            }, children: "2. Evidence Graph" }), _jsx("p", { style: {
                                                fontSize: typography.fontSize.base,
                                                color: colors.neutral[600],
                                                lineHeight: typography.lineHeight.relaxed,
                                                marginBottom: spacing.md,
                                            }, children: "Immutable provenance backed by corporate email attestation, structured manager references, and reproducible code execution artifacts rather than static resume PDFs." }), _jsxs("ul", { style: {
                                                paddingLeft: '20px',
                                                margin: 0,
                                                fontSize: typography.fontSize.sm,
                                                color: colors.neutral[700],
                                                lineHeight: typography.lineHeight.relaxed,
                                            }, children: [_jsx("li", { style: { marginBottom: spacing.xs }, children: "Anti-fraud date validation (BR-084)" }), _jsx("li", { style: { marginBottom: spacing.xs }, children: "Disposable email blocking on references" }), _jsx("li", { children: "Cryptographic JSON-LD verification export" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx("div", { style: {
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '8px',
                                                backgroundColor: colors.neutral[100],
                                                color: colors.neutral[800],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: spacing.md,
                                            }, children: _jsx(LockIcon, { size: 24 }) }), _jsx("h3", { style: {
                                                fontSize: typography.fontSize.xl,
                                                fontWeight: typography.fontWeight.bold,
                                                color: colors.neutral[900],
                                                marginBottom: spacing.sm,
                                                letterSpacing: typography.letterSpacing.tight,
                                            }, children: "3. Governed Intelligence" }), _jsx("p", { style: {
                                                fontSize: typography.fontSize.base,
                                                color: colors.neutral[600],
                                                lineHeight: typography.lineHeight.relaxed,
                                                marginBottom: spacing.md,
                                            }, children: "Explainable opportunity matching with differential privacy small-cell suppression ($k \\ge 10$) and zero AI compute costs billed silently to free candidates." }), _jsxs("ul", { style: {
                                                paddingLeft: '20px',
                                                margin: 0,
                                                fontSize: typography.fontSize.sm,
                                                color: colors.neutral[700],
                                                lineHeight: typography.lineHeight.relaxed,
                                            }, children: [_jsx("li", { style: { marginBottom: spacing.xs }, children: "Deterministic matching algorithms" }), _jsx("li", { style: { marginBottom: spacing.xs }, children: "Small-cell suppression against re-identification" }), _jsx("li", { children: "Zero LLM training on candidate code" })] })] }) })] })] }), _jsxs("section", { style: {
                    paddingTop: spacing['3xl'],
                    paddingBottom: spacing['3xl'],
                    borderTop: `1px solid ${colors.neutral[200]}`,
                }, children: [_jsxs("div", { style: { marginBottom: spacing['2xl'] }, children: [_jsx(SectionTitle, { children: "How Capability Verification Works" }), _jsx(SectionIntro, { children: "A rigorous 3-stage validation process that creates trustworthy credentials without invasive surveillance." })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                            gap: spacing.xl,
                        }, children: [_jsxs("div", { style: { borderLeft: `4px solid ${colors.primary[600]}`, paddingLeft: spacing.lg }, children: [_jsx(MicroLabel, { tone: "primary", children: "STEP 01" }), _jsx("h3", { style: {
                                            fontSize: typography.fontSize.xl,
                                            fontWeight: typography.fontWeight.bold,
                                            color: colors.neutral[900],
                                            margin: `${spacing.sm} 0`,
                                            letterSpacing: typography.letterSpacing.tight,
                                        }, children: "Attest Work History" }), _jsx("p", { style: {
                                            fontSize: typography.fontSize.base,
                                            color: colors.neutral[600],
                                            lineHeight: typography.lineHeight.relaxed,
                                        }, children: "Record employment entries with strict start/end date validation. Attest corporate email domain ownership via token verification." })] }), _jsxs("div", { style: { borderLeft: `4px solid ${colors.primary[600]}`, paddingLeft: spacing.lg }, children: [_jsx(MicroLabel, { tone: "primary", children: "STEP 02" }), _jsx("h3", { style: {
                                            fontSize: typography.fontSize.xl,
                                            fontWeight: typography.fontWeight.bold,
                                            color: colors.neutral[900],
                                            margin: `${spacing.sm} 0`,
                                            letterSpacing: typography.letterSpacing.tight,
                                        }, children: "Structured Peer Endorsement" }), _jsx("p", { style: {
                                            fontSize: typography.fontSize.base,
                                            color: colors.neutral[600],
                                            lineHeight: typography.lineHeight.relaxed,
                                        }, children: "Request verified references from managers or senior peers. System verifies referee corporate email domain and enforces anti-collusion boundaries." })] }), _jsxs("div", { style: { borderLeft: `4px solid ${colors.semantic.success}`, paddingLeft: spacing.lg }, children: [_jsx(MicroLabel, { tone: "success", children: "STEP 03" }), _jsx("h3", { style: {
                                            fontSize: typography.fontSize.xl,
                                            fontWeight: typography.fontWeight.bold,
                                            color: colors.neutral[900],
                                            margin: `${spacing.sm} 0`,
                                            letterSpacing: typography.letterSpacing.tight,
                                        }, children: "Score & Mint Badge" }), _jsx("p", { style: {
                                            fontSize: typography.fontSize.base,
                                            color: colors.neutral[600],
                                            lineHeight: typography.lineHeight.relaxed,
                                        }, children: "Deterministic scoring engine assigns a 0-100 confidence score and awards Bronze, Silver, or Gold verification tiers backed by cryptographic hash." })] })] }), _jsx("div", { style: { marginTop: spacing['2xl'], textAlign: 'center' }, children: _jsx(Link, { to: "/evidence", style: { textDecoration: 'none' }, children: _jsx(Button, { variant: "secondary", size: "md", children: "View Evidence Graph Demo \u2192" }) }) })] })] }));
};
//# sourceMappingURL=LandingPage.js.map