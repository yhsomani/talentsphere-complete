'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  courseService,
  type CourseRecord,
  type CourseLessonRecord
} from '@/services/course.service';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { extractYouTubeId } from '@/utils';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ExternalLink,
  Check
} from 'lucide-react';

interface LessonPlayerPageProps {
  courseId: string;
}

export default function LessonPlayerPage({ courseId }: LessonPlayerPageProps) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CourseLessonRecord | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setIsLoading(true);
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/auth/signin?redirect=/courses/${courseId}/learn`);
          return;
        }

        setUserId(user.id);
        const courseData = await courseService.getCourseById(courseId, user.id);

        if (courseData) {
          setCourse(courseData);

          // Find all completed lessons
          const completed = new Set<string>();
          let firstIncompleteLesson: CourseLessonRecord | null = null;

          (courseData.modules || []).forEach(mod => {
            (mod.lessons || []).forEach(lesson => {
              if (lesson.is_completed) {
                completed.add(lesson.id);
              } else if (!firstIncompleteLesson) {
                firstIncompleteLesson = lesson;
              }
            });
          });

          setCompletedLessonIds(completed);

          // Select first incomplete lesson or first lesson in course
          const allLessons = (courseData.modules || []).flatMap(m => m.lessons || []);
          setCurrentLesson(firstIncompleteLesson || allLessons[0] || null);
        }
      } catch (err) {
        console.error('Error loading course player:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadPlayer();
    }
  }, [courseId, router]);

  const allLessons: CourseLessonRecord[] = (course?.modules || []).flatMap(m => m.lessons || []);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleMarkComplete = async () => {
    if (!currentLesson || !userId) return;

    try {
      setIsCompleting(true);
      await courseService.completeLesson(currentLesson.id, courseId, userId);

      setCompletedLessonIds(prev => new Set(prev).add(currentLesson.id));

      if (nextLesson) {
        setCurrentLesson(nextLesson);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-4 font-mono">Loading curriculum session...</p>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <BookOpen className="w-12 h-12 text-indigo-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Lessons Available</h2>
        <p className="text-slate-400 mb-6 max-w-md text-sm">
          This course currently has no active lessons. Check back soon for updates.
        </p>
        <Link href={`/courses/${courseId}`}>
          <Button variant="primary">Return to Overview</Button>
        </Link>
      </div>
    );
  }

  const isCurrentCompleted = completedLessonIds.has(currentLesson.id);
  const totalCompleted = allLessons.filter(l => completedLessonIds.has(l.id)).length;
  const percentComplete = allLessons.length > 0
    ? Math.round((totalCompleted / allLessons.length) * 100)
    : 0;

  const youtubeId = currentLesson.content_url ? extractYouTubeId(currentLesson.content_url) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Player Header */}
      <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${courseId}`}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Exit Player"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {course.title}
            </h1>
            <p className="text-xs text-slate-400 truncate">
              Lesson {currentIndex + 1} of {allLessons.length}: {currentLesson.title}
            </p>
          </div>
        </div>

        {/* Header Right: Progress & XP */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">{percentComplete}% Complete</span>
            <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>+{course.xp_reward || 250} XP</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Lesson View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between bg-slate-950">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Video or Content Player */}
            {currentLesson.content_type === 'video' && (
              <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative ring-1 ring-slate-800/80">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&rel=0`}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : currentLesson.content_url ? (
                  <video
                    controls
                    src={currentLesson.content_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                    <PlayCircle className="w-16 h-16 mb-2 text-indigo-500/40" />
                    <p className="font-semibold text-slate-300">{currentLesson.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Interactive instructional module</p>
                  </div>
                )}
              </div>
            )}

            {/* Lesson Title & Completion Status Banner */}
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                  {currentLesson.content_type}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                  {currentLesson.title}
                </h2>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                {isCurrentCompleted ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <Check className="w-4 h-4" />
                    Completed
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
                    isLoading={isCompleting}
                    onClick={handleMarkComplete}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            </div>

            {/* Article / Notes */}
            <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-300 leading-relaxed space-y-4">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Lesson Notes & Architecture Reference
              </h3>
              <p className="text-sm">
                In this module, you are exploring the foundational principles and best practices for{' '}
                <span className="font-semibold text-white">{currentLesson.title}</span>. Follow along with the practical exercises, review the system diagrams, and apply the concepts to your portfolio.
              </p>

              {currentLesson.content_url && !youtubeId && (
                <div className="pt-4 border-t border-slate-800">
                  <a
                    href={currentLesson.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Reference Material
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Nav: Previous / Next */}
          <div className="max-w-4xl mx-auto w-full pt-8 flex items-center justify-between border-t border-slate-800/80 mt-8">
            {prevLesson ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLesson(prevLesson)}
                className="gap-1.5 text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev: {prevLesson.title}</span>
              </Button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentLesson(nextLesson)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <span>Next: {nextLesson.title}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Link href={`/courses/${courseId}`}>
                <Button variant="primary" size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
                  Finish Course 🎉
                </Button>
              </Link>
            )}
          </div>
        </main>

        {/* Right Sidebar: Curriculum Drawer */}
        <aside className="w-full lg:w-80 xl:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto shrink-0 p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-200">Course Syllabus</h3>
            <span className="text-xs text-slate-400 font-medium">
              {totalCompleted} / {allLessons.length} Done
            </span>
          </div>

          <div className="space-y-4">
            {(course.modules || []).map((module, mIdx) => (
              <div key={module.id} className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Module {mIdx + 1}: {module.title}
                </p>

                <div className="space-y-1">
                  {(module.lessons || []).map((lesson) => {
                    const isSelected = lesson.id === currentLesson.id;
                    const isCompleted = completedLessonIds.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                            : isCompleted
                            ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isCompleted ? (
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                          ) : (
                            <PlayCircle className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        {lesson.duration_seconds && (
                          <span className={`text-[10px] shrink-0 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {Math.round(lesson.duration_seconds / 60)}m
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
