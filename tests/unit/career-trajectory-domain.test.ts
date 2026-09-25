import { describe, it, expect } from 'vitest';
import {
  recordCareerTransition,
  calculateWilsonConfidenceInterval,
  calculateCareerTransitionProbability,
  generateProgressionPathways,
  projectSalaryTrajectory,
  evaluateMilestoneReadiness,
  CareerTransition,
} from '../../packages/domain/src/career-trajectory.js';
import { DomainError } from '../../packages/domain/src/index.js';

describe('Career Trajectory Domain Logic (F-152, F-85, BR-157..BR-163)', () => {
  const userId = '11111111-2222-3333-4444-555555555555';

  describe('recordCareerTransition (BR-157, BR-159, BR-161)', () => {
    it('successfully records a career transition with explicit opt-in consent', () => {
      const transition = recordCareerTransition({
        userId,
        fromRole: 'Software Engineer',
        toRole: 'Senior Software Engineer',
        salaryDelta: 25000,
        timeInRoleMonths: 28,
        consentFlag: true,
      });

      expect(transition.id).toBeDefined();
      expect(transition.userId).toBe(userId);
      expect(transition.fromRole).toBe('Software Engineer');
      expect(transition.toRole).toBe('Senior Software Engineer');
      expect(transition.salaryDelta).toBe(25000);
      expect(transition.timeInRoleMonths).toBe(28);
      expect(transition.consentFlag).toBe(true);
      expect(transition.transitionDate).toBeDefined();
    });

    it('rejects recording when consent flag is false (BR-157 policy violation)', () => {
      expect(() =>
        recordCareerTransition({
          userId,
          fromRole: 'Software Engineer',
          toRole: 'Senior Software Engineer',
          salaryDelta: 20000,
          timeInRoleMonths: 24,
          consentFlag: false,
        })
      ).toThrowError(
        new DomainError(
          'POLICY_VIOLATION',
          'BR-157: Career outcome tracking requires explicit user opt-in.'
        )
      );
    });

    it('rejects empty userId, fromRole, or toRole', () => {
      expect(() =>
        recordCareerTransition({
          userId: '',
          fromRole: 'Engineer',
          toRole: 'Senior Engineer',
          salaryDelta: 10000,
          timeInRoleMonths: 12,
          consentFlag: true,
        })
      ).toThrowError(/User ID is required/);

      expect(() =>
        recordCareerTransition({
          userId,
          fromRole: '   ',
          toRole: 'Senior Engineer',
          salaryDelta: 10000,
          timeInRoleMonths: 12,
          consentFlag: true,
        })
      ).toThrowError(/Origin role.*required/);

      expect(() =>
        recordCareerTransition({
          userId,
          fromRole: 'Engineer',
          toRole: '',
          salaryDelta: 10000,
          timeInRoleMonths: 12,
          consentFlag: true,
        })
      ).toThrowError(/Destination role.*required/);
    });

    it('rejects identical fromRole and toRole', () => {
      expect(() =>
        recordCareerTransition({
          userId,
          fromRole: 'Product Manager',
          toRole: 'product manager',
          salaryDelta: 5000,
          timeInRoleMonths: 18,
          consentFlag: true,
        })
      ).toThrowError(/cannot be identical/);
    });

    it('rejects non-positive or non-integer timeInRoleMonths', () => {
      expect(() =>
        recordCareerTransition({
          userId,
          fromRole: 'Engineer',
          toRole: 'Senior Engineer',
          salaryDelta: 10000,
          timeInRoleMonths: 0,
          consentFlag: true,
        })
      ).toThrowError(/at least 1 month/);

      expect(() =>
        recordCareerTransition({
          userId,
          fromRole: 'Engineer',
          toRole: 'Senior Engineer',
          salaryDelta: 10000,
          timeInRoleMonths: 12.5,
          consentFlag: true,
        })
      ).toThrowError(/at least 1 month/);
    });

    it('rejects non-finite salary delta', () => {
      expect(() =>
        recordCareerTransition({
          userId,
          fromRole: 'Engineer',
          toRole: 'Senior Engineer',
          salaryDelta: NaN,
          timeInRoleMonths: 12,
          consentFlag: true,
        })
      ).toThrowError(/valid finite number/);
    });
  });

  describe('calculateWilsonConfidenceInterval (BR-163)', () => {
    it('computes valid confidence interval bounds', () => {
      const ci = calculateWilsonConfidenceInterval(25, 100, 0.95);
      expect(ci.lower).toBeGreaterThan(0.15);
      expect(ci.upper).toBeLessThan(0.35);
      expect(ci.lower).toBeLessThan(ci.upper);
    });

    it('returns { lower: 0, upper: 0 } when sample size is 0', () => {
      const ci = calculateWilsonConfidenceInterval(0, 0, 0.95);
      expect(ci).toEqual({ lower: 0, upper: 0 });
    });
  });

  describe('calculateCareerTransitionProbability (F-152, F-85, BR-160, BR-163)', () => {
    // Generate synthetic dataset of 50 transitions from Mid Engineer: 30 to Senior, 15 to Tech Lead, 5 to PM
    const syntheticTransitions: CareerTransition[] = [];
    for (let i = 0; i < 30; i++) {
      syntheticTransitions.push({
        id: `trans-mid-senior-${i}`,
        userId: `user-${i}`,
        fromRole: 'Software Engineer',
        toRole: 'Senior Software Engineer',
        salaryDelta: 20000 + i * 500,
        timeInRoleMonths: 24 + (i % 6),
        consentFlag: true,
        transitionDate: '2025-01-15',
        createdAt: '2025-01-15T00:00:00Z',
      });
    }

    for (let i = 0; i < 15; i++) {
      syntheticTransitions.push({
        id: `trans-mid-lead-${i}`,
        userId: `user-lead-${i}`,
        fromRole: 'Software Engineer',
        toRole: 'Tech Lead',
        salaryDelta: 28000,
        timeInRoleMonths: 36,
        consentFlag: true,
        transitionDate: '2025-02-01',
        createdAt: '2025-02-01T00:00:00Z',
      });
    }

    for (let i = 0; i < 5; i++) {
      syntheticTransitions.push({
        id: `trans-mid-pm-${i}`,
        userId: `user-pm-${i}`,
        fromRole: 'Software Engineer',
        toRole: 'Product Manager',
        salaryDelta: 15000,
        timeInRoleMonths: 30,
        consentFlag: true,
        transitionDate: '2025-03-01',
        createdAt: '2025-03-01T00:00:00Z',
      });
    }

    it('computes probability and marks benchmark as publishable when sample size >= 20 (BR-160)', () => {
      const benchmark = calculateCareerTransitionProbability(
        syntheticTransitions,
        'Software Engineer',
        'Senior Software Engineer'
      );

      expect(benchmark.sampleCount).toBe(30);
      expect(benchmark.transitionProbability).toBe(0.6); // 30 / 50
      expect(benchmark.isPublishable).toBe(true);
      expect(benchmark.confidenceInterval.lower).toBeGreaterThan(0.4);
      expect(benchmark.confidenceInterval.upper).toBeLessThan(0.75);
      expect(benchmark.medianTimeMonths).toBeGreaterThanOrEqual(24);
      expect(benchmark.medianSalaryDelta).toBeGreaterThanOrEqual(20000);
      expect(benchmark.dataSources).toContain('opt_in_career_transitions');
      expect(benchmark.successFactors.length).toBeGreaterThan(0);
      expect(benchmark.riskFactors.length).toBeGreaterThan(0);
    });

    it('marks benchmark as NOT publishable when sample size < 20 (BR-160)', () => {
      const benchmark = calculateCareerTransitionProbability(
        syntheticTransitions,
        'Software Engineer',
        'Tech Lead'
      );

      expect(benchmark.sampleCount).toBe(15);
      expect(benchmark.transitionProbability).toBe(0.3); // 15 / 50
      expect(benchmark.isPublishable).toBe(false); // < 20 samples
    });

    it('returns zero transition probability when no matching transitions exist', () => {
      const benchmark = calculateCareerTransitionProbability(
        syntheticTransitions,
        'Software Engineer',
        'Chief Technology Officer'
      );

      expect(benchmark.sampleCount).toBe(0);
      expect(benchmark.transitionProbability).toBe(0);
      expect(benchmark.isPublishable).toBe(false);
    });
  });

  describe('generateProgressionPathways (F-152, BR-160)', () => {
    const transitions: CareerTransition[] = [];
    // 25 transitions to Senior (meets k=20)
    for (let i = 0; i < 25; i++) {
      transitions.push({
        id: `t-senior-${i}`,
        userId: `user-s-${i}`,
        fromRole: 'Software Engineer',
        toRole: 'Senior Software Engineer',
        salaryDelta: 25000,
        timeInRoleMonths: 24,
        consentFlag: true,
        transitionDate: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
      });
    }
    // 10 transitions to Solutions Architect (below k=20)
    for (let i = 0; i < 10; i++) {
      transitions.push({
        id: `t-arch-${i}`,
        userId: `user-a-${i}`,
        fromRole: 'Software Engineer',
        toRole: 'Solutions Architect',
        salaryDelta: 30000,
        timeInRoleMonths: 36,
        consentFlag: true,
        transitionDate: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
      });
    }

    it('enforces k-anonymity by filtering out pathways below sample threshold of 20 (BR-160)', () => {
      const pathways = generateProgressionPathways(transitions, 'Software Engineer', {
        enforceKAnonymity: true,
      });

      expect(pathways.originRole).toBe('Software Engineer');
      expect(pathways.pathways.length).toBe(1);
      expect(pathways.pathways[0].targetRole).toBe('Senior Software Engineer');
      expect(pathways.pathways[0].sampleCount).toBe(25);
    });

    it('includes all pathways when enforceKAnonymity is set to false', () => {
      const pathways = generateProgressionPathways(transitions, 'Software Engineer', {
        enforceKAnonymity: false,
      });

      expect(pathways.pathways.length).toBe(2);
      expect(pathways.pathways.map((p) => p.targetRole)).toContain('Solutions Architect');
    });
  });

  describe('projectSalaryTrajectory (BR-161, F-152)', () => {
    it('projects yearly salary progression and tracks cumulative delta separately from base salary', () => {
      const pathways = [
        {
          targetRole: 'Senior Software Engineer',
          transitionProbability: 0.6,
          confidenceInterval: { lower: 0.45, upper: 0.72 },
          medianTimeMonths: 24,
          medianSalaryDelta: 30000,
          salaryGrowthPct: 25.0,
          sampleCount: 25,
          retentionRatePct: 90.0,
          successFactors: ['System Architecture'],
          riskFactors: ['Communication'],
          isPublishable: true,
        },
      ];

      const projections = projectSalaryTrajectory(120000, pathways, 5);

      expect(projections.length).toBe(5);
      expect(projections[0].year).toBe(1);
      expect(projections[0].projectedSalary).toBeGreaterThan(120000);
      expect(projections[0].cumulativeDelta).toBeGreaterThan(0);
      expect(projections[4].year).toBe(5);
      expect(projections[4].projectedSalary).toBeGreaterThan(projections[0].projectedSalary);
      // In year 2+, role should reflect targetRole
      expect(projections[1].pathwayRole).toBe('Senior Software Engineer');
    });

    it('rejects negative or non-positive starting salary', () => {
      expect(() => projectSalaryTrajectory(0, [])).toThrowError(
        /Current salary must be a positive/
      );
      expect(() => projectSalaryTrajectory(-50000, [])).toThrowError(
        /Current salary must be a positive/
      );
    });
  });

  describe('evaluateMilestoneReadiness (F-85, F-152)', () => {
    it('evaluates candidate readiness against target role requirements and generates gap milestones', () => {
      const evaluation = evaluateMilestoneReadiness({
        userId,
        currentRole: 'Software Engineer',
        targetRole: 'Senior Software Engineer',
        candidateSkills: ['TypeScript', 'Node.js'],
        yearsOfExperience: 3,
        requiredYearsOfExperience: 5,
        educationLevel: 'bachelor',
        requiredEducationLevel: 'bachelor',
      });

      expect(evaluation.userId).toBe(userId);
      expect(evaluation.targetRole).toBe('Senior Software Engineer');
      expect(evaluation.skillsOverlapPct).toBe(40); // 2 of 5 default required skills
      expect(evaluation.experienceReadinessPct).toBe(60); // 3 of 5 years
      expect(evaluation.educationReadinessPct).toBe(100);
      expect(evaluation.overallReadinessScore).toBe(56); // 40*0.5 + 60*0.35 + 100*0.15 = 20 + 21 + 15 = 56
      expect(evaluation.missingPrerequisites).toContain('System Architecture');
      expect(evaluation.missingPrerequisites).toContain('Database Optimization');
      expect(evaluation.missingPrerequisites).toContain('Distributed Systems');
      expect(evaluation.recommendedMilestones.length).toBeGreaterThan(0);
      expect(evaluation.recommendedMilestones.some((m) => m.type === 'experience')).toBe(true);
    });

    it('evaluates 100% readiness for candidate meeting all skills and experience prerequisites', () => {
      const evaluation = evaluateMilestoneReadiness({
        userId,
        currentRole: 'Senior Software Engineer',
        targetRole: 'Staff Engineer',
        candidateSkills: [
          'System Architecture',
          'Technical Leadership',
          'Cross-team Coordination',
          'Strategic Roadmapping',
        ],
        yearsOfExperience: 8,
        requiredYearsOfExperience: 7,
        educationLevel: 'master',
        requiredEducationLevel: 'bachelor',
      });

      expect(evaluation.skillsOverlapPct).toBe(100);
      expect(evaluation.experienceReadinessPct).toBe(100);
      expect(evaluation.educationReadinessPct).toBe(100);
      expect(evaluation.overallReadinessScore).toBe(100);
      expect(evaluation.missingPrerequisites.length).toBe(0);
    });
  });
});
