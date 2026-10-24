/**
 * Provider-independent email contract. Nothing in this file (or any caller of
 * the email service) may mention a vendor, a vendor SDK type, or a vendor
 * response shape. Vendor details live only in an adapter such as brevo.ts.
 */

/** Logical template ids. Business code uses these, never vendor template ids. */
export type EmailTemplateId = 'work_history.email_verification' | 'reference.request';

export interface EmailRequest {
  templateId: EmailTemplateId;
  to: string;
  variables: Record<string, unknown>;
  /** Stable per logical email (the queue job id). Providers that can dedupe use it. */
  idempotencyKey: string;
}

/** What an adapter is asked to deliver: already validated and rendered. */
export interface OutboundEmail {
  from: { email: string; name: string };
  replyTo?: string;
  to: string;
  subject: string;
  text: string;
  /** Opaque correlation value; adapters attach it so provider logs can be traced to a job. */
  idempotencyKey: string;
  templateId: EmailTemplateId;
}

export interface EmailSendResult {
  provider: string;
  /** Provider message id when the provider returns one. Acceptance only, not delivery. */
  messageId?: string;
  /** The provider accepted the message for delivery. It does NOT prove mailbox delivery. */
  status: 'accepted';
}

export type EmailErrorCode =
  | 'invalid_request' // our request is malformed or the provider rejected the content/recipient
  | 'configuration' // missing or invalid configuration, unsupported provider
  | 'authentication' // provider refused our credentials
  | 'rate_limited'
  | 'unavailable' // provider 5xx / network failure
  | 'timeout';

const RETRYABLE: ReadonlySet<EmailErrorCode> = new Set(['rate_limited', 'unavailable', 'timeout']);

/** Normalized failure. Messages never contain addresses, tokens, codes or credentials. */
export class EmailError extends Error {
  readonly code: EmailErrorCode;
  readonly retryable: boolean;
  constructor(code: EmailErrorCode, message: string) {
    super(message);
    this.name = 'EmailError';
    this.code = code;
    this.retryable = RETRYABLE.has(code);
  }
}

/** The contract every provider adapter implements and the contract tests exercise. */
export interface EmailProvider {
  readonly name: string;
  send(email: OutboundEmail): Promise<EmailSendResult>;
}
