import { DomainError, canTransitionApplication } from './core.js';
/**
 * Submits a new job application.
 * Enforces BR-02 (candidates only), BR-16 (published jobs only), BR-15 (no duplicate active application).
 */
export function submitJobApplication(params) {
    // BR-02: Only candidates may submit applications; recruiters may not apply
    if (params.actor.roles.includes('recruiter') && !params.actor.roles.includes('candidate')) {
        throw new DomainError('FORBIDDEN', 'Recruiters may not submit job applications (BR-02).');
    }
    // BR-16 & BR-38: Candidates may apply only to published jobs
    if (params.jobStatus !== 'published') {
        throw new DomainError('VALIDATION_FAILED', 'Applications are only accepted for published jobs (BR-16).');
    }
    // BR-15 & BR-39: Duplicate active application check
    const activeExisting = params.existingApplications.find((app) => app.jobId === params.jobId &&
        app.candidateId === params.candidateProfileId &&
        !['rejected', 'withdrawn', 'expired'].includes(app.status));
    if (activeExisting) {
        throw new DomainError('CONFLICT', 'An active application for this job already exists (BR-15).');
    }
    const now = new Date().toISOString();
    return {
        id: params.id || crypto.randomUUID(),
        jobId: params.jobId,
        candidateId: params.candidateProfileId,
        status: 'submitted',
        coverLetter: params.coverLetter?.trim(),
        attachedEvidenceIds: params.attachedEvidenceIds || [],
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Transitions an application's state along the ATS candidate pipeline (BR-03, BR-40, BR-41).
 */
export function transitionApplicationState(application, targetState, actor, reason) {
    if (!canTransitionApplication(application.status, targetState)) {
        throw new DomainError('INVALID_STATE_TRANSITION', `Cannot transition application from ${application.status} to ${targetState} (BR-41).`);
    }
    // Candidate withdrawal permission
    if (targetState === 'withdrawn') {
        if (!actor.isCandidateOwner && !actor.roles.includes('platform_admin')) {
            throw new DomainError('FORBIDDEN', 'Only the candidate may withdraw their application.');
        }
    }
    else {
        // ATS Pipeline transitions (in_review, shortlisted, interviewing, offered, hired, rejected)
        if (!actor.isRecruiterForJob && !actor.roles.includes('platform_admin')) {
            throw new DomainError('FORBIDDEN', 'Only authorized recruiters for this job may advance candidates (BR-40).');
        }
    }
    const now = new Date().toISOString();
    const updated = {
        ...application,
        status: targetState,
        updatedAt: now,
    };
    if (targetState === 'withdrawn') {
        updated.withdrawnAt = now;
    }
    else if (targetState === 'rejected') {
        updated.rejectedAt = now;
        updated.rejectionReason = reason || 'Candidate does not match position criteria.';
    }
    else if (targetState === 'hired') {
        updated.hiredAt = now;
    }
    return updated;
}
//# sourceMappingURL=applications.js.map