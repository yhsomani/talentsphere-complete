import { describe, expect, it } from 'vitest';
import {
  createTalentPool,
  validateCandidatePoolEligibility,
  addCandidateToPool,
  updatePoolMemberStatus,
  computePoolSkillComposition,
  computePoolSkillGaps,
  computePipelineStages,
  computeSourceEffectiveness,
  computeAggregatedDiversity,
  generateTalentPoolIntelligence,
  DIVERSITY_DISCLAIMER,
  CandidateSkillProfile,
  TalentPoolMember,
} from '../../packages/domain/src/talent-pool-intelligence.js';

describe('Talent Pool Intelligence Domain (F-158, F-92, BR-200, BR-201)', () => {
  const sampleOrgId = 'org-1111-2222-3333';
  const recruiterId = 'user-recruiter-999';

  describe('createTalentPool', () => {
    it('creates a talent pool with valid properties', () => {
      const pool = createTalentPool({
        orgId: sampleOrgId,
        name: 'Senior Frontend Engineers',
        description: 'React, TypeScript and Performance specialists',
        targetRole: 'Senior Frontend Engineer',
        targetSkills: ['React', 'TypeScript', 'Web Performance'],
        createdBy: recruiterId,
      });

      expect(pool.id).toBeDefined();
      expect(pool.orgId).toBe(sampleOrgId);
      expect(pool.name).toBe('Senior Frontend Engineers');
      expect(pool.targetSkills).toEqual(['react', 'typescript', 'web performance']);
      expect(pool.createdBy).toBe(recruiterId);
    });

    it('throws error when name is missing or blank', () => {
      expect(() =>
        createTalentPool({
          orgId: sampleOrgId,
          name: '   ',
          createdBy: recruiterId,
        })
      ).toThrowError(/name is required/i);
    });

    it('throws error when orgId is missing', () => {
      expect(() =>
        createTalentPool({
          orgId: '',
          name: 'Pool 1',
          createdBy: recruiterId,
        })
      ).toThrowError(/organization id is required/i);
    });
  });

  describe('validateCandidatePoolEligibility & Privacy Invariants', () => {
    it('rejects candidate in stealth mode without consent (F-92, SSOT 1459)', () => {
      expect(() =>
        validateCandidatePoolEligibility({
          isStealthMode: true,
          hasAppliedOrConsented: false,
        })
      ).toThrowError(/stealth mode/i);
    });

    it('allows candidate in stealth mode if they actively applied to org job', () => {
      expect(() =>
        validateCandidatePoolEligibility({
          isStealthMode: true,
          hasAppliedOrConsented: true,
        })
      ).not.toThrow();
    });

    it('rejects candidate with private profile without consent', () => {
      expect(() =>
        validateCandidatePoolEligibility({
          privacyLevel: 'private',
          hasAppliedOrConsented: false,
        })
      ).toThrowError(/private candidate profiles/i);
    });

    it('allows public or recruiters_only candidate profile', () => {
      expect(() =>
        validateCandidatePoolEligibility({
          privacyLevel: 'recruiters_only',
        })
      ).not.toThrow();
    });
  });

  describe('addCandidateToPool & updatePoolMemberStatus', () => {
    const pool = createTalentPool({
      orgId: sampleOrgId,
      name: 'Backend Pool',
      createdBy: recruiterId,
    });

    it('adds an eligible candidate to talent pool with sourcing cost', () => {
      const candidate: CandidateSkillProfile = {
        candidateId: 'cand-1',
        skills: [{ skillName: 'Node.js', verified: true }],
        privacyLevel: 'recruiters_only',
      };

      const member = addCandidateToPool(pool, candidate, 'search', 5000, 'Found on search');
      expect(member.poolId).toBe(pool.id);
      expect(member.candidateId).toBe('cand-1');
      expect(member.source).toBe('search');
      expect(member.status).toBe('sourced');
      expect(member.costMinorUnits).toBe(5000);
      expect(member.notes).toBe('Found on search');
    });

    it('rejects negative sourcing cost', () => {
      const candidate: CandidateSkillProfile = {
        candidateId: 'cand-2',
        skills: [],
      };
      expect(() => addCandidateToPool(pool, candidate, 'search', -100)).toThrowError(
        /non-negative/i
      );
    });

    it('updates member status and populates milestone timestamps', () => {
      const candidate: CandidateSkillProfile = {
        candidateId: 'cand-3',
        skills: [],
      };
      let member = addCandidateToPool(pool, candidate, 'inbound_application');
      expect(member.status).toBe('sourced');

      member = updatePoolMemberStatus(member, 'contacted', '2026-09-01T10:00:00Z');
      expect(member.status).toBe('contacted');
      expect(member.contactedAt).toBe('2026-09-01T10:00:00Z');

      member = updatePoolMemberStatus(member, 'interviewing', '2026-09-05T14:00:00Z');
      expect(member.status).toBe('interviewing');
      expect(member.interviewedAt).toBe('2026-09-05T14:00:00Z');

      member = updatePoolMemberStatus(member, 'hired', '2026-09-15T18:00:00Z');
      expect(member.status).toBe('hired');
      expect(member.hiredAt).toBe('2026-09-15T18:00:00Z');
    });
  });

  describe('computePoolSkillComposition & Skill Gaps', () => {
    const members: TalentPoolMember[] = [
      {
        id: 'm1',
        poolId: 'p1',
        orgId: sampleOrgId,
        candidateId: 'c1',
        source: 'search',
        status: 'sourced',
        costMinorUnits: 0,
        addedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'm2',
        poolId: 'p1',
        orgId: sampleOrgId,
        candidateId: 'c2',
        source: 'referral',
        status: 'interviewing',
        costMinorUnits: 0,
        addedAt: '2026-09-02T00:00:00Z',
      },
      {
        id: 'm3',
        poolId: 'p1',
        orgId: sampleOrgId,
        candidateId: 'c3',
        source: 'inbound_application',
        status: 'hired',
        costMinorUnits: 0,
        addedAt: '2026-09-03T00:00:00Z',
      },
    ];

    const profiles: CandidateSkillProfile[] = [
      {
        candidateId: 'c1',
        skills: [
          { skillName: 'TypeScript', verified: true },
          { skillName: 'React', verified: true },
        ],
      },
      {
        candidateId: 'c2',
        skills: [
          { skillName: 'TypeScript', verified: false },
          { skillName: 'GraphQL', verified: true },
        ],
      },
      {
        candidateId: 'c3',
        skills: [
          { skillName: 'TypeScript', verified: true },
          { skillName: 'React', verified: false },
          { skillName: 'Docker', verified: true },
        ],
      },
    ];

    it('computes skill composition with prevalence and verified percentage', () => {
      const composition = computePoolSkillComposition(members, profiles);

      expect(composition).toHaveLength(4);
      // TypeScript: 3/3 = 100%, 2 verified / 3 = 66.67%
      const ts = composition.find((c) => c.skillName === 'typescript');
      expect(ts).toBeDefined();
      expect(ts?.candidateCount).toBe(3);
      expect(ts?.prevalencePct).toBe(100);
      expect(ts?.verifiedCount).toBe(2);
      expect(ts?.verifiedPct).toBe(66.67);

      // React: 2/3 = 66.67%, 1 verified / 2 = 50%
      const react = composition.find((c) => c.skillName === 'react');
      expect(react).toBeDefined();
      expect(react?.candidateCount).toBe(2);
      expect(react?.prevalencePct).toBe(66.67);
      expect(react?.verifiedPct).toBe(50);
    });

    it('evaluates skill gaps against target skills', () => {
      const composition = computePoolSkillComposition(members, profiles);
      const targetSkills = ['typescript', 'react', 'kubernetes'];

      const gaps = computePoolSkillGaps(targetSkills, composition, members.length);
      expect(gaps).toHaveLength(3);

      const tsGap = gaps.find((g) => g.targetSkill === 'typescript');
      expect(tsGap?.inPoolCount).toBe(3);
      expect(tsGap?.status).toBe('adequate');

      const k8sGap = gaps.find((g) => g.targetSkill === 'kubernetes');
      expect(k8sGap?.inPoolCount).toBe(0);
      expect(k8sGap?.coveragePct).toBe(0);
      expect(k8sGap?.status).toBe('severe_gap');
    });
  });

  describe('computePipelineStages & computeSourceEffectiveness', () => {
    const fixedNow = new Date('2026-09-20T00:00:00Z');

    const members: TalentPoolMember[] = [
      {
        id: 'm1',
        poolId: 'p1',
        orgId: sampleOrgId,
        candidateId: 'c1',
        source: 'search',
        status: 'sourced',
        costMinorUnits: 1000,
        addedAt: '2026-09-10T00:00:00Z',
      },
      {
        id: 'm2',
        poolId: 'p1',
        orgId: sampleOrgId,
        candidateId: 'c2',
        source: 'search',
        status: 'hired',
        costMinorUnits: 2000,
        addedAt: '2026-09-01T00:00:00Z',
        hiredAt: '2026-09-15T00:00:00Z',
      },
      {
        id: 'm3',
        poolId: 'p1',
        orgId: sampleOrgId,
        candidateId: 'c3',
        source: 'referral',
        status: 'hired',
        costMinorUnits: 5000,
        addedAt: '2026-09-05T00:00:00Z',
        hiredAt: '2026-09-12T00:00:00Z',
      },
    ];

    it('computes pipeline stages metrics with count, percentage, and avg days', () => {
      const stages = computePipelineStages(members, fixedNow);
      expect(stages).toHaveLength(7);

      const sourcedStage = stages.find((s) => s.stage === 'sourced');
      expect(sourcedStage?.count).toBe(1);
      expect(sourcedStage?.pctOfTotal).toBe(33.33);
      expect(sourcedStage?.avgDaysInStage).toBe(10); // 2026-09-20 - 2026-09-10

      const hiredStage = stages.find((s) => s.stage === 'hired');
      expect(hiredStage?.count).toBe(2);
      expect(hiredStage?.pctOfTotal).toBe(66.67);
    });

    it('computes source effectiveness with conversion rate, time-to-hire, and cost-per-hire', () => {
      const effectiveness = computeSourceEffectiveness(members);
      expect(effectiveness).toHaveLength(5);

      // Search: 2 candidates, 1 hired -> 50% conversion, 14 days time-to-hire, (1000 + 2000) / 1 = 3000 cents
      const searchEff = effectiveness.find((e) => e.source === 'search');
      expect(searchEff?.totalCandidates).toBe(2);
      expect(searchEff?.hiredCount).toBe(1);
      expect(searchEff?.conversionRatePct).toBe(50);
      expect(searchEff?.avgTimeToHireDays).toBe(14);
      expect(searchEff?.avgCostPerHireMinorUnits).toBe(3000);

      // Referral: 1 candidate, 1 hired -> 100% conversion, 7 days time-to-hire, 5000 cents
      const referralEff = effectiveness.find((e) => e.source === 'referral');
      expect(referralEff?.totalCandidates).toBe(1);
      expect(referralEff?.hiredCount).toBe(1);
      expect(referralEff?.conversionRatePct).toBe(100);
      expect(referralEff?.avgTimeToHireDays).toBe(7);
      expect(referralEff?.avgCostPerHireMinorUnits).toBe(5000);
    });
  });

  describe('computeAggregatedDiversity (BR-200 & k-anonymity)', () => {
    it('suppresses metrics when total cohort is below k threshold', () => {
      const smallCohort = [{ category: 'Group A' }, { category: 'Group B' }];
      const result = computeAggregatedDiversity(smallCohort, 10);

      expect(result.isSuppressedDueToKAnonymity).toBe(true);
      expect(result.metrics).toBeNull();
      expect(result.disclaimer).toBe(DIVERSITY_DISCLAIMER);
    });

    it('suppresses metrics when any sub-category has count below k threshold', () => {
      const cohort = [
        ...Array(12).fill({ category: 'Group A' }),
        ...Array(3).fill({ category: 'Group B' }), // Sub-cell < 10
      ];
      const result = computeAggregatedDiversity(cohort, 10);

      expect(result.isSuppressedDueToKAnonymity).toBe(true);
      expect(result.metrics).toBeNull();
    });

    it('returns aggregated metrics when all sub-categories satisfy k >= 10', () => {
      const cohort = [
        ...Array(15).fill({ category: 'Group A' }),
        ...Array(12).fill({ category: 'Group B' }),
      ];
      const result = computeAggregatedDiversity(cohort, 10);

      expect(result.isSuppressedDueToKAnonymity).toBe(false);
      expect(result.metrics).toEqual({
        'Group A': 15,
        'Group B': 12,
      });
      expect(result.cohortsAnalyzed).toBe(27);
    });
  });

  describe('generateTalentPoolIntelligence (End-to-End Domain Summary)', () => {
    it('generates a full intelligence report combining all metrics', () => {
      const pool = createTalentPool({
        orgId: sampleOrgId,
        name: 'Full Stack Pool',
        targetRole: 'Staff Full Stack Engineer',
        targetSkills: ['typescript', 'node.js', 'react'],
        createdBy: recruiterId,
      });

      const members: TalentPoolMember[] = [
        {
          id: 'm1',
          poolId: pool.id,
          orgId: sampleOrgId,
          candidateId: 'c1',
          source: 'search',
          status: 'hired',
          costMinorUnits: 2500,
          addedAt: '2026-09-01T00:00:00Z',
          hiredAt: '2026-09-11T00:00:00Z',
        },
        {
          id: 'm2',
          poolId: pool.id,
          orgId: sampleOrgId,
          candidateId: 'c2',
          source: 'inbound_application',
          status: 'interviewing',
          costMinorUnits: 0,
          addedAt: '2026-09-05T00:00:00Z',
        },
      ];

      const profiles: CandidateSkillProfile[] = [
        {
          candidateId: 'c1',
          skills: [
            { skillName: 'typescript', verified: true },
            { skillName: 'react', verified: true },
          ],
        },
        {
          candidateId: 'c2',
          skills: [{ skillName: 'typescript', verified: false }],
        },
      ];

      const summary = generateTalentPoolIntelligence(pool, members, profiles);

      expect(summary.poolId).toBe(pool.id);
      expect(summary.poolName).toBe('Full Stack Pool');
      expect(summary.totalMembers).toBe(2);
      expect(summary.hiredCount).toBe(1);
      expect(summary.activePipelineCount).toBe(1);
      expect(summary.overallConversionRatePct).toBe(50);
      expect(summary.avgTimeToHireDays).toBe(10);
      expect(summary.totalCostMinorUnits).toBe(2500);
      expect(summary.avgCostPerHireMinorUnits).toBe(2500);
      expect(summary.skillComposition).toHaveLength(2);
      expect(summary.skillGaps).toHaveLength(3);
      expect(summary.pipelineStages).toHaveLength(7);
      expect(summary.sourceEffectiveness).toHaveLength(5);
      expect(summary.aggregatedDiversity.isSuppressedDueToKAnonymity).toBe(true);
    });
  });
});
