'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useJob } from './hooks/useJobs';
import ApplicationModal from '@/features/applications/components/ApplicationModal';
import { applicationService, type ApplicationRecord } from '@/services/application.service';
import { candidateService } from '@/services/candidate.service';
import { createBrowserClient } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Badge, Avatar } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Bookmark,
  Share2,
  CheckCircle2,
  ExternalLink,
  Users,
  Check
} from 'lucide-react';

interface JobDetailPageProps {
  jobId: string;
}

export default function JobDetailPage({ jobId }: JobDetailPageProps) {
  const router = useRouter();
  const { job, isLoading, error, isBookmarked, bookmark, removeBookmark, refresh } = useJob(jobId);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [existingApplication, setExistingApplication] = useState<ApplicationRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Check if user has already applied
  useEffect(() => {
    const checkApplied = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const profileResult = await candidateService.getProfile(user.id);
        if (profileResult?.profile?.id) {
          const app = await applicationService.checkHasApplied(jobId, profileResult.profile.id);
          setExistingApplication(app);
        }
      } catch (err) {
        console.error('Error checking existing application:', err);
      }
    };

    if (jobId) {
      checkApplied();
    }
  }, [jobId]);

  const handleBookmarkToggle = async () => {
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark();
      } else {
        await bookmark();
      }
    } catch {
      // Handled in hook
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleApplyClick = async () => {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth/signin?redirect=/jobs/${jobId}`);
      return;
    }
    setIsApplyModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="candidate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout userRole="candidate">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Not Found</h2>
          <p className="text-slate-600 mb-6">The requisition you are looking for does not exist or has been closed.</p>
          <Link href="/jobs">
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const formatSalary = (min?: number | null, max?: number | null, currency = 'USD', period = 'yearly') => {
    if (!min && !max) return 'Competitive compensation';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)} / ${period}`;
    if (min) return `From ${formatter.format(min)} / ${period}`;
    return `Up to ${formatter.format(max!)} / ${period}`;
  };

  const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recently';

  return (
    <DashboardLayout userRole="candidate">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb & Controls */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share job"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                    <Avatar
                      src={job.organization?.logo_url}
                      alt={job.organization?.name || 'Company Logo'}
                      fallback={job.organization?.name?.charAt(0) || 'C'}
                      size="lg"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-600">
                      <span className="font-semibold text-gray-800">
                        {job.organization?.name || 'Company'}
                      </span>
                      {job.organization?.industry && (
                        <>
                          <span>•</span>
                          <span className="text-sm">{job.organization.industry}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={handleBookmarkToggle}
                    disabled={bookmarkLoading}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isBookmarked
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share job"
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Meta Tags / Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-6 border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.work_mode === 'remote' ? 'Remote' : (job.location_city || 'On-site')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.job_type ? job.job_type.replace('_', ' ') : 'Full-time'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  {formatSalary(job.salary_min, job.salary_max, job.currency, job.salary_period)}
                </span>
              </div>

              {/* Apply / Status CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-100">
                {existingApplication ? (
                  <div className="w-full sm:w-auto flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold">Applied for this job</p>
                      <p className="text-xs text-emerald-700">
                        Status: <span className="capitalize font-medium">{existingApplication.status}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto px-8"
                    onClick={handleApplyClick}
                  >
                    Apply for this position
                  </Button>
                )}
                <p className="text-xs text-gray-500">
                  Posted on {postedDate} • {job.application_count || 0} applicants
                </p>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">About the Role</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {job.description}
                </div>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements &amp; Qualifications</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Required &amp; Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" size="md">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits & Perks */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Benefits &amp; Perks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Overview Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Job Overview</h3>
              
              <div className="space-y-3.5 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Date Posted</p>
                    <p className="font-semibold text-gray-800">{postedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold text-gray-800">
                      {job.work_mode === 'remote' ? 'Remote Worldwide' : (job.location_city || 'Flexible')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Work Mode</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {job.work_mode || 'Remote'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Experience Level</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {job.experience_level || 'Mid Level'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total Applicants</p>
                    <p className="font-semibold text-gray-800">{job.application_count || 0}</p>
                  </div>
                </div>
              </div>

              {!existingApplication && (
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleApplyClick}
                  >
                    Apply Now
                  </Button>
                </div>
              )}
            </div>

            {/* Company Card */}
            {job.organization && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900">About the Organization</h3>

                <div className="flex items-center gap-3">
                  <Avatar
                    src={job.organization.logo_url}
                    alt={job.organization.name}
                    fallback={job.organization.name.charAt(0)}
                    size="md"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{job.organization.name}</h4>
                    {job.organization.industry && (
                      <p className="text-xs text-gray-500">{job.organization.industry}</p>
                    )}
                  </div>
                </div>

                {job.organization.description && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {job.organization.description}
                  </p>
                )}

                <div className="space-y-2 pt-2 text-xs text-gray-500">
                  {job.organization.size && (
                    <p>Company Size: <span className="font-semibold text-gray-700">{job.organization.size}</span></p>
                  )}
                  {job.organization.website && (
                    <a
                      href={job.organization.website.startsWith('http') ? job.organization.website : `https://${job.organization.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Visit Website
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Submission Modal */}
      <ApplicationModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setIsApplyModalOpen(false);
          refresh();
          // Re-check application status
          setExistingApplication({
            id: 'new',
            job_id: job.id,
            candidate_profile_id: '',
            status: 'submitted',
            cover_letter: null,
            resume_url: null,
            portfolio_urls: null,
            answers_to_questions: null,
            referral_source: null,
            current_stage_id: null,
            applied_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reviewed_at: null,
            decision_at: null
          });
        }}
      />
      </div>
    </DashboardLayout>
  );
}
