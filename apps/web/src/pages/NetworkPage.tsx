import React, { useCallback, useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import {
  Button,
  Card,
  CardContent,
  Input,
  Notice,
  PageHeader,
  TextArea,
  LoadError,
} from '../components/ui/index.js';

interface Connection {
  id: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  note?: string;
  createdAt: string;
}

interface SearchHit {
  id: string;
  type: string;
  title: string;
  subtitle: string;
}

type Section = 'pending_received' | 'pending_sent' | 'accepted';

const SECTIONS: ReadonlyArray<{ key: Section; title: string; empty: string }> = [
  {
    key: 'pending_received',
    title: 'Requests for you',
    empty: 'No one is waiting for your answer.',
  },
  {
    key: 'pending_sent',
    title: 'Requests you sent',
    empty: 'You have no pending requests.',
  },
  {
    key: 'accepted',
    title: 'Your connections',
    empty: 'You have no connections yet.',
  },
];

export const NetworkPage: React.FC = () => {
  usePageMeta('Network', 'Answer connection requests and see who you are connected with.');
  const [lists, setLists] = useState<Record<Section, Connection[] | null>>({
    pending_received: null,
    pending_sent: null,
    accepted: null,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const session = useSession();
  const me = session.profile?.id;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    try {
      const results = await Promise.all(
        SECTIONS.map(({ key }) =>
          apiJson<{ connections: Connection[] }>(`/api/v1/connections?status=${key}`)
        )
      );
      setLists({
        pending_received: results[0].connections,
        pending_sent: results[1].connections,
        accepted: results[2].connections,
      });
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, path: 'respond' | 'withdraw', body?: object, done?: string) => {
    if (busyId) return;
    setActionError(null);
    setNotice(null);
    setBusyId(id);
    try {
      await apiJson(`/api/v1/connections/${id}/${path}`, {
        method: 'POST',
        body: JSON.stringify(body ?? {}),
      });
      setNotice(done ?? 'Saved.');
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const requestConnection = async (id: string) => {
    if (sending) return;
    setActionError(null);
    setNotice(null);
    setSending(true);
    const body: Record<string, string> = { recipientId: id };
    if (note.trim()) body.note = note.trim();
    try {
      await apiJson('/api/v1/connections/request', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setRecipientId('');
      setNote('');
      setResults(null);
      setQuery('');
      setNotice('Request sent.');
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    void requestConnection(recipientId.trim());
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setSearching(true);
    setActionError(null);
    try {
      // Only profiles the server lets this viewer see come back (privacy is enforced there).
      const { results: found } = await apiJson<{ results: SearchHit[] }>(
        `/api/v1/search?query=${encodeURIComponent(term)}&type=profiles&limit=8`
      );
      setResults(found.filter((hit) => hit.type === 'profile' && hit.id !== me));
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Network"
        intro="Answer requests, follow up on the ones you sent, and see your connections."
      />
      {/* shortcut: this module keeps data in server memory, a restart clears it, upgrade when moved to durable storage */}
      <Notice tone="info" style={{ marginBottom: spacing.lg }} data-testid="ephemeral-notice">
        This page is not saved permanently yet. A server restart clears your connections and
        requests.
      </Notice>
      {loadError && (
        <LoadError
          message={loadError}
          style={{ marginBottom: spacing.md }}
          onRetry={() => void load()}
        />
      )}
      {actionError && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="network-error">
          {actionError}
        </Notice>
      )}
      {notice && (
        <Notice tone="success" style={{ marginBottom: spacing.md }} data-testid="network-notice">
          {notice}
        </Notice>
      )}

      <Card style={{ marginBottom: spacing.lg }}>
        <CardContent style={{ padding: spacing.lg }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>Find a member</h2>
          <form onSubmit={search} noValidate role="search">
            <Input
              id="network-search"
              label="Name"
              helperText="Search for someone you have worked with or met."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="network-search"
            />
            <Button
              type="submit"
              variant="outline"
              loading={searching}
              data-testid="network-search-btn"
            >
              Search
            </Button>
          </form>
          {results && (
            <ul
              data-testid="network-results"
              style={{
                listStyle: 'none',
                margin: `${spacing.md} 0 0`,
                padding: 0,
                borderTop: `1px solid ${colors.neutral[300]}`,
              }}
            >
              {results.length === 0 && (
                <li style={{ padding: `${spacing.md} 0`, color: colors.neutral[600] }}>
                  No members match that name. Check the spelling, or ask them for their member ID.
                </li>
              )}
              {results.map((hit) => (
                <li
                  key={hit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing.md,
                    padding: `${spacing.md} 0`,
                    borderBottom: `1px solid ${colors.neutral[300]}`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: colors.neutral[900] }}>{hit.title}</div>
                    <div style={{ fontSize: '0.875rem', color: colors.neutral[600] }}>
                      {hit.subtitle}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={sending}
                    onClick={() => void requestConnection(hit.id)}
                    data-testid="network-connect"
                  >
                    Connect
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <h3 style={{ fontSize: '1rem', margin: `${spacing.xl} 0 ${spacing.sm}` }}>
            Or send to a member ID
          </h3>
          <form onSubmit={send} noValidate>
            <Input
              id="network-recipient"
              label="Member ID"
              helperText="The ID of the person you want to connect with."
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              data-testid="network-recipient"
            />
            <TextArea
              id="network-note"
              label="Note (optional)"
              value={note}
              maxLength={500}
              rows={3}
              onChange={(e) => setNote(e.target.value)}
              data-testid="network-note"
            />
            <Button type="submit" loading={sending} data-testid="network-send">
              Send request
            </Button>
          </form>
        </CardContent>
      </Card>

      {SECTIONS.map(({ key, title, empty }) => {
        const items = lists[key];
        return (
          <section
            key={key}
            aria-labelledby={`network-${key}`}
            style={{ marginBottom: spacing.xl }}
          >
            <h2 id={`network-${key}`} style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>
              {title}
            </h2>
            {items === null && !loadError && <p role="status">Loading.</p>}
            {items?.length === 0 && <p style={{ color: colors.neutral[700] }}>{empty}</p>}
            <ul
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
              data-testid={`network-${key}-list`}
            >
              {items?.map((connection) => (
                <li key={connection.id} style={{ marginBottom: spacing.md }}>
                  <Card>
                    <CardContent style={{ padding: spacing.lg }}>
                      <p style={{ fontSize: '0.875rem', color: colors.neutral[700] }}>
                        {key === 'pending_received'
                          ? 'From'
                          : key === 'pending_sent'
                            ? 'To'
                            : 'With'}{' '}
                        <code>
                          {key === 'pending_received'
                            ? connection.senderId
                            : connection.recipientId}
                        </code>
                      </p>
                      {connection.note && (
                        <p style={{ marginTop: spacing.xs }}>{connection.note}</p>
                      )}
                      <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.sm }}>
                        {key === 'pending_received' && (
                          <>
                            <Button
                              loading={busyId === connection.id}
                              onClick={() =>
                                void act(
                                  connection.id,
                                  'respond',
                                  { action: 'accept' },
                                  'Connection accepted.'
                                )
                              }
                              data-testid="network-accept"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              disabled={busyId === connection.id}
                              onClick={() =>
                                void act(
                                  connection.id,
                                  'respond',
                                  { action: 'reject' },
                                  'Request declined.'
                                )
                              }
                              data-testid="network-decline"
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {key === 'pending_sent' && (
                          <Button
                            variant="outline"
                            loading={busyId === connection.id}
                            onClick={() =>
                              void act(connection.id, 'withdraw', undefined, 'Request withdrawn.')
                            }
                            data-testid="network-withdraw"
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
