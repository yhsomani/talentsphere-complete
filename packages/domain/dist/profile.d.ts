import { Profile, Role } from './core.js';
export declare function createProfileEntity(userId: string, fullName: string): Profile;
export declare function updateProfileEntity(current: Profile, updates: Partial<Pick<Profile, 'fullName' | 'headline' | 'bio' | 'location' | 'avatarUrl' | 'privacy'>>): Profile;
/**
 * Purpose-based privacy check in accordance with Section 34 of Master Execution Prompt
 */
export declare function canViewProfile(targetProfile: Profile, viewerUserId?: string, viewerRoles?: Role[]): boolean;
//# sourceMappingURL=profile.d.ts.map