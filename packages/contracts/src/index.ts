import { z } from 'zod';

/**
 * Standard Canonical Error Envelope
 * Per Section 20 of Master Execution Prompt and docs/engineering/API_CONTRACTS.md
 */
export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    request_id: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/**
 * Standard Pagination Schema
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginatedMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type PaginatedMeta = z.infer<typeof PaginatedMetaSchema>;

/**
 * Authentication Contracts
 */
export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['candidate', 'recruiter']).default('candidate'),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UserSessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    roles: z.array(z.string()),
  }),
  accessToken: z.string(),
  expiresAt: z.number(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

/**
 * Profile Contracts
 */
export const UpdateProfileInputSchema = z.object({
  fullName: z.string().min(2).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  privacy: z.enum(['public', 'connections_only', 'recruiters_only', 'private']).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/**
 * Evidence Contracts
 */
export const CreateEvidenceInputSchema = z.object({
  type: z.enum([
    'self_declaration',
    'course_completion',
    'assessment',
    'project',
    'work_experience',
    'contribution',
    'employer_verification',
    'institution_credential',
    'external_verification',
  ]),
  title: z.string().min(3).max(200),
  description: z.string().max(5000),
  source: z.string().max(500),
  provenance: z.string().max(500),
  recencyDate: z.string(),
});

export type CreateEvidenceInput = z.infer<typeof CreateEvidenceInputSchema>;

/**
 * Job Application Transition Contract
 */
export const TransitionApplicationInputSchema = z.object({
  applicationId: z.string().uuid(),
  targetState: z.enum([
    'draft',
    'submitted',
    'in_review',
    'shortlisted',
    'interviewing',
    'offered',
    'hired',
    'rejected',
    'withdrawn',
  ]),
  reason: z.string().max(500).optional(),
});

export type TransitionApplicationInput = z.infer<typeof TransitionApplicationInputSchema>;
