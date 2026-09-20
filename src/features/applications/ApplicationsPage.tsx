'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { applicationService, type ApplicationRecord } from '@/services/application.service';
import { candidateService } from '@/services/candidate.service';
import { createBrowserClient } from '@/lib/supabase';
import { Button, Avatar, Badge, EmptyState } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Users,
  ChevronRight,
  PlusCircle
} from 'lucide-react';

interface RecruiterOverviewData {
  jobs: Array<{
    id: string;
    title: string;
    department: string | null;
    location_city: string | null;
    work_mode: string;
    status: string;
    created_at: string;
    application_count: number;
  }>;
  recentApplications: ApplicationRecord[];
}

export default function ApplicationsPage() {
  const [userRole, setUserRole] = useState<'candidate' | 'recruiter' | 'hiring_manager'>('candidate');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [recruiterData, setRecruiterData] = useState<RecruiterOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'interviews' | 'archived'>('all');
  const [candidateProfileId, setCandidateProfileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please sign in to view your applications.');
          setIsLoading(false);
          return;
        }

        // Check user role from database
        const { data: userRecord } = await supabase
          .from('users')
          .select('id, role, organization_id')
          .eq('id', user.id)
          .single();

        const role = userRecord?.role || 'candidate';
        if (role === 'recruiter' || role === 'hiring_manager') {
          setUserRole(role);
          const overview = await applicationService.getRecruiterOverview(user.id, userRecord?.organization_id);
          setRecruiterData(overview);
          setIsLoading(false);
          return;
        }

        // Candidate flow
        setUserRole('candidate');
        const profileResult = await candidateService.getProfile(user.id);
        if (!profileResult?.profile?.id) {
          // If no candidate profile yet, show a friendly prompt
          setError('Candidate profile not found. Please complete your profile to submit and view applications.');
          setIsLoading(false);
          return;
        }

        const candidateId = profileResult.profile.id;
        setCandidateProfileId(candidateId);
        const apps = await applicationService.getCandidateApplications(candidateId);
        setApplications(apps);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!candidateProfileId) return;
    const confirmWithdraw = window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.');
    if (!confirmWithdraw) return;

    try {
      await applicationService.withdrawApplication(applicationId, candidateProfileId);
      setApplications(prev =>
        prev.map(app => (app.id === applicationId ? { ...app, status: 'withdrawn' } : app))
      );
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      alert('Failed to withdraw application. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="info">Submitted</Badge>;
      case 'screening':
      case 'under_review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'interview_scheduled':
      case 'interviewed':
        return <Badge variant="secondary">Interview Stage</Badge>;
      case 'offer_extended':
      case 'offer_accepted':
        return <Badge variant="success">Offer Extended 🎉</Badge>;
      case 'rejected':
        return <Badge variant="danger">Not Selected</Badge>;
      case 'withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
      default:
        return <Badge variant="default">{status.replace('_', ' ')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !recruiterData) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Notice</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/candidates/profile">
              <Button variant="primary">Set Up Profile</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // RECRUITER / HIRING MANAGER VIEW
  // ==========================================
  if (userRole === 'recruiter' || userRole === 'hiring_manager') {
    const jobs = recruiterData?.jobs || [];
    const recentApps = recruiterData?.recentApplications || [];
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.application_count || 0), 0);
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const inReview = recentApps.filter(a => ['submitted', 'screening', 'under_review'].includes(a.status)).length;
    const inInterview = recentApps.filter(a => ['interview_scheduled', 'interviewed'].includes(a.status)).length;

    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
                  <Users className="w-3.5 h-3.5" />
                  Talent Acquisition Hub
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Candidate Pipeline Review
                </h1>
                <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                  Evaluate incoming talent pools, manage stages across active job requisitions, and advance candidates through your hiring pipeline.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link href="/jobs/post">
                  <Button variant="primary" size="lg" className="shadow-lg shadow-indigo-500/25 gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>Post New Requisition</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
              <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <span className="text-xs text-slate-400 font-medium">Active Requisitions</span>
                <p className="text-2xl font-bold text-white mt-0.5">{activeJobs}</p>
              </div>
              <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <span className="text-xs text-indigo-300 font-medium">Total Applicants</span>
                <p className="text-2xl font-bold text-indigo-400 mt-0.5">{totalApplicants}</p>
              </div>
              <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <span className="text-xs text-amber-300 font-medium">Pending Review</span>
                <p className="text-2xl font-bold text-amber-400 mt-0.5">{inReview}</p>
              </div>
              <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <span className="text-xs text-emerald-300 font-medium">In Interview Stage</span>
                <p className="text-2xl font-bold text-emerald-400 mt-0.5">{inInterview}</p>
              </div>
            </div>
          </div>

          {/* Requisitions Pipeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Job Requisitions & Active Pipelines</h2>
                <p className="text-xs text-slate-500">Select a job requisition to open the candidate Kanban board</p>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Job Requisitions Posted Yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Post your first role to start receiving qualified applicant submissions and managing candidate pipelines.
                </p>
                <Link href="/jobs/post">
                  <Button variant="primary">Create Job Posting</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {job.status}
                        </span>

                        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{job.application_count || 0} applicants</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 line-clamp-1 mt-1">
                        {job.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        {job.department && <span>{job.department}</span>}
                        {job.work_mode && <span className="capitalize">• {job.work_mode.replace('_', ' ')}</span>}
                        {job.location_city && (
                          <span className="flex items-center gap-1">
                            • <MapPin className="w-3 h-3" />
                            {job.location_city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800"
                      >
                        View Details
                      </Link>

                      <Link href={`/jobs/${job.id}/applications`}>
                        <Button variant="primary" size="sm" className="gap-1 text-xs">
                          <span>Review Pipeline</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Candidates Across All Jobs */}
          {recentApps.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Applications Stream</h2>
                  <p className="text-xs text-slate-500">Latest candidate submissions across all your posted positions</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Target Requisition</th>
                      <th className="py-3.5 px-4">Applied Date</th>
                      <th className="py-3.5 px-4">Stage Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentApps.map(app => {
                      const candidateUser = app.candidate_profiles?.users;
                      const candidateProfile = app.candidate_profiles;

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={candidateUser?.avatar_url || undefined}
                                alt={candidateUser?.full_name || 'Candidate'}
                                fallback={candidateUser?.full_name?.charAt(0) || 'C'}
                                size="sm"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{candidateUser?.full_name || 'Anonymous'}</div>
                                <div className="text-slate-400 text-[11px]">{candidateProfile?.headline || candidateUser?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{app.jobs?.title || 'Position'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(app.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/jobs/${app.job_id}/applications`}>
                              <Button variant="outline" size="sm" className="text-xs gap-1">
                                <span>Pipeline</span>
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // CANDIDATE VIEW
  // ==========================================
  const activeCount = applications.filter(a => ['submitted', 'screening', 'under_review'].includes(a.status)).length;
  const interviewCount = applications.filter(a => ['interview_scheduled', 'interviewed', 'offer_extended'].includes(a.status)).length;
  const archivedCount = applications.filter(a => ['rejected', 'withdrawn', 'offer_declined', 'offer_accepted'].includes(a.status)).length;

  const filteredApplications = applications.filter((app) => {
    if (filterTab === 'active') {
      return ['submitted', 'screening', 'under_review'].includes(app.status);
    }
    if (filterTab === 'interviews') {
      return ['interview_scheduled', 'interviewed', 'offer_extended'].includes(app.status);
    }
    if (filterTab === 'archived') {
      return ['rejected', 'withdrawn', 'offer_declined', 'offer_accepted'].includes(app.status);
    }
    return true;
  });

  return (
    <DashboardLayout userRole="candidate">
      <div className="space-y-8">
        {/* Page Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
                <TrendingUp className="w-3.5 h-3.5" />
                Hiring Pipeline
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Application Tracker
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                Monitor live recruiter activity, scheduled interviews, and incoming offers with real-time status tracking.
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="primary" size="lg" className="shadow-lg shadow-indigo-500/25 gap-2 shrink-0">
                <Briefcase className="w-4 h-4" />
                Explore Open Roles
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Total Applications</span>
              <p className="text-2xl font-bold text-white mt-0.5">{applications.length}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <span className="text-xs text-amber-300 font-medium">In Review</span>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">{activeCount}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <span className="text-xs text-indigo-300 font-medium">Interviews & Offers</span>
              <p className="text-2xl font-bold text-indigo-400 mt-0.5">{interviewCount}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Archived</span>
              <p className="text-2xl font-bold text-slate-300 mt-0.5">{archivedCount}</p>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80">
          {[
            { id: 'all', label: 'All Submissions', count: applications.length },
            { id: 'active', label: 'In Review', count: activeCount },
            { id: 'interviews', label: 'Interviews & Offers', count: interviewCount },
            { id: 'archived', label: 'Archived', count: archivedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as typeof filterTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  filterTab === tab.id
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content Section */}
        {filteredApplications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No applications in this category"
            description="When you apply to jobs on TalentSphere, your interview stages and offer updates appear here."
            action={
              <Link href="/jobs">
                <Button variant="primary">Browse Available Jobs</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((app) => {
              const job = app.jobs;
              const org = job?.organizations;
              const appliedDate = app.applied_at
                ? new Date(app.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                      <Avatar
                        src={org?.logo_url || undefined}
                        alt={org?.name || 'Company'}
                        fallback={org?.name?.charAt(0) || 'C'}
                        size="md"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-600">
                          {org?.name || 'Employer'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 capitalize">
                          {job?.work_mode?.replace('_', ' ') || 'Remote'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {job?.title || 'Role'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                        {job?.location_city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location_city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied on {appliedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/applications/${app.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      {['submitted', 'screening'].includes(app.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWithdraw(app.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
