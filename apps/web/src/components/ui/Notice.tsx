import React from 'react';
import { colors, spacing } from '@talentsphere/ui';

export type NoticeTone = 'error' | 'success' | 'info' | 'warning';

const TONES: Record<NoticeTone, { bg: string; fg: string; border: string }> = {
  error: { bg: '#fef2f2', fg: colors.semantic.errorText, border: colors.semantic.error },
  success: { bg: '#ecfdf5', fg: colors.semantic.successText, border: colors.semantic.success },
  info: { bg: colors.primary[50], fg: colors.semantic.infoText, border: colors.primary[200] },
  warning: { bg: '#fffbeb', fg: colors.semantic.warningText, border: colors.semantic.warning },
};

export interface NoticeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: NoticeTone;
  children: React.ReactNode;
}

/**
 * Inline message box. Errors are announced assertively (role="alert");
 * everything else politely (role="status"), so screen-reader users hear the
 * outcome of an action without having to hunt for it.
 */
export const Notice: React.FC<NoticeProps> = ({ tone = 'info', children, style, ...props }) => {
  const t = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      style={{
        backgroundColor: t.bg,
        color: t.fg,
        border: `1px solid ${t.border}`,
        padding: `${spacing.sm} ${spacing.md}`,
        borderRadius: '6px',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
