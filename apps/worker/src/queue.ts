import crypto from 'node:crypto';
import { createLogger } from '@talentsphere/observability';

export interface Job<T = unknown> {
  id: string;
  type: string;
  payload: T;
  attempts: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  idempotencyKey?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobHandler<T = unknown> = (job: Job<T>) => Promise<void>;

export class JobQueueEngine {
  private queue: Job[] = [];
  private deadLetterQueue: Job[] = [];
  private processedKeys = new Set<string>();
  private handlers = new Map<string, JobHandler<any>>();
  private logger = createLogger({ name: 'talentsphere-worker' });

  registerHandler<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler);
  }

  async enqueue<T>(type: string, payload: T, options: { maxRetries?: number; idempotencyKey?: string } = {}): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job_${crypto.randomUUID()}`,
      type,
      payload,
      attempts: 0,
      maxRetries: options.maxRetries ?? 3,
      status: 'pending',
      idempotencyKey: options.idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.queue.push(job);
    this.logger.info({ jobId: job.id, type: job.type }, 'Job enqueued');
    return job;
  }

  async processNext(): Promise<boolean> {
    const job = this.queue.shift();
    if (!job) {
      return false;
    }

    // Idempotency Check
    if (job.idempotencyKey && this.processedKeys.has(job.idempotencyKey)) {
      this.logger.info({ jobId: job.id, idempotencyKey: job.idempotencyKey }, 'Skipping already processed job (idempotent)');
      job.status = 'completed';
      return true;
    }

    const handler = this.handlers.get(job.type);
    if (!handler) {
      this.logger.warn({ jobId: job.id, type: job.type }, 'No handler registered for job type. Sending to DLQ.');
      job.status = 'dead_letter';
      job.error = `No handler for job type: ${job.type}`;
      this.deadLetterQueue.push(job);
      return true;
    }

    job.attempts += 1;
    job.status = 'processing';
    job.updatedAt = new Date().toISOString();

    try {
      await handler(job);
      job.status = 'completed';
      job.updatedAt = new Date().toISOString();

      if (job.idempotencyKey) {
        this.processedKeys.add(job.idempotencyKey);
      }

      this.logger.info({ jobId: job.id, type: job.type }, 'Job completed successfully');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      job.error = errorMessage;
      job.updatedAt = new Date().toISOString();

      if (job.attempts < job.maxRetries) {
        job.status = 'pending';
        this.logger.warn({ jobId: job.id, attempt: job.attempts, maxRetries: job.maxRetries, error: errorMessage }, 'Job failed. Re-queuing for retry.');
        this.queue.push(job); // Bounded retry
      } else {
        job.status = 'dead_letter';
        this.logger.error({ jobId: job.id, attempts: job.attempts, error: errorMessage }, 'Job exceeded max retries. Moved to DLQ.');
        this.deadLetterQueue.push(job);
      }

      return false;
    }
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  getDLQCount(): number {
    return this.deadLetterQueue.length;
  }

  getDLQ(): readonly Job[] {
    return this.deadLetterQueue;
  }
}
