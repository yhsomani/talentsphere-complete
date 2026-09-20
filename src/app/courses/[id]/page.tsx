import { Suspense } from 'react';
import type { Metadata } from 'next';
import CourseDetailPage from '@/features/courses/CourseDetailPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Course Syllabus & Enrollment | TalentSphere',
  description: 'View full curriculum, lesson preview, and enroll in engineering courses on TalentSphere.',
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <CourseDetailPage courseId={id} />
    </Suspense>
  );
}
