/**
 * Core domain primitives (roles, user/profile/evidence shapes, application state
 * machine, assessment policy, DomainError).
 *
 * This module deliberately has NO imports. Sibling modules import from here
 * rather than from the package barrel `index.ts`, because `index.ts` re-exports
 * those same siblings — importing the barrel from inside the package creates a
 * circular dependency (auth.ts -> index.ts -> auth.ts) that breaks tree-shaking
 * and yields `undefined` bindings under some module-evaluation orders.
 *
 * `index.ts` re-exports everything here, so the public API is unchanged.
 */
export const ALLOWED_APPLICATION_TRANSITIONS = {
    draft: ['submitted', 'withdrawn'],
    submitted: ['in_review', 'withdrawn', 'rejected'],
    in_review: ['shortlisted', 'rejected', 'withdrawn'],
    shortlisted: ['interviewing', 'rejected', 'withdrawn'],
    interviewing: ['offered', 'rejected', 'withdrawn'],
    offered: ['hired', 'rejected', 'withdrawn'],
    hired: [],
    rejected: [],
    withdrawn: [],
    expired: [],
};
export function canTransitionApplication(from, to) {
    return ALLOWED_APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}
export function isAIAssistanceAllowed(policyMode) {
    return policyMode === 'AI_ALLOWED';
}
export class DomainError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'DomainError';
    }
}
//# sourceMappingURL=core.js.map