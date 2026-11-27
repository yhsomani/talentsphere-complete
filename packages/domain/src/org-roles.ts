/**
 * Organization roles (plan TS-04, ADR-032; conflicts CF-14, CF-45). A member's
 * role in an organization decides what they may do there. Before this, any
 * membership allowed every organization action, so a plain member could post
 * jobs, move applicants and read candidate data.
 *
 * Platform admins are handled by the caller: this is the rule for members.
 */

export const ORG_ROLES = ['owner', 'admin', 'recruiter', 'hiring_manager', 'member'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

/**
 * What a member may do:
 * - `view_jobs`: see the organization's jobs in any status, and its job templates.
 * - `manage_jobs`: create, edit, publish and close jobs; manage job and feedback templates.
 * - `review_candidates`: see applicants and their data, move them through the
 *   pipeline, give feedback, run interviews, and use talent pools and referrals.
 * - `manage_organization`: add members and report the employer's own metrics.
 */
export const ORG_ACTIONS = [
  'view_jobs',
  'manage_jobs',
  'review_candidates',
  'manage_organization',
] as const;
export type OrgAction = (typeof ORG_ACTIONS)[number];

export const ORG_ROLE_POLICY: Record<OrgAction, readonly OrgRole[]> = {
  view_jobs: ['owner', 'admin', 'recruiter', 'hiring_manager', 'member'],
  manage_jobs: ['owner', 'admin', 'recruiter'],
  review_candidates: ['owner', 'admin', 'recruiter', 'hiring_manager'],
  manage_organization: ['owner', 'admin'],
};

/** May a member with this role take this action? An unknown or missing role may not. */
export function orgRoleAllows(role: string | undefined, action: OrgAction): boolean {
  return role !== undefined && (ORG_ROLE_POLICY[action] as readonly string[]).includes(role);
}
