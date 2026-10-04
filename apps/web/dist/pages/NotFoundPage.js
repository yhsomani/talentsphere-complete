import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { colors, spacing, typography } from '@talentsphere/ui';
import { Button, SearchXIcon, ShieldCheckIcon } from '../components/ui/index.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
/**
 * 404 Not Found page.
 *
 * Rendered for any unmatched route (see App.tsx catch-all). It keeps users in
 * the product with clear next steps instead of a dead browser error.
 */
export const NotFoundPage = () => {
    usePageMeta('Page Not Found', 'The page you are looking for on TalentSphere could not be found. Return to the dashboard, browse verified opportunities, or contact support.');
    return (_jsxs("div", { style: {
            maxWidth: '640px',
            margin: `${spacing['3xl']} auto`,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing.md,
            padding: `0 ${spacing.md}`,
        }, children: [_jsx("div", { "aria-hidden": "true", style: {
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: colors.neutral[100],
                    color: colors.neutral[500],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }, children: _jsx(SearchXIcon, { size: 34 }) }), _jsx("p", { style: {
                    fontSize: '4rem',
                    fontWeight: typography.fontWeight.extrabold,
                    color: colors.primary[700],
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                }, children: "404" }), _jsx("h1", { style: {
                    fontSize: typography.fontSize['3xl'],
                    fontWeight: typography.fontWeight.extrabold,
                    color: colors.neutral[900],
                    letterSpacing: typography.letterSpacing.tight,
                }, children: "Page Not Found" }), _jsx("p", { style: {
                    fontSize: typography.fontSize.base,
                    color: colors.neutral[600],
                    lineHeight: typography.lineHeight.relaxed,
                    maxWidth: '48ch',
                }, children: "The page you are looking for doesn\u2019t exist or may have moved. Your verified evidence and credentials are safe \u2014 pick a destination below to get back on track." }), _jsxs("div", { style: {
                    display: 'flex',
                    gap: spacing.md,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: spacing.sm,
                }, children: [_jsx(Link, { to: "/", style: { textDecoration: 'none' }, children: _jsx(Button, { variant: "outline", "data-testid": "not-found-home", children: "Back to Home" }) }), _jsx(Link, { to: "/dashboard", style: { textDecoration: 'none' }, children: _jsxs(Button, { "data-testid": "not-found-dashboard", children: [_jsx(ShieldCheckIcon, { size: 16 }), " Career Cockpit"] }) }), _jsx(Link, { to: "/jobs", style: { textDecoration: 'none' }, children: _jsx(Button, { variant: "ghost", "data-testid": "not-found-jobs", children: "Browse Opportunities" }) })] }), _jsxs("p", { style: { fontSize: typography.fontSize.sm, color: colors.neutral[600] }, children: ["Need help?", ' ', _jsx("a", { href: "mailto:support@talentsphere.io", style: { color: colors.primary[700], fontWeight: 600 }, children: "support@talentsphere.io" })] })] }));
};
//# sourceMappingURL=NotFoundPage.js.map