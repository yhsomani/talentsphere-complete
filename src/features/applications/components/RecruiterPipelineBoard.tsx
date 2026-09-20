'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { applicationService, type ApplicationRecord, type ScorecardRecord } from '@/services/application.service';
import { createBrowserClient } from '@/lib/supabase';
import { Button, Avatar, Badge } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Users,
  Search,
  ArrowRight,
  XCircle,
  Clock,
  MapPin,
  FileText,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Sparkles,
  LayoutGrid,
  List,
  RefreshCw,
  Send,
  History,
  Award,
  Plus,
  CheckCircle
} from 'lucide-react';

interface RecruiterPipelineBoardProps {
  jobId: string;
  jobTitle?: string;
  initialApplications: ApplicationRecord[];
  onRefresh?: () => void;
}

type PipelineStageKey =
  | 'submitted'
  | 'screening'
  | 'under_review'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_extended'
  | 'rejected';

interface StageDefinition {
  key: PipelineStageKey;
  label: string;
  badgeVariant: 'info' | 'warning' | 'default' | 'secondary' | 'success' | 'danger' | 'purple';
  color: string;
  bgLight: string;
}

const PIPELINE_STAGES: StageDefinition[] = [
  { key: 'submitted', label: 'New Applied', badgeVariant: 'info', color: 'text-sky-600', bgLight: 'bg-sky-50/70 border-sky-200/80' },
  { key: 'screening', label: 'Screening', badgeVariant: 'warning', color: 'text-amber-600', bgLight: 'bg-amber-50/70 border-amber-200/80' },
  { key: 'under_review', label: 'Under Review', badgeVariant: 'purple', color: 'text-indigo-600', bgLight: 'bg-indigo-50/70 border-indigo-200/80' },
  { key: 'interview_scheduled', label: 'Interview Scheduled', badgeVariant: 'secondary', color: 'text-purple-600', bgLight: 'bg-purple-50/70 border-purple-200/80' },
  { key: 'interviewed', label: 'Interviewed', badgeVariant: 'secondary', color: 'text-fuchsia-600', bgLight: 'bg-fuchsia-50/70 border-fuchsia-200/80' },
  { key: 'offer_extended', label: 'Offer & Hired', badgeVariant: 'success', color: 'text-emerald-600', bgLight: 'bg-emerald-50/70 border-emerald-200/80' },
  { key: 'rejected', label: 'Not Selected', badgeVariant: 'danger', color: 'text-rose-600', bgLight: 'bg-rose-50/70 border-rose-200/80' },
];

export default function RecruiterPipelineBoard({
  jobId: _jobId,
  jobTitle,
  initialApplications,
  onRefresh,
}: RecruiterPipelineBoardProps) {
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  interface ActivityLogEntry {
    id: string;
    action: string;
    created_at: string;
    previous_value?: unknown;
    new_value?: unknown;
  }

  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewerNote, setReviewerNote] = useState('');
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Scorecards state
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'scorecards'>('overview');
  const [scorecards, setScorecards] = useState<ScorecardRecord[]>([]);
  const [isLoadingScorecards, setIsLoadingScorecards] = useState(false);
  const [showNewScorecardForm, setShowNewScorecardForm] = useState(false);
  const [scorecardDecision, setScorecardDecision] = useState<'strong_yes' | 'yes' | 'no' | 'strong_no'>('yes');
  const [overallScore, setOverallScore] = useState(8);
  const [technicalScore, setTechnicalScore] = useState(8);
  const [communicationScore, setCommunicationScore] = useState(8);
  const [cultureFitScore, setCultureFitScore] = useState(8);
  const [scorecardComments, setScorecardComments] = useState('');
  const [scorecardStrengths, setScorecardStrengths] = useState('');
  const [scorecardWeaknesses, setScorecardWeaknesses] = useState('');
  const [scorecardWouldRehire, setScorecardWouldRehire] = useState(true);
  const [isSavingScorecard, setIsSavingScorecard] = useState(false);

  // Sync state if initialApplications updates
  React.useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  // Open candidate details & fetch activity log + scorecards
  const handleOpenEvaluation = async (app: ApplicationRecord) => {
    setSelectedApp(app);
    setReviewerNote('');
    setActiveModalTab('overview');
    setShowNewScorecardForm(false);
    setIsLoadingLogs(true);
    setIsLoadingScorecards(true);
    try {
      const [details, scs] = await Promise.all([
        applicationService.getApplicationById(app.id),
        applicationService.getScorecards(app.id)
      ]);
      setActivityLogs(details.activityLog || []);
      setScorecards(scs || []);
    } catch {
      setActivityLogs([]);
      setScorecards([]);
    } finally {
      setIsLoadingLogs(false);
      setIsLoadingScorecards(false);
    }
  };

  // Submit interview scorecard evaluation
  const handleSaveScorecard = async () => {
    if (!selectedApp) return;
    setIsSavingScorecard(true);
    try {
      const supabase = createBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      const interviewerId = authData.user?.id || '00000000-0000-0000-0000-000000000000';

      const created = await applicationService.createScorecard({
        applicationId: selectedApp.id,
        interviewerId,
        stageId: selectedApp.current_stage_id,
        overallDecision: scorecardDecision,
        overallScore,
        technicalScore,
        communicationScore,
        cultureFitScore,
        comments: scorecardComments,
        strengths: scorecardStrengths.split(',').map(s => s.trim()).filter(Boolean),
        weaknesses: scorecardWeaknesses.split(',').map(s => s.trim()).filter(Boolean),
        wouldRehire: scorecardWouldRehire,
      });

      if (created) {
        setScorecards(prev => [created, ...prev]);
      }
      setShowNewScorecardForm(false);
      setScorecardComments('');
      setScorecardStrengths('');
      setScorecardWeaknesses('');
    } catch (err) {
      console.error('Failed to save scorecard:', err);
      alert('Could not save scorecard. Please verify database permissions.');
    } finally {
      setIsSavingScorecard(false);
    }
  };

  // Stage change handler
  const handleStageChange = async (applicationId: string, newStatus: PipelineStageKey, note?: string) => {
    setIsUpdating(true);
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus, null, note);
      
      // Update local state optimistically
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: newStatus, updated_at: new Date().toISOString() }
            : app
        )
      );

      if (selectedApp && selectedApp.id === applicationId) {
        setSelectedApp(prev => (prev ? { ...prev, status: newStatus } : null));
        // Append to activity log preview
        setActivityLogs(prev => [
          {
            id: 'temp-' + Date.now(),
            action: `status_changed_to_${newStatus}`,
            created_at: new Date().toISOString(),
            new_value: { status: newStatus, note: note || null },
          },
          ...prev,
        ]);
      }
      setReviewerNote('');
    } catch (err) {
      console.error('Failed to update stage:', err);
      alert('Could not update stage. Please check database permissions.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Next stage calculation helper
  const getNextStage = (currentStatus: string): PipelineStageKey | null => {
    switch (currentStatus) {
      case 'submitted':
        return 'screening';
      case 'screening':
        return 'under_review';
      case 'under_review':
        return 'interview_scheduled';
      case 'interview_scheduled':
        return 'interviewed';
      case 'interviewed':
        return 'offer_extended';
      default:
        return null;
    }
  };

  // Filter applications by search
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const candidateName = app.candidate_profiles?.users?.full_name || '';
      const candidateEmail = app.candidate_profiles?.users?.email || '';
      const headline = app.candidate_profiles?.headline || '';
      const query = searchQuery.toLowerCase();
      return (
        candidateName.toLowerCase().includes(query) ||
        candidateEmail.toLowerCase().includes(query) ||
        headline.toLowerCase().includes(query)
      );
    });
  }, [applications, searchQuery]);

  // Group applications by stage
  const appsByStage = useMemo(() => {
    const grouped: Record<PipelineStageKey, ApplicationRecord[]> = {
      submitted: [],
      screening: [],
      under_review: [],
      interview_scheduled: [],
      interviewed: [],
      offer_extended: [],
      rejected: [],
    };

    filteredApps.forEach(app => {
      let stageKey: PipelineStageKey = 'submitted';
      if (
        app.status === 'screening' ||
        app.status === 'under_review' ||
        app.status === 'interview_scheduled' ||
        app.status === 'interviewed' ||
        app.status === 'rejected'
      ) {
        stageKey = app.status;
      } else if (
        app.status === 'offer_extended' ||
        app.status === 'offer_accepted' ||
        app.status === 'offer_declined'
      ) {
        stageKey = 'offer_extended';
      } else if (app.status === 'withdrawn') {
        stageKey = 'rejected';
      }
      grouped[stageKey].push(app);
    });

    return grouped;
  }, [filteredApps]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = applications.length;
    const inReview = applications.filter(a => ['submitted', 'screening', 'under_review'].includes(a.status)).length;
    const interviews = applications.filter(a => ['interview_scheduled', 'interviewed'].includes(a.status)).length;
    const offers = applications.filter(a => ['offer_extended', 'offer_accepted'].includes(a.status)).length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    return { total, inReview, interviews, offers, rejected };
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Recruiter Candidate Pipeline</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {jobTitle ? `Applicants: ${jobTitle}` : 'Candidate Pipeline Review'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review applicant qualifications, change pipeline stages, and manage the hiring workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="gap-2 text-slate-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </Button>
            )}

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Total Applicants</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{metrics.total}</div>
          </div>
          <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/80">
            <span className="text-xs font-medium text-amber-700">In Review</span>
            <div className="text-xl font-bold text-amber-900 mt-0.5">{metrics.inReview}</div>
          </div>
          <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/80">
            <span className="text-xs font-medium text-purple-700">Interviews</span>
            <div className="text-xl font-bold text-purple-900 mt-0.5">{metrics.interviews}</div>
          </div>
          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/80">
            <span className="text-xs font-medium text-emerald-700">Offers Extended</span>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">{metrics.offers}</div>
          </div>
          <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100/80">
            <span className="text-xs font-medium text-rose-700">Not Selected</span>
            <div className="text-xl font-bold text-rose-900 mt-0.5">{metrics.rejected}</div>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="mt-4 pt-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidate by name, title, or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredApps.length}</strong> candidates
          </span>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {PIPELINE_STAGES.map(stage => {
            const stageApps = appsByStage[stage.key] || [];
            return (
              <div
                key={stage.key}
                className="w-80 shrink-0 flex flex-col bg-slate-50/70 rounded-2xl border border-slate-200/70 p-3"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.color.replace('text-', 'bg-')}`} />
                    <span className="text-xs font-bold text-slate-800 tracking-tight">{stage.label}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full">
                    {stageApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-340px)] pr-1">
                  {stageApps.length === 0 ? (
                    <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-400 font-medium">No candidates in this stage</p>
                    </div>
                  ) : (
                    stageApps.map(app => {
                      const candidateUser = app.candidate_profiles?.users;
                      const candidateProfile = app.candidate_profiles;
                      const nextStage = getNextStage(stage.key);

                      return (
                        <div
                          key={app.id}
                          className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={candidateUser?.avatar_url || undefined}
                                alt={candidateUser?.full_name || 'Candidate'}
                                fallback={candidateUser?.full_name?.charAt(0) || 'C'}
                                size="sm"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                  {candidateUser?.full_name || 'Anonymous Candidate'}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {candidateProfile?.headline || candidateUser?.email || 'Candidate'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Location & Applied Date */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 mb-3">
                            {candidateProfile?.location_city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {candidateProfile.location_city}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                            <button
                              onClick={() => handleOpenEvaluation(app)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 py-1"
                            >
                              <span>Evaluate</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            <div className="flex items-center gap-1">
                              {stage.key !== 'rejected' && (
                                <button
                                  onClick={() => handleStageChange(app.id, 'rejected', 'Candidate rejected from review')}
                                  title="Reject Candidate"
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              {nextStage && (
                                <button
                                  onClick={() => handleStageChange(app.id, nextStage)}
                                  title={`Advance to ${PIPELINE_STAGES.find(s => s.key === nextStage)?.label}`}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4">Resume</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => {
                  const candidateUser = app.candidate_profiles?.users;
                  const candidateProfile = app.candidate_profiles;
                  const currentStageDef = PIPELINE_STAGES.find(s => s.key === app.status) || PIPELINE_STAGES[0];

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
                      <td className="py-3.5 px-4 text-slate-500">
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={currentStageDef.badgeVariant}>
                          {currentStageDef.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {app.resume_url ? (
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={app.status}
                            onChange={e => handleStageChange(app.id, e.target.value as PipelineStageKey)}
                            disabled={isUpdating}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
                          >
                            {PIPELINE_STAGES.map(st => (
                              <option key={st.key} value={st.key}>
                                Move to: {st.label}
                              </option>
                            ))}
                          </select>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenEvaluation(app)}
                            className="text-xs py-1"
                          >
                            Evaluate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CANDIDATE EVALUATION MODAL / DRAWER */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <Avatar
                  src={selectedApp.candidate_profiles?.users?.avatar_url || undefined}
                  alt={selectedApp.candidate_profiles?.users?.full_name || 'Candidate Profile'}
                  fallback={selectedApp.candidate_profiles?.users?.full_name?.charAt(0) || 'C'}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedApp.candidate_profiles?.users?.full_name || 'Candidate Profile'}
                    </h2>
                    <Badge variant={PIPELINE_STAGES.find(s => s.key === selectedApp.status)?.badgeVariant || 'default'}>
                      {PIPELINE_STAGES.find(s => s.key === selectedApp.status)?.label || selectedApp.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {selectedApp.candidate_profiles?.headline || selectedApp.candidate_profiles?.users?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeModalTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Overview & Activity</span>
              </button>
              <button
                onClick={() => setActiveModalTab('scorecards')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeModalTab === 'scorecards'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Interview Scorecards ({scorecards.length})</span>
              </button>
            </div>

            {/* Modal Body - Overview */}
            {activeModalTab === 'overview' && (
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Quick Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Applied On</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedApp.applied_at ? new Date(selectedApp.applied_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Recent'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedApp.candidate_profiles?.location_city || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Resume Attachment</span>
                  <div className="mt-0.5">
                    {selectedApp.resume_url ? (
                      <a
                        href={selectedApp.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Resume PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">None attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApp.cover_letter && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Candidate Statement / Cover Letter</span>
                  </h3>
                  <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}

              {/* Portfolio Links */}
              {selectedApp.portfolio_urls && selectedApp.portfolio_urls.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Portfolio & Project References
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.portfolio_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-indigo-600 hover:underline shadow-2xs font-medium"
                      >
                        <span>{url}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Transition Controls */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Advance Pipeline Stage</span>
                  </h3>
                  <span className="text-xs text-indigo-700 font-medium">Select new status:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PIPELINE_STAGES.map(st => {
                    const isCurrent = selectedApp.status === st.key;
                    return (
                      <button
                        key={st.key}
                        onClick={() => handleStageChange(selectedApp.id, st.key, reviewerNote)}
                        disabled={isCurrent || isUpdating}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Optional Reviewer Feedback / Internal Note:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={reviewerNote}
                      onChange={e => setReviewerNote(e.target.value)}
                      placeholder="e.g. Cleared technical screening, ready for panel interview..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStageChange(selectedApp.id, selectedApp.status as PipelineStageKey, reviewerNote)}
                      disabled={!reviewerNote.trim() || isUpdating}
                      className="text-xs gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Activity Audit Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pipeline Activity Log</span>
                </h3>

                {isLoadingLogs ? (
                  <div className="py-4 text-center">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No activity log entries recorded yet.</p>
                ) : (
                  <div className="space-y-2 border-l-2 border-slate-100 pl-4 ml-2">
                    {activityLogs.map((log, idx) => (
                      <div key={log.id || idx} className="text-xs relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white" />
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {typeof log.new_value === 'object' && log.new_value !== null && 'note' in log.new_value && Boolean((log.new_value as { note?: string }).note) && (
                          <p className="text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                            &quot;{(log.new_value as { note?: string }).note}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Modal Body - Scorecards */}
            {activeModalTab === 'scorecards' && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Scorecards Header & Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Interviewer Rubric Evaluations</h3>
                    <p className="text-xs text-slate-500">Structured competency assessments and hiring recommendations.</p>
                  </div>
                  {!showNewScorecardForm && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowNewScorecardForm(true)}
                      className="text-xs gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Scorecard</span>
                    </Button>
                  )}
                </div>

                {/* New Scorecard Form */}
                {showNewScorecardForm && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-indigo-100 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span>Submit Candidate Evaluation</span>
                      </h4>
                      <button
                        onClick={() => setShowNewScorecardForm(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Overall Recommendation */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Hiring Recommendation:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: 'strong_yes', label: 'Strong Yes', color: 'bg-emerald-600 text-white' },
                          { key: 'yes', label: 'Yes (Hire)', color: 'bg-indigo-600 text-white' },
                          { key: 'no', label: 'No (Decline)', color: 'bg-amber-600 text-white' },
                          { key: 'strong_no', label: 'Strong No', color: 'bg-rose-600 text-white' },
                        ].map(rec => (
                          <button
                            key={rec.key}
                            type="button"
                            onClick={() => setScorecardDecision(rec.key as 'strong_yes' | 'yes' | 'no' | 'strong_no')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                              scorecardDecision === rec.key
                                ? `${rec.color} border-transparent shadow-xs`
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {rec.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Numeric Competency Ratings */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Overall: <span className="font-bold text-indigo-600">{overallScore}/10</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={overallScore}
                          onChange={e => setOverallScore(Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Technical: <span className="font-bold text-indigo-600">{technicalScore}/10</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={technicalScore}
                          onChange={e => setTechnicalScore(Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Communication: <span className="font-bold text-indigo-600">{communicationScore}/10</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={communicationScore}
                          onChange={e => setCommunicationScore(Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Culture Fit: <span className="font-bold text-indigo-600">{cultureFitScore}/10</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={cultureFitScore}
                          onChange={e => setCultureFitScore(Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Key Strengths (comma-separated):
                        </label>
                        <input
                          type="text"
                          value={scorecardStrengths}
                          onChange={e => setScorecardStrengths(e.target.value)}
                          placeholder="e.g. Clean Code, Systems Design, Ownership"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Growth Areas (comma-separated):
                        </label>
                        <input
                          type="text"
                          value={scorecardWeaknesses}
                          onChange={e => setScorecardWeaknesses(e.target.value)}
                          placeholder="e.g. Kubernetes, Observability"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Detailed Notes */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Interviewer Evaluation Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={scorecardComments}
                        onChange={e => setScorecardComments(e.target.value)}
                        placeholder="Detailed qualitative feedback on problem solving, architecture design, and technical depth..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scorecardWouldRehire}
                          onChange={e => setScorecardWouldRehire(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Recommend candidate for future hiring</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewScorecardForm(false)}
                          disabled={isSavingScorecard}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveScorecard}
                          disabled={isSavingScorecard}
                          className="text-xs gap-1.5"
                        >
                          {isSavingScorecard ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Save Scorecard</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scorecards Feed */}
                {isLoadingScorecards ? (
                  <div className="py-8 text-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : scorecards.length === 0 && !showNewScorecardForm ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-slate-700">No scorecards submitted yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Record structured interview feedback and competency scores for this candidate.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowNewScorecardForm(true)}
                      className="text-xs mt-4 gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Scorecard</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scorecards.map((sc, index) => {
                      const decisionBadge = {
                        strong_yes: { label: 'Strong Yes', variant: 'success' as const },
                        yes: { label: 'Yes (Hire)', variant: 'info' as const },
                        no: { label: 'No (Decline)', variant: 'warning' as const },
                        strong_no: { label: 'Strong No', variant: 'danger' as const },
                      }[sc.overall_decision] || { label: sc.overall_decision, variant: 'default' as const };

                      return (
                        <div
                          key={sc.id || index}
                          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={sc.users?.avatar_url || undefined}
                                alt={sc.users?.full_name || 'Interviewer'}
                                fallback={sc.users?.full_name?.charAt(0) || 'I'}
                                size="sm"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">
                                  {sc.users?.full_name || 'Interviewer Scorecard'}
                                </h4>
                                <span className="text-[11px] text-slate-400">
                                  {sc.submitted_at
                                    ? new Date(sc.submitted_at).toLocaleDateString('en-US', {
                                        dateStyle: 'medium',
                                      })
                                    : 'Recent'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                {sc.overall_score !== null ? `${sc.overall_score}/10` : 'Score N/A'}
                              </span>
                              <Badge variant={decisionBadge.variant}>{decisionBadge.label}</Badge>
                            </div>
                          </div>

                          {/* Scores breakdown */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                            {sc.technical_score !== null && (
                              <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Technical</span>
                                <span className="font-bold text-slate-800">{sc.technical_score}/10</span>
                              </div>
                            )}
                            {sc.communication_score !== null && (
                              <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Communication</span>
                                <span className="font-bold text-slate-800">{sc.communication_score}/10</span>
                              </div>
                            )}
                            {sc.culture_fit_score !== null && (
                              <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Culture Fit</span>
                                <span className="font-bold text-slate-800">{sc.culture_fit_score}/10</span>
                              </div>
                            )}
                            {sc.problem_solving_score !== null && (
                              <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Problem Solving</span>
                                <span className="font-bold text-slate-800">{sc.problem_solving_score}/10</span>
                              </div>
                            )}
                          </div>

                          {/* Comments */}
                          {sc.comments && (
                            <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100 italic">
                              &quot;{sc.comments}&quot;
                            </p>
                          )}

                          {/* Strengths & Weaknesses chips */}
                          {(sc.strengths?.length || 0) > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                              <span className="text-[11px] font-bold text-emerald-700">Strengths:</span>
                              {sc.strengths?.map((str, sIdx) => (
                                <span key={sIdx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-medium border border-emerald-100">
                                  {str}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/candidates/profile`}
                target="_blank"
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>View Full Candidate Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
              >
                Close Evaluation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
