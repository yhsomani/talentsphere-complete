import { describe, expect, it } from 'vitest';
import { MemoryFeatureFlagStore } from '../../apps/api/src/storage/feature-flag-store.js';

describe('MemoryFeatureFlagStore', () => {
  it('starts with the five platform defaults', async () => {
    const flags = await new MemoryFeatureFlagStore().list();
    expect(flags.map((f) => f.key).sort()).toEqual([
      'FEATURE_AI_MATCHING',
      'FEATURE_CODE_ARENA',
      'FEATURE_LMS',
      'FEATURE_MESSAGING',
      'FEATURE_NOTIFICATIONS',
    ]);
  });

  it('replaces a flag on upsert', async () => {
    const store = new MemoryFeatureFlagStore();
    const current = (await store.get('FEATURE_AI_MATCHING'))!;
    await store.upsert({ ...current, enabled: true });
    expect((await store.get('FEATURE_AI_MATCHING'))?.enabled).toBe(true);
  });
});
