import { afterEach, beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
// The class the API's memory storage instantiates (the built package, as the
// server resolves it), so a spy on its prototype reaches the server's store.
import { MemoryJobStore } from '../../packages/domain/dist/index.js';

/**
 * K-05: the work-email code and reference-invitation budgets (C-06) are
 * reserved before the first await, so parallel requests cannot all pass the
 * same check; a failed send gives its reservation back and removes the
 * challenge it wrote, so an immediate retry is not refused by the cooldown.
 */
describe('Email send budgets under concurrency and failure (K-05)', () => {
  let app: FastifyInstance;
  let seq = 0;

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: '0', LOG_LEVEL: 'fatal' } as never);
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const candidate = async (histories: number) => {
    seq += 1;
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `race.${seq}.${Date.now()}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: `Race Candidate ${seq}`,
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    const token = JSON.parse(res.body).token as string;
    const ids: string[] = [];
    for (let i = 0; i < histories; i++) {
      const entry = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          companyName: `Race Corp ${i}`,
          title: 'Engineer',
          startDate: '2019-01-01',
          endDate: '2021-01-01',
          isCurrent: false,
        },
      });
      expect(entry.statusCode).toBe(201);
      ids.push(JSON.parse(entry.body).workHistory.id as string);
    }
    return { token, ids };
  };
  const requestCode = (token: string, historyId: string, n: number) =>
    app.inject({
      method: 'POST',
      url: `/api/v1/candidates/work-history/${historyId}/verify-email`,
      headers: { authorization: `Bearer ${token}` },
      payload: { corporateEmail: `race.${n}.${historyId}@racecorp.io` },
    });
  const count = (statuses: number[], code: number) => statuses.filter((s) => s === code).length;
  // A queue that answers after a real I/O delay, so parallel requests overlap
  // between the budget check and the end of the send (memory storage is
  // otherwise too fast for them to interleave).
  const slowQueue = () => {
    const original = MemoryJobStore.prototype.enqueue;
    vi.spyOn(MemoryJobStore.prototype, 'enqueue').mockImplementation(async function (
      this: MemoryJobStore,
      input
    ) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return original.call(this, input);
    });
  };

  it('7 parallel code requests across 7 records of one account: exactly 5 accepted', async () => {
    const who = await candidate(7);
    slowQueue();
    const statuses = (await Promise.all(who.ids.map((id, n) => requestCode(who.token, id, n)))).map(
      (r) => r.statusCode
    );
    expect(count(statuses, 202)).toBe(5);
    expect(count(statuses, 429)).toBe(2);
  });

  it('12 parallel reference requests: exactly 10 accepted', async () => {
    const who = await candidate(1);
    const historyId = who.ids[0]!;
    slowQueue();
    const statuses = (
      await Promise.all(
        Array.from({ length: 12 }, (_, n) =>
          app.inject({
            method: 'POST',
            url: `/api/v1/candidates/work-history/${historyId}/references/request`,
            headers: { authorization: `Bearer ${who.token}` },
            payload: {
              refereeName: `Referee ${n}`,
              refereeEmail: `referee.${n}.${historyId}@corp.test`,
              relationship: 'peer',
            },
          })
        )
      )
    ).map((r) => r.statusCode);
    expect(count(statuses, 201)).toBe(10);
    expect(count(statuses, 429)).toBe(2);
  });

  it('a failed enqueue releases the budget and the challenge: the retry is accepted, not 429', async () => {
    const who = await candidate(6);
    vi.spyOn(MemoryJobStore.prototype, 'enqueue').mockRejectedValueOnce(new Error('queue down'));
    const failed = await requestCode(who.token, who.ids[0]!, 0);
    expect(failed.statusCode).toBe(503);
    expect(failed.json().error.code).toBe('SERVICE_UNAVAILABLE');
    // Same record, immediately: no cooldown from a code that was never queued.
    expect((await requestCode(who.token, who.ids[0]!, 0)).statusCode).toBe(202);
    // The failed attempt consumed no budget: 4 more are accepted, then 429.
    const statuses: number[] = [];
    for (let i = 1; i <= 5; i++)
      statuses.push((await requestCode(who.token, who.ids[i]!, i)).statusCode);
    expect(statuses).toEqual([202, 202, 202, 202, 429]);
  });

  it('a failed reference enqueue does not consume the reference budget', async () => {
    const who = await candidate(1);
    const historyId = who.ids[0]!;
    const ask = (n: number) =>
      app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${historyId}/references/request`,
        headers: { authorization: `Bearer ${who.token}` },
        payload: {
          refereeName: `Referee ${n}`,
          refereeEmail: `budget.${n}.${historyId}@corp.test`,
          relationship: 'peer',
        },
      });
    vi.spyOn(MemoryJobStore.prototype, 'enqueue').mockRejectedValueOnce(new Error('queue down'));
    expect((await ask(0)).statusCode).toBe(503);
    const statuses: number[] = [];
    for (let n = 1; n <= 11; n++) statuses.push((await ask(n)).statusCode);
    expect(count(statuses, 201)).toBe(10);
    expect(statuses[10]).toBe(429);
  });
});
