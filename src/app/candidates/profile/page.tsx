/**
 * Candidate Profile Page Component
 * 
 * Main entry point for candidate profile management.
 * Uses useCandidateProfile hook for business logic.
 * Thin component following separation of concerns.
 */

'use client';

import React from 'react';
import { useAuth } from '@/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui';
import { useCandidateProfile } from '@/features/candidates/hooks/useCandidateProfile';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileForm } from './components/ProfileForm';
import { ResumeSection } from './components/ResumeSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { EducationSection } from './components/EducationSection';
import { CertificationsSection } from './components/CertificationsSection';
import { PortfolioSection } from './components/PortfolioSection';
import { LoadingState } from './components/LoadingState';
import { ErrorBanner } from './components/ErrorBanner';
import { SuccessBanner } from './components/SuccessBanner';
import { ProfileCompletenessMeter } from './components/ProfileCompletenessMeter';
import { BadgesSection } from './components/BadgesSection';

export default function CandidateProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const profileHook = useCandidateProfile(user);
  
  const {
    profile,
    loading,
    saving,
    error,
    success,
    resumes,
    loadingResumes,
    setPrimaryResume,
    deleteResume,
    formData,
    skills,
    newSkill,
    experiences,
    educations,
    certifications,
    portfolioItems,
    setNewSkill,
    addSkill,
    removeSkill,
    updateFormData,
    saveProfile,
    uploadResume,
    uploadAvatar,
    clearError,
    clearSuccess,
  } = profileHook;

  // Show loading state during auth check
  if (authLoading || loading) {
    return (
      <DashboardLayout userRole="candidate" userName="Loading...">
        <LoadingState />
      </DashboardLayout>
    );
  }

  // Show error state if profile failed completely and no profile object
  if (error && !profile) {
    return (
      <DashboardLayout userRole="candidate" userName="Error">
        <ErrorBanner message={error} onDismiss={clearError} />
      </DashboardLayout>
    );
  }

  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const firstName = typeof meta?.first_name === 'string' ? meta.first_name : '';
  const lastName = typeof meta?.last_name === 'string' ? meta.last_name : '';
  const fullName = typeof meta?.full_name === 'string' ? meta.full_name : `${firstName} ${lastName}`.trim();
  const userName = fullName || user?.email?.split('@')[0] || 'Candidate';
  const avatarUrl = profile?.avatar_url || (meta?.avatar_url as string | undefined);

  return (
    <DashboardLayout userRole="candidate" userName={userName} userAvatar={avatarUrl}>
      <div className="max-w-5xl mx-auto space-y-6">
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        {success && <SuccessBanner message={success} onDismiss={clearSuccess} />}

        <ProfileHeader
          avatarUrl={avatarUrl}
          userName={userName}
          headline={formData.headline || 'Software Engineer'}
          location={formData.location}
          availability={formData.availability_status}
          onAvatarUpload={uploadAvatar}
          uploading={saving}
        />

        <ProfileCompletenessMeter
          formData={formData}
          resumes={resumes}
          skills={skills}
          experiences={experiences}
          educations={educations}
          certifications={certifications}
          portfolioItems={portfolioItems}
        />

        <main className="space-y-6">
          <div id="basic-info-section">
            <ProfileForm
              formData={formData}
              onChange={updateFormData}
              onResumeUpload={uploadResume}
              uploadingResume={saving}
              onSave={saveProfile}
              saving={saving}
            />
          </div>

          <div id="resume-section">
            <ResumeSection
              resumes={resumes}
              loading={loadingResumes}
              uploading={saving}
              onUpload={uploadResume}
              onSetPrimary={setPrimaryResume}
              onDelete={deleteResume}
            />
          </div>

          <div id="badges-section">
            <BadgesSection
              candidateProfileId={profile?.id}
              hasResumes={resumes.length > 0}
              hasCompletedProfile={Boolean(formData.headline && formData.location && skills.length > 0)}
            />
          </div>

          <div id="skills-section">
            <SkillsSection
              skills={skills}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
              newSkill={newSkill}
              setNewSkill={setNewSkill}
            />
          </div>

          <div id="experience-section">
            <ExperienceSection
              experiences={experiences}
              onAdd={profileHook.addExperience}
              onUpdate={profileHook.updateExperience}
              onDelete={profileHook.deleteExperience}
            />
          </div>

          <div id="education-section">
            <EducationSection
              educations={educations}
              onAdd={profileHook.addEducation}
              onDelete={profileHook.deleteEducation}
            />
          </div>

          <div id="certifications-section">
            <CertificationsSection
              certifications={certifications}
              onAdd={profileHook.addCertification}
              onDelete={profileHook.deleteCertification}
            />
          </div>

          <div id="portfolio-section">
            <PortfolioSection
              portfolioItems={portfolioItems}
              onAdd={profileHook.addPortfolioItem}
              onUpdate={profileHook.updatePortfolioItem}
              onDelete={profileHook.deletePortfolioItem}
            />
          </div>
        </main>

        <div className="pt-6 border-t border-slate-200/80 flex items-center justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={saveProfile}
            disabled={saving}
            isLoading={saving}
            className="shadow-md shadow-indigo-500/20"
          >
            Save All Profile Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
