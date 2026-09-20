/**
 * ProfileHeader Component
 * 
 * Displays candidate cover banner, avatar, headline, status chips, and avatar upload.
 */

'use client';

import React, { useRef } from 'react';
import { Avatar, Badge, Button } from '@/components/ui';
import { Camera, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

interface ProfileHeaderProps {
  avatarUrl?: string;
  userName?: string;
  headline?: string;
  location?: string;
  availability?: string;
  onAvatarUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export function ProfileHeader({
  avatarUrl,
  userName = 'Candidate',
  headline = 'Software Engineer',
  location,
  availability = 'open_to_work',
  onAvatarUpload,
  uploading,
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onAvatarUpload(file);
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success" size="sm" dot>Available Immediately</Badge>;
      case 'open_to_work':
        return <Badge variant="info" size="sm" dot>Open to Opportunities</Badge>;
      case 'employed':
        return <Badge variant="secondary" size="sm" dot>Employed (Passive)</Badge>;
      default:
        return <Badge variant="default" size="sm">Not Looking</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs ring-1 ring-slate-900/[0.02] overflow-hidden mb-8">
      {/* Cover Banner with Subtle Gradient Mesh */}
      <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <Badge variant="info" size="sm" className="bg-white/15 text-white border-white/20 backdrop-blur-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
            Verified Career Profile
          </Badge>
        </div>
      </div>

      {/* Main Identity Area */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
          {/* Avatar with Camera Overlay */}
          <div className="relative inline-block">
            <div className="p-1 rounded-full bg-white shadow-md inline-block ring-4 ring-slate-100">
              <Avatar
                src={avatarUrl}
                alt={userName}
                fallback={userName.charAt(0).toUpperCase()}
                size="xl"
                verified
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white hover:bg-indigo-600 rounded-full shadow-md transition-colors border-2 border-white disabled:opacity-50"
              title="Change avatar photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Quick Actions / Status */}
          <div className="flex items-center gap-2.5">
            {getAvailabilityBadge(availability)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              isLoading={uploading}
              className="text-xs font-semibold"
            >
              Change Photo
            </Button>
          </div>
        </div>

        {/* Name and Professional Headline */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {userName}
            </h1>
            <span title="Verified Signals Candidate" className="text-emerald-500">
              <CheckCircle2 className="w-5 h-5 fill-emerald-50 text-emerald-600" />
            </span>
          </div>

          <p className="text-sm font-medium text-slate-700 mt-1 max-w-2xl leading-relaxed">
            {headline}
          </p>

          {location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
