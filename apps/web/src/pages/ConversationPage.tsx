import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { formatDateTime } from '../lib/format.js';
import { createStableKeyer } from '../lib/idempotency.js';
import {
  otherNames,
  type ConversationMessage,
  type ConversationParticipant,
} from '../lib/messages.js';
import { NOTIFICATIONS_EVENT } from '../lib/notifications.js';
import { useSession } from '../lib/SessionContext.js';
import { LoadError, Button, Notice, PageHeader, TextArea } from '../components/ui/index.js';

interface Conversation {
  thread: { id: string; subject?: string | null };
  participants: ConversationParticipant[];
  messages: ConversationMessage[];
}

const REFRESH_MS = 15_000;
const MAX_LENGTH = 5000;

/**
 * One conversation. Opening it marks it read (server side). New messages
 * from the other side arrive on focus and every 15 seconds while the tab is
 * visible — there is no push channel.
 */
export const ConversationPage: React.FC = () => {
  const { id = '' } = useParams();
  const session = useSession();
  const me = session.profile?.id;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // A retried send (timeout after the server stored it) reuses its key and is
  // stored once; a new message — even with the same words — gets a new one.
  const keyer = useRef(createStableKeyer());
  const sentCount = useRef(0);
  const lastMessageRef = useRef<HTMLLIElement>(null);
  const scrolledOnce = useRef(false);

  const title = conversation ? otherNames(conversation.participants, me) : 'Conversation';
  usePageMeta(title, 'A conversation on TalentSphere.');

  const load = useCallback(async () => {
    try {
      const res = await apiJson<Conversation>(`/api/v1/threads/${encodeURIComponent(id)}`);
      setConversation(res);
      setLoadError(null);
      // Opening it read it: let the header's notification count catch up.
      window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
    } catch (err) {
      setLoadError(
        err instanceof ApiError && (err.status === 403 || err.status === 404)
          ? 'This conversation does not exist, or you are not part of it.'
          : errorMessage(err)
      );
    }
  }, [id]);

  useEffect(() => {
    scrolledOnce.current = false;
    void load();
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, REFRESH_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [load]);

  // Land on the latest message the first time the conversation renders.
  useEffect(() => {
    if (conversation && !scrolledOnce.current && conversation.messages.length > 0) {
      scrolledOnce.current = true;
      lastMessageRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [conversation]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await apiJson(`/api/v1/threads/${encodeURIComponent(id)}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          clientMessageId: keyer.current({ content, n: sentCount.current }),
        }),
      });
      sentCount.current += 1;
      setDraft('');
      await load();
      lastMessageRef.current?.scrollIntoView({ block: 'nearest' });
    } catch (err) {
      setSendError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const nameOf = (profileId: string) =>
    profileId === me
      ? 'You'
      : (conversation?.participants.find((p) => p.userId === profileId)?.fullName ??
        'Deleted account');

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <p style={{ margin: `0 0 ${spacing.sm}` }}>
        <Link className="back-link" to="/messages" data-testid="conversation-back">
          All messages
        </Link>
      </p>
      <PageHeader title={title} intro={conversation?.thread.subject ?? undefined} />

      {loadError && (
        <LoadError
          message={loadError}
          data-testid="conversation-error"
          onRetry={() => void load()}
        />
      )}

      {!loadError && conversation === null && (
        <p style={{ color: colors.neutral[600] }} data-testid="conversation-loading">
          Loading conversation…
        </p>
      )}

      {conversation && (
        <>
          {conversation.messages.length === 0 ? (
            <p style={{ color: colors.neutral[600] }}>No messages yet.</p>
          ) : (
            <ol
              data-testid="conversation-messages"
              aria-label="Messages"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: `0 0 ${spacing.lg}`,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.sm,
              }}
            >
              {conversation.messages.map((m, index) => {
                const mine = m.senderId === me;
                const isLast = index === conversation.messages.length - 1;
                return (
                  <li
                    key={m.id}
                    ref={isLast ? lastMessageRef : undefined}
                    data-testid={`message-${m.id}`}
                    data-mine={mine}
                    style={{
                      alignSelf: mine ? 'flex-end' : 'flex-start',
                      maxWidth: 'min(85%, 560px)',
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: '4px',
                      backgroundColor: mine ? colors.primary[50] : '#ffffff',
                      border: `1px solid ${mine ? colors.primary[200] : colors.neutral[200]}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: spacing.sm,
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: colors.neutral[600],
                      }}
                    >
                      <strong style={{ color: colors.neutral[800] }}>{nameOf(m.senderId)}</strong>
                      <span>{formatDateTime(m.createdAt)}</span>
                    </div>
                    <p
                      style={{
                        margin: '2px 0 0',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        color: colors.neutral[900],
                      }}
                    >
                      {m.content}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          <form onSubmit={send} data-testid="message-form" noValidate>
            {sendError && (
              <Notice
                tone="error"
                style={{ marginBottom: spacing.sm }}
                data-testid="message-send-error"
              >
                {sendError} Your message is still here — try again.
              </Notice>
            )}
            <TextArea
              id="message-input"
              label="Your message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              data-testid="message-input"
              helperText={
                draft.length > MAX_LENGTH - 500
                  ? `${MAX_LENGTH - draft.length} characters left.`
                  : undefined
              }
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                loading={sending}
                disabled={draft.trim().length === 0}
                data-testid="message-send"
              >
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
