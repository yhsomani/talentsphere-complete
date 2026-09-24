import { DomainError } from './index.js';

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type SkillRelationshipType =
  | 'prerequisite_of'
  | 'subskill_of'
  | 'supersedes'
  | 'correlates_with';

export interface SkillRelationship {
  id: string;
  sourceSkillId: string;
  targetSkillId: string;
  relationshipType: SkillRelationshipType;
  weight: number;
  createdAt: string;
}

export interface SkillGraphNode {
  skill: Skill;
  prerequisites: Skill[];
  subskills: Skill[];
  correlations: Skill[];
  depth: number;
}

/**
 * Validates whether adding a new 'prerequisite_of' relationship would create a cycle (BR-147).
 * If sourceSkillId is a prerequisite of targetSkillId (source -> target),
 * a cycle occurs if there is ALREADY a directed prerequisite path from targetSkillId to sourceSkillId.
 */
export function wouldCreatePrerequisiteCycle(
  existingRelationships: SkillRelationship[],
  sourceSkillId: string,
  targetSkillId: string
): boolean {
  if (sourceSkillId === targetSkillId) {
    return true; // Self-loop is immediate cycle
  }

  // Build adjacency list for 'prerequisite_of'
  // Edge: A -> B means A is prerequisite of B
  const adj = new Map<string, string[]>();
  for (const rel of existingRelationships) {
    if (rel.relationshipType === 'prerequisite_of') {
      const neighbors = adj.get(rel.sourceSkillId) || [];
      neighbors.push(rel.targetSkillId);
      adj.set(rel.sourceSkillId, neighbors);
    }
  }

  // DFS search from targetSkillId to see if we can reach sourceSkillId
  const visited = new Set<string>();
  const stack = [targetSkillId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === sourceSkillId) {
      return true; // Cycle detected!
    }
    if (!visited.has(current)) {
      visited.add(current);
      const nextNodes = adj.get(current) || [];
      for (const next of nextNodes) {
        if (!visited.has(next)) {
          stack.push(next);
        }
      }
    }
  }

  return false;
}

/**
 * Creates a skill relationship, strictly checking for prerequisite cycles (BR-147).
 */
export function createSkillRelationship(
  existingRelationships: SkillRelationship[],
  params: {
    id?: string;
    sourceSkillId: string;
    targetSkillId: string;
    relationshipType: SkillRelationshipType;
    weight?: number;
  }
): SkillRelationship {
  if (params.sourceSkillId === params.targetSkillId) {
    throw new DomainError('VALIDATION_FAILED', 'Skill cannot have a relationship with itself.');
  }

  if (params.relationshipType === 'prerequisite_of') {
    if (wouldCreatePrerequisiteCycle(existingRelationships, params.sourceSkillId, params.targetSkillId)) {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        'Prerequisite relationship would create a circular dependency (BR-147).'
      );
    }
  }

  return {
    id: params.id || crypto.randomUUID(),
    sourceSkillId: params.sourceSkillId,
    targetSkillId: params.targetSkillId,
    relationshipType: params.relationshipType,
    weight: params.weight !== undefined ? params.weight : 1.0,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Traverses a skill's immediate graph bounded by maxDepth (default 5 hops per BR-146).
 */
export function traverseSkillGraph(
  rootSkill: Skill,
  allSkills: Map<string, Skill>,
  relationships: SkillRelationship[],
  maxDepth: number = 5
): SkillGraphNode {
  const boundedDepth = Math.min(maxDepth, 5); // Hard limit 5 hops per BR-146

  const prerequisites: Skill[] = [];
  const subskills: Skill[] = [];
  const correlations: Skill[] = [];

  for (const rel of relationships) {
    if (rel.targetSkillId === rootSkill.id && rel.relationshipType === 'prerequisite_of') {
      const skill = allSkills.get(rel.sourceSkillId);
      if (skill) prerequisites.push(skill);
    } else if (rel.sourceSkillId === rootSkill.id && rel.relationshipType === 'subskill_of') {
      const skill = allSkills.get(rel.targetSkillId);
      if (skill) subskills.push(skill);
    } else if (
      (rel.sourceSkillId === rootSkill.id || rel.targetSkillId === rootSkill.id) &&
      rel.relationshipType === 'correlates_with'
    ) {
      const partnerId = rel.sourceSkillId === rootSkill.id ? rel.targetSkillId : rel.sourceSkillId;
      const skill = allSkills.get(partnerId);
      if (skill) correlations.push(skill);
    }
  }

  return {
    skill: rootSkill,
    prerequisites,
    subskills,
    correlations,
    depth: boundedDepth,
  };
}
