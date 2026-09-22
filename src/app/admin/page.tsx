'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import {
  Users,
  Briefcase,
  FileText,
  Code2,
  Activity,
  Server,
  Cpu,
  Clock,
  RotateCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface SystemHealthInfo {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      latencyMs: number;
      error?: string;
    };
    application: {
      status: string;
      responseTimeMs: number;
      memoryUsage: {
        heapUsedMb: number;
        heapTotalMb: number;
      };
    };
  };
}

interface AdminMetrics {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalAdmins: number;
  totalHiringManagers: number;
  totalJobs: number;
  activeJobs: number;
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
  const [health, setHealth] = useState<SystemHealthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchMetricsAndHealth = useCallback(async () => {
    try {
      setError(null);
      const supabase = createBrowserClient();

      // 1. Fetch live system health from /api/health
      try {
        const healthRes = await fetch('/api/health', { cache: 'no-store' });
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealth(healthData);
        }
      } catch (healthErr) {
        console.warn('System health probe ping warning:', healthErr);
      }

      // 2. Fetch platform telemetry counts safely
      const [
        { count: totalUserCount },
        { count: candidateCount },
        { count: recruiterCount },
        { count: adminCount },
        { count: hiringManagerCount },
        { count: totalJobs },
        { count: activeJobs },
        { count: totalApplications },
        { count: totalCourses },
        { count: totalChallenges },
        { data: recentUsers, error: usersErr },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'candidate'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'recruiter'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'hiring_manager'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('challenges').select('*', { count: 'exact', head: true }),
        supabase
          .from('users')
          .select('id, email, full_name, role, created_at')
          .order('created_at', { ascending: false })
          .limit(25),
      ]);

      if (usersErr) throw usersErr;

      setMetrics({
        totalUsers: totalUserCount || 0,
        totalCandidates: candidateCount || 0,
        totalRecruiters: recruiterCount || 0,
        totalAdmins: adminCount || 0,
        totalHiringManagers: hiringManagerCount || 0,
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        totalApplications: totalApplications || 0,
        totalCourses: totalCourses || 0,
        totalChallenges: totalChallenges || 0,
        recentRegistrations: recentUsers || [],
      });
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch platform metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetricsAndHealth();
  }, [fetchMetricsAndHealth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetricsAndHealth();
  };

  const recentRegistrations = metrics?.recentRegistrations;
  const filteredUsers = useMemo(() => {
    if (!recentRegistrations) return [];
    return recentRegistrations.filter((user) => {
      const matchesSearch =
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [recentRegistrations, searchQuery, roleFilter]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <RotateCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Aggregating platform governance telemetry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Platform Admin Console</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Governance
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Real-time platform telemetry, cluster health probes, and user accounts management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/api/health"
              target="_blank"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-850 flex items-center gap-1.5 transition-colors"
              title="Open raw JSON health probe"
            >
              <span>Probe API</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs font-semibold px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* System Health Diagnostics Card (OPS-006 & DASH-006) */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">System Diagnostics & Health Telemetry</h2>
                <p className="text-xs text-slate-400">Automated health probe pinging database and runtime container</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                health?.status === 'healthy'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {health?.status === 'healthy' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span className="capitalize">{health?.status || 'Active'}</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">v{health?.version || '3.0.0'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            {/* DB Latency */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>PostgreSQL Ping</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">
                {health?.services.database.latencyMs !== undefined ? `${health.services.database.latencyMs} ms` : '—'}
              </p>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                ● Live Supabase Adapter
              </span>
            </div>

            {/* Heap Memory */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Node.js Memory Heap</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">
                {health?.services.application.memoryUsage.heapUsedMb ?? 0} MB
              </p>
              <span className="text-[11px] text-slate-400">
                of {health?.services.application.memoryUsage.heapTotalMb ?? 0} MB allocated
              </span>
            </div>

            {/* Uptime */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>System Uptime</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">
                {health?.uptimeSeconds ? formatUptime(health.uptimeSeconds) : '—'}
              </p>
              <span className="text-[11px] text-slate-400">Continuous execution</span>
            </div>

            {/* HTTP Response Time */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Probe Latency</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">
                {health?.services.application.responseTimeMs !== undefined ? `${health.services.application.responseTimeMs} ms` : '—'}
              </p>
              <span className="text-[11px] text-slate-400">Next.js Edge route</span>
            </div>
          </div>
        </section>

        {/* Platform Volume Metric Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Users */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics?.totalUsers}</div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>{metrics?.totalCandidates} candidates</span>
              <span>{metrics?.totalRecruiters} recruiters</span>
            </div>
          </div>

          {/* Card 2: Jobs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Requisitions</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics?.totalJobs}</div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">{metrics?.activeJobs} active</span>
              <span>{(metrics?.totalJobs || 0) - (metrics?.activeJobs || 0)} draft/closed</span>
            </div>
          </div>

          {/* Card 3: Applications */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Applications</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics?.totalApplications}</div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>Candidate funnel throughput</span>
            </div>
          </div>

          {/* Card 4: Learning & Arena */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Content Catalog</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {(metrics?.totalCourses || 0) + (metrics?.totalChallenges || 0)}
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>{metrics?.totalCourses} courses</span>
              <span>{metrics?.totalChallenges} challenges</span>
            </div>
          </div>
        </section>

        {/* User Accounts Management & Recent Registrations Table */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">User Registry & Recent Registrations</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit registered candidate profiles, recruiter identities, and administrative permissions
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-60"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="candidate">Candidates</option>
                <option value="recruiter">Recruiters</option>
                <option value="hiring_manager">Hiring Managers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Registered Date</th>
                  <th className="px-6 py-3.5 text-right">Account ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                      No user registrations found matching query criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{user.full_name || 'Anonymous User'}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          user.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : user.role === 'recruiter'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : user.role === 'hiring_manager'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                          {user.role === 'recruiter' && <Building2 className="w-3 h-3" />}
                          {user.role === 'candidate' && <UserCheck className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {new Date(user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-[11px] text-slate-500">
                        {user.id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-slate-500 text-[11px] flex items-center justify-between">
            <span>
              Showing {filteredUsers.length} of {metrics?.recentRegistrations.length || 0} recent accounts
            </span>
            <span>Talentsphere Core Security & RBAC Active</span>
          </div>
        </section>
      </main>
    </div>
  );
}
