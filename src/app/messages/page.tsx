import { Suspense } from 'react';
import { MessagesPage } from '@/features/messages/MessagesPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Messages | TalentSphere',
  description: 'Direct messaging and communications on TalentSphere',
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <MessagesPage />
    </Suspense>
  );
}
