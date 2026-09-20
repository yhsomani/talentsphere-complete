/**
 * ExperienceSection Component
 * 
 * Displays and manages candidate work experience.
 */

import React from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { Experience } from '@/types';

interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd: (exp: Partial<Experience>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Experience>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ExperienceSection({ experiences, onAdd, onUpdate, onDelete }: ExperienceSectionProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
        <Button size="sm" onClick={() => onAdd({
          company_name: '',
          job_title: '',
          start_date: new Date().toISOString().split('T')[0],
          is_current: false,
          skills_used: [],
          verified: false
        })}>
          Add Experience
        </Button>
      </div>
      
      {experiences.length === 0 ? (
        <p className="text-sm text-gray-500">No work experience added yet.</p>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card key={exp.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{exp.job_title}</h3>
                  <p className="text-gray-600">{exp.company_name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                  </p>
                  {exp.location && (
                    <p className="text-sm text-gray-500">{exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                  )}
                  {exp.skills_used.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.skills_used.map((skill, idx) => (
                        <Badge key={idx} variant="default" size="small">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    aria-label="Delete experience"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
