/**
 * SkillsSection Component
 * 
 * Displays and manages candidate skills with add/remove functionality and proficiency selection.
 */

'use client';

import React, { useState } from 'react';
import { Button, Badge, Input, Card } from '@/components/ui';
import { X, Sparkles, Plus } from 'lucide-react';

export interface SkillItem {
  id: string;
  name: string;
  proficiency_level: string;
}

interface SkillsSectionProps {
  skills: SkillItem[];
  onAddSkill: (proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert') => Promise<void>;
  onRemoveSkill: (skillId: string) => Promise<void>;
  newSkill: string;
  setNewSkill: (skill: string) => void;
}

export function SkillsSection({ skills, onAddSkill, onRemoveSkill, newSkill, setNewSkill }: SkillsSectionProps) {
  const [proficiency, setProficiency] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newSkill.trim()) return;
    try {
      setSubmitting(true);
      await onAddSkill(proficiency);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAdd();
    }
  };

  const proficiencyLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
  };

  const proficiencyVariants: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
    beginner: 'default',
    intermediate: 'warning',
    advanced: 'success',
    expert: 'secondary',
  };

  return (
    <Card className="p-6 sm:p-8 border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Technical Skills & Competencies</h2>
            <p className="text-xs text-slate-500">Core engineering skills, frameworks, and proficiencies</p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {skills.length} verified
        </span>
      </div>
      
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2.5 mb-6 pt-2">
          {skills.map((skill) => (
            <Badge
              key={skill.id}
              variant={proficiencyVariants[skill.proficiency_level] || 'default'}
              size="md"
              className="flex items-center gap-2 py-1 px-3 rounded-xl transition-all"
            >
              <span className="font-semibold text-slate-900">{skill.name}</span>
              <span className="text-[11px] font-medium opacity-75">· {proficiencyLabels[skill.proficiency_level] || skill.proficiency_level}</span>
              <button
                onClick={() => onRemoveSkill(skill.id)}
                className="ml-1 text-slate-400 hover:text-red-600 focus:outline-none transition-colors"
                aria-label={`Remove ${skill.name}`}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          No skills registered yet. Add your core programming languages, frameworks, or tools to power candidate matching.
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-slate-100">
        <Input
          type="text"
          placeholder="Add skill (e.g. Next.js, Rust, Docker, Kubernetes)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <select
          value={proficiency}
          onChange={(e) => setProficiency(e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert')}
          className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shrink-0"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <Button onClick={handleAdd} variant="primary" size="md" disabled={submitting || !newSkill.trim()} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          {submitting ? 'Adding...' : 'Add Skill'}
        </Button>
      </div>
    </Card>
  );
}
