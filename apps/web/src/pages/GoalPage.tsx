import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { skillRungLabel } from '../lib/format.js';
import {
  Button,
  Card,
  CardContent,
  Input,
  LoadError,
  Notice,
  PageHeader,
} from '../components/ui/index.js';

// Mirrors GET /api/v1/goals/mine (plan TS-13, ADR-034).
interface GoalSkill {
  skillId: string;
  name: string | null;
  requiredBy: number;
  shown: boolean;
  strongestRung: string | null;
  sources: Array<{ sourceRef: string; title: string | null }>;
  nextStep: { kind: 'show' | 'verify'; produces: string } | null;
}
interface GoalView {
  goal: { title: string; createdAt: string; updatedAt: string } | null;
  plan: { matchingPostings: number; shown: number; verified: number; skills: GoalSkill[] } | null;
}

const sourceTitles = (skill: GoalSkill) =>
  skill.sources
    .map((s) => s.title ?? 'a record')
    .filter((title, i, all) => all.indexOf(title) === i)
    .join(', ');

/**
 * Career goal (TS-13, §6.5): name the role you want, see the skills live
 * postings for it ask for, how you meet each, and one next step per skill.
 */
export const GoalPage: React.FC = () => {
  usePageMeta('Your goal', 'Pick a target role and see the skills to show for it.');
  const [view, setView] = useState<GoalView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await apiJson<GoalView>('/api/v1/goals/mine');
      setView(res);
      setTitle(res.goal?.title ?? '');
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setView(
        await apiJson<GoalView>('/api/v1/goals/mine', {
          method: 'PUT',
          body: JSON.stringify({ title: title.trim() }),
        })
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiJson('/api/v1/goals/mine', { method: 'DELETE' });
      setView({ goal: null, plan: null });
      setTitle('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const plan = view?.plan;
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <PageHeader
        title="Your goal"
        intro="Name the role you are aiming for. We look at the open postings for it, list the skills they ask for, and show how your evidence meets each one. Only you see your goal."
      />
      {loadError && <LoadError message={loadError} onRetry={() => void load()} />}
      {!loadError && !view && <p role="status">Loading your goal.</p>}
      {view && (
        <Card>
          <CardContent style={{ padding: spacing.lg }}>
            <form onSubmit={save} data-testid="goal-form">
              <Input
                label="Target role"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                helperText="For example: Data Engineer"
                data-testid="goal-title"
              />
              <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  type="submit"
                  disabled={busy || title.trim().length < 2}
                  data-testid="goal-save"
                >
                  {view.goal ? 'Update goal' : 'Set goal'}
                </Button>
                {view.goal && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void clear()}
                    disabled={busy}
                    data-testid="goal-clear"
                  >
                    Clear goal
                  </Button>
                )}
              </div>
            </form>
            {error && (
              <Notice tone="error" style={{ marginTop: spacing.md }} data-testid="goal-error">
                {error}
              </Notice>
            )}
          </CardContent>
        </Card>
      )}

      {view?.goal && plan && (
        <section
          aria-labelledby="goal-plan-heading"
          style={{ marginTop: spacing.xl }}
          data-testid="goal-plan"
        >
          <h2 id="goal-plan-heading" style={{ fontSize: '1.125rem' }}>
            What {view.goal.title} postings ask for
          </h2>
          {plan.matchingPostings === 0 ? (
            <p
              style={{ color: colors.neutral[700], marginTop: spacing.sm }}
              data-testid="goal-no-postings"
            >
              No open postings match this role yet, so there is nothing to compare. Try a broader
              title, or check back when more roles are posted.
            </p>
          ) : (
            <>
              <p
                style={{ color: colors.neutral[700], marginTop: spacing.xs }}
                data-testid="goal-summary"
              >
                From {plan.matchingPostings} open{' '}
                {plan.matchingPostings === 1 ? 'posting' : 'postings'}. You’ve shown {plan.shown} of{' '}
                {plan.skills.length} skills
                {plan.verified > 0 ? `, ${plan.verified} verified by someone else` : ''}.
              </p>
              <ul style={{ padding: 0, listStyle: 'none', marginTop: spacing.sm }}>
                {plan.skills.map((skill) => (
                  <li
                    key={skill.skillId}
                    data-testid="goal-skill"
                    style={{
                      padding: `${spacing.sm} 0`,
                      borderTop: `1px solid ${colors.neutral[200]}`,
                    }}
                  >
                    <strong>{skill.name ?? 'Skill'}</strong>{' '}
                    <span style={{ color: colors.neutral[600] }}>
                      (asked for by {skill.requiredBy} of {plan.matchingPostings})
                    </span>
                    <p style={{ color: colors.neutral[700], marginTop: '4px' }}>
                      {skill.shown && skill.strongestRung
                        ? `Shown, ${skillRungLabel(skill.strongestRung)}, from ${sourceTitles(skill)}.`
                        : 'Not shown yet.'}
                    </p>
                    <p style={{ marginTop: '4px' }} data-testid="goal-step">
                      {skill.nextStep?.kind === 'show' && (
                        <>
                          Next:{' '}
                          <Link
                            className="action-link"
                            to="/evidence"
                            style={{ color: colors.primary[700] }}
                          >
                            add evidence that shows it
                          </Link>
                          . It counts as self-reported until someone checks it.
                        </>
                      )}
                      {skill.nextStep?.kind === 'verify' &&
                        'Next: ask a colleague who worked with you, or your institution, to review that evidence, so it counts as checked by someone else.'}
                      {!skill.nextStep && 'Done: checked by someone else.'}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
};
