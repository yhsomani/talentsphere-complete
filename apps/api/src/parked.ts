/**
 * Routes of parked features (decision TPD-04, docs/product/TRANSFORMATION_PLAN.md
 * §4.3). Each route belongs to one feature in PARKED_FEATURES; where that
 * feature is off (isParkedFeatureEnabled) the route answers 404 before any
 * handler or authentication runs. No web screen calls these routes.
 * tests/integration/parked-features.test.ts checks every listed route exists.
 */
import type { ParkedFeatureKey } from '@talentsphere/domain';

const routes: Record<ParkedFeatureKey, readonly string[]> = {
  FEATURE_BEHAVIORAL_SCORING: [
    'POST /api/v1/recruiter/discovery/behavioral/compute',
    'GET /api/v1/recruiter/discovery/behavioral',
    'GET /api/v1/recruiter/discovery/behavioral/:candidateId',
    'POST /api/v1/recruiter/talent-segmentation/classify',
    'GET /api/v1/recruiter/talent-segmentation/segments',
    'GET /api/v1/recruiter/talent-segmentation/candidates',
    'GET /api/v1/recruiter/talent-segmentation/candidates/:candidateId',
    'POST /api/v1/career/transition-probability',
  ],
  FEATURE_REPUTATION: [
    'POST /api/v1/reputation/signals',
    'GET /api/v1/reputation/users/:userId',
    'GET /api/v1/reputation/my/signals',
    'POST /api/v1/reputation/recovery',
    'POST /api/v1/reputation/recovery/:planId/tasks/:taskId/complete',
    'POST /api/v1/reputation/recalculate-all',
    'GET /api/v1/reputation/instructors/:instructorId',
    'POST /api/v1/reputation/instructors/:instructorId/metrics',
    'POST /api/v1/reputation/instructors/:instructorId/endorse',
    'POST /api/v1/reputation/instructors/:instructorId/reviews',
    'POST /api/v1/reputation/instructors/recompute',
    'GET /api/v1/reputation/organizations/:organizationId',
    'POST /api/v1/reputation/organizations/:organizationId/reviews',
    'POST /api/v1/reputation/organizations/:organizationId/metrics',
    'GET /api/v1/reputation/organizations/:organizationId/reviews',
    'POST /api/v1/activity/events',
    'GET /api/v1/activity/events',
    'GET /api/v1/activity/scores/me',
    'GET /api/v1/activity/users/:userId/score',
    'POST /api/v1/activity/recalculate',
  ],
  FEATURE_GAMIFICATION: [
    'GET /api/v1/xp/ledger',
    'GET /api/v1/gamification/summary',
    'GET /api/v1/gamification/transactions',
    'GET /api/v1/gamification/badges',
    'GET /api/v1/gamification/leaderboard',
    'POST /api/v1/gamification/claim-activity',
  ],
  FEATURE_MARKET_INSIGHTS: [
    'GET /api/v1/salaries/benchmarks',
    'GET /api/v1/salaries/company/:companyName',
    'GET /api/v1/skills/forecast/top-growth',
    'POST /api/v1/skills/:skillId/market-signals',
    'GET /api/v1/skills/:skillId/forecast',
    'POST /api/v1/skills/:skillId/forecast/generate',
    'POST /api/v1/learning/impact/outcomes',
    'GET /api/v1/learning/impact/courses/:courseId',
    'POST /api/v1/learning/impact/courses/:courseId/compute',
    'GET /api/v1/learning/impact/dashboard',
  ],
};

/** `METHOD /path` (the key `routeKey` in durability.ts builds) to its parked feature. */
export const PARKED_ROUTES: ReadonlyMap<string, ParkedFeatureKey> = new Map(
  (Object.entries(routes) as [ParkedFeatureKey, readonly string[]][]).flatMap(([feature, keys]) =>
    keys.map((key) => [key, feature] as const)
  )
);
