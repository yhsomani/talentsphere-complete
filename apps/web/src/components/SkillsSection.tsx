import React, { useCallback, useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { Link } from 'react-router-dom';
import { apiJson, errorMessage } from '../lib/api.js';
import { Button, Card, CardContent, LoadError, Notice, Select } from './ui/index.js';

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface FreshnessRecord {
  skillId: string;
  freshnessBand: string;
  verificationSource: string;
}

interface SkillGraph {
  prerequisites: Skill[];
  subskills: Skill[];
  correlations: Skill[];
}

interface MySkill {
  skill: Skill;
  band: string;
  source: string;
  graph: SkillGraph | null;
}

const label = (value: string) => value.replace(/_/g, ' ');

const GROUPS: ReadonlyArray<{ key: keyof SkillGraph; title: string }> = [
  { key: 'prerequisites', title: 'Learn first' },
  { key: 'subskills', title: 'Sub-skills' },
  { key: 'correlations', title: 'Often used with' },
];

/**
 * The candidate's skills with the skills related to each (F-84). Related skills come from the
 * taxonomy graph that platform admins curate; until one is defined the section says so.
 */
export const SkillsSection: React.FC = () => {
  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [mine, setMine] = useState<MySkill[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [skills, records] = await Promise.all([
        apiJson<{ skills: Skill[] }>('/api/v1/skills'),
        apiJson<{ records: FreshnessRecord[] }>('/api/v1/skills/freshness/my'),
      ]);
      const byId = new Map(skills.skills.map((s) => [s.id, s]));
      // shortcut: one graph request per skill; fine for a profile's worth of skills,
      // batch it server-side if candidates routinely list dozens.
      const graphs = await Promise.allSettled(
        records.records.map((r) =>
          apiJson<{ graph: SkillGraph }>(`/api/v1/skills/${r.skillId}/graph`)
        )
      );
      setCatalog(skills.skills);
      setMine(
        records.records.flatMap((r, i) => {
          const skill = byId.get(r.skillId);
          const g = graphs[i];
          return skill
            ? [
                {
                  skill,
                  band: r.freshnessBand,
                  source: r.verificationSource,
                  graph: g.status === 'fulfilled' ? g.value.graph : null,
                },
              ]
            : [];
        })
      );
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick || adding) return;
    setAdding(true);
    setAddError(null);
    try {
      await apiJson('/api/v1/skills/freshness', {
        method: 'POST',
        body: JSON.stringify({ skillId: pick, verificationSource: 'self_attestation' }),
      });
      setPick('');
      await load();
    } catch (err) {
      setAddError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const owned = new Set((mine ?? []).map((m) => m.skill.id));
  const options = [
    { value: '', label: 'Choose a skill' },
    ...catalog.filter((s) => !owned.has(s.id)).map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <Card style={{ marginTop: spacing['2xl'] }} data-testid="skills">
      <CardContent style={{ padding: spacing.lg }}>
        <h2 style={{ fontSize: '1.125rem' }}>Skills</h2>
        <p style={{ color: colors.neutral[700], margin: `${spacing.xs} 0 ${spacing.md}` }}>
          The skills you list, and the skills that go with each one.{' '}
          <Link to="/career">See how ready you are for a role.</Link>
        </p>
        {error && <LoadError message={error} onRetry={() => void load()} />}
        {!error && mine === null && <p role="status">Loading your skills.</p>}
        {mine?.length === 0 && (
          <p data-testid="skills-empty">You have not added any skills yet. Add one below.</p>
        )}
        {mine && mine.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="skills-list">
            {mine.map(({ skill, band, source, graph }) => {
              const groups = graph ? GROUPS.filter((g) => graph[g.key].length > 0) : [];
              return (
                <li
                  key={skill.id}
                  data-testid="skill-item"
                  style={{
                    padding: `${spacing.sm} 0`,
                    borderTop: `1px solid ${colors.neutral[200]}`,
                  }}
                >
                  <strong>{skill.name}</strong>{' '}
                  <span style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                    {skill.category} · {label(band)} · {label(source)}
                  </span>
                  {groups.length > 0 ? (
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: `${spacing.xs} 0 0`,
                        fontSize: '0.875rem',
                      }}
                      data-testid="skill-related"
                    >
                      {groups.map((g) => (
                        <li
                          key={g.key}
                        >{`${g.title}: ${graph![g.key].map((s) => s.name).join(', ')}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <div
                      style={{ color: colors.neutral[700], fontSize: '0.875rem' }}
                      data-testid="skill-no-related"
                    >
                      {graph
                        ? 'No related skills defined yet.'
                        : 'Related skills are unavailable right now.'}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {addError && (
          <Notice tone="error" style={{ marginTop: spacing.md }}>
            {addError}
          </Notice>
        )}
        {options.length > 1 && (
          <form
            onSubmit={addSkill}
            style={{
              display: 'flex',
              gap: spacing.sm,
              alignItems: 'flex-end',
              marginTop: spacing.md,
            }}
          >
            <Select
              id="skills-add"
              label="Add a skill"
              value={pick}
              options={options}
              onChange={(e) => setPick(e.target.value)}
              data-testid="skills-add"
            />
            <Button type="submit" variant="outline" loading={adding} disabled={!pick}>
              Add skill
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
