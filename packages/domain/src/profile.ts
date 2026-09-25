import crypto from 'node:crypto';
import { Profile, Role } from './index.js';

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
  updates: Partial<Pick<Profile, 'fullName' | 'headline' | 'bio' | 'location' | 'avatarUrl' | 'privacy'>>
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
  viewerRoles: Role[] = []
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
      // Requires connection state
      return false;
    case 'private':
      return false;
    default:
      return false;
  }
}
