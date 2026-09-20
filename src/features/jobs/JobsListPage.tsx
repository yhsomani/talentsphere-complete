'use client';

import { useJobs } from './hooks/useJobs';
import JobFilters from './components/JobFilters';
import JobList from './components/JobList';
import JobCardSkeleton from './components/JobCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import styles from './JobsListPage.module.css';

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
    totalPages
  } = useJobs({ pageSize: 20 });

  if (error) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Something went wrong"
          description="We couldn't load the job listings. Please try again."
          action={
            <Button onClick={refresh} variant="primary">
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Find Your Dream Job</h1>
          <p className={styles.subtitle}>
            {total > 0 
              ? `${total.toLocaleString()} ${total === 1 ? 'job' : 'jobs'} available`
              : 'Browse opportunities'
            }
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Filters Sidebar */}
        <aside className={styles.filters}>
          <JobFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </aside>

        {/* Job List */}
        <main className={styles.main}>
          {isLoading ? (
            <div className={styles.skeletons}>
              {[...Array(10)].map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : isEmpty ? (
            <EmptyState
              title={filters.search || Object.values(filters).some(v => v) 
                ? "No jobs match your filters" 
                : "No jobs available yet"}
              description={filters.search || Object.values(filters).some(v => v)
                ? "Try adjusting your search criteria or resetting filters"
                : "Check back soon for new opportunities!"
              }
              action={filters.search || Object.values(filters).some(v => v) && (
                <Button onClick={resetFilters} variant="secondary">
                  Reset Filters
                </Button>
              )}
            />
          ) : (
            <>
              <JobList jobs={jobs} />
              
              {/* Load More / Pagination */}
              {hasMore && (
                <div className={styles.loadMore}>
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    variant="secondary"
                    size="lg"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Jobs'}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              {totalPages > 1 && (
                <p className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
