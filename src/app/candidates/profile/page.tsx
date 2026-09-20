/**
 * Candidate Profile Page Component
 * 
 * Main entry point for candidate profile management.
 * Uses useCandidateProfile hook for business logic.
 * Thin component following separation of concerns.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui';
import { useCandidateProfile } from '@/features/candidates/hooks/useCandidateProfile';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileForm } from './components/ProfileForm';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { EducationSection } from './components/EducationSection';
import { CertificationsSection } from './components/CertificationsSection';
import { PortfolioSection } from './components/PortfolioSection';
import { LoadingState } from './components/LoadingState';
import { ErrorBanner } from './components/ErrorBanner';
import { SuccessBanner } from './components/SuccessBanner';
import styles from './CandidateProfilePage.module.css';

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const profileHook = useCandidateProfile(user);
  
  const {
    profile,
    loading,
    saving,
    error,
    success,
    formData,
    skills,
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
      <DashboardLayout>
        <LoadingState />
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && !profile) {
    return (
      <DashboardLayout>
        <ErrorBanner message={error} onDismiss={clearError} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Candidate Profile</h1>
          <p className={styles.subtitle}>
            Complete your profile to increase visibility to recruiters
          </p>
        </header>

        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        {success && <SuccessBanner message={success} onDismiss={clearSuccess} />}

        <ProfileHeader
          avatarUrl={profile?.user_id ? `/api/avatar/${profile.user_id}` : undefined}
          onAvatarUpload={uploadAvatar}
          uploading={saving}
        />

        <main className={styles.main}>
          <ProfileForm
            formData={formData}
            onChange={updateFormData}
            onResumeUpload={uploadResume}
            uploadingResume={saving}
            onSave={saveProfile}
            saving={saving}
          />

          <SkillsSection
            skills={skills}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
            setNewSkill={setNewSkill}
          />

          <ExperienceSection
            experiences={experiences}
            onAdd={(exp) => profileHook.addExperience(exp)}
            onUpdate={(id, updates) => profileHook.updateExperience(id, updates)}
            onDelete={(id) => profileHook.deleteExperience(id)}
          />

          <EducationSection
            educations={educations}
            onAdd={(edu) => profileHook.addEducation(edu)}
            onDelete={(id) => profileHook.deleteEducation(id)}
          />

          <CertificationsSection
            certifications={certifications}
            onAdd={(cert) => profileHook.addCertification(cert)}
            onDelete={(id) => profileHook.deleteCertification(id)}
          />

          <PortfolioSection
            portfolioItems={portfolioItems}
            onAdd={(item) => profileHook.addPortfolioItem(item)}
            onUpdate={(id, updates) => profileHook.updatePortfolioItem(id, updates)}
            onDelete={(id) => profileHook.deletePortfolioItem(id)}
          />
        </main>

        <footer className={styles.footer}>
          <Button
            variant="primary"
            size="large"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </footer>
      </div>
    </DashboardLayout>
  );
}
