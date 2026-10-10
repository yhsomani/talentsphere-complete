import React, { useState } from 'react';
import { spacing } from '@talentsphere/ui';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { getStoredUser, storeSession } from '../lib/session.js';
import { Button, Input, Notice } from './ui/index.js';

/**
 * Change password. The server ends every other session; this device gets a
 * fresh token and stays signed in.
 */
export const ChangePasswordForm: React.FC = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setDone(false);
    setError(null);
    const errors: typeof fieldErrors = {};
    if (!current) errors.current = 'Enter your current password.';
    if (next.length < 8) errors.next = 'Use at least 8 characters.';
    else if (next === current) errors.next = 'Choose a password different from the current one.';
    if (confirm !== next) errors.confirm = 'The two new passwords do not match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    try {
      const res = await apiJson<{ token: string }>('/api/v1/auth/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const user = getStoredUser();
      if (user) storeSession(res.token, user);
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    } catch (err) {
      const field =
        err instanceof ApiError
          ? (err.details as { field?: string } | undefined)?.field
          : undefined;
      if (field === 'currentPassword') setFieldErrors({ current: errorMessage(err) });
      else if (field === 'newPassword') setFieldErrors({ next: errorMessage(err) });
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate data-testid="password-form" style={{ maxWidth: '420px' }}>
      {done && (
        <Notice tone="success" style={{ marginBottom: spacing.md }} data-testid="password-changed">
          Password changed. You have been signed out on every other device.
        </Notice>
      )}
      {error && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="password-error">
          {error}
        </Notice>
      )}
      <Input
        id="password-current"
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        error={fieldErrors.current}
        data-testid="password-current"
      />
      <Input
        id="password-new"
        label="New password"
        type="password"
        autoComplete="new-password"
        helperText="At least 8 characters."
        value={next}
        onChange={(e) => setNext(e.target.value)}
        error={fieldErrors.next}
        data-testid="password-new"
      />
      <Input
        id="password-confirm"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={fieldErrors.confirm}
        data-testid="password-confirm"
      />
      <Button type="submit" variant="outline" loading={busy} data-testid="password-submit">
        Change password
      </Button>
    </form>
  );
};
