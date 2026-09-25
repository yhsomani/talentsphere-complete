import crypto from 'node:crypto';
import { DomainError } from './index.js';

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
export function createResumeEntity(userId: string, input: Partial<Resume>): Resume {
  if (!userId) {
    throw new DomainError('VALIDATION_FAILED', 'User ID is required to create a resume.');
  }

  const now = new Date().toISOString();
  return {
    id: input.id || crypto.randomUUID(),
    userId,
    title: input.title?.trim() || 'Untitled Resume',
    template: input.template || 'modern',
    headline: input.headline?.trim(),
    summary: input.summary?.trim(),
    contactEmail: input.contactEmail?.trim(),
    contactPhone: input.contactPhone?.trim(),
    location: input.location?.trim(),
    websiteUrl: input.websiteUrl?.trim(),
    experience: input.experience || [],
    education: input.education || [],
    skills: input.skills || [],
    evidenceIds: input.evidenceIds || [],
    isPrimary: input.isPrimary ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates resume content and preserves creation metadata.
 */
export function updateResumeEntity(existing: Resume, patch: Partial<Resume>): Resume {
  return {
    ...existing,
    title: patch.title !== undefined ? patch.title.trim() : existing.title,
    template: patch.template || existing.template,
    headline: patch.headline !== undefined ? patch.headline.trim() : existing.headline,
    summary: patch.summary !== undefined ? patch.summary.trim() : existing.summary,
    contactEmail:
      patch.contactEmail !== undefined ? patch.contactEmail.trim() : existing.contactEmail,
    contactPhone:
      patch.contactPhone !== undefined ? patch.contactPhone.trim() : existing.contactPhone,
    location: patch.location !== undefined ? patch.location.trim() : existing.location,
    websiteUrl: patch.websiteUrl !== undefined ? patch.websiteUrl.trim() : existing.websiteUrl,
    experience: patch.experience || existing.experience,
    education: patch.education || existing.education,
    skills: patch.skills || existing.skills,
    evidenceIds: patch.evidenceIds || existing.evidenceIds,
    isPrimary: patch.isPrimary !== undefined ? patch.isPrimary : existing.isPrimary,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Renders a resume to canonical markdown format.
 */
export function renderResumeToMarkdown(resume: Resume, candidateName?: string): string {
  const lines: string[] = [];

  const name = candidateName || 'Candidate Profile';
  lines.push(`# ${name}`);
  if (resume.headline) lines.push(`**${resume.headline}**`);

  const contactDetails = [
    resume.contactEmail,
    resume.contactPhone,
    resume.location,
    resume.websiteUrl,
  ]
    .filter(Boolean)
    .join(' | ');
  if (contactDetails) lines.push(`_${contactDetails}_`);

  lines.push('');

  if (resume.summary) {
    lines.push('## Professional Summary');
    lines.push(resume.summary);
    lines.push('');
  }

  if (resume.skills.length > 0) {
    lines.push('## Skills & Competencies');
    const skillList = resume.skills.map((s) => s.name).join(', ');
    lines.push(skillList);
    lines.push('');
  }

  if (resume.experience.length > 0) {
    lines.push('## Experience');
    for (const exp of resume.experience) {
      const dates = `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate || ''}`;
      lines.push(`### ${exp.title} at ${exp.company} (${dates})`);
      if (exp.location) lines.push(`*Location: ${exp.location}*`);
      if (exp.description) lines.push(exp.description);
      if (exp.highlights && exp.highlights.length > 0) {
        for (const h of exp.highlights) {
          lines.push(`- ${h}`);
        }
      }
      lines.push('');
    }
  }

  if (resume.education.length > 0) {
    lines.push('## Education');
    for (const edu of resume.education) {
      const dates = `${edu.startDate} - ${edu.endDate || 'Present'}`;
      lines.push(`### ${edu.degree} — ${edu.institution} (${dates})`);
      if (edu.fieldOfStudy) lines.push(`*Field: ${edu.fieldOfStudy}*`);
      if (edu.gpa) lines.push(`*GPA: ${edu.gpa}*`);
      lines.push('');
    }
  }

  if (resume.evidenceIds.length > 0) {
    lines.push('## Verified Evidence & Credentials');
    lines.push(
      `This resume links ${resume.evidenceIds.length} verified TalentSphere graph credentials.`
    );
    for (const evId of resume.evidenceIds) {
      lines.push(`- Verified Credential ID: ${evId}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Creates an append-only resume export with SHA-256 integrity hash (BR-26).
 */
export function createResumeExport(
  resume: Resume,
  format: ResumeFormat,
  candidateName?: string
): ResumeExport {
  let content = '';

  if (format === 'json') {
    content = JSON.stringify(
      {
        candidateName: candidateName || 'Candidate',
        resume,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  } else if (format === 'markdown') {
    content = renderResumeToMarkdown(resume, candidateName);
  } else if (format === 'html' || format === 'pdf') {
    const md = renderResumeToMarkdown(resume, candidateName);
    content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${resume.title}</title><style>body{font-family:system-ui,sans-serif;line-height:1.5;max-width:800px;margin:2rem auto;padding:0 1rem;}</style></head><body><pre>${md}</pre></body></html>`;
  }

  const sha256Hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');

  return {
    id: crypto.randomUUID(),
    resumeId: resume.id,
    userId: resume.userId,
    format,
    renderedContent: content,
    sha256Hash,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Soft-deletes a resume export artifact (BR-26: Never hard deleted from audit trail).
 */
export function softDeleteResumeExport(exportItem: ResumeExport): ResumeExport {
  if (exportItem.status === 'deleted') {
    return exportItem;
  }

  return {
    ...exportItem,
    status: 'deleted',
    deletedAt: new Date().toISOString(),
  };
}
