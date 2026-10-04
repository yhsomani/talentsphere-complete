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
    periodDate: string;
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
export declare const AI_QUOTA_LIMITS: Record<AITier, {
    maxTokensPerDay: number;
    maxRequestsPerDay: number;
}>;
export declare const AI_ADVISORY_DISCLAIMER = "AI outputs are advisory and not verified candidate evidence. Recommendations do not mutate your verified profile or credentials.";
/**
 * Conservative token count estimation (~4 characters per token + framing overhead).
 */
export declare function estimateTokens(text: string): number;
/**
 * Context Firewall & Prompt Injection Defense (WIT-007, APP_FLOW.md).
 * Sanitizes delimiters, escapes XML tags, and frames with <user_content>.
 */
export declare function sanitizePromptInput(rawInput: string, maxChars?: number): {
    sanitized: string;
    framed: string;
};
/**
 * Asserts user is within entitlement quota limits.
 * Guarantees zero silent third-party paid cost incurred for free tier users (SSOT Section 16.4).
 */
export declare function assertWithinAIQuota(meter: AIUsageMeter | undefined, requestedTokens: number, tier?: AITier): void;
/**
 * Creates initial conversation entity.
 */
export declare function createAIConversationEntity(userId: string, title?: string, purpose?: string): AIConversation;
/**
 * Generate intelligent career advisory response with provenance metadata.
 */
export declare function generateCareerAssistantResponse(params: {
    conversationId: string;
    prompt: string;
    requestId?: string;
    candidateSkills?: string[];
    careerInterests?: string[];
}): AIEngineResponse;
//# sourceMappingURL=ai-gateway.d.ts.map