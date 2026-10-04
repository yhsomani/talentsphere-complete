import React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
}
/**
 * Canonical modal. Entrances use the shared keyframes in global.css only —
 * no ad-hoc animation values. Backdrop is a flat scrim (no glassmorphism):
 * its job is to separate layers, not to decorate. Focus moves into the panel
 * on open and returns to the previously focused element on close, so keyboard
 * users are never stranded. Reduced motion is honoured globally by the CSS
 * kill-switch, which zeroes these entrance animations.
 */
export declare const Modal: React.FC<ModalProps>;
//# sourceMappingURL=Modal.d.ts.map