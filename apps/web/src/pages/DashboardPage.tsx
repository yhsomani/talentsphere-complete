import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  ShieldCheckIcon,
  CodeIcon,
  GitBranchIcon,
  ArrowRightIcon,
} from '../components/ui/index.js';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile>({
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'Principal Systems Architect',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('talentsphere_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          setUser({
            name: parsed.email.split('@')[0].replace('.', ' '),
            email: parsed.email,
            role: 'Senior Software Engineer',
          });
        }
      }
    } catch {
      // Fallback to default demo state
    }
  }, []);

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xl,
      }}
    >
      {/* Cockpit Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: spacing.md,
          borderBottom: `1px solid ${colors.neutral[200]}`,
          paddingBottom: spacing.lg,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.xs,
            }}
          >
            <Badge variant="verified">
              <ShieldCheckIcon size={12} />
              <span>Identity Verified</span>
            </Badge>
            <Badge variant="gold">Level 5 Contributor</Badge>
            <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
              DID: did:ts:8f7b2c...a91
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: colors.neutral[900],
              margin: '0 0 4px',
            }}
          >
            Candidate Career Cockpit
          </h1>
          <p style={{ margin: 0, color: colors.neutral[600], fontSize: '0.9375rem' }}>
            {user.name} &bull; {user.role} &bull; Real-time readiness, verified credentials, and
            explainable matches.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
          <Link to="/evidence" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">
              <GitBranchIcon size={16} />
              <span>Manage Evidence</span>
            </Button>
          </Link>
          <Link to="/assessments" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md">
              <CodeIcon size={16} />
              <span>Begin Verification Challenge</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          gap: spacing.md,
        }}
      >
        <Card>
          <CardContent style={{ padding: spacing.md }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: colors.neutral[500],
                fontWeight: 600,
              }}
            >
              Verified Evidence
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: spacing.xs,
                marginTop: spacing.xs,
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 800, color: colors.neutral[900] }}>
                12
              </span>
              <span
                style={{ fontSize: '0.8125rem', color: colors.semantic.success, fontWeight: 600 }}
              >
                +2 this month
              </span>
            </div>
            <div
              style={{ marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }}
            >
              3 Gold &bull; 8 Silver &bull; 1 Bronze
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: spacing.md }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: colors.neutral[500],
                fontWeight: 600,
              }}
            >
              Skill Readiness
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: spacing.xs,
                marginTop: spacing.xs,
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 800, color: colors.primary[600] }}>
                88%
              </span>
              <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
                High Confidence
              </span>
            </div>
            <div
              style={{ marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }}
            >
              Matches 94% of Staff/Principal requisitions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: spacing.md }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: colors.neutral[500],
                fontWeight: 600,
              }}
            >
              Active Applications
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: spacing.xs,
                marginTop: spacing.xs,
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 800, color: colors.neutral[900] }}>
                3
              </span>
              <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>In Review</span>
            </div>
            <div
              style={{ marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }}
            >
              Acme Cloud, Stripe, Apex Fintech
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: spacing.md }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: colors.neutral[500],
                fontWeight: 600,
              }}
            >
              Eligible Opportunities
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: spacing.xs,
                marginTop: spacing.xs,
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 800, color: colors.neutral[900] }}>
                6
              </span>
              <span style={{ fontSize: '0.8125rem', color: colors.primary[600], fontWeight: 600 }}>
                Zero ghost jobs
              </span>
            </div>
            <div
              style={{ marginTop: spacing.xs, fontSize: '0.8125rem', color: colors.neutral[600] }}
            >
              Instant verifiable 1-click apply enabled
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 2 Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(460px, 100%), 1fr))',
          gap: spacing.lg,
        }}
      >
        {/* Column 1: Verification Graph & Work History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <Card>
            <CardHeader>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <CardTitle style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    Verified Career Evidence
                  </CardTitle>
                  <CardDescription>
                    Cryptographically signed by authorized employers and managers
                  </CardDescription>
                </div>
                <Link to="/evidence" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm">
                    <span>View All (14)</span>
                    <ArrowRightIcon size={14} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }}
                    >
                      Acme Distributed Cloud &bull; Staff Infrastructure Engineer
                    </span>
                    <Badge variant="gold">Gold Credential</Badge>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: colors.neutral[500],
                      marginBottom: spacing.xs,
                    }}
                  >
                    2023 - Present &bull; Reference: Marcus Vance (VP Infrastructure)
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.neutral[700] }}>
                    Designed multi-region Raft state-machine replicating 450k op/s. Zero data loss
                    during regional failover drills.
                  </div>
                </div>

                <div
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }}
                    >
                      Stripe Payments Infrastructure &bull; Senior Backend Engineer
                    </span>
                    <Badge variant="silver">Silver Credential</Badge>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: colors.neutral[500],
                      marginBottom: spacing.xs,
                    }}
                  >
                    2021 - 2023 &bull; Reference: Elena Rostova (Engineering Director)
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.neutral[700] }}>
                    Authored transactional idempotency layer across distributed database partitions.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capability Matrix */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Technical Capability Matrix
              </CardTitle>
              <CardDescription>
                Evidence-weighted evaluation derived from proctored challenges & verified PRs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Distributed Systems & Consensus</span>
                    <span style={{ fontWeight: 700, color: colors.primary[700] }}>94%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: colors.neutral[200],
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{ width: '94%', height: '100%', backgroundColor: colors.primary[600] }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>TypeScript / Systems Architecture</span>
                    <span style={{ fontWeight: 700, color: colors.primary[700] }}>91%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: colors.neutral[200],
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{ width: '91%', height: '100%', backgroundColor: colors.primary[600] }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Database Partitioning & Idempotency</span>
                    <span style={{ fontWeight: 700, color: colors.primary[700] }}>88%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: colors.neutral[200],
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{ width: '88%', height: '100%', backgroundColor: colors.primary[600] }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Security, RBAC & Row-Level Security</span>
                    <span style={{ fontWeight: 700, color: colors.primary[700] }}>95%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: colors.neutral[200],
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{ width: '95%', height: '100%', backgroundColor: colors.primary[600] }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Assessment Transcripts & Recommended Roles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <Card>
            <CardHeader>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <CardTitle style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    Proctored Assessment Transcripts
                  </CardTitle>
                  <CardDescription>
                    Deterministic benchmark evaluations executed in isolated containers
                  </CardDescription>
                </div>
                <Link to="/assessments" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm">
                    <span>Catalog</span>
                    <ArrowRightIcon size={14} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }}
                    >
                      Distributed Lock Manager (DLM-902)
                    </span>
                    <Badge variant="gold">Score: 94 / 100</Badge>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: colors.neutral[500],
                      marginBottom: spacing.xs,
                    }}
                  >
                    Completed Sep 22, 2026 &bull; Runtime: 28 min &bull; Fencing tokens verified
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.neutral[700] }}>
                    Rubric: 100% test pass rate under 10k concurrent lock contention threads. Zero
                    split-brain states.
                  </div>
                </div>

                <div
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }}
                    >
                      Token Bucket Rate Limiter (SYS-401)
                    </span>
                    <Badge variant="silver">Score: 89 / 100</Badge>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: colors.neutral[500],
                      marginBottom: spacing.xs,
                    }}
                  >
                    Completed Sep 15, 2026 &bull; Runtime: 19 min &bull; Sub-millisecond latency
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.neutral[700] }}>
                    Rubric: Memory efficiency $O(1)$ space complexity per tenant. Burst window
                    handled cleanly.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matched Opportunities */}
          <Card>
            <CardHeader>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <CardTitle style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    Eligible Verifiable Roles
                  </CardTitle>
                  <CardDescription>
                    Roles where your verified evidence satisfies 100% of hard constraints
                  </CardDescription>
                </div>
                <Link to="/jobs" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm">
                    <span>Explore (6)</span>
                    <ArrowRightIcon size={14} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }}
                    >
                      Staff Distributed Systems Engineer
                    </span>
                    <Badge variant="verified">97% Evidence Match</Badge>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: colors.neutral[500],
                      marginBottom: spacing.xs,
                    }}
                  >
                    Acme Cloud Infrastructure &bull; \$240k - \$310k &bull; Fully Remote
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: spacing.xs,
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: colors.neutral[600] }}>
                      Requires: Raft/Paxos proof &bull; DLM-902 &gt; 90
                    </span>
                    <Link to="/jobs" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm">
                        <span>Review & Apply</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                <div
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }}
                    >
                      Principal Platform Architect
                    </span>
                    <Badge variant="verified">92% Evidence Match</Badge>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: colors.neutral[500],
                      marginBottom: spacing.xs,
                    }}
                  >
                    Apex Global Fintech &bull; \$260k - \$340k &bull; San Francisco / Remote
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: spacing.xs,
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: colors.neutral[600] }}>
                      Requires: Idempotency proof &bull; RBAC audit
                    </span>
                    <Link to="/jobs" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="sm">
                        <span>Review & Apply</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
