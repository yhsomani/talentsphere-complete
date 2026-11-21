import { describe, expect, it } from 'vitest';
import { canViewActivity, createProfileEntity } from '../../packages/domain/src/index.js';
import type { Profile } from '../../packages/domain/src/index.js';

describe('canViewActivity (C-26)', () => {
  const ownerId = '11111111-1111-4111-8111-111111111111';
  const viewerId = '22222222-2222-4222-8222-222222222222';
  const profile = (privacy: Profile['privacy']): Profile => ({
    ...createProfileEntity(ownerId, 'Owner'),
    privacy,
  });

  it('follows the profile privacy first', () => {
    expect(canViewActivity({ profile: profile('public'), viewerUserId: viewerId })).toBe('allowed');
    expect(
      canViewActivity({
        profile: profile('recruiters_only'),
        viewerUserId: viewerId,
        viewerRoles: ['candidate'],
      })
    ).toBe('profile_restricted');
    expect(
      canViewActivity({
        profile: profile('recruiters_only'),
        viewerUserId: viewerId,
        viewerRoles: ['recruiter'],
      })
    ).toBe('allowed');
    expect(canViewActivity({ profile: profile('private'), viewerUserId: viewerId })).toBe(
      'profile_restricted'
    );
  });

  it('honours showActivity: false for everyone but the owner, admins and moderators', () => {
    const hidden = { showActivity: false };
    expect(
      canViewActivity({
        profile: profile('public'),
        settings: hidden,
        viewerUserId: viewerId,
        viewerRoles: ['recruiter'],
      })
    ).toBe('activity_hidden');
    expect(
      canViewActivity({ profile: profile('private'), settings: hidden, viewerUserId: ownerId })
    ).toBe('allowed');
    for (const role of ['platform_admin', 'moderator'] as const) {
      expect(
        canViewActivity({
          profile: profile('public'),
          settings: hidden,
          viewerUserId: viewerId,
          viewerRoles: [role],
        })
      ).toBe('allowed');
    }
  });

  it('treats missing settings as the default (shown)', () => {
    expect(
      canViewActivity({ profile: profile('public'), settings: undefined, viewerUserId: viewerId })
    ).toBe('allowed');
  });

  it("lets an accepted connection read a connections_only profile's activity (K-07)", () => {
    const connectionsOnly = profile('connections_only');
    expect(
      canViewActivity({ profile: connectionsOnly, viewerUserId: viewerId, isConnected: true })
    ).toBe('allowed');
    expect(
      canViewActivity({ profile: connectionsOnly, viewerUserId: viewerId, isConnected: false })
    ).toBe('profile_restricted');
    expect(canViewActivity({ profile: connectionsOnly, viewerUserId: viewerId })).toBe(
      'profile_restricted'
    );
    expect(
      canViewActivity({
        profile: connectionsOnly,
        settings: { showActivity: false },
        viewerUserId: viewerId,
        isConnected: true,
      })
    ).toBe('activity_hidden');
  });
});
