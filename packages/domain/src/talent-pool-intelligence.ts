import { DomainError } from './index.js';

export type TalentPoolSource =
  'search' | 'referral' | 'inbound_application' | 'alumni' | 'outreach';

export type TalentPoolStatus =
  'sourced' | 'contacted' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'archived';

export interface TalentPool {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  targetRole?: string;
  targetSkills: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TalentPoolMember {
  id: string;
  poolId: string;
  orgId: string;
  candidateId: string;
  source: TalentPoolSource;
  status: TalentPoolStatus;
  costMinorUnits: number;
  addedAt: string;
  contactedAt?: string;
  interviewedAt?: string;
  offeredAt?: string;
  hiredAt?: string;
  archivedAt?: string;
  notes?: string;
}

export interface CandidateSkill {
  skillName: string;
  verified: boolean;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface CandidateSkillProfile {
  candidateId: string;
  skills: CandidateSkill[];
  isStealthMode?: boolean;
  privacyLevel?: 'public' | 'recruiters_only' | 'private';
  hasAppliedOrConsented?: boolean;
}

export interface SkillCompositionItem {
  skillName: string;
  candidateCount: number;
  prevalencePct: number;
  verifiedCount: number;
  verifiedPct: number;
}

export interface SkillGapAnalysis {
  targetSkill: string;
  inPoolCount: number;
  coveragePct: number;
  status: 'adequate' | 'moderate_gap' | 'severe_gap';
}

export interface PipelineStageMetrics {
  stage: TalentPoolStatus;
  count: number;
  pctOfTotal: number;
  avgDaysInStage: number;
}

export interface SourceEffectivenessMetrics {
  source: TalentPoolSource;
  totalCandidates: number;
  hiredCount: number;
  conversionRatePct: number;
  avgTimeToHireDays: number | null;
  avgCostPerHireMinorUnits: number | null;
}

export interface AggregatedDiversityResult {
  cohortsAnalyzed: number;
  kThreshold: number;
  isSuppressedDueToKAnonymity: boolean;
  metrics: Record<string, number> | null;
  disclaimer: string;
}

export interface TalentPoolIntelligenceSummary {
  poolId: string;
  poolName: string;
  targetRole?: string;
  totalMembers: number;
  activePipelineCount: number;
  hiredCount: number;
  archivedCount: number;
  overallConversionRatePct: number;
  avgTimeToHireDays: number | null;
  totalCostMinorUnits: number;
  avgCostPerHireMinorUnits: number | null;
  skillComposition: SkillCompositionItem[];
  skillGaps: SkillGapAnalysis[];
  pipelineStages: PipelineStageMetrics[];
  sourceEffectiveness: SourceEffectivenessMetrics[];
  aggregatedDiversity: AggregatedDiversityResult;
}

export const VALID_SOURCES: TalentPoolSource[] = [
  'search',
  'referral',
  'inbound_application',
  'alumni',
  'outreach',
];

export const VALID_STATUSES: TalentPoolStatus[] = [
  'sourced',
  'contacted',
  'screening',
  'interviewing',
  'offered',
  'hired',
  'archived',
];

export const DIVERSITY_DISCLAIMER =
  'Aggregated diversity analytics conform to BR-200 and k-anonymity (k >= 10). Individual demographic records are never persisted.';

/**
 * Validates candidate eligibility for talent pooling respecting candidate privacy controls (SSOT F-92, F-158).
 */
export function validateCandidatePoolEligibility(candidate: {
  isStealthMode?: boolean;
  privacyLevel?: string;
  hasAppliedOrConsented?: boolean;
}): void {
  if (candidate.isStealthMode && !candidate.hasAppliedOrConsented) {
    throw new DomainError(
      'POLICY_VIOLATION',
      'Candidate is currently in stealth mode and cannot be added to talent pools without prior consent.'
    );
  }
  if (candidate.privacyLevel === 'private' && !candidate.hasAppliedOrConsented) {
    throw new DomainError(
      'FORBIDDEN',
      'Private candidate profiles cannot be added to talent pools without active application or consent.'
    );
  }
}

/**
 * Creates a new talent pool representation.
 */
export function createTalentPool(input: {
  id?: string;
  orgId: string;
  name: string;
  description?: string;
  targetRole?: string;
  targetSkills?: string[];
  createdBy: string;
}): TalentPool {
  if (!input.name || input.name.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Talent pool name is required.');
  }
  if (!input.orgId) {
    throw new DomainError('VALIDATION_FAILED', 'Organization ID is required.');
  }

  const now = new Date().toISOString();
  return {
    id: input.id || `pool_${crypto.randomUUID()}`,
    orgId: input.orgId,
    name: input.name.trim(),
    description: input.description?.trim(),
    targetRole: input.targetRole?.trim(),
    targetSkills: (input.targetSkills || []).map((s) => s.trim().toLowerCase()),
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Adds a candidate to a talent pool with privacy and duplicate validation.
 */
export function addCandidateToPool(
  pool: TalentPool,
  candidate: CandidateSkillProfile,
  source: TalentPoolSource,
  costMinorUnits: number = 0,
  notes?: string
): TalentPoolMember {
  validateCandidatePoolEligibility(candidate);

  if (!VALID_SOURCES.includes(source)) {
    throw new DomainError('VALIDATION_FAILED', `Invalid talent pool source: "${source}".`);
  }

  if (costMinorUnits < 0) {
    throw new DomainError('VALIDATION_FAILED', 'Cost in minor units must be non-negative.');
  }

  const now = new Date().toISOString();
  return {
    id: `mem_${crypto.randomUUID()}`,
    poolId: pool.id,
    orgId: pool.orgId,
    candidateId: candidate.candidateId,
    source,
    status: 'sourced',
    costMinorUnits: Math.round(costMinorUnits),
    addedAt: now,
    notes: notes?.trim(),
  };
}

/**
 * Updates a talent pool member's status along the recruitment funnel.
 */
export function updatePoolMemberStatus(
  member: TalentPoolMember,
  newStatus: TalentPoolStatus,
  timestampStr?: string
): TalentPoolMember {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new DomainError('VALIDATION_FAILED', `Invalid talent pool status: "${newStatus}".`);
  }

  const ts = timestampStr || new Date().toISOString();
  const updated: TalentPoolMember = {
    ...member,
    status: newStatus,
  };

  switch (newStatus) {
    case 'contacted':
      if (!updated.contactedAt) updated.contactedAt = ts;
      break;
    case 'screening':
    case 'interviewing':
      if (!updated.interviewedAt) updated.interviewedAt = ts;
      break;
    case 'offered':
      if (!updated.offeredAt) updated.offeredAt = ts;
      break;
    case 'hired':
      if (!updated.hiredAt) updated.hiredAt = ts;
      break;
    case 'archived':
      if (!updated.archivedAt) updated.archivedAt = ts;
      break;
  }

  return updated;
}

/**
 * Computes pool skill composition (frequency, prevalence, and verified percentage).
 */
export function computePoolSkillComposition(
  members: TalentPoolMember[],
  candidateSkills: CandidateSkillProfile[]
): SkillCompositionItem[] {
  if (members.length === 0) return [];

  const memberCandidateIds = new Set(members.map((m) => m.candidateId));
  const skillStats: Map<string, { count: number; verifiedCount: number }> = new Map();

  for (const profile of candidateSkills) {
    if (!memberCandidateIds.has(profile.candidateId)) continue;

    for (const skill of profile.skills) {
      const canonicalName = skill.skillName.trim().toLowerCase();
      const current = skillStats.get(canonicalName) || { count: 0, verifiedCount: 0 };
      current.count += 1;
      if (skill.verified) {
        current.verifiedCount += 1;
      }
      skillStats.set(canonicalName, current);
    }
  }

  const totalMembers = members.length;
  const result: SkillCompositionItem[] = [];

  for (const [skillName, stats] of skillStats.entries()) {
    const prevalencePct = Math.round((stats.count / totalMembers) * 10000) / 100;
    const verifiedPct =
      stats.count > 0 ? Math.round((stats.verifiedCount / stats.count) * 10000) / 100 : 0;

    result.push({
      skillName,
      candidateCount: stats.count,
      prevalencePct,
      verifiedCount: stats.verifiedCount,
      verifiedPct,
    });
  }

  return result.sort((a, b) => b.candidateCount - a.candidateCount);
}

/**
 * Computes pool skill gaps relative to target job requirements.
 */
export function computePoolSkillGaps(
  targetSkills: string[],
  composition: SkillCompositionItem[],
  totalMembers: number
): SkillGapAnalysis[] {
  if (!targetSkills || targetSkills.length === 0) return [];

  const compMap = new Map(composition.map((c) => [c.skillName.toLowerCase(), c]));

  return targetSkills.map((target) => {
    const normTarget = target.trim().toLowerCase();
    const item = compMap.get(normTarget);
    const inPoolCount = item ? item.candidateCount : 0;
    const coveragePct =
      totalMembers > 0 ? Math.round((inPoolCount / totalMembers) * 10000) / 100 : 0;

    let status: 'adequate' | 'moderate_gap' | 'severe_gap' = 'adequate';
    if (coveragePct < 20) {
      status = 'severe_gap';
    } else if (coveragePct < 50) {
      status = 'moderate_gap';
    }

    return {
      targetSkill: normTarget,
      inPoolCount,
      coveragePct,
      status,
    };
  });
}

/**
 * Computes pipeline health: candidate count per stage, percentage, and avg days in stage.
 */
export function computePipelineStages(
  members: TalentPoolMember[],
  now: Date = new Date()
): PipelineStageMetrics[] {
  const total = members.length;

  return VALID_STATUSES.map((stage) => {
    const stageMembers = members.filter((m) => m.status === stage);
    const count = stageMembers.length;
    const pctOfTotal = total > 0 ? Math.round((count / total) * 10000) / 100 : 0;

    let avgDaysInStage = 0;
    if (count > 0) {
      const totalDays = stageMembers.reduce((acc, m) => {
        const stageDateStr =
          stage === 'hired'
            ? m.hiredAt
            : stage === 'offered'
              ? m.offeredAt
              : stage === 'interviewing' || stage === 'screening'
                ? m.interviewedAt
                : stage === 'contacted'
                  ? m.contactedAt
                  : stage === 'archived'
                    ? m.archivedAt
                    : m.addedAt;

        const stageDate = stageDateStr ? new Date(stageDateStr) : new Date(m.addedAt);
        const days = Math.max(
          0,
          Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24))
        );
        return acc + days;
      }, 0);
      avgDaysInStage = Math.round((totalDays / count) * 10) / 10;
    }

    return {
      stage,
      count,
      pctOfTotal,
      avgDaysInStage,
    };
  });
}

/**
 * Computes source effectiveness: conversion rate, avg time to hire, and avg cost per hire.
 */
export function computeSourceEffectiveness(
  members: TalentPoolMember[]
): SourceEffectivenessMetrics[] {
  return VALID_SOURCES.map((source) => {
    const sourceMembers = members.filter((m) => m.source === source);
    const totalCandidates = sourceMembers.length;
    const hiredMembers = sourceMembers.filter((m) => m.status === 'hired');
    const hiredCount = hiredMembers.length;

    const conversionRatePct =
      totalCandidates > 0 ? Math.round((hiredCount / totalCandidates) * 10000) / 100 : 0;

    let avgTimeToHireDays: number | null = null;
    let avgCostPerHireMinorUnits: number | null = null;

    if (hiredCount > 0) {
      const totalHireDays = hiredMembers.reduce((acc, m) => {
        const added = new Date(m.addedAt).getTime();
        const hired = m.hiredAt ? new Date(m.hiredAt).getTime() : added;
        const days = Math.max(0, Math.round((hired - added) / (1000 * 60 * 60 * 24)));
        return acc + days;
      }, 0);
      avgTimeToHireDays = Math.round((totalHireDays / hiredCount) * 10) / 10;

      const totalSourceCost = sourceMembers.reduce((acc, m) => acc + (m.costMinorUnits || 0), 0);
      avgCostPerHireMinorUnits = Math.round(totalSourceCost / hiredCount);
    }

    return {
      source,
      totalCandidates,
      hiredCount,
      conversionRatePct,
      avgTimeToHireDays,
      avgCostPerHireMinorUnits,
    };
  });
}

/**
 * Anonymizes demographic/diversity metrics under k-anonymity (k >= 10, BR-200).
 * If any cell count is below k, the cell/metrics are suppressed to prevent deanonymization.
 */
export function computeAggregatedDiversity(
  cohorts: Array<{ category: string }>,
  kThreshold: number = 10
): AggregatedDiversityResult {
  if (!cohorts || cohorts.length === 0) {
    return {
      cohortsAnalyzed: 0,
      kThreshold,
      isSuppressedDueToKAnonymity: true,
      metrics: null,
      disclaimer: DIVERSITY_DISCLAIMER,
    };
  }

  const total = cohorts.length;
  if (total < kThreshold) {
    return {
      cohortsAnalyzed: total,
      kThreshold,
      isSuppressedDueToKAnonymity: true,
      metrics: null,
      disclaimer: DIVERSITY_DISCLAIMER,
    };
  }

  const counts: Record<string, number> = {};
  for (const c of cohorts) {
    counts[c.category] = (counts[c.category] || 0) + 1;
  }

  // Check if any sub-cohort has count < kThreshold
  for (const count of Object.values(counts)) {
    if (count < kThreshold) {
      return {
        cohortsAnalyzed: total,
        kThreshold,
        isSuppressedDueToKAnonymity: true,
        metrics: null,
        disclaimer: DIVERSITY_DISCLAIMER,
      };
    }
  }

  return {
    cohortsAnalyzed: total,
    kThreshold,
    isSuppressedDueToKAnonymity: false,
    metrics: counts,
    disclaimer: DIVERSITY_DISCLAIMER,
  };
}

/**
 * Generates comprehensive talent pool intelligence summary.
 */
export function generateTalentPoolIntelligence(
  pool: TalentPool,
  members: TalentPoolMember[],
  candidateSkills: CandidateSkillProfile[],
  diversityCohorts: Array<{ category: string }> = [],
  kThreshold: number = 10,
  now: Date = new Date()
): TalentPoolIntelligenceSummary {
  const totalMembers = members.length;
  const hiredMembers = members.filter((m) => m.status === 'hired');
  const hiredCount = hiredMembers.length;
  const archivedCount = members.filter((m) => m.status === 'archived').length;
  const activePipelineCount = totalMembers - hiredCount - archivedCount;

  const overallConversionRatePct =
    totalMembers > 0 ? Math.round((hiredCount / totalMembers) * 10000) / 100 : 0;

  let avgTimeToHireDays: number | null = null;
  if (hiredCount > 0) {
    const totalDays = hiredMembers.reduce((acc, m) => {
      const added = new Date(m.addedAt).getTime();
      const hired = m.hiredAt ? new Date(m.hiredAt).getTime() : added;
      return acc + Math.max(0, Math.round((hired - added) / (1000 * 60 * 60 * 24)));
    }, 0);
    avgTimeToHireDays = Math.round((totalDays / hiredCount) * 10) / 10;
  }

  const totalCostMinorUnits = members.reduce((acc, m) => acc + (m.costMinorUnits || 0), 0);
  const avgCostPerHireMinorUnits =
    hiredCount > 0 ? Math.round(totalCostMinorUnits / hiredCount) : null;

  const skillComposition = computePoolSkillComposition(members, candidateSkills);
  const skillGaps = computePoolSkillGaps(pool.targetSkills, skillComposition, totalMembers);
  const pipelineStages = computePipelineStages(members, now);
  const sourceEffectiveness = computeSourceEffectiveness(members);
  const aggregatedDiversity = computeAggregatedDiversity(diversityCohorts, kThreshold);

  return {
    poolId: pool.id,
    poolName: pool.name,
    targetRole: pool.targetRole,
    totalMembers,
    activePipelineCount,
    hiredCount,
    archivedCount,
    overallConversionRatePct,
    avgTimeToHireDays,
    totalCostMinorUnits,
    avgCostPerHireMinorUnits,
    skillComposition,
    skillGaps,
    pipelineStages,
    sourceEffectiveness,
    aggregatedDiversity,
  };
}
