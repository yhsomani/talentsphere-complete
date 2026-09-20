import { Suspense } from 'react';
import { Metadata } from 'next';
import JobsListPage from '@/features/jobs/JobsListPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Find Your Dream Job | TalentSphere',
  description: 'Browse thousands of job opportunities from top companies. Find roles that match your skills and career goals.',
};

export default function JobsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <JobsListPage />
    </Suspense>
  );
}
