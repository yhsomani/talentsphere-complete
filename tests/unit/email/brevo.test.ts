import { describe, expect, it, vi } from 'vitest';
import { createBrevoProvider } from '../../../apps/worker/src/email/brevo.js';
import { describeEmailProviderContract, sampleEmail } from './provider-contract.js';

const opts = { apiKey: 'test-api-key-0000', baseUrl: 'https://brevo.test/v3', timeoutMs: 1000 };
const respond = (status: number, body: unknown = {}) =>
  (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

describeEmailProviderContract('brevo (simulated transport)', {
  accepting: () =>
    createBrevoProvider({ ...opts, fetchImpl: respond(201, { messageId: '<m@brevo>' }) }),
  failing: (kind) => {
    const fetchImpl: typeof fetch =
      kind === 'network'
        ? ((async () => {
            throw new Error(sampleEmail.text);
          }) as typeof fetch)
        : kind === 'timeout'
          ? ((async () => {
              throw Object.assign(new Error('x'), { name: 'TimeoutError' });
            }) as typeof fetch)
          : respond({ auth: 401, rate_limit: 429, server: 503, rejected: 400 }[kind]);
    return createBrevoProvider({ ...opts, fetchImpl });
  },
});

describe('Brevo adapter request shape', () => {
  it('posts to /smtp/email with api-key header and maps fields', async () => {
    const f = vi.fn(respond(201, { messageId: '<m@brevo>' }));
    const r = await createBrevoProvider({ ...opts, fetchImpl: f as typeof fetch }).send({
      ...sampleEmail,
      replyTo: 'help@example.test',
    });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://brevo.test/v3/smtp/email');
    expect(init.headers).toMatchObject({ 'api-key': opts.apiKey });
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      sender: { email: 'sender@example.test', name: 'TalentSphere' },
      to: [{ email: 'recipient@example.test' }],
      replyTo: { email: 'help@example.test' },
      subject: 'Subject',
      textContent: sampleEmail.text,
      headers: { 'X-TS-Idempotency-Key': 'job_1' },
    });
    expect(r.messageId).toBe('<m@brevo>');
  });
});
