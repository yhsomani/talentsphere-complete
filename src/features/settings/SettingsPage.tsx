'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Input, Card, Badge, LoadingSpinner } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase';
import {
  notificationService,
  NotificationPreferencesRecord,
} from '@/services/notification.service';
import {
  candidateService,
} from '@/services/candidate.service';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Shield,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User & Profile State
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [availability, setAvailability] = useState<'available' | 'employed' | 'open_to_work' | 'not_interested'>('open_to_work');

  // Notification Preferences State
  const [prefs, setPrefs] = useState<NotificationPreferencesRecord>({
    user_id: '',
    email_enabled: true,
    push_enabled: false,
    in_app_enabled: true,
    application_updates: true,
    job_alerts: true,
    messages: true,
    system_announcements: true,
    gamification_updates: true,
    marketing_emails: false,
  });

  // Password reset state
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          setEmail(user.email || '');

          // Load profile info
          const profileData = await candidateService.getProfile(user.id);
          if (profileData.profile) {
            setHeadline(profileData.profile.headline || '');
            setAvailability(profileData.profile.availability_status || 'open_to_work');
          }

          // Fetch user row for full_name
          const { data: userRow } = await (supabase as any)
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();

          if (userRow?.full_name) {
            const [first = '', ...rest] = userRow.full_name.split(' ');
            setFirstName(first);
            setLastName(rest.join(' '));
          }

          // Load notification preferences
          const notifPrefs = await notificationService.getPreferences(user.id);
          setPrefs(notifPrefs);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setMessage(null);
    try {
      const supabase = createBrowserClient();
      // Update users table
      await (supabase as any)
        .from('users')
        .update({
          full_name: `${firstName} ${lastName}`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Update candidate_profiles table
      await candidateService.upsertProfile(userId, {
        headline,
        availability_status: availability,
        visibility: 'public',
      });

      setMessage({ type: 'success', text: 'Account settings updated successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreference = async (key: keyof NotificationPreferencesRecord, val: boolean) => {
    if (!userId) return;
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    await notificationService.updatePreferences(userId, { [key]: val });
  };

  const handleSendPasswordReset = async () => {
    if (!email) return;
    try {
      const supabase = createBrowserClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setResetSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout userRole="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account preferences, notifications, and security.
          </p>
        </div>

        {/* Success/Error Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'profile', label: 'Account & Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security & Access', icon: Lock },
            { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMessage(null);
                  setActiveTab(tab.id as any);
                }}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  isCurrent
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
            <LoadingSpinner size="lg" />
            <p className="mt-3 text-sm">Loading your settings...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Jane"
                    />
                    <Input
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Email Address"
                        value={email}
                        disabled
                        className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        helperText="Email is bound to your authentication identity."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Professional Headline"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Full-Stack Engineer | React & Node.js"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability Status
                      </label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="available">Available Immediately</option>
                        <option value="open_to_work">Open to Opportunities</option>
                        <option value="employed">Employed (Passive)</option>
                        <option value="not_interested">Not Interested in Offers</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" variant="primary" isLoading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </Card>
              </form>
            )}

            {/* Tab 2: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Notification Channels</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Choose how and where you want to receive communication.
                  </p>

                  <div className="divide-y divide-gray-100">
                    <div className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">Email Notifications</h4>
                        <p className="text-xs text-gray-500">Receive summaries and updates via your registered email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs.email_enabled}
                        onChange={(e) => handleUpdatePreference('email_enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">In-App Notifications</h4>
                        <p className="text-xs text-gray-500">Receive bell alerts in the top bar and notification center</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs.in_app_enabled}
                        onChange={(e) => handleUpdatePreference('in_app_enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">Browser Push Alerts</h4>
                        <p className="text-xs text-gray-500">Get desktop popups for direct messages and hiring decisions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs.push_enabled}
                        onChange={(e) => handleUpdatePreference('push_enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Topics & Events</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Select the specific alerts you want to subscribe to.
                  </p>

                  <div className="divide-y divide-gray-100">
                    {[
                      { key: 'application_updates', title: 'Application Updates', desc: 'When your application moves to a new stage or an interview is scheduled' },
                      { key: 'job_alerts', title: 'Job Matches', desc: 'When new requisitions match your skills and location preferences' },
                      { key: 'messages', title: 'Direct Messages', desc: 'When a recruiter or candidate messages you in chat' },
                      { key: 'gamification_updates', title: 'Achievements & XP', desc: 'When you earn XP, unlock a badge, or rank on the leaderboard' },
                      { key: 'system_announcements', title: 'System Updates', desc: 'Platform announcements and maintenance notices' },
                    ].map((topic) => (
                      <div key={topic.key} className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">{topic.title}</h4>
                          <p className="text-xs text-gray-500">{topic.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={(prefs as any)[topic.key] ?? true}
                          onChange={(e) => handleUpdatePreference(topic.key as any, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 3: Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Password & Authentication</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Change your password or request a secure login link.
                      </p>

                      <div className="mt-4">
                        {resetSent ? (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Password reset instructions sent to <strong>{email}</strong>. Check your inbox.</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendPasswordReset}
                            className="gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Send Password Reset Email</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Active Session</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    You are currently logged into TalentSphere on this device.
                  </p>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Current Web Session</p>
                        <p className="text-xs text-gray-400">Authenticated via Supabase JWT</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 4: Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">TalentSphere Candidate Free</h3>
                        <Badge variant="info" size="sm">Active Plan</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Unlimited job applications, verified skill credentials, and access to the Code Arena.
                      </p>
                    </div>

                    <Link href="/settings/billing">
                      <Button variant="primary" size="sm" className="gap-2">
                        <span>Manage Subscription</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>

                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold">Upgrade to TalentSphere Pro</h4>
                    <p className="text-xs text-blue-100 mt-1 max-w-md">
                      Get AI resume analysis, priority applicant placement, unlimited mock technical interviews, and exclusive verified badges.
                    </p>
                  </div>
                  <Link href="/settings/billing">
                    <Button variant="secondary" size="sm" className="bg-white text-blue-700 hover:bg-blue-50 font-bold whitespace-nowrap">
                      View Pro Plans
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
