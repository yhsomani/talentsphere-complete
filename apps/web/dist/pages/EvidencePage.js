import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Modal, CheckIcon, AlertCircleIcon, } from '../components/ui/index.js';
const INITIAL_ENTRIES = [
    {
        id: 'wh-001',
        companyName: 'Acme Cloud Infrastructure',
        jobTitle: 'Staff Distributed Systems Engineer',
        startDate: '2023-01-15',
        endDate: null,
        isCurrent: true,
        corporateEmail: 'jordan@acme.corp',
        isEmailVerified: true,
        confidenceScore: 96,
        tier: 'gold',
        referee: {
            name: 'Sarah Chen, VP Engineering',
            relationship: 'Direct Manager',
            submittedAt: '2024-11-20',
        },
        hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
        id: 'wh-002',
        companyName: 'DataMesh Solutions',
        jobTitle: 'Senior Backend Engineer',
        startDate: '2020-06-01',
        endDate: '2022-12-31',
        isCurrent: false,
        corporateEmail: 'jordan.eng@datamesh.io',
        isEmailVerified: true,
        confidenceScore: 78,
        tier: 'silver',
        hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    },
];
const DISPOSABLE_DOMAINS = [
    'mailinator.com',
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'throwaway.com',
];
export const EvidencePage = () => {
    usePageMeta('Evidence Graph', 'Attest work history, request verified supervisor references, and manage your immutable cryptographic evidence graph.');
    const [entries, setEntries] = useState(INITIAL_ENTRIES);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRefModalOpen, setIsRefModalOpen] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState(null);
    // Form states for Add Work History
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [email, setEmail] = useState('');
    const [addError, setAddError] = useState(null);
    // Form states for Request Reference
    const [refName, setRefName] = useState('');
    const [refEmail, setRefEmail] = useState('');
    const [refRole, setRefRole] = useState('manager');
    const [refError, setRefError] = useState(null);
    const [refSuccess, setRefSuccess] = useState(null);
    const handleAddSubmit = (e) => {
        e.preventDefault();
        setAddError(null);
        if (!company.trim() || !title.trim() || !startDate) {
            setAddError('Please fill in all required employment fields.');
            return;
        }
        if (!isCurrent && endDate && new Date(endDate) < new Date(startDate)) {
            setAddError('End date cannot precede employment start date (Anti-fraud BR-084).');
            return;
        }
        const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
        if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
            setAddError('Disposable and temporary email addresses are rejected for corporate attestation.');
            return;
        }
        const newEntry = {
            id: `wh-${Date.now()}`,
            companyName: company,
            jobTitle: title,
            startDate,
            endDate: isCurrent ? null : endDate,
            isCurrent,
            corporateEmail: email,
            isEmailVerified: Boolean(email),
            confidenceScore: email ? 70 : 40,
            tier: email ? 'silver' : 'bronze',
            hash: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        };
        setEntries([newEntry, ...entries]);
        setIsAddModalOpen(false);
        // Reset form
        setCompany('');
        setTitle('');
        setStartDate('');
        setEndDate('');
        setEmail('');
    };
    const handleReferenceSubmit = (e) => {
        e.preventDefault();
        setRefError(null);
        setRefSuccess(null);
        if (!refName.trim() || !refEmail.trim()) {
            setRefError('Please provide referee name and corporate email address.');
            return;
        }
        const domain = refEmail.split('@')[1]?.toLowerCase();
        if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
            setRefError('Disposable email addresses are strictly prohibited for manager references (BR-084).');
            return;
        }
        // Upgrade target entry to gold tier
        if (selectedEntryId) {
            setEntries(entries.map((entry) => {
                if (entry.id === selectedEntryId) {
                    return {
                        ...entry,
                        confidenceScore: Math.min(100, entry.confidenceScore + 18),
                        tier: 'gold',
                        referee: {
                            name: `${refName} (${refRole === 'manager' ? 'Direct Manager' : 'Technical Lead'})`,
                            relationship: refRole,
                            submittedAt: new Date().toISOString().split('T')[0],
                        },
                    };
                }
                return entry;
            }));
        }
        setRefSuccess(`Reference request dispatched to ${refEmail}. Candidate work history upgraded to Gold Tier pending evaluation.`);
        setTimeout(() => {
            setIsRefModalOpen(false);
            setRefSuccess(null);
            setRefName('');
            setRefEmail('');
        }, 1200);
    };
    return (_jsxs("div", { style: { maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                    paddingBottom: spacing.lg,
                    marginBottom: spacing.xl,
                    flexWrap: 'wrap',
                    gap: spacing.md,
                }, children: [_jsxs("div", { children: [_jsxs("div", { style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: spacing.xs,
                                }, children: [_jsx(Badge, { variant: "verified", children: "VERIFIED EVIDENCE GRAPH" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "RFC-0041 Cryptographic Credentials" })] }), _jsx("h1", { style: {
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    color: colors.neutral[900],
                                    margin: 0,
                                    letterSpacing: '-0.02em',
                                }, children: "Verified Work History & References" }), _jsx("p", { style: {
                                    color: colors.neutral[600],
                                    fontSize: '0.9375rem',
                                    margin: `${spacing.xs} 0 0`,
                                }, children: "Immutable employment attestations with domain checks and structured supervisor ratings." })] }), _jsx(Button, { "data-testid": "add-work-history-btn", onClick: () => setIsAddModalOpen(true), size: "md", children: "+ Attest Employment Record" })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: spacing.lg }, children: entries.map((item) => (_jsxs(Card, { "data-testid": `work-history-${item.id}`, children: [_jsxs(CardHeader, { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: spacing.sm,
                            }, children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: spacing.sm }, children: [_jsx(CardTitle, { children: item.jobTitle }), _jsx("span", { style: { color: colors.neutral[400] }, children: "\u2022" }), _jsx("strong", { style: { fontSize: '1rem', color: colors.neutral[700] }, children: item.companyName })] }), _jsxs(CardDescription, { children: [item.startDate, " \u2014 ", item.isCurrent ? 'Present' : item.endDate, " \u2022", ' ', _jsxs("span", { style: { fontFamily: 'monospace' }, children: [item.hash.substring(0, 24), "..."] })] })] }), _jsx("div", { style: { display: 'flex', alignItems: 'center', gap: spacing.sm }, children: _jsxs(Badge, { variant: item.tier, mono: true, children: [item.tier.toUpperCase(), " TIER \u2022 ", item.confidenceScore, "/100"] }) })] }), _jsx(CardContent, { children: _jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                                    gap: spacing.lg,
                                    fontSize: '0.875rem',
                                }, children: [_jsxs("div", { children: [_jsx("span", { style: {
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: colors.neutral[600],
                                                    display: 'block',
                                                    marginBottom: spacing.xs,
                                                }, children: "DOMAIN ATTESTATION" }), item.isEmailVerified ? (_jsxs("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: colors.semantic.successText,
                                                }, children: [_jsx(CheckIcon, { size: 16 }), _jsx("strong", { children: item.corporateEmail }), _jsx(Badge, { variant: "verified", children: "DKIM Verified" })] })) : (_jsxs("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: colors.neutral[600],
                                                }, children: [_jsx(AlertCircleIcon, { size: 16 }), _jsx("span", { children: "No corporate email attested" })] }))] }), _jsxs("div", { children: [_jsx("span", { style: {
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: colors.neutral[600],
                                                    display: 'block',
                                                    marginBottom: spacing.xs,
                                                }, children: "STRUCTURED REFERENCE" }), item.referee ? (_jsxs("div", { children: [_jsx("strong", { style: { color: colors.neutral[800], display: 'block' }, children: item.referee.name }), _jsxs("span", { style: { fontSize: '0.75rem', color: colors.neutral[600] }, children: ["Verified relationship: ", item.referee.relationship, " \u2022 Attested on", ' ', item.referee.submittedAt] })] })) : (_jsxs("div", { children: [_jsx("span", { style: {
                                                            color: colors.neutral[600],
                                                            display: 'block',
                                                            marginBottom: spacing.xs,
                                                        }, children: "No supervisor reference attached" }), _jsx(Button, { variant: "outline", size: "sm", "data-testid": `request-ref-${item.id}`, onClick: () => {
                                                            setSelectedEntryId(item.id);
                                                            setIsRefModalOpen(true);
                                                        }, children: "Request Reference" })] }))] }), _jsxs("div", { children: [_jsx("span", { style: {
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: colors.neutral[600],
                                                    display: 'block',
                                                    marginBottom: spacing.xs,
                                                }, children: "CONFIDENCE INTEGRITY" }), _jsxs("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: spacing.sm,
                                                    marginTop: '4px',
                                                }, children: [_jsx("div", { style: {
                                                            flex: 1,
                                                            height: '8px',
                                                            backgroundColor: colors.neutral[200],
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                        }, children: _jsx("div", { style: {
                                                                width: `${item.confidenceScore}%`,
                                                                height: '100%',
                                                                backgroundColor: item.confidenceScore >= 85
                                                                    ? colors.semantic.success
                                                                    : item.confidenceScore >= 70
                                                                        ? colors.primary[600]
                                                                        : colors.semantic.warning,
                                                            } }) }), _jsxs("strong", { style: { fontSize: '0.8125rem', color: colors.neutral[700] }, children: [item.confidenceScore, "%"] })] })] })] }) })] }, item.id))) }), _jsxs(Modal, { isOpen: isAddModalOpen, onClose: () => setIsAddModalOpen(false), title: "Attest Employment Record", description: "Submit employment history with start/end date invariants and corporate email verification.", children: [addError && (_jsx("div", { role: "alert", "data-testid": "add-error", style: {
                            backgroundColor: '#fef2f2',
                            color: colors.semantic.errorText,
                            border: `1px solid ${colors.semantic.error}`,
                            padding: `${spacing.sm} ${spacing.md}`,
                            borderRadius: '6px',
                            marginBottom: spacing.md,
                            fontSize: '0.875rem',
                        }, children: addError })), _jsxs("form", { onSubmit: handleAddSubmit, "data-testid": "add-employment-form", children: [_jsx(Input, { id: "company-name", label: "Company Name", placeholder: "e.g. Stripe, Acme Corp", required: true, value: company, onChange: (e) => setCompany(e.target.value), "data-testid": "input-company" }), _jsx(Input, { id: "job-title", label: "Job Title", placeholder: "e.g. Senior Backend Engineer", required: true, value: title, onChange: (e) => setTitle(e.target.value), "data-testid": "input-title" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }, children: [_jsx(Input, { id: "start-date", type: "date", label: "Start Date", required: true, value: startDate, onChange: (e) => setStartDate(e.target.value), "data-testid": "input-start-date" }), _jsx(Input, { id: "end-date", type: "date", label: "End Date", disabled: isCurrent, value: endDate, onChange: (e) => setEndDate(e.target.value), "data-testid": "input-end-date" })] }), _jsx("div", { style: { marginBottom: spacing.md }, children: _jsxs("label", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                    }, children: [_jsx("input", { type: "checkbox", checked: isCurrent, onChange: (e) => setIsCurrent(e.target.checked), "data-testid": "input-is-current" }), _jsx("span", { children: "I currently work in this role" })] }) }), _jsx(Input, { id: "corporate-email", type: "email", label: "Corporate Email (for domain attestation)", placeholder: "you@company.com", helperText: "We will send a single verification link to verify your corporate domain.", value: email, onChange: (e) => setEmail(e.target.value), "data-testid": "input-corporate-email" }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: spacing.sm,
                                    marginTop: spacing.lg,
                                }, children: [_jsx(Button, { variant: "secondary", type: "button", onClick: () => setIsAddModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", type: "submit", "data-testid": "submit-employment-btn", children: "Attest Record" })] })] })] }), _jsxs(Modal, { isOpen: isRefModalOpen, onClose: () => setIsRefModalOpen(false), title: "Request Structured Reference", description: "Invite a verified manager or tech lead to submit a structured capability scorecard.", children: [refError && (_jsx("div", { role: "alert", "data-testid": "ref-error", style: {
                            backgroundColor: '#fef2f2',
                            color: colors.semantic.errorText,
                            border: `1px solid ${colors.semantic.error}`,
                            padding: `${spacing.sm} ${spacing.md}`,
                            borderRadius: '6px',
                            marginBottom: spacing.md,
                            fontSize: '0.875rem',
                        }, children: refError })), refSuccess && (_jsx("div", { role: "status", "data-testid": "ref-success", style: {
                            backgroundColor: '#ecfdf5',
                            color: colors.semantic.successText,
                            border: `1px solid ${colors.semantic.success}`,
                            padding: `${spacing.sm} ${spacing.md}`,
                            borderRadius: '6px',
                            marginBottom: spacing.md,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        }, children: refSuccess })), _jsxs("form", { onSubmit: handleReferenceSubmit, "data-testid": "request-reference-form", children: [_jsx(Input, { id: "ref-name", label: "Referee Full Name", placeholder: "e.g. Alex Morgan", required: true, value: refName, onChange: (e) => setRefName(e.target.value), "data-testid": "input-ref-name" }), _jsx(Input, { id: "ref-email", type: "email", label: "Referee Corporate Email", placeholder: "alex.morgan@company.com", helperText: "Must match the employer domain. Disposable emails are blocked.", required: true, value: refEmail, onChange: (e) => setRefEmail(e.target.value), "data-testid": "input-ref-email" }), _jsxs("div", { style: { marginBottom: spacing.lg }, children: [_jsx("label", { htmlFor: "ref-role", style: {
                                            display: 'block',
                                            fontSize: '0.8125rem',
                                            fontWeight: 600,
                                            color: colors.neutral[800],
                                            marginBottom: spacing.xs,
                                        }, children: "Working Relationship" }), _jsxs("select", { id: "ref-role", value: refRole, onChange: (e) => setRefRole(e.target.value), "data-testid": "select-ref-role", style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: `1px solid ${colors.neutral[300]}`,
                                            fontSize: '0.875rem',
                                            color: colors.neutral[900],
                                            backgroundColor: '#ffffff',
                                        }, children: [_jsx("option", { value: "manager", children: "Direct Manager / Engineering Director" }), _jsx("option", { value: "tech_lead", children: "Staff / Principal Tech Lead" }), _jsx("option", { value: "peer", children: "Cross-functional Peer (Senior / Principal)" })] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }, children: [_jsx(Button, { variant: "secondary", type: "button", onClick: () => setIsRefModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", type: "submit", "data-testid": "submit-reference-btn", children: "Dispatch Verification Request" })] })] })] })] }));
};
//# sourceMappingURL=EvidencePage.js.map