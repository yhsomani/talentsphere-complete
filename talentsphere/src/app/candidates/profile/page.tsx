'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { cn } from '@/components/ui';
import type { CandidateProfile, Experience, Education, Certification, PortfolioItem } from '@/types';

type AvailabilityStatus = 'available' | 'employed' | 'open_to_work' | 'not_interested';
type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type Visibility = 'public' | 'connections' | 'private';

interface FormData {
  headline: string;
  bio: string;
  location: string;
  timezone: string;
  availability_status: AvailabilityStatus;
  visibility: Visibility;
  resume_url: string;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
];

const availabilityOptions = [
  { value: 'available', label: 'Available' },
  { value: 'open_to_work', label: 'Open to Work' },
  { value: 'employed', label: 'Employed' },
  { value: 'not_interested', label: 'Not Interested' },
];

const visibilityOptions = [
  { value: 'public', label: 'Public - Anyone can view' },
  { value: 'connections', label: 'Connections Only' },
  { value: 'private', label: 'Private - Only you can view' },
];

const proficiencyLevels: ProficiencyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createBrowserClient();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    headline: '',
    bio: '',
    location: '',
    timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    availability_status: 'open_to_work',
    visibility: 'public',
    resume_url: '',
  });

  const [skills, setSkills] = useState<Array<{ id: string; name: string; proficiency_level: ProficiencyLevel }>>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user || authLoading) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile(data);
          setFormData({
            headline: data.headline || '',
            bio: data.bio || '',
            location: data.location || '',
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            availability_status: data.availability_status || 'open_to_work',
            visibility: data.visibility || 'public',
            resume_url: data.resume_url || '',
          });
          setSkills(data.skills || []);
          setExperiences(data.experience || []);
          setEducations(data.education || []);
          setCertifications(data.certifications || []);
          setPortfolioItems(data.portfolio_items || []);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, authLoading, supabase]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const skillObj = {
      id: crypto.randomUUID(),
      name: newSkill.trim(),
      proficiency_level: 'intermediate' as ProficiencyLevel,
    };
    
    setSkills(prev => [...prev, skillObj]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const handleSkillProficiencyChange = (skillId: string, proficiency: ProficiencyLevel) => {
    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, proficiency_level: proficiency } : s
    ));
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingResume(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, resume_url: publicUrl }));
      setSuccess('Resume uploaded successfully');
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setSuccess('Avatar updated successfully');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: crypto.randomUUID(),
      candidate_id: user?.id || '',
      company_name: '',
      job_title: '',
      description: '',
      start_date: '',
      is_current: false,
      skills_used: [],
      verified: false,
      created_at: new Date().toISOString(),
    };
    setExperiences(prev => [...prev, newExperience]);
  };

  const handleUpdateExperience = (id: string, field: keyof Experience, value: unknown) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const handleAddEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      candidate_id: user?.id || '',
      institution_name: '',
      start_date: '',
      created_at: new Date().toISOString(),
    };
    setEducations(prev => [...prev, newEducation]);
  };

  const handleUpdateEducation = (id: string, field: keyof Education, value: unknown) => {
    setEducations(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleRemoveEducation = (id: string) => {
    setEducations(prev => prev.filter(edu => edu.id !== id));
  };

  const handleAddCertification = () => {
    const newCertification: Certification = {
      id: crypto.randomUUID(),
      candidate_id: user?.id || '',
      name: '',
      issuing_organization: '',
      issue_date: '',
      skills: [],
      created_at: new Date().toISOString(),
    };
    setCertifications(prev => [...prev, newCertification]);
  };

  const handleUpdateCertification = (id: string, field: keyof Certification, value: unknown) => {
    setCertifications(prev => prev.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to save your profile');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const profileData = {
        user_id: user.id,
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        timezone: formData.timezone,
        availability_status: formData.availability_status,
        visibility: formData.visibility,
        resume_url: formData.resume_url,
        skills: skills,
        experience: experiences,
        education: educations,
        certifications: certifications,
        portfolio_items: portfolioItems,
        xp_points: 0,
        level: 1,
        badges: [],
        updated_at: new Date().toISOString(),
      };

      // Upsert profile
      const { error: upsertError } = await supabase
        .from('candidate_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        });

      if (upsertError) throw upsertError;

      setSuccess('Profile saved successfully!');
      
      // Award XP for completing profile (if first time)
      if (!profile) {
        // Insert XP transaction
        await supabase
          .from('xp_transactions')
          .insert({
            user_id: user.id,
            amount: 100,
            source: 'profile_complete',
            reference_id: 'profile_setup',
          });
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout userRole="candidate" userName="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completionPercentage = calculateCompletionPercentage(formData, skills, experiences, educations);

  return (
    <DashboardLayout userRole="candidate" userName={user?.full_name || 'Candidate'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-1">
              Showcase your skills and experience to stand out to employers
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Profile Completion</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-48 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card title="Basic Information" description="Tell us about yourself">
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.full_name || 'User'}
                  size="xl"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {uploadingAvatar && (
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  )}
                </div>
              </div>

              {/* Headline */}
              <Input
                label="Headline"
                placeholder="e.g., Full Stack Developer | React & Node.js Expert"
                value={formData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                helperText="A brief professional headline that appears at the top of your profile"
              />

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your background, interests, and what makes you unique..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.bio.length} characters
                </p>
              </div>

              {/* Location & Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="e.g., San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availabilityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('availability_status', option.value as AvailabilityStatus)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                        formData.availability_status === option.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Visibility */}
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Visibility
                </label>
                <select
                  id="visibility"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value as Visibility)}
                >
                  {visibilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {formData.resume_url && (
                    <Badge variant="success">Uploaded</Badge>
                  )}
                </div>
                {uploadingResume && (
                  <p className="text-sm text-gray-500 mt-1">Uploading resume...</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  PDF format, max 5MB
                </p>
              </div>
            </div>
          </Card>

          {/* Skills Section */}
          <Card title="Skills" description="Add your key skills and proficiency levels">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., React, Python, Project Management)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" onClick={handleAddSkill} variant="secondary">
                  Add Skill
                </Button>
              </div>

              {skills.length > 0 ? (
                <div className="space-y-3">
                  {skills.map(skill => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={skill.proficiency_level}
                          onChange={(e) => handleSkillProficiencyChange(skill.id, e.target.value as ProficiencyLevel)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {proficiencyLevels.map(level => (
                            <option key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No skills added yet. Add your first skill above.
                </p>
              )}
            </div>
          </Card>

          {/* Experience Section */}
          <Card title="Work Experience" description="Add your relevant work history">
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <div key={exp.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Company Name"
                      value={exp.company_name}
                      onChange={(e) => handleUpdateExperience(exp.id, 'company_name', e.target.value)}
                    />
                    <Input
                      placeholder="Job Title"
                      value={exp.job_title}
                      onChange={(e) => handleUpdateExperience(exp.id, 'job_title', e.target.value)}
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Describe your responsibilities and achievements..."
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={exp.description || ''}
                      onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      label="Start Date"
                      value={exp.start_date}
                      onChange={(e) => handleUpdateExperience(exp.id, 'start_date', e.target.value)}
                    />
                    <Input
                      type="date"
                      label="End Date"
                      value={exp.end_date || ''}
                      onChange={(e) => handleUpdateExperience(exp.id, 'end_date', e.target.value)}
                      disabled={exp.is_current}
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exp.is_current}
                      onChange={(e) => handleUpdateExperience(exp.id, 'is_current', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">I currently work here</span>
                  </label>
                </div>
              ))}
              <Button type="button" onClick={handleAddExperience} variant="outline" className="w-full">
                + Add Experience
              </Button>
            </div>
          </Card>

          {/* Education Section */}
          <Card title="Education" description="Add your educational background">
            <div className="space-y-4">
              {educations.map((edu, index) => (
                <div key={edu.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Institution Name"
                      value={edu.institution_name}
                      onChange={(e) => handleUpdateEducation(edu.id, 'institution_name', e.target.value)}
                    />
                    <Input
                      placeholder="Degree"
                      value={edu.degree || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Field of Study"
                      value={edu.field_of_study || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, 'field_of_study', e.target.value)}
                    />
                    <Input
                      placeholder="Grade"
                      value={edu.grade || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, 'grade', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      label="Start Date"
                      value={edu.start_date}
                      onChange={(e) => handleUpdateEducation(edu.id, 'start_date', e.target.value)}
                    />
                    <Input
                      type="date"
                      label="End Date"
                      value={edu.end_date || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, 'end_date', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button type="button" onClick={handleAddEducation} variant="outline" className="w-full">
                + Add Education
              </Button>
            </div>
          </Card>

          {/* Certifications Section */}
          <Card title="Certifications" description="Add your professional certifications">
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={cert.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Certification #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(cert.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Certification Name"
                      value={cert.name}
                      onChange={(e) => handleUpdateCertification(cert.id, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Issuing Organization"
                      value={cert.issuing_organization}
                      onChange={(e) => handleUpdateCertification(cert.id, 'issuing_organization', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      label="Issue Date"
                      value={cert.issue_date}
                      onChange={(e) => handleUpdateCertification(cert.id, 'issue_date', e.target.value)}
                    />
                    <Input
                      type="date"
                      label="Expiration Date (optional)"
                      value={cert.expiration_date || ''}
                      onChange={(e) => handleUpdateCertification(cert.id, 'expiration_date', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Credential ID (optional)"
                    value={cert.credential_id || ''}
                    onChange={(e) => handleUpdateCertification(cert.id, 'credential_id', e.target.value)}
                  />
                  <Input
                    placeholder="Credential URL (optional)"
                    value={cert.credential_url || ''}
                    onChange={(e) => handleUpdateCertification(cert.id, 'credential_url', e.target.value)}
                  />
                </div>
              ))}
              <Button type="button" onClick={handleAddCertification} variant="outline" className="w-full">
                + Add Certification
              </Button>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              disabled={saving}
              size="lg"
            >
              {saving ? 'Saving...' : profile ? 'Update Profile' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function calculateCompletionPercentage(
  formData: FormData,
  skills: Array<unknown>,
  experiences: Array<unknown>,
  educations: Array<unknown>
): number {
  let score = 0;
  const maxScore = 7;

  if (formData.headline) score++;
  if (formData.bio && formData.bio.length > 50) score++;
  if (formData.location) score++;
  if (formData.resume_url) score++;
  if (skills.length > 0) score++;
  if (experiences.length > 0) score++;
  if (educations.length > 0) score++;

  return Math.round((score / maxScore) * 100);
}
