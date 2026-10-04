/**
 * TalentSphere Alumni Networks Domain Model (F-125, F-12, F-09, F-40)
 * Manages institutional alumni affiliations, cross-institution isolation,
 * verified directory discovery, chapter groups, and alumni mentorship programs.
 */
export type AlumniDegreeType = 'bachelors' | 'masters' | 'phd' | 'bootcamp' | 'certification' | 'other';
export type AlumniVerificationMethod = 'email_domain' | 'institutional_seat' | 'manual_review' | 'unverified';
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
    affiliations: (AlumniAffiliation & {
        user?: {
            fullName?: string;
            email?: string;
        };
    })[];
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
export declare function validateGraduationYear(year: number): void;
/**
 * Creates a new alumni affiliation record with initial verification status.
 */
export declare function createAlumniAffiliation(params: CreateAffiliationParams): AlumniAffiliation;
/**
 * Verifies an affiliation via institutional seat token/code.
 */
export declare function verifyAffiliationBySeatCode(affiliation: AlumniAffiliation, seatCode: string, validSeatCodes: Set<string>, nowIso?: string): AlumniAffiliation;
/**
 * Enforces cross-institution isolation (BR-F125-03) and filters directory.
 * Users cannot view or query alumni from institutions where they are not verified.
 */
export declare function filterAlumniDirectory(params: DirectoryFilterParams): (AlumniAffiliation & {
    user?: {
        fullName?: string;
        email?: string;
    };
})[];
/**
 * Creates an alumni group within an institution.
 * Creator must have verified affiliation with the institution.
 */
export declare function createAlumniGroup(params: {
    id?: string;
    institutionId: string;
    name: string;
    description?: string;
    chapterLocation?: string;
    createdBy: string;
    creatorVerifiedInstitutions: string[];
    nowIso?: string;
}): {
    group: AlumniGroup;
    creatorMembership: AlumniGroupMember;
};
/**
 * Verifies that a user can join an alumni group.
 */
export declare function joinAlumniGroup(params: {
    groupId: string;
    userId: string;
    groupInstitutionId: string;
    userVerifiedInstitutions: string[];
    role?: 'member' | 'moderator' | 'admin';
    nowIso?: string;
}): AlumniGroupMember;
/**
 * Creates an alumni mentorship request with validation and institution matching.
 */
export declare function createAlumniMentorshipRequest(params: RequestMentorshipParams): AlumniMentorshipRequest;
/**
 * Transitions alumni mentorship request status.
 */
export declare function respondToAlumniMentorship(params: {
    request: AlumniMentorshipRequest;
    responderId: string;
    action: 'accept' | 'decline' | 'complete';
    nowIso?: string;
}): AlumniMentorshipRequest;
//# sourceMappingURL=alumni-networks.d.ts.map