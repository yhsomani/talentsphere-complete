export interface Skill {
    id: string;
    slug: string;
    name: string;
    category: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
export type SkillRelationshipType = 'prerequisite_of' | 'subskill_of' | 'supersedes' | 'correlates_with';
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
export declare function wouldCreatePrerequisiteCycle(existingRelationships: SkillRelationship[], sourceSkillId: string, targetSkillId: string): boolean;
/**
 * Creates a skill relationship, strictly checking for prerequisite cycles (BR-147).
 */
export declare function createSkillRelationship(existingRelationships: SkillRelationship[], params: {
    id?: string;
    sourceSkillId: string;
    targetSkillId: string;
    relationshipType: SkillRelationshipType;
    weight?: number;
}): SkillRelationship;
/**
 * Traverses a skill's immediate graph bounded by maxDepth (default 5 hops per BR-146).
 */
export declare function traverseSkillGraph(rootSkill: Skill, allSkills: Map<string, Skill>, relationships: SkillRelationship[], maxDepth?: number): SkillGraphNode;
//# sourceMappingURL=skills.d.ts.map