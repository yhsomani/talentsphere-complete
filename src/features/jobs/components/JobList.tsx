'use client';

import React from 'react';
import Link from 'next/link';
import type { JobListing } from '@/types';
import { Badge } from '@/components/ui';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2, 
  Bookmark, 
  CheckCircle2,
  ChevronRight 
} from 'lucide-react';

interface JobListProps {
  jobs: JobListing[];
  onBookmark?: (jobId: string) => void;
  bookmarkedIds?: Set<string>;
}

export default function JobList({ jobs, onBookmark, bookmarkedIds = new Set() }: JobListProps) {
  return (
    <div className="space-y-3.5">
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          isBookmarked={bookmarkedIds.has(job.id)}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  );
}

export function JobCard({ 
  job, 
  isBookmarked = false,
  onBookmark 
}: { 
  job: JobListing; 
  isBookmarked?: boolean;
  onBookmark?: (jobId: string) => void;
}) {
  const postedDate = new Date(job.created_at);
  const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all duration-200 group relative">
      <Link href={`/jobs/${job.id}`} className="block">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3.5">
          <div className="flex items-start gap-3.5">
            {/* Organization Logo */}
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200/60 group-hover:scale-105 transition-transform overflow-hidden">
              {job.organization?.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={job.organization.logo_url}
                  alt={job.organization.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400" />
              )}
            </div>

            {/* Title & Organization Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {job.title}
                </h3>
                {job.is_featured && (
                  <Badge variant="warning" size="sm">Featured</Badge>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                <span>{job.organization?.name || 'Top Employer'}</span>
                <span className="text-emerald-600" title="Verified Employer">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-50" />
                </span>
              </p>

              {/* Meta Chips */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.work_mode === 'remote' ? 'Remote' : (job.location_city || job.location || 'On-site')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatJobType(job.job_type)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatExperience(job.experience_level)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Salary & Bookmark */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {onBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBookmark(job.id);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600' : ''}`} />
              </button>
            )}
            {job.salary_min ? (
              <div className="text-left sm:text-right">
                <div className="text-sm font-extrabold text-slate-900 font-mono">
                  ${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max || job.salary_min)}
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  /{job.salary_period || 'year'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Salary competitive</span>
            )}
          </div>
        </div>

        {/* Required Skills Badges */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
            {job.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/60"
              >
                {skill.name}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-[11px] text-slate-400 font-medium pl-1">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Posted {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}</span>
          <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>View Requisition</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function formatJobType(type: string): string {
  const map: Record<string, string> = {
    full_time: 'Full-time',
    'full-time': 'Full-time',
    part_time: 'Part-time',
    'part-time': 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
  };
  return map[type] || type;
}

function formatExperience(level: string): string {
  const map: Record<string, string> = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior Level',
    lead: 'Lead / Staff',
    executive: 'Executive',
  };
  return map[level] || level;
}

function formatSalary(amount: number): string {
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`;
  }
  return amount.toLocaleString();
}
