import { Suspense } from 'react';
import type { Metadata } from 'next';
import CourseListPage from '@/features/courses/CourseListPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Engineering Courses & Learning Paths | TalentSphere',
  description: 'Explore comprehensive engineering courses, system architecture tutorials, and earn verified skill badges.',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <CourseListPage />
    </Suspense>
  );
}
