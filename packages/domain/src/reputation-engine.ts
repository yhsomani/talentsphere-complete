import crypto from 'node:crypto';
import { DomainError } from './index.js';

export type ReputationContext = 'candidate' | 'instructor' | 'employer' | 'peer' | 'community' | 'mentor';
export type ReputationBand = 'exceptional' | 'high' | 'established' | 'developing' | 'emerging';
export type ReputationSignalType =
  | 'credential'
  | 'endorsement'
  | 'review'
  | 'contribution'
  | 'peer_feedback'
  | 'assessment'
  | 'penalty';

export interface ReputationSignal {
  id: string;
  userId: string;
  sourceUserId?: string;
  context: ReputationContext;
  domain: string;
  signalType: ReputationSignalType;
  rawValue: number;
  weight: number;
  decayHalfLifeDays: number;
  evidenceReferenceId?: string;
  notes?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ReputationScore {
  id: string;
  userId: string;
  context: ReputationContext;
  domain: string;
  score: number;
  band: ReputationBand;
  confidenceScore: number;
  signalCount: number;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryTask {
  id: string;
  description: string;
  points: number;
  isCompleted: boolean;
}

export interface ReputationRecoveryPlan {
  id: string;
  userId: string;
  context: ReputationContext;
  penaltySignalId: string;
  targetReboundPoints: number;
  reboundTasks: RecoveryTask[];
  status: 'in_progress' | 'completed' | 'cancelled';
  completedAt?: string;
  createdAt: string;
}

export interface AddReputationSignalParams {
  id?: string;
  userId: string;
  sourceUserId?: string;
  context: ReputationContext;
  domain?: string;
  signalType: ReputationSignalType;
  rawValue: number;
  weight?: number;
  decayHalfLifeDays?: number;
  evidenceReferenceId?: string;
  notes?: string;
  isVerified?: boolean;
}

export interface StartRecoveryPlanParams {
  id?: string;
  userId: string;
  context: ReputationContext;
  penaltySignalId: string;
  targetReboundPoints: number;
  tasks: { description: string; points: number }[];
}

/**
 * Maps a numerical score (0-100) to its canonical reputation band.
 */
export function determineReputationBand(score: number): ReputationBand {
  if (score >= 85) return 'exceptional';
  if (score >= 70) return 'high';
  if (score >= 55) return 'established';
  if (score >= 40) return 'developing';
  return 'emerging';
}

/**
 * Creates and validates a new reputation signal.
 */
export function createReputationSignal(params: AddReputationSignalParams): ReputationSignal {
  if (!params.userId || params.userId.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'User ID is required.');
  }

  if (params.rawValue < -100 || params.rawValue > 100) {
    throw new DomainError('VALIDATION_FAILED', 'Raw signal value must be between -100 and +100.');
  }

  const weight = params.weight ?? (params.isVerified ? 1.0 : 0.5);
  if (weight < 0 || weight > 5) {
    throw new DomainError('VALIDATION_FAILED', 'Signal weight must be between 0 and 5.');
  }

  const halfLife = params.decayHalfLifeDays ?? 365;
  if (halfLife < 30 || halfLife > 3650) {
    throw new DomainError('VALIDATION_FAILED', 'Decay half-life must be between 30 and 3650 days.');
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    userId: params.userId,
    sourceUserId: params.sourceUserId,
    context: params.context,
    domain: (params.domain || 'general').toLowerCase().trim(),
    signalType: params.signalType,
    rawValue: params.rawValue,
    weight,
    decayHalfLifeDays: halfLife,
    evidenceReferenceId: params.evidenceReferenceId,
    notes: params.notes?.trim(),
    isVerified: params.isVerified ?? true,
    isActive: true,
    createdAt: now,
  };
}

/**
 * Computes deterministic multi-context reputation score from active signals.
 * Incorporates time decay: S_eff = rawValue * weight * 2^(-elapsedDays / T_half)
 */
export function calculateReputationScore(
  userId: string,
  context: ReputationContext,
  domain: string,
  signals: ReputationSignal[],
  currentTime?: Date
): ReputationScore {
  const now = currentTime || new Date();
  const activeSignals = signals.filter(
    (s) => s.userId === userId && s.context === context && s.domain === domain && s.isActive
  );

  let totalEffectiveImpact = 0;
  let totalWeight = 0;

  for (const sig of activeSignals) {
    const createdTime = new Date(sig.createdAt).getTime();
    const elapsedDays = Math.max(0, Math.floor((now.getTime() - createdTime) / (1000 * 60 * 60 * 24)));
    const decayFactor = Math.pow(0.5, elapsedDays / sig.decayHalfLifeDays);
    const effective = sig.rawValue * sig.weight * decayFactor;

    totalEffectiveImpact += effective;
    totalWeight += sig.weight;
  }

  // Base score starts at neutral 50.0
  // Scaling: normalized addition/subtraction
  const normalizationFactor = Math.max(1, totalWeight * 1.2);
  const delta = totalEffectiveImpact / normalizationFactor;
  const rawScore = 50 + delta;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore * 100) / 100));

  const confidenceScore = Math.min(1.0, Math.round((activeSignals.length / 5) * 100) / 100);
  const band = determineReputationBand(clampedScore);

  const timestamp = now.toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    context,
    domain,
    score: clampedScore,
    band,
    confidenceScore,
    signalCount: activeSignals.length,
    lastCalculatedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Initializes a structured reputation recovery plan after penalties.
 */
export function startReputationRecoveryPlan(params: StartRecoveryPlanParams): ReputationRecoveryPlan {
  if (!params.userId || params.userId.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'User ID is required.');
  }
  if (!params.penaltySignalId || params.penaltySignalId.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Penalty signal ID is required.');
  }
  if (params.targetReboundPoints <= 0) {
    throw new DomainError('VALIDATION_FAILED', 'Target rebound points must be greater than zero.');
  }
  if (!params.tasks || params.tasks.length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'At least one rebound task is required.');
  }

  const now = new Date().toISOString();
  const tasks: RecoveryTask[] = params.tasks.map((t) => ({
    id: crypto.randomUUID(),
    description: t.description.trim(),
    points: t.points,
    isCompleted: false,
  }));

  return {
    id: params.id || crypto.randomUUID(),
    userId: params.userId,
    context: params.context,
    penaltySignalId: params.penaltySignalId,
    targetReboundPoints: params.targetReboundPoints,
    reboundTasks: tasks,
    status: 'in_progress',
    createdAt: now,
  };
}

/**
 * Completes a task in a recovery plan and checks for plan completion.
 */
export function completeRecoveryTask(
  plan: ReputationRecoveryPlan,
  taskId: string,
  currentTime?: Date
): { plan: ReputationRecoveryPlan; completedTask: RecoveryTask; isFullyRecovered: boolean } {
  const taskIndex = plan.reboundTasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    throw new DomainError('NOT_FOUND', `Recovery task ${taskId} not found.`);
  }

  const now = (currentTime || new Date()).toISOString();
  const updatedTasks = [...plan.reboundTasks];
  const targetTask = { ...updatedTasks[taskIndex], isCompleted: true };
  updatedTasks[taskIndex] = targetTask;

  const totalCompletedPoints = updatedTasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + t.points, 0);

  const isFullyRecovered = totalCompletedPoints >= plan.targetReboundPoints;
  const status = isFullyRecovered ? 'completed' : 'in_progress';

  return {
    plan: {
      ...plan,
      reboundTasks: updatedTasks,
      status,
      completedAt: isFullyRecovered ? now : undefined,
    },
    completedTask: targetTask,
    isFullyRecovered,
  };
}
