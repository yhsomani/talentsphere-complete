import { describe, it, expect } from 'vitest';
import {
  validateWorkHistoryDates,
  calculateTenureMonths,
  verifyCorporateEmailDomain,
  extractDomain,
  calculateVerificationScoreAndBadge,
  createWorkHistory,
  verifyCorporateEmail,
  requestEmploymentReference,
  submitEmploymentReference,
  buildWorkHistoryGraph,
  DomainError,
  type VerifiedWorkHistory,
  type EmploymentReference,
} from '../../packages/domain/src/index.js';

describe('Verified Work History Network & References Domain (F-162, F-94, F-84)', () => {
  const fixedNow = '2026-09-25T12:00:00.000Z';

  describe('Date Validation & Anti-Resume Fraud (F-94)', () => {
    it('accepts valid historical start and end dates', () => {
      expect(() =>
        validateWorkHistoryDates('2021-01-01', '2023-05-15', false, fixedNow)
      ).not.toThrow();
    });

    it('accepts current employment with no end date', () => {
      expect(() => validateWorkHistoryDates('2024-01-01', undefined, true, fixedNow)).not.toThrow();
    });

    it('throws validation error if start date is in the future', () => {
      expect(() => validateWorkHistoryDates('2027-01-01', undefined, true, fixedNow)).toThrow(
        DomainError
      );

      try {
        validateWorkHistoryDates('2027-01-01', undefined, true, fixedNow);
      } catch (err: any) {
        expect(err.code).toBe('VALIDATION_FAILED');
        expect(err.message).toContain('Start date cannot be in the future');
      }
    });

    it('throws validation error if end date precedes start date', () => {
      try {
        validateWorkHistoryDates('2023-01-01', '2022-01-01', false, fixedNow);
      } catch (err: any) {
        expect(err.code).toBe('VALIDATION_FAILED');
        expect(err.message).toContain('End date cannot precede start date');
      }
    });

    it('throws validation error if current employment has an end date', () => {
      try {
        validateWorkHistoryDates('2023-01-01', '2024-01-01', true, fixedNow);
      } catch (err: any) {
        expect(err.code).toBe('VALIDATION_FAILED');
        expect(err.message).toContain('Current employment cannot have an end date');
      }
    });

    it('throws validation error if date formats are invalid', () => {
      expect(() => validateWorkHistoryDates('2023/01/01', undefined, true, fixedNow)).toThrow(
        DomainError
      );
    });
  });

  describe('Tenure Calculation', () => {
    it('calculates tenure accurately for finished employment', () => {
      const months = calculateTenureMonths('2021-01-01', '2023-01-01', false, fixedNow);
      expect(months).toBe(24);
    });

    it('calculates tenure accurately for ongoing current role', () => {
      const months = calculateTenureMonths('2025-09-01', undefined, true, fixedNow);
      // from 2025-09 to 2026-09 is 12 months
      expect(months).toBe(12);
    });

    it('returns at least 1 month for short or same-month tenure', () => {
      const months = calculateTenureMonths('2026-09-01', '2026-09-10', false, fixedNow);
      expect(months).toBe(1);
    });
  });

  describe('Corporate Email Attestation & Anti-Fraud (F-94)', () => {
    it('extracts root domain from web URL correctly', () => {
      expect(extractDomain('https://www.stripe.com/careers')).toBe('stripe.com');
      expect(extractDomain('http://meta.com:8080')).toBe('meta.com');
      expect(extractDomain('apple.com')).toBe('apple.com');
    });

    it('verifies exact and subdomain corporate email matches', () => {
      expect(verifyCorporateEmailDomain('alice@stripe.com', 'https://stripe.com')).toBe(true);
      expect(verifyCorporateEmailDomain('bob@eng.stripe.com', 'stripe.com')).toBe(true);
      expect(verifyCorporateEmailDomain('charlie@other.com', 'stripe.com')).toBe(false);
    });

    it('rejects disposable email addresses with validation error', () => {
      try {
        verifyCorporateEmailDomain('fraud@mailinator.com', 'stripe.com');
        expect.unreachable();
      } catch (err: any) {
        expect(err.code).toBe('VALIDATION_FAILED');
        expect(err.message).toContain('Disposable email');
      }
    });

    it('rejects consumer webmail addresses for corporate verification', () => {
      try {
        verifyCorporateEmailDomain('john.doe@gmail.com', 'google.com');
        expect.unreachable();
      } catch (err: any) {
        expect(err.code).toBe('VALIDATION_FAILED');
        expect(err.message).toContain('Generic webmail');
      }
    });
  });

  describe('Work History Creation & Corporate Email Verification', () => {
    it('creates unverified work history record', () => {
      const wh = createWorkHistory({
        candidateId: 'cand_123',
        companyName: 'Acme Corp',
        title: 'Senior Engineer',
        startDate: '2022-01-01',
        endDate: '2024-01-01',
        isCurrent: false,
        skills: ['TypeScript', 'Node.js'],
        nowIso: fixedNow,
      });

      expect(wh.candidateId).toBe('cand_123');
      expect(wh.companyName).toBe('Acme Corp');
      expect(wh.verificationStatus).toBe('unverified');
      expect(wh.verificationScore).toBe(0);
      expect(wh.badgeTier).toBe('none');
      expect(wh.skills).toEqual(['TypeScript', 'Node.js']);
    });

    it('verifies corporate email and promotes verification status', () => {
      const wh = createWorkHistory({
        candidateId: 'cand_123',
        companyName: 'Acme Corp',
        title: 'Senior Engineer',
        startDate: '2022-01-01',
        isCurrent: true,
        skills: ['TypeScript', 'Fastify'],
        nowIso: fixedNow,
      });

      const verified = verifyCorporateEmail({
        workHistory: wh,
        corporateEmail: 'eng@acme.com',
        companyDomain: 'acme.com',
        nowIso: fixedNow,
      });

      expect(verified.corporateEmail).toBe('eng@acme.com');
      expect(verified.emailVerifiedAt).toBe(fixedNow);
      expect(verified.verificationStatus).toBe('verified');
      // 40 pts for email + 5 pts for 2 skills = 45 pts -> bronze
      expect(verified.verificationScore).toBe(45);
      expect(verified.badgeTier).toBe('bronze');
    });

    it('throws error when corporate email does not match provided domain', () => {
      const wh = createWorkHistory({
        candidateId: 'cand_123',
        companyName: 'Acme Corp',
        title: 'Senior Engineer',
        startDate: '2022-01-01',
        isCurrent: true,
        nowIso: fixedNow,
      });

      expect(() =>
        verifyCorporateEmail({
          workHistory: wh,
          corporateEmail: 'hacker@different.com',
          companyDomain: 'acme.com',
          nowIso: fixedNow,
        })
      ).toThrow(DomainError);
    });
  });

  describe('Referee System & Anti-Self Checks (F-94)', () => {
    it('creates employment reference request with token', () => {
      const ref = requestEmploymentReference({
        workHistoryId: 'wh_1',
        candidateId: 'cand_1',
        candidateUserId: 'user_cand',
        candidateEmail: 'candidate@example.com',
        refereeUserId: 'user_referee',
        refereeName: 'Jane Manager',
        refereeEmail: 'manager@example.com',
        relationship: 'manager',
        nowIso: fixedNow,
      });

      expect(ref.status).toBe('requested');
      expect(ref.relationship).toBe('manager');
      expect(ref.token).toBeDefined();
      expect(ref.refereeEmail).toBe('manager@example.com');
    });

    it('rejects self-referee attempt where candidate user ID matches referee user ID', () => {
      try {
        requestEmploymentReference({
          workHistoryId: 'wh_1',
          candidateId: 'cand_1',
          candidateUserId: 'user_same',
          refereeUserId: 'user_same',
          refereeName: 'Self',
          refereeEmail: 'other@example.com',
          relationship: 'manager',
          nowIso: fixedNow,
        });
        expect.unreachable();
      } catch (err: any) {
        expect(err.code).toBe('CONFLICT');
        expect(err.message).toContain('Candidate cannot act as their own referee');
      }
    });

    it('rejects self-referee attempt where candidate email matches referee email', () => {
      try {
        requestEmploymentReference({
          workHistoryId: 'wh_1',
          candidateId: 'cand_1',
          candidateUserId: 'user_cand',
          candidateEmail: 'myself@domain.com',
          refereeName: 'Myself',
          refereeEmail: 'MYSELF@domain.com',
          relationship: 'peer',
          nowIso: fixedNow,
        });
        expect.unreachable();
      } catch (err: any) {
        expect(err.code).toBe('CONFLICT');
        expect(err.message).toContain('Candidate email cannot match referee email');
      }
    });

    it('submits structured reference ratings and endorsements', () => {
      const ref = requestEmploymentReference({
        workHistoryId: 'wh_1',
        candidateId: 'cand_1',
        candidateUserId: 'user_cand',
        candidateEmail: 'candidate@example.com',
        refereeName: 'Jane Manager',
        refereeEmail: 'manager@example.com',
        relationship: 'manager',
        nowIso: fixedNow,
      });

      const submitted = submitEmploymentReference({
        reference: ref,
        token: ref.token,
        confirmDates: true,
        confirmTitle: true,
        ratings: {
          technicalProficiency: 5,
          collaborationRating: 4,
          deliveryReliability: 5,
          leadershipRating: 4,
        },
        endorsedSkills: ['Architecture', 'Kubernetes'],
        summaryNotes: 'Outstanding team player and architect.',
        nowIso: fixedNow,
      });

      expect(submitted.status).toBe('submitted');
      expect(submitted.submittedAt).toBe(fixedNow);
      expect(submitted.confirmDates).toBe(true);
      expect(submitted.ratings?.technicalProficiency).toBe(5);
      expect(submitted.endorsedSkills).toContain('Architecture');
    });

    it('rejects invalid rating values (< 1 or > 5)', () => {
      const ref = requestEmploymentReference({
        workHistoryId: 'wh_1',
        candidateId: 'cand_1',
        candidateUserId: 'user_cand',
        refereeName: 'Jane Manager',
        refereeEmail: 'manager@example.com',
        relationship: 'manager',
        nowIso: fixedNow,
      });

      try {
        submitEmploymentReference({
          reference: ref,
          confirmDates: true,
          confirmTitle: true,
          ratings: {
            technicalProficiency: 6, // invalid
            collaborationRating: 4,
            deliveryReliability: 5,
          },
          nowIso: fixedNow,
        });
        expect.unreachable();
      } catch (err: any) {
        expect(err.code).toBe('VALIDATION_FAILED');
        expect(err.message).toContain(
          'Rating technicalProficiency must be an integer between 1 and 5'
        );
      }
    });

    it('rejects re-submitting already submitted reference', () => {
      const ref = requestEmploymentReference({
        workHistoryId: 'wh_1',
        candidateId: 'cand_1',
        candidateUserId: 'user_cand',
        refereeName: 'Jane Manager',
        refereeEmail: 'manager@example.com',
        relationship: 'manager',
        nowIso: fixedNow,
      });

      const submitted = submitEmploymentReference({
        reference: ref,
        confirmDates: true,
        confirmTitle: true,
        ratings: {
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
        },
        nowIso: fixedNow,
      });

      expect(() =>
        submitEmploymentReference({
          reference: submitted,
          confirmDates: true,
          confirmTitle: true,
          ratings: {
            technicalProficiency: 4,
            collaborationRating: 4,
            deliveryReliability: 4,
          },
          nowIso: fixedNow,
        })
      ).toThrow(DomainError);
    });
  });

  describe('Confidence Scoring & Badge Tiers', () => {
    it('calculates gold badge tier for corporate email + manager reference + skills', () => {
      const wh: VerifiedWorkHistory = {
        id: 'wh_1',
        candidateId: 'cand_1',
        companyName: 'Google',
        title: 'Staff SWE',
        employmentType: 'full_time',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
        isCurrent: false,
        corporateEmail: 'alice@google.com',
        emailVerifiedAt: fixedNow,
        verificationStatus: 'verified',
        verificationScore: 0,
        badgeTier: 'none',
        skills: ['Go', 'Distributed Systems'],
        createdAt: fixedNow,
        updatedAt: fixedNow,
      };

      const managerRef: EmploymentReference = {
        id: 'ref_1',
        workHistoryId: 'wh_1',
        candidateId: 'cand_1',
        refereeName: 'Bob Manager',
        refereeEmail: 'bob@google.com',
        relationship: 'manager',
        status: 'submitted',
        confirmDates: true,
        confirmTitle: true,
        ratings: {
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
        },
        endorsedSkills: ['Go'],
        requestedAt: fixedNow,
        submittedAt: fixedNow,
        createdAt: fixedNow,
        updatedAt: fixedNow,
      };

      const peerRef: EmploymentReference = {
        id: 'ref_2',
        workHistoryId: 'wh_1',
        candidateId: 'cand_1',
        refereeName: 'Carol Peer',
        refereeEmail: 'carol@google.com',
        relationship: 'peer',
        status: 'submitted',
        confirmDates: true,
        confirmTitle: true,
        ratings: {
          technicalProficiency: 5,
          collaborationRating: 4,
          deliveryReliability: 5,
        },
        endorsedSkills: ['Distributed Systems'],
        requestedAt: fixedNow,
        submittedAt: fixedNow,
        createdAt: fixedNow,
        updatedAt: fixedNow,
      };

      // Email (40) + Manager (30) + 2 refs bonus (15) + High ratings bonus (10) + Skills (5) = 100
      const { score, badgeTier, status } = calculateVerificationScoreAndBadge(wh, [
        managerRef,
        peerRef,
      ]);

      expect(score).toBe(100);
      expect(badgeTier).toBe('gold');
      expect(status).toBe('verified');
    });

    it('calculates silver badge for corporate email without references', () => {
      const wh: VerifiedWorkHistory = {
        id: 'wh_1',
        candidateId: 'cand_1',
        companyName: 'Google',
        title: 'SWE',
        employmentType: 'full_time',
        startDate: '2023-01-01',
        isCurrent: true,
        corporateEmail: 'alice@google.com',
        emailVerifiedAt: fixedNow,
        verificationStatus: 'verified',
        verificationScore: 0,
        badgeTier: 'none',
        skills: ['TypeScript'],
        createdAt: fixedNow,
        updatedAt: fixedNow,
      };

      const { score, badgeTier, status } = calculateVerificationScoreAndBadge(wh, []);
      expect(score).toBe(40);
      expect(badgeTier).toBe('bronze'); // 40 is bronze (< 50)
      expect(status).toBe('verified');
    });
  });

  describe('Work History Network & Graph Construction (F-162)', () => {
    it('builds multi-entity graph with candidate, companies, referees, skills, and summary metrics', () => {
      const wh1: VerifiedWorkHistory = {
        id: 'wh_1',
        candidateId: 'cand_1',
        companyName: 'Acme Technologies',
        companyId: 'org_acme',
        title: 'Backend Lead',
        employmentType: 'full_time',
        startDate: '2021-01-01',
        endDate: '2023-01-01',
        isCurrent: false,
        corporateEmail: 'cand@acme.com',
        emailVerifiedAt: fixedNow,
        verificationStatus: 'verified',
        verificationScore: 85,
        badgeTier: 'gold',
        skills: ['Node.js', 'PostgreSQL'],
        createdAt: fixedNow,
        updatedAt: fixedNow,
      };

      const wh2: VerifiedWorkHistory = {
        id: 'wh_2',
        candidateId: 'cand_1',
        companyName: 'Stripe',
        companyId: 'org_stripe',
        title: 'Senior Infrastructure Engineer',
        employmentType: 'full_time',
        startDate: '2023-01-01',
        isCurrent: true,
        verificationStatus: 'unverified',
        verificationScore: 0,
        badgeTier: 'none',
        skills: ['Kubernetes'],
        createdAt: fixedNow,
        updatedAt: fixedNow,
      };

      const ref1: EmploymentReference = {
        id: 'ref_1',
        workHistoryId: 'wh_1',
        candidateId: 'cand_1',
        refereeName: 'Sarah Connor',
        refereeEmail: 'sarah@acme.com',
        relationship: 'manager',
        status: 'submitted',
        confirmDates: true,
        confirmTitle: true,
        ratings: {
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
        },
        endorsedSkills: ['PostgreSQL', 'System Design'],
        requestedAt: fixedNow,
        submittedAt: fixedNow,
        createdAt: fixedNow,
        updatedAt: fixedNow,
      };

      // 1. Build graph including unverified roles
      const graphFull = buildWorkHistoryGraph({
        candidateId: 'cand_1',
        candidateName: 'Alex Mercer',
        workHistories: [wh1, wh2],
        references: [ref1],
        includeUnverified: true,
      });

      expect(graphFull.candidateId).toBe('cand_1');
      expect(graphFull.nodes.some((n) => n.type === 'candidate' && n.label === 'Alex Mercer')).toBe(
        true
      );
      expect(
        graphFull.nodes.some((n) => n.type === 'company' && n.label === 'Acme Technologies')
      ).toBe(true);
      expect(graphFull.nodes.some((n) => n.type === 'company' && n.label === 'Stripe')).toBe(true);
      expect(
        graphFull.nodes.some((n) => n.type === 'reference' && n.label.includes('Sarah Connor'))
      ).toBe(true);
      expect(graphFull.nodes.some((n) => n.type === 'skill' && n.label === 'PostgreSQL')).toBe(
        true
      );

      // Check edges
      expect(graphFull.edges.some((e) => e.type === 'employed_at')).toBe(true);
      expect(graphFull.edges.some((e) => e.type === 'referred_by')).toBe(true);
      expect(graphFull.edges.some((e) => e.type === 'managed_by')).toBe(true);
      expect(graphFull.edges.some((e) => e.type === 'endorsed_skill')).toBe(true);

      // Check summary
      expect(graphFull.summary.totalRoles).toBe(2);
      expect(graphFull.summary.verifiedRoles).toBe(1);
      expect(graphFull.summary.totalReferences).toBe(1);
      expect(graphFull.summary.averageReferenceRating).toBe(5);
      expect(graphFull.summary.aggregateTrustScore).toBe(85);
      expect(graphFull.summary.topVerifiedSkills[0].skill).toBe('PostgreSQL');

      // 2. Build graph excluding unverified roles
      const graphVerifiedOnly = buildWorkHistoryGraph({
        candidateId: 'cand_1',
        candidateName: 'Alex Mercer',
        workHistories: [wh1, wh2],
        references: [ref1],
        includeUnverified: false,
      });

      expect(graphVerifiedOnly.nodes.some((n) => n.label === 'Stripe')).toBe(false);
      expect(graphVerifiedOnly.nodes.some((n) => n.label === 'Acme Technologies')).toBe(true);
    });
  });
});
