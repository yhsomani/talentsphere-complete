import { describe, expect, it } from 'vitest';
import { ORG_ACTIONS, ORG_ROLES, orgRoleAllows } from '../../packages/domain/src/org-roles.js';

describe('Organization role policy (TS-04, ADR-032)', () => {
  it('gives each role exactly its actions', () => {
    const table = Object.fromEntries(
      ORG_ROLES.map((role) => [role, ORG_ACTIONS.filter((a) => orgRoleAllows(role, a))])
    );
    expect(table).toEqual({
      owner: ['view_jobs', 'manage_jobs', 'review_candidates', 'manage_organization'],
      admin: ['view_jobs', 'manage_jobs', 'review_candidates', 'manage_organization'],
      recruiter: ['view_jobs', 'manage_jobs', 'review_candidates'],
      hiring_manager: ['view_jobs', 'review_candidates'],
      member: ['view_jobs'],
    });
  });

  it('refuses a missing or unknown role', () => {
    for (const action of ORG_ACTIONS) {
      expect(orgRoleAllows(undefined, action)).toBe(false);
      expect(orgRoleAllows('superuser', action)).toBe(false);
    }
  });
});
