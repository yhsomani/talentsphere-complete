'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Badge, Avatar, LoadingSpinner } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase';
import {
  leaderboardService,
  LeaderboardRankItem,
} from '@/services/leaderboard.service';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export function LeaderboardPage() {
  const [period, setPeriod] = useState<'all_time' | 'monthly' | 'weekly'>('all_time');
  const [rankings, setRankings] = useState<LeaderboardRankItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id;

        const data = await leaderboardService.getLeaderboard(period, uid);
        setRankings(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [period]);

  const topThree = rankings.slice(0, 3);
  const myRank = rankings.find((r) => r.isCurrentUser);

  return (
    <DashboardLayout userRole="candidate">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 transform skew-x-12 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-xs">
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              <span>TalentSphere Arena Rankings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Global Skill Leaderboard
            </h1>
            <p className="mt-2 text-amber-100 text-sm sm:text-base leading-relaxed">
              Earn XP and unlock badges by solving coding challenges, finishing certified courses, and demonstrating verified competencies.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link href="/challenges">
                <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-amber-50 gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Solve Challenges</span>
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10 gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Explore Courses</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'all_time', label: 'All Time' },
              { id: 'monthly', label: 'This Month' },
              { id: 'weekly', label: 'This Week' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  period === tab.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {myRank && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>Your Rank: <strong className="text-amber-900 font-bold">#{myRank.rank}</strong> ({myRank.xpPoints} XP)</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <LoadingSpinner size="lg" />
            <p className="mt-3 text-sm">Loading rankings...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            {topThree.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
                {/* 2nd Place */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center relative order-2 md:order-1 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm mb-3 border-2 border-gray-300">
                    2
                  </div>
                  <Avatar
                    alt={topThree[1].name}
                    fallback={topThree[1].name.substring(0, 2).toUpperCase()}
                    size="lg"
                    className="ring-4 ring-gray-200 mb-3"
                  />
                  <h3 className="font-bold text-gray-900 text-base">{topThree[1].name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{topThree[1].headline}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full flex items-center justify-between text-xs">
                    <span className="text-gray-500">Level {topThree[1].level}</span>
                    <Badge variant="warning" size="sm" className="font-bold">
                      {topThree[1].xpPoints} XP
                    </Badge>
                  </div>
                </div>

                {/* 1st Place (Champion) */}
                <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-8 border-2 border-amber-400 shadow-md text-center relative order-1 md:order-2 transform md:-translate-y-4 flex flex-col items-center">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <Avatar
                    alt={topThree[0].name}
                    fallback={topThree[0].name.substring(0, 2).toUpperCase()}
                    size="xl"
                    className="ring-4 ring-amber-300 mb-3 mt-2"
                  />
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
                    Rank #1 Champion
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-lg">{topThree[0].name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{topThree[0].headline}</p>
                  <div className="mt-5 pt-4 border-t border-amber-200 w-full flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">Level {topThree[0].level}</span>
                    <Badge variant="warning" size="sm" className="bg-amber-500 text-white font-extrabold px-3 py-1">
                      {topThree[0].xpPoints} XP
                    </Badge>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center relative order-3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-3 border-2 border-amber-300">
                    3
                  </div>
                  <Avatar
                    alt={topThree[2].name}
                    fallback={topThree[2].name.substring(0, 2).toUpperCase()}
                    size="lg"
                    className="ring-4 ring-amber-100 mb-3"
                  />
                  <h3 className="font-bold text-gray-900 text-base">{topThree[2].name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{topThree[2].headline}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full flex items-center justify-between text-xs">
                    <span className="text-gray-500">Level {topThree[2].level}</span>
                    <Badge variant="warning" size="sm" className="font-bold">
                      {topThree[2].xpPoints} XP
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Rankings Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">Top Contenders</h3>
                <span className="text-xs text-gray-500">{rankings.length} ranked members</span>
              </div>

              <div className="divide-y divide-gray-100">
                {rankings.map((item) => (
                  <div
                    key={item.userId}
                    className={`p-4 sm:px-6 flex items-center gap-4 transition-colors ${
                      item.isCurrentUser
                        ? 'bg-amber-50/60 border-l-4 border-amber-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Rank number */}
                    <div className="w-8 flex-shrink-0 text-center">
                      {item.rank === 1 ? (
                        <Medal className="w-6 h-6 text-amber-500 mx-auto" />
                      ) : item.rank === 2 ? (
                        <Medal className="w-6 h-6 text-gray-400 mx-auto" />
                      ) : item.rank === 3 ? (
                        <Medal className="w-6 h-6 text-amber-700 mx-auto" />
                      ) : (
                        <span className="font-bold text-sm text-gray-400">#{item.rank}</span>
                      )}
                    </div>

                    {/* Candidate */}
                    <Avatar
                      alt={item.name}
                      fallback={item.name.substring(0, 2).toUpperCase()}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {item.name}
                        </h4>
                        {item.isCurrentUser && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.headline}</p>
                    </div>

                    {/* Level & Badges */}
                    <div className="hidden sm:flex items-center gap-6 text-xs text-gray-500">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Level</span>
                        <span className="font-bold text-gray-800">{item.level}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Badges</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          {item.badgesCount || 0}
                        </span>
                      </div>
                    </div>

                    {/* XP Score */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-extrabold text-sm sm:text-base text-gray-900">
                        {item.xpPoints.toLocaleString()}
                        <span className="text-xs font-semibold text-amber-600 ml-1">XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
