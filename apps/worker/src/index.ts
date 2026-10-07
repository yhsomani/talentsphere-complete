import { JobQueueEngine } from './queue.js';
import { createLogger } from '@talentsphere/observability';

const logger = createLogger({ name: 'talentsphere-worker' });
export const queueEngine = new JobQueueEngine();

// Register background task handlers
queueEngine.registerHandler('evidence.propagate', async (job) => {
  logger.info({ payload: job.payload }, 'Propagating evidence to Career Graph');
});

queueEngine.registerHandler('notifications.send', async (job) => {
  logger.info({ payload: job.payload }, 'Delivering queued notification');
});

queueEngine.registerHandler('analytics.aggregate', async (job) => {
  logger.info({ payload: job.payload }, 'Aggregating daily platform metrics');
});

async function runWorker() {
  logger.info('TalentSphere Async Worker started.');
  while (true) {
    const hasJob = await queueEngine.processNext();
    if (!hasJob) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  runWorker().catch((err) => {
    logger.error(err, 'Worker process crashed');
    process.exit(1);
  });
}
