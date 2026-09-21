/**
 * Candidate Service - Data access layer for candidate profile operations
 * 
 * Refactored to use DatabaseAdapter for:
 * - Loose coupling from Supabase SDK
 * - Built-in retry and circuit breaker patterns
 * - Testability with mock adapters
 * - Consistent error handling
 * Fully aligned with Supabase schema (002_users_organizations.sql).
 */

import type { CandidateProfile, Experience, Education, Certification, PortfolioItem } from '@/types';
import type { Database } from '@/types/database.types';
import { DatabaseAdapter } from '@/lib/database/adapter';
import { AppErrors, isAppError } from '@/lib/errors';

type CandidateProfileInsert = Database['public']['Tables']['candidate_profiles']['Insert'];
type CandidateProfileUpdate = Database['public']['Tables']['candidate_profiles']['Update'];

export interface ProfileUpdateData {
  headline?: string;
  bio?: string;
  summary?: string;
  location?: string;
  timezone?: string;
  availability_status?: 'available' | 'employed' | 'open_to_work' | 'not_interested';
  visibility?: 'public' | 'connections' | 'private';
  resume_url?: string;
}

export interface CandidateSkillRecord {
  id: string;
  candidate_profile_id: string;
  skill_id: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: {
    id: string;
    name: string;
    category?: string;
  };
}

/**
 * CandidateService class with dependency injection
 */
export class CandidateService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get candidate profile by user ID, including all sub-entities
   */
  async getProfile(userId: string): Promise<{
    profile: CandidateProfile | null;
    skills: Array<{ id: string; name: string; proficiency_level: string; skill_id: string }>;
    experiences: Experience[];
    educations: Education[];
    certifications: Certification[];
    portfolioItems: PortfolioItem[];
  }> {
    try {
      // 1. Fetch profile
      const profileResult = await this.db.get<CandidateProfileInsert>('candidate_profiles', {
        filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      });

      if (profileResult.error) {
        throw profileResult.error;
      }

      const profileData = profileResult.data;

      if (!profileData) {
        return {
          profile: null,
          skills: [],
          experiences: [],
          educations: [],
          certifications: [],
          portfolioItems: [],
        };
      }

      const candidateProfileId = profileData.id;

      // 2. Fetch sub-entities in parallel using candidateProfileId
      const [skillsRes, expRes, eduRes, certRes, portRes] = await Promise.all([
        this.db.list<any>('candidate_skills', {
          filters: [{ column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId }],
        }),
        this.db.list<any>('experience', {
          filters: [{ column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId }],
          options: { orderBy: 'start_date', ascending: false },
        }),
        this.db.list<any>('education', {
          filters: [{ column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId }],
          options: { orderBy: 'start_date', ascending: false },
        }),
        this.db.list<any>('certifications', {
          filters: [{ column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId }],
          options: { orderBy: 'issue_date', ascending: false },
        }),
        this.db.list<any>('portfolio_items', {
          filters: [{ column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId }],
          options: { orderBy: 'created_at', ascending: false },
        }),
      ]);

    const skills = (skillsRes.data || []).map((s: unknown) => {
      const row = s as {
        id: string;
        skill_id: string;
        proficiency: string;
        skills: { id: string; name: string; category?: string } | null;
      };
      return {
        id: row.id,
        skill_id: row.skill_id,
        name: row.skills?.name || 'Skill',
        proficiency_level: row.proficiency || 'intermediate',
      };
    });

    const experiences: Experience[] = (expRes.data || []).map((e: Record<string, unknown>) => ({
      id: String(e.id),
      candidate_id: String(e.candidate_profile_id),
      company_name: String(e.company_name || ''),
      job_title: String(e.job_title || ''),
      description: e.description ? String(e.description) : undefined,
      start_date: String(e.start_date || ''),
      end_date: e.end_date ? String(e.end_date) : undefined,
      is_current: Boolean(e.is_current),
      location: e.location_city ? String(e.location_city) : undefined,
      skills_used: Array.isArray(e.skills_used) ? (e.skills_used as string[]) : [],
      verified: false,
      created_at: String(e.created_at || ''),
    }));

    const educations: Education[] = (eduRes.data || []).map((ed: Record<string, unknown>) => ({
      id: String(ed.id),
      candidate_id: String(ed.candidate_profile_id),
      institution_name: String(ed.institution_name || ''),
      degree: ed.degree_type ? String(ed.degree_type) : undefined,
      field_of_study: ed.field_of_study ? String(ed.field_of_study) : undefined,
      grade: ed.grade ? String(ed.grade) : undefined,
      start_date: String(ed.start_date || ''),
      end_date: ed.end_date ? String(ed.end_date) : undefined,
      activities: Array.isArray(ed.activities) ? (ed.activities as string[]) : [],
      created_at: String(ed.created_at || ''),
    }));

    const certifications: Certification[] = (certRes.data || []).map((c: Record<string, unknown>) => ({
      id: String(c.id),
      candidate_id: String(c.candidate_profile_id),
      name: String(c.name || ''),
      issuing_organization: String(c.issuing_organization || ''),
      issue_date: String(c.issue_date || ''),
      expiration_date: c.expiration_date ? String(c.expiration_date) : undefined,
      credential_id: c.credential_id ? String(c.credential_id) : undefined,
      credential_url: c.credential_url ? String(c.credential_url) : undefined,
      skills: [],
      created_at: String(c.created_at || ''),
    }));

    const portfolioItems: PortfolioItem[] = (portRes.data || []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      candidate_id: String(p.candidate_profile_id),
      title: String(p.title || ''),
      description: String(p.description || ''),
      project_type: (p.project_type as PortfolioItem['project_type']) || 'web_app',
      url: p.project_url ? String(p.project_url) : undefined,
      repository_url: p.repository_url ? String(p.repository_url) : undefined,
      media_urls: Array.isArray(p.media_urls) ? (p.media_urls as string[]) : [],
      skills_demonstrated: [],
      started_at: String(p.created_at || ''),
      completed_at: undefined,
      is_featured: Boolean(p.is_featured),
      visibility: 'public',
      created_at: String(p.created_at || ''),
      updated_at: String(p.updated_at || ''),
    }));

    const profile: CandidateProfile = {
      id: profileData.id,
      user_id: profileData.user_id,
      headline: profileData.headline || '',
      bio: profileData.summary || '',
      summary: profileData.summary || '',
      location: profileData.location_city || '',
      timezone: 'UTC',
      availability_status: profileData.availability_status || 'open_to_work',
      xp_points: 0,
      level: 1,
      badges: [],
      skills: [],
      experience: experiences,
      education: educations,
      certifications,
      portfolio_items: portfolioItems,
      resume_url: profileData.resume_url || '',
      visibility: profileData.profile_visibility || 'public',
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
    };

    return {
      profile,
      skills,
      experiences,
      educations,
      certifications,
      portfolioItems,
    };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to fetch candidate profile: ${error}`));
    }
  }

  /**
   * Create or update candidate profile
   */
  async upsertProfile(
    userId: string,
    profileData: ProfileUpdateData
  ): Promise<CandidateProfile> {
    try {
      const payload: CandidateProfileUpdate = {
        user_id: userId,
        headline: profileData.headline ?? null,
        summary: profileData.bio || profileData.summary || null,
        location_city: profileData.location || null,
        availability_status: profileData.availability_status || 'open_to_work',
        profile_visibility: profileData.visibility || 'public',
        updated_at: new Date().toISOString(),
      };

      if (profileData.resume_url) {
        payload.resume_url = profileData.resume_url;
      }

      // Check if profile exists
      const existingResult = await this.db.get<CandidateProfileInsert>('candidate_profiles', {
        filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      });

      let result;
      if (existingResult.data) {
        // Update existing
        result = await this.db.update<CandidateProfileUpdate>('candidate_profiles', payload, {
          filters: [{ column: 'user_id', operator: 'eq', value: userId }],
        });
      } else {
        // Insert new
        result = await this.db.insert<CandidateProfileInsert>('candidate_profiles', payload);
      }

      if (result.error) {
        throw result.error;
      }

      const data = result.data as any;

      return {
        id: data.id,
        user_id: data.user_id,
        headline: data.headline || '',
        bio: data.summary || '',
        summary: data.summary || '',
        location: data.location_city || '',
        availability_status: data.availability_status || 'open_to_work',
        xp_points: 0,
        level: 1,
        badges: [],
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        portfolio_items: [],
        resume_url: data.resume_url || '',
        visibility: data.profile_visibility || 'public',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to upsert candidate profile: ${error}`));
    }
  }

  /**
   * Upload resume to storage
   * Note: Storage operations still use Supabase client directly
   * TODO: Add storage adapter interface for better testability
   */
  async uploadResume(file: File, userId: string): Promise<string> {
    // Storage operations require Supabase client - not yet abstracted
    // This method needs a storage adapter to be fully testable
    throw new Error('Storage operations require Supabase client. Use direct Supabase SDK for file uploads.');
  }

  /**
   * Upload avatar to storage
   * Note: Storage operations still use Supabase client directly
   * TODO: Add storage adapter interface for better testability
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    // Storage operations require Supabase client - not yet abstracted
    throw new Error('Storage operations require Supabase client. Use direct Supabase SDK for file uploads.');
  }

  /**
   * Add skill to profile by skill name
   */
  async addSkill(
    candidateProfileId: string,
    skillName: string,
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate'
  ): Promise<{ id: string; name: string; proficiency_level: string; skill_id: string }> {
    try {
      const trimmedName = skillName.trim();
      if (!trimmedName) {
        throw AppErrors.validation(new Error('Skill name cannot be empty'));
      }

      // 1. Find or create skill in `skills` taxonomy table
      let skillId: string | null = null;
      
      const existingResult = await this.db.get<any>('skills', {
        filters: [{ column: 'name', operator: 'ilike', value: trimmedName }],
      });

      if (existingResult.data) {
        skillId = existingResult.data.id;
      } else {
        const newSkillResult = await this.db.insert<any>('skills', {
          name: trimmedName,
          category: 'Technical',
        });

        if (newSkillResult.error) {
          throw newSkillResult.error;
        }
        skillId = newSkillResult.data?.id || null;
      }

      // 2. Insert into `candidate_skills`
      const linkResult = await this.db.list<any>('candidate_skills', {
        filters: [
          { column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId },
          { column: 'skill_id', operator: 'eq', value: skillId },
        ],
      });

      let linkData;
      if (linkResult.data && linkResult.data.length > 0) {
        // Update existing
        const updateResult = await this.db.update<any>('candidate_skills', {
          proficiency: proficiencyLevel,
        }, {
          filters: [
            { column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId },
            { column: 'skill_id', operator: 'eq', value: skillId },
          ],
        });

        if (updateResult.error) {
          throw updateResult.error;
        }
        linkData = updateResult.data;
      } else {
        // Insert new
        const insertResult = await this.db.insert<any>('candidate_skills', {
          candidate_profile_id: candidateProfileId,
          skill_id: skillId,
          proficiency: proficiencyLevel,
        });

        if (insertResult.error) {
          throw insertResult.error;
        }
        linkData = insertResult.data;
      }

      return {
        id: Array.isArray(linkData) ? linkData[0].id : linkData.id,
        skill_id: skillId!,
        name: trimmedName,
        proficiency_level: proficiencyLevel,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to add skill: ${error}`));
    }
  }

  /**
   * Remove skill from candidate profile
   */
  async removeSkill(candidateProfileId: string, candidateSkillId: string): Promise<void> {
    try {
      const result = await this.db.delete('candidate_skills', {
        filters: [
          { column: 'candidate_profile_id', operator: 'eq', value: candidateProfileId },
          { column: 'id', operator: 'eq', value: candidateSkillId },
        ],
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to remove skill: ${error}`));
    }
  }

  /**
   * Add experience entry
   */
  async addExperience(
    candidateProfileId: string,
    experience: {
      company_name: string,
      job_title: string,
      start_date: string,
      end_date?: string,
      is_current?: boolean,
      location?: string,
      description?: string,
    }
  ): Promise<Experience> {
    try {
      const payload = {
        candidate_profile_id: candidateProfileId,
        company_name: experience.company_name,
        job_title: experience.job_title,
        start_date: experience.start_date,
        end_date: experience.end_date || null,
        is_current: Boolean(experience.is_current),
        location_city: experience.location || null,
        description: experience.description || null,
      };

      const result = await this.db.insert<typeof payload>('experience', payload);

      if (result.error) {
        throw result.error;
      }

      const data = result.data as any;

      return {
        id: data.id,
        candidate_id: data.candidate_profile_id,
        company_name: data.company_name,
        job_title: data.job_title,
        description: data.description || undefined,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        is_current: Boolean(data.is_current),
        location: data.location_city || undefined,
        skills_used: [],
        verified: false,
        created_at: data.created_at,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to add experience: ${error}`));
    }
  }

  /**
   * Update experience entry
   */
  async updateExperience(
    experienceId: string,
    updates: Partial<Experience>
  ): Promise<Experience> {
    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.company_name !== undefined) payload.company_name = updates.company_name;
      if (updates.job_title !== undefined) payload.job_title = updates.job_title;
      if (updates.start_date !== undefined) payload.start_date = updates.start_date;
      if (updates.end_date !== undefined) payload.end_date = updates.end_date || null;
      if (updates.is_current !== undefined) payload.is_current = updates.is_current;
      if (updates.location !== undefined) payload.location_city = updates.location || null;
      if (updates.description !== undefined) payload.description = updates.description || null;

      const result = await this.db.update<typeof payload>('experience', payload, {
        filters: [{ column: 'id', operator: 'eq', value: experienceId }],
      });

      if (result.error) {
        throw result.error;
      }

      const data = result.data as any;

      return {
        id: data.id,
        candidate_id: data.candidate_profile_id,
        company_name: data.company_name,
        job_title: data.job_title,
        description: data.description || undefined,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        is_current: Boolean(data.is_current),
        location: data.location_city || undefined,
        skills_used: [],
        verified: false,
        created_at: data.created_at,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to update experience: ${error}`));
    }
  }

  /**
   * Delete experience entry
   */
  async deleteExperience(experienceId: string): Promise<void> {
    try {
      const result = await this.db.delete('experience', {
        filters: [{ column: 'id', operator: 'eq', value: experienceId }],
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to delete experience: ${error}`));
    }
  }

  /**
   * Add education entry
   */
  async addEducation(
    candidateProfileId: string,
    education: {
      institution_name: string;
      degree?: string;
      field_of_study?: string;
      start_date: string;
      end_date?: string;
      is_current?: boolean;
      grade?: string;
      description?: string;
    }
  ): Promise<Education> {
    try {
      const payload = {
        candidate_profile_id: candidateProfileId,
        institution_name: education.institution_name,
        degree_type: education.degree || null,
        field_of_study: education.field_of_study || null,
        grade: education.grade || null,
        start_date: education.start_date,
        end_date: education.end_date || null,
        is_current: Boolean(education.is_current),
        description: education.description || null,
      };

      const result = await this.db.insert<typeof payload>('education', payload);

      if (result.error) {
        throw result.error;
      }

      const data = result.data as any;

      return {
        id: data.id,
        candidate_id: data.candidate_profile_id,
        institution_name: data.institution_name,
        degree: data.degree_type || undefined,
        field_of_study: data.field_of_study || undefined,
        grade: data.grade || undefined,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        activities: [],
        created_at: data.created_at,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to add education: ${error}`));
    }
  }

  /**
   * Delete education entry
   */
  async deleteEducation(educationId: string): Promise<void> {
    try {
      const result = await this.db.delete('education', {
        filters: [{ column: 'id', operator: 'eq', value: educationId }],
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to delete education: ${error}`));
    }
  }

  /**
   * Add certification entry
   */
  async addCertification(
    candidateProfileId: string,
    certification: {
      name: string;
      issuing_organization: string;
      issue_date: string;
      expiration_date?: string;
      credential_id?: string;
      credential_url?: string;
    }
  ): Promise<Certification> {
    try {
      const payload = {
        candidate_profile_id: candidateProfileId,
        name: certification.name,
        issuing_organization: certification.issuing_organization,
        issue_date: certification.issue_date,
        expiration_date: certification.expiration_date || null,
        credential_id: certification.credential_id || null,
        credential_url: certification.credential_url || null,
      };

      const result = await this.db.insert<typeof payload>('certifications', payload);

      if (result.error) {
        throw result.error;
      }

      const data = result.data as any;

      return {
        id: data.id,
        candidate_id: data.candidate_profile_id,
        name: data.name,
        issuing_organization: data.issuing_organization,
        issue_date: data.issue_date,
        expiration_date: data.expiration_date || undefined,
        credential_id: data.credential_id || undefined,
        credential_url: data.credential_url || undefined,
        skills: [],
        created_at: data.created_at,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to add certification: ${error}`));
    }
  }

  /**
   * Delete certification entry
   */
  async deleteCertification(certificationId: string): Promise<void> {
    try {
      const result = await this.db.delete('certifications', {
        filters: [{ column: 'id', operator: 'eq', value: certificationId }],
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to delete certification: ${error}`));
    }
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(
    candidateProfileId: string,
    portfolioItem: {
      title: string;
      description?: string;
      url?: string;
      repository_url?: string;
      started_at?: string;
      completed_at?: string;
      is_featured?: boolean;
      visibility?: 'public' | 'private';
      project_type?: 'web_app' | 'mobile_app' | 'desktop_app' | 'library' | 'api' | 'other';
    }
  ): Promise<PortfolioItem> {
    try {
      const payload = {
        candidate_profile_id: candidateProfileId,
        title: portfolioItem.title,
        description: portfolioItem.description || null,
        project_url: portfolioItem.url || null,
        repository_url: portfolioItem.repository_url || null,
        project_type: portfolioItem.project_type || 'web_app',
        is_featured: Boolean(portfolioItem.is_featured),
        visibility: portfolioItem.visibility || 'public',
      };

      const result = await this.db.insert<typeof payload>('portfolio_items', payload);

      if (result.error) {
        throw result.error;
      }

      const data = result.data as any;

      return {
        id: data.id,
        candidate_id: data.candidate_profile_id,
        title: data.title,
        description: data.description || '',
        project_type: data.project_type || 'web_app',
        url: data.project_url || undefined,
        repository_url: data.repository_url || undefined,
        media_urls: Array.isArray(data.media_urls) ? data.media_urls : [],
        skills_demonstrated: [],
        started_at: data.created_at,
        completed_at: undefined,
        is_featured: Boolean(data.is_featured),
        visibility: data.visibility || 'public',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to add portfolio item: ${error}`));
    }
  }

  /**
   * Update portfolio item
   */
  async updatePortfolioItem(
    portfolioItemId: string,
    updates: Partial<PortfolioItem>
  ): Promise<PortfolioItem> {
    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description || null;
      if (updates.url !== undefined) payload.project_url = updates.url || null;
      if (updates.repository_url !== undefined) payload.repository_url = updates.repository_url || null;

      const result = await this.db.update<typeof payload>('portfolio_items', payload, {
        filters: [{ column: 'id', operator: 'eq', value: portfolioItemId }],
      });

      if (result.error) {
        throw result.error;
      }

      const data = result.data as any;

      return {
        id: data.id,
        candidate_id: data.candidate_profile_id,
        title: data.title,
        description: data.description || '',
        project_type: 'personal',
        url: data.project_url || undefined,
        repository_url: data.repository_url || undefined,
        media_urls: [],
        skills_demonstrated: [],
        started_at: data.start_date || data.created_at,
        completed_at: data.end_date || undefined,
        is_featured: false,
        visibility: 'public',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to update portfolio item: ${error}`));
    }
  }

  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(portfolioItemId: string): Promise<void> {
    try {
      const result = await this.db.delete('portfolio_items', {
        filters: [{ column: 'id', operator: 'eq', value: portfolioItemId }],
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database(new Error(`Failed to delete portfolio item: ${error}`));
    }
  }

  /**
   * Get public profile by user ID
   */
  async getPublicProfile(userId: string): Promise<CandidateProfile | null> {
    const result = await this.getProfile(userId);
    return result.profile;
  }
}

// Export singleton instance with initialization function
export const initCandidateService = (db: DatabaseAdapter) => new CandidateService(db);
export const candidateService = new CandidateService(new DatabaseAdapter());
