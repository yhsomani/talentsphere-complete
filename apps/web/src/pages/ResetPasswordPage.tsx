import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { clearSession } from '../lib/session.js';
import { Button, Input, Notice } from '../components/ui/index.js';
import { authCardStyle } from './ForgotPasswordPage.js';

/**
 * Choose a new password from an emailed link, /reset-password#token=…  The
 * token lives in the URL fragment, which browsers never send to a server
 * (as on the reference page). Resetting ends every session, so the person
 * signs in again with the new password.
 */
export const ResetPasswordPage: React.FC = () => {
  usePageMeta('Choose a new password', 'Set a new password for your TalentSphere account.');
  const token = useMemo(
    () => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '',
    []
  );
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [linkProblem, setLinkProblem] = useState<string | null>(
    token ? null : 'This reset link is incomplete. Open the link from the email again.'
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ next?: string; confirm?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    const errors: typeof fieldErrors = {};
    if (next.length < 8) errors.next = 'Use at least 8 characters.';
    if (confirm !== next) errors.confirm = 'The two passwords do not match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setBusy(true);
    try {
      await apiJson('/api/v1/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: next }),
      });
      // Every session ended, including any in this browser.
      clearSession();
      setDone(true);
    } catch (err) {
      const field =
        err instanceof ApiError
          ? (err.details as { field?: string } | undefined)?.field
          : undefined;
      if (field === 'token') setLinkProblem(errorMessage(err));
      else if (field === 'newPassword') setFieldErrors({ next: errorMessage(err) });
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const linkStyle = { color: colors.primary[700], fontWeight: 600 };
  return (
    <div style={authCardStyle}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.neutral[900] }}>
        Choose a new password
      </h1>
      {done ? (
        <Notice tone="success" data-testid="reset-done" style={{ margin: `${spacing.md} 0` }}>
          Password reset. You have been signed out everywhere.{' '}
          <Link to="/login" data-testid="reset-sign-in" style={linkStyle}>
            Sign in with your new password
          </Link>
          .
        </Notice>
      ) : linkProblem ? (
        <Notice tone="error" data-testid="reset-link-problem" style={{ margin: `${spacing.md} 0` }}>
          {linkProblem}{' '}
          <Link to="/forgot-password" style={linkStyle}>
            Ask for a new link
          </Link>
          .
        </Notice>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          data-testid="reset-form"
          style={{ marginTop: spacing.md }}
        >
          {error && (
            <Notice tone="error" data-testid="reset-error" style={{ marginBottom: spacing.md }}>
              {error}
            </Notice>
          )}
          <Input
            id="reset-new"
            label="New password"
            type="password"
            autoComplete="new-password"
            helperText="At least 8 characters. This signs you out on every device."
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={fieldErrors.next}
            data-testid="reset-new"
          />
          <Input
            id="reset-confirm"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={fieldErrors.confirm}
            data-testid="reset-confirm"
          />
          <Button type="submit" loading={busy} data-testid="reset-submit" style={{ width: '100%' }}>
            Set new password
          </Button>
        </form>
      )}
    </div>
  );
};
