import { Suspense } from 'react';
import type { Metadata } from 'next';
import LessonPlayerPage from '@/features/courses/LessonPlayerPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Lesson Player | TalentSphere',
  description: 'Interactive course player, video lectures, and practical hands-on exercises.',
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <LessonPlayerPage courseId={id} />
    </Suspense>
  );
}
