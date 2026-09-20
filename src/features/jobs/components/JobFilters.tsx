'use client';

import React, { useState } from 'react';
import type { JobFilters as JobFiltersType, JobType, WorkLocation, ExperienceLevel } from '@/types';
import { 
  RotateCcw, 
  Search, 
  MapPin, 
  DollarSign, 
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

interface JobFiltersProps {
  filters: JobFiltersType;
  onChange: (filters: Partial<JobFiltersType>) => void;
  onReset: () => void;
}

export default function JobFilters({ filters, onChange, onReset }: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Filter Jobs</h2>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Keyword Search */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Keywords
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Title, skill, or company..."
              value={filters.search || ''}
              onChange={(e) => onChange({ search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Location Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Location
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.location || ''}
              onChange={(e) => onChange({ location: e.target.value || undefined })}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">Any Location (Worldwide)</option>
              <option value="Remote">Remote Only</option>
              <option value="San Francisco, CA">San Francisco, CA</option>
              <option value="New York, NY">New York, NY</option>
              <option value="Seattle, WA">Seattle, WA</option>
              <option value="Austin, TX">Austin, TX</option>
              <option value="Boston, MA">Boston, MA</option>
              <option value="London, UK">London, UK</option>
            </select>
          </div>
        </div>

        {/* Work Arrangement */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Work Arrangement
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'remote', label: 'Remote' },
              { id: 'hybrid', label: 'Hybrid' },
              { id: 'onsite', label: 'On-site' },
            ].map((mode) => {
              const isSelected = filters.workLocation === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onChange({ workLocation: isSelected ? undefined : (mode.id as WorkLocation) })}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters Accordion */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1"
          >
            <span>Employment & Level</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-3.5">
              {/* Job Type */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Job Type
                </label>
                <div className="space-y-1.5">
                  {(['full_time', 'contract', 'part_time', 'internship'] as JobType[]).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={filters.jobType === type}
                        onChange={(e) => onChange({ jobType: e.target.checked ? type : undefined })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>{formatJobType(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={filters.experienceLevel || ''}
                  onChange={(e) => onChange({ experienceLevel: (e.target.value as ExperienceLevel) || undefined })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">All Experience Levels</option>
                  <option value="entry">Entry Level (0-2 yrs)</option>
                  <option value="mid">Mid Level (2-5 yrs)</option>
                  <option value="senior">Senior Level (5+ yrs)</option>
                  <option value="lead">Lead / Principal</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              {/* Salary Min / Max */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Min Annual Salary (USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    step="5000"
                    value={filters.salaryMin ?? ''}
                    onChange={(e) => onChange({ 
                      salaryMin: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatJobType(type: JobType): string {
  const map: Record<JobType, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    apprenticeship: 'Apprenticeship',
  };
  return map[type] || type;
}
