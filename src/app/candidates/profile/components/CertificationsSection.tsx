/**
 * CertificationsSection Component
 * 
 * Displays and manages candidate certifications.
 */

import React from 'react';
import { Button, Card } from '@/components/ui';
import { Certification } from '@/types';

interface CertificationsSectionProps {
  certifications: Certification[];
  onAdd: (cert: Partial<Certification>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CertificationsSection({ certifications, onAdd, onDelete }: CertificationsSectionProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
        <Button size="sm" onClick={() => onAdd({
          name: '',
          issuing_organization: '',
          issue_date: new Date().toISOString().split('T')[0],
          skills: []
        })}>
          Add Certification
        </Button>
      </div>
      
      {certifications.length === 0 ? (
        <p className="text-sm text-gray-500">No certifications added yet.</p>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card key={cert.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600">{cert.issuing_organization}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Issued: {formatDate(cert.issue_date)}
                    {cert.expiration_date && ` - Expires: ${formatDate(cert.expiration_date)}`}
                  </p>
                  {cert.credential_id && (
                    <p className="text-sm text-gray-500">Credential ID: {cert.credential_id}</p>
                  )}
                  {cert.credential_url && (
                    <a 
                      href={cert.credential_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View Credential
                    </a>
                  )}
                </div>
                <button
                  onClick={() => onDelete(cert.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  aria-label="Delete certification"
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
