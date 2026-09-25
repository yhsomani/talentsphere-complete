import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Technical Interview Assessment Platform (F-88, S-06, BR-169..BR-176, P-02)', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let jobId: string;
  let applicationId: string;
  let questionId: string;
  let assessmentId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.interview.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Alex Candidate',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;
    candidateProfileId = candData.profile.id;

    // 2. Register Recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `rec.interview.e2e.${Date.now()}@stratusscale.io`,
        password: 'Password123!Secure',
        fullName: 'Morgan Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;

    // 3. Create Organization
    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: 'StratusScale Cloud Solutions',
        slug: `stratusscale-${Date.now()}`,
        website: 'https://stratusscale.io',
      },
    });
    expect(orgRes.status()).toBe(201);
    orgId = (await orgRes.json()).organization.id;

    // 4. Create Job and Publish
    const skillsRes = await request.get(`${API_BASE}/skills`);
    expect(skillsRes.status()).toBe(200);
    const validSkillId = (await skillsRes.json()).skills[0].id;

    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Lead Distributed Systems Architect',
        description: 'Design Byzantine fault tolerant consensus networks.',
        location: 'Seattle, WA',
        workMode: 'remote',
        jobType: 'full_time',
        requiredSkillIds: [validSkillId],
        salaryMinMinor: 18000000,
        salaryMaxMinor: 24000000,
        currency: 'USD',
      },
    });
    expect(jobRes.status()).toBe(201);
    jobId = (await jobRes.json()).job.id;

    await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });

    // 5. Candidate applies for the job
    const appRes = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Expertise in high-throughput distributed state machine replication.',
      },
    });
    expect(appRes.status()).toBe(201);
    applicationId = (await appRes.json()).application.id;
  });

  test('recruiter creates company-scoped question and candidate is forbidden from browsing bank (BR-173)', async ({ request }) => {
    // 1. Recruiter creates company question
    const qRes = await request.post(`${API_BASE}/interviews/questions`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Design Consistent Hashing Ring with Virtual Nodes',
        statement: 'Implement a consistent hash ring with replica factor K and dynamic node rebalancing.',
        category: 'code',
        difficulty: 'hard',
        durationMinutes: 45,
        expectedCompetencies: ['Hashing', 'Distributed Systems', 'Load Balancing'],
        testCases: [
          { input: 'addNode("nodeA"); getNode("key1")', expectedOutput: 'nodeA', isHidden: false },
          { input: 'addNode("nodeB"); removeNode("nodeA"); getNode("key1")', expectedOutput: 'nodeB', isHidden: true },
        ],
      },
    });

    expect(qRes.status()).toBe(201);
    const qBody = await qRes.json();
    questionId = qBody.question.id;
    expect(qBody.question.title).toContain('Consistent Hashing');
    expect(qBody.question.testCases).toHaveLength(2);

    // 2. Candidate attempts to access company question bank (403 Forbidden, BR-173)
    const candQRes = await request.get(`${API_BASE}/interviews/questions?orgId=${orgId}`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candQRes.status()).toBe(403);
    const candQBody = await candQRes.json();
    expect(candQBody.error.message).toContain('BR-173');

    // 3. Recruiter accesses question bank
    const recQRes = await request.get(`${API_BASE}/interviews/questions?orgId=${orgId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(recQRes.status()).toBe(200);
    const recQBody = await recQRes.json();
    expect(recQBody.questions.length).toBeGreaterThanOrEqual(1);
  });

  test('schedules interview assessment, candidate joins, and hidden test cases are stripped for candidate (BR-173)', async ({ request }) => {
    const schedRes = await request.post(`${API_BASE}/interviews/assessments`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        applicationId,
        candidateProfileId,
        interviewerUserId: recruiterUserId,
        title: 'Technical Round 1: Distributed Architecture',
        scheduledAt: new Date(Date.now() + 7200000).toISOString(),
        durationMinutes: 60,
        questionIds: [questionId],
      },
    });

    expect(schedRes.status()).toBe(201);
    const schedBody = await schedRes.json();
    assessmentId = schedBody.assessment.id;
    expect(schedBody.assessment.status).toBe('scheduled');
    expect(schedBody.assessment.recordingStatus).toBe('disabled');

    // Candidate views assessment: questions have hidden test cases stripped (BR-173)
    const candGetRes = await request.get(`${API_BASE}/interviews/assessments/${assessmentId}`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candGetRes.status()).toBe(200);
    const candGetBody = await candGetRes.json();
    expect(candGetBody.questions).toHaveLength(1);
    expect(candGetBody.questions[0].testCases).toHaveLength(1);
    expect(candGetBody.questions[0].testCases[0].isHidden).toBe(false);

    // Candidate joins the session
    const joinRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/join`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(joinRes.status()).toBe(200);
    const joinBody = await joinRes.json();
    expect(joinBody.assessment.status).toBe('in_progress');
    expect(joinBody.assessment.candidateJoinedAt).toBeDefined();
  });

  test('enforces dual consent for recording before recording becomes active (BR-169, BR-170)', async ({ request }) => {
    // 1. Candidate consents to recording
    const candConsentRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/consent`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: { consent: true },
    });
    expect(candConsentRes.status()).toBe(200);
    let body = await candConsentRes.json();
    expect(body.assessment.recordingConsentCandidate).toBe(true);
    expect(body.assessment.recordingStatus).toBe('disabled'); // Only 1 party consented

    // 2. Interviewer joins and consents -> dual consent achieved!
    await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/join`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    const recConsentRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/consent`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { consent: true },
    });
    expect(recConsentRes.status()).toBe(200);
    body = await recConsentRes.json();
    expect(body.assessment.recordingConsentInterviewer).toBe(true);
    expect(body.assessment.recordingStatus).toBe('active'); // Dual consent active
    expect(body.assessment.retentionExpiresAt).toBeDefined(); // BR-170 <= 90 days
  });

  test('candidate executes live code in sandbox and session concludes (BR-175)', async ({ request }) => {
    const codeRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/code`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        code: 'function consistentHashRing() { return "nodeA"; }',
        language: 'javascript',
        questionId,
      },
    });

    expect(codeRes.status()).toBe(200);
    const codeBody = await codeRes.json();
    expect(codeBody.result.total).toBe(2);
    expect(codeBody.result.passed).toBe(2);

    // Conclude session
    const endRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/end`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { resolution: 'completed' },
    });
    expect(endRes.status()).toBe(200);
    const endBody = await endRes.json();
    expect(endBody.assessment.status).toBe('completed');
    expect(endBody.assessment.recordingStatus).toBe('completed');
  });

  test('submits structured scorecard, performs compensating entry, and verifies candidate view privacy (BR-174, BR-176)', async ({ request }) => {
    // 1. Candidate cannot submit scorecard (403 Forbidden)
    const candScoreRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/scorecard`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        technicalCorrectness: 5,
        communication: 5,
        problemSolving: 5,
        codeQuality: 5,
        recommendation: 'strong_yes',
        strengths: 'Candidate self score',
        areasForImprovement: 'None',
      },
    });
    expect(candScoreRes.status()).toBe(403);

    // 2. Interviewer submits structured scorecard
    const scoreRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/scorecard`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        technicalCorrectness: 5,
        communication: 4,
        problemSolving: 5,
        codeQuality: 4,
        recommendation: 'strong_yes',
        strengths: 'Exceptional deep dive on consistent hashing and virtual nodes balance.',
        areasForImprovement: 'Could proactively highlight partition tolerance under network splits.',
        privateNotes: 'Top 1% candidate for distributed infrastructure team.',
      },
    });
    expect(scoreRes.status()).toBe(201);
    const scoreBody = await scoreRes.json();
    expect(scoreBody.scorecard.overallScore).toBe(4.5);
    expect(scoreBody.scorecard.revisionNumber).toBe(1);
    expect(scoreBody.assessment.status).toBe('scored');

    // 3. Compensating scorecard entry (BR-174: append-only ledger)
    const compRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/scorecard/compensate`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        technicalCorrectness: 5,
        communication: 5,
        problemSolving: 5,
        codeQuality: 5,
        recommendation: 'strong_yes',
        strengths: 'Exceptional deep dive on consistent hashing and virtual nodes balance.',
        areasForImprovement: 'Network partition tolerance addressed in post-coding discussion.',
        compensationReason: 'Reviewed partition tolerance audio segment with hiring panel.',
      },
    });
    expect(compRes.status()).toBe(201);
    const compBody = await compRes.json();
    expect(compBody.scorecard.revisionNumber).toBe(2);
    expect(compBody.scorecard.overallScore).toBe(5.0);
    expect(compBody.scorecard.compensationReason).toContain('hiring panel');

    // 4. Candidate views scorecards: private notes are stripped (BR-176)
    const candViewRes = await request.get(`${API_BASE}/interviews/assessments/${assessmentId}/scorecards`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candViewRes.status()).toBe(200);
    const candViewBody = await candViewRes.json();
    expect(candViewBody.scorecards.length).toBeGreaterThanOrEqual(1);
    expect(candViewBody.scorecards[0].privateNotes).toBeUndefined();
    expect(candViewBody.scorecards[0].overallScore).toBeDefined();

    // 5. Recruiter views full scorecard details
    const recViewRes = await request.get(`${API_BASE}/interviews/assessments/${assessmentId}/scorecards`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(recViewRes.status()).toBe(200);
    const recViewBody = await recViewRes.json();
    expect(recViewBody.scorecards[0].privateNotes).toContain('Top 1% candidate');
  });

  test('generates advisory AI feedback without protected attributes and completes HM review (BR-171, BR-172, F-102)', async ({ request }) => {
    // 1. Generate Advisory AI Feedback
    const aiRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/ai-feedback`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(aiRes.status()).toBe(200);
    const aiBody = await aiRes.json();
    expect(aiBody.feedback.isAdvisory).toBe(true); // BR-171
    expect(aiBody.feedback.requiresHumanReview).toBe(true); // BR-171
    expect(aiBody.feedback.excludedProtectedAttributes).toBe(true); // BR-172
    expect(aiBody.feedback.communicationClarityScore).toBeGreaterThanOrEqual(75);

    // 2. Complete Hiring Manager Review Approval
    const reviewRes = await request.post(`${API_BASE}/interviews/assessments/${assessmentId}/review`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(reviewRes.status()).toBe(200);
    const reviewBody = await reviewRes.json();
    expect(reviewBody.assessment.status).toBe('reviewed');
  });
});
