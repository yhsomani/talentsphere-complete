import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, ShieldCheckIcon, CodeIcon, GitBranchIcon, ArrowRightIcon, } from '../components/ui/index.js';
export const DashboardPage = () => {
    usePageMeta('Career Cockpit — Dashboard', 'Track your verified evidence, skill readiness score, and active applications in one career cockpit.');
    const [user, setUser] = useState({
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        role: 'Principal Systems Architect',
    });
    useEffect(() => {
        try {
            const stored = localStorage.getItem('talentsphere_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.email) {
                    setUser({
                        name: parsed.email.split('@')[0].replace('.', ' '),
                        email: parsed.email,
                        role: 'Senior Software Engineer',
                    });
                }
            }
        }
        catch {
            // Fallback to default demo state
        }
    }, []);
    return (_jsxs("div", { style: {
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.xl,
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: spacing.md,
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                    paddingBottom: spacing.lg,
                }, children: [_jsxs("div", { children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing.sm,
                                    marginBottom: spacing.xs,
                                }, children: [_jsxs(Badge, { variant: "verified", children: [_jsx(ShieldCheckIcon, { size: 12 }), _jsx("span", { children: "Identity Verified" })] }), _jsx(Badge, { variant: "gold", children: "Level 5 Contributor" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "DID: did:ts:8f7b2c...a91" })] }), _jsx("h1", { style: {
                                    fontSize: '2.25rem',
                                    fontWeight: 800,
                                    letterSpacing: '-0.025em',
                                    lineHeight: 1.15,
                                    color: colors.neutral[900],
                                    margin: '0 0 6px',
                                }, children: "Candidate Career Cockpit" }), _jsxs("p", { style: { margin: 0, color: colors.neutral[600], fontSize: '1rem' }, children: [user.name, " \u2022 ", user.role, " \u2022 Real-time readiness, verified credentials, and explainable matches."] })] }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: spacing.sm }, children: [_jsx(Link, { to: "/evidence", style: { textDecoration: 'none' }, children: _jsxs(Button, { variant: "secondary", size: "md", children: [_jsx(GitBranchIcon, { size: 16 }), _jsx("span", { children: "Manage Evidence" })] }) }), _jsx(Link, { to: "/assessments", style: { textDecoration: 'none' }, children: _jsxs(Button, { variant: "primary", size: "md", children: [_jsx(CodeIcon, { size: 16 }), _jsx("span", { children: "Begin Verification Challenge" })] }) })] })] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
                    gap: spacing.md,
                }, children: [_jsx(Card, { children: _jsxs(CardContent, { style: { padding: spacing.md }, children: [_jsx("span", { style: {
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: colors.neutral[600],
                                        fontWeight: 700,
                                    }, children: "Verified Evidence" }), _jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: spacing.xs,
                                        marginTop: spacing.xs,
                                    }, children: [_jsx("span", { style: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: colors.neutral[900] }, children: "12" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.semantic.successText, fontWeight: 600 }, children: "+2 this month" })] }), _jsx("div", { style: { marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }, children: "3 Gold \u2022 8 Silver \u2022 1 Bronze" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { style: { padding: spacing.md }, children: [_jsx("span", { style: {
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: colors.neutral[600],
                                        fontWeight: 700,
                                    }, children: "Skill Readiness" }), _jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: spacing.xs,
                                        marginTop: spacing.xs,
                                    }, children: [_jsx("span", { style: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: colors.primary[700] }, children: "88%" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "High Confidence" })] }), _jsx("div", { style: { marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Matches 94% of Staff/Principal requisitions" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { style: { padding: spacing.md }, children: [_jsx("span", { style: {
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: colors.neutral[600],
                                        fontWeight: 700,
                                    }, children: "Active Applications" }), _jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: spacing.xs,
                                        marginTop: spacing.xs,
                                    }, children: [_jsx("span", { style: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: colors.neutral[900] }, children: "3" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "In Review" })] }), _jsx("div", { style: { marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Acme Cloud, Stripe, Apex Fintech" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { style: { padding: spacing.md }, children: [_jsx("span", { style: {
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: colors.neutral[600],
                                        fontWeight: 700,
                                    }, children: "Eligible Opportunities" }), _jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: spacing.xs,
                                        marginTop: spacing.xs,
                                    }, children: [_jsx("span", { style: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: colors.neutral[900] }, children: "6" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.primary[600], fontWeight: 600 }, children: "Zero ghost jobs" })] }), _jsx("div", { style: { marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Instant verifiable 1-click apply enabled" })] }) })] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(460px, 100%), 1fr))',
                    gap: spacing.lg,
                }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.lg }, children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx(CardTitle, { style: { fontSize: '1.125rem', fontWeight: 700 }, children: "Verified Career Evidence" }), _jsx(CardDescription, { children: "Cryptographically signed by authorized employers and managers" })] }), _jsx(Link, { to: "/evidence", style: { textDecoration: 'none' }, children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx("span", { children: "View All (14)" }), _jsx(ArrowRightIcon, { size: 14 })] }) })] }) }), _jsx(CardContent, { children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.md }, children: [_jsxs("div", { style: {
                                                        padding: spacing.sm,
                                                        border: `1px solid ${colors.neutral[200]}`,
                                                        borderRadius: '6px',
                                                    }, children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }, children: "Acme Distributed Cloud \u2022 Staff Infrastructure Engineer" }), _jsx(Badge, { variant: "gold", children: "Gold Credential" })] }), _jsx("div", { style: {
                                                                fontSize: '0.8125rem',
                                                                color: colors.neutral[600],
                                                                marginBottom: spacing.xs,
                                                            }, children: "2023 - Present \u2022 Reference: Marcus Vance (VP Infrastructure)" }), _jsx("div", { style: { fontSize: '0.8125rem', color: colors.neutral[700] }, children: "Designed multi-region Raft state-machine replicating 450k op/s. Zero data loss during regional failover drills." })] }), _jsxs("div", { style: {
                                                        padding: spacing.sm,
                                                        border: `1px solid ${colors.neutral[200]}`,
                                                        borderRadius: '6px',
                                                    }, children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }, children: "Stripe Payments Infrastructure \u2022 Senior Backend Engineer" }), _jsx(Badge, { variant: "silver", children: "Silver Credential" })] }), _jsx("div", { style: {
                                                                fontSize: '0.8125rem',
                                                                color: colors.neutral[600],
                                                                marginBottom: spacing.xs,
                                                            }, children: "2021 - 2023 \u2022 Reference: Elena Rostova (Engineering Director)" }), _jsx("div", { style: { fontSize: '0.8125rem', color: colors.neutral[700] }, children: "Authored transactional idempotency layer across distributed database partitions." })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { style: { fontSize: '1.125rem', fontWeight: 700 }, children: "Technical Capability Matrix" }), _jsx(CardDescription, { children: "Evidence-weighted evaluation derived from proctored challenges & verified PRs" })] }), _jsx(CardContent, { children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.md }, children: [_jsxs("div", { children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                fontSize: '0.875rem',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 600 }, children: "Distributed Systems & Consensus" }), _jsx("span", { style: { fontWeight: 700, color: colors.primary[700] }, children: "94%" })] }), _jsx("div", { style: {
                                                                height: '6px',
                                                                backgroundColor: colors.neutral[200],
                                                                borderRadius: '3px',
                                                                overflow: 'hidden',
                                                            }, children: _jsx("div", { style: { width: '94%', height: '100%', backgroundColor: colors.primary[600] } }) })] }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                fontSize: '0.875rem',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 600 }, children: "TypeScript / Systems Architecture" }), _jsx("span", { style: { fontWeight: 700, color: colors.primary[700] }, children: "91%" })] }), _jsx("div", { style: {
                                                                height: '6px',
                                                                backgroundColor: colors.neutral[200],
                                                                borderRadius: '3px',
                                                                overflow: 'hidden',
                                                            }, children: _jsx("div", { style: { width: '91%', height: '100%', backgroundColor: colors.primary[600] } }) })] }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                fontSize: '0.875rem',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 600 }, children: "Database Partitioning & Idempotency" }), _jsx("span", { style: { fontWeight: 700, color: colors.primary[700] }, children: "88%" })] }), _jsx("div", { style: {
                                                                height: '6px',
                                                                backgroundColor: colors.neutral[200],
                                                                borderRadius: '3px',
                                                                overflow: 'hidden',
                                                            }, children: _jsx("div", { style: { width: '88%', height: '100%', backgroundColor: colors.primary[600] } }) })] }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                fontSize: '0.875rem',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 600 }, children: "Security, RBAC & Row-Level Security" }), _jsx("span", { style: { fontWeight: 700, color: colors.primary[700] }, children: "95%" })] }), _jsx("div", { style: {
                                                                height: '6px',
                                                                backgroundColor: colors.neutral[200],
                                                                borderRadius: '3px',
                                                                overflow: 'hidden',
                                                            }, children: _jsx("div", { style: { width: '95%', height: '100%', backgroundColor: colors.primary[600] } }) })] })] }) })] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.lg }, children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx(CardTitle, { style: { fontSize: '1.125rem', fontWeight: 700 }, children: "Proctored Assessment Transcripts" }), _jsx(CardDescription, { children: "Deterministic benchmark evaluations executed in isolated containers" })] }), _jsx(Link, { to: "/assessments", style: { textDecoration: 'none' }, children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx("span", { children: "Catalog" }), _jsx(ArrowRightIcon, { size: 14 })] }) })] }) }), _jsx(CardContent, { children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.md }, children: [_jsxs("div", { style: {
                                                        padding: spacing.sm,
                                                        border: `1px solid ${colors.neutral[200]}`,
                                                        borderRadius: '6px',
                                                    }, children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }, children: "Distributed Lock Manager (DLM-902)" }), _jsx(Badge, { variant: "gold", children: "Score: 94 / 100" })] }), _jsx("div", { style: {
                                                                fontSize: '0.8125rem',
                                                                color: colors.neutral[600],
                                                                marginBottom: spacing.xs,
                                                            }, children: "Completed Sep 22, 2026 \u2022 Runtime: 28 min \u2022 Fencing tokens verified" }), _jsx("div", { style: { fontSize: '0.8125rem', color: colors.neutral[700] }, children: "Rubric: 100% test pass rate under 10k concurrent lock contention threads. Zero split-brain states." })] }), _jsxs("div", { style: {
                                                        padding: spacing.sm,
                                                        border: `1px solid ${colors.neutral[200]}`,
                                                        borderRadius: '6px',
                                                    }, children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }, children: "Token Bucket Rate Limiter (SYS-401)" }), _jsx(Badge, { variant: "silver", children: "Score: 89 / 100" })] }), _jsx("div", { style: {
                                                                fontSize: '0.8125rem',
                                                                color: colors.neutral[600],
                                                                marginBottom: spacing.xs,
                                                            }, children: "Completed Sep 15, 2026 \u2022 Runtime: 19 min \u2022 Sub-millisecond latency" }), _jsx("div", { style: { fontSize: '0.8125rem', color: colors.neutral[700] }, children: "Rubric: Memory efficiency $O(1)$ space complexity per tenant. Burst window handled cleanly." })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx(CardTitle, { style: { fontSize: '1.125rem', fontWeight: 700 }, children: "Eligible Verifiable Roles" }), _jsx(CardDescription, { children: "Roles where your verified evidence satisfies 100% of hard constraints" })] }), _jsx(Link, { to: "/jobs", style: { textDecoration: 'none' }, children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx("span", { children: "Explore (6)" }), _jsx(ArrowRightIcon, { size: 14 })] }) })] }) }), _jsx(CardContent, { children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.md }, children: [_jsxs("div", { style: {
                                                        padding: spacing.sm,
                                                        border: `1px solid ${colors.neutral[200]}`,
                                                        borderRadius: '6px',
                                                    }, children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }, children: "Staff Distributed Systems Engineer" }), _jsx(Badge, { variant: "verified", children: "97% Evidence Match" })] }), _jsx("div", { style: {
                                                                fontSize: '0.8125rem',
                                                                color: colors.neutral[600],
                                                                marginBottom: spacing.xs,
                                                            }, children: "Acme Cloud Infrastructure \u2022 \\$240k - \\$310k \u2022 Fully Remote" }), _jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginTop: spacing.xs,
                                                            }, children: [_jsx("span", { style: { fontSize: '0.75rem', color: colors.neutral[600] }, children: "Requires: Raft/Paxos proof \u2022 DLM-902 > 90" }), _jsx(Link, { to: "/jobs", style: { textDecoration: 'none' }, children: _jsx(Button, { variant: "primary", size: "sm", children: _jsx("span", { children: "Review & Apply" }) }) })] })] }), _jsxs("div", { style: {
                                                        padding: spacing.sm,
                                                        border: `1px solid ${colors.neutral[200]}`,
                                                        borderRadius: '6px',
                                                    }, children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 4,
                                                            }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }, children: "Principal Platform Architect" }), _jsx(Badge, { variant: "verified", children: "92% Evidence Match" })] }), _jsx("div", { style: {
                                                                fontSize: '0.8125rem',
                                                                color: colors.neutral[600],
                                                                marginBottom: spacing.xs,
                                                            }, children: "Apex Global Fintech \u2022 \\$260k - \\$340k \u2022 San Francisco / Remote" }), _jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginTop: spacing.xs,
                                                            }, children: [_jsx("span", { style: { fontSize: '0.75rem', color: colors.neutral[600] }, children: "Requires: Idempotency proof \u2022 RBAC audit" }), _jsx(Link, { to: "/jobs", style: { textDecoration: 'none' }, children: _jsx(Button, { variant: "outline", size: "sm", children: _jsx("span", { children: "Review & Apply" }) }) })] })] })] }) })] })] })] })] }));
};
//# sourceMappingURL=DashboardPage.js.map