import { DomainError } from './core.js';
import { createJobPosting } from './jobs.js';
/**
 * Creates a reusable job template under BR-01 & BR-12.
 */
export function createJobTemplate(params) {
    const isAuthorizedRecruiter = params.actor.roles.includes('recruiter') ||
        params.actor.roles.includes('hiring_manager') ||
        params.actor.roles.includes('platform_admin');
    if (!isAuthorizedRecruiter) {
        throw new DomainError('FORBIDDEN', 'Only recruiters, hiring managers, or platform administrators may create job templates (BR-01).');
    }
    if (params.actor.orgId &&
        params.actor.orgId !== params.orgId &&
        !params.actor.roles.includes('platform_admin')) {
        throw new DomainError('FORBIDDEN', 'Recruiters may only create templates for their assigned organization (BR-12).');
    }
    if (!params.templateName || params.templateName.trim().length < 2) {
        throw new DomainError('VALIDATION_FAILED', 'Template name must be at least 2 characters.');
    }
    if (!params.title || params.title.trim().length < 3) {
        throw new DomainError('VALIDATION_FAILED', 'Job title must be at least 3 characters.');
    }
    if (!params.description || params.description.trim().length < 10) {
        throw new DomainError('VALIDATION_FAILED', 'Job description must be at least 10 characters.');
    }
    if (!params.location || params.location.trim().length === 0) {
        throw new DomainError('VALIDATION_FAILED', 'Job location is required.');
    }
    if (params.salaryRange) {
        if (params.salaryRange.minMinor < 0 ||
            params.salaryRange.maxMinor < params.salaryRange.minMinor) {
            throw new DomainError('VALIDATION_FAILED', 'Invalid salary range: min must be non-negative and max >= min.');
        }
    }
    const now = new Date().toISOString();
    return {
        id: params.id || crypto.randomUUID(),
        orgId: params.orgId,
        createdBy: params.actor.userId,
        templateName: params.templateName.trim(),
        title: params.title.trim(),
        description: params.description.trim(),
        location: params.location.trim(),
        workMode: params.workMode,
        jobType: params.jobType,
        requiredSkillIds: params.requiredSkillIds ? [...params.requiredSkillIds] : [],
        salaryRange: params.salaryRange,
        department: params.department?.trim(),
        screeningQuestions: params.screeningQuestions ? [...params.screeningQuestions] : [],
        isArchived: false,
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Updates an existing job template.
 */
export function updateJobTemplate(template, params) {
    const isAuthorized = params.actor.roles.includes('recruiter') ||
        params.actor.roles.includes('hiring_manager') ||
        params.actor.roles.includes('platform_admin');
    if (!isAuthorized) {
        throw new DomainError('FORBIDDEN', 'Only recruiters or administrators may update job templates.');
    }
    if (params.actor.orgId &&
        params.actor.orgId !== template.orgId &&
        !params.actor.roles.includes('platform_admin')) {
        throw new DomainError('FORBIDDEN', 'Cannot update a job template belonging to another organization.');
    }
    if (template.isArchived && params.isArchived !== false) {
        throw new DomainError('CONFLICT', 'Cannot modify an archived job template unless restoring it.');
    }
    if (params.templateName !== undefined && params.templateName.trim().length < 2) {
        throw new DomainError('VALIDATION_FAILED', 'Template name must be at least 2 characters.');
    }
    if (params.title !== undefined && params.title.trim().length < 3) {
        throw new DomainError('VALIDATION_FAILED', 'Job title must be at least 3 characters.');
    }
    if (params.description !== undefined && params.description.trim().length < 10) {
        throw new DomainError('VALIDATION_FAILED', 'Job description must be at least 10 characters.');
    }
    if (params.location !== undefined && params.location.trim().length === 0) {
        throw new DomainError('VALIDATION_FAILED', 'Job location cannot be empty.');
    }
    if (params.salaryRange) {
        if (params.salaryRange.minMinor < 0 ||
            params.salaryRange.maxMinor < params.salaryRange.minMinor) {
            throw new DomainError('VALIDATION_FAILED', 'Invalid salary range: min must be non-negative and max >= min.');
        }
    }
    return {
        ...template,
        templateName: params.templateName ? params.templateName.trim() : template.templateName,
        title: params.title ? params.title.trim() : template.title,
        description: params.description ? params.description.trim() : template.description,
        location: params.location ? params.location.trim() : template.location,
        workMode: params.workMode !== undefined ? params.workMode : template.workMode,
        jobType: params.jobType !== undefined ? params.jobType : template.jobType,
        requiredSkillIds: params.requiredSkillIds !== undefined
            ? [...params.requiredSkillIds]
            : template.requiredSkillIds,
        salaryRange: params.salaryRange === null ? undefined : (params.salaryRange ?? template.salaryRange),
        department: params.department !== undefined ? params.department.trim() : template.department,
        screeningQuestions: params.screeningQuestions !== undefined
            ? [...params.screeningQuestions]
            : template.screeningQuestions,
        isArchived: params.isArchived !== undefined ? params.isArchived : template.isArchived,
        updatedAt: new Date().toISOString(),
    };
}
/**
 * Archives a job template (soft delete).
 */
export function archiveJobTemplate(template, actor) {
    return updateJobTemplate(template, { isArchived: true, actor });
}
/**
 * Instantiates a new Job Requisition from a Job Template with optional field overrides (F-37, F-05).
 */
export function instantiateJobFromTemplate(template, overrides = {}, actor) {
    if (template.isArchived) {
        throw new DomainError('CONFLICT', 'Cannot instantiate a job from an archived template.');
    }
    const effectiveTitle = overrides.title ?? template.title;
    const effectiveDescription = overrides.description ?? template.description;
    const effectiveLocation = overrides.location ?? template.location;
    const effectiveWorkMode = overrides.workMode ?? template.workMode;
    const effectiveJobType = overrides.jobType ?? template.jobType;
    const effectiveSkillIds = overrides.requiredSkillIds ?? template.requiredSkillIds;
    const effectiveSalaryRange = overrides.salaryRange ?? template.salaryRange;
    return createJobPosting({
        orgId: template.orgId,
        title: effectiveTitle,
        description: effectiveDescription,
        location: effectiveLocation,
        workMode: effectiveWorkMode,
        jobType: effectiveJobType,
        requiredSkillIds: effectiveSkillIds,
        salaryRange: effectiveSalaryRange,
        actor: {
            userId: actor.userId,
            roles: actor.roles,
            orgId: template.orgId,
        },
    });
}
//# sourceMappingURL=job-templates.js.map