'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { challengeService, type ChallengeRecord } from '@/services/challenge.service';
import { createBrowserClient } from '@/lib/supabase';
import { Button, Badge, Card, EmptyState } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Trophy,
  Code2,
  CheckCircle2,
  Search,
  Sparkles,
  Flame,
  Zap,
  Award,
  Terminal,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const DIFFICULTIES = [
  { id: 'all', label: 'All Difficulties' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'expert', label: 'Expert' },
];

export default function ChallengeListPage() {
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await challengeService.getCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setIsLoading(true);
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        const data = await challengeService.getChallenges({
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: search.trim() || undefined,
        }, user?.id);

        setChallenges(data);
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenges();
  }, [selectedCategory, selectedDifficulty, search]);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="success">Easy</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'hard':
        return <Badge variant="danger">Hard</Badge>;
      case 'expert':
        return <Badge variant="secondary">Expert</Badge>;
      default:
        return <Badge variant="default">{difficulty}</Badge>;
    }
  };

  const solvedCount = challenges.filter(c => c.attempt?.is_solved).length;

  return (
    <DashboardLayout userRole="candidate">
      <div className="space-y-8">
        {/* Arena Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
                <Flame className="w-3.5 h-3.5 text-indigo-400" />
                TalentSphere Code Arena
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Prove Your Engineering Prowess
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                Solve verified algorithmic and system design challenges, benchmark your performance against peers, and earn verifiable XP badges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/leaderboard">
                <Button variant="secondary" className="bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white gap-2 font-semibold">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Leaderboard</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search challenges by title, algorithm, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Available Challenges</span>
              <p className="text-2xl font-bold text-white mt-0.5">{challenges.length}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
              <span className="text-xs text-emerald-400 font-medium">Solved by You</span>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{solvedCount}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-xs text-amber-300 font-medium">Earnable XP</span>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">
                +{challenges.reduce((acc, c) => acc + (c.xp_reward || 100), 0).toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff.id} value={diff.id}>{diff.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Challenges List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : challenges.length === 0 ? (
          <EmptyState
            icon={<Terminal className="w-6 h-6" />}
            title="No Challenges Found"
            description="There are no coding challenges matching your search criteria. Try clearing filters to explore all algorithmic problems."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSearch('');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {challenges.map((chal) => {
              const isSolved = chal.attempt?.is_solved;

              return (
                <Link
                  key={chal.id}
                  href={`/challenges/${chal.id}`}
                  className="block group"
                >
                  <Card
                    hover
                    className="p-6 transition-all duration-200 border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isSolved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      }`}>
                        {isSolved ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Code2 className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {chal.title}
                          </h2>
                          {getDifficultyBadge(chal.difficulty)}
                          {isSolved && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Solved
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {chal.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                          {chal.category?.name && (
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                              {chal.category.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            <Zap className="w-3.5 h-3.5" />
                            +{chal.xp_reward || 100} XP
                          </span>
                          {chal.attempt && chal.attempt.attempts_count > 0 && (
                            <span className="text-slate-400">
                              {chal.attempt.attempts_count} {chal.attempt.attempts_count === 1 ? 'attempt' : 'attempts'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <Button
                        variant={isSolved ? 'outline' : 'primary'}
                        size="sm"
                        className="gap-2"
                      >
                        {isSolved ? 'Solve Again' : 'Solve Challenge'}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
