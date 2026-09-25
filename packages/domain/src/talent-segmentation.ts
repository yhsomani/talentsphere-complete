import { DomainError } from './index.js';

export type TalentSpecialization =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'devops_cloud'
  | 'data_ai'
  | 'mobile'
  | 'security'
  | 'system_architecture'
  | 'generalist';

export type SeniorityTier = 'entry' | 'mid' | 'senior' | 'staff' | 'principal';

export type EngagementSegment = 'active' | 'open' | 'passive' | 'stealth' | 'inactive';

export type ReadinessBand = 'ready_now' | 'near_ready' | 'in_training' | 'unassessed';

export interface CandidateSegmentation {
  id: string;
  candidateId: string;
  specialization: TalentSpecialization;
  seniorityTier: SeniorityTier;
  engagementSegment: EngagementSegment;
  readinessBand: ReadinessBand;
  confidenceScore: number;
  primarySkills: string[];
  yearsOfExperience: number;
  classifiedAt: string;
  updatedAt: string;
}

export interface CandidateClassificationInput {
  candidateId: string;
  skills: string[];
  yearsOfExperience: number;
  lastActiveDays: number;
  isStealthMode?: boolean;
  recentApplicationCount?: number;
  verifiedEvidenceCount?: number;
  assessmentsPassedCount?: number;
  skillDecayRiskCount?: number;
  milestoneReadinessScore?: number;
}

export interface SegmentDistributionItem {
  segment: string;
  count: number | '<10';
  percentage: number | null;
  isSuppressed: boolean;
}

export interface SegmentDistributionReport {
  totalAnalyzed: number;
  kThreshold: number;
  bySpecialization: SegmentDistributionItem[];
  bySeniority: SegmentDistributionItem[];
  byEngagement: SegmentDistributionItem[];
  byReadiness: SegmentDistributionItem[];
  suppressedCellCount: number;
}

export interface SegmentFilter {
  specializations?: TalentSpecialization[];
  seniorityTiers?: SeniorityTier[];
  engagementSegments?: EngagementSegment[];
  readinessBands?: ReadinessBand[];
  minConfidenceScore?: number;
  minYearsOfExperience?: number;
  maxYearsOfExperience?: number;
  limit?: number;
  offset?: number;
}

const SPECIALIZATION_KEYWORDS: Record<TalentSpecialization, string[]> = {
  frontend: [
    'react',
    'vue',
    'angular',
    'svelte',
    'nextjs',
    'css',
    'html',
    'tailwind',
    'ui/ux',
    'web',
  ],
  backend: [
    'node',
    'express',
    'nestjs',
    'django',
    'fastapi',
    'spring',
    'go',
    'golang',
    'rust',
    'sql',
    'postgres',
    'graphql',
    'grpc',
  ],
  fullstack: ['fullstack', 'full-stack', 'mern', 'mean'],
  devops_cloud: [
    'docker',
    'kubernetes',
    'k8s',
    'terraform',
    'aws',
    'gcp',
    'azure',
    'ci/cd',
    'linux',
    'ansible',
    'helm',
  ],
  data_ai: [
    'python',
    'machine learning',
    'ai',
    'deep learning',
    'pytorch',
    'tensorflow',
    'pandas',
    'numpy',
    'bigquery',
    'data science',
    'spark',
  ],
  mobile: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'mobile'],
  security: [
    'cybersecurity',
    'infosec',
    'penetration testing',
    'iam',
    'cryptography',
    'soc2',
    'security',
    'zero trust',
  ],
  system_architecture: [
    'distributed systems',
    'system architecture',
    'microservices',
    'high availability',
    'scalability',
    'system design',
    'consensus',
  ],
  generalist: ['software engineering', 'programming', 'algorithms', 'git', 'computer science'],
};

/**
 * Determines primary candidate specialization based on verified skills keyword matching.
 */
export function classifyCandidateSpecialization(skills: string[]): {
  specialization: TalentSpecialization;
  confidence: number;
} {
  if (!skills || skills.length === 0) {
    return { specialization: 'generalist', confidence: 30 };
  }

  const normalized = skills.map((s) => s.trim().toLowerCase());
  const scores: Record<TalentSpecialization, number> = {
    frontend: 0,
    backend: 0,
    fullstack: 0,
    devops_cloud: 0,
    data_ai: 0,
    mobile: 0,
    security: 0,
    system_architecture: 0,
    generalist: 0,
  };

  for (const skill of normalized) {
    for (const [spec, keywords] of Object.entries(SPECIALIZATION_KEYWORDS) as [
      TalentSpecialization,
      string[],
    ][]) {
      if (keywords.some((kw) => skill.includes(kw) || kw.includes(skill))) {
        scores[spec] += 1;
      }
    }
  }

  // Fullstack check: strong signals in both frontend and backend
  if (scores.frontend >= 2 && scores.backend >= 2) {
    scores.fullstack += scores.frontend + scores.backend;
  }

  let bestSpec: TalentSpecialization = 'generalist';
  let bestScore = scores.generalist;

  for (const [spec, score] of Object.entries(scores) as [TalentSpecialization, number][]) {
    if (score > bestScore) {
      bestScore = score;
      bestSpec = spec;
    }
  }

  // Calculate confidence score (30 - 100)
  const confidence = Math.min(100, Math.max(40, bestScore * 20));
  return { specialization: bestSpec, confidence };
}

/**
 * Determines seniority tier strictly from verified years of experience and optional milestone score.
 */
export function classifySeniorityTier(
  yearsOfExperience: number,
  milestoneScore?: number
): SeniorityTier {
  if (yearsOfExperience < 0) {
    throw new DomainError('VALIDATION_FAILED', 'Years of experience cannot be negative.');
  }

  if (yearsOfExperience >= 13 || (yearsOfExperience >= 10 && (milestoneScore ?? 0) >= 90)) {
    return 'principal';
  }
  if (yearsOfExperience >= 9 || (yearsOfExperience >= 7 && (milestoneScore ?? 0) >= 80)) {
    return 'staff';
  }
  if (yearsOfExperience >= 6 || (yearsOfExperience >= 4 && (milestoneScore ?? 0) >= 70)) {
    return 'senior';
  }
  if (yearsOfExperience >= 3) {
    return 'mid';
  }
  return 'entry';
}

/**
 * Determines engagement segment from activity recency and stealth mode status.
 */
export function classifyEngagementSegment(
  lastActiveDays: number,
  isStealthMode: boolean = false,
  recentAppCount: number = 0
): EngagementSegment {
  if (isStealthMode) {
    return 'stealth';
  }
  if (lastActiveDays <= 14 || recentAppCount >= 1) {
    return 'active';
  }
  if (lastActiveDays <= 60) {
    return 'open';
  }
  if (lastActiveDays <= 180) {
    return 'passive';
  }
  return 'inactive';
}

/**
 * Determines readiness band based on evidence, assessments, and skill freshness.
 */
export function classifyReadinessBand(
  verifiedEvidenceCount: number = 0,
  assessmentsPassed: number = 0,
  skillDecayRiskCount: number = 0
): ReadinessBand {
  if (skillDecayRiskCount > 0) {
    return 'in_training';
  }
  if (verifiedEvidenceCount >= 3 && assessmentsPassed >= 1) {
    return 'ready_now';
  }
  if (verifiedEvidenceCount >= 1 || assessmentsPassed >= 1) {
    return 'near_ready';
  }
  return 'unassessed';
}

/**
 * Classifies a candidate into multidimensional talent segmentation profile.
 */
export function classifyCandidate(input: CandidateClassificationInput): CandidateSegmentation {
  const { specialization, confidence } = classifyCandidateSpecialization(input.skills);
  const seniorityTier = classifySeniorityTier(
    input.yearsOfExperience,
    input.milestoneReadinessScore
  );
  const engagementSegment = classifyEngagementSegment(
    input.lastActiveDays,
    input.isStealthMode ?? false,
    input.recentApplicationCount ?? 0
  );
  const readinessBand = classifyReadinessBand(
    input.verifiedEvidenceCount ?? 0,
    input.assessmentsPassedCount ?? 0,
    input.skillDecayRiskCount ?? 0
  );

  const now = new Date().toISOString();
  return {
    id: `seg_${crypto.randomUUID()}`,
    candidateId: input.candidateId,
    specialization,
    seniorityTier,
    engagementSegment,
    readinessBand,
    confidenceScore: confidence,
    primarySkills: (input.skills || []).map((s) => s.trim().toLowerCase()),
    yearsOfExperience: input.yearsOfExperience,
    classifiedAt: now,
    updatedAt: now,
  };
}

/**
 * Helper to build anonymized distribution bucket with k-anonymity suppression (BR-200).
 */
function buildDistributionDimension<T extends string>(
  items: T[],
  total: number,
  kThreshold: number
): { list: SegmentDistributionItem[]; suppressedCount: number } {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  let suppressedCount = 0;
  const list: SegmentDistributionItem[] = [];

  for (const [segment, count] of counts.entries()) {
    if (count < kThreshold) {
      suppressedCount += 1;
      list.push({
        segment,
        count: '<10',
        percentage: null,
        isSuppressed: true,
      });
    } else {
      const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
      list.push({
        segment,
        count,
        percentage: pct,
        isSuppressed: false,
      });
    }
  }

  // Sort descending by count when not suppressed
  list.sort((a, b) => {
    if (a.isSuppressed && !b.isSuppressed) return 1;
    if (!a.isSuppressed && b.isSuppressed) return -1;
    return (b.count as number) - (a.count as number);
  });

  return { list, suppressedCount };
}

/**
 * Aggregates candidate segmentations into an anonymized distribution report with k-anonymity.
 */
export function aggregateSegmentDistribution(
  segmentations: CandidateSegmentation[],
  kThreshold: number = 10
): SegmentDistributionReport {
  const total = segmentations.length;

  const spec = buildDistributionDimension(
    segmentations.map((s) => s.specialization),
    total,
    kThreshold
  );
  const sen = buildDistributionDimension(
    segmentations.map((s) => s.seniorityTier),
    total,
    kThreshold
  );
  const eng = buildDistributionDimension(
    segmentations.map((s) => s.engagementSegment),
    total,
    kThreshold
  );
  const read = buildDistributionDimension(
    segmentations.map((s) => s.readinessBand),
    total,
    kThreshold
  );

  return {
    totalAnalyzed: total,
    kThreshold,
    bySpecialization: spec.list,
    bySeniority: sen.list,
    byEngagement: eng.list,
    byReadiness: read.list,
    suppressedCellCount:
      spec.suppressedCount + sen.suppressedCount + eng.suppressedCount + read.suppressedCount,
  };
}

/**
 * Filters segmented candidates according to recruiter criteria.
 */
export function filterSegmentedTalent(
  segmentations: CandidateSegmentation[],
  filter: SegmentFilter
): { results: CandidateSegmentation[]; total: number } {
  let matched = segmentations.slice();

  if (filter.specializations && filter.specializations.length > 0) {
    const allowed = new Set(filter.specializations);
    matched = matched.filter((s) => allowed.has(s.specialization));
  }

  if (filter.seniorityTiers && filter.seniorityTiers.length > 0) {
    const allowed = new Set(filter.seniorityTiers);
    matched = matched.filter((s) => allowed.has(s.seniorityTier));
  }

  if (filter.engagementSegments && filter.engagementSegments.length > 0) {
    const allowed = new Set(filter.engagementSegments);
    matched = matched.filter((s) => allowed.has(s.engagementSegment));
  }

  if (filter.readinessBands && filter.readinessBands.length > 0) {
    const allowed = new Set(filter.readinessBands);
    matched = matched.filter((s) => allowed.has(s.readinessBand));
  }

  if (filter.minConfidenceScore !== undefined) {
    matched = matched.filter((s) => s.confidenceScore >= filter.minConfidenceScore!);
  }

  if (filter.minYearsOfExperience !== undefined) {
    matched = matched.filter((s) => s.yearsOfExperience >= filter.minYearsOfExperience!);
  }

  if (filter.maxYearsOfExperience !== undefined) {
    matched = matched.filter((s) => s.yearsOfExperience <= filter.maxYearsOfExperience!);
  }

  // Sort descending by confidence score and years of experience
  matched.sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }
    return b.yearsOfExperience - a.yearsOfExperience;
  });

  const total = matched.length;
  const offset = filter.offset || 0;
  const limit = filter.limit || 50;
  const results = matched.slice(offset, offset + limit);

  return { results, total };
}
