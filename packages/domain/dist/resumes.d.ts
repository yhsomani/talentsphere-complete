export type ResumeTemplate = 'modern' | 'minimal' | 'executive' | 'technical';
export type ResumeFormat = 'json' | 'markdown' | 'html' | 'pdf';
export interface ResumeExperience {
    id?: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    highlights?: string[];
}
export interface ResumeEducation {
    id?: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
}
export interface ResumeSkillItem {
    name: string;
    category?: string;
    level?: string;
    evidenceId?: string;
}
export interface Resume {
    id: string;
    userId: string;
    title: string;
    template: ResumeTemplate;
    headline?: string;
    summary?: string;
    contactEmail?: string;
    contactPhone?: string;
    location?: string;
    websiteUrl?: string;
    experience: ResumeExperience[];
    education: ResumeEducation[];
    skills: ResumeSkillItem[];
    evidenceIds: string[];
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ResumeExport {
    id: string;
    resumeId: string;
    userId: string;
    format: ResumeFormat;
    renderedContent: string;
    sha256Hash: string;
    status: 'active' | 'deleted';
    deletedAt?: string;
    createdAt: string;
}
/**
 * Creates a valid resume entity with default sections.
 */
export declare function createResumeEntity(userId: string, input: Partial<Resume>): Resume;
/**
 * Updates resume content and preserves creation metadata.
 */
export declare function updateResumeEntity(existing: Resume, patch: Partial<Resume>): Resume;
/**
 * Renders a resume to canonical markdown format.
 */
export declare function renderResumeToMarkdown(resume: Resume, candidateName?: string): string;
/**
 * Creates an append-only resume export with SHA-256 integrity hash (BR-26).
 */
export declare function createResumeExport(resume: Resume, format: ResumeFormat, candidateName?: string): ResumeExport;
/**
 * Soft-deletes a resume export artifact (BR-26: Never hard deleted from audit trail).
 */
export declare function softDeleteResumeExport(exportItem: ResumeExport): ResumeExport;
//# sourceMappingURL=resumes.d.ts.map