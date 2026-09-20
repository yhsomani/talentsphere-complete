import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
  
  // 1. Fetch user level & XP from user_levels
  const { data: userLevel } = await supabase
    .from('user_levels')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const xpPoints = userLevel?.total_xp_earned || 0;
  const level = userLevel?.current_level || 1;
  const currentXp = userLevel?.current_xp || 0;
  const xpToNextLevel = userLevel?.xp_to_next_level || 500;
  const progressToNext = userLevel?.level_progress !== undefined 
    ? Number(userLevel.level_progress) 
    : Math.min(100, (currentXp / xpToNextLevel) * 100);

  // 2. Fetch role-specific data & real metrics
  let profileData = null;
  let candidateStats = { applications: 0, interviews: 0, skills: 0 };
  let recruiterStats = { jobsPosted: 0, totalCandidates: 0, inReview: 0 };

  if (userRole === 'candidate') {
    const { data: candidateProf } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    profileData = candidateProf;

    if (candidateProf?.id) {
      const [appsRes, interviewsRes, skillsRes] = await Promise.all([
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('candidate_profile_id', candidateProf.id),
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('candidate_profile_id', candidateProf.id)
          .in('status', ['interview_scheduled', 'interviewed']),
        supabase
          .from('candidate_skills')
          .select('id', { count: 'exact', head: true })
          .eq('candidate_profile_id', candidateProf.id),
      ]);

      candidateStats = {
        applications: appsRes.count || 0,
        interviews: interviewsRes.count || 0,
        skills: skillsRes.count || 0,
      };
    }
  } else if (userRole === 'recruiter' || userRole === 'hiring_manager') {
    // Get employer jobs
    const { data: employerJobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('employer_id', user.id);

    const jobIds = (employerJobs || []).map(j => j.id);

    let totalApplicants = 0;
    let inReviewApplicants = 0;

    if (jobIds.length > 0) {
      const [totalRes, inReviewRes] = await Promise.all([
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds),
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .in('status', ['submitted', 'under_review', 'screening']),
      ]);
      totalApplicants = totalRes.count || 0;
      inReviewApplicants = inReviewRes.count || 0;
    }

    recruiterStats = {
      jobsPosted: employerJobs?.length || 0,
      totalCandidates: totalApplicants,
      inReview: inReviewApplicants,
    };
  }

  return (
    <DashboardLayout
      userRole={userRole}
      userName={fullName}
      userAvatar={avatarUrl}
      notificationCount={0}
      userXp={xpPoints}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {fullName}! Here&apos;s what&apos;s happening today.
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
                <span>{currentXp} XP</span>
                <span>{xpToNextLevel} XP</span>
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
                  <span className="text-2xl font-bold text-gray-900">{candidateStats.applications}</span>
                </div>
                <p className="text-xs text-gray-500">Track your job applications</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Interviews</span>
                  <span className="text-2xl font-bold text-gray-900">{candidateStats.interviews}</span>
                </div>
                <p className="text-xs text-gray-500">Upcoming interviews</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Skills Verified</span>
                  <span className="text-2xl font-bold text-gray-900">{candidateStats.skills}</span>
                </div>
                <p className="text-xs text-gray-500">Verified skills</p>
              </div>
            </>
          )}

          {/* Jobs Posted Card (for recruiters) */}
          {(userRole === 'recruiter' || userRole === 'hiring_manager') && (
            <>
              <Link href="/jobs" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Jobs Posted</span>
                  <span className="text-2xl font-bold text-gray-900">{recruiterStats.jobsPosted}</span>
                </div>
                <p className="text-xs text-gray-500">Active job listings</p>
              </Link>
              
              <Link href="/applications" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Candidates</span>
                  <span className="text-2xl font-bold text-gray-900">{recruiterStats.totalCandidates}</span>
                </div>
                <p className="text-xs text-indigo-600 font-medium">Review talent pool →</p>
              </Link>
              
              <Link href="/applications" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">In Review</span>
                  <span className="text-2xl font-bold text-gray-900">{recruiterStats.inReview}</span>
                </div>
                <p className="text-xs text-amber-600 font-medium">Applications to review →</p>
              </Link>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRole === 'candidate' ? (
              <>
                <Link
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
                </Link>
                
                <Link
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
                </Link>

                <Link
                  href="/applications"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Applications</p>
                    <p className="text-sm text-gray-500">Track interview progress</p>
                  </div>
                </Link>
                
                <Link
                  href="/challenges"
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
                </Link>
              </>
            ) : (
              <>
                <Link
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
                </Link>

                <Link
                  href="/applications"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review Applications</p>
                    <p className="text-sm text-gray-500">Pipeline & candidates</p>
                  </div>
                </Link>
                
                <Link
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
                </Link>
                
                <Link
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
                </Link>
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
                <Link
                  href="/candidates/profile"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Complete Profile →
                </Link>
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
                <Link
                  href="/candidates/profile"
                  className="inline-block mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Complete Profile →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
