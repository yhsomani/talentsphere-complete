import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { colors, spacing, motion } from '@talentsphere/ui';
/**
 * Canonical input. Focus/hover styling is declarative (React state), never
 * imperative DOM mutation. Error text uses the AA-safe semantic tone so the
 * message is readable, not just red. The focus ring mirrors Button's so the
 * form surfaces share one interaction language.
 */
export const Input = ({ label, helperText, error, id, required, style, onFocus, onBlur, ...props }) => {
    const [focused, setFocused] = useState(false);
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = generatedId ? `${generatedId}-error` : undefined;
    const helperId = generatedId ? `${generatedId}-helper` : undefined;
    return (_jsxs("div", { style: { marginBottom: spacing.md, width: '100%' }, children: [label && (_jsxs("label", { htmlFor: generatedId, style: {
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: colors.neutral[800],
                    marginBottom: spacing.xs,
                }, children: [label, " ", required && _jsx("span", { style: { color: colors.semantic.errorText }, children: "*" })] })), _jsx("input", { id: generatedId, required: required, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : helperText ? helperId : undefined, style: {
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${focused
                        ? error
                            ? colors.semantic.errorText
                            : colors.primary[600]
                        : error
                            ? colors.semantic.error
                            : colors.neutral[300]}`,
                    boxShadow: focused
                        ? `0 0 0 3px ${error ? '#fee2e2' : colors.primary[100]}`
                        : 'none',
                    fontSize: '0.875rem',
                    color: colors.neutral[900],
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: `border-color ${motion.duration.fast} ${motion.easing.easeOut}, box-shadow ${motion.duration.fast} ${motion.easing.easeOut}`,
                    ...style,
                }, onFocus: (e) => {
                    setFocused(true);
                    onFocus?.(e);
                }, onBlur: (e) => {
                    setFocused(false);
                    onBlur?.(e);
                }, ...props }), error && (_jsx("p", { id: errorId, role: "alert", style: {
                    fontSize: '0.75rem',
                    color: colors.semantic.errorText,
                    margin: `${spacing.xs} 0 0`,
                    fontWeight: 500,
                }, children: error })), !error && helperText && (_jsx("p", { id: helperId, style: {
                    fontSize: '0.75rem',
                    color: colors.neutral[600],
                    margin: `${spacing.xs} 0 0`,
                }, children: helperText }))] }));
};
//# sourceMappingURL=Input.js.map