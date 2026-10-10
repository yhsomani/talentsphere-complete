import React from 'react';
import { colors } from '@talentsphere/ui';
import { applicationStatusLabel, jobStatusLabel } from '../../lib/format.js';

type Tone = 'neutral' | 'progress' | 'good' | 'bad' | 'muted';

const TONE_STYLE: Record<Tone, React.CSSProperties> = {
  neutral: { backgroundColor: colors.neutral[100], color: colors.neutral[800] },
  progress: { backgroundColor: colors.primary[50], color: colors.primary[800] },
  good: { backgroundColor: '#ecfdf5', color: colors.semantic.successText },
  bad: { backgroundColor: '#fef2f2', color: colors.semantic.errorText },
  muted: { backgroundColor: colors.neutral[100], color: colors.neutral[600] },
};

const APPLICATION_TONE: Record<string, Tone> = {
  submitted: 'neutral',
  in_review: 'progress',
  shortlisted: 'progress',
  interviewing: 'progress',
  offered: 'good',
  hired: 'good',
  rejected: 'bad',
  withdrawn: 'muted',
  expired: 'muted',
};

const JOB_TONE: Record<string, Tone> = {
  draft: 'muted',
  published: 'good',
  paused: 'neutral',
  closed: 'muted',
  archived: 'muted',
};

/** Status shown in words (never colour alone), consistent on both sides of hiring. */
export const StatusPill: React.FC<{
  kind: 'application' | 'job';
  status: string;
  'data-testid'?: string;
}> = ({ kind, status, ...rest }) => {
  const tone = (kind === 'application' ? APPLICATION_TONE : JOB_TONE)[status] ?? 'neutral';
  const label = kind === 'application' ? applicationStatusLabel(status) : jobStatusLabel(status);
  return (
    <span
      data-testid={rest['data-testid']}
      style={{
        ...TONE_STYLE[tone],
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};
