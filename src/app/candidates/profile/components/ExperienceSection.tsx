/**
 * ExperienceSection Component
 * 
 * Displays and manages candidate work experience with interactive add/delete.
 */

'use client';

import React, { useState } from 'react';
import { Button, Card, Badge, Input } from '@/components/ui';
import { Experience } from '@/types';
import { Plus, Trash2, Briefcase, Building2, Calendar, MapPin } from 'lucide-react';

interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd: (exp: {
    company_name: string;
    job_title: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    location?: string;
    description?: string;
  }) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Experience>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ExperienceSection({ experiences, onAdd, onDelete }: ExperienceSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    is_current: false,
    location: '',
    description: '',
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
    if (!formData.company_name || !formData.job_title || !formData.start_date) {
      return;
    }

    try {
      setSubmitting(true);
      await onAdd({
        company_name: formData.company_name,
        job_title: formData.job_title,
        start_date: formData.start_date,
        end_date: formData.is_current ? undefined : formData.end_date || undefined,
        is_current: formData.is_current,
        location: formData.location || undefined,
        description: formData.description || undefined,
      });
      setFormData({
        company_name: '',
        job_title: '',
        start_date: '',
        end_date: '',
        is_current: false,
        location: '',
        description: '',
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
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
            <p className="text-xs text-slate-500">Employment history and career achievements</p>
          </div>
        </div>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            Add Position
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 sm:p-6 border border-indigo-100 bg-indigo-50/40 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Add New Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
              <Input
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.job_title}
                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <Input
                required
                placeholder="e.g. Stripe, Airbnb"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <Input
                placeholder="e.g. San Francisco, CA (Remote)"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
                I currently work in this role
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Impact & Responsibilities</label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              placeholder="Describe your technical contributions, architecture decisions, and business impact..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Position'}
            </Button>
          </div>
        </form>
      )}
      
      {experiences.length === 0 && !isAdding ? (
        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
          No work experience listed yet. Add your previous positions to showcase your career growth.
        </p>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-all flex justify-between items-start gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">{exp.job_title}</h3>
                <p className="text-indigo-600 font-semibold text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  {exp.company_name}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {exp.location}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
                {exp.skills_used && exp.skills_used.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.skills_used.map((skill, idx) => (
                      <Badge key={idx} variant="default" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDelete(exp.id)}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                aria-label="Delete experience"
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
