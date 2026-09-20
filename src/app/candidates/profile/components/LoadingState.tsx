/**
 * LoadingState Component
 * 
 * Displays loading skeleton for profile page.
 */

import React from 'react';
import { Skeleton } from '@/components/ui';

export function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton variant="text" className="h-8 w-48 mb-2" />
          <Skeleton variant="text" className="h-4 w-64" />
        </div>
      </div>
      
      {/* Avatar skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-16 w-16" />
        <Skeleton variant="text" className="h-10 w-32" />
      </div>
      
      {/* Form sections skeleton */}
      <div className="space-y-4">
        <Skeleton variant="rectangular" className="h-32 w-full" />
        <Skeleton variant="rectangular" className="h-48 w-full" />
        <Skeleton variant="rectangular" className="h-40 w-full" />
      </div>
    </div>
  );
}
