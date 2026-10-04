export type QuestionCategory = 'code' | 'design' | 'behavioral' | 'text';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewAssessmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'scored' | 'reviewed';
export type RecordingStatus = 'disabled' | 'consented' | 'active' | 'completed';
export type InterviewRecommendation = 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
export interface InterviewQuestionTestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}
export interface InterviewQuestion {
    id: string;
    orgId: string;
    createdByUserId: string;
    title: string;
    statement: string;
    category: QuestionCategory;
    difficulty: QuestionDifficulty;
    durationMinutes: number;
    expectedCompetencies: string[];
    testCases: InterviewQuestionTestCase[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface InterviewAssessment {
    id: string;
    orgId: string;
    applicationId?: string;
    candidateProfileId: string;
    interviewerUserId: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    status: InterviewAssessmentStatus;
    meetingUrl: string;
    questionIds: string[];
    candidateJoinedAt?: string;
    interviewerJoinedAt?: string;
    endedAt?: string;
    recordingConsentCandidate: boolean;
    recordingConsentInterviewer: boolean;
    recordingStatus: RecordingStatus;
    retentionExpiresAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface InterviewScorecard {
    id: string;
    assessmentId: string;
    interviewerUserId: string;
    technicalCorrectness: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    recommendation: InterviewRecommendation;
    overallScore: number;
    strengths: string;
    areasForImprovement: string;
    privateNotes?: string;
    revisionNumber: number;
    parentScorecardId?: string;
    compensationReason?: string;
    createdAt: string;
}
export interface InterviewAiFeedback {
    id: string;
    assessmentId: string;
    communicationClarityScore: number;
    technicalSummary: string;
    suggestedImprovements: string[];
    isAdvisory: boolean;
    requiresHumanReview: boolean;
    excludedProtectedAttributes: boolean;
    createdAt: string;
}
export interface CreateInterviewQuestionParams {
    id?: string;
    orgId: string;
    createdByUserId: string;
    title: string;
    statement: string;
    category: QuestionCategory;
    difficulty: QuestionDifficulty;
    durationMinutes?: number;
    expectedCompetencies?: string[];
    testCases?: InterviewQuestionTestCase[];
}
export interface ScheduleInterviewAssessmentParams {
    id?: string;
    orgId: string;
    applicationId?: string;
    candidateProfileId: string;
    interviewerUserId: string;
    title: string;
    scheduledAt: string;
    durationMinutes?: number;
    meetingUrl?: string;
    questionIds?: string[];
}
export interface SubmitScorecardParams {
    id?: string;
    interviewerUserId: string;
    technicalCorrectness: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    recommendation: InterviewRecommendation;
    strengths: string;
    areasForImprovement: string;
    privateNotes?: string;
}
export interface CompensateScorecardParams {
    id?: string;
    interviewerUserId: string;
    technicalCorrectness: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    recommendation: InterviewRecommendation;
    strengths: string;
    areasForImprovement: string;
    compensationReason: string;
    privateNotes?: string;
}
/**
 * Creates an interview question for company-scoped question bank (BR-173).
 */
export declare function createInterviewQuestion(params: CreateInterviewQuestionParams): InterviewQuestion;
/**
 * Schedules an interview assessment (F-88).
 */
export declare function scheduleInterviewAssessment(params: ScheduleInterviewAssessmentParams): InterviewAssessment;
/**
 * Handles a participant joining the session and transitions to in_progress.
 */
export declare function joinInterviewAssessment(assessment: InterviewAssessment, role: 'candidate' | 'interviewer', currentTime?: Date): InterviewAssessment;
/**
 * Sets recording consent with dual-consent enforcement (BR-169, BR-170).
 */
export declare function updateRecordingConsent(assessment: InterviewAssessment, role: 'candidate' | 'interviewer', consent: boolean, currentTime?: Date): InterviewAssessment;
/**
 * Concludes the interview session.
 */
export declare function endInterviewAssessment(assessment: InterviewAssessment, resolution: 'completed' | 'cancelled' | 'no_show', currentTime?: Date): InterviewAssessment;
/**
 * Submits structured interview scorecard (BR-174, BR-176).
 */
export declare function submitInterviewScorecard(assessment: InterviewAssessment, params: SubmitScorecardParams): {
    assessment: InterviewAssessment;
    scorecard: InterviewScorecard;
};
/**
 * Creates compensating scorecard entry to preserve append-only ledger (BR-174).
 */
export declare function compensateInterviewScorecard(original: InterviewScorecard, assessment: InterviewAssessment, params: CompensateScorecardParams): {
    assessment: InterviewAssessment;
    scorecard: InterviewScorecard;
};
/**
 * Reviews and approves interview assessment by Hiring Manager (F-102, state: reviewed).
 */
export declare function reviewInterviewAssessment(assessment: InterviewAssessment): InterviewAssessment;
/**
 * Generates advisory AI feedback with strict exclusion of protected attributes (BR-171, BR-172).
 */
export declare function generateAdvisoryAiFeedback(assessment: InterviewAssessment, codeResult?: {
    passed: number;
    total: number;
}): InterviewAiFeedback;
/**
 * Reuses challenge code execution sandbox for live coding evaluation (BR-175).
 */
export declare function executeInterviewCode(code: string, testCases: InterviewQuestionTestCase[]): {
    passed: number;
    total: number;
    runs: {
        input: string;
        expected: string;
        actual: string;
        passed: boolean;
    }[];
};
//# sourceMappingURL=technical-interview.d.ts.map