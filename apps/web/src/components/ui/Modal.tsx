import React, { useEffect } from 'react';
import { colors, spacing } from '@talentsphere/ui';
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

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = '540px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
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
              padding: '4px',
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
