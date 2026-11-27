import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { Button, Input, Notice } from '../components/ui/index.js';

export const authCardStyle: React.CSSProperties = {
  maxWidth: '440px',
  margin: `${spacing['2xl']} auto`,
  backgroundColor: colors.surface.card,
  borderRadius: '4px',
  border: `1px solid ${colors.neutral[200]}`,
  padding: spacing['2xl'],
};

/**
 * Ask for a password reset link (ADR-019). The answer is the same whether or
 * not an account uses the email, so the page says what will happen if one
 * does, never whether one does.
 */
export const ForgotPasswordPage: React.FC = () => {
  usePageMeta('Reset your password', 'Get a link to choose a new TalentSphere password.');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError('Enter the email address you sign in with.');
      return;
    }
    setBusy(true);
    try {
      const data = await apiJson<{ message: string }>('/api/v1/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(data.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={authCardStyle}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.neutral[900] }}>
        Reset your password
      </h1>
      <p style={{ color: colors.neutral[600], fontSize: '0.875rem', marginBottom: spacing.lg }}>
        Enter the email you sign in with. We will email you a link to choose a new password.
      </p>
      {sent ? (
        <Notice tone="success" data-testid="forgot-sent" style={{ marginBottom: spacing.md }}>
          {sent}
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate data-testid="forgot-form">
          {error && (
            <Notice tone="error" data-testid="forgot-error" style={{ marginBottom: spacing.md }}>
              {error}
            </Notice>
          )}
          <Input
            id="forgot-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="forgot-email"
          />
          <Button
            type="submit"
            loading={busy}
            data-testid="forgot-submit"
            style={{ width: '100%' }}
          >
            Email me a reset link
          </Button>
        </form>
      )}
      <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: spacing.md }}>
        <Link to="/login" style={{ color: colors.primary[700], fontWeight: 600 }}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
};
