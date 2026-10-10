import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import {
  NOTIFICATIONS_EVENT,
  notificationTarget,
  type AppNotification,
} from '../lib/notifications.js';
import { Button, EmptyState, Notice, PageHeader } from '../components/ui/index.js';

/**
 * What happened to you, newest first: application moves, new applicants for
 * your jobs, referee responses. Each item links to the thing it is about.
 */
export const NotificationsPage: React.FC = () => {
  usePageMeta('Notifications', 'Updates about your applications, hiring and work history.');
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiJson<{ notifications: AppNotification[] }>('/api/v1/notifications');
      setItems(res.notifications);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (body: { all: true } | { notificationIds: string[] }) => {
    await apiJson('/api/v1/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
  };

  const markAll = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await markRead({ all: true });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Opening a notification reads it; navigation does not wait for the server.
  const open = (n: AppNotification) => {
    if (n.isRead) return;
    setItems((current) =>
      current ? current.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) : current
    );
    markRead({ notificationIds: [n.id] }).catch(() => undefined);
  };

  const unread = (items ?? []).filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <PageHeader
        title="Notifications"
        intro={
          items === null
            ? 'Updates about your applications, hiring and work history.'
            : unread > 0
              ? `${unread} unread.`
              : 'You are all caught up.'
        }
        actions={
          unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void markAll()}
              disabled={busy}
              data-testid="notifications-mark-all"
            >
              {busy ? 'Marking…' : 'Mark all as read'}
            </Button>
          ) : undefined
        }
      />

      {error && (
        <Notice tone="error" data-testid="notifications-error">
          {error}
        </Notice>
      )}

      {!error && items === null && (
        <p style={{ color: colors.neutral[600] }} data-testid="notifications-loading">
          Loading notifications…
        </p>
      )}

      {items !== null && items.length === 0 && (
        <EmptyState
          title="Nothing yet"
          description="You will hear here when a hiring team moves your application, when someone applies to your jobs, and when a referee responds."
        />
      )}

      {items !== null && items.length > 0 && (
        <ul
          data-testid="notifications-list"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: '10px',
          }}
        >
          {items.map((n, index) => {
            const target = notificationTarget(n);
            return (
              <li
                key={n.id}
                data-testid={`notification-${n.id}`}
                data-read={n.isRead}
                style={{
                  display: 'flex',
                  gap: spacing.md,
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderTop: index === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                  backgroundColor: n.isRead ? 'transparent' : colors.primary[50],
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flex: '0 0 8px',
                    height: '8px',
                    marginTop: '7px',
                    borderRadius: '50%',
                    backgroundColor: n.isRead ? 'transparent' : colors.primary[700],
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? 600 : 700, color: colors.neutral[900] }}>
                    {n.isRead ? null : <span className="sr-only">Unread: </span>}
                    {target ? (
                      <Link
                        to={target}
                        onClick={() => open(n)}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {n.title}
                      </Link>
                    ) : (
                      n.title
                    )}
                  </div>
                  <p
                    style={{ margin: '2px 0 0', color: colors.neutral[700], fontSize: '0.875rem' }}
                  >
                    {n.body}
                  </p>
                  <div
                    style={{ marginTop: '4px', color: colors.neutral[600], fontSize: '0.75rem' }}
                  >
                    {formatDate(n.createdAt)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
