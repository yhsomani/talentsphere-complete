import React, { useState } from 'react';
import { spacing } from '@talentsphere/ui';
import { apiJson, errorMessage } from '../lib/api.js';
import { getStoredUser, storeSession } from '../lib/session.js';
import { Button, Notice } from './ui/index.js';

/**
 * Sign out of every other device without changing the password. The server
 * refuses every earlier session; this device gets a fresh token and stays
 * signed in.
 */
export const SignOutOtherDevices: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setDone(false);
    setError(null);
    try {
      const res = await apiJson<{ token: string }>('/api/v1/auth/sign-out-others', {
        method: 'POST',
      });
      const user = getStoredUser();
      if (user) storeSession(res.token, user);
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="sign-out-others">
      {done && (
        <Notice
          tone="success"
          style={{ marginBottom: spacing.md }}
          data-testid="sign-out-others-done"
        >
          Signed out of every other device. This one stays signed in.
        </Notice>
      )}
      {error && (
        <Notice
          tone="error"
          style={{ marginBottom: spacing.md }}
          data-testid="sign-out-others-error"
        >
          {error}
        </Notice>
      )}
      <Button
        variant="outline"
        loading={busy}
        onClick={() => void run()}
        data-testid="sign-out-others-submit"
      >
        {busy ? 'Signing out…' : 'Sign out of other devices'}
      </Button>
    </div>
  );
};
