import { describe, it, expect } from 'vitest';
import {
  createInterviewQuestion,
  scheduleInterviewAssessment,
  joinInterviewAssessment,
  updateRecordingConsent,
  endInterviewAssessment,
  submitInterviewScorecard,
  compensateInterviewScorecard,
  reviewInterviewAssessment,
  generateAdvisoryAiFeedback,
  executeInterviewCode,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Domain: Technical Interview Assessment Platform (F-88, S-06, BR-169..BR-176)', () => {
  const orgId = '11111111-1111-4111-a111-111111111111';
  const recruiterId = '22222222-2222-4222-a222-222222222222';
  const interviewerId = '33333333-3333-4333-a333-333333333333';
  const candidateProfileId = '44444444-4444-4444-a444-444444444444';

  describe('createInterviewQuestion (BR-173)', () => {
    it('creates a company-scoped interview question with test cases and competencies', () => {
      const q = createInterviewQuestion({
        orgId,
        createdByUserId: recruiterId,
        title: 'Implement LRU Cache with O(1) eviction',
        statement: 'Design and implement a data structure for Least Recently Used (LRU) cache.',
        category: 'code',
        difficulty: 'hard',
        durationMinutes: 45,
        expectedCompetencies: ['Data Structures', 'Hash Tables', 'Doubly Linked Lists'],
        testCases: [
          { input: 'put(1, 1); get(1)', expectedOutput: '1', isHidden: false },
          { input: 'put(2, 2); put(3, 3); get(1)', expectedOutput: '-1', isHidden: true },
        ],
      });

      expect(q.id).toBeDefined();
      expect(q.orgId).toBe(orgId);
      expect(q.title).toBe('Implement LRU Cache with O(1) eviction');
      expect(q.category).toBe('code');
      expect(q.difficulty).toBe('hard');
      expect(q.durationMinutes).toBe(45);
      expect(q.testCases).toHaveLength(2);
      expect(q.isActive).toBe(true);
    });

    it('rejects question with missing required parameters', () => {
      expect(() =>
        createInterviewQuestion({
          orgId: '',
          createdByUserId: recruiterId,
          title: 'Test Title',
          statement: 'Test Statement',
          category: 'code',
          difficulty: 'easy',
        })
      ).toThrowError(DomainError);

      expect(() =>
        createInterviewQuestion({
          orgId,
          createdByUserId: recruiterId,
          title: 'Test Title',
          statement: 'Test Statement',
          category: 'code',
          difficulty: 'easy',
          durationMinutes: 2, // < 5 min
        })
      ).toThrowError(DomainError);
    });
  });

  describe('scheduleInterviewAssessment & Session Lifecycle', () => {
    it('schedules an assessment with initial scheduled status and disabled recording', () => {
      const scheduledAt = new Date(Date.now() + 86400000).toISOString();
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Senior Systems Architect Interview',
        scheduledAt,
        durationMinutes: 60,
      });

      expect(assessment.id).toBeDefined();
      expect(assessment.status).toBe('scheduled');
      expect(assessment.meetingUrl).toContain('meet.talentsphere.io/session/');
      expect(assessment.recordingStatus).toBe('disabled');
      expect(assessment.recordingConsentCandidate).toBe(false);
      expect(assessment.recordingConsentInterviewer).toBe(false);
    });

    it('transitions to in_progress when candidate and interviewer join', () => {
      const scheduledAt = new Date().toISOString();
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Backend Engineering Interview',
        scheduledAt,
      });

      const candJoined = joinInterviewAssessment(assessment, 'candidate');
      expect(candJoined.status).toBe('in_progress');
      expect(candJoined.candidateJoinedAt).toBeDefined();

      const intJoined = joinInterviewAssessment(candJoined, 'interviewer');
      expect(intJoined.status).toBe('in_progress');
      expect(intJoined.interviewerJoinedAt).toBeDefined();
    });

    it('prevents joining terminal sessions', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Cancelled Session',
        scheduledAt: new Date().toISOString(),
      });

      const cancelled = endInterviewAssessment(assessment, 'cancelled');
      expect(() => joinInterviewAssessment(cancelled, 'candidate')).toThrowError(DomainError);
    });
  });

  describe('Recording Consent & Dual Consent Enforcement (BR-169, BR-170)', () => {
    it('keeps recording disabled if only candidate consents (BR-169)', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Recording Test',
        scheduledAt: new Date().toISOString(),
      });

      const singleConsent = updateRecordingConsent(assessment, 'candidate', true);
      expect(singleConsent.recordingConsentCandidate).toBe(true);
      expect(singleConsent.recordingConsentInterviewer).toBe(false);
      expect(singleConsent.recordingStatus).toBe('disabled');
      expect(singleConsent.retentionExpiresAt).toBeUndefined();
    });

    it('activates recording and sets 90-day retention when dual consent is achieved (BR-169, BR-170)', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Dual Consent Recording Test',
        scheduledAt: new Date().toISOString(),
      });

      const candConsent = updateRecordingConsent(assessment, 'candidate', true);
      const activeSession = joinInterviewAssessment(candConsent, 'interviewer');
      const dualConsent = updateRecordingConsent(activeSession, 'interviewer', true);

      expect(dualConsent.recordingConsentCandidate).toBe(true);
      expect(dualConsent.recordingConsentInterviewer).toBe(true);
      expect(dualConsent.recordingStatus).toBe('active');
      expect(dualConsent.retentionExpiresAt).toBeDefined();

      // Check retention <= 90 days
      const retentionMs = new Date(dualConsent.retentionExpiresAt!).getTime() - Date.now();
      const retentionDays = Math.round(retentionMs / (1000 * 60 * 60 * 24));
      expect(retentionDays).toBe(90);
    });
  });

  describe('submitInterviewScorecard & Append-Only Compensations (BR-174, BR-176)', () => {
    it('submits a structured scorecard post-session with averaged overall score', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Scorecard Test',
        scheduledAt: new Date().toISOString(),
      });

      const inProg = joinInterviewAssessment(assessment, 'candidate');
      const ended = endInterviewAssessment(inProg, 'completed');

      const { assessment: scoredAssessment, scorecard } = submitInterviewScorecard(ended, {
        interviewerUserId: interviewerId,
        technicalCorrectness: 5,
        communication: 4,
        problemSolving: 5,
        codeQuality: 4,
        recommendation: 'strong_yes',
        strengths: 'Outstanding system decomposition and clear communication of trade-offs.',
        areasForImprovement: 'Could proactively discuss concurrent lock contention.',
        privateNotes: 'Top 5% candidate for platform infrastructure.',
      });

      expect(scoredAssessment.status).toBe('scored');
      expect(scorecard.overallScore).toBe(4.5); // (5+4+5+4)/4
      expect(scorecard.revisionNumber).toBe(1);
      expect(scorecard.recommendation).toBe('strong_yes');
      expect(scorecard.privateNotes).toBe('Top 5% candidate for platform infrastructure.');
    });

    it('rejects invalid rubric scores (out of bounds or non-integers, BR-176)', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Invalid Score Test',
        scheduledAt: new Date().toISOString(),
      });
      const ended = endInterviewAssessment(assessment, 'completed');

      expect(() =>
        submitInterviewScorecard(ended, {
          interviewerUserId: interviewerId,
          technicalCorrectness: 6, // > 5
          communication: 4,
          problemSolving: 4,
          codeQuality: 4,
          recommendation: 'yes',
          strengths: 'Good',
          areasForImprovement: 'None',
        })
      ).toThrowError(DomainError);
    });

    it('creates compensating scorecard entry to preserve append-only ledger (BR-174)', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Compensating Score Test',
        scheduledAt: new Date().toISOString(),
      });
      const ended = endInterviewAssessment(assessment, 'completed');

      const { scorecard: original } = submitInterviewScorecard(ended, {
        interviewerUserId: interviewerId,
        technicalCorrectness: 3,
        communication: 3,
        problemSolving: 3,
        codeQuality: 3,
        recommendation: 'neutral',
        strengths: 'Solid basic foundations.',
        areasForImprovement: 'Needs more hands-on depth with distributed logs.',
      });

      const { scorecard: compensated } = compensateInterviewScorecard(original, ended, {
        interviewerUserId: interviewerId,
        technicalCorrectness: 4,
        communication: 4,
        problemSolving: 4,
        codeQuality: 4,
        recommendation: 'yes',
        strengths: 'Solid basic foundations and verified code execution depth upon re-evaluation.',
        areasForImprovement: 'Needs more hands-on depth with distributed logs.',
        compensationReason: 'Re-reviewed recorded session code execution tests.',
      });

      expect(compensated.revisionNumber).toBe(2);
      expect(compensated.parentScorecardId).toBe(original.id);
      expect(compensated.compensationReason).toBe('Re-reviewed recorded session code execution tests.');
      expect(compensated.overallScore).toBe(4.0);
    });
  });

  describe('Advisory AI Feedback & Protected Attributes (BR-171, BR-172)', () => {
    it('generates advisory AI feedback that excludes protected attributes and requires human review', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'AI Feedback Test',
        scheduledAt: new Date().toISOString(),
      });

      const feedback = generateAdvisoryAiFeedback(assessment, { passed: 4, total: 5 });
      expect(feedback.isAdvisory).toBe(true); // BR-171
      expect(feedback.requiresHumanReview).toBe(true); // BR-171
      expect(feedback.excludedProtectedAttributes).toBe(true); // BR-172
      expect(feedback.communicationClarityScore).toBeGreaterThanOrEqual(75);
      expect(feedback.technicalSummary).toContain('algorithmic clarity');
    });
  });

  describe('Code Execution Sandbox Integration (BR-175)', () => {
    it('executes code test cases deterministically in sandbox', () => {
      const testCases = [
        { input: '[1, 2, 3]', expectedOutput: '6', isHidden: false },
        { input: '[4, 5]', expectedOutput: '9', isHidden: true },
      ];

      const successRun = executeInterviewCode('function sum(arr) { return arr.reduce((a, b) => a + b, 0); }', testCases);
      expect(successRun.passed).toBe(2);
      expect(successRun.total).toBe(2);

      const failRun = executeInterviewCode('throw new Error("fail")', testCases);
      expect(failRun.passed).toBe(0);
      expect(failRun.total).toBe(2);
    });
  });

  describe('HM Review Approval (F-102)', () => {
    it('transitions scored assessment to reviewed status', () => {
      const assessment = scheduleInterviewAssessment({
        orgId,
        candidateProfileId,
        interviewerUserId: interviewerId,
        title: 'Review Test',
        scheduledAt: new Date().toISOString(),
      });
      const ended = endInterviewAssessment(assessment, 'completed');
      const { assessment: scored } = submitInterviewScorecard(ended, {
        interviewerUserId: interviewerId,
        technicalCorrectness: 5,
        communication: 5,
        problemSolving: 5,
        codeQuality: 5,
        recommendation: 'strong_yes',
        strengths: 'Excellent',
        areasForImprovement: 'None',
      });

      const reviewed = reviewInterviewAssessment(scored);
      expect(reviewed.status).toBe('reviewed');
    });
  });
});
