/**
 * Network Settings Page - User Blocking Management
 * 
 * Implements NET-005: User Blocking Mechanism
 * Allows users to view and manage their blocked users list
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Avatar, Badge, EmptyState, Modal, TextField } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getNetworkService, type BlockedUserRecord } from '@/services/network.service';
import { createBrowserClient } from '@/lib/supabase';
import { Shield, UserX, Trash2, PlusCircle, AlertTriangle, Info } from 'lucide-react';

export default function NetworkSettingsPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockUserId, setBlockUserId] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'candidate' | 'recruiter'>('candidate');

  const networkService = getNetworkService();

  useEffect(() => {
    fetchBlockedUsers();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data?.role === 'recruiter' || data?.role === 'hiring_manager') {
          setUserRole('recruiter');
        }
      }
    } catch (err) {
      console.error('Error checking user role:', err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await networkService.getBlockedUsers();
      setBlockedUsers(users);
    } catch (err) {
      console.error('Failed to fetch blocked users:', err);
      setError('Failed to load blocked users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!blockUserId.trim()) {
      setError('Please enter a user ID or email to block');
      return;
    }

    try {
      setError(null);
      await networkService.blockUser({
        blockedUserId: blockUserId.trim(),
        reason: blockReason.trim() || undefined,
      });
      
      setSuccess('User has been blocked successfully');
      setShowBlockModal(false);
      setBlockUserId('');
      setBlockReason('');
      await fetchBlockedUsers();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to block user:', err);
      setError(err.message || 'Failed to block user. Please check the user ID and try again.');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      setUnblockingId(userId);
      setError(null);
      await networkService.unblockUser(userId);
      
      setSuccess('User has been unblocked');
      await fetchBlockedUsers();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to unblock user:', err);
      setError(err.message || 'Failed to unblock user');
    } finally {
      setUnblockingId(null);
    }
  };

  const openBlockModal = () => {
    setShowBlockModal(true);
    setError(null);
    setSuccess(null);
  };

  const closeBlockModal = () => {
    setShowBlockModal(false);
    setBlockUserId('');
    setBlockReason('');
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Network & Privacy Settings</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage who can interact with you on the platform
                </p>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              onClick={openBlockModal}
              className="gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Block User</span>
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">What does blocking do?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Blocked users cannot send you messages</li>
              <li>Blocked users cannot see your profile details</li>
              <li>Blocked users cannot interact with your content</li>
              <li>You won't receive notifications from blocked users</li>
            </ul>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <p className="text-sm font-medium text-rose-800">{error}</p>
          </div>
        )}

        {/* Blocked Users List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Blocked Users
              {blockedUsers.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {blockedUsers.length}
                </Badge>
              )}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Users you have blocked will not be able to interact with you
            </p>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                icon={Shield}
                title="No Blocked Users"
                description="You haven't blocked any users yet. Use the button above to block users who violate community guidelines."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {blockedUsers.map((blocked) => (
                <div
                  key={blocked.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={blocked.blocked_user?.avatar_url || undefined}
                      alt={blocked.blocked_user?.full_name || 'User'}
                      fallback={
                        blocked.blocked_user?.full_name?.charAt(0) || 
                        blocked.blocked_user?.email?.charAt(0).toUpperCase() || 
                        'U'
                      }
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {blocked.blocked_user?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {blocked.blocked_user?.email}
                      </p>
                      {blocked.reason && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Reason: {blocked.reason}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Blocked {new Date(blocked.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblockUser(blocked.blocked_id)}
                    disabled={unblockingId === blocked.blocked_id}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-2"
                  >
                    {unblockingId === blocked.blocked_id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Unblock</span>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block User Modal */}
      {showBlockModal && (
        <Modal
          isOpen={showBlockModal}
          onClose={closeBlockModal}
          title="Block User"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> Blocking a user will prevent them from contacting you or viewing your profile. This action can be undone later.
                </span>
              </p>
            </div>

            <TextField
              label="User ID or Email"
              placeholder="Enter user ID or email address"
              value={blockUserId}
              onChange={(e) => setBlockUserId(e.target.value)}
              required
            />

            <TextField
              label="Reason (Optional)"
              placeholder="Why are you blocking this user?"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              multiline
              rows={3}
            />

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" onClick={closeBlockModal}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleBlockUser}
                disabled={!blockUserId.trim()}
              >
                Block User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
