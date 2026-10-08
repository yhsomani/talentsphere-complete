import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { storeSession } from '../lib/session.js';

// Resume only same-origin in-app paths from ?return=. This rejects absolute
// URLs (https://evil.example) and protocol-relative ones (//evil.example),
// so the login redirect can never leave the site.
const resolveReturnPath = (value: string | null): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';

type LoginError = { message: string; field?: 'email' | 'password' };

export const LoginPage: React.FC = () => {
  usePageMeta(
    'Sign In',
    'Sign in to TalentSphere to access your verified career graph, proctored assessments, and evidence-based job matches.'
  );

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<LoginError | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim() || !email.includes('@')) {
      setError({ message: 'Please enter a valid email address.', field: 'email' });
      return;
    }
    if (!password || password.length < 6) {
      setError({ message: 'Password must be at least 6 characters.', field: 'password' });
      return;
    }

    setLoading(true);

    try {
      // Plain fetch on purpose: here a 401 means "wrong credentials", not
      // "dead session" (see lib/api.ts apiFetch).
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError({
          message: body?.error?.message ?? 'Failed to sign in. Please verify your credentials.',
        });
        return;
      }

      const data = await res.json();
      if (!data?.token) {
        setError({ message: 'Failed to sign in. Please verify your credentials.' });
        return;
      }
      storeSession(data.token, data.user);

      setSuccess(true);
      setTimeout(() => {
        // ?return= (from a guarded deep link) decides the destination;
        // without it, sign-in lands on the dashboard as before.
        navigate(resolveReturnPath(searchParams.get('return')), { replace: true });
      }, 400);
    } catch {
      setError({ message: 'Failed to sign in. Please verify your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: `${spacing['2xl']} auto`,
        backgroundColor: colors.surface.card,
        borderRadius: '12px',
        border: `1px solid ${colors.neutral[200]}`,
        padding: spacing['2xl'],
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: spacing.lg }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: colors.neutral[900],
            marginBottom: spacing.xs,
          }}
        >
          Sign In to TalentSphere
        </h1>
        <p style={{ color: colors.neutral[600], fontSize: '0.875rem' }}>
          Access your verified career graph, assessments, and applications.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          id="login-error"
          data-testid="login-error"
          style={{
            backgroundColor: '#fef2f2',
            color: colors.semantic.errorText,
            border: `1px solid ${colors.semantic.error}`,
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: '6px',
            marginBottom: spacing.md,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {error.message}
        </div>
      )}

      {success && (
        <div
          role="status"
          data-testid="login-success"
          style={{
            backgroundColor: '#ecfdf5',
            color: colors.semantic.successText,
            border: `1px solid ${colors.semantic.success}`,
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: '6px',
            marginBottom: spacing.md,
            fontSize: '0.875rem',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Authentication successful. Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} data-testid="login-form">
        <div style={{ marginBottom: spacing.md }}>
          <label
            htmlFor="login-email"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.neutral[700],
              marginBottom: spacing.xs,
            }}
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            required
            data-testid="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={error?.field === 'email' || undefined}
            aria-describedby={error?.field === 'email' ? 'login-error' : undefined}
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              border: `1px solid ${error?.field === 'email' ? colors.semantic.error : colors.neutral[300]}`,
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: spacing.lg }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.xs,
            }}
          >
            <label
              htmlFor="login-password"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: colors.neutral[700],
              }}
            >
              Password
            </label>
          </div>
          <input
            id="login-password"
            type="password"
            name="password"
            required
            data-testid="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={error?.field === 'password' || undefined}
            aria-describedby={error?.field === 'password' ? 'login-error' : undefined}
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              border: `1px solid ${error?.field === 'password' ? colors.semantic.error : colors.neutral[300]}`,
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          data-testid="login-submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: colors.primary[600],
            color: '#ffffff',
            padding: `${spacing.sm} ${spacing.md}`,
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: spacing.md,
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};
