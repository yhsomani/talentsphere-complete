import { Suspense } from 'react';
import type { Metadata } from 'next';
import JobPostPage from '@/features/jobs/JobPostPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Post a Job | TalentSphere',
  description: 'Create and publish job listings to find and hire top engineering talent.',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <JobPostPage />
    </Suspense>
  );
}
