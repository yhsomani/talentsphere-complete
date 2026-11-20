// canViewProfile visibility matrix (C-24 T1, completed under C-29).
import { describe, expect, it } from 'vitest';
import { canViewProfile, type Profile, type Role } from '../../packages/domain/src/index.js';

const ownerUserId = '00000000-0000-4000-a000-000000000001';
const profileFor = (privacy: Profile['privacy']): Profile => ({
  id: '00000000-0000-4000-a000-0000000000p1',
  userId: ownerUserId,
  fullName: 'Owner',
  privacy,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

type Viewer = { name: string; id?: string; roles: Role[] };
const viewers: Viewer[] = [
  { name: 'owner', id: ownerUserId, roles: ['candidate'] },
  { name: 'platform_admin', id: 'v-admin', roles: ['platform_admin'] },
  { name: 'moderator', id: 'v-mod', roles: ['moderator'] },
  { name: 'recruiter', id: 'v-rec', roles: ['recruiter'] },
  { name: 'hiring_manager', id: 'v-hm', roles: ['hiring_manager'] },
  { name: 'candidate stranger', id: 'v-cand', roles: ['candidate'] },
  { name: 'anonymous', id: undefined, roles: [] },
];

// Expected visibility per privacy setting, for viewers with no connection.
const expected: Record<Profile['privacy'], string[]> = {
  public: viewers.map((v) => v.name),
  recruiters_only: ['owner', 'platform_admin', 'moderator', 'recruiter', 'hiring_manager'],
  connections_only: ['owner', 'platform_admin', 'moderator'],
  private: ['owner', 'platform_admin', 'moderator'],
};

describe('canViewProfile visibility matrix', () => {
  for (const privacy of Object.keys(expected) as Array<Profile['privacy']>) {
    for (const viewer of viewers) {
      const allowed = expected[privacy].includes(viewer.name);
      it(`${privacy}: ${viewer.name} ${allowed ? 'can' : 'cannot'} view`, () => {
        expect(canViewProfile(profileFor(privacy), viewer.id, viewer.roles)).toBe(allowed);
      });
    }
  }

  it('connections_only: an accepted connection can view, an unconnected viewer cannot (C-29)', () => {
    const profile = profileFor('connections_only');
    expect(canViewProfile(profile, 'v-cand', ['candidate'], { isConnected: true })).toBe(true);
    expect(canViewProfile(profile, 'v-cand', ['candidate'], { isConnected: false })).toBe(false);
    expect(canViewProfile(profile, 'v-rec', ['recruiter'], { isConnected: false })).toBe(false);
  });

  it('a connection does not open a private or recruiters-only profile', () => {
    expect(
      canViewProfile(profileFor('private'), 'v-cand', ['candidate'], { isConnected: true })
    ).toBe(false);
    expect(
      canViewProfile(profileFor('recruiters_only'), 'v-cand', ['candidate'], { isConnected: true })
    ).toBe(false);
  });
});
