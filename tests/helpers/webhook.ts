import crypto from 'node:crypto';
import { TEST_WEBHOOK_SECRET } from '../../test-secrets.mjs';

/**
 * Signs a billing webhook body the way a payment provider would:
 * x-talentsphere-signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "t.body">.
 * Returns the exact body string that was signed — send it verbatim.
 */
export function signWebhook(
  payload: unknown,
  options: { secret?: string; timestamp?: number } = {}
): { body: string; headers: Record<string, string> } {
  const body = JSON.stringify(payload);
  const t = options.timestamp ?? Math.floor(Date.now() / 1000);
  const v1 = crypto
    .createHmac('sha256', options.secret ?? TEST_WEBHOOK_SECRET)
    .update(`${t}.${body}`)
    .digest('hex');
  return {
    body,
    headers: { 'content-type': 'application/json', 'x-talentsphere-signature': `t=${t},v1=${v1}` },
  };
}
