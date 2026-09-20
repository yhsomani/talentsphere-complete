import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  
  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/signin');
  }
  
  // Get user role from metadata (set during signup)
  const userRole = user.user_metadata?.role || 'candidate';
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;
  
  // Fetch user profile data based on role
  let profileData = null;
  
  if (userRole === 'candidate') {
    const { data } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    profileData = data;
  } else if (userRole === 'recruiter' || userRole === 'hiring_manager') {
    const { data } = await supabase
      .from('recruiter_profiles')
      .select('*, organizations(*)')
      .eq('user_id', user.id)
      .single();
    profileData = data;
  }
  
  // Calculate XP progress
  const xpPoints = profileData?.xp_points || 0;
  const level = profileData?.level || 1;
  const nextLevelXp = Math.floor(500 * Math.pow(1.5, level - 1));
  const prevLevelXp = Math.floor(500 * Math.pow(1.5, level - 2)) || 0;
  const progressToNext = ((xpPoints - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;
  
  return (
    <DashboardLayout
      userRole={userRole}
      userName={fullName}
      userAvatar={avatarUrl}
      notificationCount={0}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {fullName}! Here's what's happening today.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Level Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Level</span>
              <span className="text-2xl font-bold text-blue-600">{level}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{prevLevelXp} XP</span>
                <span>{nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{xpPoints.toLocaleString()} XP total</p>
            </div>
          </div>

          {/* Applications Card (for candidates) */}
          {userRole === 'candidate' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Applications</span>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <p className="text-xs text-gray-500">Track your job applications</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Interviews</span>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <p className="text-xs text-gray-500">Upcoming interviews</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Skills Verified</span>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <p className="text-xs text-gray-500">Verified skills</p>
              </div>
            </>
          )}

          {/* Jobs Posted Card (for recruiters) */}
          {(userRole === 'recruiter' || userRole === 'hiring_manager') && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Jobs Posted</span>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <p className="text-xs text-gray-500">Active job listings</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Candidates</span>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <p className="text-xs text-gray-500">Total applicants</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">In Review</span>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <p className="text-xs text-gray-500">Applications to review</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRole === 'candidate' ? (
              <>
                <a
                  href="/candidates/profile"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Complete Profile</p>
                    <p className="text-sm text-gray-500">Add your skills & experience</p>
                  </div>
                </a>
                
                <a
                  href="/jobs"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Browse Jobs</p>
                    <p className="text-sm text-gray-500">Find your dream role</p>
                  </div>
                </a>
                
                <a
                  href="/assessments"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Code Arena</p>
                    <p className="text-sm text-gray-500">Prove your skills</p>
                  </div>
                </a>
              </>
            ) : (
              <>
                <a
                  href="/jobs/post"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Post a Job</p>
                    <p className="text-sm text-gray-500">Create new listing</p>
                  </div>
                </a>
                
                <a
                  href="/candidates"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Find Candidates</p>
                    <p className="text-sm text-gray-500">Browse talent pool</p>
                  </div>
                </a>
                
                <a
                  href="/company"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Company Profile</p>
                    <p className="text-sm text-gray-500">Manage your page</p>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Profile Completion Reminder (for candidates without profile) */}
        {userRole === 'candidate' && !profileData && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">Complete Your Profile</h3>
                <p className="text-blue-700 mt-1">
                  Profiles with complete information receive 5x more interview requests. Add your skills, experience, and upload your resume to get started.
                </p>
                <a
                  href="/candidates/profile"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Complete Profile →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2">No recent activity</p>
            <p className="text-sm">Your activity will appear here as you use TalentSphere</p>
          </div>
        </div>

        {/* Profile Completion Reminder (for candidates without complete profile) */}
        {userRole === 'candidate' && (!profileData?.headline || !profileData?.location) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-800">Complete Your Profile</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Add your headline, location, and skills to increase your visibility to employers by 10x.
                </p>
                <a
                  href="/candidates/profile"
                  className="inline-block mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Complete Profile →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
