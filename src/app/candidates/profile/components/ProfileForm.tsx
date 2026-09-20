/**
 * ProfileForm Component
 * 
 * Main profile information form fields.
 */

'use client';

import React from 'react';
import { Input, Button } from '@/components/ui';
import { FileText, Upload, CheckCircle } from 'lucide-react';

interface ProfileFormData {
  headline?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  availability_status?: 'available' | 'employed' | 'open_to_work' | 'not_interested';
  visibility?: 'public' | 'connections' | 'private';
  resume_url?: string;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  onChange: (data: Partial<ProfileFormData>) => void;
  onResumeUpload: (file: File) => Promise<void>;
  uploadingResume: boolean;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function ProfileForm({
  formData,
  onChange,
  onResumeUpload,
  uploadingResume,
  onSave,
  saving,
}: ProfileFormProps) {
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onResumeUpload(file);
    }
  };

  return (
    <form className="bg-white rounded-lg shadow p-6 mb-6 space-y-5" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Basic Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
        <Input
          value={formData.headline || ''}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder="e.g. Senior Full-Stack Engineer | React & Node.js"
        />
        <p className="text-xs text-gray-500 mt-1">A short summary displayed on job applications and search.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Summary</label>
        <textarea
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.bio || ''}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Tell recruiters about your background, strengths, and what you're looking for..."
          rows={4}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <Input
            value={formData.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g. New York, NY / Remote"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.availability_status || 'open_to_work'}
            onChange={(e) => onChange({ availability_status: e.target.value as ProfileFormData['availability_status'] })}
          >
            <option value="available">Available Immediately</option>
            <option value="open_to_work">Open to Opportunities</option>
            <option value="employed">Employed (Passive)</option>
            <option value="not_interested">Not Looking</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.visibility || 'public'}
            onChange={(e) => onChange({ visibility: e.target.value as ProfileFormData['visibility'] })}
          >
            <option value="public">Public - Searchable by all employers</option>
            <option value="connections">Connections Only</option>
            <option value="private">Private - Only accessible via direct application</option>
          </select>
        </div>
      </div>
      
      <div className="pt-2 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Resume Attachment</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
          <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            {formData.resume_url ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-800">Resume Attached</span>
                <a
                  href={formData.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline ml-2"
                >
                  View current resume
                </a>
              </div>
            ) : (
              <p className="text-xs text-gray-500">PDF, DOC, or DOCX up to 10MB. Used for quick job applications.</p>
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {uploadingResume ? 'Uploading...' : formData.resume_url ? 'Replace Resume' : 'Upload Resume'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
