import { createHash } from 'node:crypto';
import { DomainError, type Role, type Evidence, type EvidenceType, type VerificationLevel, type EvidenceStatus } from './index.js';

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
 * Verifies and elevates an evidence item to a target verification level.
 * Invariant: Candidates cannot self-verify. Verifiers must hold appropriate roles.
 */
export function verifyEvidence(
  evidence: Evidence,
  verifier: { userId: string; role: Role },
  targetLevel: VerificationLevel,
  notes?: string,
  subjectUserId?: string
): Evidence {
  if (evidence.status === 'revoked') {
    throw new DomainError('INVALID_STATE_TRANSITION', 'Cannot verify a revoked evidence record.');
  }
  if (evidence.status === 'expired') {
    throw new DomainError('INVALID_STATE_TRANSITION', 'Cannot verify an expired evidence record.');
  }

  // Self-verification check (subject cannot verify their own evidence)
  if (verifier.userId === evidence.subjectId || (subjectUserId && verifier.userId === subjectUserId)) {
    throw new DomainError('FORBIDDEN', 'Subject cannot self-verify evidence (Anti-gaming invariant).');
  }

  // Role authority checks per target level
  switch (targetLevel) {
    case 'peer_reviewed':
      // Any verified user or peer can perform peer review
      break;
    case 'institution_verified':
      if (
        verifier.role !== 'institution_admin' &&
        verifier.role !== 'instructor' &&
        verifier.role !== 'platform_admin'
      ) {
        throw new DomainError(
          'UNAUTHORIZED',
          'Institution verification requires an institution admin, instructor, or platform admin.'
        );
      }
      break;
    case 'authority_verified':
      if (verifier.role !== 'platform_admin' && verifier.role !== 'verification_staff') {
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
      verifiedByRole: verifier.role,
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
  disputant: { userId: string; role: Role },
  reason: string
): Evidence {
  if (!reason || reason.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Dispute reason is required.');
  }
  if (evidence.status === 'revoked') {
    throw new DomainError('INVALID_STATE_TRANSITION', 'Cannot dispute an already revoked evidence record.');
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
  actor: { userId: string; role: Role },
  reason: string
): Evidence {
  if (!reason || reason.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Revocation reason is required.');
  }

  const isOwner = actor.userId === evidence.subjectId;
  const isAuthority = actor.role === 'platform_admin' || actor.role === 'verification_staff';
  const isOriginalVerifier = evidence.verifiedBy === actor.userId;

  if (!isOwner && !isAuthority && !isOriginalVerifier) {
    throw new DomainError('FORBIDDEN', 'Only the owner, issuer/verifier, or platform admin may revoke evidence.');
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
    issuerRole: (evidence.metadata?.verifiedByRole as string) || (evidence.verificationLevel === 'unverified' ? 'self_reported' : 'platform_authority'),
    proofHash,
    verificationUrl: `/verify/evidence/${evidence.id}`,
  };
}
