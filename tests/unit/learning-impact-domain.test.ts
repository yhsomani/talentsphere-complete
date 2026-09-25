import { describe, it, expect } from 'vitest';
import {
  recordLearningOutcome,
  computeLearningImpactMetrics,
  aggregateLearningImpactDashboard,
  CORRELATION_DISCLAIMER_LABEL,
  LearningOutcome,
} from '../../packages/domain/src/learning-impact.js';
import { DomainError } from '../../packages/domain/src/index.js';

describe('Learning Impact Domain Logic (F-153, F-114, BR-189..BR-193, OD-51)', () => {
  const userId = '11111111-2222-3333-4444-555555555555';
  const courseId = '22222222-3333-4444-5555-666666666666';

  describe('recordLearningOutcome (BR-190)', () => {
    it('successfully records a learning outcome with explicit opt-in consent', () => {
      const outcome = recordLearningOutcome({
        userId,
        courseId,
        hiredWithin12m: true,
        salaryGrowthPct: 22.5,
        jobSatisfactionScore: 4.5,
        retentionMonths: 12,
        promotedWithin18m: true,
        skillsUsedOnJob: ['TypeScript', 'Distributed Systems'],
        consentFlag: true,
      });

      expect(outcome.id).toBeDefined();
      expect(outcome.userId).toBe(userId);
      expect(outcome.courseId).toBe(courseId);
      expect(outcome.hiredWithin12m).toBe(true);
      expect(outcome.salaryGrowthPct).toBe(22.5);
      expect(outcome.jobSatisfactionScore).toBe(4.5);
      expect(outcome.retentionMonths).toBe(12);
      expect(outcome.promotedWithin18m).toBe(true);
      expect(outcome.skillsUsedOnJob).toContain('TypeScript');
      expect(outcome.consentFlag).toBe(true);
    });

    it('rejects recording when consent flag is false (BR-190 policy violation)', () => {
      expect(() =>
        recordLearningOutcome({
          userId,
          courseId,
          hiredWithin12m: true,
          consentFlag: false,
        })
      ).toThrowError(
        new DomainError(
          'POLICY_VIOLATION',
          'BR-190: Learner outcome tracking requires explicit user consent.'
        )
      );
    });

    it('rejects missing or empty userId or courseId', () => {
      expect(() =>
        recordLearningOutcome({
          userId: '',
          courseId,
          hiredWithin12m: false,
          consentFlag: true,
        })
      ).toThrowError(/User ID is required/);

      expect(() =>
        recordLearningOutcome({
          userId,
          courseId: '   ',
          hiredWithin12m: false,
          consentFlag: true,
        })
      ).toThrowError(/Course ID is required/);
    });

    it('rejects invalid job satisfaction scores outside 1.0 - 5.0 range', () => {
      expect(() =>
        recordLearningOutcome({
          userId,
          courseId,
          hiredWithin12m: true,
          jobSatisfactionScore: 0.5,
          consentFlag: true,
        })
      ).toThrowError(/between 1.0 and 5.0/);

      expect(() =>
        recordLearningOutcome({
          userId,
          courseId,
          hiredWithin12m: true,
          jobSatisfactionScore: 5.5,
          consentFlag: true,
        })
      ).toThrowError(/between 1.0 and 5.0/);
    });

    it('rejects negative retention months', () => {
      expect(() =>
        recordLearningOutcome({
          userId,
          courseId,
          hiredWithin12m: true,
          retentionMonths: -3,
          consentFlag: true,
        })
      ).toThrowError(/non-negative integer/);
    });
  });

  describe('computeLearningImpactMetrics (BR-189, BR-193, OD-51)', () => {
    // Generate cohort of 35 learners (meets k >= 30 threshold)
    const cohort35: LearningOutcome[] = [];
    for (let i = 0; i < 35; i++) {
      cohort35.push({
        id: `outcome-c35-${i}`,
        userId: `user-c35-${i}`,
        courseId,
        completedAt: '2025-01-15T00:00:00Z',
        hiredWithin12m: i < 28, // 28 of 35 hired (80%)
        salaryGrowthPct: 20 + (i % 10),
        jobSatisfactionScore: 4.0 + (i % 2) * 0.5,
        retentionMonths: i < 24 ? 9 : 3, // 24 of 28 retained >= 6m
        promotedWithin18m: i < 14, // 14 of 28 promoted
        skillsUsedOnJob: ['TypeScript', 'React'],
        consentFlag: true,
        createdAt: '2025-01-15T00:00:00Z',
      });
    }

    it('computes metrics and marks as publishable when cohort >= 30 (BR-189)', () => {
      const metrics = computeLearningImpactMetrics(courseId, cohort35, 40);

      expect(metrics.courseId).toBe(courseId);
      expect(metrics.sampleCount).toBe(35);
      expect(metrics.cohortSize).toBe(40);
      expect(metrics.isPublishable).toBe(true);
      expect(metrics.completionRatePct).toBe(87.5); // 35 / 40 * 100
      expect(metrics.hireRatePct).toBe(80); // 28 / 35 * 100
      expect(metrics.avgSalaryDeltaPct).toBeGreaterThan(20);
      expect(metrics.avgJobSatisfaction).toBeGreaterThanOrEqual(4.0);
      expect(metrics.retentionRatePct).toBeCloseTo(85.71, 1); // 24 / 28
      expect(metrics.advancementRatePct).toBe(50); // 14 / 28
      expect(metrics.skillUtilizationPct).toBe(100);
      expect(metrics.pathEffectivenessScore).toBeGreaterThan(70);
      // BR-193, OD-51: All outcome claims labelled as correlational
      expect(metrics.correlationalClaimLabel).toBe(CORRELATION_DISCLAIMER_LABEL);
    });

    it('marks metrics as NOT publishable when cohort < 30 (BR-189 k-anonymity)', () => {
      const cohort20 = cohort35.slice(0, 20); // only 20 samples
      const metrics = computeLearningImpactMetrics(courseId, cohort20, 25);

      expect(metrics.sampleCount).toBe(20);
      expect(metrics.isPublishable).toBe(false);
      expect(metrics.correlationalClaimLabel).toBe(CORRELATION_DISCLAIMER_LABEL);
    });

    it('returns empty zero-initialized metrics when sampleCount is 0', () => {
      const metrics = computeLearningImpactMetrics(courseId, [], 50);

      expect(metrics.sampleCount).toBe(0);
      expect(metrics.isPublishable).toBe(false);
      expect(metrics.hireRatePct).toBe(0);
      expect(metrics.pathEffectivenessScore).toBe(0);
    });
  });

  describe('aggregateLearningImpactDashboard (F-153)', () => {
    it('aggregates multi-course metrics into platform dashboard rankings', () => {
      const metrics1 = {
        courseId: 'c1',
        cohortSize: 50,
        completionRatePct: 80,
        hireRatePct: 85,
        avgSalaryDeltaPct: 25,
        avgJobSatisfaction: 4.6,
        retentionRatePct: 90,
        advancementRatePct: 40,
        skillUtilizationPct: 95,
        pathEffectivenessScore: 84.5,
        correlationalClaimLabel: CORRELATION_DISCLAIMER_LABEL,
        sampleCount: 40,
        isPublishable: true,
        updatedAt: new Date().toISOString(),
      };

      const metrics2 = {
        courseId: 'c2',
        cohortSize: 60,
        completionRatePct: 75,
        hireRatePct: 70,
        avgSalaryDeltaPct: 18,
        avgJobSatisfaction: 4.2,
        retentionRatePct: 80,
        advancementRatePct: 30,
        skillUtilizationPct: 85,
        pathEffectivenessScore: 71.2,
        correlationalClaimLabel: CORRELATION_DISCLAIMER_LABEL,
        sampleCount: 45,
        isPublishable: true,
        updatedAt: new Date().toISOString(),
      };

      const metricsUnderK = {
        courseId: 'c3',
        cohortSize: 20,
        completionRatePct: 60,
        hireRatePct: 60,
        avgSalaryDeltaPct: 15,
        avgJobSatisfaction: 4.0,
        retentionRatePct: 70,
        advancementRatePct: 20,
        skillUtilizationPct: 70,
        pathEffectivenessScore: 55.0,
        correlationalClaimLabel: CORRELATION_DISCLAIMER_LABEL,
        sampleCount: 12,
        isPublishable: false,
        updatedAt: new Date().toISOString(),
      };

      const dashboard = aggregateLearningImpactDashboard([metrics1, metrics2, metricsUnderK]);

      expect(dashboard.totalCoursesTracked).toBe(3);
      expect(dashboard.totalOutcomesSampled).toBe(97); // 40 + 45 + 12
      expect(dashboard.averageHireRatePct).toBeGreaterThan(70);
      expect(dashboard.averageSalaryGrowthPct).toBeGreaterThan(18);
      // Only publishable courses appear in top performing rankings
      expect(dashboard.topPerformingCourses.length).toBe(2);
      expect(dashboard.topPerformingCourses[0].courseId).toBe('c1');
      expect(dashboard.topPerformingCourses[0].pathEffectivenessScore).toBe(84.5);
      expect(dashboard.correlationalDisclaimer).toBe(CORRELATION_DISCLAIMER_LABEL);
    });
  });
});
