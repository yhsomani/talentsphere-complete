'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { applicationService, type ApplicationRecord } from '@/services/application.service';
import { candidateService } from '@/services/candidate.service';
import { createBrowserClient } from '@/lib/supabase';
import { Button, Avatar, Badge, Card, EmptyState } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
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

        const profileResult = await candidateService.getProfile(user.id);
        if (!profileResult?.profile?.id) {
          setError('Candidate profile not found. Please complete your profile first.');
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
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-50/80 border border-red-200 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-900 mb-1">Access Note</h3>
            <p className="text-sm text-red-700 mb-6">{error}</p>
            <Link href="/auth/signin?redirect=/applications">
              <Button variant="primary">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title={filterTab === 'all' ? 'No applications yet' : `No applications in "${filterTab}"`}
            description={
              filterTab === 'all'
                ? "You haven't submitted any applications yet. Explore verified tech roles and launch your next career milestone."
                : `You don't have any applications matching the selected criteria.`
            }
            action={
              <Link href="/jobs">
                <Button variant="primary" className="gap-2">
                  Browse Opportunities
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const appliedDate = app.applied_at
                ? new Date(app.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';

              return (
                <Card
                  key={app.id}
                  hover
                  className="p-6 transition-all duration-200 border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                      <Avatar
                        src={app.jobs?.organizations?.logo_url || undefined}
                        alt={app.jobs?.organizations?.name || 'Company'}
                        fallback={app.jobs?.organizations?.name?.charAt(0) || 'C'}
                        size="md"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/jobs/${app.job_id}`}
                          className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {app.jobs?.title || 'Position'}
                        </Link>
                        {getStatusBadge(app.status)}
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        {app.jobs?.organizations?.name || 'Organization'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {app.jobs?.work_mode === 'remote' ? 'Remote' : (app.jobs?.location_city || 'Flexible')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Applied on {appliedDate}
                        </span>
                        {app.hiring_pipeline_stages?.name && (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            <Sparkles className="w-3 h-3" />
                            Stage: {app.hiring_pipeline_stages.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <Link href={`/applications/${app.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        Application Details
                      </Button>
                    </Link>

                    {['submitted', 'screening', 'under_review'].includes(app.status) && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
