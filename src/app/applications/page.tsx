import { Suspense } from 'react';
import type { Metadata } from 'next';
import ApplicationsPage from '@/features/applications/ApplicationsPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'My Applications | TalentSphere',
  description: 'View and track the status of all your submitted job applications on TalentSphere.',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ApplicationsPage />
    </Suspense>
  );
}
