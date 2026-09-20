'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { courseService, type CourseRecord, type EnrollmentRecord } from '@/services/course.service';
import { createBrowserClient } from '@/lib/supabase';
import { Button, Avatar, Card, ProgressBar } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  PlayCircle,
  FileText,
  CheckCircle2,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface CourseDetailPageProps {
  courseId: string;
}

export default function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        const courseData = await courseService.getCourseById(courseId, user?.id);
        setCourse(courseData);

        if (user) {
          const enroll = await courseService.getEnrollment(courseId, user.id);
          setEnrollment(enroll);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        setError('Failed to load course.');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/auth/signin?redirect=/courses/${courseId}`);
        return;
      }

      const newEnroll = await courseService.enrollCourse(courseId, user.id);
      setEnrollment(newEnroll);
      router.push(`/courses/${courseId}/learn`);
    } catch (err) {
      console.error('Error enrolling:', err);
      alert('Failed to enroll. You may already be enrolled.');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="candidate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout userRole="candidate">
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Curriculum Not Found</h2>
          <p className="text-slate-600 mb-6 text-sm">The course requested does not exist or has been archived.</p>
          <Link href="/courses">
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalLessons = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <DashboardLayout userRole="candidate">
      <div className="space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Courses
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md">
            {course.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card className="p-6 sm:p-8 border-slate-200/80 shadow-sm">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {course.level}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                  {course.category ? course.category.replace('_', ' ') : 'Engineering'}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  +{course.xp_reward || 250} XP
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                {course.description || 'Master foundational and advanced concepts in this hands-on engineering course.'}
              </p>

              {/* Instructor banner */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                <Avatar
                  src={course.instructor?.avatar_url || undefined}
                  alt={course.instructor?.first_name || 'Instructor'}
                  fallback={course.instructor?.first_name?.charAt(0) || 'T'}
                  size="md"
                />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Curriculum Lead</p>
                  <p className="text-sm font-bold text-slate-900">
                    {course.instructor?.first_name
                      ? `${course.instructor.first_name} ${course.instructor.last_name || ''}`.trim()
                      : 'TalentSphere Engineering Staff'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Curriculum Breakdown */}
            <Card className="p-6 sm:p-8 border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Course Syllabus</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {(course.modules || []).length} modules • {totalLessons} interactive lessons
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(course.modules || []).map((module, mIdx) => (
                  <div key={module.id} className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200/70 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">
                        Module {mIdx + 1}: {module.title}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {(module.lessons || []).length} lessons
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {(module.lessons || []).map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.is_completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : lesson.content_type === 'video' ? (
                              <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className={lesson.is_completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                              {lIdx + 1}. {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {lesson.duration_seconds && (
                              <span className="text-xs text-slate-400">
                                {Math.round(lesson.duration_seconds / 60)} min
                              </span>
                            )}
                            {lesson.is_preview && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Preview
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900">Enrollment & Status</h3>

              {enrollment ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-2">
                      <span>Curriculum Completion</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <ProgressBar value={enrollment.progress_percentage} variant="indigo" size="md" />
                  </div>

                  <Link href={`/courses/${courseId}/learn`} className="block w-full">
                    <Button variant="primary" size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/25">
                      <PlayCircle className="w-5 h-5" />
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-medium leading-relaxed">
                    ✨ Full curriculum access and verified certification included with your talent profile.
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full gap-2 shadow-lg shadow-indigo-500/25"
                    isLoading={isEnrolling}
                    onClick={handleEnroll}
                  >
                    <Sparkles className="w-4 h-4" />
                    Enroll in Course
                  </Button>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Estimated Duration
                  </span>
                  <span className="font-semibold text-slate-800">{course.estimated_hours || 4} hours</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    XP Credential
                  </span>
                  <span className="font-bold text-amber-600">+{course.xp_reward || 250} XP</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    Skill Certificate
                  </span>
                  <span className="font-semibold text-emerald-600">Verified</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
