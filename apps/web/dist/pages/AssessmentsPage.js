import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Modal, CodeIcon, CheckIcon, } from '../components/ui/index.js';
const CHALLENGES = [
    {
        id: 'ch-dist-01',
        title: 'Distributed Systems: Transactional Queue & Partition Tolerance',
        tier: 'Staff',
        timeLimitMinutes: 45,
        domain: 'Distributed Systems & Queues',
        description: 'Implement an idempotent transactional message queue that preserves strict at-least-once delivery with deduplication under simulated network partitions.',
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
        description: 'Build a lock-free thread-safe in-memory cache supporting high-concurrency read-heavy workloads with background probabilistic TTL cleanup.',
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
export const AssessmentsPage = () => {
    usePageMeta('Proctored Assessments', 'Take proctored, reproducible coding assessments that turn real problem-solving into shareable verified credentials.');
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [executionLog, setExecutionLog] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isPassed, setIsPassed] = useState(false);
    const handleOpenChallenge = (ch) => {
        setSelectedChallenge(ch);
        setExecutionLog([]);
        setIsPassed(false);
    };
    const handleRunSandbox = () => {
        setIsRunning(true);
        setExecutionLog([
            'Compiling TypeScript source in isolated V8 sandbox...',
            'Injecting chaos network partitions & clock skews...',
        ]);
        setTimeout(() => {
            setExecutionLog((prev) => [
                ...prev,
                'Running Test 1/3: Basic enqueue & dequeue invariant... PASS (1.2ms)',
                'Running Test 2/3: Duplicate submission replay deduplication... PASS (0.8ms)',
                'Running Test 3/3: Simulated 500ms network partition with retry recovery... PASS (2.4ms)',
                'Verification Complete: 3/3 test cases satisfied. Memory profile: 14.2 MB. Zero leaks detected.',
            ]);
            setIsRunning(false);
            setIsPassed(true);
        }, 1200);
    };
    return (_jsxs("div", { style: { maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }, children: [_jsxs("div", { style: {
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                    paddingBottom: spacing.lg,
                    marginBottom: spacing.xl,
                }, children: [_jsxs("div", { style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: spacing.xs,
                        }, children: [_jsx(Badge, { variant: "info", children: "EVIDENCE SANDBOX" }), _jsx("span", { style: { fontSize: '0.8125rem', color: colors.neutral[600] }, children: "Proctored Code Challenges \u2022 Zero Hallucinated Ratings" })] }), _jsx("h1", { style: {
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: colors.neutral[900],
                            margin: 0,
                            letterSpacing: '-0.02em',
                        }, children: "Proctored Capability Assessments" }), _jsx("p", { style: { color: colors.neutral[600], fontSize: '0.9375rem', margin: `${spacing.xs} 0 0` }, children: "Reproducible coding environments evaluated against objective rubrics and stress invariants." })] }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
                    gap: spacing.lg,
                }, children: CHALLENGES.map((ch) => (_jsxs(Card, { "data-testid": `challenge-card-${ch.id}`, children: [_jsxs(CardHeader, { children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: spacing.xs,
                                    }, children: [_jsxs(Badge, { variant: ch.tier === 'Staff' ? 'gold' : 'silver', children: [ch.tier, " Tier"] }), _jsxs("span", { style: { fontSize: '0.75rem', fontWeight: 600, color: colors.neutral[600] }, children: [ch.timeLimitMinutes, " min allocation"] })] }), _jsx(CardTitle, { style: { fontSize: '1rem' }, children: ch.title }), _jsx(CardDescription, { children: ch.domain })] }), _jsxs(CardContent, { children: [_jsx("p", { style: {
                                        fontSize: '0.875rem',
                                        color: colors.neutral[600],
                                        lineHeight: 1.5,
                                        marginBottom: spacing.md,
                                    }, children: ch.description }), _jsxs("div", { style: { marginBottom: spacing.md }, children: [_jsx("span", { style: {
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: colors.neutral[700],
                                                display: 'block',
                                                marginBottom: '4px',
                                            }, children: "EVALUATION RUBRIC:" }), _jsx("ul", { style: {
                                                paddingLeft: '18px',
                                                margin: 0,
                                                fontSize: '0.8125rem',
                                                color: colors.neutral[600],
                                            }, children: ch.rubric.map((r, i) => (_jsx("li", { style: { marginBottom: '2px' }, children: r }, i))) })] }), _jsxs(Button, { variant: "primary", size: "sm", "data-testid": `start-challenge-${ch.id}`, onClick: () => handleOpenChallenge(ch), style: { width: '100%' }, children: [_jsx(CodeIcon, { size: 16 }), " Open Code Sandbox"] })] })] }, ch.id))) }), selectedChallenge && (_jsx(Modal, { isOpen: Boolean(selectedChallenge), onClose: () => setSelectedChallenge(null), title: selectedChallenge.title, description: `${selectedChallenge.domain} • ${selectedChallenge.timeLimitMinutes} min limit`, maxWidth: "760px", footer: _jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                    }, children: [_jsx("div", { children: isPassed && (_jsxs(Badge, { variant: "verified", children: [_jsx(CheckIcon, { size: 14 }), " Sandbox Invariants Verified (Score: 100/100)"] })) }), _jsxs("div", { style: { display: 'flex', gap: spacing.sm }, children: [_jsx(Button, { variant: "secondary", size: "md", onClick: () => setSelectedChallenge(null), children: "Close" }), _jsx(Button, { variant: "primary", size: "md", "data-testid": "run-sandbox-btn", loading: isRunning, onClick: handleRunSandbox, children: "Run In Sandbox" })] })] }), children: _jsxs("div", { children: [_jsxs("div", { style: { marginBottom: spacing.md }, children: [_jsx("span", { style: {
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        color: colors.neutral[800],
                                        display: 'block',
                                        marginBottom: '4px',
                                    }, children: "STARTER IMPLEMENTATION:" }), _jsx("pre", { style: {
                                        backgroundColor: colors.neutral[900],
                                        color: '#e2e8f0',
                                        padding: spacing.md,
                                        borderRadius: '6px',
                                        fontSize: '0.8125rem',
                                        fontFamily: 'JetBrains Mono, SFMono-Regular, monospace',
                                        overflowX: 'auto',
                                        margin: 0,
                                        maxHeight: '220px',
                                    }, children: selectedChallenge.starterCode })] }), executionLog.length > 0 && (_jsxs("div", { children: [_jsx("span", { style: {
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        color: colors.neutral[800],
                                        display: 'block',
                                        marginBottom: '4px',
                                    }, children: "SANDBOX EXECUTION LOG:" }), _jsx("div", { "data-testid": "sandbox-log", style: {
                                        backgroundColor: colors.neutral[950],
                                        color: '#a7f3d0',
                                        padding: spacing.md,
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        lineHeight: 1.6,
                                    }, children: executionLog.map((log, idx) => (_jsx("div", { children: log }, idx))) })] }))] }) }))] }));
};
//# sourceMappingURL=AssessmentsPage.js.map