'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Badge } from '@/components/ui';
import { applicationService } from '@/services/application.service';
import { candidateService } from '@/services/candidate.service';
import { createBrowserClient } from '@/lib/supabase';
import type { JobListing, ResumeItem } from '@/types';
import {
  CheckCircle2,
  X,
  AlertCircle,
  Send,
  FileText,
  Upload,
  Star,
  Eye,
  Link2,
  Check,
  Loader2,
} from 'lucide-react';

interface ApplicationModalProps {
  job: JobListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({ job, isOpen, onClose, onSuccess }: ApplicationModalProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [candidateProfileId, setCandidateProfileId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Resume states
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string>('');
  const [resumeMode, setResumeMode] = useState<'saved' | 'upload' | 'url'>('saved');
  const [customResumeUrl, setCustomResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadCandidateData = async () => {
      try {
        setLoadingResumes(true);
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setCurrentUserId(user.id);
        setCandidateEmail(user.email || '');
        setCandidateName(user.user_metadata?.full_name || user.email || '');

        const [profileResult, resumeList] = await Promise.all([
          candidateService.getProfile(user.id),
          candidateService.getResumes(user.id).catch(() => [] as ResumeItem[]),
        ]);

        if (profileResult?.profile?.id) {
          const cp = profileResult.profile;
          setCandidateProfileId(cp.id || null);
          if (profileResult.portfolioItems && profileResult.portfolioItems.length > 0) {
            setPortfolioUrl(profileResult.portfolioItems[0].url || profileResult.portfolioItems[0].repository_url || '');
          }
        }

        setResumes(resumeList);
        if (resumeList.length > 0) {
          setResumeMode('saved');
          const primary = resumeList.find(r => r.isPrimary);
          setSelectedResumeUrl(primary ? primary.url : resumeList[0].url);
        } else if (profileResult?.profile?.resume_url) {
          setResumeMode('url');
          setCustomResumeUrl(profileResult.profile.resume_url);
          setSelectedResumeUrl(profileResult.profile.resume_url);
        } else {
          setResumeMode('upload');
        }
      } catch (err) {
        console.error('Failed to load candidate profile for application:', err);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadCandidateData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    setError(null);
    setUploadingResume(true);
    try {
      const publicUrl = await candidateService.uploadResume(file, currentUserId, {
        setAsPrimary: saveAsDefault || resumes.length === 0,
      });

      // Refresh resumes list
      const updatedList = await candidateService.getResumes(currentUserId);
      setResumes(updatedList);
      setSelectedResumeUrl(publicUrl);
      setResumeMode('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getEffectiveResumeUrl = (): string => {
    if (resumeMode === 'saved') return selectedResumeUrl;
    if (resumeMode === 'url') return customResumeUrl.trim();
    return selectedResumeUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!candidateProfileId) {
      setError('Please complete your candidate profile before submitting an application.');
      return;
    }

    const effectiveResume = getEffectiveResumeUrl();
    if (!coverLetter.trim() && !effectiveResume) {
      setError('Please attach a resume or provide a cover letter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await applicationService.submitApplication({
        jobId: job.id,
        candidateProfileId,
        coverLetter: coverLetter.trim(),
        resumeUrl: effectiveResume || undefined,
        portfolioUrls: portfolioUrl.trim() ? [portfolioUrl.trim()] : [],
      });

      setSubmitted(true);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit application. You may have already applied.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold tracking-wide uppercase mb-1">
              Job Application
            </span>
            <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
            <p className="text-xs text-slate-500">
              {job.organization?.name || 'TalentSphere Hiring Partner'}
              {job.location_city && ` • ${job.location_city}`}
              {job.work_mode && ` (${job.work_mode.replace('_', ' ')})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Your application for <span className="font-semibold text-slate-800">{job.title}</span> has been received. Your resume and credentials have been forwarded to the hiring team.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="primary" onClick={onClose} className="px-6">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              {/* Applicant Header Chip */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {candidateName ? candidateName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {candidateName || 'Candidate'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{candidateEmail}</p>
                  </div>
                </div>
                <Badge variant="info" className="text-[11px] shrink-0">
                  Verified Candidate
                </Badge>
              </div>

              {/* RESUME SELECTION SECTION */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-900">
                    Attach Resume <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    {resumes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setResumeMode('saved')}
                        className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                          resumeMode === 'saved'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Saved ({resumes.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setResumeMode('upload')}
                      className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                        resumeMode === 'upload'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Upload New
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumeMode('url')}
                      className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                        resumeMode === 'url'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {/* SAVED RESUMES PICKER */}
                {resumeMode === 'saved' && (
                  <div className="space-y-2">
                    {loadingResumes ? (
                      <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2 border border-slate-200 rounded-2xl">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Loading your resumes...</span>
                      </div>
                    ) : resumes.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-600 mb-2">No saved resumes found.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setResumeMode('upload')}
                          className="text-xs"
                        >
                          Upload a Resume
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {resumes.map((resume) => {
                          const isSelected = selectedResumeUrl === resume.url;
                          return (
                            <div
                              key={resume.id}
                              onClick={() => setSelectedResumeUrl(resume.url)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 truncate">
                                      {resume.name}
                                    </span>
                                    {resume.isPrimary && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                        <Star className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600" />
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {resume.size ? `${(resume.size / 1024).toFixed(0)} KB` : 'Document'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={resume.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                                  title="Preview resume"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>

                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* UPLOAD NEW RESUME BOX */}
                {resumeMode === 'upload' && (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingResume}
                    />

                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                      {uploadingResume ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      {uploadingResume ? 'Uploading resume to your profile...' : 'Upload your resume PDF'}
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      PDF, DOC, DOCX up to 10MB
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingResume}
                        className="text-xs"
                      >
                        Choose File
                      </Button>
                    </div>

                    <label className="inline-flex items-center gap-2 mt-4 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Set as my primary default resume for future applications</span>
                    </label>
                  </div>
                )}

                {/* EXTERNAL URL INPUT */}
                {resumeMode === 'url' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or https://..."
                        value={customResumeUrl}
                        onChange={(e) => setCustomResumeUrl(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Provide a public Google Drive, Dropbox, or hosted PDF link. Ensure sharing permissions are set to public view.
                    </p>
                  </div>
                )}

                {/* Attached Resume Confirmation Pill */}
                {getEffectiveResumeUrl() && (
                  <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs">
                    <span className="flex items-center gap-1.5 font-medium truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Attached: <span className="underline truncate">{getEffectiveResumeUrl()}</span>
                    </span>
                    <a
                      href={getEffectiveResumeUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-semibold shrink-0 ml-2"
                    >
                      Verify Link
                    </a>
                  </div>
                )}
              </div>

              {/* Portfolio Links */}
              <div>
                <label htmlFor="portfolio-link" className="block text-sm font-bold text-slate-900 mb-1">
                  Portfolio, GitHub, or Demo Link (Optional)
                </label>
                <div className="relative">
                  <input
                    id="portfolio-link"
                    type="url"
                    placeholder="https://github.com/yourname or https://myportfolio.dev"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Showcase projects, open-source work, or case studies relevant to this requisition.
                </p>
              </div>

              {/* Cover Letter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="cover-letter" className="block text-sm font-bold text-slate-900">
                    Cover Note / Introduction
                  </label>
                  <span className="text-xs text-slate-400">
                    {coverLetter.length} characters
                  </span>
                </div>
                <textarea
                  id="cover-letter"
                  rows={4}
                  placeholder="Explain why you're a strong match for this role, key technical highlights, and what excites you about this team..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || (!coverLetter.trim() && !getEffectiveResumeUrl())}
                  className="px-6 gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
