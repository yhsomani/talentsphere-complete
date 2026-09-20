/**
 * SkillsSection Component
 * 
 * Displays and manages candidate skills with add/remove functionality.
 */

import React from 'react';
import { Button, Badge, Input } from '@/components/ui';

export interface SkillItem {
  id: string;
  name: string;
  proficiency_level: string;
}

interface SkillsSectionProps {
  skills: SkillItem[];
  onAddSkill: () => Promise<void>;
  onRemoveSkill: (skillId: string) => Promise<void>;
  setNewSkill: (skill: string) => void;
}

export function SkillsSection({ skills, onAddSkill, onRemoveSkill, setNewSkill }: SkillsSectionProps) {
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await onAddSkill();
    }
  };

  const proficiencyLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
  };

  const proficiencyVariants: Record<string, 'default' | 'success' | 'warning'> = {
    beginner: 'default',
    intermediate: 'warning',
    advanced: 'success',
    expert: 'success',
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
      
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <Badge
              key={skill.id}
              variant={proficiencyVariants[skill.proficiency_level] || 'default'}
              size="md"
              className="flex items-center gap-1"
            >
              {skill.name} - {proficiencyLabels[skill.proficiency_level] || skill.proficiency_level}
              <button
                onClick={() => onRemoveSkill(skill.id)}
                className="ml-1 hover:text-red-600 focus:outline-none"
                aria-label={`Remove ${skill.name}`}
                type="button"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No skills added yet.</p>
      )}
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add a skill (e.g., React, TypeScript)"
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={onAddSkill} variant="secondary" size="sm">
          Add Skill
        </Button>
      </div>
    </section>
  );
}
