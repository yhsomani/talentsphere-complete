/**
 * PortfolioSection Component
 * 
 * Displays and manages candidate portfolio items with interactive add/delete.
 */

'use client';

import React, { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { PortfolioItem } from '@/types';
import { Plus, Trash2, FolderGit2, ExternalLink, Code2, Globe } from 'lucide-react';

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  onAdd: (item: {
    title: string;
    description?: string;
    url?: string;
    repository_url?: string;
    started_at?: string;
    completed_at?: string;
  }) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PortfolioSection({ portfolioItems, onAdd, onDelete }: PortfolioSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    repository_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      setSubmitting(true);
      await onAdd({
        title: formData.title,
        description: formData.description || undefined,
        url: formData.url || undefined,
        repository_url: formData.repository_url || undefined,
      });
      setFormData({
        title: '',
        description: '',
        url: '',
        repository_url: '',
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
            <FolderGit2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured Projects & Portfolio</h2>
            <p className="text-xs text-slate-500">Open-source contributions, web applications, and repositories</p>
          </div>
        </div>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 sm:p-6 border border-indigo-100 bg-indigo-50/40 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Add New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
              <Input
                required
                placeholder="e.g. Distributed Task Queue, AI Code Reviewer"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Live Application URL</label>
              <Input
                placeholder="https://myproject.app"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Repository / Source URL</label>
              <Input
                placeholder="https://github.com/username/project"
                value={formData.repository_url}
                onChange={(e) => setFormData(prev => ({ ...prev, repository_url: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Overview & Architecture</label>
              <textarea
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Describe key design patterns, technical challenges overcome, and scale metrics..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </form>
      )}

      {portfolioItems.length === 0 && !isAdding ? (
        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
          No portfolio projects featured yet. Add your flagship projects to stand out to hiring managers.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    aria-label="Delete project"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 text-xs">
                {item.url && (
                  <a
                    href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Live Demo
                  </a>
                )}
                {item.repository_url && (
                  <a
                    href={item.repository_url.startsWith('http') ? item.repository_url : `https://${item.repository_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    Source Code
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
