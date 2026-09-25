import { DomainError } from './index.js';

export type AISenderRole = 'user' | 'assistant' | 'system';
export type AITier = 'free' | 'pro' | 'enterprise';

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  senderRole: AISenderRole;
  content: string;
  sanitizedContent: string;
  tokensUsed: number;
  model: string;
  createdAt: string;
}

export interface AIUsageMeter {
  id: string;
  userId: string;
  periodDate: string; // YYYY-MM-DD
  tokensConsumed: number;
  requestsCount: number;
  tier: AITier;
  createdAt: string;
  updatedAt: string;
}

export interface AIProvenance {
  requestId: string;
  capability: string;
  model: string;
  executionMode: 'local_heuristic' | 'cloud_provider';
  tokensUsed: number;
  disclaimer: string;
  timestamp: string;
}

export interface AIEngineResponse {
  message: AIMessage;
  provenance: AIProvenance;
}

// Daily Quota Limits (SSOT Section 16.4: Free-User Cost Invariant)
export const AI_QUOTA_LIMITS: Record<
  AITier,
  { maxTokensPerDay: number; maxRequestsPerDay: number }
> = {
  free: {
    maxTokensPerDay: 5000,
    maxRequestsPerDay: 20,
  },
  pro: {
    maxTokensPerDay: 100000,
    maxRequestsPerDay: 500,
  },
  enterprise: {
    maxTokensPerDay: 1000000,
    maxRequestsPerDay: 5000,
  },
};

export const AI_ADVISORY_DISCLAIMER =
  'AI outputs are advisory and not verified candidate evidence. Recommendations do not mutate your verified profile or credentials.';

/**
 * Conservative token count estimation (~4 characters per token + framing overhead).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4) + 8;
}

/**
 * Context Firewall & Prompt Injection Defense (WIT-007, APP_FLOW.md).
 * Sanitizes delimiters, escapes XML tags, and frames with <user_content>.
 */
export function sanitizePromptInput(
  rawInput: string,
  maxChars = 2000
): { sanitized: string; framed: string } {
  if (!rawInput || typeof rawInput !== 'string') {
    throw new DomainError('VALIDATION_FAILED', 'Prompt must be a non-empty string.');
  }

  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Prompt cannot be empty or blank.');
  }

  if (trimmed.length > maxChars) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `Prompt exceeds maximum length of ${maxChars} characters.`
    );
  }

  // Detect explicit prompt injection delimiters
  const injectionPatterns = [
    /<script\b[^>]*>/i,
    /<\/script>/i,
    /system\s*prompt\s*override/i,
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /disregard\s+all\s+guardrails/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(trimmed)) {
      throw new DomainError(
        'POLICY_VIOLATION',
        'Prompt contains prohibited injection patterns or script tags.'
      );
    }
  }

  // Escape HTML/XML tags
  const escaped = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const framed = `<user_content>\n${escaped}\n</user_content>`;

  return {
    sanitized: escaped,
    framed,
  };
}

/**
 * Asserts user is within entitlement quota limits.
 * Guarantees zero silent third-party paid cost incurred for free tier users (SSOT Section 16.4).
 */
export function assertWithinAIQuota(
  meter: AIUsageMeter | undefined,
  requestedTokens: number,
  tier: AITier = 'free'
): void {
  const limits = AI_QUOTA_LIMITS[tier] || AI_QUOTA_LIMITS.free;

  const currentTokens = meter?.tokensConsumed ?? 0;
  const currentRequests = meter?.requestsCount ?? 0;

  if (currentRequests + 1 > limits.maxRequestsPerDay) {
    throw new DomainError(
      'FREE_USER_AI_QUOTA_EXCEEDED',
      `Daily AI request limit reached (${limits.maxRequestsPerDay} requests/day). Upgrade to Pro for higher limits.`
    );
  }

  if (currentTokens + requestedTokens > limits.maxTokensPerDay) {
    throw new DomainError(
      'FREE_USER_AI_QUOTA_EXCEEDED',
      `Daily AI token quota exceeded (${limits.maxTokensPerDay} tokens/day). Current usage: ${currentTokens} tokens.`
    );
  }
}

/**
 * Creates initial conversation entity.
 */
export function createAIConversationEntity(
  userId: string,
  title?: string,
  purpose: string = 'career_guidance'
): AIConversation {
  if (!userId) {
    throw new DomainError('VALIDATION_FAILED', 'User ID is required to create an AI conversation.');
  }

  return {
    id: crypto.randomUUID(),
    userId,
    title: title?.trim() || 'Career Assistant Chat',
    purpose,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate intelligent career advisory response with provenance metadata.
 */
export function generateCareerAssistantResponse(params: {
  conversationId: string;
  prompt: string;
  requestId?: string;
  candidateSkills?: string[];
  careerInterests?: string[];
}): AIEngineResponse {
  const { conversationId, prompt, requestId, candidateSkills = [], careerInterests = [] } = params;

  const { sanitized } = sanitizePromptInput(prompt);
  const inputTokens = estimateTokens(prompt);

  // Intelligent domain career response synthesis
  let responseText = '';
  const lower = prompt.toLowerCase();

  if (lower.includes('resume') || lower.includes('cv')) {
    responseText =
      'To strengthen your resume for modern tech roles:\n' +
      '1. Anchor each bullet point in quantifiable outcomes (e.g. "reduced latency by 35% via caching").\n' +
      '2. Link directly to verifiable credentials and code artifacts.\n' +
      '3. Highlight verified graph competencies rather than self-reported buzzwords.';
  } else if (lower.includes('interview') || lower.includes('prep')) {
    responseText =
      'Key recommendations for interview preparation:\n' +
      '1. Practice system design tradeoffs: consistency vs. availability, indexing costs, and RLS partitioning.\n' +
      '2. Structure behavioral responses with the STAR method (Situation, Task, Action, Result).\n' +
      '3. Complete live sandboxed challenges in the TalentSphere Arena to validate your proficiency.';
  } else if (lower.includes('skill') || lower.includes('learn') || lower.includes('gap')) {
    const known = candidateSkills.length > 0 ? candidateSkills.join(', ') : 'TypeScript, SQL';
    responseText =
      `Based on your current competencies (${known}), high-impact learning paths include:\n` +
      '1. Distributed event streaming and transactional worker queues.\n' +
      '2. Zero-trust security, defense-in-depth authorization, and public credential verification.\n' +
      '3. Explore relevant courses in the TalentSphere Learning Management System (LMS).';
  } else {
    responseText =
      `Here is career guidance for "${sanitized}":\n` +
      'Focus on evidence-backed capabilities: build demonstrable portfolio projects, complete verified skill assessments, ' +
      'and engage in meaningful peer collaborations to accelerate your trajectory.';
  }

  const outputTokens = estimateTokens(responseText);
  const totalTokens = inputTokens + outputTokens;

  const message: AIMessage = {
    id: crypto.randomUUID(),
    conversationId,
    senderRole: 'assistant',
    content: responseText,
    sanitizedContent: responseText,
    tokensUsed: totalTokens,
    model: 'talentsphere-career-v1',
    createdAt: new Date().toISOString(),
  };

  const provenance: AIProvenance = {
    requestId: requestId || `req_ai_${crypto.randomUUID()}`,
    capability: 'career_guidance',
    model: 'talentsphere-career-v1',
    executionMode: 'local_heuristic',
    tokensUsed: totalTokens,
    disclaimer: AI_ADVISORY_DISCLAIMER,
    timestamp: new Date().toISOString(),
  };

  return {
    message,
    provenance,
  };
}
