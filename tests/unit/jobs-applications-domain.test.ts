import { describe, it, expect } from 'vitest';
import {
  createJobPosting,
  transitionJobStatus,
  submitJobApplication,
  transitionApplicationState,
  type Job,
  type JobApplication,
} from '../../packages/domain/src/index.js';

describe('Job Marketplace & ATS Domain Model (F-04, F-05, F-06, BR-01..41)', () => {
  const orgId = 'o0000000-0000-4000-a000-000000000001';
  const otherOrgId = 'o0000000-0000-4000-a000-000000000002';
  const recruiterActor = {
    userId: 'u0000000-0000-4000-a000-000000000001',
    roles: ['recruiter' as const],
    orgId,
  };
  const candidateActor = {
    userId: 'u0000000-0000-4000-a000-000000000002',
    roles: ['candidate' as const],
  };

  describe('Job Posting Lifecycle (F-04, F-05, BR-01, BR-11, BR-12)', () => {
    it('creates job posting by authorized recruiter for their org', () => {
      const job = createJobPosting({
        orgId,
        title: 'Senior Distributed Systems Engineer',
        description: 'Design and implement globally distributed consensus engines in Go.',
        location: 'Remote / US',
        requiredSkillIds: ['s1', 's2'],
        salaryRange: {
          minMinor: 18000000,
          maxMinor: 22000000,
          currency: 'USD',
        },
        actor: recruiterActor,
      });

      expect(job.id).toBeDefined();
      expect(job.status).toBe('draft');
      expect(job.title).toBe('Senior Distributed Systems Engineer');
      expect(job.orgId).toBe(orgId);
    });

    it('rejects job creation from candidate or recruiter of another org (BR-01, BR-12)', () => {
      // Candidate cannot post job
      expect(() => {
        createJobPosting({
          orgId,
          title: 'Candidate Trying to Post Job',
          description: 'This should fail immediately.',
          location: 'Remote',
          actor: candidateActor,
        });
      }).toThrowError(/Only recruiters or administrators may post jobs/);

      // Recruiter of different org cannot post for this org
      expect(() => {
        createJobPosting({
          orgId: otherOrgId,
          title: 'Recruiter Wrong Org',
          description: 'Wrong org job posting.',
          location: 'Remote',
          actor: recruiterActor,
        });
      }).toThrowError(/Recruiters may only post jobs for their assigned organization/);
    });

    it('transitions job status through valid lifecycle (BR-11)', () => {
      const job = createJobPosting({
        orgId,
        title: 'Cloud Security Architect',
        description: 'Lead zero-trust cloud infrastructure security.',
        location: 'San Francisco, CA',
        actor: recruiterActor,
      });

      // draft -> published
      const published = transitionJobStatus(job, 'published', recruiterActor);
      expect(published.status).toBe('published');

      // published -> paused
      const paused = transitionJobStatus(published, 'paused', recruiterActor);
      expect(paused.status).toBe('paused');

      // paused -> published
      const resumed = transitionJobStatus(paused, 'published', recruiterActor);
      expect(resumed.status).toBe('published');

      // published -> closed
      const closed = transitionJobStatus(resumed, 'closed', recruiterActor);
      expect(closed.status).toBe('closed');

      // closed cannot be reopened to published directly
      expect(() => {
        transitionJobStatus(closed, 'published', recruiterActor);
      }).toThrowError(/Cannot transition job from closed to published/);
    });
  });

  describe('ATS Application Pipeline (F-06, BR-02, BR-15, BR-16, BR-41)', () => {
    const candidateProfileId = 'p0000000-0000-4000-a000-000000000002';
    const jobId = 'j0000000-0000-4000-a000-000000000001';

    it('submits application by candidate to published job (BR-02, BR-38)', () => {
      const app = submitJobApplication({
        jobId,
        jobStatus: 'published',
        candidateProfileId,
        actor: candidateActor,
        existingApplications: [],
        coverLetter: 'Passionate about distributed consensus and resilience.',
        attachedEvidenceIds: ['ev1', 'ev2'],
      });

      expect(app.id).toBeDefined();
      expect(app.status).toBe('submitted');
      expect(app.submittedAt).toBeDefined();
      expect(app.attachedEvidenceIds).toHaveLength(2);
    });

    it('rejects application from recruiter (BR-02)', () => {
      expect(() => {
        submitJobApplication({
          jobId,
          jobStatus: 'published',
          candidateProfileId: 'recruiter-profile',
          actor: recruiterActor,
          existingApplications: [],
        });
      }).toThrowError(/Recruiters may not submit job applications/);
    });

    it('rejects application to unpublished/draft job (BR-16)', () => {
      expect(() => {
        submitJobApplication({
          jobId,
          jobStatus: 'draft',
          candidateProfileId,
          actor: candidateActor,
          existingApplications: [],
        });
      }).toThrowError(/Applications are only accepted for published jobs/);
    });

    it('rejects duplicate active application for same job (BR-15, BR-39)', () => {
      const existing: JobApplication = {
        id: 'app-existing',
        jobId,
        candidateId: candidateProfileId,
        status: 'submitted',
        attachedEvidenceIds: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      expect(() => {
        submitJobApplication({
          jobId,
          jobStatus: 'published',
          candidateProfileId,
          actor: candidateActor,
          existingApplications: [existing],
        });
      }).toThrowError(/An active application for this job already exists/);
    });

    it('advances candidate through strict ATS stages (BR-41)', () => {
      const app: JobApplication = {
        id: 'app-1',
        jobId,
        candidateId: candidateProfileId,
        status: 'submitted',
        attachedEvidenceIds: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const recruiterAuth = {
        userId: recruiterActor.userId,
        roles: recruiterActor.roles,
        isCandidateOwner: false,
        isRecruiterForJob: true,
      };

      // submitted -> in_review
      const inReview = transitionApplicationState(app, 'in_review', recruiterAuth);
      expect(inReview.status).toBe('in_review');

      // in_review -> shortlisted
      const shortlisted = transitionApplicationState(inReview, 'shortlisted', recruiterAuth);
      expect(shortlisted.status).toBe('shortlisted');

      // shortlisted -> interviewing
      const interviewing = transitionApplicationState(shortlisted, 'interviewing', recruiterAuth);
      expect(interviewing.status).toBe('interviewing');

      // interviewing -> offered
      const offered = transitionApplicationState(interviewing, 'offered', recruiterAuth);
      expect(offered.status).toBe('offered');

      // offered -> hired
      const hired = transitionApplicationState(offered, 'hired', recruiterAuth);
      expect(hired.status).toBe('hired');
      expect(hired.hiredAt).toBeDefined();

      // Hired is terminal state
      expect(() => {
        transitionApplicationState(hired, 'interviewing', recruiterAuth);
      }).toThrowError(/Cannot transition application from hired to interviewing/);
    });

    it('allows candidate to withdraw their application', () => {
      const app: JobApplication = {
        id: 'app-2',
        jobId,
        candidateId: candidateProfileId,
        status: 'interviewing',
        attachedEvidenceIds: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const candidateAuth = {
        userId: candidateActor.userId,
        roles: candidateActor.roles,
        isCandidateOwner: true,
        isRecruiterForJob: false,
      };

      const withdrawn = transitionApplicationState(app, 'withdrawn', candidateAuth);
      expect(withdrawn.status).toBe('withdrawn');
      expect(withdrawn.withdrawnAt).toBeDefined();
    });
  });
});
