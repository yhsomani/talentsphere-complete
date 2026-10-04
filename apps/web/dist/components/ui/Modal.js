import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { colors, spacing, motion } from '@talentsphere/ui';
import { XIcon } from './Icons.js';
/**
 * Canonical modal. Entrances use the shared keyframes in global.css only —
 * no ad-hoc animation values. Backdrop is a flat scrim (no glassmorphism):
 * its job is to separate layers, not to decorate. Focus moves into the panel
 * on open and returns to the previously focused element on close, so keyboard
 * users are never stranded. Reduced motion is honoured globally by the CSS
 * kill-switch, which zeroes these entrance animations.
 */
export const Modal = ({ isOpen, onClose, title, description, children, footer, maxWidth = '540px', }) => {
    const panelRef = useRef(null);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    // Focus management: move focus into the dialog on open, restore on close.
    useEffect(() => {
        if (!isOpen)
            return;
        const previous = document.activeElement;
        panelRef.current?.focus();
        return () => {
            previous?.focus?.();
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (_jsx("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", style: {
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            animation: `modal-backdrop-in ${motion.duration.fast} ${motion.easing.easeOut} both`,
        }, onClick: (e) => {
            if (e.target === e.currentTarget)
                onClose();
        }, children: _jsxs("div", { ref: panelRef, tabIndex: -1, style: {
                width: '100%',
                maxWidth,
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: `1px solid ${colors.neutral[300]}`,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                outline: 'none',
                // One-shot entrance (fill-mode "both" holds the final state).
                animation: `modal-panel-in ${motion.duration.normal} ${motion.easing.easeOut} both`,
            }, children: [_jsxs("div", { style: {
                        padding: `${spacing.md} ${spacing.lg}`,
                        borderBottom: `1px solid ${colors.neutral[200]}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                    }, children: [_jsxs("div", { children: [_jsx("h2", { id: "modal-title", style: {
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: colors.neutral[900],
                                        margin: 0,
                                    }, children: title }), description && (_jsx("p", { style: {
                                        fontSize: '0.8125rem',
                                        color: colors.neutral[500],
                                        margin: `${spacing.xs} 0 0`,
                                    }, children: description }))] }), _jsx("button", { type: "button", "aria-label": "Close modal", onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: colors.neutral[400],
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }, children: _jsx(XIcon, { size: 18 }) })] }), _jsx("div", { style: { padding: spacing.lg, overflowY: 'auto' }, children: children }), footer && (_jsx("div", { style: {
                        padding: `${spacing.md} ${spacing.lg}`,
                        backgroundColor: colors.neutral[50],
                        borderTop: `1px solid ${colors.neutral[200]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: spacing.sm,
                    }, children: footer }))] }) }));
};
//# sourceMappingURL=Modal.js.map