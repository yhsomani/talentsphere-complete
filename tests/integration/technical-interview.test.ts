import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Technical Interview Assessment Platform (F-88, S-06, BR-169..BR-176)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let interviewerToken: string;
  let interviewerUserId: string;
  let orgId: string;
  let jobId: string;
  let applicationId: string;
  let questionId: string;
  let assessmentId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      SESSION_SECRET: 'test-session-secret-at-least-32-characters-long',
    });
    await app.ready();

    // 1. Register Candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `cand.interview.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Robin Interviewee',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.payload);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;
    candidateProfileId = candBody.profile.id;

    // 2. Register Recruiter & Create Org
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `rec.interview.${Date.now()}@hypercloud.io`,
        password: 'Password123!',
        fullName: 'Jordan HiringLead',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recBody = JSON.parse(recRes.payload);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;

    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'HyperCloud Technologies',
        slug: `hypercloud-tech-${Date.now()}`,
        website: 'https://hypercloud.io',
      },
    });
    expect(orgRes.statusCode).toBe(201);
    orgId = JSON.parse(orgRes.payload).organization.id;

    // 3. Register Interviewer in same Org
    const intRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `interviewer.${Date.now()}@hypercloud.io`,
        password: 'Password123!',
        fullName: 'Dr. Evelyn TechInterviewer',
        role: 'recruiter',
      },
    });
    expect(intRes.statusCode).toBe(201);
    const intBody = JSON.parse(intRes.payload);
    interviewerToken = intBody.token;
    interviewerUserId = intBody.user.id;

    // Join interviewer to org
    const memberRes = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${orgId}/members`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        userId: interviewerUserId,
        role: 'recruiter',
      },
    });
    expect(memberRes.statusCode).toBe(201);

    // 4. Create Job and Candidate Applies
    const skillsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/skills',
    });
    const validSkillId = JSON.parse(skillsRes.payload).skills[0].id;

    const jobRes = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Principal Distributed Systems Engineer',
        description: 'Design distributed consensus algorithms.',
        location: 'Austin, TX',
        workMode: 'remote',
        jobType: 'full_time',
        requiredSkillIds: [validSkillId],
        salaryMinMinor: 17000000,
        salaryMaxMinor: 23000000,
        currency: 'USD',
      },
    });
    expect(jobRes.statusCode).toBe(201);
    jobId = JSON.parse(jobRes.payload).job.id;

    await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: { status: 'published' },
    });

    const appRes = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { coverLetter: '10 years building distributed consensus engines.' },
    });
    expect(appRes.statusCode).toBe(201);
    applicationId = JSON.parse(appRes.payload).application.id;
  });

  it('recruiter creates company-scoped question bank question and candidate is forbidden from accessing it (BR-173)', async () => {
    const qRes = await app.inject({
      method: 'POST',
      url: '/api/v1/interviews/questions',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Implement Raft Consensus State Machine',
        statement: 'Implement leader election and log replication logic.',
        category: 'code',
        difficulty: 'hard',
        durationMinutes: 45,
        expectedCompetencies: ['Distributed Systems', 'State Machines'],
        testCases: [
          { input: 'requestVote(1, 1)', expectedOutput: 'voteGranted', isHidden: false },
          { input: 'appendEntries([term1, term2])', expectedOutput: 'success', isHidden: true },
        ],
      },
    });

    expect(qRes.statusCode).toBe(201);
    const qBody = JSON.parse(qRes.payload);
    questionId = qBody.question.id;
    expect(qBody.question.title).toBe('Implement Raft Consensus State Machine');

    // Candidate cannot list company question bank (BR-173)
    const candQRes = await app.inject({
      method: 'GET',
      url: `/api/v1/interviews/questions?orgId=${orgId}`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candQRes.statusCode).toBe(403);
    const candQBody = JSON.parse(candQRes.payload);
    expect(candQBody.error.message).toContain('BR-173');

    // Recruiter can list company questions
    const recQRes = await app.inject({
      method: 'GET',
      url: `/api/v1/interviews/questions?orgId=${orgId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(recQRes.statusCode).toBe(200);
    const recQBody = JSON.parse(recQRes.payload);
    expect(recQBody.questions).toHaveLength(1);
    expect(recQBody.questions[0].id).toBe(questionId);
  });

  it('schedules interview assessment, candidate joins, and hidden test cases are stripped for candidate (BR-173)', async () => {
    const schedRes = await app.inject({
      method: 'POST',
      url: '/api/v1/interviews/assessments',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        applicationId,
        candidateProfileId,
        interviewerUserId,
        title: 'Technical Round 1: Distributed Systems',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        durationMinutes: 60,
        questionIds: [questionId],
      },
    });

    expect(schedRes.statusCode).toBe(201);
    const schedBody = JSON.parse(schedRes.payload);
    assessmentId = schedBody.assessment.id;
    expect(schedBody.assessment.status).toBe('scheduled');
    expect(schedBody.assessment.recordingStatus).toBe('disabled');

    // Candidate retrieves assessment: hidden test cases are stripped (BR-173)
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/interviews/assessments/${assessmentId}`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.payload);
    expect(getBody.questions).toHaveLength(1);
    expect(getBody.questions[0].testCases).toHaveLength(1);
    expect(getBody.questions[0].testCases[0].isHidden).toBe(false);

    // Candidate joins the session
    const joinRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/join`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(joinRes.statusCode).toBe(200);
    const joinBody = JSON.parse(joinRes.payload);
    expect(joinBody.assessment.status).toBe('in_progress');
    expect(joinBody.assessment.candidateJoinedAt).toBeDefined();
  });

  it('enforces dual consent for recording before recording becomes active (BR-169, BR-170)', async () => {
    // 1. Candidate consents
    const candConsentRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/consent`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { consent: true },
    });
    expect(candConsentRes.statusCode).toBe(200);
    let body = JSON.parse(candConsentRes.payload);
    expect(body.assessment.recordingConsentCandidate).toBe(true);
    expect(body.assessment.recordingStatus).toBe('disabled'); // Only 1 consented

    // 2. Interviewer joins and consents -> dual consent achieved!
    await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/join`,
      headers: { authorization: `Bearer ${interviewerToken}` },
    });

    const intConsentRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/consent`,
      headers: { authorization: `Bearer ${interviewerToken}` },
      payload: { consent: true },
    });
    expect(intConsentRes.statusCode).toBe(200);
    body = JSON.parse(intConsentRes.payload);
    expect(body.assessment.recordingConsentInterviewer).toBe(true);
    expect(body.assessment.recordingStatus).toBe('active'); // Dual consent active
    expect(body.assessment.retentionExpiresAt).toBeDefined(); // BR-170 <= 90 days
  });

  it('executes live code in challenge sandbox and ends interview (BR-175)', async () => {
    const codeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/code`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        code: 'function solve() { return "voteGranted"; }',
        language: 'javascript',
        questionId,
      },
    });

    expect(codeRes.statusCode).toBe(200);
    const codeBody = JSON.parse(codeRes.payload);
    expect(codeBody.result.total).toBe(2);
    expect(codeBody.result.passed).toBe(2);

    // End interview
    const endRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/end`,
      headers: { authorization: `Bearer ${interviewerToken}` },
      payload: { resolution: 'completed' },
    });
    expect(endRes.statusCode).toBe(200);
    const endBody = JSON.parse(endRes.payload);
    expect(endBody.assessment.status).toBe('completed');
    expect(endBody.assessment.recordingStatus).toBe('completed');
  });

  it('submits structured scorecard, updates application, and allows append-only compensation (BR-174, BR-176)', async () => {
    // Candidate cannot submit scorecard (403)
    const candScoreRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/scorecard`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        technicalCorrectness: 5,
        communication: 5,
        problemSolving: 5,
        codeQuality: 5,
        recommendation: 'strong_yes',
        strengths: 'Candidate self praise',
        areasForImprovement: 'None',
      },
    });
    expect(candScoreRes.statusCode).toBe(403);

    // Interviewer submits structured scorecard
    const scoreRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/scorecard`,
      headers: { authorization: `Bearer ${interviewerToken}` },
      payload: {
        technicalCorrectness: 5,
        communication: 4,
        problemSolving: 5,
        codeQuality: 4,
        recommendation: 'strong_yes',
        strengths: 'Flawless Raft cluster election implementation and clear concurrent design.',
        areasForImprovement: 'Could proactively discuss heartbeat failure detection timing.',
        privateNotes: 'Top 5% distributed systems engineer. Strong hire.',
      },
    });
    expect(scoreRes.statusCode).toBe(201);
    const scoreBody = JSON.parse(scoreRes.payload);
    expect(scoreBody.scorecard.overallScore).toBe(4.5);
    expect(scoreBody.scorecard.revisionNumber).toBe(1);
    expect(scoreBody.assessment.status).toBe('scored');

    // Verifies application status updated to 'interviewing'
    const appRes = await app.inject({
      method: 'GET',
      url: `/api/v1/applications/${applicationId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(appRes.statusCode).toBe(200);
    const appBody = JSON.parse(appRes.payload);
    expect(appBody.application.status).toBe('interviewing');

    // Compensate scorecard (BR-174: append-only ledger)
    const compRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/scorecard/compensate`,
      headers: { authorization: `Bearer ${interviewerToken}` },
      payload: {
        technicalCorrectness: 5,
        communication: 5,
        problemSolving: 5,
        codeQuality: 5,
        recommendation: 'strong_yes',
        strengths: 'Flawless Raft cluster election implementation and clear concurrent design.',
        areasForImprovement: 'Proactively discussed heartbeat failure in follow-up discussion.',
        compensationReason: 'Reviewed recorded whiteboard design explanation on heartbeat timers.',
      },
    });
    expect(compRes.statusCode).toBe(201);
    const compBody = JSON.parse(compRes.payload);
    expect(compBody.scorecard.revisionNumber).toBe(2);
    expect(compBody.scorecard.overallScore).toBe(5.0);
    expect(compBody.scorecard.compensationReason).toContain('heartbeat timers');

    // Candidate views scorecards: private notes are stripped (BR-176)
    const candViewRes = await app.inject({
      method: 'GET',
      url: `/api/v1/interviews/assessments/${assessmentId}/scorecards`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candViewRes.statusCode).toBe(200);
    const candViewBody = JSON.parse(candViewRes.payload);
    expect(candViewBody.scorecards).toHaveLength(2);
    expect(candViewBody.scorecards[0].privateNotes).toBeUndefined();
    expect(candViewBody.scorecards[0].strengths).toBeDefined();

    // Recruiter views scorecards: sees full detail including private notes
    const recViewRes = await app.inject({
      method: 'GET',
      url: `/api/v1/interviews/assessments/${assessmentId}/scorecards`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(recViewRes.statusCode).toBe(200);
    const recViewBody = JSON.parse(recViewRes.payload);
    expect(recViewBody.scorecards[0].privateNotes).toBe('Top 5% distributed systems engineer. Strong hire.');
  });

  it('generates advisory AI feedback without protected attributes and completes HM review (BR-171, BR-172, F-102)', async () => {
    const aiRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/ai-feedback`,
      headers: { authorization: `Bearer ${interviewerToken}` },
    });
    expect(aiRes.statusCode).toBe(200);
    const aiBody = JSON.parse(aiRes.payload);
    expect(aiBody.feedback.isAdvisory).toBe(true);
    expect(aiBody.feedback.requiresHumanReview).toBe(true);
    expect(aiBody.feedback.excludedProtectedAttributes).toBe(true);

    // HM review approval
    const reviewRes = await app.inject({
      method: 'POST',
      url: `/api/v1/interviews/assessments/${assessmentId}/review`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(reviewRes.statusCode).toBe(200);
    const reviewBody = JSON.parse(reviewRes.payload);
    expect(reviewBody.assessment.status).toBe('reviewed');
  });
});
