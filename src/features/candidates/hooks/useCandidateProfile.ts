/**
 * useCandidateProfile Hook
 * 
 * Custom hook for managing candidate profile state and operations.
 * Extracts business logic from CandidateProfilePage component.
 * Fully wired to Supabase via candidateService.
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { CandidateProfile, Experience, Education, Certification, PortfolioItem } from '@/types';
import { candidateService, type ProfileUpdateData } from '@/services/candidate.service';

export interface CandidateSkill {
  id: string;
  skill_id: string;
  name: string;
  proficiency_level: string;
}

interface UseCandidateProfileReturn {
  // State
  profile: CandidateProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  
  // Skills
  skills: CandidateSkill[];
  newSkill: string;
  setNewSkill: (skill: string) => void;
  addSkill: (proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert') => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  
  // Experiences
  experiences: Experience[];
  addExperience: (experience: {
    company_name: string;
    job_title: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    location?: string;
    description?: string;
  }) => Promise<void>;
  updateExperience: (id: string, updates: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  
  // Education
  educations: Education[];
  addEducation: (education: {
    institution_name: string;
    degree?: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    grade?: string;
    description?: string;
  }) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  
  // Certifications
  certifications: Certification[];
  addCertification: (certification: {
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date?: string;
    credential_id?: string;
    credential_url?: string;
  }) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;
  
  // Portfolio
  portfolioItems: PortfolioItem[];
  addPortfolioItem: (item: {
    title: string;
    description?: string;
    url?: string;
    repository_url?: string;
    started_at?: string;
    completed_at?: string;
  }) => Promise<void>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  
  // Form data
  formData: ProfileUpdateData;
  updateFormData: (data: Partial<ProfileUpdateData>) => void;
  
  // Actions
  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useCandidateProfile(user: User | null): UseCandidateProfileReturn {
  // Main state
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Skills state
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [newSkill, setNewSkill] = useState('');
  
  // Related data state
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState<ProfileUpdateData>({
    headline: '',
    bio: '',
    location: '',
    timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    availability_status: 'open_to_work',
    visibility: 'public',
    resume_url: '',
  });

  /**
   * Helper to ensure profile exists and return its ID
   */
  const ensureProfileId = useCallback(async (): Promise<string | null> => {
    if (profile?.id) return profile.id;
    if (!user) return null;

    // Create default profile if not yet created
    const created = await candidateService.upsertProfile(user.id, {
      headline: '',
      availability_status: 'open_to_work',
      visibility: 'public',
    });
    setProfile(created);
    return created.id || null;
  }, [profile, user]);

  /**
   * Load profile data from Supabase
   */
  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const res = await candidateService.getProfile(user.id);
      
      if (res.profile) {
        setProfile(res.profile);
        setFormData({
          headline: res.profile.headline || '',
          bio: res.profile.summary || res.profile.bio || '',
          location: res.profile.location || '',
          timezone: res.profile.timezone || formData.timezone,
          availability_status: res.profile.availability_status,
          visibility: res.profile.visibility,
          resume_url: res.profile.resume_url || '',
        });
        setSkills(res.skills);
        setExperiences(res.experiences);
        setEducations(res.educations);
        setCertifications(res.certifications);
        setPortfolioItems(res.portfolioItems);
      } else {
        // Automatically initialize profile shell for new candidate
        const defaultProf = await candidateService.upsertProfile(user.id, {
          headline: '',
          availability_status: 'open_to_work',
          visibility: 'public',
        });
        setProfile(defaultProf);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user, formData.timezone]);

  /**
   * Save profile data to Supabase
   */
  const saveProfile = useCallback(async () => {
    if (!user) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const updated = await candidateService.upsertProfile(user.id, formData);
      setProfile(prev => ({ ...(prev || updated), ...updated }));
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [user, formData]);

  /**
   * Upload resume file
   */
  const uploadResume = useCallback(async (file: File) => {
    if (!user) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const resumeUrl = await candidateService.uploadResume(file, user.id);
      setFormData(prev => ({ ...prev, resume_url: resumeUrl }));
      setSuccess('Resume uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setSaving(false);
    }
  }, [user]);

  /**
   * Upload avatar file
   */
  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const avatarUrl = await candidateService.uploadAvatar(file, user.id);
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      setSuccess('Avatar uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  }, [user]);

  /**
   * Add a new skill
   */
  const addSkill = useCallback(async (proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate') => {
    if (!newSkill.trim()) return;

    try {
      setError(null);
      const profileId = await ensureProfileId();
      if (!profileId) throw new Error('Profile not initialized');

      const added = await candidateService.addSkill(profileId, newSkill, proficiency);
      setSkills(prev => [...prev.filter(s => s.skill_id !== added.skill_id), added]);
      setNewSkill('');
      setSuccess('Skill added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  }, [newSkill, ensureProfileId]);

  /**
   * Remove a skill
   */
  const removeSkill = useCallback(async (skillId: string) => {
    try {
      setError(null);
      const profileId = await ensureProfileId();
      if (!profileId) throw new Error('Profile not initialized');

      await candidateService.removeSkill(profileId, skillId);
      setSkills(prev => prev.filter(s => s.id !== skillId));
      setSuccess('Skill removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
    }
  }, [ensureProfileId]);

  /**
   * Add experience entry
   */
  const addExperience = useCallback(async (
    experience: {
      company_name: string;
      job_title: string;
      start_date: string;
      end_date?: string;
      is_current?: boolean;
      location?: string;
      description?: string;
    }
  ) => {
    try {
      setError(null);
      const profileId = await ensureProfileId();
      if (!profileId) throw new Error('Profile not initialized');

      const newExperience = await candidateService.addExperience(profileId, experience);
      setExperiences(prev => [newExperience, ...prev]);
      setSuccess('Experience added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add experience');
    }
  }, [ensureProfileId]);

  /**
   * Update experience entry
   */
  const updateExperience = useCallback(async (
    id: string,
    updates: Partial<Experience>
  ) => {
    try {
      setError(null);
      const updated = await candidateService.updateExperience(id, updates);
      setExperiences(prev => prev.map(exp => exp.id === id ? updated : exp));
      setSuccess('Experience updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update experience');
    }
  }, []);

  /**
   * Delete experience entry
   */
  const deleteExperience = useCallback(async (id: string) => {
    try {
      setError(null);
      await candidateService.deleteExperience(id);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setSuccess('Experience deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  }, []);

  /**
   * Add education entry
   */
  const addEducation = useCallback(async (
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
  ) => {
    try {
      setError(null);
      const profileId = await ensureProfileId();
      if (!profileId) throw new Error('Profile not initialized');

      const newEducation = await candidateService.addEducation(profileId, education);
      setEducations(prev => [newEducation, ...prev]);
      setSuccess('Education added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add education');
    }
  }, [ensureProfileId]);

  /**
   * Delete education entry
   */
  const deleteEducation = useCallback(async (id: string) => {
    try {
      setError(null);
      await candidateService.deleteEducation(id);
      setEducations(prev => prev.filter(edu => edu.id !== id));
      setSuccess('Education deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete education');
    }
  }, []);

  /**
   * Add certification entry
   */
  const addCertification = useCallback(async (
    certification: {
      name: string;
      issuing_organization: string;
      issue_date: string;
      expiration_date?: string;
      credential_id?: string;
      credential_url?: string;
    }
  ) => {
    try {
      setError(null);
      const profileId = await ensureProfileId();
      if (!profileId) throw new Error('Profile not initialized');

      const newCert = await candidateService.addCertification(profileId, certification);
      setCertifications(prev => [newCert, ...prev]);
      setSuccess('Certification added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add certification');
    }
  }, [ensureProfileId]);

  /**
   * Delete certification entry
   */
  const deleteCertification = useCallback(async (id: string) => {
    try {
      setError(null);
      await candidateService.deleteCertification(id);
      setCertifications(prev => prev.filter(cert => cert.id !== id));
      setSuccess('Certification deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete certification');
    }
  }, []);

  /**
   * Add portfolio item
   */
  const addPortfolioItem = useCallback(async (
    item: {
      title: string;
      description?: string;
      url?: string;
      repository_url?: string;
      started_at?: string;
      completed_at?: string;
    }
  ) => {
    try {
      setError(null);
      const profileId = await ensureProfileId();
      if (!profileId) throw new Error('Profile not initialized');

      const newItem = await candidateService.addPortfolioItem(profileId, item);
      setPortfolioItems(prev => [newItem, ...prev]);
      setSuccess('Portfolio item added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add portfolio item');
    }
  }, [ensureProfileId]);

  /**
   * Update portfolio item
   */
  const updatePortfolioItem = useCallback(async (
    id: string,
    updates: Partial<PortfolioItem>
  ) => {
    try {
      setError(null);
      const updated = await candidateService.updatePortfolioItem(id, updates);
      setPortfolioItems(prev => prev.map(item => item.id === id ? updated : item));
      setSuccess('Portfolio item updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio item');
    }
  }, []);

  /**
   * Delete portfolio item
   */
  const deletePortfolioItem = useCallback(async (id: string) => {
    try {
      setError(null);
      await candidateService.deletePortfolioItem(id);
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
      setSuccess('Portfolio item deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio item');
    }
  }, []);

  /**
   * Update form data
   */
  const updateFormData = useCallback((data: Partial<ProfileUpdateData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  // Load profile when user changes
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setFormData({
        headline: '',
        bio: '',
        location: '',
        timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        availability_status: 'open_to_work',
        visibility: 'public',
        resume_url: '',
      });
      setSkills([]);
      setExperiences([]);
      setEducations([]);
      setCertifications([]);
      setPortfolioItems([]);
    }
  }, [user, loadProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    success,
    skills,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    experiences,
    addExperience,
    updateExperience,
    deleteExperience,
    educations,
    addEducation,
    deleteEducation,
    certifications,
    addCertification,
    deleteCertification,
    portfolioItems,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    formData,
    updateFormData,
    loadProfile,
    saveProfile,
    uploadResume,
    uploadAvatar,
    clearError,
    clearSuccess,
  };
}
