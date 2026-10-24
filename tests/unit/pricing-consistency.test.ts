import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PLATFORM_PLANS,
  getPlanEntitlements,
  type PlanTier,
} from '../../packages/domain/src/index.js';

const read = (file: string) => readFileSync(resolve('.', file), 'utf8');
const pricing = read('docs/PRICING.md');
const tiers = Object.keys(PLATFORM_PLANS) as PlanTier[];
const paid = tiers.filter((t) => t !== 'free');
const ent = (t: PlanTier) => getPlanEntitlements('u', t);
const usd = (s: string) => Math.round(Number(s.replace(/[$,]/g, '')) * 100);

const planLabels: Record<PlanTier, string> = {
  free: 'Free',
  candidate_pro: 'Candidate Pro',
  recruiter_starter: 'Recruiter Starter',
  recruiter_enterprise: 'Recruiter Enterprise',
};

function docRows() {
  const section = pricing.split('## Segments and plans')[1]?.split('\n## ')[0] ?? '';
  const rows = section
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    );
  return new Map(rows.slice(2).map((r) => [r[0], r]));
}

describe('pricing consistency', () => {
  it('every plan tier has a matching entitlement entry', () => {
    for (const t of tiers) {
      expect(PLATFORM_PLANS[t].tier, t).toBe(t);
      expect(ent(t).planTier, t).toBe(t);
    }
  });

  it('prices are integer minor units; free is 0/0; yearly is exactly 10x monthly', () => {
    for (const t of tiers) {
      expect(Number.isInteger(PLATFORM_PLANS[t].priceMonthlyCents), `${t} monthly`).toBe(true);
      expect(Number.isInteger(PLATFORM_PLANS[t].priceYearlyCents), `${t} yearly`).toBe(true);
    }
    expect([PLATFORM_PLANS.free.priceMonthlyCents, PLATFORM_PLANS.free.priceYearlyCents]).toEqual([
      0, 0,
    ]);
    for (const t of paid) {
      expect(PLATFORM_PLANS[t].priceYearlyCents, `${t} yearly = 10 x monthly`).toBe(
        PLATFORM_PLANS[t].priceMonthlyCents * 10
      );
    }
  });

  it('paid plans out-limit free; recruiter job limits are ordered', () => {
    for (const t of paid) {
      expect(ent(t).aiDailyRequestsLimit, t).toBeGreaterThan(ent('free').aiDailyRequestsLimit);
    }
    expect(ent('recruiter_starter').activeJobsLimit).toBe(5);
    expect(ent('recruiter_enterprise').activeJobsLimit).toBeGreaterThan(
      ent('recruiter_starter').activeJobsLimit
    );
  });

  it('docs/PRICING.md plan table matches PLATFORM_PLANS and entitlements', () => {
    const rows = docRows();
    for (const t of tiers) {
      const row = rows.get(planLabels[t]);
      expect(row, `docs/PRICING.md has no row for "${planLabels[t]}"`).toBeDefined();
      const [, , monthly, yearly, ai] = row!;
      const p = PLATFORM_PLANS[t];
      expect(usd(monthly!), `${t} monthly drifted from docs/PRICING.md`).toBe(p.priceMonthlyCents);
      expect(usd(yearly!), `${t} yearly drifted from docs/PRICING.md`).toBe(p.priceYearlyCents);
      expect(
        Number(/(\d[\d,]*) req/.exec(ai!)?.[1]?.replace(/,/g, '')),
        `${t} AI requests drifted from docs/PRICING.md`
      ).toBe(ent(t).aiDailyRequestsLimit);
    }
  });

  it('every Stripe price env var in docs/PRICING.md exists in .env.example', () => {
    const names = [...new Set(pricing.match(/STRIPE_PRICE_[A-Z_]+[A-Z]/g) ?? [])];
    expect(names.length).toBeGreaterThanOrEqual(paid.length * 2);
    const env = read('.env.example');
    for (const n of names)
      expect(env, `${n} missing from .env.example`).toMatch(new RegExp(`\\b${n}=`));
  });
});
