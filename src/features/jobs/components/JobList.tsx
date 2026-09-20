'use client';

import Link from 'next/link';
import type { JobListing } from '@/types';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import styles from './JobList.module.css';

interface JobListProps {
  jobs: JobListing[];
}

export default function JobList({ jobs }: JobListProps) {
  return (
    <div className={styles.container}>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function JobCard({ job }: { job: JobListing }) {
  const postedDate = new Date(job.created_at);
  const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/jobs/${job.id}`} className={styles.card}>
      <div className={styles.header}>
        {/* Company Logo */}
        <div className={styles.logo}>
          <Avatar
            src={job.organizations?.logo_url}
            alt={job.organizations?.name || 'Company'}
            size="large"
            fallback={job.organizations?.name?.charAt(0) || 'C'}
          />
        </div>

        {/* Job Info */}
        <div className={styles.info}>
          <h3 className={styles.title}>{job.title}</h3>
          <p className={styles.company}>{job.organizations?.name}</p>
          
          <div className={styles.meta}>
            <span className={styles.location}>
              📍 {job.work_location === 'remote' ? 'Remote' : job.location}
            </span>
            <span className={styles.type}>
              💼 {formatJobType(job.job_type)}
            </span>
            <span className={styles.experience}>
              🎯 {formatExperience(job.experience_level)}
            </span>
          </div>
        </div>

        {/* Salary */}
        {job.salary_min && (
          <div className={styles.salary}>
            ${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max || job.salary_min)}
            <span className={styles.salaryPeriod}>/year</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className={styles.tags}>
        {job.skills?.slice(0, 5).map((skill, index) => (
          <Badge key={index} variant="secondary" size="small">
            {skill}
          </Badge>
        ))}
        {job.is_new && (
          <Badge variant="success" size="small">New</Badge>
        )}
        {job.is_urgent && (
          <Badge variant="danger" size="small">Urgent</Badge>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.posted}>
          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
        </span>
        {job.applications_count !== undefined && (
          <span className={styles.applications}>
            {job.applications_count} {job.applications_count === 1 ? 'applicant' : 'applicants'}
          </span>
        )}
      </div>
    </Link>
  );
}

function formatJobType(type: string): string {
  const map: Record<string, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship'
  };
  return map[type] || type;
}

function formatExperience(level: string): string {
  const map: Record<string, string> = {
    'entry': 'Entry Level',
    'mid': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Lead / Principal',
    'executive': 'Executive'
  };
  return map[level] || level;
}

function formatSalary(amount: number): string {
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'k';
  }
  return amount.toString();
}
