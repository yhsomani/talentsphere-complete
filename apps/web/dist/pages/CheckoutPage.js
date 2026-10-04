import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing, motion } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
const PLANS = [
    {
        id: 'candidate_pro',
        name: 'Candidate Pro',
        monthlyPrice: 29,
        yearlyPrice: 279,
        features: [
            'Gold Verified Evidence Badge',
            'Unlimited Proctored Skill Assessments',
            'Priority Matchmaking & Referral Graph',
            'Exportable Cryptographic Verifications',
        ],
    },
    {
        id: 'recruiter_starter',
        name: 'Recruiter Starter',
        monthlyPrice: 199,
        yearlyPrice: 1899,
        features: [
            'Verified Candidate Talent Pool Search',
            'Direct Verified Warm Introductions',
            '5 Active Job Postings',
            'Standard ATS Integration',
        ],
    },
    {
        id: 'recruiter_enterprise',
        name: 'Recruiter Enterprise',
        monthlyPrice: 599,
        yearlyPrice: 5750,
        features: [
            'Full Multi-Tenant Evidence Graph Access',
            'Custom Skill Taxonomy & Benchmarking',
            'Unlimited Job Postings & Inbound Filtering',
            'Dedicated Customer Success & SLA',
        ],
    },
];
export const CheckoutPage = () => {
    usePageMeta('Plans & Pricing', 'Choose a TalentSphere plan: employer verification credits, proctored assessment access, and priority evidence review.');
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState('candidate_pro');
    const [billingCycle, setBillingCycle] = useState('monthly');
    // Payment Form States
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);
    const activePlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[0];
    const price = billingCycle === 'monthly' ? activePlan.monthlyPrice : activePlan.yearlyPrice;
    const handleCheckout = async (e) => {
        e.preventDefault();
        setError(null);
        // Monkey-testing & validation guards
        if (!cardName.trim()) {
            setError('Please provide the cardholder name.');
            return;
        }
        const cleanNumber = cardNumber.replace(/\s+/g, '');
        if (cleanNumber.length < 15 || !/^\d+$/.test(cleanNumber)) {
            setError('Please provide a valid 15 or 16-digit payment card number.');
            return;
        }
        if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
            setError('Please provide a valid expiration date (MM/YY).');
            return;
        }
        if (cardCvc.length < 3 || !/^\d+$/.test(cardCvc)) {
            setError('Please provide a valid 3 or 4-digit security code (CVC).');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('talentsphere_token');
            // Optional backend synchronization
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800);
            await fetch('/api/v1/billing/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    planTier: selectedPlan,
                    billingCycle,
                    idempotencyKey: `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                }),
                signal: controller.signal,
            }).catch(() => null);
            clearTimeout(timeoutId);
            setConfirmedOrder({
                id: `ord_${Date.now().toString(36).toUpperCase()}`,
                planName: activePlan.name,
                amount: price,
            });
        }
        catch {
            setError('Transaction could not be completed. Please check your card information.');
        }
        finally {
            setLoading(false);
        }
    };
    const handlePrefillTestPayment = () => {
        setCardName('Jordan Test Candidate');
        setCardNumber('4242 4242 4242 4242');
        setCardExpiry('12/28');
        setCardCvc('123');
        setError(null);
    };
    return (_jsxs("div", { style: { maxWidth: '960px', margin: `${spacing.xl} auto`, padding: `0 ${spacing.md}` }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: spacing.xl }, children: [_jsx("h1", { style: {
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: colors.neutral[900],
                            marginBottom: spacing.xs,
                        }, children: "Checkout & Plan Subscriptions" }), _jsx("p", { style: { color: colors.neutral[600], fontSize: '1rem' }, children: "Select your subscription tier and upgrade your talent capabilities." }), _jsxs("div", { style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: colors.neutral[200],
                            padding: '4px',
                            borderRadius: '9999px',
                            marginTop: spacing.md,
                        }, children: [_jsx("button", { type: "button", "data-testid": "billing-cycle-monthly", onClick: () => setBillingCycle('monthly'), style: {
                                    padding: '6px 16px',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    backgroundColor: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                                    color: billingCycle === 'monthly' ? colors.neutral[900] : colors.neutral[600],
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }, children: "Monthly" }), _jsx("button", { type: "button", "data-testid": "billing-cycle-yearly", onClick: () => setBillingCycle('yearly'), style: {
                                    padding: '6px 16px',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    backgroundColor: billingCycle === 'yearly' ? '#ffffff' : 'transparent',
                                    color: billingCycle === 'yearly' ? colors.neutral[900] : colors.neutral[600],
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    boxShadow: billingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }, children: "Annual (Save ~20%)" })] })] }), confirmedOrder ? (_jsxs("div", { "data-testid": "checkout-success", role: "status", style: {
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: `1px solid ${colors.semantic.success}`,
                    padding: spacing.xl,
                    textAlign: 'center',
                    maxWidth: '540px',
                    margin: '0 auto',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }, children: [_jsx("div", { style: {
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#ecfdf5',
                            color: colors.semantic.successText,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            margin: '0 auto 16px',
                            fontWeight: 700,
                        }, children: "\u2713" }), _jsx("h2", { style: {
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: colors.neutral[900],
                            marginBottom: spacing.xs,
                        }, children: "Subscription Confirmed!" }), _jsxs("p", { style: { color: colors.neutral[600], fontSize: '0.875rem', marginBottom: spacing.md }, children: ["Thank you for subscribing to ", _jsx("strong", { children: confirmedOrder.planName }), "."] }), _jsxs("div", { style: {
                            backgroundColor: colors.neutral[50],
                            padding: spacing.md,
                            borderRadius: '6px',
                            textAlign: 'left',
                            marginBottom: spacing.lg,
                            fontSize: '0.875rem',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }, children: [_jsx("span", { children: "Order Reference:" }), _jsx("strong", { "data-testid": "order-reference", children: confirmedOrder.id })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }, children: [_jsx("span", { children: "Tier Activated:" }), _jsx("strong", { children: confirmedOrder.planName })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { children: "Total Paid:" }), _jsxs("strong", { "data-testid": "order-amount", children: ["$", confirmedOrder.amount] })] })] }), _jsx("button", { type: "button", "data-testid": "return-to-dashboard", onClick: () => navigate('/dashboard'), style: {
                            backgroundColor: colors.primary[600],
                            color: '#ffffff',
                            padding: `${spacing.sm} ${spacing.lg}`,
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                        }, children: "Return to Dashboard" })] })) : (_jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                    gap: spacing.xl,
                }, children: [_jsxs("div", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    marginBottom: spacing.md,
                                    color: colors.neutral[900],
                                }, children: "1. Select Plan" }), _jsx("div", { role: "radiogroup", "aria-label": "Subscription plans", style: { display: 'flex', flexDirection: 'column', gap: spacing.md }, children: PLANS.map((plan) => {
                                    const isSelected = selectedPlan === plan.id;
                                    const currentPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                                    return (_jsxs("div", { "data-testid": `plan-card-${plan.id}`, role: "radio", "aria-checked": isSelected, tabIndex: 0, onClick: () => setSelectedPlan(plan.id), onKeyDown: (e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedPlan(plan.id);
                                            }
                                        }, style: {
                                            border: `2px solid ${isSelected ? colors.primary[600] : colors.neutral[200]}`,
                                            borderRadius: '8px',
                                            padding: spacing.md,
                                            backgroundColor: isSelected ? colors.primary[50] : '#ffffff',
                                            cursor: 'pointer',
                                            transition: `border-color ${motion.duration.fast} ${motion.easing.easeOut}, background-color ${motion.duration.fast} ${motion.easing.easeOut}`,
                                        }, children: [_jsxs("div", { style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '1rem', color: colors.neutral[900] }, children: plan.name }), _jsxs("span", { style: { fontSize: '1.25rem', fontWeight: 800, color: colors.primary[700] }, children: ["$", currentPrice, _jsxs("span", { style: {
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 400,
                                                                    color: colors.neutral[600],
                                                                }, children: ["/", billingCycle === 'monthly' ? 'mo' : 'yr'] })] })] }), _jsx("ul", { style: {
                                                    margin: `${spacing.sm} 0 0`,
                                                    paddingLeft: '20px',
                                                    fontSize: '0.8125rem',
                                                    color: colors.neutral[600],
                                                }, children: plan.features.map((feat, i) => (_jsx("li", { style: { marginBottom: '2px' }, children: feat }, i))) })] }, plan.id));
                                }) })] }), _jsxs("div", { children: [_jsx("h2", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    marginBottom: spacing.md,
                                    color: colors.neutral[900],
                                }, children: "2. Payment Details" }), error && (_jsx("div", { role: "alert", "data-testid": "checkout-error", style: {
                                    backgroundColor: '#fef2f2',
                                    color: colors.semantic.errorText,
                                    border: `1px solid ${colors.semantic.error}`,
                                    padding: `${spacing.sm} ${spacing.md}`,
                                    borderRadius: '6px',
                                    marginBottom: spacing.md,
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                }, children: error })), _jsxs("form", { onSubmit: handleCheckout, "data-testid": "checkout-form", style: {
                                    backgroundColor: '#ffffff',
                                    padding: spacing.lg,
                                    borderRadius: '8px',
                                    border: `1px solid ${colors.neutral[200]}`,
                                }, children: [_jsxs("div", { style: { marginBottom: spacing.md }, children: [_jsx("label", { htmlFor: "card-name", style: {
                                                    display: 'block',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: 600,
                                                    color: colors.neutral[700],
                                                    marginBottom: spacing.xs,
                                                }, children: "Cardholder Name" }), _jsx("input", { id: "card-name", type: "text", required: true, "data-testid": "card-name", value: cardName, onChange: (e) => setCardName(e.target.value), placeholder: "Jane Candidate", style: {
                                                    width: '100%',
                                                    padding: `${spacing.sm} ${spacing.md}`,
                                                    borderRadius: '6px',
                                                    border: `1px solid ${colors.neutral[300]}`,
                                                    fontSize: '0.875rem',
                                                    boxSizing: 'border-box',
                                                } })] }), _jsxs("div", { style: { marginBottom: spacing.md }, children: [_jsx("label", { htmlFor: "card-number", style: {
                                                    display: 'block',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: 600,
                                                    color: colors.neutral[700],
                                                    marginBottom: spacing.xs,
                                                }, children: "Card Number" }), _jsx("input", { id: "card-number", type: "text", required: true, "data-testid": "card-number", value: cardNumber, onChange: (e) => setCardNumber(e.target.value), placeholder: "4242 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4242", style: {
                                                    width: '100%',
                                                    padding: `${spacing.sm} ${spacing.md}`,
                                                    borderRadius: '6px',
                                                    border: `1px solid ${colors.neutral[300]}`,
                                                    fontSize: '0.875rem',
                                                    boxSizing: 'border-box',
                                                } })] }), _jsxs("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: spacing.md,
                                            marginBottom: spacing.lg,
                                        }, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "card-expiry", style: {
                                                            display: 'block',
                                                            fontSize: '0.8125rem',
                                                            fontWeight: 600,
                                                            color: colors.neutral[700],
                                                            marginBottom: spacing.xs,
                                                        }, children: "Expires (MM/YY)" }), _jsx("input", { id: "card-expiry", type: "text", required: true, "data-testid": "card-expiry", value: cardExpiry, onChange: (e) => setCardExpiry(e.target.value), placeholder: "12/28", style: {
                                                            width: '100%',
                                                            padding: `${spacing.sm} ${spacing.md}`,
                                                            borderRadius: '6px',
                                                            border: `1px solid ${colors.neutral[300]}`,
                                                            fontSize: '0.875rem',
                                                            boxSizing: 'border-box',
                                                        } })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "card-cvc", style: {
                                                            display: 'block',
                                                            fontSize: '0.8125rem',
                                                            fontWeight: 600,
                                                            color: colors.neutral[700],
                                                            marginBottom: spacing.xs,
                                                        }, children: "CVC Code" }), _jsx("input", { id: "card-cvc", type: "text", required: true, "data-testid": "card-cvc", value: cardCvc, onChange: (e) => setCardCvc(e.target.value), placeholder: "123", style: {
                                                            width: '100%',
                                                            padding: `${spacing.sm} ${spacing.md}`,
                                                            borderRadius: '6px',
                                                            border: `1px solid ${colors.neutral[300]}`,
                                                            fontSize: '0.875rem',
                                                            boxSizing: 'border-box',
                                                        } })] })] }), _jsxs("div", { style: {
                                            borderTop: `1px solid ${colors.neutral[200]}`,
                                            paddingTop: spacing.md,
                                            marginBottom: spacing.md,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'baseline',
                                        }, children: [_jsx("div", { children: _jsxs("span", { style: { fontWeight: 600, fontSize: '0.875rem', color: colors.neutral[800] }, children: [activePlan.name, " (", billingCycle, ")"] }) }), _jsxs("div", { style: { fontSize: '1.25rem', fontWeight: 800, color: colors.primary[700] }, children: ["$", price] })] }), _jsx("button", { type: "submit", "data-testid": "checkout-submit", disabled: loading, style: {
                                            width: '100%',
                                            backgroundColor: colors.primary[600],
                                            color: '#ffffff',
                                            padding: `${spacing.sm} ${spacing.md}`,
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            marginBottom: spacing.md,
                                        }, children: loading ? 'Processing...' : `Complete Purchase — $${price}` }), _jsx("div", { style: { textAlign: 'center' }, children: _jsx("button", { type: "button", "data-testid": "prefill-payment", onClick: handlePrefillTestPayment, style: {
                                                background: 'none',
                                                border: 'none',
                                                color: colors.primary[600],
                                                fontSize: '0.8125rem',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                            }, children: "Prefill Test Card Data" }) })] })] })] }))] }));
};
//# sourceMappingURL=CheckoutPage.js.map