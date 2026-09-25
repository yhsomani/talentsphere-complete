import { describe, it, expect } from 'vitest';
import {
  validateGraduationYear,
  createAlumniAffiliation,
  verifyAffiliationBySeatCode,
  filterAlumniDirectory,
  createAlumniGroup,
  joinAlumniGroup,
  createAlumniMentorshipRequest,
  respondToAlumniMentorship,
  AlumniAffiliation,
} from '../../packages/domain/src/alumni-networks.js';
import { DomainError } from '../../packages/domain/src/index.js';

describe('Alumni Networks Domain (F-125, F-12, F-09, F-40)', () => {
  const institutionId = '11111111-1111-1111-1111-111111111111';
  const otherInstitutionId = '22222222-2222-2222-2222-222222222222';
  const user1Id = '33333333-3333-3333-3333-333333333333';
  const user2Id = '44444444-4444-4444-4444-444444444444';

  describe('Affiliation Validation & Creation (BR-F125-01, BR-F125-02)', () => {
    it('validates graduation year between 1950 and 2050', () => {
      expect(() => validateGraduationYear(2020)).not.toThrow();
      expect(() => validateGraduationYear(1950)).not.toThrow();
      expect(() => validateGraduationYear(2050)).not.toThrow();

      expect(() => validateGraduationYear(1949)).toThrow(DomainError);
      expect(() => validateGraduationYear(2051)).toThrow(DomainError);
      expect(() => validateGraduationYear(2020.5)).toThrow(DomainError);
    });

    it('creates an unverified affiliation when email domain does not match', () => {
      const aff = createAlumniAffiliation({
        userId: user1Id,
        institutionId,
        degreeType: 'bachelors',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2022,
        userEmail: 'alumni@gmail.com',
        institutionDomain: 'stanford.edu',
      });

      expect(aff.id).toBeDefined();
      expect(aff.userId).toBe(user1Id);
      expect(aff.institutionId).toBe(institutionId);
      expect(aff.fieldOfStudy).toBe('Computer Science');
      expect(aff.graduationYear).toBe(2022);
      expect(aff.verificationStatus).toBe('unverified');
      expect(aff.verifiedAt).toBeUndefined();
    });

    it('auto-verifies affiliation when email domain matches institution domain', () => {
      const aff = createAlumniAffiliation({
        userId: user1Id,
        institutionId,
        degreeType: 'masters',
        fieldOfStudy: 'Artificial Intelligence',
        graduationYear: 2023,
        userEmail: 'alice@cs.stanford.edu',
        institutionDomain: 'stanford.edu',
      });

      expect(aff.verificationStatus).toBe('verified');
      expect(aff.verificationMethod).toBe('email_domain');
      expect(aff.verifiedAt).toBeDefined();
    });

    it('rejects empty field of study', () => {
      expect(() =>
        createAlumniAffiliation({
          userId: user1Id,
          institutionId,
          degreeType: 'phd',
          fieldOfStudy: '   ',
          graduationYear: 2021,
        })
      ).toThrow(DomainError);
    });

    it('verifies affiliation with valid seat code', () => {
      const aff = createAlumniAffiliation({
        userId: user1Id,
        institutionId,
        degreeType: 'bachelors',
        fieldOfStudy: 'Mathematics',
        graduationYear: 2020,
      });

      const validCodes = new Set(['STANFORD-SEAT-2020', 'ALUMNI-VIP']);
      const verified = verifyAffiliationBySeatCode(aff, 'STANFORD-SEAT-2020', validCodes);

      expect(verified.verificationStatus).toBe('verified');
      expect(verified.verificationMethod).toBe('institutional_seat');
      expect(verified.verifiedAt).toBeDefined();
    });

    it('rejects invalid seat code', () => {
      const aff = createAlumniAffiliation({
        userId: user1Id,
        institutionId,
        degreeType: 'bachelors',
        fieldOfStudy: 'Physics',
        graduationYear: 2019,
      });

      const validCodes = new Set(['VALID-CODE']);
      expect(() => verifyAffiliationBySeatCode(aff, 'BAD-CODE', validCodes)).toThrow(DomainError);
    });
  });

  describe('Directory Discovery & 100% Cross-Institution Isolation (BR-F125-03)', () => {
    const verifiedAff1: AlumniAffiliation = {
      id: 'aff-1',
      userId: user1Id,
      institutionId,
      degreeType: 'bachelors',
      fieldOfStudy: 'Computer Science',
      graduationYear: 2020,
      verificationMethod: 'email_domain',
      verificationStatus: 'verified',
      verifiedAt: '2020-05-01T00:00:00Z',
      createdAt: '2020-05-01T00:00:00Z',
    };

    const verifiedAff2: AlumniAffiliation = {
      id: 'aff-2',
      userId: user2Id,
      institutionId,
      degreeType: 'masters',
      fieldOfStudy: 'Electrical Engineering',
      graduationYear: 2022,
      verificationMethod: 'institutional_seat',
      verificationStatus: 'verified',
      verifiedAt: '2022-06-01T00:00:00Z',
      createdAt: '2022-06-01T00:00:00Z',
    };

    const unverifiedAff: AlumniAffiliation = {
      id: 'aff-3',
      userId: 'user-3',
      institutionId,
      degreeType: 'phd',
      fieldOfStudy: 'Computer Science',
      graduationYear: 2021,
      verificationMethod: 'unverified',
      verificationStatus: 'unverified',
      createdAt: '2021-06-01T00:00:00Z',
    };

    const dataset = [
      { ...verifiedAff1, user: { fullName: 'Alice Smith', email: 'alice@stanford.edu' } },
      { ...verifiedAff2, user: { fullName: 'Bob Jones', email: 'bob@stanford.edu' } },
      { ...unverifiedAff, user: { fullName: 'Charlie Brown', email: 'charlie@gmail.com' } },
    ];

    it('enforces 100% cross-institution isolation when caller is not verified at institution', () => {
      expect(() =>
        filterAlumniDirectory({
          callerUserId: 'intruder-user',
          callerVerifiedInstitutions: [otherInstitutionId], // Only verified at another institution
          targetInstitutionId: institutionId,
          affiliations: dataset,
        })
      ).toThrow(DomainError);
    });

    it('returns verified alumni directory for verified members, hiding unverified members', () => {
      const results = filterAlumniDirectory({
        callerUserId: user1Id,
        callerVerifiedInstitutions: [institutionId],
        targetInstitutionId: institutionId,
        affiliations: dataset,
      });

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toEqual(['aff-1', 'aff-2']);
    });

    it('filters directory by graduation year and degree type', () => {
      const results = filterAlumniDirectory({
        callerUserId: user1Id,
        callerVerifiedInstitutions: [institutionId],
        targetInstitutionId: institutionId,
        affiliations: dataset,
        filters: { graduationYear: 2020, degreeType: 'bachelors' },
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('aff-1');
    });

    it('filters directory by field of study and search query', () => {
      const results = filterAlumniDirectory({
        callerUserId: user1Id,
        callerVerifiedInstitutions: [institutionId],
        targetInstitutionId: institutionId,
        affiliations: dataset,
        filters: { search: 'Alice' },
      });

      expect(results).toHaveLength(1);
      expect(results[0].user?.fullName).toBe('Alice Smith');
    });
  });

  describe('Alumni Groups (BR-F125-04)', () => {
    it('creates group when creator is verified alumni of the institution', () => {
      const { group, creatorMembership } = createAlumniGroup({
        institutionId,
        name: 'Bay Area Alumni Chapter',
        description: 'San Francisco Bay Area networking group',
        chapterLocation: 'San Francisco',
        createdBy: user1Id,
        creatorVerifiedInstitutions: [institutionId],
      });

      expect(group.id).toBeDefined();
      expect(group.name).toBe('Bay Area Alumni Chapter');
      expect(group.institutionId).toBe(institutionId);
      expect(creatorMembership.userId).toBe(user1Id);
      expect(creatorMembership.role).toBe('admin');
    });

    it('prohibits group creation if creator is not verified alumni of the institution', () => {
      expect(() =>
        createAlumniGroup({
          institutionId,
          name: 'Unauthorized Group',
          createdBy: user1Id,
          creatorVerifiedInstitutions: [otherInstitutionId],
        })
      ).toThrow(DomainError);
    });

    it('allows verified alumni to join group and forbids unverified alumni', () => {
      const member = joinAlumniGroup({
        groupId: 'group-1',
        userId: user2Id,
        groupInstitutionId: institutionId,
        userVerifiedInstitutions: [institutionId],
        role: 'member',
      });

      expect(member.groupId).toBe('group-1');
      expect(member.userId).toBe(user2Id);
      expect(member.role).toBe('member');

      expect(() =>
        joinAlumniGroup({
          groupId: 'group-1',
          userId: 'stranger-id',
          groupInstitutionId: institutionId,
          userVerifiedInstitutions: [otherInstitutionId],
        })
      ).toThrow(DomainError);
    });
  });

  describe('Alumni Mentorship (BR-F125-05)', () => {
    it('creates mentorship request between verified alumni', () => {
      const request = createAlumniMentorshipRequest({
        mentorId: user1Id,
        menteeId: user2Id,
        institutionId,
        menteeVerifiedInstitutions: [institutionId],
        mentorVerifiedInstitutions: [institutionId],
        focusAreas: ['Distributed Systems', 'Cloud Architecture'],
      });

      expect(request.id).toBeDefined();
      expect(request.mentorId).toBe(user1Id);
      expect(request.menteeId).toBe(user2Id);
      expect(request.status).toBe('requested');
      expect(request.focusAreas).toEqual(['Distributed Systems', 'Cloud Architecture']);
    });

    it('prohibits self-mentorship', () => {
      expect(() =>
        createAlumniMentorshipRequest({
          mentorId: user1Id,
          menteeId: user1Id,
          institutionId,
          menteeVerifiedInstitutions: [institutionId],
          mentorVerifiedInstitutions: [institutionId],
        })
      ).toThrow(DomainError);
    });

    it('prohibits mentorship across institutions or unverified users', () => {
      expect(() =>
        createAlumniMentorshipRequest({
          mentorId: user1Id,
          menteeId: user2Id,
          institutionId,
          menteeVerifiedInstitutions: [otherInstitutionId],
          mentorVerifiedInstitutions: [institutionId],
        })
      ).toThrow(DomainError);
    });

    it('manages mentorship lifecycle: requested -> active -> completed', () => {
      const request = createAlumniMentorshipRequest({
        mentorId: user1Id,
        menteeId: user2Id,
        institutionId,
        menteeVerifiedInstitutions: [institutionId],
        mentorVerifiedInstitutions: [institutionId],
      });

      // Non-mentor cannot accept
      expect(() =>
        respondToAlumniMentorship({
          request,
          responderId: user2Id,
          action: 'accept',
        })
      ).toThrow(DomainError);

      // Mentor accepts
      const accepted = respondToAlumniMentorship({
        request,
        responderId: user1Id,
        action: 'accept',
      });
      expect(accepted.status).toBe('active');
      expect(accepted.respondedAt).toBeDefined();

      // Mentee completes
      const completed = respondToAlumniMentorship({
        request: accepted,
        responderId: user2Id,
        action: 'complete',
      });
      expect(completed.status).toBe('completed');
    });

    it('handles declined mentorship', () => {
      const request = createAlumniMentorshipRequest({
        mentorId: user1Id,
        menteeId: user2Id,
        institutionId,
        menteeVerifiedInstitutions: [institutionId],
        mentorVerifiedInstitutions: [institutionId],
      });

      const declined = respondToAlumniMentorship({
        request,
        responderId: user1Id,
        action: 'decline',
      });
      expect(declined.status).toBe('declined');
    });
  });
});
