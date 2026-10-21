import React, { useCallback, useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import {
  Button,
  Card,
  CardContent,
  LoadError,
  Notice,
  PageHeader,
  Select,
  TextArea,
} from '../components/ui/index.js';

interface PublicTestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  timeLimitMs: number;
  policyMode: string;
  publicTestCases: PublicTestCase[];
}

interface AssessmentSession {
  id: string;
  timeLimitSeconds: number;
}

interface SubmitResponse {
  evidence?: { id: string };
  xpEarned: number;
}

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
];

/**
 * Challenges (F-08): start a timed session, write a solution, submit it. The platform does
 * not run submitted code yet, so a submission is saved as unverified evidence and is not
 * scored. This page says so instead of showing the API's placeholder pass/score.
 */
export const AssessmentsPage: React.FC = () => {
  usePageMeta(
    'Challenges',
    'Coding challenges. Submitted solutions are saved but not run or scored yet.'
  );
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [active, setActive] = useState<{ challenge: Challenge; session: AssessmentSession } | null>(
    null
  );
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SubmitResponse | null>(null);

  const load = useCallback(async () => {
    try {
      setChallenges((await apiJson<{ challenges: Challenge[] }>('/api/v1/challenges')).challenges);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const start = async (challenge: Challenge) => {
    if (busy) return;
    setBusy(challenge.id);
    setError(null);
    setSaved(null);
    try {
      const { session } = await apiJson<{ session: AssessmentSession }>(
        `/api/v1/challenges/${challenge.id}/start-session`,
        { method: 'POST' }
      );
      setCode('');
      setActive({ challenge, session });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || busy) return;
    if (!code.trim()) {
      setError('Write your solution before submitting.');
      return;
    }
    setBusy(active.challenge.id);
    setError(null);
    try {
      const result = await apiJson<SubmitResponse>(
        `/api/v1/challenges/${active.challenge.id}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ sessionId: active.session.id, language, code }),
        }
      );
      setSaved(result);
      setActive(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: spacing['3xl'] }}>
      <PageHeader title="Challenges" intro="Coding challenges you can take in a timed session." />
      <Notice tone="info" style={{ marginBottom: spacing.lg }} data-testid="challenges-notice">
        Submitted code is not run yet. Your solution is saved as unverified evidence and is not
        scored.
      </Notice>

      {error && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="challenge-error">
          {error}
        </Notice>
      )}
      {saved && (
        <Notice tone="success" style={{ marginBottom: spacing.md }} data-testid="challenge-saved">
          Solution saved. It was not run, so it has no score and counts as unverified evidence.
          {saved.xpEarned > 0 ? ` You earned ${saved.xpEarned} XP.` : ''}
        </Notice>
      )}

      {active ? (
        <Card data-testid="challenge-session">
          <CardContent style={{ padding: spacing.lg }}>
            <h2 className="serif-display" style={{ fontSize: '1.375rem' }}>
              {active.challenge.title}
            </h2>
            <p style={{ marginTop: spacing.xs }}>{active.challenge.description}</p>
            <p style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
              Session time limit: {Math.round(active.session.timeLimitSeconds / 60)} minutes.
              {active.challenge.policyMode === 'AI_PROHIBITED'
                ? ' AI assistance is turned off while this session is open.'
                : ''}
            </p>
            {active.challenge.publicTestCases.length > 0 && (
              <>
                <h3 style={{ fontSize: '1rem', marginTop: spacing.md }}>Examples</h3>
                <ul data-testid="challenge-examples">
                  {active.challenge.publicTestCases.map((tc) => (
                    <li key={tc.id}>
                      Input <code>{tc.input}</code> gives <code>{tc.expectedOutput}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <form onSubmit={submit} noValidate style={{ marginTop: spacing.md }}>
              <Select
                id="challenge-language"
                label="Language"
                value={language}
                options={LANGUAGES}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <TextArea
                id="challenge-code"
                label="Your solution"
                rows={12}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}
                data-testid="challenge-code"
              />
              <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  type="submit"
                  loading={busy === active.challenge.id}
                  data-testid="challenge-submit"
                >
                  Submit solution
                </Button>
                <Button type="button" variant="outline" onClick={() => setActive(null)}>
                  Leave session
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {loadError && <LoadError message={loadError} onRetry={() => void load()} />}
          {!loadError && challenges === null && <p role="status">Loading challenges.</p>}
          {challenges?.length === 0 && <p data-testid="challenges-empty">No challenges yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="challenge-list">
            {challenges?.map((c) => (
              <li
                key={c.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: spacing.md,
                  alignItems: 'center',
                  padding: `${spacing.lg} 0`,
                  borderTop: `1px solid ${colors.neutral[300]}`,
                }}
              >
                <div>
                  <h2 className="serif-display" style={{ fontSize: '1.25rem' }}>
                    {c.title}
                  </h2>
                  <p style={{ marginTop: spacing.xs }}>{c.description}</p>
                  <p style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                    {c.difficulty}, {c.category}
                  </p>
                </div>
                <Button
                  loading={busy === c.id}
                  onClick={() => void start(c)}
                  data-testid="challenge-start"
                >
                  Start session
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
