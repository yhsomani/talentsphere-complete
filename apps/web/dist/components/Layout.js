import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { colors, spacing, motion } from '@talentsphere/ui';
import { MenuIcon, PhoneIcon, ShieldCheckIcon, XIcon } from './ui/Icons.js';
import { describePwaCapability, usePwaCapability } from '../pwa.js';
const SUPPORT_EMAIL = 'support@talentsphere.io';
const SUPPORT_PHONE = '+1-415-555-0142';
const SUPPORT_PHONE_HREF = 'tel:+14155550142';
export const Layout = () => {
    const location = useLocation();
    const [isOnline, setIsOnline] = useState(true);
    const [userEmail, setUserEmail] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pwaCapability = usePwaCapability();
    const pwaStatus = describePwaCapability(pwaCapability);
    // Close the mobile menu whenever the route changes.
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOnline(navigator.onLine);
        try {
            const stored = localStorage.getItem('talentsphere_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.email)
                    setUserEmail(parsed.email);
            }
        }
        catch {
            // Ignored
        }
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [location.pathname]);
    const navLinks = [
        { label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
        { label: 'Evidence', path: '/evidence', testId: 'nav-evidence' },
        { label: 'Assessments', path: '/assessments', testId: 'nav-assessments' },
        { label: 'Opportunities', path: '/jobs', testId: 'nav-jobs' },
        { label: 'Pricing', path: '/checkout', testId: 'nav-checkout' },
    ];
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.neutral[50],
            color: colors.neutral[900],
        }, children: [_jsx("a", { href: "#main-content", className: "skip-link", style: {
                    zIndex: 9999,
                    background: colors.primary[700],
                    color: '#ffffff',
                    padding: `${spacing.sm} ${spacing.md}`,
                    fontWeight: 600,
                    borderRadius: '4px',
                    textDecoration: 'none',
                }, children: "Skip to main content" }), !isOnline && (_jsx("div", { role: "status", "aria-live": "polite", style: {
                    backgroundColor: colors.semantic.warning,
                    color: '#000000',
                    textAlign: 'center',
                    padding: `${spacing.xs} ${spacing.md}`,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                }, children: "You are currently offline. Viewing cached credentials and saved opportunities." })), _jsxs("header", { style: {
                    backgroundColor: '#ffffff',
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                    padding: `${spacing.sm} ${spacing.lg}`,
                    minHeight: '68px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    columnGap: spacing.md,
                    rowGap: spacing.sm,
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: spacing.md,
                            minWidth: 0,
                        }, children: [_jsxs(Link, { to: "/", style: {
                                    textDecoration: 'none',
                                    fontWeight: 800,
                                    fontSize: '1.1875rem',
                                    letterSpacing: '-0.02em',
                                    color: colors.neutral[900],
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }, children: [_jsx("div", { style: {
                                            width: '24px',
                                            height: '24px',
                                            backgroundColor: colors.primary[700],
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                        }, children: _jsx(ShieldCheckIcon, { size: 16 }) }), _jsx("span", { children: "TalentSphere" })] }), _jsx("nav", { "aria-label": "Main Navigation", className: "desktop-nav", style: { display: 'flex', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' }, children: navLinks.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (_jsx(Link, { to: item.path, "data-testid": item.testId, style: {
                                            textDecoration: 'none',
                                            color: isActive ? colors.primary[800] : colors.neutral[700],
                                            fontWeight: isActive ? 700 : 500,
                                            fontSize: '0.875rem',
                                            padding: `${spacing.sm} ${spacing.md}`,
                                            borderRadius: '6px',
                                            backgroundColor: isActive ? colors.primary[50] : 'transparent',
                                            transition: `background-color ${motion.duration.fast} ${motion.easing.easeOut}, color ${motion.duration.fast} ${motion.easing.easeOut}`,
                                        }, children: item.label }, item.path));
                                }) }), _jsx("button", { type: "button", "data-testid": "mobile-menu-toggle", "aria-expanded": isMobileMenuOpen, "aria-controls": "mobile-navigation", "aria-label": isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu', onClick: () => setIsMobileMenuOpen((open) => !open), className: "mobile-menu-button", style: {
                                    display: 'none',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '44px',
                                    height: '44px',
                                    padding: 0,
                                    border: `1px solid ${colors.neutral[300]}`,
                                    borderRadius: '8px',
                                    backgroundColor: isMobileMenuOpen ? colors.primary[50] : '#ffffff',
                                    color: isMobileMenuOpen ? colors.primary[800] : colors.neutral[800],
                                    cursor: 'pointer',
                                }, children: isMobileMenuOpen ? _jsx(XIcon, { size: 20 }) : _jsx(MenuIcon, { size: 20 }) })] }), _jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: spacing.md,
                            minWidth: 0,
                        }, children: [_jsxs("div", { "data-testid": "pwa-status", title: pwaStatus.detail, style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    color: colors.neutral[700],
                                    backgroundColor: colors.neutral[100],
                                    border: `1px solid ${colors.neutral[300]}`,
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                }, children: [_jsx("span", { "aria-hidden": "true", "data-testid": `pwa-status-tone-${pwaStatus.tone}`, style: {
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: pwaStatus.tone === 'active'
                                                ? colors.semantic.success
                                                : pwaStatus.tone === 'pending'
                                                    ? colors.semantic.warning
                                                    : colors.neutral[400],
                                            display: 'inline-block',
                                        } }), _jsxs("span", { children: ["PWA ", pwaStatus.label] })] }), userEmail ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: spacing.sm }, children: [_jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: userEmail }), _jsx("button", { type: "button", onClick: () => {
                                            localStorage.removeItem('talentsphere_user');
                                            localStorage.removeItem('talentsphere_token');
                                            setUserEmail(null);
                                        }, style: {
                                            fontSize: '0.75rem',
                                            color: colors.neutral[600],
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                        }, children: "Sign Out" })] })) : (_jsx(Link, { to: "/login", "data-testid": "nav-login", style: {
                                    textDecoration: 'none',
                                    color: location.pathname === '/login' ? colors.primary[800] : colors.primary[700],
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    padding: '6px 14px',
                                    borderRadius: '4px',
                                    border: `1px solid ${colors.primary[300]}`,
                                    backgroundColor: location.pathname === '/login' ? colors.primary[50] : '#ffffff',
                                }, children: "Sign In" }))] })] }), isMobileMenuOpen && (_jsxs("nav", { id: "mobile-navigation", "aria-label": "Mobile Navigation", "data-testid": "mobile-menu", style: {
                    backgroundColor: '#ffffff',
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                    padding: spacing.md,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.xs,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }, children: [navLinks.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (_jsx(NavLink, { to: item.path, "data-testid": `mobile-nav-${item.path.replace('/', '')}`, style: {
                                textDecoration: 'none',
                                color: isActive ? colors.primary[800] : colors.neutral[800],
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '1rem',
                                padding: `${spacing.sm} ${spacing.md}`,
                                borderRadius: '8px',
                                backgroundColor: isActive ? colors.primary[50] : 'transparent',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                            }, children: item.label }, item.path));
                    }), _jsxs("div", { style: {
                            borderTop: `1px solid ${colors.neutral[200]}`,
                            marginTop: spacing.xs,
                            paddingTop: spacing.sm,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: spacing.xs,
                        }, children: [_jsx("a", { href: `mailto:${SUPPORT_EMAIL}`, "data-testid": "footer-email-mobile", style: {
                                    color: colors.primary[700],
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9375rem',
                                    padding: `${spacing.sm} ${spacing.md}`,
                                    minHeight: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }, children: SUPPORT_EMAIL }), _jsxs("a", { href: SUPPORT_PHONE_HREF, "data-testid": "footer-phone-mobile", style: {
                                    color: colors.primary[700],
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9375rem',
                                    padding: `${spacing.sm} ${spacing.md}`,
                                    minHeight: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }, children: [_jsx(PhoneIcon, { size: 16 }), " ", SUPPORT_PHONE] })] })] })), _jsx("main", { id: "main-content", tabIndex: -1, style: {
                    flex: 1,
                    padding: `${spacing.xl} ${spacing.lg}`,
                    maxWidth: '1200px',
                    margin: '0 auto',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                }, children: _jsx(Outlet, {}) }), _jsxs("footer", { style: {
                    borderTop: `1px solid ${colors.neutral[200]}`,
                    backgroundColor: '#ffffff',
                    padding: `${spacing['2xl']} ${spacing.xl} ${spacing.xl}`,
                    marginTop: 'auto',
                }, children: [_jsxs("div", { style: {
                            maxWidth: '1200px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: spacing.xl,
                            marginBottom: spacing.xl,
                        }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            color: colors.neutral[900],
                                            marginBottom: spacing.xs,
                                        }, children: "TalentSphere" }), _jsx("p", { style: {
                                            fontSize: '0.8125rem',
                                            color: colors.neutral[600],
                                            lineHeight: 1.6,
                                            margin: 0,
                                        }, children: "The cryptographic talent network. Grounding human capability in verifiable evidence, proctored benchmarks, and transparent matching." })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                            fontWeight: 700,
                                            fontSize: '0.8125rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: colors.neutral[600],
                                            marginBottom: spacing.sm,
                                        }, children: "Platform" }), _jsxs("ul", { style: {
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: spacing.xs,
                                            fontSize: '0.875rem',
                                        }, children: [_jsx("li", { children: _jsx(Link, { to: "/evidence", style: { color: colors.neutral[600], textDecoration: 'none' }, children: "Evidence Graph" }) }), _jsx("li", { children: _jsx(Link, { to: "/assessments", style: { color: colors.neutral[600], textDecoration: 'none' }, children: "Proctored Sandbox" }) }), _jsx("li", { children: _jsx(Link, { to: "/jobs", style: { color: colors.neutral[600], textDecoration: 'none' }, children: "Verifiable Opportunities" }) }), _jsx("li", { children: _jsx(Link, { to: "/checkout", style: { color: colors.neutral[600], textDecoration: 'none' }, children: "Plans & Pricing" }) })] })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                            fontWeight: 700,
                                            fontSize: '0.8125rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: colors.neutral[600],
                                            marginBottom: spacing.sm,
                                        }, children: "Trust & Governance" }), _jsxs("ul", { style: {
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: spacing.xs,
                                            fontSize: '0.875rem',
                                        }, children: [_jsx("li", { children: _jsx(Link, { to: "/privacy", style: { color: colors.neutral[600], textDecoration: 'none' }, children: "Privacy Policy (GDPR/CCPA)" }) }), _jsx("li", { children: _jsx(Link, { to: "/terms", style: { color: colors.neutral[600], textDecoration: 'none' }, children: "Terms & Integrity Standards" }) }), _jsx("li", { children: _jsx("span", { style: { color: colors.neutral[600], cursor: 'default' }, children: "Differential Privacy (k \u2265 10)" }) }), _jsx("li", { children: _jsx("span", { style: { color: colors.neutral[600], cursor: 'default' }, children: "Anti-LLM Scraping Safe" }) })] })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                            fontWeight: 700,
                                            fontSize: '0.8125rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: colors.neutral[600],
                                            marginBottom: spacing.sm,
                                        }, children: "Verification SLA" }), _jsx("p", { style: {
                                            fontSize: '0.8125rem',
                                            color: colors.neutral[600],
                                            lineHeight: 1.6,
                                            margin: 0,
                                        }, children: "All employer signature requests execute through cryptographically hashed challenge tokens. Disposable email domains strictly barred." })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                            fontWeight: 700,
                                            fontSize: '0.8125rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: colors.neutral[600],
                                            marginBottom: spacing.sm,
                                        }, children: "Support" }), _jsxs("ul", { style: {
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: spacing.xs,
                                            fontSize: '0.875rem',
                                        }, children: [_jsx("li", { children: _jsx("a", { href: `mailto:${SUPPORT_EMAIL}`, "data-testid": "footer-email", style: {
                                                        color: colors.primary[700],
                                                        textDecoration: 'underline',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        minHeight: '44px',
                                                    }, children: SUPPORT_EMAIL }) }), _jsx("li", { children: _jsxs("a", { href: SUPPORT_PHONE_HREF, "data-testid": "footer-phone", style: {
                                                        color: colors.primary[700],
                                                        textDecoration: 'underline',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        minHeight: '44px',
                                                    }, children: [_jsx(PhoneIcon, { size: 14 }), " ", SUPPORT_PHONE] }) }), _jsx("li", { style: { color: colors.neutral[600] }, children: "Mon\u2013Fri, 9:00\u201318:00 UTC" })] })] })] }), _jsxs("div", { style: {
                            maxWidth: '1200px',
                            margin: '0 auto',
                            borderTop: `1px solid ${colors.neutral[200]}`,
                            paddingTop: spacing.md,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: spacing.sm,
                            fontSize: '0.75rem',
                            color: colors.neutral[600],
                        }, children: [_jsx("div", { children: "TalentSphere \u00A9 2026. Cryptographically Verified Talent Network. All rights reserved." }), _jsxs("div", { style: { display: 'flex', gap: spacing.md }, children: [_jsx(Link, { to: "/privacy", style: { color: colors.neutral[600], textDecoration: 'underline' }, children: "Privacy" }), _jsx(Link, { to: "/terms", style: { color: colors.neutral[600], textDecoration: 'underline' }, children: "Terms" }), _jsx("span", { style: { color: colors.neutral[600] }, children: "SOC2 Type II Ready" })] })] })] })] }));
};
//# sourceMappingURL=Layout.js.map