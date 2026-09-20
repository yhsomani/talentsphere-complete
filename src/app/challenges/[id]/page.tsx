import { Suspense } from 'react';
import type { Metadata } from 'next';
import ChallengeSolverPage from '@/features/challenges/ChallengeSolverPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Solve Challenge | TalentSphere Code Arena',
  description: 'Interactive IDE, test suites, and problem solver on TalentSphere.',
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ChallengeSolverPage challengeId={id} />
    </Suspense>
  );
}
