/**
 * TalentSphere Verified Work History Network & References Domain Module (F-162, F-94, F-84)
 * Manages employment histories, corporate email attestation, structured referee evaluations,
 * anti-fraud checks, tenure calculation, deterministic confidence scoring, and work history graphs.
 */
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
export type VerificationStatus = 'unverified' | 'pending_verification' | 'verified' | 'disputed' | 'rejected';
export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold';
export type ReferenceRelationship = 'manager' | 'peer' | 'direct_report' | 'mentor' | 'client';
export type ReferenceStatus = 'requested' | 'submitted' | 'declined' | 'flagged';
export interface ReferenceRatings {
    technicalProficiency: number;
    collaborationRating: number;
    deliveryReliability: number;
    leadershipRating?: number;
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
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    corporateEmail?: string;
    emailVerifiedAt?: string;
    verificationStatus: VerificationStatus;
    verificationScore: number;
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
    topVerifiedSkills: {
        skill: string;
        endorsementsCount: number;
    }[];
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
export declare const DISPOSABLE_EMAIL_DOMAINS: Set<string>;
/**
 * Generic consumer webmail providers that cannot attest for corporate employment.
 */
export declare const CONSUMER_WEBMAIL_DOMAINS: Set<string>;
/**
 * Validates work history date ranges and future date invariants.
 */
export declare function validateWorkHistoryDates(startDate: string, endDate?: string, isCurrent?: boolean, nowIso?: string): void;
/**
 * Computes employment tenure duration in full months.
 */
export declare function calculateTenureMonths(startDate: string, endDate?: string, isCurrent?: boolean, nowIso?: string): number;
/**
 * Normalizes and extracts root host domain from URL or domain string.
 */
export declare function extractDomain(input: string): string;
/**
 * Validates corporate email address against company domain and anti-fraud lists.
 */
export declare function verifyCorporateEmailDomain(email: string, companyWebsiteOrDomain: string): boolean;
/**
 * Calculates deterministic verification score (0-100) and badge tier.
 */
export declare function calculateVerificationScoreAndBadge(workHistory: {
    corporateEmail?: string;
    emailVerifiedAt?: string;
    skills?: string[];
}, references: EmploymentReference[]): {
    score: number;
    badgeTier: BadgeTier;
    status: VerificationStatus;
};
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
export declare function createWorkHistory(params: CreateWorkHistoryParams): VerifiedWorkHistory;
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
export declare function verifyCorporateEmail(params: VerifyCorporateEmailParams): VerifiedWorkHistory;
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
export declare function requestEmploymentReference(params: RequestEmploymentReferenceParams): EmploymentReference;
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
export declare function submitEmploymentReference(params: SubmitEmploymentReferenceParams): EmploymentReference;
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
export declare function buildWorkHistoryGraph(params: BuildWorkHistoryGraphParams): WorkHistoryGraph;
//# sourceMappingURL=work-history-graph.d.ts.map