'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { applicationService, type ApplicationRecord } from '@/services/application.service';
import { jobsService } from '@/services/jobs.service';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RecruiterPipelineBoard from './components/RecruiterPipelineBoard';
import { Button } from '@/components/ui';
import { ArrowLeft, Briefcase, MapPin, AlertCircle, ExternalLink } from 'lucide-react';

interface RecruiterJobApplicationsPageProps {
  jobId: string;
}

export default function RecruiterJobApplicationsPage({ jobId }: RecruiterJobApplicationsPageProps) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [job, setJob] = useState<{
    id: string;
    title: string;
    department?: string | null;
    work_mode?: string;
    location_city?: string | null;
    status?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [apps, jobData] = await Promise.all([
        applicationService.getJobApplications(jobId),
        jobsService.getJobById(jobId).catch(() => null),
      ]);

      setApplications(apps);
      setJob(jobData);
    } catch (err) {
      console.error('Failed to load applications for job:', err);
      setError('Could not load candidate applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId, loadData]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="recruiter">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="recruiter">
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Pipeline</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" onClick={loadData}>
              Try Again
            </Button>
            <Link href="/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="recruiter">
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/jobs/${jobId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Job View</span>
            </Link>

            <Link
              href="/jobs"
              className="text-xs text-slate-400 hover:text-slate-600 hidden sm:inline"
            >
              All Jobs
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${jobId}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Job Post</span>
            </Link>
          </div>
        </div>

        {/* Requisition Meta Strip */}
        {job && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {job.department && <span>{job.department}</span>}
                  {job.work_mode && <span className="capitalize">• {job.work_mode.replace('_', ' ')}</span>}
                  {job.location_city && (
                    <span className="flex items-center gap-1">
                      • <MapPin className="w-3 h-3 inline" /> {job.location_city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                job.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {job.status}
              </span>
            </div>
          </div>
        )}

        {/* The Pipeline Board */}
        <RecruiterPipelineBoard
          jobId={jobId}
          jobTitle={job?.title}
          initialApplications={applications}
          onRefresh={loadData}
        />
      </div>
    </DashboardLayout>
  );
}
