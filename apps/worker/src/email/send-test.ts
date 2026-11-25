/**
 * Operator smoke test for live email delivery (issue #44). Sends one message of
 * each template through the real email service, using the same configuration
 * the worker reads, to a mailbox the operator owns:
 *
 *   node apps/worker/dist/email/send-test.js you@your-domain.example
 *
 * The code and reference link it sends are placeholders and do not work in the
 * app. It prints only the provider's acceptance and message id, never the key.
 * Acceptance is not mailbox delivery: check the inbox (and spam folder).
 */
import { randomUUID } from 'node:crypto';
import { loadEmailConfig } from './config.js';
import { createEmailService } from './service.js';
import { EmailError, type EmailRequest } from './types.js';

for (const candidate of ['.env', '../../.env']) {
  try {
    process.loadEnvFile(candidate);
    break;
  } catch {
    // not here — try the next location
  }
}

const to = process.argv[2];
if (!to) {
  console.error('Usage: node apps/worker/dist/email/send-test.js <recipient address>');
  process.exit(2);
}

const config = loadEmailConfig(process.env);
const service = createEmailService(config);
const requests: EmailRequest[] = [
  {
    templateId: 'work_history.email_verification',
    to,
    variables: { code: '000000', expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() },
    idempotencyKey: `send-test-${randomUUID()}`,
  },
  {
    templateId: 'reference.request',
    to,
    variables: {
      candidateName: 'TalentSphere delivery test',
      title: 'Test role',
      companyName: 'Test company',
      referenceId: 'send-test',
      token: 'not-a-real-token',
    },
    idempotencyKey: `send-test-${randomUUID()}`,
  },
];

let failed = false;
for (const request of requests) {
  try {
    const result = await service.send(request);
    console.log(
      `${request.templateId}: accepted by ${result.provider} (${result.messageId ?? 'no message id'})`
    );
  } catch (err) {
    failed = true;
    const code = err instanceof EmailError ? err.code : 'unexpected';
    console.error(`${request.templateId}: failed [${code}] ${(err as Error).message}`);
  }
}
process.exit(failed ? 1 : 0);
