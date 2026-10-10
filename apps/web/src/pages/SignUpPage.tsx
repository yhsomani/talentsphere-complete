import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { storeSession } from '../lib/session.js';
import { Button, Input, Notice } from '../components/ui/index.js';

type Role = 'candidate' | 'recruiter';

const ROLE_CHOICES: ReadonlyArray<{ value: Role; title: string; detail: string }> = [
  {
    value: 'candidate',
    title: 'I’m looking for work',
    detail: 'Build a verified work history and apply to jobs.',
  },
  {
    value: 'recruiter',
    title: 'I’m hiring',
    detail: 'Post jobs for your company and review applicants.',
  },
];

// Mirrors RegisterInputSchema (packages/contracts): the server is the
// authority, these checks only save a round trip.
const MIN_PASSWORD = 8;

export const SignUpPage: React.FC = () => {
  usePageMeta(
    'Create your account',
    'Create a TalentSphere account to build a verified work history or to hire.'
  );
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(
    params.get('role') === 'recruiter' ? 'recruiter' : 'candidate'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) {
      setError({ message: 'Enter your full name.', field: 'name' });
      return;
    }
    if (!email.includes('@')) {
      setError({ message: 'Enter a valid email address.', field: 'email' });
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError({
        message: `Use at least ${MIN_PASSWORD} characters for your password.`,
        field: 'password',
      });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      // Plain fetch: there is no session yet, so a 4xx here is about the
      // form, not an expired sign-in (see lib/api.ts).
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password, role }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.token) {
        const detail = body?.error?.details?.[0]?.message;
        setError({
          message:
            res.status === 409
              ? 'An account with this email already exists. Sign in instead.'
              : (detail ?? body?.error?.message ?? 'We could not create your account. Try again.'),
        });
        return;
      }
      storeSession(body.token, body.user);
      navigate(role === 'recruiter' ? '/hiring' : '/dashboard', { replace: true });
    } catch {
      setError({ message: 'Could not reach TalentSphere. Check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: `${spacing.xl} auto` }}>
      <h1 className="serif-display" style={{ fontSize: '2.25rem', fontWeight: 500 }}>
        Create your account
      </h1>
      <p style={{ color: colors.neutral[600], margin: `${spacing.sm} 0 ${spacing.lg}` }}>
        Already have one?{' '}
        <Link to="/login" style={{ color: colors.primary[700], fontWeight: 600 }}>
          Sign in
        </Link>
      </p>

      {error && !error.field && (
        <Notice tone="error" data-testid="signup-error" style={{ marginBottom: spacing.md }}>
          {error.message}
        </Notice>
      )}

      <form onSubmit={handleSubmit} data-testid="signup-form" noValidate>
        <fieldset style={{ border: 'none', padding: 0, margin: `0 0 ${spacing.lg}` }}>
          <legend
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: colors.neutral[800],
              marginBottom: spacing.sm,
            }}
          >
            What brings you here?
          </legend>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
              gap: spacing.sm,
            }}
          >
            {ROLE_CHOICES.map((choice) => {
              const selected = role === choice.value;
              return (
                <label
                  key={choice.value}
                  data-testid={`signup-role-${choice.value}`}
                  style={{
                    display: 'block',
                    padding: spacing.md,
                    borderRadius: '8px',
                    border: `2px solid ${selected ? colors.primary[600] : colors.neutral[200]}`,
                    backgroundColor: selected ? colors.primary[50] : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={choice.value}
                    checked={selected}
                    onChange={() => setRole(choice.value)}
                    style={{ marginRight: spacing.sm }}
                  />
                  <strong style={{ color: colors.neutral[900] }}>{choice.title}</strong>
                  <span
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      fontSize: '0.8125rem',
                      color: colors.neutral[600],
                    }}
                  >
                    {choice.detail}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <Input
          id="signup-name"
          label="Full name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={error?.field === 'name' ? error.message : undefined}
          data-testid="signup-name"
        />
        <Input
          id="signup-email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error?.field === 'email' ? error.message : undefined}
          data-testid="signup-email"
        />
        <Input
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          helperText={`At least ${MIN_PASSWORD} characters. A short phrase is easier to remember than symbols.`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error?.field === 'password' ? error.message : undefined}
          data-testid="signup-password"
        />
        <Button
          type="submit"
          loading={submitting}
          style={{ width: '100%' }}
          data-testid="signup-submit"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p style={{ fontSize: '0.75rem', color: colors.neutral[600], marginTop: spacing.md }}>
          By creating an account you agree to the <Link to="/terms">Terms</Link> and acknowledge the{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
};
