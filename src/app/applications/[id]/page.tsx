import { Suspense } from 'react';
import type { Metadata } from 'next';
import ApplicationDetailPage from '@/features/applications/ApplicationDetailPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Application Details | TalentSphere',
  description: 'View timeline, interview status, and submission details for your job application.',
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ApplicationDetailPage applicationId={id} />
    </Suspense>
  );
}
