import { describe, it, expect } from 'vitest';
import {
  canTransitionApplication,
  isAIAssistanceAllowed,
  DomainError,
  ApplicationState,
} from '../../packages/domain/src/index.js';
import {
  ErrorEnvelopeSchema,
  PaginationQuerySchema,
  RegisterInputSchema,
  CreateEvidenceInputSchema,
} from '../../packages/contracts/src/index.js';
import { validateServerEnv, CONSTANTS } from '../../packages/config/src/index.js';
import { createLogger, InMemoryAuditSink } from '../../packages/observability/src/index.js';
import { createMockUser, createMockProfile, createMockEvidence } from '../../packages/testing/src/index.js';

describe('Phase 0 Foundation Test Suite', () => {
  describe('Domain Invariants & State Transitions', () => {
    it('allows valid sequential application state transitions', () => {
      expect(canTransitionApplication('draft', 'submitted')).toBe(true);
      expect(canTransitionApplication('submitted', 'in_review')).toBe(true);
      expect(canTransitionApplication('in_review', 'shortlisted')).toBe(true);
      expect(canTransitionApplication('shortlisted', 'interviewing')).toBe(true);
      expect(canTransitionApplication('interviewing', 'offered')).toBe(true);
      expect(canTransitionApplication('offered', 'hired')).toBe(true);
    });

    it('rejects illegal or skipping transitions', () => {
      expect(canTransitionApplication('draft', 'hired')).toBe(false);
      expect(canTransitionApplication('draft', 'interviewing')).toBe(false);
      expect(canTransitionApplication('hired', 'submitted')).toBe(false);
      expect(canTransitionApplication('rejected', 'offered')).toBe(false);
    });

    it('enforces AI assessment policy boundary strictly', () => {
      expect(isAIAssistanceAllowed('AI_ALLOWED')).toBe(true);
      expect(isAIAssistanceAllowed('AI_PROHIBITED')).toBe(false);
      expect(isAIAssistanceAllowed('AI_RESTRICTED')).toBe(false);
      expect(isAIAssistanceAllowed('POST_ASSESSMENT_ONLY')).toBe(false);
    });

    it('creates DomainError with code, message and details', () => {
      const err = new DomainError('ASSESSMENT_AI_PROHIBITED', 'AI is disallowed during exam', { sessionId: '123' });
      expect(err.code).toBe('ASSESSMENT_AI_PROHIBITED');
      expect(err.message).toBe('AI is disallowed during exam');
      expect(err.details).toEqual({ sessionId: '123' });
    });
  });

  describe('Contracts & Schema Validation', () => {
    it('validates canonical error envelope structure', () => {
      const validError = {
        error: {
          code: 'APPLICATION_ALREADY_SUBMITTED',
          message: 'The application has already been submitted.',
          request_id: 'req_test_123',
        },
      };
      const parsed = ErrorEnvelopeSchema.safeParse(validError);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid error envelope lacking request_id', () => {
      const invalid = {
        error: {
          code: 'ERR',
          message: 'failed',
        },
      };
      const parsed = ErrorEnvelopeSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it('validates registration input requirements', () => {
      const valid = RegisterInputSchema.safeParse({
        email: 'user@example.com',
        password: 'ValidPassword123!',
        fullName: 'Test Candidate',
        role: 'candidate',
      });
      expect(valid.success).toBe(true);

      const invalidEmail = RegisterInputSchema.safeParse({
        email: 'invalid-email',
        password: 'ValidPassword123!',
        fullName: 'Test Candidate',
      });
      expect(invalidEmail.success).toBe(false);

      const shortPassword = RegisterInputSchema.safeParse({
        email: 'user@example.com',
        password: '123',
        fullName: 'Test Candidate',
      });
      expect(shortPassword.success).toBe(false);
    });

    it('validates pagination defaults and caps', () => {
      const defaultPage = PaginationQuerySchema.parse({});
      expect(defaultPage.page).toBe(1);
      expect(defaultPage.limit).toBe(20);

      const capped = PaginationQuerySchema.safeParse({ page: 2, limit: 200 });
      expect(capped.success).toBe(false);
    });

    it('validates create evidence input types', () => {
      const valid = CreateEvidenceInputSchema.safeParse({
        type: 'project',
        title: 'Production PWA Engine',
        description: 'Complete offline-first PWA for talent intelligence',
        source: 'github.com/org/repo',
        provenance: 'git-commit-hash-abc',
        recencyDate: '2026-09-24',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('Configuration & Environment Validation', () => {
    it('loads server environment with safe defaults', () => {
      const env = validateServerEnv({});
      expect(env.NODE_ENV).toBe('development');
      expect(env.APP_NAME).toBe('TalentSphere');
      expect(env.PORT).toBe(4000);
      expect(env.AI_FREE_USER_PAID_INFERENCE).toBe(false);
    });

    it('provides application constants', () => {
      expect(CONSTANTS.APP_NAME).toBe('TalentSphere');
      expect(CONSTANTS.API_VERSION).toBe('v1');
    });
  });

  describe('Observability & Audit Sinks', () => {
    it('creates structured logger instance without crashing', () => {
      const log = createLogger({ name: 'test-logger' });
      expect(log).toBeDefined();
      expect(typeof log.info).toBe('function');
    });

    it('records and retrieves audit events in memory', async () => {
      const sink = new InMemoryAuditSink();
      await sink.emit({
        id: 'aud_1',
        eventName: 'user.login',
        actorId: 'usr_123',
        timestamp: new Date().toISOString(),
      });

      const events = sink.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.eventName).toBe('user.login');
      expect(events[0]?.actorId).toBe('usr_123');
    });
  });

  describe('Testing Mock Factories', () => {
    it('creates compliant mock user, profile, and evidence objects', () => {
      const user = createMockUser({ email: 'custom@test.com' });
      expect(user.email).toBe('custom@test.com');
      expect(user.status).toBe('active');

      const profile = createMockProfile({ fullName: 'Alice Smith' });
      expect(profile.fullName).toBe('Alice Smith');
      expect(profile.privacy).toBe('public');

      const evidence = createMockEvidence({ type: 'assessment' });
      expect(evidence.type).toBe('assessment');
      expect(evidence.status).toBe('verified');
    });
  });
});
