import { Suspense } from 'react';
import type { Metadata } from 'next';
import ChallengeListPage from '@/features/challenges/ChallengeListPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Code Arena & Challenges | TalentSphere',
  description: 'Sharpen your coding skills with algorithmic, data structure, and system design challenges on TalentSphere.',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ChallengeListPage />
    </Suspense>
  );
}
