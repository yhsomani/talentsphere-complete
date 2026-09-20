'use client';

import React from 'react';
import Link from 'next/link';
import JobPostingForm from './components/JobPostingForm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default function JobPostPage() {
  return (
    <DashboardLayout userRole="recruiter">
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Job Marketplace
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Post Requisition</span>
        </div>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
                <PlusCircle className="w-3.5 h-3.5" />
                Hiring Requisition
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Create Job Requisition
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                Publish a verified technical opportunity to the TalentSphere ecosystem and immediately activate AI candidate matching.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div>
          <JobPostingForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
