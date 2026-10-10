import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { formatDate } from '../lib/format.js';
import { Button, Card, CardContent, Notice, TextArea } from '../components/ui/index.js';

interface ReferenceRequest {
  id: string;
  status: string;
  relationship: string;
  refereeName: string;
  candidateName: string;
  companyName?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

const RATINGS: ReadonlyArray<{ key: string; label: string; optional?: boolean }> = [
  { key: 'technicalProficiency', label: 'Skill at the job' },
  { key: 'collaborationRating', label: 'Working with others' },
  { key: 'deliveryReliability', label: 'Delivering what they committed to' },
  { key: 'leadershipRating', label: 'Leadership', optional: true },
];

const SCALE = [1, 2, 3, 4, 5];
const SCALE_LABEL: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

/**
 * The referee's landing page, reached from the emailed link
 * /reference/:id#token=…  The token lives in the URL fragment, which browsers
 * never send to a server, and it is sent to the API in a header. Referees do
 * not need an account.
 */
export const ReferencePage: React.FC = () => {
  usePageMeta('Give a reference', 'Confirm a former colleague’s role and rate their work.');
  const { id = '' } = useParams();
  const token = useMemo(
    () => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '',
    []
  );
  const [request, setRequest] = useState<ReferenceRequest | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'invalid'>('loading');
  const [confirmTitle, setConfirmTitle] = useState<boolean | null>(null);
  const [confirmDates, setConfirmDates] = useState<boolean | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadState('invalid');
      return;
    }
    fetch(`/api/v1/references/${encodeURIComponent(id)}`, {
      headers: { 'x-reference-token': token },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('invalid');
        const body = await res.json();
        setRequest(body.reference);
        setLoadState(body.reference.status === 'requested' ? 'ready' : 'invalid');
      })
      .catch(() => setLoadState('invalid'));
  }, [id, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (confirmTitle === null || confirmDates === null) {
      setError('Answer both questions about the role first.');
      return;
    }
    const missing = RATINGS.filter((r) => !r.optional && !ratings[r.key]);
    if (missing.length > 0) {
      setError(`Rate: ${missing.map((m) => m.label.toLowerCase()).join(', ')}.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `/api/v1/candidates/work-history/references/${encodeURIComponent(id)}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            confirmTitle,
            confirmDates,
            ...ratings,
            ...(notes.trim() ? { summaryNotes: notes.trim() } : {}),
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'We could not record your reference.');
      }
      setDone(true);
      // The link is single-use: drop the token from the address bar.
      window.history.replaceState(null, '', window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not record your reference.');
    } finally {
      setBusy(false);
    }
  };

  const yesNo = (name: string, value: boolean | null, set: (v: boolean) => void) => (
    <div style={{ display: 'flex', gap: spacing.lg }}>
      {[true, false].map((option) => (
        <label key={String(option)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="radio" name={name} checked={value === option} onChange={() => set(option)} />
          {option ? 'Yes' : 'No'}
        </label>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 className="serif-display" style={{ fontSize: '2.25rem', fontWeight: 500 }}>
        Give a reference
      </h1>

      {loadState === 'loading' && (
        <p style={{ color: colors.neutral[600], marginTop: spacing.md }}>Loading…</p>
      )}

      {loadState === 'invalid' && !done && (
        <Notice tone="warning" style={{ marginTop: spacing.md }} data-testid="reference-invalid">
          This link is invalid or has already been used. If someone asked you for a reference, ask
          them to send a new request.
        </Notice>
      )}

      {done && (
        <Notice tone="success" style={{ marginTop: spacing.md }} data-testid="reference-done">
          Thank you. Your reference for {request?.candidateName} has been recorded.
        </Notice>
      )}

      {loadState === 'ready' && request && !done && (
        <>
          <p
            style={{
              color: colors.neutral[700],
              margin: `${spacing.sm} 0 ${spacing.lg}`,
              lineHeight: 1.6,
            }}
          >
            <strong>{request.candidateName}</strong> listed you, {request.refereeName}, as their{' '}
            {request.relationship.replace('_', ' ')} at <strong>{request.companyName}</strong>. Your
            answers are shared with companies they apply to; they cannot edit them.
          </p>
          <Card>
            <CardContent style={{ padding: spacing.lg }}>
              {error && (
                <Notice
                  tone="error"
                  style={{ marginBottom: spacing.md }}
                  data-testid="reference-error"
                >
                  {error}
                </Notice>
              )}
              <form onSubmit={submit} data-testid="reference-form">
                <fieldset style={{ border: 'none', padding: 0, margin: `0 0 ${spacing.lg}` }}>
                  <legend style={{ fontWeight: 600, marginBottom: spacing.xs }}>
                    Was their title “{request.title}”?
                  </legend>
                  {yesNo('confirm-title', confirmTitle, setConfirmTitle)}
                </fieldset>
                <fieldset style={{ border: 'none', padding: 0, margin: `0 0 ${spacing.lg}` }}>
                  <legend style={{ fontWeight: 600, marginBottom: spacing.xs }}>
                    Did they work there from {formatDate(request.startDate)} to{' '}
                    {request.isCurrent ? 'now' : formatDate(request.endDate)}?
                  </legend>
                  {yesNo('confirm-dates', confirmDates, setConfirmDates)}
                </fieldset>
                {RATINGS.map((rating) => (
                  <fieldset
                    key={rating.key}
                    style={{ border: 'none', padding: 0, margin: `0 0 ${spacing.md}` }}
                  >
                    <legend style={{ fontWeight: 600, marginBottom: spacing.xs }}>
                      {rating.label}
                      {rating.optional ? ' (optional)' : ''}
                    </legend>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
                      {SCALE.map((n) => (
                        <label
                          key={n}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.875rem',
                          }}
                        >
                          <input
                            type="radio"
                            name={rating.key}
                            checked={ratings[rating.key] === n}
                            onChange={() => setRatings((r) => ({ ...r, [rating.key]: n }))}
                            data-testid={`rating-${rating.key}-${n}`}
                          />
                          {SCALE_LABEL[n]}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <TextArea
                  id="reference-notes"
                  label="Anything else a future employer should know? (optional)"
                  maxLength={2000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button type="submit" loading={busy} data-testid="reference-submit">
                  Submit reference
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
