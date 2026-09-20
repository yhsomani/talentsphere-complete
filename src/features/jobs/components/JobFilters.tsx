'use client';

import { useState } from 'react';
import type { JobFilters, JobType, WorkLocation, ExperienceLevel } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './JobFilters.module.css';

interface JobFiltersProps {
  filters: JobFilters;
  onChange: (filters: Partial<JobFilters>) => void;
  onReset: () => void;
}

export default function JobFilters({ filters, onChange, onReset }: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {hasActiveFilters && (
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            className={styles.resetButton}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Search */}
      <div className={styles.section}>
        <Input
          placeholder="Search jobs..."
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {/* Location Filter */}
      <div className={styles.section}>
        <label className={styles.label}>Location</label>
        <select
          className={styles.select}
          value={filters.location || ''}
          onChange={(e) => onChange({ location: e.target.value || undefined })}
        >
          <option value="">Any Location</option>
          <option value="Remote">Remote</option>
          <option value="New York, NY">New York, NY</option>
          <option value="San Francisco, CA">San Francisco, CA</option>
          <option value="Seattle, WA">Seattle, WA</option>
          <option value="Austin, TX">Austin, TX</option>
          <option value="Boston, MA">Boston, MA</option>
          <option value="Chicago, IL">Chicago, IL</option>
          <option value="Denver, CO">Denver, CO</option>
        </select>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Advanced Filters</span>
        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <>
          {/* Job Type */}
          <div className={styles.section}>
            <label className={styles.label}>Job Type</label>
            <div className={styles.checkboxGroup}>
              {(['full_time', 'part_time', 'contract', 'internship'] as JobType[]).map((type) => (
                <label key={type} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={filters.jobType === type}
                    onChange={(e) => onChange({ jobType: e.target.checked ? type : undefined })}
                  />
                  <span>{formatJobType(type)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Location Type */}
          <div className={styles.section}>
            <label className={styles.label}>Work Arrangement</label>
            <select
              className={styles.select}
              value={filters.workLocation || ''}
              onChange={(e) => onChange({ workLocation: (e.target.value as WorkLocation) || undefined })}
            >
              <option value="">Any Arrangement</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {/* Experience Level */}
          <div className={styles.section}>
            <label className={styles.label}>Experience Level</label>
            <select
              className={styles.select}
              value={filters.experienceLevel || ''}
              onChange={(e) => onChange({ experienceLevel: (e.target.value as ExperienceLevel) || undefined })}
            >
              <option value="">Any Experience</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead / Principal</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          {/* Salary Range */}
          <div className={styles.section}>
            <label className={styles.label}>Salary Range</label>
            <div className={styles.salaryInputs}>
              <input
                type="number"
                placeholder="Min"
                className={styles.numberInput}
                value={filters.salaryMin ?? ''}
                onChange={(e) => onChange({ 
                  salaryMin: e.target.value ? parseInt(e.target.value) : undefined,
                })}
              />
              <input
                type="number"
                placeholder="Max"
                className={styles.numberInput}
                value={filters.salaryMax ?? ''}
                onChange={(e) => onChange({ 
                  salaryMax: e.target.value ? parseInt(e.target.value) : undefined,
                })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatJobType(type: JobType): string {
  const map: Record<JobType, string> = {
    'full_time': 'Full-time',
    'part_time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship',
    'apprenticeship': 'Apprenticeship',
  };
  return map[type] || type;
}
