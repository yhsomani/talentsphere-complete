import { type Role, type ApplicationState } from './core.js';
export interface JobApplication {
    id: string;
    jobId: string;
    candidateId: string;
    status: ApplicationState;
    coverLetter?: string;
    attachedEvidenceIds: string[];
    isReferred?: boolean;
    referralId?: string;
    submittedAt?: string;
    withdrawnAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    hiredAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SubmitApplicationParams {
    id?: string;
    jobId: string;
    jobStatus: string;
    candidateProfileId: string;
    actor: {
        userId: string;
        roles: Role[];
    };
    existingApplications: JobApplication[];
    coverLetter?: string;
    attachedEvidenceIds?: string[];
}
/**
 * Submits a new job application.
 * Enforces BR-02 (candidates only), BR-16 (published jobs only), BR-15 (no duplicate active application).
 */
export declare function submitJobApplication(params: SubmitApplicationParams): JobApplication;
/**
 * Transitions an application's state along the ATS candidate pipeline (BR-03, BR-40, BR-41).
 */
export declare function transitionApplicationState(application: JobApplication, targetState: ApplicationState, actor: {
    userId: string;
    roles: Role[];
    isCandidateOwner: boolean;
    isRecruiterForJob: boolean;
}, reason?: string): JobApplication;
//# sourceMappingURL=applications.d.ts.map