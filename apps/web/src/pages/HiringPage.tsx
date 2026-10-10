import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import { formatDate } from '../lib/format.js';
import {
  ACTIVE_APPLICATION_STATUSES,
  JOB_TRANSITIONS,
  type Job,
  type Skill,
} from '../lib/types.js';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Modal,
  Notice,
  PageHeader,
  Select,
  StatusPill,
  TextArea,
} from '../components/ui/index.js';

interface Organization {
  id: string;
  name: string;
  slug: string;
  website?: string;
  description?: string;
  membershipRole: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];
const JOB_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map((c) => ({ value: c, label: c }));

/** Status changes offered as buttons, in the words a hiring team uses. */
const JOB_ACTIONS: ReadonlyArray<{ to: string; label: string }> = [
  { to: 'published', label: 'Publish' },
  { to: 'paused', label: 'Pause' },
  { to: 'closed', label: 'Close' },
];

const CreateOrganization: React.FC<{ onCreated: () => Promise<void> }> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    const finalSlug = slug || slugify(name);
    if (name.trim().length < 2 || finalSlug.length < 2) {
      setError('Enter your company name.');
      return;
    }
    setBusy(true);
    try {
      await apiJson('/api/v1/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          slug: finalSlug,
          ...(website.trim() ? { website: website.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
        }),
      });
      await onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? `The handle “${finalSlug}” is already taken. Choose another.`
          : errorMessage(err)
      );
      if (err instanceof ApiError && err.status === 409) setSlugEdited(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: '640px' }}>
      <CardContent style={{ padding: spacing.lg }}>
        <h2 style={{ fontSize: '1.25rem' }}>Set up your company</h2>
        <p style={{ color: colors.neutral[600], margin: `${spacing.xs} 0 ${spacing.lg}` }}>
          Jobs are posted on behalf of a company. You become its owner and can post right away.
        </p>
        {error && (
          <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="org-error">
            {error}
          </Notice>
        )}
        <form onSubmit={submit} data-testid="org-form" noValidate>
          <Input
            id="org-name"
            label="Company name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
            data-testid="org-name"
          />
          <Input
            id="org-slug"
            label="Company handle"
            helperText="Lowercase letters, numbers and hyphens. Used in links to your company."
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(slugify(e.target.value));
            }}
            data-testid="org-slug"
          />
          <Input
            id="org-website"
            label="Website (optional)"
            type="url"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <TextArea
            id="org-description"
            label="What does the company do? (optional)"
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" loading={busy} data-testid="org-submit">
            Create company
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const JobForm: React.FC<{
  orgId: string;
  skills: Skill[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}> = ({ orgId, skills, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('remote');
  const [jobType, setJobType] = useState('full_time');
  const [description, setDescription] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [publishNow, setPublishNow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    setError(null);
    if (title.trim().length < 3) return setError('Give the job a title of at least 3 characters.');
    if (location.trim().length < 2)
      return setError('Add a location (a city, a region or “Remote”).');
    if (description.trim().length < 10)
      return setError('Describe the role in at least a sentence.');
    const min = salaryMin ? Math.round(Number(salaryMin) * 100) : undefined;
    const max = salaryMax ? Math.round(Number(salaryMax) * 100) : undefined;
    if ((min === undefined) !== (max === undefined)) {
      return setError('Give both ends of the salary range, or leave both empty.');
    }
    if (
      min !== undefined &&
      max !== undefined &&
      (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min)
    ) {
      return setError('The salary range must be two positive numbers, lowest first.');
    }

    inFlight.current = true;
    setBusy(true);
    try {
      const created = await apiJson<{ job: Job }>('/api/v1/jobs', {
        method: 'POST',
        body: JSON.stringify({
          orgId,
          title: title.trim(),
          location: location.trim(),
          workMode,
          jobType,
          description: description.trim(),
          ...(skillIds.length ? { requiredSkillIds: skillIds } : {}),
          ...(min !== undefined && max !== undefined
            ? { salaryMinMinor: min, salaryMaxMinor: max, currency }
            : {}),
        }),
      });
      if (publishNow) {
        await apiJson(`/api/v1/jobs/${created.job.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'published' }),
        }).catch((err) => {
          // The draft exists; say exactly what did not happen.
          throw new Error(`Saved as a draft, but publishing failed: ${errorMessage(err)}`);
        });
      }
      await onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      // A draft may exist now; refresh so the list is truthful either way.
      await onSaved().catch(() => undefined);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} busy={busy} title="Post a job" maxWidth="640px">
      {error && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="job-form-error">
          {error}
        </Notice>
      )}
      <form onSubmit={submit} data-testid="job-form" noValidate>
        <Input
          id="job-title"
          label="Job title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="job-title"
        />
        <Input
          id="job-location"
          label="Location"
          required
          placeholder="e.g. Berlin, or Remote (EU time zones)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          data-testid="job-location"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: spacing.md,
          }}
        >
          <Select
            id="job-work-mode"
            label="Work mode"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            options={WORK_MODES}
          />
          <Select
            id="job-type"
            label="Employment type"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            options={JOB_TYPES}
          />
        </div>
        <TextArea
          id="job-description"
          label="Description"
          required
          rows={8}
          maxLength={10000}
          helperText="What the person will do, what you need from them, and how you work."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="job-description"
        />
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: spacing.xs }}>
            Yearly salary range (optional)
          </legend>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
              gap: spacing.md,
            }}
          >
            <Input
              id="job-salary-min"
              label="From"
              type="number"
              min={0}
              inputMode="numeric"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
            <Input
              id="job-salary-max"
              label="To"
              type="number"
              min={0}
              inputMode="numeric"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
            <Select
              id="job-currency"
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={CURRENCIES}
            />
          </div>
        </fieldset>
        {skills.length > 0 && (
          <fieldset style={{ border: 'none', padding: 0, margin: `0 0 ${spacing.md}` }}>
            <legend style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: spacing.xs }}>
              Skills (optional)
            </legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
              {skills.map((skill) => (
                <label
                  key={skill.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}
                >
                  <input
                    type="checkbox"
                    checked={skillIds.includes(skill.id)}
                    onChange={(e) =>
                      setSkillIds((current) =>
                        e.target.checked
                          ? [...current, skill.id]
                          : current.filter((s) => s !== skill.id)
                      )
                    }
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.875rem',
            marginBottom: spacing.lg,
          }}
        >
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(e) => setPublishNow(e.target.checked)}
            data-testid="job-publish-now"
          />
          Publish now (otherwise it is saved as a draft only your team can see)
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy} data-testid="job-submit">
            {publishNow ? 'Publish job' : 'Save draft'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const HiringPage: React.FC = () => {
  usePageMeta('Hiring', 'Post jobs for your company and review the people who apply.');
  const session = useSession();
  const [params, setParams] = useSearchParams();
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const selectedOrg = orgs?.find((o) => o.id === params.get('org')) ?? orgs?.[0];
  const selectedOrgId = selectedOrg?.id;

  const loadOrgs = useCallback(async () => {
    try {
      const res = await apiJson<{ organizations: Organization[] }>('/api/v1/organizations/mine');
      setOrgs(res.organizations);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const loadJobs = useCallback(async () => {
    if (!selectedOrgId) return;
    try {
      const res = await apiJson<{ jobs: Job[] }>(`/api/v1/organizations/${selectedOrgId}/jobs`);
      setJobs(res.jobs);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [selectedOrgId]);

  useEffect(() => {
    void loadOrgs();
    apiJson<{ skills: Skill[] }>('/api/v1/skills')
      .then((res) => setSkills(res.skills))
      .catch(() => undefined);
  }, [loadOrgs]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const changeStatus = async (job: Job, to: string) => {
    if (statusBusy) return;
    setStatusBusy(job.id);
    setStatusError(null);
    try {
      await apiJson(`/api/v1/jobs/${job.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: to }),
      });
      await loadJobs();
    } catch (err) {
      setStatusError(`${job.title}: ${errorMessage(err)}`);
    } finally {
      setStatusBusy(null);
    }
  };

  if (session.status === 'ready' && !session.isRecruiter) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <PageHeader title="Hiring" />
        <Notice tone="info">
          Hiring tools are for hiring accounts. Your account is set up to find work —{' '}
          <Link to="/jobs">browse jobs</Link> instead.
        </Notice>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title={selectedOrg ? `Hiring at ${selectedOrg.name}` : 'Hiring'}
        intro={
          selectedOrg
            ? 'Your postings and the people who applied. Publish a job to make it visible on the Jobs page.'
            : 'Set up your company to start posting jobs.'
        }
        actions={
          selectedOrg ? (
            <Button onClick={() => setFormOpen(true)} data-testid="post-job-btn">
              Post a job
            </Button>
          ) : undefined
        }
      />

      {orgs && orgs.length > 1 && (
        <Select
          id="hiring-org"
          label="Company"
          value={selectedOrg?.id}
          onChange={(e) => {
            setJobs(null);
            setParams({ org: e.target.value });
          }}
          options={orgs.map((o) => ({ value: o.id, label: o.name }))}
          style={{ maxWidth: '360px' }}
        />
      )}

      {error && (
        <Notice tone="error" style={{ marginBottom: spacing.md }}>
          {error}
        </Notice>
      )}
      {statusError && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="job-status-error">
          {statusError}
        </Notice>
      )}

      {orgs === null && !error && <p style={{ color: colors.neutral[600] }}>Loading…</p>}
      {orgs !== null && orgs.length === 0 && (
        <CreateOrganization
          onCreated={async () => {
            await loadOrgs();
            await session.refresh();
          }}
        />
      )}

      {selectedOrg && jobs !== null && jobs.length === 0 && (
        <EmptyState
          title="No jobs posted yet"
          description="Post your first role. Candidates see it on the Jobs page once it is published."
          action={<Button onClick={() => setFormOpen(true)}>Post a job</Button>}
        />
      )}

      {selectedOrg && jobs !== null && jobs.length > 0 && (
        <ul
          data-testid="hiring-jobs"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: '10px',
          }}
        >
          {jobs.map((job, index) => {
            const counts = job.applicationCounts ?? {};
            const activeCount = ACTIVE_APPLICATION_STATUSES.reduce(
              (n, s) => n + (counts[s] ?? 0),
              0
            );
            const newCount = counts.submitted ?? 0;
            const actions = JOB_ACTIONS.filter((a) => JOB_TRANSITIONS[job.status]?.includes(a.to));
            return (
              <li
                key={job.id}
                data-testid={`hiring-job-${job.id}`}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderTop: index === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: spacing.md,
                }}
              >
                <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                  <Link
                    to={`/hiring/jobs/${job.id}`}
                    style={{ fontWeight: 700, color: colors.neutral[900], textDecoration: 'none' }}
                  >
                    {job.title}
                  </Link>{' '}
                  <StatusPill
                    kind="job"
                    status={job.status}
                    data-testid={`hiring-job-status-${job.id}`}
                  />
                  <div style={{ color: colors.neutral[600], fontSize: '0.8125rem', marginTop: 4 }}>
                    {activeCount === 0
                      ? 'No active applicants'
                      : `${activeCount} active applicant${activeCount === 1 ? '' : 's'}${newCount ? `, ${newCount} not yet reviewed` : ''}`}
                    . Updated {formatDate(job.updatedAt)}.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                  {actions.map((a) => (
                    <Button
                      key={a.to}
                      size="sm"
                      variant={a.to === 'published' ? 'primary' : 'outline'}
                      loading={statusBusy === job.id}
                      onClick={() => void changeStatus(job, a.to)}
                      data-testid={`job-action-${a.to}-${job.id}`}
                    >
                      {a.label}
                    </Button>
                  ))}
                  <Link
                    to={`/hiring/jobs/${job.id}`}
                    style={{
                      alignSelf: 'center',
                      color: colors.primary[700],
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    Review applicants
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {formOpen && selectedOrg && (
        <JobForm
          orgId={selectedOrg.id}
          skills={skills}
          onClose={() => setFormOpen(false)}
          onSaved={loadJobs}
        />
      )}
    </div>
  );
};
