'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { applicationService } from '@/services/application.service';
import { candidateService } from '@/services/candidate.service';
import { createBrowserClient } from '@/lib/supabase';
import type { JobListing } from '@/types';
import { CheckCircle2, X, AlertCircle, Send } from 'lucide-react';

interface ApplicationModalProps {
  job: JobListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({ job, isOpen, onClose, onSuccess }: ApplicationModalProps) {
  const [candidateProfileId, setCandidateProfileId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadCandidateData = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setCandidateEmail(user.email || '');
        const profileResult = await candidateService.getProfile(user.id);
        if (profileResult?.profile?.id) {
          const cp = profileResult.profile;
          setCandidateProfileId(cp.id || null);
          setCandidateName(user.user_metadata?.full_name || user.email || '');
          if (profileResult.portfolioItems && profileResult.portfolioItems.length > 0) {
            setPortfolioUrl(profileResult.portfolioItems[0].url || profileResult.portfolioItems[0].repository_url || '');
          }
        }
      } catch (err) {
        console.error('Failed to load candidate profile for application:', err);
      }
    };

    loadCandidateData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!candidateProfileId) {
      setError('Please complete your candidate profile before submitting an application.');
      return;
    }

    if (!coverLetter.trim() && !resumeUrl.trim()) {
      setError('Please provide a cover letter or a resume link.');
      return;
    }

    setIsSubmitting(true);
    try {
      await applicationService.submitApplication({
        jobId: job.id,
        candidateProfileId,
        coverLetter: coverLetter.trim(),
        resumeUrl: resumeUrl.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for Position</h2>
            <p className="text-sm text-gray-500">
              {job.title} at <span className="font-medium text-gray-700">{job.organization?.name || 'Company'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Your application for <span className="font-semibold text-gray-800">{job.title}</span> has been received. The hiring team will review your qualifications.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="primary" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>{error}</div>
                </div>
              )}

              {/* Applicant Info Banner */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {candidateName ? candidateName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidateName || 'Candidate'}
                  </p>
                  <p className="text-xs text-gray-500">{candidateEmail}</p>
                </div>
              </div>

              {/* Resume / Portfolio Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="resume-link" className="block text-sm font-semibold text-gray-700 mb-1">
                    Resume Link (URL)
                  </label>
                  <div className="relative">
                    <input
                      id="resume-link"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Google Drive, Dropbox, or personal PDF link</p>
                </div>

                <div>
                  <label htmlFor="portfolio-link" className="block text-sm font-semibold text-gray-700 mb-1">
                    Portfolio or GitHub URL
                  </label>
                  <input
                    id="portfolio-link"
                    type="url"
                    placeholder="https://github.com/..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Showcase your relevant projects or code</p>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label htmlFor="cover-letter" className="block text-sm font-semibold text-gray-700 mb-1">
                  Cover Letter / Introduction
                </label>
                <textarea
                  id="cover-letter"
                  rows={5}
                  placeholder="Explain why you're a strong match for this role, relevant achievements, and what excites you about the company..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
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
