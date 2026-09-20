/**
 * PortfolioSection Component
 * 
 * Displays and manages candidate portfolio items.
 */

import React from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { PortfolioItem } from '@/types';

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  onAdd: (item: Partial<PortfolioItem>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PortfolioSection({ portfolioItems, onAdd, onUpdate, onDelete }: PortfolioSectionProps) {
  const projectTypeLabels: Record<string, string> = {
    personal: 'Personal',
    academic: 'Academic',
    professional: 'Professional',
    open_source: 'Open Source',
    freelance: 'Freelance',
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Portfolio</h2>
        <Button size="sm" onClick={() => onAdd({
          title: '',
          description: '',
          project_type: 'personal',
          media_urls: [],
          skills_demonstrated: [],
          is_featured: false,
          visibility: 'public',
          started_at: new Date().toISOString().split('T')[0],
        })}>
          Add Project
        </Button>
      </div>
      
      {portfolioItems.length === 0 ? (
        <p className="text-sm text-gray-500">No portfolio items added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                {item.is_featured && (
                  <Badge variant="success" size="small">Featured</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" size="small">
                  {projectTypeLabels[item.project_type] || item.project_type}
                </Badge>
                <Badge variant={item.visibility === 'public' ? 'success' : 'default'} size="small">
                  {item.visibility}
                </Badge>
              </div>
              {item.skills_demonstrated.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.skills_demonstrated.slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} variant="default" size="small">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Project
                  </a>
                )}
                {item.repository_url && (
                  <a 
                    href={item.repository_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Repository
                  </a>
                )}
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm ml-auto"
                  aria-label="Delete portfolio item"
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
