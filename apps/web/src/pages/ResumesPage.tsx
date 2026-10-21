import React, { useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
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

type Template = 'modern' | 'minimal' | 'executive' | 'technical';

interface Resume {
  id: string;
  title: string;
  template: Template;
  headline?: string;
  updatedAt: string;
}

const TEMPLATE_OPTIONS: ReadonlyArray<{ value: Template; label: string }> = [
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'executive', label: 'Executive' },
  { value: 'technical', label: 'Technical' },
];

const EMPTY_FORM = {
  title: '',
  template: 'modern' as Template,
  headline: '',
  summary: '',
  contactEmail: '',
};

export const ResumesPage: React.FC = () => {
  usePageMeta('Resumes', 'Build a resume from your profile and the evidence you have.');
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiJson<{ resumes: Resume[] }>('/api/v1/resumes')
      .then(({ resumes: list }) => {
        if (active) setResumes(list);
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
    // Optional fields are sent only when filled, so the API's format checks
    // never see an empty string.
    const body: Record<string, unknown> = { template: form.template };
    if (form.title.trim()) body.title = form.title.trim();
    if (form.headline.trim()) body.headline = form.headline.trim();
    if (form.summary.trim()) body.summary = form.summary.trim();
    if (form.contactEmail.trim()) body.contactEmail = form.contactEmail.trim();
    setBusy(true);
    try {
      const { resume } = await apiJson<{ resume: Resume }>('/api/v1/resumes', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setResumes((current) => [resume, ...(current ?? [])]);
      setForm(EMPTY_FORM);
      setCreated(`Created "${resume.title}".`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Resumes"
        intro="Create a resume. You can change the details later, and each one keeps its own template."
      />
      {/* shortcut: this module keeps data in server memory, a restart clears it, upgrade when moved to durable storage */}
      <Notice tone="info" style={{ marginBottom: spacing.lg }} data-testid="ephemeral-notice">
        This page is not saved permanently yet. A server restart clears your resumes.
      </Notice>

      <Card style={{ marginBottom: spacing.lg }}>
        <CardContent style={{ padding: spacing.lg }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>New resume</h2>
          {error && (
            <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="resume-error">
              {error}
            </Notice>
          )}
          {created && (
            <Notice
              tone="success"
              style={{ marginBottom: spacing.md }}
              data-testid="resume-created"
            >
              {created}
            </Notice>
          )}
          <form onSubmit={create} noValidate>
            <Input
              id="resume-title"
              label="Resume title (optional)"
              value={form.title}
              maxLength={255}
              onChange={(e) => set('title', e.target.value)}
              data-testid="resume-title"
            />
            <Select
              id="resume-template"
              label="Template"
              value={form.template}
              onChange={(e) => set('template', e.target.value as Template)}
              options={TEMPLATE_OPTIONS}
              data-testid="resume-template"
            />
            <Input
              id="resume-headline"
              label="Headline (optional)"
              value={form.headline}
              maxLength={255}
              onChange={(e) => set('headline', e.target.value)}
              data-testid="resume-headline"
            />
            <TextArea
              id="resume-summary"
              label="Summary (optional)"
              value={form.summary}
              maxLength={5000}
              rows={4}
              onChange={(e) => set('summary', e.target.value)}
              data-testid="resume-summary"
            />
            <Input
              id="resume-contact-email"
              label="Contact email (optional)"
              type="email"
              value={form.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              data-testid="resume-contact-email"
            />
            <Button type="submit" loading={busy} data-testid="resume-create">
              Create resume
            </Button>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="resume-list-heading">
        <h2 id="resume-list-heading" style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>
          Your resumes
        </h2>
        {loadError && <LoadError message={loadError} />}
        {!loadError && resumes === null && <p role="status">Loading your resumes.</p>}
        {resumes?.length === 0 && (
          <p style={{ color: colors.neutral[700] }} data-testid="resume-empty">
            No resumes yet. Create one above.
          </p>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="resume-list">
          {resumes?.map((resume) => (
            <li key={resume.id} style={{ marginBottom: spacing.md }}>
              <Card>
                <CardContent style={{ padding: spacing.lg }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{resume.title}</h3>
                  {resume.headline && <p style={{ marginTop: spacing.xs }}>{resume.headline}</p>}
                  <p
                    style={{
                      marginTop: spacing.xs,
                      color: colors.neutral[700],
                      fontSize: '0.875rem',
                    }}
                  >
                    Template: {TEMPLATE_OPTIONS.find((o) => o.value === resume.template)?.label}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
