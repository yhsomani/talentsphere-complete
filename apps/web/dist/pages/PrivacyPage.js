import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Card, CardHeader, CardTitle, CardContent, Badge, ShieldCheckIcon, LockIcon, } from '../components/ui/index.js';
export const PrivacyPage = () => {
    usePageMeta('Privacy Policy', 'How TalentSphere collects, protects, and lets you control your personal data under GDPR and CCPA.');
    return (_jsxs("div", { style: { maxWidth: '840px', margin: '0 auto', paddingBottom: spacing['2xl'] }, children: [_jsxs("div", { style: { marginBottom: spacing.xl }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.sm,
                            marginBottom: spacing.sm,
                        }, children: [_jsxs(Badge, { variant: "verified", children: [_jsx(ShieldCheckIcon, { size: 12 }), _jsx("span", { children: "GDPR & CCPA Compliant" })] }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Effective Date: September 25, 2026 \u2022 Version 2.4" })] }), _jsx("h1", { style: {
                            fontSize: '2.25rem',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            color: colors.neutral[900],
                            lineHeight: 1.2,
                            marginBottom: spacing.sm,
                        }, children: "TalentSphere Privacy Policy" }), _jsx("p", { style: { fontSize: '1.0625rem', color: colors.neutral[600], lineHeight: 1.6 }, children: "How we collect, verify, protect, and cryptographically govern candidate evidence, career records, and employer interactions under strict zero-trust standards." })] }), _jsxs(Card, { style: { marginBottom: spacing.xl, borderLeft: `4px solid ${colors.primary[600]}` }, children: [_jsx(CardHeader, { children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: spacing.xs }, children: [_jsx(LockIcon, { size: 16 }), _jsx(CardTitle, { style: { fontSize: '1rem', fontWeight: 700 }, children: "Our Privacy Guarantees at a Glance" })] }) }), _jsx(CardContent, { children: _jsxs("ul", { style: {
                                margin: 0,
                                paddingLeft: spacing.lg,
                                fontSize: '0.875rem',
                                color: colors.neutral[700],
                                lineHeight: 1.7,
                            }, children: [_jsxs("li", { children: [_jsx("strong", { children: "You own your evidence:" }), " Your work history and code artifacts belong exclusively to you. We never sell candidate data to third-party data brokers."] }), _jsxs("li", { children: [_jsx("strong", { children: "Strict Differential Privacy:" }), " Analytics and aggregate market benchmarks require an anonymization threshold of ", _jsx("code", { children: "k \u2265 10" }), ". No individual score is discernible in benchmark reports."] }), _jsxs("li", { children: [_jsx("strong", { children: "Anti-LLM Scraping Clause:" }), " Your proprietary source code and sandbox submissions are never used to train public or foundational third-party LLMs without explicit cryptographic consent."] }), _jsxs("li", { children: [_jsx("strong", { children: "Cryptographic Audit Trail:" }), " Every employer profile view and evidence verification generates an immutable audit record visible in your Career Cockpit."] }), _jsxs("li", { children: [_jsx("strong", { children: "30-Day Erasure Grace Period:" }), " You can export your data (JSON / Verifiable Credential format) or request complete erasure under GDPR Article 17 at any time."] })] }) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.xl }, children: [_jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "1. Information We Collect and Verify" }), _jsx("p", { style: {
                                    fontSize: '0.9375rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.6,
                                    marginBottom: spacing.sm,
                                }, children: "TalentSphere is an evidence-first talent network. To establish cryptographic credibility between talent and employers, we process:" }), _jsx("div", { style: {
                                    backgroundColor: '#ffffff',
                                    border: `1px solid ${colors.neutral[200]}`,
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                }, children: _jsxs("table", { style: {
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '0.875rem',
                                        textAlign: 'left',
                                    }, children: [_jsx("thead", { children: _jsxs("tr", { style: {
                                                    backgroundColor: colors.neutral[50],
                                                    borderBottom: `1px solid ${colors.neutral[200]}`,
                                                }, children: [_jsx("th", { style: {
                                                            padding: `${spacing.sm} ${spacing.md}`,
                                                            fontWeight: 600,
                                                            color: colors.neutral[800],
                                                        }, children: "Category" }), _jsx("th", { style: {
                                                            padding: `${spacing.sm} ${spacing.md}`,
                                                            fontWeight: 600,
                                                            color: colors.neutral[800],
                                                        }, children: "Data Elements" }), _jsx("th", { style: {
                                                            padding: `${spacing.sm} ${spacing.md}`,
                                                            fontWeight: 600,
                                                            color: colors.neutral[800],
                                                        }, children: "Legal Basis (GDPR Art. 6)" })] }) }), _jsxs("tbody", { children: [_jsxs("tr", { style: { borderBottom: `1px solid ${colors.neutral[200]}` }, children: [_jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }, children: "Identity & Account" }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "Full name, verified corporate/institutional email address, session tokens." }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "Contractual necessity" })] }), _jsxs("tr", { style: { borderBottom: `1px solid ${colors.neutral[200]}` }, children: [_jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }, children: "Work History Evidence" }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "Company, title, dates, manager reference verification signatures, repository PR metadata." }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "Explicit consent & Contract" })] }), _jsxs("tr", { style: { borderBottom: `1px solid ${colors.neutral[200]}` }, children: [_jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }, children: "Proctored Assessments" }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "Code submissions, automated test execution outputs, execution metrics, rubric evaluations." }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "Consent" })] }), _jsxs("tr", { children: [_jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }, children: "Security & Telemetry" }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "IP hash, browser user-agent hash, session audit trail (strictly anonymized)." }), _jsx("td", { style: { padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }, children: "Legitimate interest (Fraud prevention)" })] })] })] }) })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "2. Evidence Verification & Reference Confirmation" }), _jsx("p", { style: { fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }, children: "When you submit a work history record or request manager verification, TalentSphere transmits a secure, single-use verification token to the verified corporate email address of your designated reference. We do not accept personal or disposable webmail domains (e.g., mailinator, tempmail) to prevent reference fabrication. References attest solely to factual tenure and technical scope." })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "3. Differential Privacy and Employer Access Controls" }), _jsx("p", { style: {
                                    fontSize: '0.9375rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.6,
                                    marginBottom: spacing.sm,
                                }, children: "TalentSphere implements strict Role-Based Access Control (RBAC) and Row-Level Security (RLS):" }), _jsxs("ul", { style: {
                                    margin: 0,
                                    paddingLeft: spacing.lg,
                                    fontSize: '0.875rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.7,
                                }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Public View:" }), " Only claims and badges you explicitly set to \u201CPublic Credential\u201D are visible without authentication."] }), _jsxs("li", { children: [_jsx("strong", { children: "Verified Employers:" }), " Employers with an active, vetted Enterprise or Starter subscription can view your verified dossier only when you apply or grant access via your Career Cockpit."] }), _jsxs("li", { children: [_jsx("strong", { children: "Aggregate Talent Analytics:" }), " Aggregated talent benchmarks require minimum cluster size ", _jsx("code", { children: "k \u2265 10" }), " with Laplace noise injection, guaranteeing zero individual re-identification."] })] })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "4. Your Rights Under GDPR & CCPA" }), _jsx("p", { style: {
                                    fontSize: '0.9375rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.6,
                                    marginBottom: spacing.sm,
                                }, children: "Depending on your jurisdiction, you have the following rights:" }), _jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
                                    gap: spacing.md,
                                }, children: [_jsxs("div", { style: {
                                            backgroundColor: '#ffffff',
                                            padding: spacing.md,
                                            borderRadius: '6px',
                                            border: `1px solid ${colors.neutral[200]}`,
                                        }, children: [_jsx("div", { style: {
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: colors.neutral[900],
                                                    marginBottom: spacing.xs,
                                                }, children: "Right of Access & Portability" }), _jsx("p", { style: {
                                                    margin: 0,
                                                    fontSize: '0.8125rem',
                                                    color: colors.neutral[600],
                                                    lineHeight: 1.5,
                                                }, children: "Export your full evidence graph, test transcripts, and verification signatures in standard JSON-LD format at any time." })] }), _jsxs("div", { style: {
                                            backgroundColor: '#ffffff',
                                            padding: spacing.md,
                                            borderRadius: '6px',
                                            border: `1px solid ${colors.neutral[200]}`,
                                        }, children: [_jsx("div", { style: {
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: colors.neutral[900],
                                                    marginBottom: spacing.xs,
                                                }, children: "Right to Erasure (Article 17)" }), _jsx("p", { style: {
                                                    margin: 0,
                                                    fontSize: '0.8125rem',
                                                    color: colors.neutral[600],
                                                    lineHeight: 1.5,
                                                }, children: "Permanently purge your account, dossiers, and assessment submissions within 30 days of submission." })] }), _jsxs("div", { style: {
                                            backgroundColor: '#ffffff',
                                            padding: spacing.md,
                                            borderRadius: '6px',
                                            border: `1px solid ${colors.neutral[200]}`,
                                        }, children: [_jsx("div", { style: {
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: colors.neutral[900],
                                                    marginBottom: spacing.xs,
                                                }, children: "Right to Rectification" }), _jsx("p", { style: {
                                                    margin: 0,
                                                    fontSize: '0.8125rem',
                                                    color: colors.neutral[600],
                                                    lineHeight: 1.5,
                                                }, children: "Update or dispute work history evidence records and re-request employer signature confirmation." })] })] })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "5. Data Protection Officer (DPO) & Contact" }), _jsx("p", { style: { fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }, children: "For privacy inquiries, cryptographic key rotations, or formal GDPR/CCPA requests, contact our Data Protection Officer at:" }), _jsxs("div", { style: {
                                    backgroundColor: colors.neutral[100],
                                    padding: spacing.md,
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    color: colors.neutral[800],
                                }, children: [_jsx("strong", { children: "TalentSphere Privacy Operations" }), _jsx("br", {}), "Email: ", _jsx("code", { style: { color: colors.primary[700] }, children: "privacy@talentsphere.dev" }), _jsx("br", {}), "Security Incident Response:", ' ', _jsx("code", { style: { color: colors.primary[700] }, children: "security@talentsphere.dev" }), _jsx("br", {}), "Response SLA: Within 48 business hours."] })] })] })] }));
};
//# sourceMappingURL=PrivacyPage.js.map