import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Card, CardHeader, CardTitle, CardContent, Badge, AlertCircleIcon, } from '../components/ui/index.js';
export const TermsPage = () => {
    usePageMeta('Terms of Service', 'TalentSphere terms of service and integrity standards governing verification, references, and platform use.');
    return (_jsxs("div", { style: { maxWidth: '840px', margin: '0 auto', paddingBottom: spacing['2xl'] }, children: [_jsxs("div", { style: { marginBottom: spacing.xl }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.sm,
                            marginBottom: spacing.sm,
                        }, children: [_jsx(Badge, { variant: "neutral", children: "Legal Agreement" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Effective Date: September 25, 2026 \u2022 Version 3.1" })] }), _jsx("h1", { style: {
                            fontSize: '2.25rem',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            color: colors.neutral[900],
                            lineHeight: 1.2,
                            marginBottom: spacing.sm,
                        }, children: "Terms of Service & Verification Standards" }), _jsx("p", { style: { fontSize: '1.0625rem', color: colors.neutral[600], lineHeight: 1.6 }, children: "These terms govern your access to TalentSphere, candidate credential verification, proctored skill assessments, and employer interactions." })] }), _jsxs(Card, { style: { marginBottom: spacing.xl, borderLeft: `4px solid ${colors.semantic.warning}` }, children: [_jsx(CardHeader, { children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: spacing.xs }, children: [_jsx(AlertCircleIcon, { size: 16 }), _jsx(CardTitle, { style: { fontSize: '1rem', fontWeight: 700 }, children: "Credential Integrity Notice" })] }) }), _jsx(CardContent, { children: _jsx("p", { style: { margin: 0, fontSize: '0.875rem', color: colors.neutral[700], lineHeight: 1.6 }, children: "TalentSphere is built on cryptographic proof and factual verification. Submitting fraudulent work history, fabricating manager references via disposable emails, or utilizing unauthorized proxy solvers during proctored assessments constitutes a material breach resulting in immediate and permanent revocation of all verified badges and account termination." }) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.xl }, children: [_jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "1. Acceptance of Terms" }), _jsx("p", { style: { fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }, children: "By registering for an account, submitting work history evidence, participating in proctored assessments, or subscribing to employer hiring tools on TalentSphere (\u201CPlatform\u201D), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the Platform." })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "2. Candidate Attestations & Verification Standards" }), _jsx("p", { style: {
                                    fontSize: '0.9375rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.6,
                                    marginBottom: spacing.sm,
                                }, children: "As a candidate submitting evidence to the Talent Graph:" }), _jsxs("ul", { style: {
                                    margin: 0,
                                    paddingLeft: spacing.lg,
                                    fontSize: '0.875rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.7,
                                }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Factual Accuracy:" }), " You warrant that all employment dates, titles, and project contributions are accurate and complete to the best of your knowledge."] }), _jsxs("li", { children: [_jsx("strong", { children: "Manager Reference Integrity:" }), " You must supply authentic corporate or institutional email addresses for designated references. Supplying self-controlled aliases or disposable addresses is strictly prohibited."] }), _jsxs("li", { children: [_jsx("strong", { children: "Intellectual Property & Confidentiality:" }), " When linking code repositories or pull requests, you warrant that you are legally authorized to share such artifacts and that doing so does not violate prior confidentiality agreements or third-party trade secrets."] })] })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "3. Proctored Assessment Conduct & Academic Honesty" }), _jsx("p", { style: {
                                    fontSize: '0.9375rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.6,
                                    marginBottom: spacing.sm,
                                }, children: "TalentSphere assessments evaluate real-world engineering competence under controlled sandbox environments:" }), _jsxs("ul", { style: {
                                    margin: 0,
                                    paddingLeft: spacing.lg,
                                    fontSize: '0.875rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.7,
                                }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Sole Authorship:" }), " All code submitted during an assessment session must be authored solely by you during the allocated timeframe."] }), _jsxs("li", { children: [_jsx("strong", { children: "Anti-Cheating Mechanisms:" }), " The platform logs keystroke frequency, browser tab focus transitions, and sandbox execution logs to ensure session validity."] }), _jsxs("li", { children: [_jsx("strong", { children: "Prohibition of AI Proxy Agents:" }), " Use of automated agents or external humans answering questions on your behalf during proctored challenges is strictly forbidden."] })] })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "4. Employer Commitments & Honest Hiring Policy" }), _jsx("p", { style: {
                                    fontSize: '0.9375rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.6,
                                    marginBottom: spacing.sm,
                                }, children: "Employers and recruiters using TalentSphere to source and evaluate verified talent must adhere to:" }), _jsxs("ul", { style: {
                                    margin: 0,
                                    paddingLeft: spacing.lg,
                                    fontSize: '0.875rem',
                                    color: colors.neutral[700],
                                    lineHeight: 1.7,
                                }, children: [_jsxs("li", { children: [_jsx("strong", { children: "No Phantom or Ghost Postings:" }), " Every job opportunity posted on TalentSphere must correspond to an active, funded requisition with authentic intent to hire."] }), _jsxs("li", { children: [_jsx("strong", { children: "Accurate Compensation Ranges:" }), " All listed roles must state bona fide compensation bands in compliance with pay transparency regulations."] }), _jsxs("li", { children: [_jsx("strong", { children: "Non-Discriminatory Evaluation:" }), " Employers may not use verified score distributions for discriminatory purposes unlawful under applicable jurisdiction."] })] })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "5. Subscriptions, Invoicing, and Refund Policy" }), _jsx("p", { style: { fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }, children: "Subscription fees for Candidate Pro and Recruiter tiers are billed in advance on a monthly or annual basis as selected at checkout. Paid fees are non-refundable except where required by law. Cancellations take effect at the conclusion of the then-current billing period, with access maintained through the end of that period." })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "6. Limitation of Liability & Warranties" }), _jsx("p", { style: { fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }, children: "TalentSphere provides the platform and evidence verification \u201Cas is\u201D. While we employ rigorous cryptographic and human-in-the-loop verification methodologies, TalentSphere does not guarantee specific employment outcomes, hiring offers, or candidate job performance. To the maximum extent permitted by applicable law, TalentSphere shall not be liable for indirect, incidental, or consequential damages." })] }), _jsxs("section", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.neutral[900],
                                    marginBottom: spacing.xs,
                                }, children: "7. Governing Law and Dispute Resolution" }), _jsx("p", { style: { fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }, children: "These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms shall be resolved via binding individual arbitration conducted under the commercial arbitration rules of the American Arbitration Association (AAA)." })] })] })] }));
};
//# sourceMappingURL=TermsPage.js.map