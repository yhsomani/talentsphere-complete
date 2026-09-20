/**
 * ProfileHeader Component
 * 
 * Displays candidate avatar and handles avatar upload.
 */

import React from 'react';
import { Avatar } from '@/components/ui';

interface ProfileHeaderProps {
  avatarUrl?: string;
  onAvatarUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export function ProfileHeader({ avatarUrl, onAvatarUpload, uploading }: ProfileHeaderProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onAvatarUpload(file);
    }
  };

  return (
    <div className="profile-header">
      <Avatar src={avatarUrl} size="large" />
      <label className="avatar-upload-label">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        {uploading ? 'Uploading...' : 'Change Avatar'}
      </label>
    </div>
  );
}
