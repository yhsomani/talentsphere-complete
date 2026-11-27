import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import {
  Button,
  Card,
  CardContent,
  Input,
  LoadError,
  Notice,
  PageHeader,
  Select,
} from '../components/ui/index.js';

// Mirrors the API's import view (GET /api/v1/imports/:id, plan TS-08, ADR-033).
type Kind = 'position' | 'education' | 'skill' | 'certification';
interface ImportItemView {
  id: string;
  kind: Kind;
  payload: Record<string, string | boolean | null>;
  createdRef: { type: string; id: string } | null;
  review: {
    suggested: 'accept' | 'skip';
    duplicate: boolean;
    problem: string | null;
    skill: { id: string; name: string | null } | null;
  } | null;
}
interface ImportView {
  id: string;
  source: string;
  status: 'ready_for_review' | 'applied' | 'undone';
  ignored: Record<string, number>;
  reviewExpiresAt: string;
  undoUntil: string | null;
  counts: { total: number; suggestedAccept: number; duplicates: number; added: number };
  items: ImportItemView[];
}
interface ImportSummary {
  id: string;
  source: string;
  status: ImportView['status'];
  entries: number;
  added: number;
  createdAt: string;
  undoUntil: string | null;
}

const SOURCES = [
  { value: 'json_resume', label: 'JSON Resume file (.json)' },
  { value: 'csv_positions', label: 'Roles, from the TalentSphere CSV template' },
  { value: 'csv_education', label: 'Education, from the CSV template' },
  { value: 'csv_skills', label: 'Skills, from the CSV template' },
  { value: 'csv_certifications', label: 'Certifications, from the CSV template' },
];
const SOURCE_LABEL = Object.fromEntries(SOURCES.map((s) => [s.value, s.label.split(',')[0]]));

const SECTIONS: Array<{ kind: Kind; title: string }> = [
  { kind: 'position', title: 'Roles' },
  { kind: 'education', title: 'Education' },
  { kind: 'skill', title: 'Skills' },
  { kind: 'certification', title: 'Certifications' },
];

const text = (v: string | boolean | null | undefined) => (typeof v === 'string' ? v : '');

function describe(item: ImportItemView): { main: string; detail: string } {
  const p = item.payload;
  switch (item.kind) {
    case 'position':
      return {
        main: `${text(p.title) || 'Untitled role'} at ${text(p.company) || 'unknown company'}`,
        detail: p.startDate
          ? `${formatDate(text(p.startDate))} to ${p.isCurrent ? 'present' : formatDate(text(p.endDate))}`
          : 'No start date',
      };
    case 'education':
      return {
        main: [text(p.degree), text(p.field)].filter(Boolean).join(', ') || text(p.institution),
        detail: text(p.institution),
      };
    case 'skill':
      return { main: item.review?.skill?.name ?? text(p.name), detail: '' };
    case 'certification':
      return {
        main: text(p.name),
        detail: [text(p.issuer), p.url ? 'link provided, not checked' : '']
          .filter(Boolean)
          .join(' · '),
      };
  }
}

/**
 * Import your history from a file you made or exported yourself (plan TS-08,
 * FR-PRF-019). Nothing reaches the profile until you confirm; every entry is
 * added as an unverified claim; an import can be undone for 7 days.
 */
export const ImportPage: React.FC = () => {
  usePageMeta('Import your history', 'Bring roles, education and skills in from a file.');
  const [source, setSource] = useState('json_resume');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<ImportView | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [startDates, setStartDates] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [history, setHistory] = useState<ImportSummary[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistory((await apiJson<{ imports: ImportSummary[] }>('/api/v1/imports')).imports);
      setHistoryError(null);
    } catch (err) {
      setHistoryError(errorMessage(err));
    }
  }, []);
  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const showBatch = (view: ImportView) => {
    setBatch(view);
    setChosen(new Set(view.items.filter((i) => i.review?.suggested === 'accept').map((i) => i.id)));
    setStartDates({});
  };

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const content = await file.text();
      const res = await apiJson<{ import: ImportView }>('/api/v1/imports', {
        method: 'POST',
        body: JSON.stringify({ source, content }),
      });
      showBatch(res.import);
      void loadHistory();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirm = async () => {
    if (!batch) return;
    setBusy(true);
    setError(null);
    try {
      const accept = [...chosen].map((itemId) =>
        startDates[itemId] ? { itemId, edit: { startDate: startDates[itemId] } } : { itemId }
      );
      const res = await apiJson<{ import: ImportView; added: number }>(
        `/api/v1/imports/${batch.id}/commit`,
        { method: 'POST', body: JSON.stringify({ accept }) }
      );
      setBatch(res.import);
      setDone(
        `Added ${res.added} ${res.added === 1 ? 'entry' : 'entries'} to your profile as unverified claims.`
      );
      void loadHistory();
    } catch (err) {
      setError(errorMessage(err));
      // The profile may have changed since the review: show the review as it is now.
      try {
        showBatch((await apiJson<{ import: ImportView }>(`/api/v1/imports/${batch.id}`)).import);
      } catch {
        // Keep the current review on screen; the error above already explains.
      }
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!batch) return;
    setBusy(true);
    setError(null);
    try {
      await apiJson(`/api/v1/imports/${batch.id}`, { method: 'DELETE' });
      setBatch(null);
      setDone('Import cancelled. Nothing was added.');
      void loadHistory();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const undo = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiJson<{ import: ImportView; removed: number }>(
        `/api/v1/imports/${id}/undo`,
        { method: 'POST' }
      );
      if (batch?.id === id) setBatch(res.import);
      setDone(`Import undone. Removed ${res.removed} ${res.removed === 1 ? 'entry' : 'entries'}.`);
      void loadHistory();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const ignored = batch ? Object.entries(batch.ignored) : [];
  const csvSource = source.startsWith('csv_');

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <PageHeader
        title="Import your history"
        intro="Bring roles, education, skills and certifications in from a file you made or exported yourself. You review every entry first, and each one is added as an unverified claim that you can then prove."
      />

      {error && (
        <Notice tone="error" style={{ marginBottom: spacing.lg }} data-testid="import-error">
          {error}
        </Notice>
      )}
      {done && (
        <Notice tone="success" style={{ marginBottom: spacing.lg }} data-testid="import-done">
          {done} {batch?.status === 'applied' && <Link to="/evidence">See your work history</Link>}
        </Notice>
      )}

      {!batch || batch.status !== 'ready_for_review' ? (
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent style={{ padding: spacing.lg }}>
            <form onSubmit={start} data-testid="import-form" noValidate>
              <Select
                id="import-source"
                label="What kind of file"
                options={SOURCES}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                data-testid="import-source"
              />
              {csvSource && (
                <p style={{ fontSize: '0.875rem', color: colors.neutral[700] }}>
                  <a
                    href={`/api/v1/imports/templates/${source}`}
                    download
                    data-testid="import-template"
                  >
                    Download the template
                  </a>
                  , fill in one row per entry, and save it as CSV.
                </p>
              )}
              <Input
                id="import-file"
                label="File"
                type="file"
                accept={csvSource ? '.csv,text/csv' : '.json,application/json'}
                helperText="Up to 512 KB. The file itself is not stored; only the entries you confirm are kept."
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                data-testid="import-file"
              />
              <Button type="submit" loading={busy} data-testid="import-start">
                Read the file
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <section data-testid="import-review" aria-label="Review the import">
          <p style={{ color: colors.neutral[700], marginBottom: spacing.lg }}>
            We found {batch.counts.total} {batch.counts.total === 1 ? 'entry' : 'entries'}. Entries
            already on your profile, and entries that need a fix, are left unticked. Nothing is
            added until you confirm.
          </p>
          {ignored.length > 0 && (
            <Notice tone="info" style={{ marginBottom: spacing.lg }} data-testid="import-ignored">
              Not imported: {ignored.map(([k, n]) => `${k} (${n})`).join(', ')}. Contacts and
              references are never read, because they are other people&rsquo;s details.
            </Notice>
          )}
          {SECTIONS.map(({ kind, title }) => {
            const items = batch.items.filter((i) => i.kind === kind);
            if (items.length === 0) return null;
            return (
              <Card key={kind} style={{ marginBottom: spacing.lg }}>
                <CardContent style={{ padding: spacing.lg }}>
                  <h2 style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>{title}</h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((item) => {
                      const d = describe(item);
                      const problem = item.review?.problem;
                      const fixable =
                        item.kind === 'position' && problem?.startsWith('Start date is missing');
                      const fixed = fixable && /^\d{4}-\d{2}$/.test(startDates[item.id] ?? '');
                      const blocked = item.review?.duplicate || (problem && !fixed);
                      return (
                        <li
                          key={item.id}
                          data-testid="import-item"
                          style={{
                            display: 'flex',
                            gap: spacing.md,
                            padding: `${spacing.sm} 0`,
                            borderTop: `1px solid ${colors.neutral[200]}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`import-${item.id}`}
                            checked={chosen.has(item.id)}
                            disabled={Boolean(blocked)}
                            onChange={() => toggle(item.id)}
                            data-testid="import-item-check"
                            style={{ marginTop: 4 }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <label htmlFor={`import-${item.id}`} style={{ fontWeight: 600 }}>
                              {d.main}
                            </label>
                            {d.detail && (
                              <div style={{ fontSize: '0.875rem', color: colors.neutral[600] }}>
                                {d.detail}
                              </div>
                            )}
                            {item.review?.duplicate && (
                              <div
                                style={{ fontSize: '0.875rem', color: colors.neutral[700] }}
                                data-testid="import-item-duplicate"
                              >
                                Already on your profile.
                              </div>
                            )}
                            {problem && !item.review?.duplicate && (
                              <div
                                style={{ fontSize: '0.875rem', color: colors.semantic.warningText }}
                                data-testid="import-item-problem"
                              >
                                {problem}
                              </div>
                            )}
                            {fixable && !item.review?.duplicate && (
                              <Input
                                id={`import-start-${item.id}`}
                                label="Start month"
                                type="month"
                                value={startDates[item.id] ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setStartDates((prev) => ({ ...prev, [item.id]: value }));
                                  if (/^\d{4}-\d{2}$/.test(value)) {
                                    setChosen((prev) => new Set(prev).add(item.id));
                                  }
                                }}
                                style={{ maxWidth: '220px' }}
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
          <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
            <Button
              onClick={confirm}
              loading={busy}
              disabled={chosen.size === 0}
              data-testid="import-confirm"
            >
              Add {chosen.size} selected
            </Button>
            <Button variant="outline" onClick={cancel} disabled={busy} data-testid="import-cancel">
              Cancel import
            </Button>
          </div>
        </section>
      )}

      <h2 style={{ fontSize: '1.125rem', margin: `${spacing['2xl']} 0 ${spacing.md}` }}>
        Your imports
      </h2>
      {historyError ? (
        <LoadError message={historyError} onRetry={loadHistory} />
      ) : history === null ? (
        <p style={{ color: colors.neutral[600] }}>Loading…</p>
      ) : history.length === 0 ? (
        <p style={{ color: colors.neutral[600] }}>No imports yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="import-history">
          {history.map((h) => {
            const canUndo =
              h.status === 'applied' &&
              h.undoUntil !== null &&
              Date.parse(h.undoUntil) > Date.now();
            return (
              <li
                key={h.id}
                data-testid="import-history-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: spacing.md,
                  flexWrap: 'wrap',
                  padding: `${spacing.sm} 0`,
                  borderTop: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <span>
                  {SOURCE_LABEL[h.source] ?? h.source}, {formatDate(h.createdAt)}:{' '}
                  {h.status === 'applied'
                    ? `${h.added} added`
                    : h.status === 'undone'
                      ? 'undone'
                      : 'waiting for review'}
                </span>
                {h.status === 'ready_for_review' && batch?.id !== h.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        setDone(null);
                        showBatch(
                          (await apiJson<{ import: ImportView }>(`/api/v1/imports/${h.id}`)).import
                        );
                      } catch (err) {
                        setError(errorMessage(err));
                      }
                    }}
                    disabled={busy}
                    data-testid="import-resume-review"
                  >
                    Review
                  </Button>
                )}
                {canUndo && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => undo(h.id)}
                    disabled={busy}
                    data-testid="import-undo"
                  >
                    Undo, until {formatDate(h.undoUntil)}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
