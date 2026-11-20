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

describe('Stripe gateway retrieveSubscription (C-21)', () => {
  const gatewayWith = (retrieve: (id: string) => Promise<unknown>) =>
    createStripeGateway({
      secretKey: 'sk_test_unit',
      webhookSecret: 'whsec_unit',
      logger: { error: () => undefined },
      client: { subscriptions: { retrieve } } as never,
    });

  it("normalises Stripe's current state and keeps the triggering event's time", async () => {
    const seen: string[] = [];
    const snapshot = await gatewayWith(async (id) => {
      seen.push(id);
      return {
        id,
        customer: { id: 'cus_1' },
        status: 'active',
        cancel_at_period_end: false,
        canceled_at: null,
        start_date: 100,
        items: {
          data: [{ price: { id: 'price_x' }, current_period_start: 200, current_period_end: 300 }],
        },
      };
    }).retrieveSubscription('sub_1', 12345);
    expect(seen).toEqual(['sub_1']);
    expect(snapshot).toEqual({
      id: 'sub_1',
      customerId: 'cus_1',
      status: 'active',
      priceId: 'price_x',
      cancelAtPeriodEnd: false,
      canceledAt: null,
      currentPeriodStart: 200,
      currentPeriodEnd: 300,
      eventCreated: 12345,
    });
  });

  it('turns a provider failure into SERVICE_UNAVAILABLE', async () => {
    await expect(
      gatewayWith(async () => {
        throw Object.assign(new Error('down'), { type: 'StripeConnectionError' });
      }).retrieveSubscription('sub_1', 1)
    ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
  });
});
