import React, { useCallback, useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { apiJson, errorMessage } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import { Button, Card, CardContent, Input, LoadError, Notice } from './ui/index.js';

interface PathNode {
  targetRole: string;
  transitionProbability: number;
  confidenceInterval: { lower: number; upper: number };
  medianTimeMonths: number;
  sampleCount: number;
}

interface Pathway {
  originRole: string;
  totalHistoricalTransitions: number;
  pathways: PathNode[];
}

const pct = (share: number) => Math.round(share * 100);

/**
 * Where people go next (F-85): of the people in our data who moved on from a role, how many
 * went where. It is a share of recorded moves, not the chance that you will make one, and
 * a destination with fewer than 20 recorded moves is never shown (BR-160).
 */
export const CareerPaths: React.FC = () => {
  const session = useSession();
  const userId = session.user?.id;
  const [role, setRole] = useState('');
  const [known, setKnown] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Pathway | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [benchmarks, history] = await Promise.all([
        apiJson<{ benchmarks: { fromRole: string }[] }>('/api/v1/career/benchmarks'),
        apiJson<{ workHistories: { title: string; isCurrent?: boolean; startDate: string }[] }>(
          `/api/v1/candidates/${userId}/work-history`
        ),
      ]);
      setKnown([...new Set(benchmarks.benchmarks.map((b) => b.fromRole))]);
      // Start from the role they hold now (or held last), so the common case is one click.
      const roles = [...history.workHistories].sort(
        (a, b) => Number(b.isCurrent ?? false) - Number(a.isCurrent ?? false) ||
          b.startDate.localeCompare(a.startDate)
      );
      setRole((current) => current || roles[0]?.title || '');
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const show = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!role.trim()) {
      setError('Enter the role you hold now.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { pathway } = await apiJson<{ pathway: Pathway }>(
        `/api/v1/career/pathways?originRole=${encodeURIComponent(role.trim())}`
      );
      setResult(pathway);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ marginTop: spacing.lg }} data-testid="career-paths">
      <CardContent style={{ padding: spacing.lg }}>
        <h2 style={{ fontSize: '1.125rem' }}>Where people go next</h2>
        <p style={{ color: colors.neutral[700], margin: `${spacing.xs} 0 ${spacing.md}` }}>
          Moves that people chose to share, grouped by the role they left.
        </p>
        {loadError && <LoadError message={loadError} onRetry={() => void load()} />}
        <form onSubmit={show} noValidate>
          <Input
            id="career-origin"
            label="Your current role"
            value={role}
            list="career-known-roles"
            onChange={(e) => setRole(e.target.value)}
            data-testid="career-origin"
          />
          <datalist id="career-known-roles">
            {known.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
          {error && (
            <Notice tone="error" style={{ margin: `${spacing.md} 0` }} data-testid="paths-error">
              {error}
            </Notice>
          )}
          <Button type="submit" loading={busy} style={{ marginTop: spacing.md }} data-testid="paths-submit">
            Show where people go
          </Button>
        </form>

        {result && result.pathways.length === 0 && (
          <p style={{ marginTop: spacing.md }} data-testid="paths-none">
            Not enough shared moves from “{result.originRole}” to show figures yet. A move is
            shown once at least 20 people have made it.
          </p>
        )}
        {result && result.pathways.length > 0 && (
          <>
            <ul style={{ listStyle: 'none', padding: 0, margin: `${spacing.md} 0 0` }} data-testid="paths-list">
              {result.pathways.map((p) => (
                <li
                  key={p.targetRole}
                  data-testid="path-item"
                  style={{ padding: `${spacing.sm} 0`, borderTop: `1px solid ${colors.neutral[200]}` }}
                >
                  <strong>{p.targetRole}</strong>
                  <div data-testid="path-share">
                    {pct(p.transitionProbability)}% of people who moved on from {result.originRole}{' '}
                    went here (likely range {pct(p.confidenceInterval.lower)}–
                    {pct(p.confidenceInterval.upper)}%)
                  </div>
                  <div style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                    Based on {p.sampleCount} people. They typically moved after about{' '}
                    {Math.round(p.medianTimeMonths)} months in the role.
                  </div>
                </li>
              ))}
            </ul>
            <p style={{ color: colors.neutral[700], fontSize: '0.875rem', marginTop: spacing.md }}>
              This describes what others did, not what will happen to you. People who share their
              moves are not a random sample.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
