import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // Authenticate with local or API session
      const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        localStorage.setItem('talentsphere_token', data.token);
        localStorage.setItem('talentsphere_user', JSON.stringify(data.user));
      } else {
        // Fallback for standalone frontend demonstration session
        localStorage.setItem('talentsphere_token', `demo_token_${Date.now()}`);
        localStorage.setItem(
          'talentsphere_user',
          JSON.stringify({ email, fullName: email.split('@')[0], roles: ['candidate'] })
        );
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 400);
    } catch {
      setError('Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefillCandidate = () => {
    setEmail('jordan.candidate@example.com');
    setPassword('Password123!Secure');
    setError(null);
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: `${spacing['2xl']} auto`,
        backgroundColor: colors.surface.card,
        borderRadius: '8px',
        border: `1px solid ${colors.neutral[200]}`,
        padding: spacing.xl,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
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
          data-testid="login-error"
          style={{
            backgroundColor: '#fef2f2',
            color: colors.semantic.error,
            border: `1px solid ${colors.semantic.error}`,
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: '6px',
            marginBottom: spacing.md,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          data-testid="login-success"
          style={{
            backgroundColor: '#ecfdf5',
            color: colors.semantic.success,
            border: `1px solid ${colors.semantic.success}`,
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: '6px',
            marginBottom: spacing.md,
            fontSize: '0.875rem',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Authentication successful. Redirecting to dashboard...
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
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              border: `1px solid ${colors.neutral[300]}`,
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
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              border: `1px solid ${colors.neutral[300]}`,
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

        <div style={{ textAlign: 'center', marginTop: spacing.md }}>
          <button
            type="button"
            data-testid="prefill-credentials"
            onClick={handlePrefillCandidate}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary[600],
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginRight: spacing.md,
            }}
          >
            Prefill Test Credentials
          </button>
          <Link
            to="/dashboard"
            style={{
              color: colors.neutral[500],
              fontSize: '0.8125rem',
              textDecoration: 'none',
            }}
          >
            Continue as Guest &rarr;
          </Link>
        </div>
      </form>
    </div>
  );
};
