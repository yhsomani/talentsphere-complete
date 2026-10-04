import { type Role, type Evidence, type EvidenceType, type VerificationLevel, type EvidenceStatus } from './core.js';
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
export declare function createEvidence(params: CreateEvidenceParams): Evidence;
/**
 * Verifies and elevates an evidence item to a target verification level.
 * Invariant: Candidates cannot self-verify. Verifiers must hold appropriate roles.
 */
export declare function verifyEvidence(evidence: Evidence, verifier: {
    userId: string;
    role: Role;
}, targetLevel: VerificationLevel, notes?: string, subjectUserId?: string): Evidence;
/**
 * Disputes an evidence record.
 * Transitions status to 'disputed' and attaches dispute reasoning.
 */
export declare function disputeEvidence(evidence: Evidence, disputant: {
    userId: string;
    role: Role;
}, reason: string): Evidence;
/**
 * Revokes an evidence record (BR-149: append-only semantics, records revocation timestamp).
 */
export declare function revokeEvidence(evidence: Evidence, actor: {
    userId: string;
    role: Role;
}, reason: string): Evidence;
/**
 * Generates a privacy-preserving public verification proof conforming to BR-150 and BR-155.
 * Zero PII exposed: candidate name, email, address, and personal notes are completely omitted.
 */
export declare function generatePublicProof(evidence: Evidence): PublicEvidenceProof;
//# sourceMappingURL=evidence.d.ts.map