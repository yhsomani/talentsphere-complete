import { describe, it, expect } from 'vitest';
import { createStripeGateway } from '../../apps/api/src/stripe-gateway.js';

const gatewayFailingWith = (code: string) =>
  createStripeGateway({
    secretKey: 'sk_test_unit',
    webhookSecret: 'whsec_unit',
    logger: { error: () => undefined },
    client: {
      customers: {
        del: async () => {
          throw Object.assign(new Error('provider failure'), { code });
        },
      },
    } as never,
  });

describe('Stripe gateway deleteCustomer (account erasure)', () => {
  it('treats an already-deleted customer as done so a retried erasure can finish', async () => {
    await expect(
      gatewayFailingWith('resource_missing').deleteCustomer('cus_gone')
    ).resolves.toBeUndefined();
  });

  it('still refuses other provider failures', async () => {
    await expect(gatewayFailingWith('api_error').deleteCustomer('cus_x')).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });
});
