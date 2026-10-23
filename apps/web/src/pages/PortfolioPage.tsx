import React, { useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { safeHref } from '../lib/format.js';
import {
  Button,
  Card,
  CardContent,
  Input,
  Notice,
  PageHeader,
  Select,
  TextArea,
  LoadError,
} from '../components/ui/index.js';

type Visibility = 'public' | 'connections_only' | 'recruiters_only' | 'private';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
  visibility: Visibility;
  featured: boolean;
  createdAt: string;
}

const VISIBILITY_OPTIONS: ReadonlyArray<{ value: Visibility; label: string }> = [
  { value: 'public', label: 'Anyone' },
  { value: 'connections_only', label: 'Only my connections' },
  { value: 'recruiters_only', label: 'Only people hiring on TalentSphere' },
  { value: 'private', label: 'Only me' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  projectUrl: '',
  repoUrl: '',
  visibility: 'public' as Visibility,
  featured: false,
};

export const PortfolioPage: React.FC = () => {
  usePageMeta('Portfolio', 'Show the work you have done, with links people can open.');
  const [projects, setProjects] = useState<PortfolioProject[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiJson<{ projects: PortfolioProject[] }>('/api/v1/portfolio/projects')
      .then(({ projects: list }) => {
        if (active) setProjects(list);
      })
      .catch((err) => {
        if (active) setLoadError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCreated(null);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setCreated(null);
    // Optional links are sent only when filled in, so the API's URL check
    // never sees an empty string.
    const body: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim(),
      visibility: form.visibility,
      featured: form.featured,
    };
    if (form.projectUrl.trim()) body.projectUrl = form.projectUrl.trim();
    if (form.repoUrl.trim()) body.repoUrl = form.repoUrl.trim();
    setBusy(true);
    try {
      const { project } = await apiJson<{ project: PortfolioProject }>(
        '/api/v1/portfolio/projects',
        { method: 'POST', body: JSON.stringify(body) }
      );
      setProjects((current) => [project, ...(current ?? [])]);
      setForm(EMPTY_FORM);
      setCreated(`Added "${project.title}".`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Portfolio"
        intro="Show the work you have done. Each project can link to a live demo or a repository."
      />
      {/* shortcut: this module keeps data in server memory, a restart clears it, upgrade when moved to durable storage */}
      <Notice tone="info" style={{ marginBottom: spacing.lg }} data-testid="ephemeral-notice">
        This page is not saved permanently yet. A server restart clears your projects.
      </Notice>

      <Card style={{ marginBottom: spacing.lg }}>
        <CardContent style={{ padding: spacing.lg }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>Add a project</h2>
          {error && (
            <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="portfolio-error">
              {error}
            </Notice>
          )}
          {created && (
            <Notice
              tone="success"
              style={{ marginBottom: spacing.md }}
              data-testid="portfolio-created"
            >
              {created}
            </Notice>
          )}
          <form onSubmit={create} noValidate>
            <Input
              id="portfolio-title"
              label="Project title"
              value={form.title}
              maxLength={200}
              onChange={(e) => set('title', e.target.value)}
              data-testid="portfolio-title"
            />
            <TextArea
              id="portfolio-description"
              label="What you built and what you did"
              helperText="At least 10 characters."
              value={form.description}
              maxLength={10000}
              rows={4}
              onChange={(e) => set('description', e.target.value)}
              data-testid="portfolio-description"
            />
            <Input
              id="portfolio-project-url"
              label="Live link (optional)"
              type="url"
              value={form.projectUrl}
              onChange={(e) => set('projectUrl', e.target.value)}
              data-testid="portfolio-project-url"
            />
            <Input
              id="portfolio-repo-url"
              label="Repository link (optional)"
              type="url"
              value={form.repoUrl}
              onChange={(e) => set('repoUrl', e.target.value)}
              data-testid="portfolio-repo-url"
            />
            <Select
              id="portfolio-visibility"
              label="Who can see this project"
              value={form.visibility}
              onChange={(e) => set('visibility', e.target.value as Visibility)}
              options={VISIBILITY_OPTIONS}
              data-testid="portfolio-visibility"
            />
            <label
              htmlFor="portfolio-featured"
              style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.md }}
            >
              <input
                id="portfolio-featured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              Feature this project at the top of my profile
            </label>
            <Button type="submit" loading={busy} data-testid="portfolio-add">
              Add project
            </Button>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="portfolio-list-heading">
        <h2 id="portfolio-list-heading" style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>
          Your projects
        </h2>
        {loadError && <LoadError message={loadError} />}
        {!loadError && projects === null && <p role="status">Loading your projects.</p>}
        {projects?.length === 0 && (
          <p style={{ color: colors.neutral[700] }} data-testid="portfolio-empty">
            No projects yet. Add one above.
          </p>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="portfolio-list">
          {projects?.map((project) => (
            <li key={project.id} style={{ marginBottom: spacing.md }}>
              <Card>
                <CardContent style={{ padding: spacing.lg }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {project.title}
                    {project.featured && (
                      <span
                        style={{
                          marginLeft: spacing.sm,
                          color: colors.neutral[700],
                          fontSize: '0.875rem',
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </h3>
                  <p style={{ marginTop: spacing.xs }}>{project.description}</p>
                  <p
                    style={{
                      marginTop: spacing.xs,
                      color: colors.neutral[700],
                      fontSize: '0.875rem',
                    }}
                  >
                    Visible to:{' '}
                    {VISIBILITY_OPTIONS.find((o) => o.value === project.visibility)?.label}
                  </p>
                  {(safeHref(project.projectUrl) || safeHref(project.repoUrl)) && (
                    <p style={{ marginTop: spacing.xs, display: 'flex', gap: spacing.md }}>
                      {safeHref(project.projectUrl) && (
                        <a
                          href={safeHref(project.projectUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live link
                        </a>
                      )}
                      {safeHref(project.repoUrl) && (
                        <a
                          href={safeHref(project.repoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Repository
                        </a>
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
