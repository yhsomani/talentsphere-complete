'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface AdminMetrics {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalJobs: number;
  totalApplications: number;
  totalCourses: number;
  totalChallenges: number;
  recentRegistrations: Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const supabase = createBrowserClient();
        
        // Fetch user counts by role
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('role, count');
        
        if (usersError) throw usersError;

        const roleCounts = usersData?.reduce((acc, item) => {
          acc[item.role] = (acc[item.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Fetch total users
        const { count: totalUserCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Fetch job counts
        const { count: totalJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });

        // Fetch application counts
        const { count: totalApplications } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true });

        // Fetch course counts
        const { count: totalCourses } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });

        // Fetch challenge counts
        const { count: totalChallenges } = await supabase
          .from('challenges')
          .select('*', { count: 'exact', head: true });

        // Fetch recent registrations
        const { data: recentUsers } = await supabase
          .from('users')
          .select('id, email, full_name, role, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        setMetrics({
          totalUsers: totalUserCount || 0,
          totalCandidates: roleCounts['candidate'] || 0,
          totalRecruiters: roleCounts['recruiter'] || 0,
          totalJobs: totalJobs || 0,
          totalApplications: totalApplications || 0,
          totalCourses: totalCourses || 0,
          totalChallenges: totalChallenges || 0,
          recentRegistrations: recentUsers || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Platform overview and system metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">{metrics?.totalUsers}</dd>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Candidates</dt>
            <dd className="mt-2 text-3xl font-semibold text-blue-600">{metrics?.totalCandidates}</dd>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Recruiters</dt>
            <dd className="mt-2 text-3xl font-semibold text-green-600">{metrics?.totalRecruiters}</dd>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">{metrics?.totalJobs}</dd>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Applications</dt>
            <dd className="mt-2 text-3xl font-semibold text-purple-600">{metrics?.totalApplications}</dd>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Courses</dt>
            <dd className="mt-2 text-3xl font-semibold text-orange-600">{metrics?.totalCourses}</dd>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Challenges</dt>
            <dd className="mt-2 text-3xl font-semibold text-red-600">{metrics?.totalChallenges}</dd>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics?.recentRegistrations.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.full_name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'recruiter' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
