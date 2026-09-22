/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Badge, LoadingSpinner } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase';
import {
  notificationService,
  NotificationRecord,
} from '@/services/notification.service';
import {
  Bell,
  CheckCheck,
  Check,
  Briefcase,
  Trophy,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Trash2,
  Filter,
  Archive,
  ArchiveRestore,
} from 'lucide-react';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'application' | 'job' | 'gamification' | 'system' | 'archived'>('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setCurrentUserId(user.id);
          const list = await notificationService.getNotifications(user.id, { includeArchived: true });
          if (list.length === 0) {
            // Seed a helpful onboarding notification in DB if empty
            await notificationService.createNotification({
              userId: user.id,
              type: 'system',
              title: 'Welcome to TalentSphere!',
              message: 'Your talent profile and verified skills dashboard are ready. Explore jobs and take skill challenges to earn XP.',
              linkUrl: '/dashboard',
              linkLabel: 'Go to Dashboard',
            });
            const refreshed = await notificationService.getNotifications(user.id, { includeArchived: true });
            setNotifications(refreshed);
          } else {
            setNotifications(list);
          }
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  // Supabase Realtime subscription for incoming lifecycle alerts (NOTIF-001)
  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`notifications-feed:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as NotificationRecord;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new as NotificationRecord;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotif.id ? { ...n, ...updatedNotif } : n))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setNotifications((prev) => prev.filter((n) => n.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const handleMarkAsRead = async (id: string) => {
    const success = await notificationService.markAsRead(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return;
    setMarkingAll(true);
    try {
      const success = await notificationService.markAllAsRead(currentUserId);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const handleArchive = async (id: string) => {
    const success = await notificationService.archiveNotification(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_archived: true } : n))
      );
    }
  };

  const handleUnarchive = async (id: string) => {
    const success = await notificationService.unarchiveNotification(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_archived: false } : n))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const success = await notificationService.deleteNotification(id);
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_update':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'challenge_result':
      case 'badge_earned':
      case 'level_up':
      case 'gamification':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'message_received':
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'job_recommendation':
      case 'job_match':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read && !n.is_archived).length;
  const archivedCount = notifications.filter((n) => Boolean(n.is_archived)).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'archived') return Boolean(n.is_archived);
    if (n.is_archived) return false;
    if (filter === 'unread') return !n.is_read;
    if (filter === 'application') return n.type.includes('application');
    if (filter === 'job') return n.type.includes('job');
    if (filter === 'gamification') return n.type.includes('challenge') || n.type.includes('badge') || n.type.includes('level');
    if (filter === 'system') return n.type.includes('system');
    return true;
  });

  return (
    <DashboardLayout userRole="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="info" size="sm">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Stay updated on application progress, new job matches, and skill rewards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markingAll}
              isLoading={markingAll}
              className="gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-gray-500" />
              <span>Mark all as read</span>
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                Preferences
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200">
          <Filter className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'application', label: 'Applications' },
            { id: 'job', label: 'Job Matches' },
            { id: 'gamification', label: 'Achievements & XP' },
            { id: 'system', label: 'System' },
            { id: 'archived', label: `Archived (${archivedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-xs">Loading notification feed...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800 text-base">No notifications</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {filter === 'unread'
                  ? "You've read all your notifications! Great job staying organized."
                  : filter === 'archived'
                  ? 'No archived notifications yet.'
                  : 'You have no notifications in this category right now.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  n.is_read ? 'bg-white hover:bg-gray-50/70' : 'bg-blue-50/40 hover:bg-blue-50/60'
                }`}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gray-100/80 flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-200">
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <span>{n.title}</span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      )}
                      {n.is_archived && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                          Archived
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>

                  {/* Actions & Links */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {n.link_url && (
                      <Link
                        href={n.link_url}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        onClick={() => {
                          if (!n.is_read) handleMarkAsRead(n.id);
                        }}
                      >
                        <span>{n.link_label || 'View details'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as read</span>
                      </button>
                    )}

                    {n.is_archived ? (
                      <button
                        onClick={() => handleUnarchive(n.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                        title="Unarchive notification"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        <span>Unarchive</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(n.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 font-medium transition-colors"
                        title="Archive notification"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors ml-auto p-1"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
