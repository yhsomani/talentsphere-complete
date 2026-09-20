/**
 * ProfileForm Component
 * 
 * Main profile information form fields.
 */

import React from 'react';
import { Input } from '@/components/ui';

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
    <form className="profile-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <Input
        label="Headline"
        value={formData.headline}
        onChange={(e) => onChange({ headline: e.target.value })}
        placeholder="e.g., Senior Software Engineer"
      />
      
      <textarea
        className="bio-textarea"
        value={formData.bio}
        onChange={(e) => onChange({ bio: e.target.value })}
        placeholder="Tell us about yourself..."
        rows={4}
      />
      
      <Input
        label="Location"
        value={formData.location}
        onChange={(e) => onChange({ location: e.target.value })}
        placeholder="e.g., San Francisco, CA"
      />
      
      <select
        value={formData.availability_status}
        onChange={(e) => onChange({ availability_status: e.target.value as ProfileFormData['availability_status'] })}
      >
        <option value="available">Available</option>
        <option value="open_to_work">Open to Work</option>
        <option value="employed">Employed</option>
        <option value="not_interested">Not Interested</option>
      </select>
      
      <select
        value={formData.visibility}
        onChange={(e) => onChange({ visibility: e.target.value as ProfileFormData['visibility'] })}
      >
        <option value="public">Public - Anyone can view</option>
        <option value="connections">Connections Only</option>
        <option value="private">Private - Only you can view</option>
      </select>
      
      <div className="resume-upload">
        <label>Resume</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleResumeUpload}
          disabled={uploadingResume}
        />
        {uploadingResume && <span>Uploading...</span>}
        {formData.resume_url && <a href={formData.resume_url} target="_blank" rel="noopener noreferrer">View Resume</a>}
      </div>
    </form>
  );
}
