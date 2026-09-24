import { describe, it, expect } from 'vitest';
import { JobQueueEngine } from '../../apps/worker/src/queue.js';

describe('Async Worker Queue Engine & DLQ (Section 22, E-01)', () => {
  it('enqueues and processes a job successfully', async () => {
    const engine = new JobQueueEngine();
    let processed = false;

    engine.registerHandler<{ text: string }>('test.job', async (job) => {
      expect(job.payload.text).toBe('hello world');
      processed = true;
    });

    const job = await engine.enqueue('test.job', { text: 'hello world' });
    expect(job.status).toBe('pending');
    expect(job.id.startsWith('job_')).toBe(true);

    const success = await engine.processNext();
    expect(success).toBe(true);
    expect(processed).toBe(true);
    expect(engine.getPendingCount()).toBe(0);
  });

  it('enforces idempotency using idempotencyKey', async () => {
    const engine = new JobQueueEngine();
    let executionCount = 0;

    engine.registerHandler('payment.process', async () => {
      executionCount += 1;
    });

    const key = 'idem_key_unique_123';
    await engine.enqueue('payment.process', { amount: 100 }, { idempotencyKey: key });
    await engine.processNext();
    expect(executionCount).toBe(1);

    // Enqueue second job with same key
    await engine.enqueue('payment.process', { amount: 100 }, { idempotencyKey: key });
    await engine.processNext();
    // Execution count must remain 1
    expect(executionCount).toBe(1);
  });

  it('performs bounded retries and moves permanently failing jobs to DLQ', async () => {
    const engine = new JobQueueEngine();
    let attempts = 0;

    engine.registerHandler('failing.job', async () => {
      attempts += 1;
      throw new Error('Network timeout during external API call');
    });

    // Enqueue with maxRetries: 2
    await engine.enqueue('failing.job', {}, { maxRetries: 2 });

    // Attempt 1: Fails, re-queued
    const res1 = await engine.processNext();
    expect(res1).toBe(false);
    expect(attempts).toBe(1);
    expect(engine.getPendingCount()).toBe(1);
    expect(engine.getDLQCount()).toBe(0);

    // Attempt 2: Fails, exceeds maxRetries -> DLQ
    const res2 = await engine.processNext();
    expect(res2).toBe(false);
    expect(attempts).toBe(2);
    expect(engine.getPendingCount()).toBe(0);
    expect(engine.getDLQCount()).toBe(1);

    const dlqJobs = engine.getDLQ();
    expect(dlqJobs[0]?.status).toBe('dead_letter');
    expect(dlqJobs[0]?.error).toContain('Network timeout');
  });

  it('routes jobs with unregistered handlers directly to DLQ', async () => {
    const engine = new JobQueueEngine();
    await engine.enqueue('unregistered.type', {});

    const processed = await engine.processNext();
    expect(processed).toBe(true);
    expect(engine.getDLQCount()).toBe(1);
    expect(engine.getDLQ()[0]?.status).toBe('dead_letter');
  });
});
