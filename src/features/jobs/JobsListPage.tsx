'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from './hooks/useJobs';
import JobFilters from './components/JobFilters';
import JobList from './components/JobList';
import JobCardSkeleton from './components/JobCardSkeleton';
import { EmptyState, Button } from '@/components/ui';
import { Briefcase, Plus, AlertCircle } from 'lucide-react';

export default function JobsListPage() {
  const {
    jobs,
    isLoading,
    isLoadingMore,
    error,
    filters,
    setFilters,
    resetFilters,
    loadMore,
    refresh,
    isEmpty,
    hasMore,
    total,
    currentPage,
    totalPages,
    bookmarkedIds,
    bookmarkJob,
    removeBookmark,
    isBookmarked,
    facets
  } = useJobs({ pageSize: 20 });

  if (error) {
    return (
      <DashboardLayout userRole="candidate">
        <div className="max-w-4xl mx-auto py-12">
          <EmptyState
            icon={<AlertCircle className="w-8 h-8 text-rose-500" />}
            title="Unable to load job listings"
            description="A network or database issue occurred while retrieving requisitions. Please try again."
            action={
              <Button onClick={refresh} variant="primary">
                Try Again
              </Button>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="candidate">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-xs border border-white/10">
                <Briefcase className="w-3.5 h-3.5 text-indigo-300" />
                <span>Job Marketplace</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Discover Verified Opportunities
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect with forward-thinking tech employers looking for verified skills, transparent compensation, and fast interview feedback.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/jobs/post">
                <Button variant="primary" size="md" className="bg-white text-slate-950 hover:bg-slate-100 font-bold gap-2 shadow-sm">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Post a Requisition</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Filters on Left, Listings on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
              facets={facets}
            />
          </aside>

          {/* Job Listings Column */}
          <main className="lg:col-span-3 space-y-4">
            {/* Header bar */}
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Requisitions
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                  {total.toLocaleString()} available
                </span>
              </div>

              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                Sorted by most recent
              </span>
            </div>

            {/* Content states */}
            {isLoading ? (
              <div className="space-y-3.5">
                {[...Array(6)].map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : isEmpty ? (
              <EmptyState
                icon={<Briefcase className="w-8 h-8 text-slate-400" />}
                title={filters.search || Object.values(filters).some(v => v) 
                  ? "No requisitions match your criteria" 
                  : "No job postings yet"}
                description={filters.search || Object.values(filters).some(v => v)
                  ? "Try loosening your location, job type, or salary requirements."
                  : "New engineering and product opportunities are added daily."
                }
                action={filters.search || Object.values(filters).some(v => v) ? (
                  <Button onClick={resetFilters} variant="secondary" size="sm">
                    Reset All Filters
                  </Button>
                ) : undefined}
              />
            ) : (
              <>
                <JobList
                  jobs={jobs}
                  bookmarkedIds={bookmarkedIds}
                  onBookmark={async (jobId) => {
                    if (isBookmarked(jobId)) {
                      await removeBookmark(jobId);
                    } else {
                      await bookmarkJob(jobId);
                    }
                  }}
                />

                {/* Load More Action */}
                {hasMore && (
                  <div className="pt-6 pb-2 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      isLoading={isLoadingMore}
                      variant="outline"
                      size="md"
                      className="px-8 shadow-2xs font-semibold"
                    >
                      Load More Opportunities
                    </Button>
                  </div>
                )}

                {/* Pagination Info */}
                {totalPages > 1 && (
                  <p className="text-center text-xs font-medium text-slate-400 pt-2">
                    Showing Page {currentPage} of {totalPages}
                  </p>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
