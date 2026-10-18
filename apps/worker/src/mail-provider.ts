import { PermanentJobError } from './claim.js';

export interface TransactionalMessage {
  to: string;
  subject: string;
  text: string;
}

/** Server-side only. No browser bundle imports or public credentials. */
export interface EmailDeliveryConfig {
  provider: 'none' | 'resend';
  apiKey?: string;
  from?: string;
  appUrl?: string;
}

/** Idempotent email submission to Resend, with retryable provider failures. */
export async function sendTransactionalEmail(
  message: TransactionalMessage,
  jobId: string,
  config: EmailDeliveryConfig,
  send: typeof fetch = fetch
): Promise<void> {
  if (config.provider !== 'resend' || !config.apiKey || !config.from) {
    throw new PermanentJobError('Transactional email delivery is not configured.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.from)) {
    throw new PermanentJobError('EMAIL_FROM must be a valid sender address.');
  }
  // Resend deduplicates repeated submissions with this key: a crashed worker
  // may claim the same job again, but it must not send duplicate invites.
  let response: Response;
  try {
    response = await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': jobId,
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    // Timeouts and network errors can be transient. Let job retry with the
    // same idempotency key, without disclosing addresses or one-time tokens.
    throw new Error('Transactional email provider request failed.');
  }
  if (response.ok) return;
  if (
    response.status === 408 ||
    response.status === 409 ||
    response.status === 429 ||
    response.status >= 500
  ) {
    throw new Error(`Transactional email provider temporarily unavailable (${response.status}).`);
  }
  throw new PermanentJobError(
    `Transactional email provider rejected request (${response.status}).`
  );
}
