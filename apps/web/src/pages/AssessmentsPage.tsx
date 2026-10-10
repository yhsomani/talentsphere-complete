import React, { useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  CodeIcon,
  CheckIcon,
} from '../components/ui/index.js';

interface AssessmentChallenge {
  id: string;
  title: string;
  tier: 'Staff' | 'Principal' | 'Senior';
  timeLimitMinutes: number;
  domain: string;
  description: string;
  starterCode: string;
  rubric: string[];
  testCases: string[];
}

const CHALLENGES: AssessmentChallenge[] = [
  {
    id: 'ch-dist-01',
    title: 'Distributed Systems: Transactional Queue & Partition Tolerance',
    tier: 'Staff',
    timeLimitMinutes: 45,
    domain: 'Distributed Systems & Queues',
    description:
      'Implement an idempotent transactional message queue that preserves strict at-least-once delivery with deduplication under simulated network partitions.',
    starterCode: `export class TransactionalQueue<T> {
  private store = new Map<string, { payload: T; delivered: boolean }>();

  async enqueue(idempotencyKey: string, payload: T): Promise<void> {
    if (this.store.has(idempotencyKey)) return;
    this.store.set(idempotencyKey, { payload, delivered: false });
  }

  async processBatch(batchSize: number): Promise<T[]> {
    // Implement partition-tolerant commit log
    return [];
  }
}`,
    rubric: [
      'Strict idempotency key replay defense',
      'Crash consistency without message corruption',
      'Bounded memory footprint under retry storm',
    ],
    testCases: [
      'Basic enqueue & dequeue invariant',
      'Duplicate submission replay deduplication',
      'Simulated 500ms network partition with retry recovery',
    ],
  },
  {
    id: 'ch-concurr-02',
    title: 'Lockless Concurrent Cache with TTL Eviction',
    tier: 'Senior',
    timeLimitMinutes: 40,
    domain: 'Concurrency & Systems',
    description:
      'Build a lock-free thread-safe in-memory cache supporting high-concurrency read-heavy workloads with background probabilistic TTL cleanup.',
    starterCode: `export class ConcurrentCache<K, V> {
  private map = new Map<K, { val: V; expiresAt: number }>();

  get(key: K): V | undefined {
    const item = this.map.get(key);
    if (!item || item.expiresAt < Date.now()) return undefined;
    return item.val;
  }
}`,
    rubric: [
      'Sub-millisecond p99 read latency under 100 concurrent workers',
      'Zero deadlocks during concurrent evictions',
      'Memory reclamation within 5% variance of TTL expiry',
    ],
    testCases: [
      'Concurrent read/write stress invariant',
      'Atomic swap under eviction pressure',
      'TTL sweep with memory threshold clamp',
    ],
  },
];

export const AssessmentsPage: React.FC = () => {
  usePageMeta(
    'Skill assessments (preview)',
    'A preview of planned coding exercises. Nothing on this page is scored or saved yet.'
  );

  const [selectedChallenge, setSelectedChallenge] = useState<AssessmentChallenge | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const handleOpenChallenge = (ch: AssessmentChallenge) => {
    setSelectedChallenge(ch);
    setExecutionLog([]);
  };

  const handleRunSandbox = () => {
    // P0-07c: this preview executes nothing, so the log says exactly that —
    // no fabricated PASS lines, no server-verified claim.
    setExecutionLog([
      'UI preview only — no code was executed in this session.',
      'No tests ran, no score was generated, and no result was stored on the server.',
      'Proctored execution will run against the assessment backend when it ships.',
    ]);
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
          <Badge variant="info">PREVIEW</Badge>
          <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
            Not available yet — nothing on this page is scored or saved
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
          Skill assessments (preview)
        </h1>
        <p
          style={{ color: colors.neutral[600], fontSize: '0.9375rem', margin: `${spacing.xs} 0 0` }}
        >
          A look at the coding exercises we plan to offer. You can read the brief and starter code;
          running and scoring them is not built yet, so they do not count as evidence.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
          gap: spacing.lg,
        }}
      >
        {CHALLENGES.map((ch) => (
          <Card key={ch.id} data-testid={`challenge-card-${ch.id}`}>
            <CardHeader>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.xs,
                }}
              >
                <Badge variant={ch.tier === 'Staff' ? 'gold' : 'silver'}>{ch.tier} Tier</Badge>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.neutral[600] }}>
                  {ch.timeLimitMinutes} min allocation
                </span>
              </div>
              <CardTitle style={{ fontSize: '1rem' }}>{ch.title}</CardTitle>
              <CardDescription>{ch.domain}</CardDescription>
            </CardHeader>

            <CardContent>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: colors.neutral[600],
                  lineHeight: 1.5,
                  marginBottom: spacing.md,
                }}
              >
                {ch.description}
              </p>

              <div style={{ marginBottom: spacing.md }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: colors.neutral[700],
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  EVALUATION RUBRIC:
                </span>
                <ul
                  style={{
                    paddingLeft: '18px',
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: colors.neutral[600],
                  }}
                >
                  {ch.rubric.map((r, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="primary"
                size="sm"
                data-testid={`start-challenge-${ch.id}`}
                onClick={() => handleOpenChallenge(ch)}
                style={{ width: '100%' }}
              >
                <CodeIcon size={16} /> Open Code Sandbox
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Challenge Sandbox Modal */}
      {selectedChallenge && (
        <Modal
          isOpen={Boolean(selectedChallenge)}
          onClose={() => setSelectedChallenge(null)}
          title={selectedChallenge.title}
          description={`${selectedChallenge.domain} • ${selectedChallenge.timeLimitMinutes} min limit`}
          maxWidth="760px"
          footer={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <div>
                <Badge variant="info">
                  <CheckIcon size={14} /> PREVIEW &mdash; no server record
                </Badge>
              </div>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Button variant="secondary" size="md" onClick={() => setSelectedChallenge(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  data-testid="run-sandbox-btn"
                  onClick={handleRunSandbox}
                >
                  Show Preview
                </Button>
              </div>
            </div>
          }
        >
          <div>
            <div style={{ marginBottom: spacing.md }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: colors.neutral[800],
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                STARTER IMPLEMENTATION:
              </span>
              <pre
                style={{
                  backgroundColor: colors.neutral[900],
                  color: '#e2e8f0',
                  padding: spacing.md,
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontFamily: 'JetBrains Mono, SFMono-Regular, monospace',
                  overflowX: 'auto',
                  margin: 0,
                  maxHeight: '220px',
                }}
              >
                {selectedChallenge.starterCode}
              </pre>
            </div>

            {executionLog.length > 0 && (
              <div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: colors.neutral[800],
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  SANDBOX EXECUTION LOG:
                </span>
                <div
                  data-testid="sandbox-log"
                  role="log"
                  aria-label="Sandbox execution log"
                  style={{
                    backgroundColor: colors.neutral[950],
                    color: '#a7f3d0',
                    padding: spacing.md,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.6,
                  }}
                >
                  {executionLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
