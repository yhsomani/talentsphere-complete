import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { formatDateTime } from '../lib/format.js';
import { otherNames, type ConversationSummary } from '../lib/messages.js';
import { useSession } from '../lib/SessionContext.js';
import { EmptyState, Notice, PageHeader } from '../components/ui/index.js';

/**
 * Your conversations, most recent first. A hiring team starts one from an
 * applicant's card; the candidate replies here.
 */
export const MessagesPage: React.FC = () => {
  usePageMeta('Messages', 'Your conversations with hiring teams and candidates.');
  const session = useSession();
  const me = session.profile?.id;
  const [threads, setThreads] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiJson<{ threads: ConversationSummary[] }>('/api/v1/threads');
      setThreads(res.threads);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <PageHeader
        title="Messages"
        intro={
          session.isRecruiter
            ? 'Message an applicant from their card on a job’s applicant list.'
            : 'A hiring team can message you once you have applied to one of its jobs.'
        }
      />

      {error && (
        <Notice tone="error" data-testid="messages-error">
          {error}
        </Notice>
      )}

      {!error && threads === null && (
        <p style={{ color: colors.neutral[600] }} data-testid="messages-loading">
          Loading conversations…
        </p>
      )}

      {threads !== null && threads.length === 0 && (
        <EmptyState
          title="No conversations yet"
          description={
            session.isRecruiter
              ? 'Open a job, find an applicant and choose Message.'
              : 'When a hiring team writes to you about an application, the conversation appears here.'
          }
        />
      )}

      {threads !== null && threads.length > 0 && (
        <ul
          data-testid="messages-list"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: '4px',
          }}
        >
          {threads.map((t, index) => {
            const unread = t.unreadCount > 0;
            const name = otherNames(t.participants, me);
            const fromMe = t.lastMessage?.senderId === me;
            return (
              <li
                key={t.id}
                data-testid={`conversation-${t.id}`}
                style={{
                  borderTop: index === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                  backgroundColor: unread ? colors.primary[50] : 'transparent',
                }}
              >
                <Link
                  to={`/messages/${t.id}`}
                  style={{
                    display: 'block',
                    padding: `${spacing.md} ${spacing.lg}`,
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: spacing.md,
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: unread ? 700 : 600,
                        color: colors.neutral[900],
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {name}
                      {unread && (
                        <span className="sr-only">
                          , {t.unreadCount} unread {t.unreadCount === 1 ? 'message' : 'messages'}
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        color: colors.neutral[600],
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDateTime(t.lastMessageAt)}
                    </span>
                  </div>
                  {t.subject && (
                    <div style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                      {t.subject}
                    </div>
                  )}
                  {t.lastMessage && (
                    <p
                      style={{
                        margin: '2px 0 0',
                        color: colors.neutral[600],
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fromMe ? 'You: ' : ''}
                      {t.lastMessage.content}
                    </p>
                  )}
                  {unread && (
                    <span
                      aria-hidden="true"
                      data-testid={`conversation-unread-${t.id}`}
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        padding: '0 8px',
                        borderRadius: 999,
                        backgroundColor: colors.primary[700],
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {t.unreadCount} new
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
