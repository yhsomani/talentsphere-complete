'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseService, type CourseRecord } from '@/services/course.service';
import { Button, Avatar, Card, EmptyState } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BookOpen,
  Clock,
  Award,
  Search,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Domains' },
  { id: 'web_development', label: 'Web Development' },
  { id: 'mobile_development', label: 'Mobile Engineering' },
  { id: 'system_design', label: 'System Design' },
  { id: 'data_science', label: 'Data Science' },
  { id: 'ai_ml', label: 'AI & Machine Learning' },
  { id: 'devops', label: 'Cloud & DevOps' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
];

const LEVELS = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export default function CourseListPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          search: search.trim() || undefined,
        });
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [selectedCategory, selectedLevel, search]);

  return (
    <DashboardLayout userRole="candidate">
      <div className="space-y-8">
        {/* LMS Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Technical Academy & Certification
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Accelerate Your Engineering Career
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                Applied industry courses, architecture deep-dives, and hands-on modules designed by principal engineers to verify your job-ready competencies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/challenges">
                <Button variant="secondary" className="bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white gap-2 font-semibold">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Code Arena</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses by topic, architecture, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
            />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Available Curricula</span>
              <p className="text-2xl font-bold text-white mt-0.5">{courses.length}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
              <span className="text-xs text-indigo-400 font-medium">Verified Domains</span>
              <p className="text-2xl font-bold text-indigo-400 mt-0.5">8 Specializations</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-xs text-emerald-400 font-medium">Skill Credentials</span>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">100% Verified</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="No Courses Found"
            description="No curricula matched your search and filter criteria. Try resetting your filters to explore all available modules."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setSearch('');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group block"
              >
                <Card
                  hover
                  className="h-full flex flex-col justify-between overflow-hidden border-slate-200/80 transition-all duration-200 p-0"
                >
                  <div>
                    {/* Course Banner */}
                    <div className="h-44 w-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 p-6 flex flex-col justify-between relative overflow-hidden text-white border-b border-slate-800">
                      <div className="flex items-center justify-between z-10">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-sm">
                          {course.level}
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400 text-slate-950 shadow-sm">
                          <Award className="w-3.5 h-3.5" />
                          +{course.xp_reward || 250} XP
                        </span>
                      </div>

                      <div className="z-10">
                        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                          {course.category ? course.category.replace('_', ' ') : 'Engineering'}
                        </p>
                        <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 mt-1 group-hover:text-indigo-200 transition-colors">
                          {course.title}
                        </h3>
                      </div>

                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                    </div>

                    {/* Course Body */}
                    <div className="p-5">
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {course.description || 'Master core engineering architecture through applied lessons and verified case studies.'}
                      </p>

                      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {course.estimated_hours || 4} hours
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                          Certificate Included
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={course.instructor?.avatar_url || undefined}
                        alt={course.instructor?.first_name || 'Instructor'}
                        fallback={course.instructor?.first_name?.charAt(0) || 'T'}
                        size="sm"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {course.instructor?.first_name
                          ? `${course.instructor.first_name} ${course.instructor.last_name || ''}`.trim()
                          : 'TalentSphere Staff'}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Explore <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
