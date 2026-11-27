/**
 * Career goal v1 (plan TS-13, §6.5, ADR-034). A person names the role they
 * want. The skills that role needs come from live published postings whose
 * title matches, not from invented templates. Each needed skill is compared
 * with the person's skill profile, and the next step for it names the signal
 * that step produces. Steps are computed on read, so a step is done as soon
 * as its signal lands.
 */
import type { Job } from './jobs.js';
import { DomainError } from './core.js';
import {
  explainSkillMatch,
  type SkillMatchEntry,
  type SkillProfileEntry,
} from './skill-signals.js';

export const GOAL_TITLE_MIN = 2;
export const GOAL_TITLE_MAX = 80;
/** At most this many skills are listed for a goal, most in demand first. */
export const GOAL_MAX_SKILLS = 15;

export interface CareerGoal {
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/** Trimmed, inner whitespace collapsed; VALIDATION_FAILED when out of bounds. */
export function normalizeGoalTitle(raw: string): string {
  const title = raw.trim().replace(/\s+/g, ' ');
  if (title.length < GOAL_TITLE_MIN || title.length > GOAL_TITLE_MAX) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `A goal is a role title of ${GOAL_TITLE_MIN} to ${GOAL_TITLE_MAX} characters.`
    );
  }
  return title;
}

const words = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}+#.]+/gu) ?? [];

/** A posting matches a goal when its title holds every word of the goal. */
export function postingMatchesGoal(goalTitle: string, postingTitle: string): boolean {
  const wanted = words(goalTitle);
  const have = new Set(words(postingTitle));
  return wanted.length > 0 && wanted.every((w) => have.has(w));
}

/** What the person should do next for one skill, and the signal it produces. */
export type GoalStep =
  { kind: 'show'; produces: 'unverified' } | { kind: 'verify'; produces: 'peer_reviewed' } | null;

export interface GoalSkill extends SkillMatchEntry {
  /** How many of the matching postings require this skill. */
  requiredBy: number;
  nextStep: GoalStep;
}

export interface GoalPlan {
  matchingPostings: number;
  shown: number;
  verified: number;
  skills: GoalSkill[];
}

/**
 * The gap list and next steps for a goal: skills required by any matching
 * published posting, most in demand first, each with its status against the
 * profile and the one step that moves it up.
 */
export function planCareerGoal(
  goalTitle: string,
  jobs: readonly Pick<Job, 'title' | 'status' | 'requiredSkillIds'>[],
  profile: readonly SkillProfileEntry[]
): GoalPlan {
  const matching = jobs.filter(
    (job) => job.status === 'published' && postingMatchesGoal(goalTitle, job.title)
  );
  const demand = new Map<string, number>();
  for (const job of matching) {
    for (const skillId of new Set(job.requiredSkillIds)) {
      demand.set(skillId, (demand.get(skillId) ?? 0) + 1);
    }
  }
  const ranked = [...demand]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, GOAL_MAX_SKILLS)
    .map(([skillId]) => skillId);
  const match = explainSkillMatch(ranked, profile);
  return {
    matchingPostings: matching.length,
    shown: match.shown,
    verified: match.verified,
    skills: match.skills.map((entry) => ({
      ...entry,
      requiredBy: demand.get(entry.skillId) ?? 0,
      nextStep: !entry.shown
        ? { kind: 'show', produces: 'unverified' }
        : entry.strongestRung === 'unverified'
          ? { kind: 'verify', produces: 'peer_reviewed' }
          : null,
    })),
  };
}
