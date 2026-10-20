import { createHash } from 'node:crypto';
import {
  DomainError,
  type Role,
  type Evidence,
  type EvidenceType,
  type VerificationLevel,
  type EvidenceStatus,
} from './core.js';

export interface CreateEvidenceParams {
  id?: string;
  subjectId: string;
  type: EvidenceType;
  title: string;
  description: string;
  source: string;
  provenance: string;
  recencyDate: string;
  metadata?: Record<string, unknown>;
}

export interface PublicEvidenceProof {
  evidenceId: string;
  title: string;
  type: EvidenceType;
  verificationLevel: VerificationLevel;
  status: EvidenceStatus;
  verifiedAt?: string;
  recencyDate: string;
  issuerRole?: string;
  proofHash: string;
  verificationUrl: string;
}

/**
 * Creates a new Evidence claim.
 * Under SSOT invariant: Claim ≠ Evidence, Evidence ≠ Verification.
 * Newly created evidence begins as 'unverified' and 'pending'.
 */
export function createEvidence(params: CreateEvidenceParams): Evidence {
  if (!params.title || params.title.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Evidence title is required.');
  }
  if (!params.subjectId) {
    throw new DomainError('VALIDATION_FAILED', 'Subject ID is required for evidence.');
  }
  if (!params.recencyDate || !/^\d{4}-\d{2}-\d{2}$/.test(params.recencyDate)) {
    throw new DomainError('VALIDATION_FAILED', 'A valid recency date (YYYY-MM-DD) is required.');
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    subjectId: params.subjectId,
    type: params.type,
    title: params.title.trim(),
    description: params.description?.trim() || '',
    source: params.source?.trim() || 'self_reported',
    provenance: params.provenance?.trim() || 'direct_submission',
    verificationLevel: 'unverified',
    status: 'pending',
    recencyDate: params.recencyDate,
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Who is acting on an evidence record. Pass every role the account holds
 * (`roles`): authority comes from any of them, not only the first (gap
 * G-25). `role` alone is still accepted for single-role callers.
 */
export interface EvidenceActor {
  userId: string;
  role?: Role;
  roles?: Role[];
}

/**
 * What the caller knows about the actor's relationship with the evidence's
 * subject. Peer review and disputes need a recorded relationship — today, a
 * reference the actor submitted for one of the subject's roles (gap G-01).
 */
export interface EvidenceRelationship {
  /** The subject's account id (evidence.subjectId is a profile id). */
  subjectUserId?: string;
  /** The actor submitted a reference for one of the subject's roles. */
  isConfirmedReferee?: boolean;
}

const rolesOf = (actor: EvidenceActor): Role[] => actor.roles ?? (actor.role ? [actor.role] : []);

/** The first of `wanted` the actor holds, if any. */
const heldRole = (actor: EvidenceActor, wanted: Role[]): Role | undefined =>
  wanted.find((r) => rolesOf(actor).includes(r));

/** Staff who may peer-review or dispute anyone's evidence. */
const EVIDENCE_STAFF: Role[] = ['platform_admin', 'verification_staff'];

/** Verification levels from least to most trusted. */
const LEVEL_RANK: Record<VerificationLevel, number> = {
  unverified: 0,
  peer_reviewed: 1,
  institution_verified: 2,
  authority_verified: 3,
};

/**
 * Verifies and elevates an evidence item to a target verification level.
 * Invariant: Candidates cannot self-verify. Verifiers must hold appropriate roles;
 * peer review additionally needs a recorded relationship with the subject.
 */
export function verifyEvidence(
  evidence: Evidence,
  verifier: EvidenceActor,
  targetLevel: VerificationLevel,
  notes?: string,
  subjectUserId?: string,
  relationship: EvidenceRelationship = {}
): Evidence {
  if (evidence.status === 'revoked') {
    throw new DomainError('INVALID_STATE_TRANSITION', 'Cannot verify a revoked evidence record.');
  }
  if (evidence.status === 'expired') {
    throw new DomainError('INVALID_STATE_TRANSITION', 'Cannot verify an expired evidence record.');
  }
  const isStaff = !!heldRole(verifier, EVIDENCE_STAFF);
  // A dispute is settled by staff, not undone by another verification
  // (review REV-02: a peer could re-verify a record staff had disputed).
  if (evidence.status === 'disputed' && !isStaff) {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      'This record is disputed; only verification staff can resolve it.'
    );
  }
  // Verification only moves up. Lowering a record's level, or a peer
  // replacing an existing verification (and with it `verifiedBy`), is refused.
  if (evidence.status === 'verified') {
    const current = LEVEL_RANK[evidence.verificationLevel];
    if (LEVEL_RANK[targetLevel] < current) {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        `This record is already ${evidence.verificationLevel}; verification cannot lower it.`
      );
    }
    if (LEVEL_RANK[targetLevel] === current && !isStaff) {
      throw new DomainError('CONFLICT', `This record is already ${evidence.verificationLevel}.`);
    }
  }

  // Self-verification check (subject cannot verify their own evidence)
  if (
    verifier.userId === evidence.subjectId ||
    (subjectUserId && verifier.userId === subjectUserId)
  ) {
    throw new DomainError(
      'FORBIDDEN',
      'Subject cannot self-verify evidence (Anti-gaming invariant).'
    );
  }

  // Role authority checks per target level
  let actingRole: Role | 'peer' | undefined;
  switch (targetLevel) {
    case 'peer_reviewed':
      // A peer is someone with a recorded relationship to the subject, not any
      // account (gap G-01: a second account could "peer review" its owner).
      actingRole = heldRole(verifier, EVIDENCE_STAFF);
      if (!actingRole && relationship.isConfirmedReferee) actingRole = 'peer';
      if (!actingRole) {
        throw new DomainError(
          'FORBIDDEN',
          'Peer review needs a recorded relationship with this person, such as a reference you gave them.'
        );
      }
      break;
    case 'institution_verified':
      actingRole = heldRole(verifier, ['institution_admin', 'instructor', 'platform_admin']);
      if (!actingRole) {
        throw new DomainError(
          'UNAUTHORIZED',
          'Institution verification requires an institution admin, instructor, or platform admin.'
        );
      }
      break;
    case 'authority_verified':
      actingRole = heldRole(verifier, ['platform_admin', 'verification_staff']);
      if (!actingRole) {
        throw new DomainError(
          'UNAUTHORIZED',
          'Authority verification requires platform admin or verification staff authority.'
        );
      }
      break;
    case 'unverified':
      throw new DomainError('INVALID_STATE_TRANSITION', 'Cannot elevate evidence to unverified.');
  }

  const now = new Date().toISOString();
  return {
    ...evidence,
    verificationLevel: targetLevel,
    status: 'verified',
    verifiedBy: verifier.userId,
    verifiedAt: now,
    metadata: {
      ...evidence.metadata,
      verificationNotes: notes || 'Verified according to platform standards.',
      verifiedByRole: actingRole,
    },
    updatedAt: now,
  };
}

/**
 * Disputes an evidence record.
 * Transitions status to 'disputed' and attaches dispute reasoning.
 */
export function disputeEvidence(
  evidence: Evidence,
  disputant: EvidenceActor,
  reason: string,
  relationship: EvidenceRelationship = {}
): Evidence {
  if (!reason || reason.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Dispute reason is required.');
  }
  if (evidence.status === 'revoked') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      'Cannot dispute an already revoked evidence record.'
    );
  }
  // Who may challenge a record (gap G-01): staff and moderators, whoever
  // verified it, or someone with a recorded relationship to the subject.
  // Anyone else reports it through moderation instead.
  const mayDispute =
    !!heldRole(disputant, [...EVIDENCE_STAFF, 'moderator']) ||
    (!!evidence.verifiedBy && evidence.verifiedBy === disputant.userId) ||
    !!relationship.isConfirmedReferee;
  if (!mayDispute) {
    throw new DomainError(
      'FORBIDDEN',
      'Only staff, the verifier, or someone with a recorded relationship to this person may dispute it. Report it instead.'
    );
  }

  const now = new Date().toISOString();
  return {
    ...evidence,
    status: 'disputed',
    metadata: {
      ...evidence.metadata,
      disputeReason: reason.trim(),
      disputedBy: disputant.userId,
      disputedAt: now,
    },
    updatedAt: now,
  };
}

/**
 * Revokes an evidence record (BR-149: append-only semantics, records revocation timestamp).
 */
export function revokeEvidence(
  evidence: Evidence,
  actor: EvidenceActor,
  reason: string,
  subjectUserId?: string
): Evidence {
  if (!reason || reason.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Revocation reason is required.');
  }

  // evidence.subjectId is the owner's PROFILE id; the actor is an account
  // (gap G-02: comparing the two meant owners could never revoke).
  const isOwner =
    (!!subjectUserId && actor.userId === subjectUserId) || actor.userId === evidence.subjectId;
  const isAuthority = !!heldRole(actor, EVIDENCE_STAFF);
  // The issuer who verified it (an institution, staff) may withdraw it; a
  // peer reviewer may not revoke someone else's evidence (review REV-02).
  const isOriginalVerifier =
    evidence.verifiedBy === actor.userId && evidence.metadata?.verifiedByRole !== 'peer';

  if (!isOwner && !isAuthority && !isOriginalVerifier) {
    throw new DomainError(
      'FORBIDDEN',
      'Only the owner, issuer/verifier, or platform admin may revoke evidence.'
    );
  }

  const now = new Date().toISOString();
  return {
    ...evidence,
    status: 'revoked',
    metadata: {
      ...evidence.metadata,
      revocationReason: reason.trim(),
      revokedBy: actor.userId,
      revokedAt: now,
    },
    updatedAt: now,
  };
}

/**
 * Generates a privacy-preserving public verification proof conforming to BR-150 and BR-155.
 * Zero PII exposed: candidate name, email, address, and personal notes are completely omitted.
 */
export function generatePublicProof(evidence: Evidence): PublicEvidenceProof {
  const hashPayload = `${evidence.id}:${evidence.type}:${evidence.verificationLevel}:${evidence.verifiedAt || 'unverified'}`;
  const proofHash = createHash('sha256').update(hashPayload).digest('hex');

  return {
    evidenceId: evidence.id,
    title: evidence.title,
    type: evidence.type,
    verificationLevel: evidence.verificationLevel,
    status: evidence.status,
    verifiedAt: evidence.verifiedAt,
    recencyDate: evidence.recencyDate,
    issuerRole:
      (evidence.metadata?.verifiedByRole as string) ||
      (evidence.verificationLevel === 'unverified' ? 'self_reported' : 'platform_authority'),
    proofHash,
    verificationUrl: `/verify/evidence/${evidence.id}`,
  };
}
