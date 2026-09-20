/**
 * EducationSection Component
 * 
 * Displays and manages candidate education history.
 */

import React from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { Education } from '@/types';

interface EducationSectionProps {
  educations: Education[];
  onAdd: (edu: Partial<Education>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EducationSection({ educations, onAdd, onDelete }: EducationSectionProps) {
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
        <h2 className="text-lg font-semibold text-gray-900">Education</h2>
        <Button size="sm" onClick={() => onAdd({
          institution_name: '',
          start_date: new Date().toISOString().split('T')[0],
        })}>
          Add Education
        </Button>
      </div>
      
      {educations.length === 0 ? (
        <p className="text-sm text-gray-500">No education added yet.</p>
      ) : (
        <div className="space-y-4">
          {educations.map((edu) => (
            <Card key={edu.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{edu.institution_name}</h3>
                  {(edu.degree || edu.field_of_study) && (
                    <p className="text-gray-600">
                      {edu.degree}{edu.field_of_study && ` in ${edu.field_of_study}`}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </p>
                  {edu.grade && (
                    <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                  )}
                  {edu.activities && edu.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {edu.activities.map((activity, idx) => (
                        <Badge key={idx} variant="default" size="small">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(edu.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  aria-label="Delete education"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
