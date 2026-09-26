import React, { useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ShieldCheckIcon,
  CheckIcon,
} from '../components/ui/index.js';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  matchScore: number;
  requiredEvidence: string[];
}

const JOBS: JobOpportunity[] = [
  {
    id: 'job-001',
    title: 'Staff Distributed Systems Engineer',
    company: 'CoreDB Infrastructure',
    location: 'Remote (US/Canada)',
    type: 'Full-time',
    salaryMin: 220000,
    salaryMax: 275000,
    currency: 'USD',
    matchScore: 94,
    requiredEvidence: [
      'Gold Tier: Distributed Systems Work History',
      'DKIM Corporate Domain Attestation',
      'Passing score on Transactional Queue Sandbox',
    ],
  },
  {
    id: 'job-002',
    title: 'Lead Platform Reliability Architect',
    company: 'FinTech Ledger Systems',
    location: 'San Francisco, CA / Hybrid',
    type: 'Full-time',
    salaryMin: 240000,
    salaryMax: 290000,
    currency: 'USD',
    matchScore: 88,
    requiredEvidence: [
      'Silver+ Tier: 3+ years Backend Systems',
      'Verified Supervisor Reference',
      'Concurrency & Partition Tolerance Assessment',
    ],
  },
  {
    id: 'job-003',
    title: 'Principal TypeScript / Web Runtime Engineer',
    company: 'NextGen Cloud Edge',
    location: 'Remote (Global)',
    type: 'Full-time',
    salaryMin: 210000,
    salaryMax: 260000,
    currency: 'USD',
    matchScore: 82,
    requiredEvidence: [
      'Cryptographic Evidence of Browser Sandbox Architecture',
      'Verified Open Source / Enterprise Contributions',
    ],
  },
];

export const JobsPage: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});

  const handleApply = (jobId: string) => {
    setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
  };

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }}>
      <div
        style={{
          borderBottom: `1px solid ${colors.neutral[200]}`,
          paddingBottom: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: spacing.xs,
          }}
        >
          <Badge variant="verified">GOVERNED MATCHMAKING</Badge>
          <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
            Zero Keyword Filters &bull; Evidence-Based Match Scoring
          </span>
        </div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: colors.neutral[900],
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Verifiable Career Opportunities
        </h1>
        <p
          style={{ color: colors.neutral[600], fontSize: '0.9375rem', margin: `${spacing.xs} 0 0` }}
        >
          Pre-screened roles that prioritize immutable evidence, supervisor references, and code
          artifacts.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {JOBS.map((job) => {
          const isApplied = Boolean(appliedJobs[job.id]);
          return (
            <Card key={job.id} data-testid={`job-card-${job.id}`}>
              <CardHeader
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: spacing.sm,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <CardTitle>{job.title}</CardTitle>
                    <Badge variant={job.matchScore >= 90 ? 'gold' : 'info'} mono>
                      {job.matchScore}% MATCH
                    </Badge>
                  </div>
                  <CardDescription>
                    {job.company} &bull; {job.location} &bull; {job.type}
                  </CardDescription>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.neutral[900] }}>
                    ${(job.salaryMin / 1000).toFixed(0)}k &ndash; $
                    {(job.salaryMax / 1000).toFixed(0)}k
                  </div>
                  <span style={{ fontSize: '0.75rem', color: colors.neutral[500] }}>
                    Base Compensation (USD)
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div style={{ marginBottom: spacing.md }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: colors.neutral[700],
                      display: 'block',
                      marginBottom: spacing.xs,
                    }}
                  >
                    REQUIRED VERIFIED EVIDENCE:
                  </span>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {job.requiredEvidence.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.8125rem',
                          backgroundColor: colors.neutral[100],
                          color: colors.neutral[800],
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShieldCheckIcon size={14} style={{ color: colors.primary[700] }} />
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: spacing.md,
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
                    Deterministic matching powered by RFC-0041 Evidence Graphs.
                  </span>
                  <Button
                    variant={isApplied ? 'secondary' : 'primary'}
                    size="md"
                    data-testid={`apply-btn-${job.id}`}
                    disabled={isApplied}
                    onClick={() => handleApply(job.id)}
                  >
                    {isApplied ? (
                      <>
                        <CheckIcon size={16} /> Application Transmitted
                      </>
                    ) : (
                      'Apply with Evidence Graph'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
