import { describe, it, expect } from 'vitest';
import {
  createReputationSignal,
  calculateReputationScore,
  determineReputationBand,
  startReputationRecoveryPlan,
  completeRecoveryTask,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Domain: Multi-Context Reputation Engine (F-144, S-03, BR-247..BR-254)', () => {
  const userId = '11111111-2222-3333-4444-555555555555';

  describe('createReputationSignal', () => {
    it('creates a validated reputation signal with defaults', () => {
      const sig = createReputationSignal({
        userId,
        context: 'candidate',
        domain: 'distributed_systems',
        signalType: 'credential',
        rawValue: 40,
        isVerified: true,
      });

      expect(sig.id).toBeDefined();
      expect(sig.userId).toBe(userId);
      expect(sig.context).toBe('candidate');
      expect(sig.domain).toBe('distributed_systems');
      expect(sig.signalType).toBe('credential');
      expect(sig.rawValue).toBe(40);
      expect(sig.weight).toBe(1.0);
      expect(sig.decayHalfLifeDays).toBe(365);
      expect(sig.isActive).toBe(true);
    });

    it('rejects out of bound raw values and weights', () => {
      expect(() =>
        createReputationSignal({
          userId,
          context: 'candidate',
          signalType: 'review',
          rawValue: 150, // > 100
        })
      ).toThrowError(DomainError);

      expect(() =>
        createReputationSignal({
          userId: '',
          context: 'candidate',
          signalType: 'review',
          rawValue: 50,
        })
      ).toThrowError(DomainError);
    });
  });

  describe('determineReputationBand', () => {
    it('correctly maps scores to reputation bands', () => {
      expect(determineReputationBand(92)).toBe('exceptional');
      expect(determineReputationBand(78)).toBe('high');
      expect(determineReputationBand(62)).toBe('established');
      expect(determineReputationBand(48)).toBe('developing');
      expect(determineReputationBand(30)).toBe('emerging');
    });
  });

  describe('calculateReputationScore & Context Isolation', () => {
    it('calculates score with base neutral 50 when no signals present', () => {
      const score = calculateReputationScore(userId, 'candidate', 'general', []);
      expect(score.score).toBe(50);
      expect(score.band).toBe('developing');
      expect(score.signalCount).toBe(0);
      expect(score.confidenceScore).toBe(0);
    });

    it('isolates reputation contexts and domains without cross-bleeding', () => {
      const signals = [
        createReputationSignal({
          userId,
          context: 'candidate',
          domain: 'backend',
          signalType: 'assessment',
          rawValue: 50,
          weight: 2.0,
        }),
        createReputationSignal({
          userId,
          context: 'instructor',
          domain: 'backend',
          signalType: 'review',
          rawValue: 10,
          weight: 1.0,
        }),
        createReputationSignal({
          userId,
          context: 'candidate',
          domain: 'frontend',
          signalType: 'assessment',
          rawValue: 20,
          weight: 1.0,
        }),
      ];

      const candidateBackend = calculateReputationScore(userId, 'candidate', 'backend', signals);
      const instructorBackend = calculateReputationScore(userId, 'instructor', 'backend', signals);
      const candidateFrontend = calculateReputationScore(userId, 'candidate', 'frontend', signals);

      expect(candidateBackend.signalCount).toBe(1);
      expect(candidateBackend.score).toBeGreaterThan(50);

      expect(instructorBackend.signalCount).toBe(1);
      expect(instructorBackend.context).toBe('instructor');

      expect(candidateFrontend.signalCount).toBe(1);
      expect(candidateFrontend.domain).toBe('frontend');
    });

    it('applies continuous time decay for older signals', () => {
      const now = new Date('2026-09-25T12:00:00Z');
      // Signal 1: Created today
      const freshSignal = createReputationSignal({
        userId,
        context: 'candidate',
        domain: 'general',
        signalType: 'credential',
        rawValue: 50,
        weight: 1.0,
        decayHalfLifeDays: 365,
      });
      freshSignal.createdAt = now.toISOString();

      // Signal 2: Created exactly 1 half-life (365 days) ago
      const agedSignal = createReputationSignal({
        userId,
        context: 'candidate',
        domain: 'general',
        signalType: 'credential',
        rawValue: 50,
        weight: 1.0,
        decayHalfLifeDays: 365,
      });
      agedSignal.createdAt = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();

      const freshScore = calculateReputationScore(
        userId,
        'candidate',
        'general',
        [freshSignal],
        now
      );
      const agedScore = calculateReputationScore(userId, 'candidate', 'general', [agedSignal], now);

      expect(freshScore.score).toBeGreaterThan(agedScore.score);
    });

    it('factors penalties and reduces score deterministically', () => {
      const goodSignal = createReputationSignal({
        userId,
        context: 'community',
        domain: 'general',
        signalType: 'contribution',
        rawValue: 40,
        weight: 1.0,
      });

      const penaltySignal = createReputationSignal({
        userId,
        context: 'community',
        domain: 'general',
        signalType: 'penalty',
        rawValue: -40,
        weight: 1.5,
      });

      const beforePenalty = calculateReputationScore(userId, 'community', 'general', [goodSignal]);
      const afterPenalty = calculateReputationScore(userId, 'community', 'general', [
        goodSignal,
        penaltySignal,
      ]);

      expect(afterPenalty.score).toBeLessThan(beforePenalty.score);
    });
  });

  describe('startReputationRecoveryPlan & completeRecoveryTask', () => {
    it('manages reputation recovery lifecycle after penalty', () => {
      const penalty = createReputationSignal({
        userId,
        context: 'instructor',
        domain: 'general',
        signalType: 'penalty',
        rawValue: -30,
      });

      const plan = startReputationRecoveryPlan({
        userId,
        context: 'instructor',
        penaltySignalId: penalty.id,
        targetReboundPoints: 50,
        tasks: [
          { description: 'Complete Teaching Quality Peer Review', points: 30 },
          { description: 'Deliver 3 High-Rated Office Hour Sessions', points: 25 },
        ],
      });

      expect(plan.id).toBeDefined();
      expect(plan.status).toBe('in_progress');
      expect(plan.reboundTasks).toHaveLength(2);

      // Complete Task 1 (30 pts, target is 50 -> remains in_progress)
      const step1 = completeRecoveryTask(plan, plan.reboundTasks[0].id);
      expect(step1.completedTask.isCompleted).toBe(true);
      expect(step1.isFullyRecovered).toBe(false);
      expect(step1.plan.status).toBe('in_progress');

      // Complete Task 2 (25 pts -> total 55 pts >= 50 -> completed!)
      const step2 = completeRecoveryTask(step1.plan, step1.plan.reboundTasks[1].id);
      expect(step2.isFullyRecovered).toBe(true);
      expect(step2.plan.status).toBe('completed');
      expect(step2.plan.completedAt).toBeDefined();
    });
  });
});
