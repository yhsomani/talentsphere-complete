/**
 * CertificationsSection Component
 * 
 * Displays and manages candidate certifications with interactive add/delete.
 */

'use client';

import React, { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { Certification } from '@/types';
import { Plus, Trash2, Award, ExternalLink } from 'lucide-react';

interface CertificationsSectionProps {
  certifications: Certification[];
  onAdd: (cert: {
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date?: string;
    credential_id?: string;
    credential_url?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CertificationsSection({ certifications, onAdd, onDelete }: CertificationsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: '',
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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
    if (!formData.name || !formData.issuing_organization || !formData.issue_date) {
      return;
    }

    try {
      setSubmitting(true);
      await onAdd({
        name: formData.name,
        issuing_organization: formData.issuing_organization,
        issue_date: formData.issue_date,
        expiration_date: formData.expiration_date || undefined,
        credential_id: formData.credential_id || undefined,
        credential_url: formData.credential_url || undefined,
      });
      setFormData({
        name: '',
        issuing_organization: '',
        issue_date: '',
        expiration_date: '',
        credential_id: '',
        credential_url: '',
      });
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Certification
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-blue-100 bg-blue-50/50 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Add New Certification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Certification Name *</label>
              <Input
                required
                placeholder="e.g. AWS Certified Solutions Architect"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Issuing Organization *</label>
              <Input
                required
                placeholder="e.g. Amazon Web Services"
                value={formData.issuing_organization}
                onChange={(e) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Issue Date *</label>
              <Input
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiration Date (optional)</label>
              <Input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Credential ID (optional)</label>
              <Input
                placeholder="e.g. ABC-123456"
                value={formData.credential_id}
                onChange={(e) => setFormData(prev => ({ ...prev, credential_id: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Credential Verification URL (optional)</label>
              <Input
                placeholder="https://verify.example.com/..."
                value={formData.credential_url}
                onChange={(e) => setFormData(prev => ({ ...prev, credential_url: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Certification'}
            </Button>
          </div>
        </form>
      )}
      
      {certifications.length === 0 && !isAdding ? (
        <p className="text-sm text-gray-500">No certifications added yet.</p>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card key={cert.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600 text-sm">{cert.issuing_organization}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Issued: {formatDate(cert.issue_date)}
                    {cert.expiration_date && ` · Expires: ${formatDate(cert.expiration_date)}`}
                  </p>
                  {cert.credential_id && (
                    <p className="text-xs text-gray-500 mt-0.5">Credential ID: {cert.credential_id}</p>
                  )}
                  {cert.credential_url && (
                    <a 
                      href={cert.credential_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-blue-600 hover:underline mt-1"
                    >
                      Verify Credential <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => onDelete(cert.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label="Delete certification"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
