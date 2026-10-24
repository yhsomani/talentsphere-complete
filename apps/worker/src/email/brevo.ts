import {
  EmailError,
  type EmailProvider,
  type EmailSendResult,
  type OutboundEmail,
} from './types.js';

export interface BrevoOptions {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
}

/**
 * Brevo transactional adapter (POST /smtp/email). Every Brevo-specific detail
 * (URL, `api-key` header, body shape, status mapping) lives in this file.
 *
 * Brevo has no idempotency-key header, so a retry after an uncertain outcome
 * (timeout) can produce a duplicate message. The key is attached as a custom
 * header only so a duplicate can be traced in Brevo's logs.
 */
export function createBrevoProvider(options: BrevoOptions): EmailProvider {
  const doFetch = options.fetchImpl ?? fetch;
  return {
    name: 'brevo',
    async send(email: OutboundEmail): Promise<EmailSendResult> {
      let response: Response;
      try {
        response = await doFetch(`${options.baseUrl}/smtp/email`, {
          method: 'POST',
          headers: {
            'api-key': options.apiKey,
            accept: 'application/json',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { email: email.from.email, name: email.from.name },
            to: [{ email: email.to }],
            ...(email.replyTo ? { replyTo: { email: email.replyTo } } : {}),
            subject: email.subject,
            textContent: email.text,
            tags: [email.templateId],
            headers: { 'X-TS-Idempotency-Key': email.idempotencyKey },
          }),
          signal: AbortSignal.timeout(options.timeoutMs),
        });
      } catch (err) {
        // Deliberately drop err.message: it can echo the request body.
        const timedOut =
          err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
        throw new EmailError(
          timedOut ? 'timeout' : 'unavailable',
          timedOut ? 'Email provider request timed out.' : 'Email provider request failed.'
        );
      }
      if (response.ok) {
        let messageId: string | undefined;
        try {
          const body = (await response.json()) as { messageId?: unknown };
          if (typeof body.messageId === 'string') messageId = body.messageId;
        } catch {
          // 2xx without a parsable body is still an acceptance.
        }
        return { provider: 'brevo', messageId, status: 'accepted' };
      }
      const s = response.status;
      if (s === 401 || s === 403) {
        throw new EmailError('authentication', `Email provider refused credentials (${s}).`);
      }
      if (s === 429) throw new EmailError('rate_limited', 'Email provider rate limit (429).');
      if (s === 408 || s >= 500) {
        throw new EmailError('unavailable', `Email provider temporarily unavailable (${s}).`);
      }
      throw new EmailError('invalid_request', `Email provider rejected the request (${s}).`);
    },
  };
}
