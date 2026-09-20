/**
 * EducationSection Component
 * 
 * Displays and manages candidate education history with interactive add/delete.
 */

'use client';

import React, { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { Education } from '@/types';
import { Plus, Trash2, GraduationCap, School, Calendar } from 'lucide-react';

interface EducationSectionProps {
  educations: Education[];
  onAdd: (edu: {
    institution_name: string;
    degree?: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    grade?: string;
    description?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EducationSection({ educations, onAdd, onDelete }: EducationSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    institution_name: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    grade: '',
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institution_name || !formData.start_date) {
      return;
    }

    try {
      setSubmitting(true);
      await onAdd({
        institution_name: formData.institution_name,
        degree: formData.degree || undefined,
        field_of_study: formData.field_of_study || undefined,
        start_date: formData.start_date,
        end_date: formData.is_current ? undefined : formData.end_date || undefined,
        is_current: formData.is_current,
        grade: formData.grade || undefined,
      });
      setFormData({
        institution_name: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        is_current: false,
        grade: '',
      });
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 border-slate-200/80 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Education & Academic Background</h2>
            <p className="text-xs text-slate-500">Degrees, academic institutions, and certifications</p>
          </div>
        </div>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            Add Degree
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 sm:p-6 border border-indigo-100 bg-indigo-50/40 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Add Academic Credential</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name *</label>
              <Input
                required
                placeholder="e.g. Stanford University, MIT"
                value={formData.institution_name}
                onChange={(e) => setFormData(prev => ({ ...prev, institution_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
              <Input
                placeholder="e.g. Bachelor of Science"
                value={formData.degree}
                onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field of Study</label>
              <Input
                placeholder="e.g. Computer Science, Artificial Intelligence"
                value={formData.field_of_study}
                onChange={(e) => setFormData(prev => ({ ...prev, field_of_study: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grade / Honors</label>
              <Input
                placeholder="e.g. 3.9 GPA / Summa Cum Laude"
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <Input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            {!formData.is_current && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            )}
            <div className="flex items-center pt-6">
              <label className="flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_current: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2 h-4 w-4"
                />
                Currently enrolled
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Credential'}
            </Button>
          </div>
        </form>
      )}
      
      {educations.length === 0 && !isAdding ? (
        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
          No academic records added yet. Add your university degrees and diplomas.
        </p>
      ) : (
        <div className="space-y-4">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-all flex justify-between items-start gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">{edu.institution_name}</h3>
                {(edu.degree || edu.field_of_study) && (
                  <p className="text-indigo-600 font-semibold text-sm flex items-center gap-1.5">
                    <School className="w-4 h-4 text-indigo-500" />
                    {edu.degree}{edu.field_of_study && ` in ${edu.field_of_study}`}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </span>
                  {edu.grade && (
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete(edu.id)}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                aria-label="Delete education"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
