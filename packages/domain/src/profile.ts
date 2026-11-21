import crypto from 'node:crypto';
import { Profile, Role } from './core.js';

export function createProfileEntity(userId: string, fullName: string): Profile {
  return {
    id: crypto.randomUUID(),
    userId,
    fullName,
    privacy: 'public',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateProfileEntity(
  current: Profile,
  updates: Partial<
    Pick<Profile, 'fullName' | 'headline' | 'bio' | 'location' | 'avatarUrl' | 'privacy'>
  >
): Profile {
  return {
    ...current,
    fullName: updates.fullName?.trim() || current.fullName,
    headline: updates.headline !== undefined ? updates.headline.trim() : current.headline,
    bio: updates.bio !== undefined ? updates.bio.trim() : current.bio,
    location: updates.location !== undefined ? updates.location.trim() : current.location,
    avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : current.avatarUrl,
    privacy: updates.privacy || current.privacy,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Purpose-based privacy check in accordance with Section 34 of Master Execution Prompt
 */
export function canViewProfile(
  targetProfile: Profile,
  viewerUserId?: string,
  viewerRoles: Role[] = [],
  opts: { isConnected?: boolean } = {}
): boolean {
  // 1. Owner can always view own profile
  if (viewerUserId && viewerUserId === targetProfile.userId) {
    return true;
  }

  // 2. Platform Admin or Moderator can view for safety/compliance
  if (viewerRoles.includes('platform_admin') || viewerRoles.includes('moderator')) {
    return true;
  }

  // 3. Privacy policies
  switch (targetProfile.privacy) {
    case 'public':
      return true;
    case 'recruiters_only':
      return viewerRoles.includes('recruiter') || viewerRoles.includes('hiring_manager');
    case 'connections_only':
      // An accepted connection, as for connections-only portfolio projects (C-29).
      return Boolean(opts.isConnected);
    case 'private':
      return false;
    default:
      return false;
  }
}

export type ActivityVisibility = 'allowed' | 'profile_restricted' | 'activity_hidden';

/**
 * May the viewer read another person's activity score (C-26, CF-34)? The
 * profile's privacy applies first, as for the profile itself; then the
 * person's own "show activity" setting, which only the owner and
 * admins/moderators may override. Missing settings mean the default (shown).
 */
export function canViewActivity(params: {
  profile: Profile;
  settings?: { showActivity?: boolean };
  viewerUserId?: string;
  viewerRoles?: Role[];
}): ActivityVisibility {
  const { profile, settings, viewerUserId, viewerRoles = [] } = params;
  if (!canViewProfile(profile, viewerUserId, viewerRoles)) return 'profile_restricted';
  const privileged =
    viewerUserId === profile.userId ||
    viewerRoles.includes('platform_admin') ||
    viewerRoles.includes('moderator');
  if (!privileged && settings?.showActivity === false) return 'activity_hidden';
  return 'allowed';
}
