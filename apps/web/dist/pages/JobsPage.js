import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, ShieldCheckIcon, CheckIcon, } from '../components/ui/index.js';
const JOBS = [
    {
        id: 'job-001',
        title: 'Staff Distributed Systems Engineer',
        company: 'CoreDB Infrastructure',
        location: 'Remote (US/Canada)',
        type: 'Full-time',
        salaryMin: 220000,
        salaryMax: 275000,
        currency: 'USD',
        matchScore: 94,
        requiredEvidence: [
            'Gold Tier: Distributed Systems Work History',
            'DKIM Corporate Domain Attestation',
            'Passing score on Transactional Queue Sandbox',
        ],
    },
    {
        id: 'job-002',
        title: 'Lead Platform Reliability Architect',
        company: 'FinTech Ledger Systems',
        location: 'San Francisco, CA / Hybrid',
        type: 'Full-time',
        salaryMin: 240000,
        salaryMax: 290000,
        currency: 'USD',
        matchScore: 88,
        requiredEvidence: [
            'Silver+ Tier: 3+ years Backend Systems',
            'Verified Supervisor Reference',
            'Concurrency & Partition Tolerance Assessment',
        ],
    },
    {
        id: 'job-003',
        title: 'Principal TypeScript / Web Runtime Engineer',
        company: 'NextGen Cloud Edge',
        location: 'Remote (Global)',
        type: 'Full-time',
        salaryMin: 210000,
        salaryMax: 260000,
        currency: 'USD',
        matchScore: 82,
        requiredEvidence: [
            'Cryptographic Evidence of Browser Sandbox Architecture',
            'Verified Open Source / Enterprise Contributions',
        ],
    },
];
export const JobsPage = () => {
    usePageMeta('Verifiable Career Opportunities', 'Browse pre-screened roles matched by verified evidence, supervisor references, and code artifacts — not keywords.');
    const [appliedJobs, setAppliedJobs] = useState({});
    const handleApply = (jobId) => {
        setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
    };
    return (_jsxs("div", { style: { maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }, children: [_jsxs("div", { style: {
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                    paddingBottom: spacing.lg,
                    marginBottom: spacing.xl,
                }, children: [_jsxs("div", { style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: spacing.xs,
                        }, children: [_jsx(Badge, { variant: "verified", children: "GOVERNED MATCHMAKING" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Zero Keyword Filters \u2022 Evidence-Based Match Scoring" })] }), _jsx("h1", { style: {
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: colors.neutral[900],
                            margin: 0,
                            letterSpacing: '-0.02em',
                        }, children: "Verifiable Career Opportunities" }), _jsx("p", { style: { color: colors.neutral[600], fontSize: '0.9375rem', margin: `${spacing.xs} 0 0` }, children: "Pre-screened roles that prioritize immutable evidence, supervisor references, and code artifacts." })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.lg }, children: JOBS.map((job) => {
                    const isApplied = Boolean(appliedJobs[job.id]);
                    return (_jsxs(Card, { "data-testid": `job-card-${job.id}`, children: [_jsxs(CardHeader, { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap',
                                    gap: spacing.sm,
                                }, children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: spacing.sm }, children: [_jsx(CardTitle, { children: job.title }), _jsxs(Badge, { variant: job.matchScore >= 90 ? 'gold' : 'info', mono: true, children: [job.matchScore, "% MATCH"] })] }), _jsxs(CardDescription, { children: [job.company, " \u2022 ", job.location, " \u2022 ", job.type] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsxs("div", { style: { fontSize: '1.25rem', fontWeight: 800, color: colors.neutral[900] }, children: ["$", (job.salaryMin / 1000).toFixed(0), "k \u2013 $", (job.salaryMax / 1000).toFixed(0), "k"] }), _jsx("span", { style: { fontSize: '0.75rem', color: colors.neutral[600] }, children: "Base Compensation (USD)" })] })] }), _jsxs(CardContent, { children: [_jsxs("div", { style: { marginBottom: spacing.md }, children: [_jsx("span", { style: {
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: colors.neutral[700],
                                                    display: 'block',
                                                    marginBottom: spacing.xs,
                                                }, children: "REQUIRED VERIFIED EVIDENCE:" }), _jsx("div", { style: { display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }, children: job.requiredEvidence.map((ev, i) => (_jsxs("span", { style: {
                                                        fontSize: '0.8125rem',
                                                        backgroundColor: colors.neutral[100],
                                                        color: colors.neutral[800],
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                    }, children: [_jsx(ShieldCheckIcon, { size: 14, style: { color: colors.primary[700] } }), ev] }, i))) })] }), _jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: spacing.md,
                                        }, children: [_jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Deterministic matching powered by RFC-0041 Evidence Graphs." }), _jsx(Button, { variant: isApplied ? 'secondary' : 'primary', size: "md", "data-testid": `apply-btn-${job.id}`, disabled: isApplied, onClick: () => handleApply(job.id), children: isApplied ? (_jsxs(_Fragment, { children: [_jsx(CheckIcon, { size: 16 }), " Application Transmitted"] })) : ('Apply with Evidence Graph') })] })] })] }, job.id));
                }) })] }));
};
//# sourceMappingURL=JobsPage.js.map