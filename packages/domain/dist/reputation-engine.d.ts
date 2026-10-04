export type ReputationContext = 'candidate' | 'instructor' | 'employer' | 'peer' | 'community' | 'mentor';
export type ReputationBand = 'exceptional' | 'high' | 'established' | 'developing' | 'emerging';
export type ReputationSignalType = 'credential' | 'endorsement' | 'review' | 'contribution' | 'peer_feedback' | 'assessment' | 'penalty';
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
    tasks: {
        description: string;
        points: number;
    }[];
}
/**
 * Maps a numerical score (0-100) to its canonical reputation band.
 */
export declare function determineReputationBand(score: number): ReputationBand;
/**
 * Creates and validates a new reputation signal.
 */
export declare function createReputationSignal(params: AddReputationSignalParams): ReputationSignal;
/**
 * Computes deterministic multi-context reputation score from active signals.
 * Incorporates time decay: S_eff = rawValue * weight * 2^(-elapsedDays / T_half)
 */
export declare function calculateReputationScore(userId: string, context: ReputationContext, domain: string, signals: ReputationSignal[], currentTime?: Date): ReputationScore;
/**
 * Initializes a structured reputation recovery plan after penalties.
 */
export declare function startReputationRecoveryPlan(params: StartRecoveryPlanParams): ReputationRecoveryPlan;
/**
 * Completes a task in a recovery plan and checks for plan completion.
 */
export declare function completeRecoveryTask(plan: ReputationRecoveryPlan, taskId: string, currentTime?: Date): {
    plan: ReputationRecoveryPlan;
    completedTask: RecoveryTask;
    isFullyRecovered: boolean;
};
//# sourceMappingURL=reputation-engine.d.ts.map