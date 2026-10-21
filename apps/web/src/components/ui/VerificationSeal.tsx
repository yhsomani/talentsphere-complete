import React from 'react';
import { colors } from '@talentsphere/ui';

/**
 * How a role was confirmed. The ring's drawing is the answer, so a reader can
 * tell the proof apart without reading the label: dashed = not confirmed,
 * single = confirmed by work email, double = also vouched for by a manager.
 */
export type VerificationState = 'unverified' | 'work-email' | 'reference';

const LABEL: Record<VerificationState, string> = {
  unverified: 'Not confirmed yet',
  'work-email': 'Confirmed with work email',
  reference: 'Vouched for by a manager',
};

/** Server badge tier (packages/domain work-history-graph) to the seal drawn for it. */
export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold';

export const sealStateFor = (tier: BadgeTier): VerificationState =>
  tier === 'none' ? 'unverified' : tier === 'bronze' ? 'work-email' : 'reference';

export const TIER_LABEL: Record<BadgeTier, string> = {
  none: 'Unverified',
  bronze: 'Bronze tier',
  silver: 'Silver tier',
  gold: 'Gold tier',
};

export interface VerificationSealProps {
  state: VerificationState;
  size?: number;
}

export const VerificationSeal: React.FC<VerificationSealProps> = ({ state, size = 28 }) => {
  const stroke = state === 'unverified' ? colors.neutral[500] : colors.primary[700];
  const ring = (r: number, dashed = false) => (
    <circle
      cx="14"
      cy="14"
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth="1.75"
      strokeDasharray={dashed ? '3 2.5' : undefined}
    />
  );

  return (
    <svg
      role="img"
      aria-label={LABEL[state]}
      width={size}
      height={size}
      viewBox="0 0 28 28"
      style={{ flex: 'none', display: 'block' }}
    >
      {state === 'unverified' && ring(11.5, true)}
      {state === 'work-email' && ring(11.5)}
      {state === 'reference' && (
        <>
          {ring(11.5)}
          {ring(7.5)}
        </>
      )}
    </svg>
  );
};
