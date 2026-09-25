import { describe, it, expect } from 'vitest';
import {
  createApplicationFeedback,
  requestApplicationFeedback,
  markFeedbackViewed,
  computeFeedbackAggregateInsights,
  createFeedbackTemplate,
  type ApplicationFeedback,
} from '../../packages/domain/src/application-feedback.js';

describe('Domain: Application Feedback Loop (F-122, BR-217..BR-224, P-02)', () => {
  const recruiterActor = {
    userId: 'recruiter_user_1',
    roles: ['recruiter'] as any,
    orgId: 'org_acme_1',
  };

  const candidateActor = {
    userId: 'cand_user_1',
    roles: ['candidate'] as any,
  };

  it('creates structured candidate feedback with reason category and actionable advice (BR-217, BR-223, P-02)', () => {
    const feedback = createApplicationFeedback({
      applicationId: 'app_123',
      candidateId: 'profile_cand_1',
      jobId: 'job_456',
      orgId: 'org_acme_1',
      stage: 'technical_interview',
      reasonCategory: 'skills_gap',
      strengths: 'Exceptional communication and deep knowledge of relational SQL databases.',
      areasForImprovement: 'Needs stronger exposure to distributed caching and event-driven patterns with Kafka.',
      actionableAdvice: 'We recommend completing advanced distributed systems labs and practicing event stream partitioning.',
      suggestedSkillIds: ['skill_kafka', 'skill_redis'],
      actor: recruiterActor,
    });

    expect(feedback.id).toBeDefined();
    expect(feedback.applicationId).toBe('app_123');
    expect(feedback.reasonCategory).toBe('skills_gap');
    expect(feedback.status).toBe('provided');
    expect(feedback.suggestedSkillIds).toContain('skill_kafka');
    expect(feedback.isAiAssisted).toBe(false);
    expect(feedback.humanReviewed).toBe(true);
  });

  it('prevents candidates from creating application feedback (FORBIDDEN)', () => {
    expect(() =>
      createApplicationFeedback({
        applicationId: 'app_123',
        candidateId: 'profile_cand_1',
        jobId: 'job_456',
        orgId: 'org_acme_1',
        stage: 'screening',
        reasonCategory: 'other',
        strengths: 'Good candidate.',
        areasForImprovement: 'Needs more experience.',
        actionableAdvice: 'Keep practicing.',
        actor: candidateActor,
      })
    ).toThrowError(/Only recruiters, hiring managers, or platform administrators/);
  });

  it('enforces tenant boundary if recruiter attempts cross-org feedback (BR-12)', () => {
    expect(() =>
      createApplicationFeedback({
        applicationId: 'app_123',
        candidateId: 'profile_cand_1',
        jobId: 'job_456',
        orgId: 'org_foreign_99',
        stage: 'screening',
        reasonCategory: 'position_filled',
        strengths: 'Impressive credentials.',
        areasForImprovement: 'Candidate matched well but position was filled.',
        actionableAdvice: 'Consider re-applying for upcoming Q2 roles.',
        actor: recruiterActor, // org_acme_1
      })
    ).toThrowError(/Recruiters may only provide feedback for their assigned organization/);
  });

  it('requires human review when AI assists in drafting feedback (BR-221)', () => {
    expect(() =>
      createApplicationFeedback({
        applicationId: 'app_123',
        candidateId: 'profile_cand_1',
        jobId: 'job_456',
        orgId: 'org_acme_1',
        stage: 'screening',
        reasonCategory: 'experience_gap',
        strengths: 'Solid fundamentals.',
        areasForImprovement: 'Needs 2+ years more production experience.',
        actionableAdvice: 'Contribute to open-source systems.',
        isAiAssisted: true,
        humanReviewed: false, // Must be reviewed by human before sending
        actor: recruiterActor,
      })
    ).toThrowError(/AI-assisted feedback must be human-reviewed before delivery/);
  });

  it('allows candidate to request feedback within 30 days and blocks after 30 days (BR-222)', () => {
    const recentDecisionDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days ago
    const res = requestApplicationFeedback(recentDecisionDate, 'user_cand_1', 'user_cand_1');
    expect(res.requestedAt).toBeDefined();

    // After 30 days -> reject with BR-222
    const oldDecisionDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(); // 35 days ago
    expect(() =>
      requestApplicationFeedback(oldDecisionDate, 'user_cand_1', 'user_cand_1')
    ).toThrowError(/Feedback requests must be submitted within 30 days of application decision/);

    // Cannot request feedback for another user's application
    expect(() =>
      requestApplicationFeedback(recentDecisionDate, 'user_cand_1', 'intruder_user_99')
    ).toThrowError(/Candidates may only request feedback for their own applications/);
  });

  it('marks feedback as viewed by the candidate and enforces private access (BR-219)', () => {
    const feedback = createApplicationFeedback({
      applicationId: 'app_123',
      candidateId: 'profile_cand_1',
      jobId: 'job_456',
      orgId: 'org_acme_1',
      stage: 'screening',
      reasonCategory: 'culture_fit',
      strengths: 'Collaborative mindset.',
      areasForImprovement: 'Looking for more autonomy in remote environment.',
      actionableAdvice: 'Demonstrate asynchronous project leadership.',
      actor: recruiterActor,
    });

    // Foreign user cannot view feedback
    expect(() =>
      markFeedbackViewed(feedback, 'cand_user_1', 'intruder_user_99')
    ).toThrowError(/Application feedback is private and visible only to the candidate/);

    // Candidate views feedback -> status transitions to viewed
    const viewed = markFeedbackViewed(feedback, 'cand_user_1', 'cand_user_1');
    expect(viewed.status).toBe('viewed');
    expect(viewed.viewedAt).toBeDefined();
  });

  it('computes anonymized aggregate insights with k >= 10 privacy threshold (BR-220)', () => {
    const feedbacks: ApplicationFeedback[] = [];

    // Less than 10 feedbacks -> privacy protected
    for (let i = 0; i < 5; i++) {
      feedbacks.push({
        reasonCategory: 'skills_gap',
      } as any);
    }

    const sparseInsights = computeFeedbackAggregateInsights(feedbacks, 10);
    expect(sparseInsights.isPrivacyProtected).toBe(true);
    expect(Object.keys(sparseInsights.categoryBreakdown).length).toBe(0);

    // Add up to 10 feedbacks: 6 skills_gap, 4 experience_gap
    feedbacks.push({ reasonCategory: 'skills_gap' } as any);
    for (let i = 0; i < 4; i++) {
      feedbacks.push({ reasonCategory: 'experience_gap' } as any);
    }

    const availableInsights = computeFeedbackAggregateInsights(feedbacks, 10);
    expect(availableInsights.isPrivacyProtected).toBe(false);
    expect(availableInsights.totalEvaluated).toBe(10);
    expect(availableInsights.categoryBreakdown['skills_gap'].count).toBe(6);
    expect(availableInsights.categoryBreakdown['skills_gap'].percentage).toBe(60);
    expect(availableInsights.categoryBreakdown['experience_gap'].count).toBe(4);
    expect(availableInsights.categoryBreakdown['experience_gap'].percentage).toBe(40);
  });

  it('creates organization-configurable feedback templates (BR-224)', () => {
    const template = createFeedbackTemplate({
      orgId: 'org_acme_1',
      templateName: 'Standard Engineering Skills Gap Template',
      stage: 'technical_interview',
      reasonCategory: 'skills_gap',
      defaultStrengths: 'Demonstrated strong problem-solving fundamentals.',
      defaultAreasForImprovement: 'Needs further mastery of required technology stack.',
      defaultActionableAdvice: 'Review documentation and complete hands-on practice projects.',
      actor: recruiterActor,
    });

    expect(template.id).toBeDefined();
    expect(template.orgId).toBe('org_acme_1');
    expect(template.templateName).toBe('Standard Engineering Skills Gap Template');
    expect(template.stage).toBe('technical_interview');
    expect(template.reasonCategory).toBe('skills_gap');
  });
});
