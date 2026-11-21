import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createStableKeyer } from '../../apps/web/src/lib/idempotency.js';

describe('Stable idempotency keys (C-21 a)', () => {
  it('reuses the key while the payload is unchanged and mints a new one when it changes', () => {
    const keyer = createStableKeyer();
    const first = keyer({ planTier: 'candidate_pro', billingCycle: 'monthly' });
    expect(keyer({ planTier: 'candidate_pro', billingCycle: 'monthly' })).toBe(first);
    const yearly = keyer({ planTier: 'candidate_pro', billingCycle: 'yearly' });
    expect(yearly).not.toBe(first);
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('PaidPlans sends a checkout idempotencyKey from one keyer per component instance', () => {
    // Behaviour is driven in tests/e2e/checkout-idempotency.spec.ts; this
    // pins the wiring for the unit suite (no DOM renderer in this repo).
    const source = fs.readFileSync(path.resolve('apps/web/src/components/PaidPlans.tsx'), 'utf8');
    expect(source).toMatch(/const checkoutKeyer = useRef\(createStableKeyer\(\)\)/);
    expect(source).toMatch(/idempotencyKey: checkoutKeyer\.current\(\{/);
  });
});
