import { describe, expect, it } from 'vitest';
import {
  EmailError,
  type EmailProvider,
  type OutboundEmail,
} from '../../../apps/worker/src/email/types.js';

export const sampleEmail: OutboundEmail = {
  from: { email: 'sender@example.test', name: 'TalentSphere' },
  to: 'recipient@example.test',
  subject: 'Subject',
  text: 'one-time secret 123456',
  idempotencyKey: 'job_1',
  templateId: 'work_history.email_verification',
};

export interface ProviderHarness {
  /** Provider that answers every send as accepted by the (simulated) vendor. */
  accepting(): EmailProvider;
  /** Provider whose vendor answers with a failure of the given class. */
  failing(
    kind: 'auth' | 'rate_limit' | 'server' | 'rejected' | 'network' | 'timeout'
  ): EmailProvider;
}

/** Every adapter must pass this suite. New provider = new harness, same assertions. */
export function describeEmailProviderContract(name: string, h: ProviderHarness): void {
  describe(`EmailProvider contract: ${name}`, () => {
    it('returns a normalized accepted result naming the provider', async () => {
      const p = h.accepting();
      const r = await p.send(sampleEmail);
      expect(r.status).toBe('accepted');
      expect(r.provider).toBe(p.name);
    });

    const cases: Array<[Parameters<ProviderHarness['failing']>[0], string, boolean]> = [
      ['auth', 'authentication', false],
      ['rate_limit', 'rate_limited', true],
      ['server', 'unavailable', true],
      ['network', 'unavailable', true],
      ['timeout', 'timeout', true],
      ['rejected', 'invalid_request', false],
    ];
    for (const [kind, code, retryable] of cases) {
      it(`maps ${kind} failures to EmailError(${code}, retryable=${retryable})`, async () => {
        const err = await h
          .failing(kind)
          .send(sampleEmail)
          .catch((e: unknown) => e);
        expect(err).toBeInstanceOf(EmailError);
        expect((err as EmailError).code).toBe(code);
        expect((err as EmailError).retryable).toBe(retryable);
      });
    }

    it('never leaks recipient, content or credentials in error messages', async () => {
      for (const kind of [
        'auth',
        'rate_limit',
        'server',
        'rejected',
        'network',
        'timeout',
      ] as const) {
        const err = (await h
          .failing(kind)
          .send(sampleEmail)
          .catch((e: unknown) => e)) as Error;
        expect(err.message).not.toContain(sampleEmail.to);
        expect(err.message).not.toContain('123456');
        expect(err.message).not.toContain('test-api-key');
      }
    });
  });
}
