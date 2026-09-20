/**
 * Candidate Service
 * 
 * Data access layer for candidate profile operations.
 * Handles all Supabase interactions for candidate-related data.
 */

import { createBrowserClient } from '@/lib/supabase';
import type { CandidateProfile, Experience, Education, Certification, PortfolioItem, SkillMatch } from '@/types';

export interface ProfileUpdateData {
  headline?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  availability_status?: 'available' | 'employed' | 'open_to_work' | 'not_interested';
  visibility?: 'public' | 'connections' | 'private';
  resume_url?: string;
}

export class CandidateService {
  private supabase = createBrowserClient();

  /**
   * Get candidate profile by user ID
   */
  async getProfile(userId: string): Promise<CandidateProfile | null> {
    const { data, error } = await this.supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  /**
   * Create or update candidate profile
   */
  async upsertProfile(
    userId: string,
    profileData: ProfileUpdateData
  ): Promise<CandidateProfile> {
    const { data, error } = await this.supabase
      .from('candidate_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Upload resume to storage
   */
  async uploadResume(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = this.supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  /**
   * Upload avatar to storage
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  /**
   * Add skill to profile
   */
  async addSkill(
    userId: string,
    skillId: string,
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('candidate_skills')
      .insert({
        candidate_id: userId,
        skill_id: skillId,
        proficiency_level: proficiencyLevel,
      });

    if (error) {
      throw error;
    }
  }

  /**
   * Remove skill from profile
   */
  async removeSkill(userId: string, skillId: string): Promise<void> {
    const { error } = await this.supabase
      .from('candidate_skills')
      .delete()
      .eq('candidate_id', userId)
      .eq('skill_id', skillId);

    if (error) {
      throw error;
    }
  }

  /**
   * Add experience entry
   */
  async addExperience(
    userId: string,
    experience: Omit<Experience, 'id' | 'candidate_id' | 'created_at' | 'verified' | 'verified_by'>
  ): Promise<Experience> {
    const { data, error } = await this.supabase
      .from('experiences')
      .insert({
        candidate_id: userId,
        ...experience,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Update experience entry
   */
  async updateExperience(
    experienceId: string,
    updates: Partial<Experience>
  ): Promise<Experience> {
    const { data, error } = await this.supabase
      .from('experiences')
      .update(updates)
      .eq('id', experienceId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete experience entry
   */
  async deleteExperience(experienceId: string): Promise<void> {
    const { error } = await this.supabase
      .from('experiences')
      .delete()
      .eq('id', experienceId);

    if (error) {
      throw error;
    }
  }

  /**
   * Add education entry
   */
  async addEducation(
    userId: string,
    education: Omit<Education, 'id' | 'candidate_id' | 'created_at'>
  ): Promise<Education> {
    const { data, error } = await this.supabase
      .from('education')
      .insert({
        candidate_id: userId,
        ...education,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete education entry
   */
  async deleteEducation(educationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('education')
      .delete()
      .eq('id', educationId);

    if (error) {
      throw error;
    }
  }

  /**
   * Add certification entry
   */
  async addCertification(
    userId: string,
    certification: Omit<Certification, 'id' | 'candidate_id' | 'created_at'>
  ): Promise<Certification> {
    const { data, error } = await this.supabase
      .from('certifications')
      .insert({
        candidate_id: userId,
        ...certification,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete certification entry
   */
  async deleteCertification(certificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('certifications')
      .delete()
      .eq('id', certificationId);

    if (error) {
      throw error;
    }
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(
    userId: string,
    portfolioItem: Omit<PortfolioItem, 'id' | 'candidate_id' | 'created_at' | 'updated_at'>
  ): Promise<PortfolioItem> {
    const { data, error } = await this.supabase
      .from('portfolio_items')
      .insert({
        candidate_id: userId,
        ...portfolioItem,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Update portfolio item
   */
  async updatePortfolioItem(
    portfolioItemId: string,
    updates: Partial<PortfolioItem>
  ): Promise<PortfolioItem> {
    const { data, error } = await this.supabase
      .from('portfolio_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', portfolioItemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(portfolioItemId: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_items')
      .delete()
      .eq('id', portfolioItemId);

    if (error) {
      throw error;
    }
  }

  /**
   * Get public profile by user ID (for viewing by others)
   */
  async getPublicProfile(userId: string): Promise<CandidateProfile | null> {
    const { data, error } = await this.supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('visibility', 'public')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  /**
   * Search candidates by skills and filters
   */
  async searchCandidates(filters: {
    skills?: string[];
    location?: string;
    availability_status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CandidateProfile[]> {
    let query = this.supabase
      .from('candidate_profiles')
      .select('*');

    if (filters.availability_status) {
      query = query.eq('availability_status', filters.availability_status);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  }
}

// Export singleton instance
export const candidateService = new CandidateService();
