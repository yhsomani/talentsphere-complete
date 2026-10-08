import React from 'react';
import { colors, spacing, typography } from '@talentsphere/ui';
import { ButtonLink, SearchXIcon, ShieldCheckIcon } from '../components/ui/index.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

/**
 * 404 Not Found page.
 *
 * Rendered for any unmatched route (see App.tsx catch-all). It keeps users in
 * the product with clear next steps instead of a dead browser error.
 */
export const NotFoundPage: React.FC = () => {
  usePageMeta(
    'Page Not Found',
    'The page you are looking for on TalentSphere could not be found. Return to the dashboard, browse verified opportunities, or contact support.'
  );

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: `${spacing['3xl']} auto`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing.md,
        padding: `0 ${spacing.md}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: colors.neutral[100],
          color: colors.neutral[500],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchXIcon size={34} />
      </div>

      <p
        style={{
          fontSize: '4rem',
          fontWeight: typography.fontWeight.extrabold,
          color: colors.primary[700],
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        404
      </p>

      <h1
        style={{
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.extrabold,
          color: colors.neutral[900],
          letterSpacing: typography.letterSpacing.tight,
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.neutral[600],
          lineHeight: typography.lineHeight.relaxed,
          maxWidth: '48ch',
        }}
      >
        The page you are looking for doesn&rsquo;t exist or may have moved. Your verified evidence
        and credentials are safe — pick a destination below to get back on track.
      </p>

      <div
        style={{
          display: 'flex',
          gap: spacing.md,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: spacing.sm,
        }}
      >
        <ButtonLink to="/" variant="outline" data-testid="not-found-home">
          Back to Home
        </ButtonLink>
        <ButtonLink to="/dashboard" data-testid="not-found-dashboard">
          <ShieldCheckIcon size={16} /> Dashboard
        </ButtonLink>
        <ButtonLink to="/jobs" variant="ghost" data-testid="not-found-jobs">
          Browse Opportunities
        </ButtonLink>
      </div>

      <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600] }}>
        Need help?{' '}
        <a
          href="mailto:support@talentsphere.io"
          style={{ color: colors.primary[700], fontWeight: 600 }}
        >
          support@talentsphere.io
        </a>
      </p>
    </div>
  );
};
