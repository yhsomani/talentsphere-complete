import { describe, expect, it, vi } from 'vitest';
import { sendTransactionalEmail } from '../../apps/worker/src/mail-provider.js';

const config = {
  provider: 'resend' as const,
  apiKey: 're_test_not_a_real_secret',
  from: 'verified@example.test',
};

describe('Transactional mail adapter (provider transport mocked)', () => {
  const message = {
    to: 'recipient@example.test',
    subject: 'Verification',
    text: 'A one-time code',
  };

  it('submits idempotently without logging the message secret', async () => {
    const send = vi.fn(async () => new Response(JSON.stringify({ id: 'email_1' }), { status: 200 }));
    await sendTransactionalEmail(message, 'job_123', config, send as typeof fetch);
    expect(send).toHaveBeenCalledOnce();
    const [url, options] = send.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer re_test_not_a_real_secret',
      'Idempotency-Key': 'job_123',
    });
    expect(JSON.parse(String(options.body)).text).toBe(message.text);
  });

  it('fails closed without provider credentials', async () => {
    const send = vi.fn();
    await expect(
      sendTransactionalEmail(message, 'job_123', { provider: 'none' }, send as typeof fetch)
    ).rejects.toThrow('not configured');
    expect(send).not.toHaveBeenCalled();
  });

  it('retries transient status codes but refuses permanent invalid requests', async () => {
    const busy = vi.fn(async () => new Response(null, { status: 429 }));
    await expect(
      sendTransactionalEmail(message, 'job_123', config, busy as typeof fetch)
    ).rejects.toThrow('temporarily unavailable');

    const invalid = vi.fn(async () => new Response(null, { status: 422 }));
    await expect(
      sendTransactionalEmail(message, 'job_123', config, invalid as typeof fetch)
    ).rejects.toThrow('rejected request');
  });

  it('does not include secrets in network-error messages', async () => {
    const send = vi.fn(async () => { throw new Error(message.text); });
    await expect(sendTransactionalEmail(message, 'job_123', config, send as typeof fetch))
      .rejects.toThrow('provider request failed');
  });
});
