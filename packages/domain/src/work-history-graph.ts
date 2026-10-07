/**
 * TalentSphere Verified Work History Network & References Domain Module (F-162, F-94, F-84)
 * Manages employment histories, corporate email attestation, structured referee evaluations,
 * anti-fraud checks, tenure calculation, deterministic confidence scoring, and work history graphs.
 */

import crypto from 'node:crypto';
import { DomainError } from './core.js';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';

export type VerificationStatus =
  'unverified' | 'pending_verification' | 'verified' | 'disputed' | 'rejected';

export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold';

export type ReferenceRelationship = 'manager' | 'peer' | 'direct_report' | 'mentor' | 'client';

export type ReferenceStatus = 'requested' | 'submitted' | 'declined' | 'flagged';

export interface ReferenceRatings {
  technicalProficiency: number; // 1 to 5
  collaborationRating: number; // 1 to 5
  deliveryReliability: number; // 1 to 5
  leadershipRating?: number; // 1 to 5
}

export interface EmploymentReference {
  id: string;
  workHistoryId: string;
  candidateId: string;
  refereeId?: string;
  refereeName: string;
  refereeEmail: string;
  relationship: ReferenceRelationship;
  status: ReferenceStatus;
  confirmDates?: boolean;
  confirmTitle?: boolean;
  ratings?: ReferenceRatings;
  endorsedSkills: string[];
  summaryNotes?: string;
  token?: string;
  requestedAt: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerifiedWorkHistory {
  id: string;
  candidateId: string;
  companyName: string;
  companyId?: string;
  title: string;
  employmentType: EmploymentType;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isCurrent: boolean;
  description?: string;
  corporateEmail?: string;
  emailVerifiedAt?: string;
  verificationStatus: VerificationStatus;
  verificationScore: number; // 0.00 to 100.00
  badgeTier: BadgeTier;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkHistoryGraphNode {
  id: string;
  type: 'candidate' | 'company' | 'reference' | 'skill';
  label: string;
  metadata?: Record<string, unknown>;
}

export interface WorkHistoryGraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'employed_at' | 'referred_by' | 'endorsed_skill' | 'managed_by';
  label: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface WorkHistoryGraphSummary {
  totalTenureMonths: number;
  verifiedTenureMonths: number;
  totalRoles: number;
  verifiedRoles: number;
  totalReferences: number;
  averageReferenceRating: number;
  aggregateTrustScore: number;
  topVerifiedSkills: { skill: string; endorsementsCount: number }[];
}

export interface WorkHistoryGraph {
  candidateId: string;
  nodes: WorkHistoryGraphNode[];
  edges: WorkHistoryGraphEdge[];
  summary: WorkHistoryGraphSummary;
}

/**
 * Disposable email provider domain list for anti-fraud detection.
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  '10minutemail.com',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
]);

/**
 * Generic consumer webmail providers that cannot attest for corporate employment.
 */
export const CONSUMER_WEBMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
]);

/**
 * Validates work history date ranges and future date invariants.
 */
export function validateWorkHistoryDates(
  startDate: string,
  endDate?: string,
  isCurrent?: boolean,
  nowIso?: string
): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate)) {
    throw new DomainError('VALIDATION_FAILED', 'Start date must be in YYYY-MM-DD format.');
  }

  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    throw new DomainError('VALIDATION_FAILED', 'Invalid start date format.');
  }

  const now = nowIso ? new Date(nowIso) : new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (startDate > todayStr) {
    throw new DomainError('VALIDATION_FAILED', 'Start date cannot be in the future.');
  }

  if (isCurrent && endDate) {
    throw new DomainError('VALIDATION_FAILED', 'Current employment cannot have an end date.');
  }

  if (endDate) {
    if (!dateRegex.test(endDate)) {
      throw new DomainError('VALIDATION_FAILED', 'End date must be in YYYY-MM-DD format.');
    }
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      throw new DomainError('VALIDATION_FAILED', 'Invalid end date format.');
    }
    if (endDate < startDate) {
      throw new DomainError('VALIDATION_FAILED', 'End date cannot precede start date.');
    }
    if (endDate > todayStr) {
      throw new DomainError('VALIDATION_FAILED', 'End date cannot be in the future.');
    }
  }
}

/**
 * Computes employment tenure duration in full months.
 */
export function calculateTenureMonths(
  startDate: string,
  endDate?: string,
  isCurrent?: boolean,
  nowIso?: string
): number {
  const [sYear, sMonth] = startDate.split('-').map(Number);

  let eYear: number;
  let eMonth: number;

  if (isCurrent || !endDate) {
    const now = nowIso ? new Date(nowIso) : new Date();
    eYear = now.getUTCFullYear();
    eMonth = now.getUTCMonth() + 1;
  } else {
    const parts = endDate.split('-').map(Number);
    eYear = parts[0];
    eMonth = parts[1];
  }

  const totalMonths = (eYear - sYear) * 12 + (eMonth - sMonth);
  return Math.max(1, totalMonths);
}

/**
 * Normalizes and extracts root host domain from URL or domain string.
 */
export function extractDomain(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0];
  return cleaned;
}

/**
 * Validates corporate email address against company domain and anti-fraud lists.
 */
export function verifyCorporateEmailDomain(email: string, companyWebsiteOrDomain: string): boolean {
  if (!email || !email.includes('@')) return false;

  const emailParts = email.trim().toLowerCase().split('@');
  if (emailParts.length !== 2) return false;
  const emailDomain = emailParts[1];

  // Anti-fraud check: reject disposable emails
  if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
    throw new DomainError('VALIDATION_FAILED', 'Disposable email addresses are not permitted.');
  }

  // Anti-fraud check: reject generic webmail providers for corporate verification
  if (CONSUMER_WEBMAIL_DOMAINS.has(emailDomain)) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Generic webmail addresses cannot be used for corporate domain attestation.'
    );
  }

  const targetDomain = extractDomain(companyWebsiteOrDomain);
  if (!targetDomain) return false;

  return emailDomain === targetDomain || emailDomain.endsWith(`.${targetDomain}`);
}

/**
 * Calculates deterministic verification score (0-100) and badge tier.
 */
export function calculateVerificationScoreAndBadge(
  workHistory: {
    corporateEmail?: string;
    emailVerifiedAt?: string;
    skills?: string[];
  },
  references: EmploymentReference[]
): {
  score: number;
  badgeTier: BadgeTier;
  status: VerificationStatus;
} {
  let score = 0;

  // 1. Corporate email attestation: +40 pts
  if (workHistory.emailVerifiedAt) {
    score += 40;
  }

  // 2. References evaluation
  const submittedRefs = references.filter((r) => r.status === 'submitted');
  const validConfirmedRefs = submittedRefs.filter(
    (r) => r.confirmDates !== false && r.confirmTitle !== false
  );

  if (validConfirmedRefs.length > 0) {
    const hasManager = validConfirmedRefs.some((r) => r.relationship === 'manager');
    const hasPeer = validConfirmedRefs.some((r) => r.relationship === 'peer');

    if (hasManager) {
      score += 30;
    } else if (hasPeer) {
      score += 20;
    } else {
      score += 15;
    }

    // Additional reference bonus (+15 pts for 2 or more confirmed references)
    if (validConfirmedRefs.length >= 2) {
      score += 15;
    }

    // Rating quality bonus: if average rating >= 4.0, +10 pts
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;
    for (const ref of validConfirmedRefs) {
      if (ref.ratings) {
        totalRatingsSum +=
          ref.ratings.technicalProficiency +
          ref.ratings.collaborationRating +
          ref.ratings.deliveryReliability;
        totalRatingsCount += 3;
      }
    }
    if (totalRatingsCount > 0 && totalRatingsSum / totalRatingsCount >= 4.0) {
      score += 10;
    }
  }

  // 3. Verified skills attached: +5 pts for at least 2 skills
  if (workHistory.skills && workHistory.skills.length >= 2) {
    score += 5;
  }

  // Cap score at 100 max
  score = Math.min(100, Math.round(score * 100) / 100);

  // Badge tier assignment
  let badgeTier: BadgeTier = 'none';
  if (score >= 80) {
    badgeTier = 'gold';
  } else if (score >= 50) {
    badgeTier = 'silver';
  } else if (score >= 25) {
    badgeTier = 'bronze';
  }

  // Status assignment
  let status: VerificationStatus = 'unverified';
  if (score >= 25) {
    status = 'verified';
  } else if (workHistory.corporateEmail || references.length > 0) {
    status = 'pending_verification';
  }

  return { score, badgeTier, status };
}

export interface CreateWorkHistoryParams {
  id?: string;
  candidateId: string;
  companyName: string;
  companyId?: string;
  title: string;
  employmentType?: EmploymentType;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  corporateEmail?: string;
  skills?: string[];
  nowIso?: string;
}

/**
 * Creates a new work history entry with date validation.
 */
export function createWorkHistory(params: CreateWorkHistoryParams): VerifiedWorkHistory {
  validateWorkHistoryDates(params.startDate, params.endDate, params.isCurrent, params.nowIso);

  const now = params.nowIso ?? new Date().toISOString();
  const id = params.id ?? crypto.randomUUID();

  return {
    id,
    candidateId: params.candidateId,
    companyName: params.companyName.trim(),
    companyId: params.companyId,
    title: params.title.trim(),
    employmentType: params.employmentType ?? 'full_time',
    startDate: params.startDate,
    endDate: params.isCurrent ? undefined : params.endDate,
    isCurrent: Boolean(params.isCurrent),
    description: params.description?.trim(),
    corporateEmail: params.corporateEmail?.trim().toLowerCase(),
    emailVerifiedAt: undefined,
    verificationStatus: 'unverified',
    verificationScore: 0.0,
    badgeTier: 'none',
    skills: params.skills ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

export interface VerifyCorporateEmailParams {
  workHistory: VerifiedWorkHistory;
  corporateEmail: string;
  companyDomain?: string;
  references?: EmploymentReference[];
  nowIso?: string;
}

/**
 * Verifies corporate email domain and updates work history verification status and score.
 */
export function verifyCorporateEmail(params: VerifyCorporateEmailParams): VerifiedWorkHistory {
  const { workHistory, corporateEmail, companyDomain } = params;
  const now = params.nowIso ?? new Date().toISOString();

  // If companyDomain is provided, verify matching
  if (companyDomain) {
    const isDomainMatch = verifyCorporateEmailDomain(corporateEmail, companyDomain);
    if (!isDomainMatch) {
      throw new DomainError(
        'VALIDATION_FAILED',
        `Corporate email domain does not match company domain "${companyDomain}".`
      );
    }
  } else {
    // If no domain provided, still check anti-fraud list
    const emailParts = corporateEmail.toLowerCase().split('@');
    if (emailParts.length === 2) {
      if (DISPOSABLE_EMAIL_DOMAINS.has(emailParts[1])) {
        throw new DomainError('VALIDATION_FAILED', 'Disposable email addresses are not permitted.');
      }
      if (CONSUMER_WEBMAIL_DOMAINS.has(emailParts[1])) {
        throw new DomainError(
          'VALIDATION_FAILED',
          'Generic webmail addresses cannot be used for corporate domain attestation.'
        );
      }
    }
  }

  const updatedHistory: VerifiedWorkHistory = {
    ...workHistory,
    corporateEmail: corporateEmail.toLowerCase(),
    emailVerifiedAt: now,
    updatedAt: now,
  };

  const { score, badgeTier, status } = calculateVerificationScoreAndBadge(
    updatedHistory,
    params.references ?? []
  );

  return {
    ...updatedHistory,
    verificationScore: score,
    badgeTier,
    verificationStatus: status,
  };
}

export interface RequestEmploymentReferenceParams {
  id?: string;
  workHistoryId: string;
  candidateId: string;
  candidateUserId: string;
  candidateEmail?: string;
  refereeUserId?: string;
  refereeName: string;
  refereeEmail: string;
  relationship: ReferenceRelationship;
  nowIso?: string;
}

/**
 * Requests an employment reference with strict anti-self endorsement checks.
 */
export function requestEmploymentReference(
  params: RequestEmploymentReferenceParams
): EmploymentReference {
  const normRefereeEmail = params.refereeEmail.trim().toLowerCase();

  // Anti-self check 1: referee user ID cannot match candidate user ID
  if (params.refereeUserId && params.refereeUserId === params.candidateUserId) {
    throw new DomainError('CONFLICT', 'Candidate cannot act as their own referee.');
  }

  // Anti-self check 2: referee email cannot match candidate email
  if (params.candidateEmail && normRefereeEmail === params.candidateEmail.trim().toLowerCase()) {
    throw new DomainError('CONFLICT', 'Candidate email cannot match referee email.');
  }

  const now = params.nowIso ?? new Date().toISOString();
  const token = crypto.randomBytes(16).toString('hex');

  return {
    id: params.id ?? crypto.randomUUID(),
    workHistoryId: params.workHistoryId,
    candidateId: params.candidateId,
    refereeId: params.refereeUserId,
    refereeName: params.refereeName.trim(),
    refereeEmail: normRefereeEmail,
    relationship: params.relationship,
    status: 'requested',
    endorsedSkills: [],
    token,
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

export interface SubmitEmploymentReferenceParams {
  reference: EmploymentReference;
  token?: string;
  confirmDates: boolean;
  confirmTitle: boolean;
  ratings: ReferenceRatings;
  endorsedSkills?: string[];
  summaryNotes?: string;
  nowIso?: string;
}

/**
 * Submits structured ratings and confirmation from a referee.
 */
export function submitEmploymentReference(
  params: SubmitEmploymentReferenceParams
): EmploymentReference {
  const { reference } = params;

  if (reference.status !== 'requested') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Reference cannot be submitted because it is currently "${reference.status}".`
    );
  }

  if (reference.token && params.token && reference.token !== params.token) {
    throw new DomainError('UNAUTHORIZED', 'Invalid or expired reference token.');
  }

  // Validate ratings bounds 1-5
  const { technicalProficiency, collaborationRating, deliveryReliability, leadershipRating } =
    params.ratings;
  for (const [key, val] of Object.entries({
    technicalProficiency,
    collaborationRating,
    deliveryReliability,
    ...(leadershipRating !== undefined ? { leadershipRating } : {}),
  })) {
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      throw new DomainError(
        'VALIDATION_FAILED',
        `Rating ${key} must be an integer between 1 and 5.`
      );
    }
  }

  const now = params.nowIso ?? new Date().toISOString();

  return {
    ...reference,
    status: 'submitted',
    confirmDates: params.confirmDates,
    confirmTitle: params.confirmTitle,
    ratings: params.ratings,
    endorsedSkills: params.endorsedSkills ?? [],
    summaryNotes: params.summaryNotes?.trim(),
    submittedAt: now,
    updatedAt: now,
  };
}

export interface BuildWorkHistoryGraphParams {
  candidateId: string;
  candidateName: string;
  workHistories: VerifiedWorkHistory[];
  references: EmploymentReference[];
  includeUnverified?: boolean;
}

/**
 * Constructs the multi-entity work history network & graph representation (F-162).
 */
export function buildWorkHistoryGraph(params: BuildWorkHistoryGraphParams): WorkHistoryGraph {
  const { candidateId, candidateName, includeUnverified = false } = params;

  const nodes: WorkHistoryGraphNode[] = [];
  const edges: WorkHistoryGraphEdge[] = [];
  const existingNodeIds = new Set<string>();

  // 1. Candidate Central Node
  const candidateNodeId = `candidate_${candidateId}`;
  nodes.push({
    id: candidateNodeId,
    type: 'candidate',
    label: candidateName,
    metadata: { candidateId },
  });
  existingNodeIds.add(candidateNodeId);

  let totalTenureMonths = 0;
  let verifiedTenureMonths = 0;
  let verifiedRolesCount = 0;
  let totalRatingSum = 0;
  let totalRatingCount = 0;
  let totalTrustScoreSum = 0;

  const skillEndorsementsMap = new Map<string, number>();

  // 2. Company Nodes & Employment Edges
  for (const wh of params.workHistories) {
    const tenureMonths = calculateTenureMonths(wh.startDate, wh.endDate, wh.isCurrent);
    totalTenureMonths += tenureMonths;

    if (wh.verificationStatus === 'verified' || wh.badgeTier !== 'none') {
      verifiedTenureMonths += tenureMonths;
      verifiedRolesCount++;
      totalTrustScoreSum += wh.verificationScore;
    }

    // Only render node/edge if included
    if (includeUnverified || wh.verificationStatus === 'verified' || wh.badgeTier !== 'none') {
      const companyNodeId = `company_${wh.companyId || wh.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      if (!existingNodeIds.has(companyNodeId)) {
        nodes.push({
          id: companyNodeId,
          type: 'company',
          label: wh.companyName,
          metadata: { companyId: wh.companyId },
        });
        existingNodeIds.add(companyNodeId);
      }

      edges.push({
        id: `edge_emp_${wh.id}`,
        source: candidateNodeId,
        target: companyNodeId,
        type: 'employed_at',
        label: `${wh.title} (${tenureMonths}m)`,
        weight: wh.verificationScore / 100,
        metadata: {
          workHistoryId: wh.id,
          title: wh.title,
          tenureMonths,
          badgeTier: wh.badgeTier,
          verificationStatus: wh.verificationStatus,
        },
      });

      // Add attached skills
      for (const skill of wh.skills) {
        const skillNodeId = `skill_${skill.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        if (!existingNodeIds.has(skillNodeId)) {
          nodes.push({
            id: skillNodeId,
            type: 'skill',
            label: skill,
          });
          existingNodeIds.add(skillNodeId);
        }

        edges.push({
          id: `edge_skill_${wh.id}_${skillNodeId}`,
          source: candidateNodeId,
          target: skillNodeId,
          type: 'endorsed_skill',
          label: 'Attested Skill',
          weight: 0.5,
        });

        skillEndorsementsMap.set(skill, (skillEndorsementsMap.get(skill) ?? 0) + 1);
      }
    }
  }

  // 3. Reference Nodes & Referee Edges
  const candidateHistoryIds = new Set(params.workHistories.map((wh) => wh.id));
  const candidateRefs = params.references.filter((ref) =>
    candidateHistoryIds.has(ref.workHistoryId)
  );

  let submittedRefsCount = 0;
  for (const ref of candidateRefs) {
    if (ref.status === 'submitted') {
      submittedRefsCount++;
      if (ref.ratings) {
        const avg =
          (ref.ratings.technicalProficiency +
            ref.ratings.collaborationRating +
            ref.ratings.deliveryReliability) /
          3;
        totalRatingSum += avg;
        totalRatingCount++;
      }

      // Add referee node
      const refNodeId = `referee_${ref.id}`;
      if (!existingNodeIds.has(refNodeId)) {
        nodes.push({
          id: refNodeId,
          type: 'reference',
          label: `${ref.refereeName} (${ref.relationship})`,
          metadata: {
            refereeName: ref.refereeName,
            relationship: ref.relationship,
          },
        });
        existingNodeIds.add(refNodeId);
      }

      // Candidate <- Referred By Referee
      edges.push({
        id: `edge_ref_${ref.id}`,
        source: candidateNodeId,
        target: refNodeId,
        type: 'referred_by',
        label: `Referred by ${ref.relationship}`,
        weight: ref.confirmDates && ref.confirmTitle ? 1.0 : 0.5,
        metadata: {
          referenceId: ref.id,
          ratings: ref.ratings,
        },
      });

      // Manager relation edge
      if (ref.relationship === 'manager') {
        edges.push({
          id: `edge_managed_${ref.id}`,
          source: refNodeId,
          target: candidateNodeId,
          type: 'managed_by',
          label: 'Direct Supervisor',
          weight: 1.0,
        });
      }

      // Endorsed skills from reference
      for (const skill of ref.endorsedSkills) {
        const skillNodeId = `skill_${skill.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        if (!existingNodeIds.has(skillNodeId)) {
          nodes.push({
            id: skillNodeId,
            type: 'skill',
            label: skill,
          });
          existingNodeIds.add(skillNodeId);
        }

        edges.push({
          id: `edge_ref_skill_${ref.id}_${skillNodeId}`,
          source: refNodeId,
          target: skillNodeId,
          type: 'endorsed_skill',
          label: 'Endorsed Skill',
          weight: 1.0,
        });

        skillEndorsementsMap.set(skill, (skillEndorsementsMap.get(skill) ?? 0) + 1);
      }
    }
  }

  // Summary Metrics
  const avgRating =
    totalRatingCount > 0 ? Math.round((totalRatingSum / totalRatingCount) * 10) / 10 : 0;
  const aggregateTrustScore =
    verifiedRolesCount > 0 ? Math.round((totalTrustScoreSum / verifiedRolesCount) * 100) / 100 : 0;

  const topVerifiedSkills = Array.from(skillEndorsementsMap.entries())
    .map(([skill, endorsementsCount]) => ({ skill, endorsementsCount }))
    .sort((a, b) => b.endorsementsCount - a.endorsementsCount);

  return {
    candidateId,
    nodes,
    edges,
    summary: {
      totalTenureMonths,
      verifiedTenureMonths,
      totalRoles: params.workHistories.length,
      verifiedRoles: verifiedRolesCount,
      totalReferences: submittedRefsCount,
      averageReferenceRating: avgRating,
      aggregateTrustScore,
      topVerifiedSkills,
    },
  };
}
