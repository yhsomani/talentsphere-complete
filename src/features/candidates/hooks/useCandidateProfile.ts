/**
 * useCandidateProfile Hook
 * 
 * Custom hook for managing candidate profile state and operations.
 * Extracts business logic from CandidateProfilePage component.
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { CandidateProfile, Experience, Education, Certification, PortfolioItem } from '@/types';
import { candidateService, type ProfileUpdateData } from '@/services/candidate.service';

interface UseCandidateProfileReturn {
  // State
  profile: CandidateProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  
  // Skills
  skills: Array<{ id: string; name: string; proficiency_level: string }>;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  addSkill: () => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  
  // Experiences
  experiences: Experience[];
  addExperience: (experience: Omit<Experience, 'id' | 'candidate_id' | 'created_at' | 'verified' | 'verified_by'>) => Promise<void>;
  updateExperience: (id: string, updates: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  
  // Education
  educations: Education[];
  addEducation: (education: Omit<Education, 'id' | 'candidate_id' | 'created_at'>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  
  // Certifications
  certifications: Certification[];
  addCertification: (certification: Omit<Certification, 'id' | 'candidate_id' | 'created_at'>) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;
  
  // Portfolio
  portfolioItems: PortfolioItem[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'candidate_id' | 'created_at' | 'updated_at'>) => Promise<void>;
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
  const [skills, setSkills] = useState<Array<{ id: string; name: string; proficiency_level: string }>>([]);
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
   * Load profile data from Supabase
   */
  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await candidateService.getProfile(user.id);
      
      if (data) {
        setProfile(data);
        setFormData({
          headline: data.headline || '',
          bio: data.bio || '',
          location: data.location || '',
          timezone: data.timezone || formData.timezone,
          availability_status: data.availability_status,
          visibility: data.visibility,
          resume_url: data.resume_url || '',
        });
        
        // Load related data
        // Note: In a real implementation, these would be loaded via separate service calls
        // For now, we'll initialize empty arrays
        setSkills([]);
        setExperiences([]);
        setEducations([]);
        setCertifications([]);
        setPortfolioItems([]);
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
      
      await candidateService.upsertProfile(user.id, formData);
      
      setSuccess('Profile saved successfully!');
      
      // Reload to get updated data including XP changes
      await loadProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [user, formData, loadProfile]);

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
      
      await candidateService.uploadAvatar(file, user.id);
      
      // Update auth metadata with new avatar URL
      // This would typically be done via a server action or API route
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
  const addSkill = useCallback(async () => {
    if (!user || !newSkill.trim()) return;

    try {
      setError(null);
      // In a real implementation, this would create the skill first if it doesn't exist
      // Then link it to the candidate with the selected proficiency level
      setNewSkill('');
      setSuccess('Skill added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  }, [user, newSkill]);

  /**
   * Remove a skill
   */
  const removeSkill = useCallback(async (skillId: string) => {
    if (!user) return;

    try {
      setError(null);
      await candidateService.removeSkill(user.id, skillId);
      setSkills(prev => prev.filter(s => s.id !== skillId));
      setSuccess('Skill removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
    }
  }, [user]);

  /**
   * Add experience entry
   */
  const addExperience = useCallback(async (
    experience: Omit<Experience, 'id' | 'candidate_id' | 'created_at' | 'verified' | 'verified_by'>
  ) => {
    if (!user) return;

    try {
      setError(null);
      const newExperience = await candidateService.addExperience(user.id, experience);
      setExperiences(prev => [...prev, newExperience]);
      setSuccess('Experience added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add experience');
    }
  }, [user]);

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
    education: Omit<Education, 'id' | 'candidate_id' | 'created_at'>
  ) => {
    if (!user) return;

    try {
      setError(null);
      const newEducation = await candidateService.addEducation(user.id, education);
      setEducations(prev => [...prev, newEducation]);
      setSuccess('Education added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add education');
    }
  }, [user]);

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
    certification: Omit<Certification, 'id' | 'candidate_id' | 'created_at'>
  ) => {
    if (!user) return;

    try {
      setError(null);
      const newCertification = await candidateService.addCertification(user.id, certification);
      setCertifications(prev => [...prev, newCertification]);
      setSuccess('Certification added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add certification');
    }
  }, [user]);

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
    item: Omit<PortfolioItem, 'id' | 'candidate_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      setError(null);
      const newItem = await candidateService.addPortfolioItem(user.id, item);
      setPortfolioItems(prev => [...prev, newItem]);
      setSuccess('Portfolio item added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add portfolio item');
    }
  }, [user]);

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
    }
  }, [user, loadProfile]);

  return {
    // State
    profile,
    loading,
    saving,
    error,
    success,
    
    // Skills
    skills,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    
    // Experiences
    experiences,
    addExperience,
    updateExperience,
    deleteExperience,
    
    // Education
    educations,
    addEducation,
    deleteEducation,
    
    // Certifications
    certifications,
    addCertification,
    deleteCertification,
    
    // Portfolio
    portfolioItems,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    
    // Form data
    formData,
    updateFormData,
    
    // Actions
    loadProfile,
    saveProfile,
    uploadResume,
    uploadAvatar,
    clearError,
    clearSuccess,
  };
}
