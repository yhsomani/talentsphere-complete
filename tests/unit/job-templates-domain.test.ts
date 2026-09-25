import { describe, it, expect } from 'vitest';
import {
  createJobTemplate,
  updateJobTemplate,
  archiveJobTemplate,
  instantiateJobFromTemplate,
  type JobTemplate,
} from '../../packages/domain/src/job-templates.js';
import { DomainError } from '../../packages/domain/src/index.js';

describe('Domain: Job Templates & Requisition Instantiation (F-37, F-05, BR-01, BR-12, BR-144)', () => {
  const recruiterActor = {
    userId: 'recruiter_user_1',
    roles: ['recruiter'] as any,
    orgId: 'org_acme_1',
  };

  const candidateActor = {
    userId: 'cand_user_1',
    roles: ['candidate'] as any,
  };

  const adminActor = {
    userId: 'admin_user_1',
    roles: ['platform_admin'] as any,
  };

  it('creates a job template with complete metadata, screening questions, and salary range', () => {
    const template = createJobTemplate({
      orgId: 'org_acme_1',
      templateName: 'Standard Senior Backend Engineer',
      title: 'Senior Backend Engineer',
      description: 'Lead backend microservices architecture and cloud-native systems.',
      location: 'San Francisco, CA',
      workMode: 'hybrid',
      jobType: 'full_time',
      department: 'Engineering',
      requiredSkillIds: ['skill_typescript', 'skill_postgres'],
      salaryRange: {
        minMinor: 14000000,
        maxMinor: 19000000,
        currency: 'USD',
      },
      screeningQuestions: [
        {
          question: 'How many years of experience do you have with distributed systems?',
          required: true,
          idealAnswer: '5+ years',
        },
      ],
      actor: recruiterActor,
    });

    expect(template.id).toBeDefined();
    expect(template.orgId).toBe('org_acme_1');
    expect(template.createdBy).toBe(recruiterActor.userId);
    expect(template.templateName).toBe('Standard Senior Backend Engineer');
    expect(template.title).toBe('Senior Backend Engineer');
    expect(template.workMode).toBe('hybrid');
    expect(template.requiredSkillIds).toEqual(['skill_typescript', 'skill_postgres']);
    expect(template.salaryRange?.minMinor).toBe(14000000);
    expect(template.salaryRange?.maxMinor).toBe(19000000);
    expect(template.screeningQuestions?.length).toBe(1);
    expect(template.isArchived).toBe(false);
  });

  it('prevents non-recruiters/candidates from creating job templates (BR-01)', () => {
    expect(() =>
      createJobTemplate({
        orgId: 'org_acme_1',
        templateName: 'Unauthorized Template',
        title: 'Security Analyst',
        description: 'Lead cybersecurity audits and compliance.',
        location: 'Remote',
        actor: candidateActor,
      })
    ).toThrowError(/Only recruiters, hiring managers, or platform administrators/);
  });

  it('enforces tenant boundary if recruiter attempts to create template for foreign org (BR-12)', () => {
    expect(() =>
      createJobTemplate({
        orgId: 'org_foreign_99',
        templateName: 'Cross Org Template',
        title: 'Product Manager',
        description: 'Drive strategic product roadmap across teams.',
        location: 'New York, NY',
        actor: recruiterActor, // assigned to org_acme_1
      })
    ).toThrowError(/Recruiters may only create templates for their assigned organization/);
  });

  it('enforces salary transparency rules and input validation constraints', () => {
    // Salary min > max
    expect(() =>
      createJobTemplate({
        orgId: 'org_acme_1',
        templateName: 'Invalid Salary Template',
        title: 'Staff Engineer',
        description: 'Design distributed storage systems.',
        location: 'Remote',
        salaryRange: {
          minMinor: 20000000,
          maxMinor: 10000000, // Invalid: max < min
          currency: 'USD',
        },
        actor: recruiterActor,
      })
    ).toThrowError(/Invalid salary range: min must be non-negative and max >= min/);

    // Negative min
    expect(() =>
      createJobTemplate({
        orgId: 'org_acme_1',
        templateName: 'Negative Salary Template',
        title: 'Staff Engineer',
        description: 'Design distributed storage systems.',
        location: 'Remote',
        salaryRange: {
          minMinor: -100,
          maxMinor: 100000,
          currency: 'USD',
        },
        actor: recruiterActor,
      })
    ).toThrowError(/Invalid salary range/);

    // Short title
    expect(() =>
      createJobTemplate({
        orgId: 'org_acme_1',
        templateName: 'Short Title',
        title: 'SE',
        description: 'Design distributed storage systems.',
        location: 'Remote',
        actor: recruiterActor,
      })
    ).toThrowError(/Job title must be at least 3 characters/);
  });

  it('updates job template fields and prevents modifying archived templates', () => {
    const template = createJobTemplate({
      orgId: 'org_acme_1',
      templateName: 'DevOps Template v1',
      title: 'DevOps Engineer',
      description: 'Manage CI/CD pipelines and infrastructure as code.',
      location: 'Austin, TX',
      actor: recruiterActor,
    });

    const updated = updateJobTemplate(template, {
      templateName: 'Site Reliability & DevOps Template v2',
      title: 'Senior Site Reliability Engineer',
      location: 'Remote',
      actor: recruiterActor,
    });

    expect(updated.templateName).toBe('Site Reliability & DevOps Template v2');
    expect(updated.title).toBe('Senior Site Reliability Engineer');
    expect(updated.location).toBe('Remote');

    // Archive template
    const archived = archiveJobTemplate(updated, recruiterActor);
    expect(archived.isArchived).toBe(true);

    // Modifying archived template throws CONFLICT
    expect(() =>
      updateJobTemplate(archived, {
        title: 'Trying to update archived template',
        actor: recruiterActor,
      })
    ).toThrowError(/Cannot modify an archived job template unless restoring it/);
  });

  it('instantiates a new job requisition from template with default values and overrides', () => {
    const template = createJobTemplate({
      orgId: 'org_acme_1',
      templateName: 'Frontend Engineer Blueprint',
      title: 'Frontend Engineer',
      description: 'Build fast, accessible user interfaces with React and TypeScript.',
      location: 'San Francisco, CA',
      workMode: 'hybrid',
      jobType: 'full_time',
      requiredSkillIds: ['skill_react', 'skill_css'],
      salaryRange: {
        minMinor: 12000000,
        maxMinor: 16000000,
        currency: 'USD',
      },
      actor: recruiterActor,
    });

    // Instantiate with no overrides
    const job1 = instantiateJobFromTemplate(template, {}, recruiterActor);
    expect(job1.id).toBeDefined();
    expect(job1.orgId).toBe(template.orgId);
    expect(job1.title).toBe('Frontend Engineer');
    expect(job1.status).toBe('draft');
    expect(job1.requiredSkillIds).toEqual(['skill_react', 'skill_css']);
    expect(job1.salaryRange?.minMinor).toBe(12000000);

    // Instantiate with overrides
    const job2 = instantiateJobFromTemplate(
      template,
      {
        title: 'Principal Frontend Architect',
        workMode: 'remote',
        salaryRange: {
          minMinor: 20000000,
          maxMinor: 25000000,
          currency: 'USD',
        },
      },
      recruiterActor
    );

    expect(job2.title).toBe('Principal Frontend Architect');
    expect(job2.workMode).toBe('remote');
    expect(job2.salaryRange?.minMinor).toBe(20000000);
    expect(job2.salaryRange?.maxMinor).toBe(25000000);

    // Cannot instantiate from archived template
    const archived = archiveJobTemplate(template, recruiterActor);
    expect(() =>
      instantiateJobFromTemplate(archived, {}, recruiterActor)
    ).toThrowError(/Cannot instantiate a job from an archived template/);
  });
});
