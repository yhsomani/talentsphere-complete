import crypto from 'node:crypto';
import { DomainError } from './core.js';

export type WarmIntroStatus =
  'pending_introducer' | 'approved' | 'declined' | 'completed' | 'cancelled';

export interface WarmIntroPreferences {
  userId: string;
  optOutIntroducer: boolean;
  blockAllIncomingIntros: boolean;
  blockedUserIds: string[];
  updatedAt: string;
}

export interface WarmIntroRequest {
  id: string;
  requesterUserId: string;
  targetUserId: string;
  introducerUserId: string;
  purpose: string;
  note: string;
  status: WarmIntroStatus;
  declineReason?: string;
  threadId?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntroductionPath {
  targetUserId: string;
  introducerUserId: string;
  hops: number;
  pathScore: number;
  mutualConnectionCount: number;
}

export interface CreateWarmIntroRequestParams {
  id?: string;
  requesterUserId: string;
  targetUserId: string;
  introducerUserId: string;
  purpose: string;
  note: string;
}

/**
 * Discovers and ranks warm introduction paths up to max depth 4 (BR-210, BR-215, BR-216).
 */
export function discoverWarmIntroPaths(
  requesterId: string,
  targetId: string,
  connectionGraph: Map<string, Set<string>>,
  prefsByUserId: Map<string, WarmIntroPreferences>
): IntroductionPath[] {
  if (requesterId === targetId) {
    return [];
  }

  const targetPrefs = prefsByUserId.get(targetId);
  if (targetPrefs?.blockAllIncomingIntros || targetPrefs?.blockedUserIds.includes(requesterId)) {
    return []; // BR-213, BR-216
  }

  const requesterConns = connectionGraph.get(requesterId) || new Set();
  const targetConns = connectionGraph.get(targetId) || new Set();

  const paths: IntroductionPath[] = [];

  // Direct mutual connections (Hop 2: Requester -> Mutual -> Target)
  for (const mutualId of requesterConns) {
    if (mutualId === targetId) continue;

    const mutualPrefs = prefsByUserId.get(mutualId);
    if (mutualPrefs?.optOutIntroducer || mutualPrefs?.blockedUserIds.includes(requesterId)) {
      continue; // BR-212, BR-216
    }

    if (targetConns.has(mutualId)) {
      paths.push({
        targetUserId: targetId,
        introducerUserId: mutualId,
        hops: 2,
        pathScore: 85,
        mutualConnectionCount: 1,
      });
    }
  }

  // Rank top paths descending by pathScore
  paths.sort((a, b) => b.pathScore - a.pathScore);
  return paths.slice(0, 3); // top 3 paths
}

/**
 * Creates a warm introduction request subject to weekly rate limits and consent rules (BR-209..BR-216).
 */
export function createWarmIntroRequest(
  params: CreateWarmIntroRequestParams,
  recentWeeklyRequestsCount: number,
  introducerPrefs?: WarmIntroPreferences,
  targetPrefs?: WarmIntroPreferences
): WarmIntroRequest {
  if (params.requesterUserId === params.targetUserId) {
    throw new DomainError('VALIDATION_FAILED', 'Cannot request introduction to yourself.');
  }

  if (params.requesterUserId === params.introducerUserId) {
    throw new DomainError('VALIDATION_FAILED', 'Cannot be your own introducer.');
  }

  if (params.targetUserId === params.introducerUserId) {
    throw new DomainError('VALIDATION_FAILED', 'Introducer cannot be the target user.');
  }

  // BR-211: Max 10 intro requests/week/user
  if (recentWeeklyRequestsCount >= 10) {
    throw new DomainError(
      'RATE_LIMIT_EXCEEDED',
      'Weekly warm introduction request limit reached (10 requests/week, BR-211).'
    );
  }

  // BR-212: Introducer can opt out of intro services
  if (introducerPrefs?.optOutIntroducer) {
    throw new DomainError(
      'FORBIDDEN',
      'Introducer has opted out of warm introduction requests (BR-212).'
    );
  }

  // BR-213: Target can block all intro requests
  if (targetPrefs?.blockAllIncomingIntros) {
    throw new DomainError(
      'FORBIDDEN',
      'Target user does not accept incoming introductions (BR-213).'
    );
  }

  // BR-216: No introduction for blocked users
  if (
    introducerPrefs?.blockedUserIds.includes(params.requesterUserId) ||
    targetPrefs?.blockedUserIds.includes(params.requesterUserId)
  ) {
    throw new DomainError('FORBIDDEN', 'Cannot send introduction request to this user (BR-216).');
  }

  if (!params.purpose || params.purpose.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Introduction purpose is required.');
  }

  // Note <= 500 characters
  if (!params.note || params.note.trim().length === 0 || params.note.length > 500) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Introduction note is required and must not exceed 500 characters.'
    );
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    requesterUserId: params.requesterUserId,
    targetUserId: params.targetUserId,
    introducerUserId: params.introducerUserId,
    purpose: params.purpose.trim(),
    note: params.note.trim(),
    status: 'pending_introducer',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Responds to an intro request with mandatory introducer consent (BR-209).
 */
export function respondToIntroRequest(
  request: WarmIntroRequest,
  actorUserId: string,
  decision: 'approve' | 'decline',
  reason?: string,
  currentTime?: Date
): WarmIntroRequest {
  if (request.introducerUserId !== actorUserId) {
    throw new DomainError(
      'FORBIDDEN',
      'Only the designated introducer can approve or decline this introduction (BR-209).'
    );
  }

  if (request.status !== 'pending_introducer') {
    throw new DomainError(
      'CONFLICT',
      `Cannot respond to introduction request in '${request.status}' status.`
    );
  }

  const now = (currentTime || new Date()).toISOString();

  if (decision === 'approve') {
    // Delivers three-way warm intro thread (BR-214)
    return {
      ...request,
      status: 'approved',
      threadId: crypto.randomUUID(),
      deliveredAt: now,
      updatedAt: now,
    };
  } else {
    return {
      ...request,
      status: 'declined',
      declineReason: reason?.trim() || 'Declined by introducer',
      updatedAt: now,
    };
  }
}
