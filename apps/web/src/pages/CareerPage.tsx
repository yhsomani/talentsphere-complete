import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { yearsOfExperience, type WorkRole } from '../lib/career.js';
import { useSession } from '../lib/SessionContext.js';
import {
  Button,
  Card,
  CardContent,
  LoadError,
  Notice,
  PageHeader,
  Select,
} from '../components/ui/index.js';

interface Milestone {
  title: string;
  type: string;
  estimatedWeeks: number;
  priority: string;
}

interface Readiness {
  targetRole: string;
  overallReadinessScore: number;
  skillsOverlapPct: number;
  experienceReadinessPct: number;
  educationReadinessPct: number;
  requiredSkills: string[];
  missingPrerequisites: string[];
  recommendedMilestones: Milestone[];
}

// The roles the scorer has skill requirements for; any other title gets generic requirements.
const ROLES = [
  'Senior Software Engineer',
  'Staff Engineer',
  'Principal Architect',
  'Engineering Manager',
  'Lead Data Scientist',
];

const EDUCATION = [
  { value: '', label: 'Choose your highest education' },
  { value: 'none', label: 'No formal qualification' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'associate', label: 'Associate degree' },
  { value: 'bachelor', label: 'Bachelor’s degree' },
  { value: 'master', label: 'Master’s degree' },
  { value: 'doctorate', label: 'Doctorate' },
];

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/**
 * Career readiness (F-91): pick a target role and see how ready you are, with the missing
 * milestones. Skills and years of experience come from the candidate's own profile, so the
 * result reflects what they have listed, not evidence anyone has verified.
 */
export const CareerPage: React.FC = () => {
  usePageMeta('Career readiness', 'See how ready you are for a target role and what is missing.');
  const session = useSession();
  const userId = session.user?.id;
  const [skills, setSkills] = useState<string[] | null>(null);
  const [years, setYears] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [role, setRole] = useState(ROLES[0]);
  const [education, setEducation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Readiness | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [catalog, mine, history] = await Promise.all([
        apiJson<{ skills: { id: string; name: string }[] }>('/api/v1/skills'),
        apiJson<{ records: { skillId: string }[] }>('/api/v1/skills/freshness/my'),
        apiJson<{ workHistories: WorkRole[] }>(`/api/v1/candidates/${userId}/work-history`),
      ]);
      const names = new Map(catalog.skills.map((s) => [s.id, s.name]));
      setSkills(mine.records.flatMap((r) => (names.has(r.skillId) ? [names.get(r.skillId)!] : [])));
      setYears(yearsOfExperience(history.workHistories));
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !skills) return;
    if (!education) {
      setError('Choose your highest education first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { readiness } = await apiJson<{ readiness: Readiness }>(
        '/api/v1/career/milestones/readiness',
        {
          method: 'POST',
          body: JSON.stringify({
            targetRole: role,
            candidateSkills: skills,
            yearsOfExperience: Math.min(50, years),
            educationLevel: education,
          }),
        }
      );
      setResult(readiness);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const milestones = [...(result?.recommendedMilestones ?? [])].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  );

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }} data-testid="career-page">
      <PageHeader
        title="Career readiness"
        intro="Pick a role you are aiming for and see how close you are."
      />
      {loadError && <LoadError message={loadError} onRetry={() => void load()} />}
      {!loadError && skills === null && <p role="status">Loading your profile.</p>}

      {skills?.length === 0 && (
        <Notice tone="info" data-testid="career-no-skills" style={{ marginBottom: spacing.md }}>
          Add at least one skill to your profile first, so there is something to compare.{' '}
          <Link to="/profile">Go to your profile</Link>
        </Notice>
      )}

      {skills && skills.length > 0 && (
        <Card style={{ marginBottom: spacing.lg }}>
          <CardContent style={{ padding: spacing.lg }}>
            <p
              style={{ color: colors.neutral[700], marginBottom: spacing.md }}
              data-testid="career-basis"
            >
              Based on {skills.length} {skills.length === 1 ? 'skill' : 'skills'} and about {years}{' '}
              {years === 1 ? 'year' : 'years'} of experience from your profile.
            </p>
            <form onSubmit={check} noValidate>
              <Select
                id="career-role"
                label="Target role"
                value={role}
                options={ROLES.map((r) => ({ value: r, label: r }))}
                onChange={(e) => setRole(e.target.value)}
                data-testid="career-role"
              />
              <Select
                id="career-education"
                label="Highest education"
                value={education}
                options={EDUCATION}
                onChange={(e) => setEducation(e.target.value)}
                data-testid="career-education"
              />
              {error && (
                <Notice
                  tone="error"
                  style={{ margin: `${spacing.md} 0` }}
                  data-testid="career-error"
                >
                  {error}
                </Notice>
              )}
              <Button type="submit" loading={busy} data-testid="career-submit">
                Check readiness
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card data-testid="career-result">
          <CardContent style={{ padding: spacing.lg }}>
            <h2 style={{ fontSize: '1.125rem' }}>{result.targetRole}</h2>
            <p style={{ fontSize: '2rem', margin: `${spacing.xs} 0` }} data-testid="career-score">
              {result.overallReadinessScore} out of 100
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }} data-testid="career-breakdown">
              <li>Skills match: {Math.round(result.skillsOverlapPct)}% (counts for 50%)</li>
              <li>Experience: {Math.round(result.experienceReadinessPct)}% (counts for 35%)</li>
              <li>Education: {Math.round(result.educationReadinessPct)}% (counts for 15%)</li>
            </ul>

            <h3 style={{ fontSize: '1rem', marginTop: spacing.md }}>Skills this role asks for</h3>
            <p data-testid="career-skills-line">
              {result.requiredSkills.length - result.missingPrerequisites.length} of{' '}
              {result.requiredSkills.length} covered.
              {result.missingPrerequisites.length > 0 && (
                <>
                  {' '}
                  Missing:{' '}
                  <span data-testid="career-missing">{result.missingPrerequisites.join(', ')}</span>
                </>
              )}
            </p>

            <h3 style={{ fontSize: '1rem', marginTop: spacing.md }}>What to work on</h3>
            {milestones.length === 0 ? (
              <p data-testid="career-no-milestones">
                Nothing missing. You meet what this role asks for.
              </p>
            ) : (
              <ol data-testid="career-milestones">
                {milestones.map((m) => (
                  <li key={m.title}>
                    {m.title}{' '}
                    <span style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                      ({m.priority} priority, about {m.estimatedWeeks} weeks)
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <p style={{ color: colors.neutral[700], fontSize: '0.875rem', marginTop: spacing.md }}>
              This compares what you have listed on your profile with TalentSphere’s default
              requirements for the role. Nothing here is verified, and it is a guide, not a promise.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
