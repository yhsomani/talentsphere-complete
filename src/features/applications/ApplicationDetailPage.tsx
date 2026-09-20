'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { applicationService, type ApplicationRecord } from '@/services/application.service';
import { Button, Avatar, Badge, Card } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  CircleDot,
  Building2,
  Sparkles
} from 'lucide-react';

interface ApplicationDetailPageProps {
  applicationId: string;
}

export default function ApplicationDetailPage({ applicationId }: ApplicationDetailPageProps) {
  const [data, setData] = useState<{
    application: ApplicationRecord;
    activityLog: Array<{ id: string; action: string; created_at: string; previous_value?: unknown; new_value?: unknown }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await applicationService.getApplicationById(applicationId);
        setData(res);
      } catch (err) {
        console.error('Error fetching application detail:', err);
        setError('Failed to load application details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchDetail();
    }
  }, [applicationId]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="candidate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout userRole="candidate">
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'This application does not exist or you do not have permission to view it.'}</p>
          <Link href="/applications">
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Applications
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { application, activityLog } = data;
  const appliedDate = application.applied_at
    ? new Date(application.applied_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const pipelineStages = [
    { key: 'submitted', label: 'Application Submitted', desc: 'Received & logged' },
    { key: 'screening', label: 'Resume Screening', desc: 'Recruiter evaluation' },
    { key: 'interview_scheduled', label: 'Technical & Team Interviews', desc: 'Interactive rounds' },
    { key: 'offer_extended', label: 'Decision & Offer', desc: 'Compensation review' },
  ];

  const getStageStatus = (stageKey: string) => {
    const order = ['submitted', 'screening', 'interview_scheduled', 'offer_extended'];
    const currentMapped = application.status === 'under_review' ? 'screening' : application.status === 'interviewed' ? 'interview_scheduled' : application.status;
    const currentIndex = order.indexOf(currentMapped);
    const stageIndex = order.indexOf(stageKey);

    if (application.status === 'rejected' || application.status === 'withdrawn') {
      return stageIndex === 0 ? 'completed' : 'inactive';
    }

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
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

  return (
    <DashboardLayout userRole="candidate">
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Applications
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md">
            {application.jobs?.title || 'Application Details'}
          </span>
        </div>

        {/* Main Job Overview Card */}
        <Card className="p-6 sm:p-8 border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                <Avatar
                  src={application.jobs?.organizations?.logo_url || undefined}
                  alt={application.jobs?.organizations?.name || 'Company'}
                  fallback={application.jobs?.organizations?.name?.charAt(0) || 'C'}
                  size="lg"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {application.jobs?.title || 'Applied Position'}
                </h1>
                <p className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {application.jobs?.organizations?.name || 'Company'}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {application.jobs?.work_mode === 'remote' ? 'Remote' : (application.jobs?.location_city || 'On-site')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Submitted on {appliedDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status:</span>
                {getStatusBadge(application.status)}
              </div>
              <Link
                href={`/jobs/${application.job_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg border border-indigo-200/50 transition-colors"
              >
                View Job Posting
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Hiring Stage Stepper Visualizer */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Pipeline Progression
              </h3>
              {application.hiring_pipeline_stages?.name && (
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  Current Stage: {application.hiring_pipeline_stages.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {pipelineStages.map((stage, idx) => {
                const status = getStageStatus(stage.key);
                return (
                  <div
                    key={stage.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      status === 'completed'
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                        : status === 'current'
                        ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200/70 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${
                        status === 'completed' ? 'text-emerald-700' : status === 'current' ? 'text-indigo-700' : 'text-slate-400'
                      }`}>
                        Stage {idx + 1}
                      </span>
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : status === 'current' ? (
                        <CircleDot className="w-4 h-4 text-indigo-600 animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <p className={`text-sm font-bold ${
                      status === 'completed' ? 'text-emerald-900' : status === 'current' ? 'text-indigo-950' : 'text-slate-600'
                    }`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Application Details Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Letter Card */}
            <Card className="p-6 border-slate-200/80 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Cover Letter
              </h3>
              {application.cover_letter ? (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 font-normal">
                  {application.cover_letter}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No cover letter submitted for this role.</p>
              )}
            </Card>

            {/* Activity History */}
            {activityLog.length > 0 && (
              <Card className="p-6 border-slate-200/80 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Audit & Activity Log
                </h3>
                <div className="divide-y divide-slate-100">
                  {activityLog.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="font-semibold text-slate-800 capitalize">
                          {item.action.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-slate-500">
                        {new Date(item.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Links & Attachments Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200/80 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900">Submission Assets</h3>

              {application.resume_url ? (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Resume File</span>
                  <a
                    href={application.resume_url.startsWith('http') ? application.resume_url : `https://${application.resume_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      View Resume
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No resume URL linked</p>
              )}

              {application.portfolio_urls && application.portfolio_urls.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Portfolios & Profiles</span>
                  <div className="space-y-2">
                    {application.portfolio_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-all"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <LinkIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{url}</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
