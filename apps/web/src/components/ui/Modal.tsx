import React, { useEffect, useRef } from 'react';
import { colors, spacing, motion } from '@talentsphere/ui';
import { XIcon } from './Icons.js';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Canonical modal. Entrances use the shared keyframes in global.css only —
 * no ad-hoc animation values. Backdrop is a flat scrim (no glassmorphism):
 * its job is to separate layers, not to decorate. Focus moves into the panel
 * on open and returns to the previously focused element on close, so keyboard
 * users are never stranded. Tab cycles inside the panel while open — without
 * that, aria-modal would be a lie and focus would disappear behind the
 * backdrop. Reduced motion is honoured globally by the CSS kill-switch.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = '540px',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      // The panel itself is programmatically focused on open; from there the
      // browser's default Tab would leave the dialog, so both edges wrap.
      const atStart = active === panel || active === first || !panel.contains(active);
      const atEnd = active === panel || active === last || !panel.contains(active);
      if (e.shiftKey ? atStart : atEnd) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
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
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      previous?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        animation: `modal-backdrop-in ${motion.duration.fast} ${motion.easing.easeOut} both`,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{
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
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: `${spacing.md} ${spacing.lg}`,
            borderBottom: `1px solid ${colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              id="modal-title"
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: colors.neutral[900],
                margin: 0,
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                style={{
                  fontSize: '0.8125rem',
                  color: colors.neutral[500],
                  margin: `${spacing.xs} 0 0`,
                }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.neutral[400],
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: spacing.lg, overflowY: 'auto' }}>{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: colors.neutral[50],
              borderTop: `1px solid ${colors.neutral[200]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: spacing.sm,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
