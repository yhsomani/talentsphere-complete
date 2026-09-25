/**
 * TalentSphere Alumni Networks Domain Model (F-125, F-12, F-09, F-40)
 * Manages institutional alumni affiliations, cross-institution isolation,
 * verified directory discovery, chapter groups, and alumni mentorship programs.
 */

import crypto from 'node:crypto';
import { DomainError } from './index.js';

export type AlumniDegreeType =
  'bachelors' | 'masters' | 'phd' | 'bootcamp' | 'certification' | 'other';

export type AlumniVerificationMethod =
  'email_domain' | 'institutional_seat' | 'manual_review' | 'unverified';

export type AlumniVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface AlumniAffiliation {
  id: string;
  userId: string;
  institutionId: string;
  degreeType: AlumniDegreeType;
  fieldOfStudy: string;
  graduationYear: number;
  verificationMethod: AlumniVerificationMethod;
  verificationStatus: AlumniVerificationStatus;
  verifiedAt?: string;
  createdAt: string;
}

export interface AlumniGroup {
  id: string;
  institutionId: string;
  name: string;
  description?: string;
  chapterLocation: string;
  createdBy: string;
  createdAt: string;
}

export interface AlumniGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}

export type AlumniMentorshipStatus = 'requested' | 'active' | 'completed' | 'declined';

export interface AlumniMentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  institutionId: string;
  status: AlumniMentorshipStatus;
  focusAreas: string[];
  requestedAt: string;
  respondedAt?: string;
}

export interface CreateAffiliationParams {
  id?: string;
  userId: string;
  institutionId: string;
  degreeType: AlumniDegreeType;
  fieldOfStudy: string;
  graduationYear: number;
  verificationMethod?: AlumniVerificationMethod;
  userEmail?: string;
  institutionDomain?: string;
  nowIso?: string;
}

export interface DirectoryFilterParams {
  callerUserId: string;
  callerVerifiedInstitutions: string[];
  targetInstitutionId: string;
  affiliations: (AlumniAffiliation & { user?: { fullName?: string; email?: string } })[];
  filters?: {
    graduationYear?: number;
    minGraduationYear?: number;
    maxGraduationYear?: number;
    fieldOfStudy?: string;
    degreeType?: AlumniDegreeType;
    search?: string;
  };
}

export interface RequestMentorshipParams {
  id?: string;
  mentorId: string;
  menteeId: string;
  institutionId: string;
  menteeVerifiedInstitutions: string[];
  mentorVerifiedInstitutions: string[];
  focusAreas?: string[];
  nowIso?: string;
}

/**
 * Validates graduation year invariant (1950 - 2050).
 */
export function validateGraduationYear(year: number): void {
  if (!Number.isInteger(year) || year < 1950 || year > 2050) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `Graduation year ${year} is invalid. Must be between 1950 and 2050.`
    );
  }
}

/**
 * Creates a new alumni affiliation record with initial verification status.
 */
export function createAlumniAffiliation(params: CreateAffiliationParams): AlumniAffiliation {
  validateGraduationYear(params.graduationYear);

  if (!params.fieldOfStudy || params.fieldOfStudy.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Field of study cannot be empty');
  }

  const now = params.nowIso ?? new Date().toISOString();
  let verificationStatus: AlumniVerificationStatus = 'unverified';
  let verificationMethod: AlumniVerificationMethod = params.verificationMethod ?? 'unverified';
  let verifiedAt: string | undefined = undefined;

  // Auto-verify if email domain matches institution domain
  if (params.userEmail && params.institutionDomain) {
    const emailParts = params.userEmail.split('@');
    if (emailParts.length === 2) {
      const emailDomain = emailParts[1].toLowerCase();
      const targetDomain = params.institutionDomain.toLowerCase().replace(/^@/, '');
      if (emailDomain === targetDomain || emailDomain.endsWith(`.${targetDomain}`)) {
        verificationStatus = 'verified';
        verificationMethod = 'email_domain';
        verifiedAt = now;
      }
    }
  }

  return {
    id: params.id ?? crypto.randomUUID(),
    userId: params.userId,
    institutionId: params.institutionId,
    degreeType: params.degreeType,
    fieldOfStudy: params.fieldOfStudy.trim(),
    graduationYear: params.graduationYear,
    verificationMethod,
    verificationStatus,
    verifiedAt,
    createdAt: now,
  };
}

/**
 * Verifies an affiliation via institutional seat token/code.
 */
export function verifyAffiliationBySeatCode(
  affiliation: AlumniAffiliation,
  seatCode: string,
  validSeatCodes: Set<string>,
  nowIso?: string
): AlumniAffiliation {
  if (!validSeatCodes.has(seatCode.trim())) {
    throw new DomainError('VALIDATION_FAILED', 'Institutional verification seat code is invalid');
  }

  return {
    ...affiliation,
    verificationStatus: 'verified',
    verificationMethod: 'institutional_seat',
    verifiedAt: nowIso ?? new Date().toISOString(),
  };
}

/**
 * Enforces cross-institution isolation (BR-F125-03) and filters directory.
 * Users cannot view or query alumni from institutions where they are not verified.
 */
export function filterAlumniDirectory(
  params: DirectoryFilterParams
): (AlumniAffiliation & { user?: { fullName?: string; email?: string } })[] {
  const isAffiliated = params.callerVerifiedInstitutions.includes(params.targetInstitutionId);
  if (!isAffiliated) {
    throw new DomainError(
      'TENANT_ISOLATION_VIOLATION',
      'Access denied: You must be a verified alumni or member of this institution to browse its directory.'
    );
  }

  const filters = params.filters ?? {};

  return params.affiliations.filter((aff) => {
    // Only verified alumni are discoverable in public institutional directory
    if (aff.verificationStatus !== 'verified') {
      return false;
    }

    if (aff.institutionId !== params.targetInstitutionId) {
      return false;
    }

    if (filters.graduationYear !== undefined && aff.graduationYear !== filters.graduationYear) {
      return false;
    }

    if (filters.minGraduationYear !== undefined && aff.graduationYear < filters.minGraduationYear) {
      return false;
    }

    if (filters.maxGraduationYear !== undefined && aff.graduationYear > filters.maxGraduationYear) {
      return false;
    }

    if (filters.degreeType && aff.degreeType !== filters.degreeType) {
      return false;
    }

    if (filters.fieldOfStudy) {
      const match = aff.fieldOfStudy.toLowerCase().includes(filters.fieldOfStudy.toLowerCase());
      if (!match) return false;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inField = aff.fieldOfStudy.toLowerCase().includes(q);
      const inName = aff.user?.fullName ? aff.user.fullName.toLowerCase().includes(q) : false;
      if (!inField && !inName) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Creates an alumni group within an institution.
 * Creator must have verified affiliation with the institution.
 */
export function createAlumniGroup(params: {
  id?: string;
  institutionId: string;
  name: string;
  description?: string;
  chapterLocation?: string;
  createdBy: string;
  creatorVerifiedInstitutions: string[];
  nowIso?: string;
}): { group: AlumniGroup; creatorMembership: AlumniGroupMember } {
  if (!params.creatorVerifiedInstitutions.includes(params.institutionId)) {
    throw new DomainError(
      'TENANT_ISOLATION_VIOLATION',
      'Cannot create alumni group: Creator is not a verified alumni of this institution'
    );
  }

  if (!params.name || params.name.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Group name cannot be empty');
  }

  const now = params.nowIso ?? new Date().toISOString();
  const groupId = params.id ?? crypto.randomUUID();

  const group: AlumniGroup = {
    id: groupId,
    institutionId: params.institutionId,
    name: params.name.trim(),
    description: params.description?.trim(),
    chapterLocation: params.chapterLocation?.trim() || 'Global',
    createdBy: params.createdBy,
    createdAt: now,
  };

  const creatorMembership: AlumniGroupMember = {
    id: crypto.randomUUID(),
    groupId,
    userId: params.createdBy,
    role: 'admin',
    joinedAt: now,
  };

  return { group, creatorMembership };
}

/**
 * Verifies that a user can join an alumni group.
 */
export function joinAlumniGroup(params: {
  groupId: string;
  userId: string;
  groupInstitutionId: string;
  userVerifiedInstitutions: string[];
  role?: 'member' | 'moderator' | 'admin';
  nowIso?: string;
}): AlumniGroupMember {
  if (!params.userVerifiedInstitutions.includes(params.groupInstitutionId)) {
    throw new DomainError(
      'TENANT_ISOLATION_VIOLATION',
      'Cannot join alumni group: User is not a verified alumni of this institution'
    );
  }

  return {
    id: crypto.randomUUID(),
    groupId: params.groupId,
    userId: params.userId,
    role: params.role ?? 'member',
    joinedAt: params.nowIso ?? new Date().toISOString(),
  };
}

/**
 * Creates an alumni mentorship request with validation and institution matching.
 */
export function createAlumniMentorshipRequest(
  params: RequestMentorshipParams
): AlumniMentorshipRequest {
  if (params.mentorId === params.menteeId) {
    throw new DomainError('FORBIDDEN', 'Cannot request mentorship from oneself');
  }

  const menteeHasAffiliation = params.menteeVerifiedInstitutions.includes(params.institutionId);
  const mentorHasAffiliation = params.mentorVerifiedInstitutions.includes(params.institutionId);

  if (!menteeHasAffiliation || !mentorHasAffiliation) {
    throw new DomainError(
      'TENANT_ISOLATION_VIOLATION',
      'Both mentor and mentee must have verified affiliations with the institution'
    );
  }

  const now = params.nowIso ?? new Date().toISOString();

  return {
    id: params.id ?? crypto.randomUUID(),
    mentorId: params.mentorId,
    menteeId: params.menteeId,
    institutionId: params.institutionId,
    status: 'requested',
    focusAreas: params.focusAreas ? [...new Set(params.focusAreas.map((f) => f.trim()))] : [],
    requestedAt: now,
  };
}

/**
 * Transitions alumni mentorship request status.
 */
export function respondToAlumniMentorship(params: {
  request: AlumniMentorshipRequest;
  responderId: string;
  action: 'accept' | 'decline' | 'complete';
  nowIso?: string;
}): AlumniMentorshipRequest {
  const { request, responderId, action } = params;
  const now = params.nowIso ?? new Date().toISOString();

  if (action === 'accept' || action === 'decline') {
    if (responderId !== request.mentorId) {
      throw new DomainError(
        'FORBIDDEN',
        'Only the requested mentor can accept or decline a mentorship request'
      );
    }
    if (request.status !== 'requested') {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        `Cannot ${action} a mentorship request that is currently '${request.status}'`
      );
    }

    return {
      ...request,
      status: action === 'accept' ? 'active' : 'declined',
      respondedAt: now,
    };
  }

  if (action === 'complete') {
    if (responderId !== request.mentorId && responderId !== request.menteeId) {
      throw new DomainError('FORBIDDEN', 'Only participants can mark a mentorship as completed');
    }
    if (request.status !== 'active') {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        `Cannot complete a mentorship that is not active (current status: '${request.status}')`
      );
    }

    return {
      ...request,
      status: 'completed',
      respondedAt: now,
    };
  }

  throw new DomainError('VALIDATION_FAILED', `Action ${action} is not recognized`);
}
