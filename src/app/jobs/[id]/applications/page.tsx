import { Suspense } from 'react';
import type { Metadata } from 'next';
import RecruiterJobApplicationsPage from '@/features/applications/RecruiterJobApplicationsPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Applicant Pipeline Review | TalentSphere',
  description: 'Manage candidate applications, screening, interviews, and hiring decisions on TalentSphere.',
};

export default async function JobApplicationsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <RecruiterJobApplicationsPage jobId={id} />
    </Suspense>
  );
}
