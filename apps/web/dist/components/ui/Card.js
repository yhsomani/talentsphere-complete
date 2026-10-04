import { jsx as _jsx } from "react/jsx-runtime";
import { colors, spacing } from '@talentsphere/ui';
export const Card = ({ children, elevated = false, style, ...props }) => (_jsx("div", { style: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: elevated ? '0 1px 3px 0 rgba(0, 0, 0, 0.05)' : 'none',
        overflow: 'hidden',
        ...style,
    }, ...props, children: children }));
export const CardHeader = ({ children, style, ...props }) => (_jsx("div", { style: {
        padding: `${spacing.md} ${spacing.lg}`,
        borderBottom: `1px solid ${colors.neutral[100]}`,
        ...style,
    }, ...props, children: children }));
export const CardTitle = ({ children, style, ...props }) => (_jsx("h2", { style: {
        fontSize: '1.125rem',
        fontWeight: 700,
        color: colors.neutral[900],
        margin: 0,
        lineHeight: 1.3,
        ...style,
    }, ...props, children: children }));
export const CardDescription = ({ children, style, ...props }) => (_jsx("p", { style: {
        fontSize: '0.8125rem',
        color: colors.neutral[500],
        margin: `${spacing.xs} 0 0`,
        lineHeight: 1.4,
        ...style,
    }, ...props, children: children }));
export const CardContent = ({ children, style, ...props }) => (_jsx("div", { style: {
        padding: spacing.lg,
        ...style,
    }, ...props, children: children }));
export const CardFooter = ({ children, style, ...props }) => (_jsx("div", { style: {
        padding: `${spacing.sm} ${spacing.lg}`,
        backgroundColor: colors.neutral[50],
        borderTop: `1px solid ${colors.neutral[200]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
    }, ...props, children: children }));
//# sourceMappingURL=Card.js.map