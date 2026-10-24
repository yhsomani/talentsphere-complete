import { createBrevoProvider } from './brevo.js';
import { emailConfigProblems, type EmailConfig } from './config.js';
import { renderTemplate } from './templates.js';
import {
  EmailError,
  type EmailProvider,
  type EmailRequest,
  type EmailSendResult,
} from './types.js';

export interface EmailService {
  send(request: EmailRequest): Promise<EmailSendResult>;
}

const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The only provider registry. Adding a provider = one adapter file, one entry
 * here, one name in SUPPORTED_EMAIL_PROVIDERS. Call sites never change.
 */
function buildProvider(config: EmailConfig, fetchImpl?: typeof fetch): EmailProvider {
  switch (config.provider) {
    case 'brevo':
      return createBrevoProvider({
        apiKey: config.brevo.apiKey as string,
        baseUrl: config.brevo.baseUrl,
        timeoutMs: config.timeoutMs,
        fetchImpl,
      });
    default:
      throw new EmailError('configuration', 'Transactional email delivery is not configured.');
  }
}

/** Validates, renders and delegates. Throws EmailError only; retry policy belongs to the caller's queue. */
export function createEmailService(
  config: EmailConfig,
  deps: { provider?: EmailProvider; fetchImpl?: typeof fetch } = {}
): EmailService {
  return {
    async send(request) {
      const problems = emailConfigProblems(config);
      if (config.provider === 'none' || problems.length > 0) {
        throw new EmailError(
          'configuration',
          problems.length > 0
            ? problems.join('; ')
            : 'Transactional email delivery is not configured.'
        );
      }
      if (!ADDRESS.test(request.to)) {
        throw new EmailError('invalid_request', 'Recipient address is invalid.');
      }
      if (!request.idempotencyKey) {
        throw new EmailError('invalid_request', 'An idempotency key is required.');
      }
      const rendered = renderTemplate(request, config.appUrl);
      const provider = deps.provider ?? buildProvider(config, deps.fetchImpl);
      return provider.send({
        from: { email: config.from as string, name: config.fromName },
        replyTo: config.replyTo,
        to: request.to,
        subject: rendered.subject,
        text: rendered.text,
        idempotencyKey: request.idempotencyKey,
        templateId: request.templateId,
      });
    },
  };
}
