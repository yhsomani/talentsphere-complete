/**
 * The skill-signal ledger (plan TS-07, TPD-09). Every module that learns
 * something about what a person can do writes signals; the skill profile is
 * derived from live signals only and can be recomputed at any time. Signals
 * are never edited: a change retires the old set ("superseded") and writes a
 * new one, and revoking the source retires its signals ("revoked").
 *
 * The first source is evidence: one signal per skill the evidence is mapped
 * to, at the evidence's verification level. Evidence that is disputed,
 * revoked or expired gives no signal.
 */
import crypto from 'node:crypto';
import type { Evidence, VerificationLevel } from './core.js';

/** The rungs, weakest first: the evidence verification levels. */
export const SKILL_SIGNAL_RUNGS: readonly VerificationLevel[] = [
  'unverified',
  'peer_reviewed',
  'institution_verified',
  'authority_verified',
];

export const SKILL_SIGNAL_SOURCES = ['evidence'] as const;
export type SkillSignalSource = (typeof SKILL_SIGNAL_SOURCES)[number];

export interface SkillSignal {
  id: string;
  /** Profile id of the person the signal is about. */
  subjectId: string;
  skillId: string;
  rung: VerificationLevel;
  sourceModule: SkillSignalSource;
  sourceRef: string;
  observedAt: string;
  createdAt: string;
}

/** Evidence in these states says nothing about a skill. */
const SILENT_EVIDENCE_STATUSES: ReadonlySet<Evidence['status']> = new Set([
  'disputed',
  'revoked',
  'expired',
]);

/** The live signals a piece of evidence should have, given its mapped skills. */
export function deriveEvidenceSignals(
  evidence: Evidence,
  skillIds: readonly string[],
  nowIso: string = new Date().toISOString()
): SkillSignal[] {
  if (SILENT_EVIDENCE_STATUSES.has(evidence.status)) return [];
  return [...new Set(skillIds)].sort().map((skillId) => ({
    id: crypto.randomUUID(),
    subjectId: evidence.subjectId,
    skillId,
    rung: evidence.verificationLevel,
    sourceModule: 'evidence',
    sourceRef: evidence.id,
    observedAt: evidence.verifiedAt ?? evidence.createdAt,
    createdAt: nowIso,
  }));
}

const signature = (signals: readonly SkillSignal[]) =>
  signals
    .map((s) => `${s.subjectId}|${s.skillId}|${s.rung}`)
    .sort()
    .join(',');

/**
 * The one way a source's signals change (recordSkillSignals in the plan):
 * returns the new live set when it differs from the current one, or null
 * when nothing needs writing, so repeating a write is a no-op.
 */
export function recordSkillSignals(
  current: readonly SkillSignal[],
  desired: readonly SkillSignal[]
): SkillSignal[] | null {
  return signature(current) === signature(desired) ? null : [...desired];
}

export interface SkillProfileEntry {
  skillId: string;
  strongestRung: VerificationLevel;
  signalCount: number;
  lastSignalAt: string;
  /** What the entry rests on, strongest first: the explanation of the rung. */
  sources: Array<{ sourceModule: SkillSignalSource; sourceRef: string; rung: VerificationLevel }>;
}

const rankOf = (rung: VerificationLevel) => SKILL_SIGNAL_RUNGS.indexOf(rung);

/** The skill profile: a pure function of live signals, strongest skills first. */
export function projectSkillProfile(signals: readonly SkillSignal[]): SkillProfileEntry[] {
  const bySkill = new Map<string, SkillSignal[]>();
  for (const s of signals) bySkill.set(s.skillId, [...(bySkill.get(s.skillId) ?? []), s]);
  const entries: SkillProfileEntry[] = [...bySkill].map(([skillId, list]) => {
    const sorted = [...list].sort(
      (a, b) =>
        rankOf(b.rung) - rankOf(a.rung) ||
        b.observedAt.localeCompare(a.observedAt) ||
        a.sourceRef.localeCompare(b.sourceRef)
    );
    return {
      skillId,
      strongestRung: sorted[0]!.rung,
      signalCount: sorted.length,
      lastSignalAt: sorted
        .map((s) => s.observedAt)
        .sort()
        .at(-1)!,
      sources: sorted.map((s) => ({
        sourceModule: s.sourceModule,
        sourceRef: s.sourceRef,
        rung: s.rung,
      })),
    };
  });
  return entries.sort(
    (a, b) =>
      rankOf(b.strongestRung) - rankOf(a.strongestRung) ||
      b.signalCount - a.signalCount ||
      a.skillId.localeCompare(b.skillId)
  );
}

/**
 * How a person's skill profile meets one posting's required skills (plan
 * TS-13, §7.2 acceptance 1 and 2). There is no score: each required skill is
 * either shown, at its strongest rung with the records it rests on, or not
 * shown yet. "Verified" means a rung above the person's own claim.
 */
export interface SkillMatchEntry {
  skillId: string;
  shown: boolean;
  strongestRung: VerificationLevel | null;
  sources: SkillProfileEntry['sources'];
}

export interface SkillMatch {
  required: number;
  shown: number;
  verified: number;
  skills: SkillMatchEntry[];
}

export function explainSkillMatch(
  requiredSkillIds: readonly string[],
  profile: readonly SkillProfileEntry[]
): SkillMatch {
  const bySkill = new Map(profile.map((entry) => [entry.skillId, entry]));
  const skills = [...new Set(requiredSkillIds)].map((skillId): SkillMatchEntry => {
    const entry = bySkill.get(skillId);
    return entry
      ? { skillId, shown: true, strongestRung: entry.strongestRung, sources: entry.sources }
      : { skillId, shown: false, strongestRung: null, sources: [] };
  });
  return {
    required: skills.length,
    shown: skills.filter((s) => s.shown).length,
    verified: skills.filter((s) => s.strongestRung && rankOf(s.strongestRung) > 0).length,
    skills,
  };
}
