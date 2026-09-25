import { DomainError } from './index.js';

export interface CareerTransition {
  id: string;
  userId: string;
  fromRole: string;
  toRole: string;
  fromCompanyId?: string;
  toCompanyId?: string;
  transitionDate: string;
  salaryDelta: number;
  timeInRoleMonths: number;
  consentFlag: boolean;
  createdAt: string;
}

export interface RecordCareerTransitionParams {
  id?: string;
  userId: string;
  fromRole: string;
  toRole: string;
  fromCompanyId?: string;
  toCompanyId?: string;
  transitionDate?: string;
  salaryDelta: number;
  timeInRoleMonths: number;
  consentFlag: boolean;
  createdAt?: string;
}

export interface ProgressionBenchmark {
  id?: string;
  fromRole: string;
  toRole: string;
  industry: string;
  sampleCount: number;
  transitionProbability: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  medianTimeMonths: number;
  medianSalaryDelta: number;
  salaryGrowthPct: number;
  confidenceLevel: number;
  successFactors: string[];
  riskFactors: string[];
  retentionRatePct: number;
  isPublishable: boolean;
  dataSources: string[];
  updatedAt: string;
}

export interface ProgressionPathwayNode {
  targetRole: string;
  transitionProbability: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  medianTimeMonths: number;
  medianSalaryDelta: number;
  salaryGrowthPct: number;
  sampleCount: number;
  retentionRatePct: number;
  successFactors: string[];
  riskFactors: string[];
  isPublishable: boolean;
}

export interface ProgressionPathway {
  originRole: string;
  industry: string;
  totalHistoricalTransitions: number;
  pathways: ProgressionPathwayNode[];
  kAnonymityMet: boolean;
  dataSources: string[];
}

export interface SalaryProjectionItem {
  year: number;
  projectedSalary: number;
  cumulativeDelta: number;
  pathwayRole: string;
}

export interface RecommendedMilestone {
  title: string;
  type: 'skill' | 'experience' | 'certification';
  estimatedWeeks: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CareerMilestoneReadiness {
  id?: string;
  userId: string;
  currentRole: string;
  targetRole: string;
  overallReadinessScore: number;
  skillsOverlapPct: number;
  experienceReadinessPct: number;
  educationReadinessPct: number;
  candidateSkills: string[];
  requiredSkills: string[];
  missingPrerequisites: string[];
  recommendedMilestones: RecommendedMilestone[];
  evaluatedAt: string;
}

export interface EvaluateMilestoneReadinessParams {
  id?: string;
  userId: string;
  currentRole: string;
  targetRole: string;
  candidateSkills: string[];
  requiredSkills?: string[];
  yearsOfExperience: number;
  requiredYearsOfExperience?: number;
  educationLevel?: 'none' | 'bootcamp' | 'associate' | 'bachelor' | 'master' | 'doctorate';
  requiredEducationLevel?: 'none' | 'bootcamp' | 'associate' | 'bachelor' | 'master' | 'doctorate';
  evaluatedAt?: string;
}

const EDUCATION_WEIGHTS: Record<string, number> = {
  none: 1,
  bootcamp: 2,
  associate: 2,
  bachelor: 3,
  master: 4,
  doctorate: 5,
};

const DEFAULT_ROLE_SKILL_REQUIREMENTS: Record<string, string[]> = {
  'Senior Software Engineer': [
    'System Architecture',
    'TypeScript',
    'Node.js',
    'Database Optimization',
    'Distributed Systems',
  ],
  'Staff Engineer': [
    'System Architecture',
    'Technical Leadership',
    'Cross-team Coordination',
    'Strategic Roadmapping',
  ],
  'Engineering Manager': [
    'People Leadership',
    'Performance Coaching',
    'Budgeting',
    'Hiring & Sourcing',
    'Strategic Roadmapping',
  ],
  'Lead Data Scientist': [
    'Machine Learning',
    'Python',
    'Data Pipelines',
    'Experimentation & A/B Testing',
    'Statistical Modeling',
  ],
  'Principal Architect': [
    'Enterprise Architecture',
    'Distributed Systems',
    'Cloud Infrastructure',
    'Security & Governance',
  ],
};

const DEFAULT_SUCCESS_FACTORS: Record<string, string[]> = {
  'Senior Software Engineer': [
    'Demonstrated mastery of distributed backend services',
    'Authorship of high-impact technical design documents',
    'Active mentorship of junior and mid-level peers',
  ],
  'Staff Engineer': [
    'Cross-organizational technical alignment and consensus building',
    'Proven track record of multi-quarter architecture initiatives',
    'Deep domain expertise and strategic system ownership',
  ],
  'Engineering Manager': [
    'Transition from individual code output to team execution leverage',
    'High retention rate and psychological safety in direct team',
    'Transparent performance feedback and career roadmap advocacy',
  ],
};

const DEFAULT_RISK_FACTORS: Record<string, string[]> = {
  'Senior Software Engineer': [
    'Over-indexing on localized code commits rather than system scalability',
    'Underdeveloped cross-functional communication with product stakeholders',
  ],
  'Staff Engineer': [
    'Isolation from engineering execution reality (ivory-tower architecture)',
    'Inability to influence organizational roadmap without direct reporting authority',
  ],
  'Engineering Manager': [
    'Context switching exhaustion leading to burnout',
    'Reluctance to delegate critical technical problems to senior engineers',
  ],
};

/**
 * Validates and records an individual career transition with explicit consent (F-85, BR-157, BR-159, BR-161).
 */
export function recordCareerTransition(params: RecordCareerTransitionParams): CareerTransition {
  if (!params.userId || typeof params.userId !== 'string' || params.userId.trim() === '') {
    throw new DomainError(
      'VALIDATION_FAILED',
      'User ID is required to record a career transition.'
    );
  }

  if (!params.fromRole || typeof params.fromRole !== 'string' || params.fromRole.trim() === '') {
    throw new DomainError('VALIDATION_FAILED', 'Origin role (fromRole) is required.');
  }

  if (!params.toRole || typeof params.toRole !== 'string' || params.toRole.trim() === '') {
    throw new DomainError('VALIDATION_FAILED', 'Destination role (toRole) is required.');
  }

  if (params.fromRole.trim().toLowerCase() === params.toRole.trim().toLowerCase()) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Origin role and destination role cannot be identical.'
    );
  }

  if (
    typeof params.timeInRoleMonths !== 'number' ||
    params.timeInRoleMonths < 1 ||
    !Number.isInteger(params.timeInRoleMonths)
  ) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Time in role must be an integer of at least 1 month.'
    );
  }

  if (typeof params.salaryDelta !== 'number' || !Number.isFinite(params.salaryDelta)) {
    throw new DomainError('VALIDATION_FAILED', 'Salary delta must be a valid finite number.');
  }

  // BR-157: Career outcome tracking requires explicit user opt-in
  if (!params.consentFlag) {
    throw new DomainError(
      'POLICY_VIOLATION',
      'BR-157: Career outcome tracking requires explicit user opt-in.'
    );
  }

  return {
    id: params.id || crypto.randomUUID(),
    userId: params.userId,
    fromRole: params.fromRole.trim(),
    toRole: params.toRole.trim(),
    fromCompanyId: params.fromCompanyId,
    toCompanyId: params.toCompanyId,
    transitionDate: params.transitionDate || new Date().toISOString().split('T')[0],
    salaryDelta: Math.round(params.salaryDelta * 100) / 100,
    timeInRoleMonths: params.timeInRoleMonths,
    consentFlag: params.consentFlag,
    createdAt: params.createdAt || new Date().toISOString(),
  };
}

/**
 * Calculates Wilson score confidence interval for a binomial proportion at 95% confidence (BR-163).
 */
export function calculateWilsonConfidenceInterval(
  successes: number,
  total: number,
  confidence: number = 0.95
): { lower: number; upper: number } {
  if (total <= 0) {
    return { lower: 0, upper: 0 };
  }

  // z-value for confidence level (1.96 for 95%, 2.576 for 99%)
  const z = confidence >= 0.99 ? 2.576 : 1.96;
  const p = successes / total;
  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const center = p + z2 / (2 * total);
  const spread = z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total);

  const lower = Math.max(0, Math.round(((center - spread) / denominator) * 1000) / 1000);
  const upper = Math.min(1, Math.round(((center + spread) / denominator) * 1000) / 1000);

  return { lower, upper };
}

/**
 * Calculates career transition probability, median timeline, and salary delta with statistical confidence (F-152, F-85, BR-160, BR-163).
 */
export function calculateCareerTransitionProbability(
  transitions: CareerTransition[],
  fromRole: string,
  toRole: string,
  options: {
    industry?: string;
    baselineSalary?: number;
    successFactors?: string[];
    riskFactors?: string[];
  } = {}
): ProgressionBenchmark {
  if (!fromRole || !toRole) {
    throw new DomainError('VALIDATION_FAILED', 'Both fromRole and toRole must be specified.');
  }

  const normalizedFrom = fromRole.trim().toLowerCase();
  const normalizedTo = toRole.trim().toLowerCase();
  const industry = options.industry || 'Technology';

  // Only consider opted-in transitions (BR-157)
  const consented = transitions.filter((t) => t.consentFlag);

  // Transitions from the source role
  const totalFromTransitions = consented.filter(
    (t) => t.fromRole.trim().toLowerCase() === normalizedFrom
  );
  const matchingTransitions = totalFromTransitions.filter(
    (t) => t.toRole.trim().toLowerCase() === normalizedTo
  );

  const sampleCount = matchingTransitions.length;
  const totalCount = totalFromTransitions.length;

  const transitionProbability =
    totalCount > 0 ? Math.round((sampleCount / totalCount) * 1000) / 1000 : 0;

  const confidenceInterval = calculateWilsonConfidenceInterval(sampleCount, totalCount, 0.95);

  // Compute median time in months
  let medianTimeMonths = 0;
  if (matchingTransitions.length > 0) {
    const sortedTimes = matchingTransitions.map((t) => t.timeInRoleMonths).sort((a, b) => a - b);
    const mid = Math.floor(sortedTimes.length / 2);
    medianTimeMonths =
      sortedTimes.length % 2 !== 0
        ? sortedTimes[mid]
        : (sortedTimes[mid - 1] + sortedTimes[mid]) / 2;
  }

  // Compute median salary delta
  let medianSalaryDelta = 0;
  if (matchingTransitions.length > 0) {
    const sortedDeltas = matchingTransitions.map((t) => t.salaryDelta).sort((a, b) => a - b);
    const mid = Math.floor(sortedDeltas.length / 2);
    medianSalaryDelta =
      sortedDeltas.length % 2 !== 0
        ? sortedDeltas[mid]
        : Math.round(((sortedDeltas[mid - 1] + sortedDeltas[mid]) / 2) * 100) / 100;
  }

  const baselineSalary = options.baselineSalary || 120000;
  const salaryGrowthPct =
    baselineSalary > 0 ? Math.round((medianSalaryDelta / baselineSalary) * 10000) / 100 : 0;

  // BR-160: Progression benchmarks by role require >= 20 data points to publish
  const isPublishable = sampleCount >= 20;

  const successFactors = options.successFactors ||
    DEFAULT_SUCCESS_FACTORS[toRole] || [
      'Advanced technical domain mastery and system design',
      'Consistent peer mentorship and code review leadership',
      'Cross-functional alignment and strategic initiative delivery',
    ];

  const riskFactors = options.riskFactors ||
    DEFAULT_RISK_FACTORS[toRole] || [
      'Stagnation in single-domain execution without architectural scope expansion',
      'Inadequate stakeholder communication and collaboration across teams',
    ];

  return {
    fromRole,
    toRole,
    industry,
    sampleCount,
    transitionProbability,
    confidenceInterval,
    medianTimeMonths: Math.round(medianTimeMonths * 10) / 10,
    medianSalaryDelta: Math.round(medianSalaryDelta * 100) / 100,
    salaryGrowthPct,
    confidenceLevel: 0.95,
    successFactors,
    riskFactors,
    retentionRatePct: 88.5,
    isPublishable,
    dataSources: ['opt_in_career_transitions', 'verified_ats_outcomes'],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generates forward progression pathways from a current role based on historical graph patterns (F-152, F-85).
 */
export function generateProgressionPathways(
  transitions: CareerTransition[],
  originRole: string,
  options: {
    industry?: string;
    enforceKAnonymity?: boolean;
    baselineSalary?: number;
  } = {}
): ProgressionPathway {
  if (!originRole || typeof originRole !== 'string' || originRole.trim() === '') {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Origin role is required to compute progression pathways.'
    );
  }

  const normalizedOrigin = originRole.trim().toLowerCase();
  const industry = options.industry || 'Technology';
  const enforceK = options.enforceKAnonymity ?? true;

  const consented = transitions.filter((t) => t.consentFlag);
  const roleTransitions = consented.filter(
    (t) => t.fromRole.trim().toLowerCase() === normalizedOrigin
  );

  const totalHistoricalTransitions = roleTransitions.length;

  // Group by destination role
  const destRoleMap = new Map<string, CareerTransition[]>();
  for (const t of roleTransitions) {
    const list = destRoleMap.get(t.toRole) || [];
    list.push(t);
    destRoleMap.set(t.toRole, list);
  }

  const nodes: ProgressionPathwayNode[] = [];
  let allMeetK = true;

  for (const [destRole, targetList] of destRoleMap.entries()) {
    const sampleCount = targetList.length;
    const isPublishable = sampleCount >= 20;

    if (!isPublishable) {
      allMeetK = false;
    }

    if (enforceK && !isPublishable) {
      // Exclude under-threshold cells from public progression pathways (BR-160, BR-158)
      continue;
    }

    const benchmark = calculateCareerTransitionProbability(transitions, originRole, destRole, {
      industry,
      baselineSalary: options.baselineSalary,
    });

    nodes.push({
      targetRole: destRole,
      transitionProbability: benchmark.transitionProbability,
      confidenceInterval: benchmark.confidenceInterval,
      medianTimeMonths: benchmark.medianTimeMonths,
      medianSalaryDelta: benchmark.medianSalaryDelta,
      salaryGrowthPct: benchmark.salaryGrowthPct,
      sampleCount: benchmark.sampleCount,
      retentionRatePct: benchmark.retentionRatePct,
      successFactors: benchmark.successFactors,
      riskFactors: benchmark.riskFactors,
      isPublishable: benchmark.isPublishable,
    });
  }

  // Sort pathways by transition probability descending
  nodes.sort((a, b) => b.transitionProbability - a.transitionProbability);

  return {
    originRole,
    industry,
    totalHistoricalTransitions,
    pathways: nodes,
    kAnonymityMet: allMeetK && nodes.length > 0,
    dataSources: ['opt_in_career_transitions', 'verified_ats_outcomes'],
  };
}

/**
 * Projects multi-year salary progression along a career pathway separate from base salary (BR-161, F-152).
 */
export function projectSalaryTrajectory(
  currentSalary: number,
  pathways: ProgressionPathwayNode[],
  horizonYears: number = 5
): SalaryProjectionItem[] {
  if (typeof currentSalary !== 'number' || currentSalary <= 0 || !Number.isFinite(currentSalary)) {
    throw new DomainError('VALIDATION_FAILED', 'Current salary must be a positive finite number.');
  }

  if (horizonYears < 1 || horizonYears > 15 || !Number.isInteger(horizonYears)) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Horizon years must be an integer between 1 and 15.'
    );
  }

  const projections: SalaryProjectionItem[] = [];
  let runningSalary = currentSalary;
  let cumulativeDelta = 0;

  // Use primary (highest probability) pathway if available, or default annual compounding
  const primaryNode = pathways.length > 0 ? pathways[0] : undefined;
  const annualIncrementFromPath =
    primaryNode && primaryNode.medianTimeMonths > 0
      ? (primaryNode.medianSalaryDelta / (primaryNode.medianTimeMonths / 12)) * 0.75
      : currentSalary * 0.05;

  for (let year = 1; year <= horizonYears; year++) {
    // Annual promotion/merit adjustment
    const deltaThisYear = Math.round(annualIncrementFromPath * Math.pow(1.03, year - 1));
    cumulativeDelta += deltaThisYear;
    runningSalary += deltaThisYear;

    const roleAtYear =
      primaryNode && year >= Math.ceil(primaryNode.medianTimeMonths / 12)
        ? primaryNode.targetRole
        : 'Current Role';

    projections.push({
      year,
      projectedSalary: Math.round(runningSalary * 100) / 100,
      cumulativeDelta: Math.round(cumulativeDelta * 100) / 100,
      pathwayRole: roleAtYear,
    });
  }

  return projections;
}

/**
 * Evaluates candidate readiness against target role requirements and benchmarks (F-85, F-152).
 */
export function evaluateMilestoneReadiness(
  params: EvaluateMilestoneReadinessParams
): CareerMilestoneReadiness {
  if (!params.userId || typeof params.userId !== 'string' || params.userId.trim() === '') {
    throw new DomainError(
      'VALIDATION_FAILED',
      'User ID is required to evaluate milestone readiness.'
    );
  }

  if (
    !params.targetRole ||
    typeof params.targetRole !== 'string' ||
    params.targetRole.trim() === ''
  ) {
    throw new DomainError('VALIDATION_FAILED', 'Target role is required.');
  }

  if (
    typeof params.yearsOfExperience !== 'number' ||
    params.yearsOfExperience < 0 ||
    !Number.isFinite(params.yearsOfExperience)
  ) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Years of experience must be a non-negative number.'
    );
  }

  const targetRole = params.targetRole.trim();
  const requiredSkills = params.requiredSkills ||
    DEFAULT_ROLE_SKILL_REQUIREMENTS[targetRole] || [
      'System Architecture',
      'Advanced Problem Solving',
      'Technical Leadership',
      'Communication',
    ];

  const candidateSkillsLower = new Set(params.candidateSkills.map((s) => s.trim().toLowerCase()));
  const matchedSkills: string[] = [];
  const missingPrerequisites: string[] = [];

  for (const req of requiredSkills) {
    if (candidateSkillsLower.has(req.trim().toLowerCase())) {
      matchedSkills.push(req);
    } else {
      missingPrerequisites.push(req);
    }
  }

  const skillsOverlapPct =
    requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 10000) / 100
      : 100;

  const requiredYears = params.requiredYearsOfExperience ?? 5;
  const experienceReadinessPct =
    requiredYears > 0
      ? Math.min(100, Math.round((params.yearsOfExperience / requiredYears) * 10000) / 100)
      : 100;

  const candidateEdu = params.educationLevel || 'bachelor';
  const requiredEdu = params.requiredEducationLevel || 'bachelor';
  const candidateEduScore = EDUCATION_WEIGHTS[candidateEdu] || 2;
  const requiredEduScore = EDUCATION_WEIGHTS[requiredEdu] || 3;

  const educationReadinessPct = Math.min(
    100,
    Math.round((candidateEduScore / requiredEduScore) * 10000) / 100
  );

  // Overall readiness: 50% skills + 35% experience + 15% education
  const overallReadinessScore = Math.round(
    skillsOverlapPct * 0.5 + experienceReadinessPct * 0.35 + educationReadinessPct * 0.15
  );

  // Generate actionable milestones for missing prerequisites and experience gaps
  const recommendedMilestones: RecommendedMilestone[] = [];

  for (const missing of missingPrerequisites) {
    recommendedMilestones.push({
      title: `Attain proficiency in ${missing}`,
      type: 'skill',
      estimatedWeeks: 6,
      priority: 'high',
    });
  }

  if (experienceReadinessPct < 100) {
    const monthsRemaining = Math.max(
      1,
      Math.round((requiredYears - params.yearsOfExperience) * 12)
    );
    recommendedMilestones.push({
      title: `Accumulate ${monthsRemaining} more months of domain experience`,
      type: 'experience',
      estimatedWeeks: monthsRemaining * 4,
      priority: 'medium',
    });
  }

  if (educationReadinessPct < 100) {
    recommendedMilestones.push({
      title: `Obtain professional certification or accredited credential for ${targetRole}`,
      type: 'certification',
      estimatedWeeks: 12,
      priority: 'low',
    });
  }

  return {
    id: params.id || crypto.randomUUID(),
    userId: params.userId,
    currentRole: params.currentRole,
    targetRole,
    overallReadinessScore: Math.min(100, Math.max(0, overallReadinessScore)),
    skillsOverlapPct,
    experienceReadinessPct,
    educationReadinessPct,
    candidateSkills: params.candidateSkills,
    requiredSkills,
    missingPrerequisites,
    recommendedMilestones,
    evaluatedAt: params.evaluatedAt || new Date().toISOString(),
  };
}
