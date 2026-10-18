import { describe, expect, it } from 'vitest';
import { buildApp } from '../../apps/api/src/server.js';

describe('Email delivery fails closed outside development', () => {
  it.each(['staging', 'production'])(
    'does not claim email or reference delivery in %s',
    async (environment) => {
      // The startup guard is tested separately. The factory permits isolated
      // deployed-environment API behavior tests using disposable memory storage.
      const app = await buildApp({ NODE_ENV: environment, STORAGE: 'memory', LOG_LEVEL: 'error' });
      try {
        const registered = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email: 'no-delivery-' + environment + '@example.com',
            password: 'Password123!Secure',
            fullName: 'No Delivery Tester',
            role: 'candidate',
          },
        });
        expect(registered.statusCode).toBe(201);
        const token = JSON.parse(registered.body).token;
        const headers = { authorization: 'Bearer ' + token };
        const history = await app.inject({
          method: 'POST',
          url: '/api/v1/candidates/work-history',
          headers,
          payload: {
            companyName: 'Example',
            title: 'Developer',
            startDate: '2022-01-01',
            endDate: '2023-01-01',
          },
        });
        expect(history.statusCode).toBe(201);
        const id = JSON.parse(history.body).workHistory.id;

        const email = await app.inject({
          method: 'POST',
          url: '/api/v1/candidates/work-history/' + id + '/verify-email',
          headers,
          payload: { corporateEmail: 'tester@example.com' },
        });
        expect(email.statusCode).toBe(503);
        expect(JSON.parse(email.body).error.code).toBe('SERVICE_UNAVAILABLE');

        const reference = await app.inject({
          method: 'POST',
          url: '/api/v1/candidates/work-history/' + id + '/references/request',
          headers,
          payload: {
            refereeName: 'Example Manager',
            refereeEmail: 'manager@example.com',
            relationship: 'manager',
          },
        });
        expect(reference.statusCode).toBe(503);
        expect(JSON.parse(reference.body).error.code).toBe('SERVICE_UNAVAILABLE');
      } finally {
        await app.close();
      }
    }
  );
});
