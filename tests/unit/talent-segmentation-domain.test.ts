import { describe, it, expect } from 'vitest';
import {
  classifyCandidateSpecialization,
  classifySeniorityTier,
  classifyEngagementSegment,
  classifyReadinessBand,
  classifyCandidate,
  aggregateSegmentDistribution,
  filterSegmentedTalent,
  CandidateSegmentation,
} from '../../packages/domain/src/talent-segmentation.js';

describe('Talent Segmentation & Classification Domain (F-160, F-84, F-85, BR-200)', () => {
  describe('Specialization Classification', () => {
    it('correctly classifies frontend specialization from keywords', () => {
      const res = classifyCandidateSpecialization(['React', 'NextJS', 'Tailwind', 'CSS']);
      expect(res.specialization).toBe('frontend');
      expect(res.confidence).toBeGreaterThanOrEqual(60);
    });

    it('correctly classifies backend specialization from keywords', () => {
      const res = classifyCandidateSpecialization(['Node.js', 'PostgreSQL', 'Go', 'GraphQL']);
      expect(res.specialization).toBe('backend');
      expect(res.confidence).toBeGreaterThanOrEqual(60);
    });

    it('correctly identifies fullstack when both frontend and backend are prominent', () => {
      const res = classifyCandidateSpecialization(['React', 'NextJS', 'Node.js', 'PostgreSQL']);
      expect(res.specialization).toBe('fullstack');
      expect(res.confidence).toBeGreaterThanOrEqual(70);
    });

    it('correctly classifies devops/cloud specialization', () => {
      const res = classifyCandidateSpecialization(['Docker', 'Kubernetes', 'Terraform', 'AWS']);
      expect(res.specialization).toBe('devops_cloud');
    });

    it('correctly classifies data/ai specialization', () => {
      const res = classifyCandidateSpecialization([
        'Python',
        'PyTorch',
        'Machine Learning',
        'BigQuery',
      ]);
      expect(res.specialization).toBe('data_ai');
    });

    it('correctly classifies mobile specialization', () => {
      const res = classifyCandidateSpecialization(['Flutter', 'Dart', 'iOS', 'Android']);
      expect(res.specialization).toBe('mobile');
    });

    it('correctly classifies security specialization', () => {
      const res = classifyCandidateSpecialization(['Cybersecurity', 'Penetration Testing', 'IAM']);
      expect(res.specialization).toBe('security');
    });

    it('correctly classifies system architecture specialization', () => {
      const res = classifyCandidateSpecialization([
        'Distributed Systems',
        'Microservices',
        'Scalability',
      ]);
      expect(res.specialization).toBe('system_architecture');
    });

    it('defaults to generalist with baseline confidence for empty skills', () => {
      const res = classifyCandidateSpecialization([]);
      expect(res.specialization).toBe('generalist');
      expect(res.confidence).toBe(30);
    });
  });

  describe('Seniority Tier Classification', () => {
    it('classifies 0-2 years as entry level', () => {
      expect(classifySeniorityTier(1.5)).toBe('entry');
    });

    it('classifies 3-5 years as mid level', () => {
      expect(classifySeniorityTier(4)).toBe('mid');
    });

    it('classifies 6-8 years as senior level', () => {
      expect(classifySeniorityTier(7)).toBe('senior');
    });

    it('classifies 9-12 years as staff level', () => {
      expect(classifySeniorityTier(10)).toBe('staff');
    });

    it('classifies 13+ years as principal level', () => {
      expect(classifySeniorityTier(14)).toBe('principal');
    });

    it('promotes high milestone readiness score to higher seniority tier', () => {
      // 4 years ordinarily mid, but 75 milestone score elevates to senior
      expect(classifySeniorityTier(4, 75)).toBe('senior');
      // 7 years ordinarily senior, but 85 milestone score elevates to staff
      expect(classifySeniorityTier(7, 85)).toBe('staff');
    });

    it('rejects negative years of experience with validation error', () => {
      expect(() => classifySeniorityTier(-2)).toThrowError(/cannot be negative/i);
    });
  });

  describe('Engagement Segment Classification', () => {
    it('identifies active engagement when active within 14 days', () => {
      expect(classifyEngagementSegment(5, false, 0)).toBe('active');
    });

    it('identifies active engagement when submitted application recently', () => {
      expect(classifyEngagementSegment(25, false, 1)).toBe('active');
    });

    it('identifies open engagement when active within 60 days', () => {
      expect(classifyEngagementSegment(45, false, 0)).toBe('open');
    });

    it('identifies passive engagement when inactive between 61 and 180 days', () => {
      expect(classifyEngagementSegment(90, false, 0)).toBe('passive');
    });

    it('identifies inactive when no activity over 180 days', () => {
      expect(classifyEngagementSegment(210, false, 0)).toBe('inactive');
    });

    it('strictly assigns stealth segment when candidate enabled stealth mode', () => {
      expect(classifyEngagementSegment(2, true, 0)).toBe('stealth');
    });
  });

  describe('Readiness Band Classification', () => {
    it('classifies ready_now when candidate has 3+ verified evidence and passed assessment', () => {
      expect(classifyReadinessBand(3, 1, 0)).toBe('ready_now');
    });

    it('classifies near_ready when candidate has 1 verified evidence', () => {
      expect(classifyReadinessBand(1, 0, 0)).toBe('near_ready');
    });

    it('classifies in_training when skill decay risk exists', () => {
      expect(classifyReadinessBand(3, 1, 2)).toBe('in_training');
    });

    it('classifies unassessed when no evidence and no assessments exist', () => {
      expect(classifyReadinessBand(0, 0, 0)).toBe('unassessed');
    });
  });

  describe('Candidate Classification Synthesis', () => {
    it('generates complete segmentation profile from raw inputs', () => {
      const seg = classifyCandidate({
        candidateId: '00000000-0000-0000-0000-000000000001',
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS'],
        yearsOfExperience: 6.5,
        lastActiveDays: 3,
        isStealthMode: false,
        verifiedEvidenceCount: 4,
        assessmentsPassedCount: 2,
        skillDecayRiskCount: 0,
      });

      expect(seg.candidateId).toBe('00000000-0000-0000-0000-000000000001');
      expect(seg.specialization).toBe('devops_cloud');
      expect(seg.seniorityTier).toBe('senior');
      expect(seg.engagementSegment).toBe('active');
      expect(seg.readinessBand).toBe('ready_now');
      expect(seg.confidenceScore).toBeGreaterThanOrEqual(60);
      expect(seg.primarySkills).toContain('kubernetes');
    });
  });

  describe('Distribution Aggregation & K-Anonymity (BR-200)', () => {
    it('enforces k-anonymity suppression on small sample buckets (<10)', () => {
      const mockList: CandidateSegmentation[] = [];
      // 15 backend seniors
      for (let i = 0; i < 15; i++) {
        mockList.push({
          id: `seg_${i}`,
          candidateId: `cand_${i}`,
          specialization: 'backend',
          seniorityTier: 'senior',
          engagementSegment: 'active',
          readinessBand: 'ready_now',
          confidenceScore: 80,
          primarySkills: ['go'],
          yearsOfExperience: 7,
          classifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      // 3 mobile entry (below k=10)
      for (let i = 15; i < 18; i++) {
        mockList.push({
          id: `seg_${i}`,
          candidateId: `cand_${i}`,
          specialization: 'mobile',
          seniorityTier: 'entry',
          engagementSegment: 'open',
          readinessBand: 'near_ready',
          confidenceScore: 60,
          primarySkills: ['flutter'],
          yearsOfExperience: 1,
          classifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const report = aggregateSegmentDistribution(mockList, 10);
      expect(report.totalAnalyzed).toBe(18);

      const backendSpec = report.bySpecialization.find((s) => s.segment === 'backend');
      expect(backendSpec).toBeDefined();
      expect(backendSpec?.isSuppressed).toBe(false);
      expect(backendSpec?.count).toBe(15);
      expect(backendSpec?.percentage).toBe(83.3);

      const mobileSpec = report.bySpecialization.find((s) => s.segment === 'mobile');
      expect(mobileSpec).toBeDefined();
      expect(mobileSpec?.isSuppressed).toBe(true);
      expect(mobileSpec?.count).toBe('<10');
      expect(mobileSpec?.percentage).toBeNull();
      expect(report.suppressedCellCount).toBeGreaterThan(0);
    });
  });

  describe('Segment Filtering', () => {
    const pool: CandidateSegmentation[] = [
      {
        id: '1',
        candidateId: 'c1',
        specialization: 'frontend',
        seniorityTier: 'senior',
        engagementSegment: 'active',
        readinessBand: 'ready_now',
        confidenceScore: 90,
        primarySkills: ['react'],
        yearsOfExperience: 7,
        classifiedAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        candidateId: 'c2',
        specialization: 'backend',
        seniorityTier: 'staff',
        engagementSegment: 'open',
        readinessBand: 'ready_now',
        confidenceScore: 85,
        primarySkills: ['rust'],
        yearsOfExperience: 10,
        classifiedAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        candidateId: 'c3',
        specialization: 'devops_cloud',
        seniorityTier: 'mid',
        engagementSegment: 'passive',
        readinessBand: 'near_ready',
        confidenceScore: 65,
        primarySkills: ['docker'],
        yearsOfExperience: 4,
        classifiedAt: '',
        updatedAt: '',
      },
    ];

    it('filters by specialization', () => {
      const { results, total } = filterSegmentedTalent(pool, {
        specializations: ['frontend'],
      });
      expect(total).toBe(1);
      expect(results[0].candidateId).toBe('c1');
    });

    it('filters by minimum seniority and confidence score', () => {
      const { results, total } = filterSegmentedTalent(pool, {
        seniorityTiers: ['senior', 'staff'],
        minConfidenceScore: 80,
      });
      expect(total).toBe(2);
      expect(results[0].candidateId).toBe('c1'); // 90 confidence ranks before 85
      expect(results[1].candidateId).toBe('c2');
    });

    it('paginates results with limit and offset', () => {
      const { results, total } = filterSegmentedTalent(pool, {
        limit: 1,
        offset: 1,
      });
      expect(total).toBe(3);
      expect(results.length).toBe(1);
      expect(results[0].candidateId).toBe('c2');
    });
  });
});
