import { Suspense } from 'react';
import type { Metadata } from 'next';
import JobDetailPage from '@/features/jobs/JobDetailPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Job Opportunity | TalentSphere',
  description: 'View role details, responsibilities, required skills, and apply directly on TalentSphere.',
};

export default async function JobPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <JobDetailPage jobId={id} />
    </Suspense>
  );
}
