import { type Role } from './core.js';
import { Job } from './jobs.js';
export interface ScreeningQuestion {
    id?: string;
    question: string;
    required: boolean;
    idealAnswer?: string;
}
export interface JobTemplate {
    id: string;
    orgId: string;
    createdBy: string;
    templateName: string;
    title: string;
    description: string;
    location: string;
    workMode?: 'remote' | 'hybrid' | 'onsite';
    jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
    requiredSkillIds: string[];
    salaryRange?: {
        minMinor: number;
        maxMinor: number;
        currency: string;
    };
    department?: string;
    screeningQuestions?: ScreeningQuestion[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ActorContext {
    userId: string;
    roles: Role[];
    orgId?: string;
}
export interface CreateJobTemplateParams {
    id?: string;
    orgId: string;
    templateName: string;
    title: string;
    description: string;
    location: string;
    workMode?: 'remote' | 'hybrid' | 'onsite';
    jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
    requiredSkillIds?: string[];
    salaryRange?: {
        minMinor: number;
        maxMinor: number;
        currency: string;
    };
    department?: string;
    screeningQuestions?: ScreeningQuestion[];
    actor: ActorContext;
}
export interface UpdateJobTemplateParams {
    templateName?: string;
    title?: string;
    description?: string;
    location?: string;
    workMode?: 'remote' | 'hybrid' | 'onsite';
    jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
    requiredSkillIds?: string[];
    salaryRange?: {
        minMinor: number;
        maxMinor: number;
        currency: string;
    } | null;
    department?: string;
    screeningQuestions?: ScreeningQuestion[];
    isArchived?: boolean;
    actor: ActorContext;
}
export interface InstantiateJobFromTemplateOverrides {
    title?: string;
    description?: string;
    location?: string;
    workMode?: 'remote' | 'hybrid' | 'onsite';
    jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
    requiredSkillIds?: string[];
    salaryRange?: {
        minMinor: number;
        maxMinor: number;
        currency: string;
    };
}
/**
 * Creates a reusable job template under BR-01 & BR-12.
 */
export declare function createJobTemplate(params: CreateJobTemplateParams): JobTemplate;
/**
 * Updates an existing job template.
 */
export declare function updateJobTemplate(template: JobTemplate, params: UpdateJobTemplateParams): JobTemplate;
/**
 * Archives a job template (soft delete).
 */
export declare function archiveJobTemplate(template: JobTemplate, actor: ActorContext): JobTemplate;
/**
 * Instantiates a new Job Requisition from a Job Template with optional field overrides (F-37, F-05).
 */
export declare function instantiateJobFromTemplate(template: JobTemplate, overrides: InstantiateJobFromTemplateOverrides | undefined, actor: ActorContext): Job;
//# sourceMappingURL=job-templates.d.ts.map