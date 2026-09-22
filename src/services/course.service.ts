/**
 * Course Service - Data access layer for learning platform
 * 
 * Refactored to use DatabaseAdapter for loose coupling, resilience,
 * and testability via Dependency Injection.
 */

import type { DatabaseAdapter } from '../lib/database/adapter';
import { createDatabaseAdapter } from '../lib/database/adapter';
import { AppConfig } from '../config/index';
import { AppErrors, isAppError } from '../lib/errors/index';

export interface CourseRecord {
  id: string;
  instructor_id: string;
  organization_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string | null;
  estimated_hours: number;
  xp_reward: number;
  is_published: boolean;
  price_cents: number;
  created_at: string;
  updated_at: string;
  instructor?: {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url: string | null;
  } | null;
  organization?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  modules?: CourseModuleRecord[];
}

export interface CourseModuleRecord {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: CourseLessonRecord[];
}

export interface CourseLessonRecord {
  id: string;
  module_id: string;
  title: string;
  content_type: 'video' | 'article' | 'interactive_code' | 'quiz';
  content_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  is_preview: boolean;
  is_completed?: boolean;
}

export interface EnrollmentRecord {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
}

export interface QuizAnswerRecord {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct?: boolean;
  order_index: number;
}

export interface QuizQuestionRecord {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  points: number;
  order_index: number;
  answers: QuizAnswerRecord[];
}

export interface QuizRecord {
  id: string;
  lesson_id: string | null;
  title: string;
  passing_score: number;
  max_attempts: number;
  time_limit_seconds: number | null;
  created_at: string;
  questions: QuizQuestionRecord[];
}

export interface QuizAttemptRecord {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  score: number;
  passed: boolean;
  attempt_number: number;
}

export interface QuizAttemptResult {
  attempt: QuizAttemptRecord;
  totalQuestions: number;
  correctCount: number;
  score: number;
  passed: boolean;
  passingScore: number;
  certificateIssued?: boolean;
  certificateNumber?: string;
}

export interface CertificateRecord {
  id: string;
  course_id: string;
  user_id: string;
  certificate_number: string;
  issued_at: string;
  expires_at: string | null;
  credential_url: string | null;
  course?: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    thumbnail_url?: string | null;
    level?: string;
  } | null;
  user?: {
    id: string;
    full_name?: string | null;
    email: string;
    avatar_url?: string | null;
  } | null;
}

export interface CourseReviewRecord {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name?: string;
    avatar_url: string | null;
  } | null;
}

export interface CourseRatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface MediaProgressRecord {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  current_position_seconds: number;
  total_duration_seconds: number | null;
  last_watched_at: string;
}

export class CourseService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all published courses with optional filtering
   */
  async getCourses(filters: { category?: string; level?: string; search?: string } = {}): Promise<CourseRecord[]> {
    try {
      let query = this.db
        .from('courses')
        .select(`
          *,
          users!instructor_id (
            id,
            full_name,
            avatar_url
          ),
          organizations (
            id,
            name,
            logo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.level && filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) {
        throw AppErrors.database('Failed to fetch courses', {
          cause: error,
          context: filters,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data as unknown as any[]) || []).map((c: any) => {
        const u = c.users;
        const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
        const lastName = rest.join(' ');
        return {
          ...c,
          instructor: u ? {
            id: u.id,
            full_name: u.full_name || '',
            first_name: firstName,
            last_name: lastName,
            avatar_url: u.avatar_url || null,
          } : null,
          organization: c.organizations,
        };
      }) as CourseRecord[];
    } catch (error) {
      if (isAppError(error)) throw error;
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  /**
   * Get single course with full modules and lessons
   */
  async getCourseById(courseId: string, userId?: string): Promise<CourseRecord | null> {
    try {
      // 1. Fetch course details
      const { data: courseData, error } = await this.db
        .from('courses')
        .select(`
          *,
          users!instructor_id (
            id,
            full_name,
            avatar_url
          ),
          organizations (
            id,
            name,
            logo_url
          )
        `)
        .eq('id', courseId)
        .maybeSingle();

      if (error || !courseData) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const course = courseData as unknown as any;

      // 2. Fetch modules
      const { data: modulesData } = await this.db
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      const rawModules = (modulesData as unknown as any[]) || [];
      const moduleIds = rawModules.map(m => m.id);

      // 3. Fetch lessons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lessonsData: any[] = [];
      if (moduleIds.length > 0) {
        const { data: lessons } = await this.db
          .from('course_lessons')
          .select('*')
          .in('module_id', moduleIds)
          .order('order_index', { ascending: true });
        lessonsData = (lessons as unknown as any[]) || [];
      }

      // 4. Fetch completed lesson IDs if user is signed in
      const completedSet = new Set<string>();
      if (userId) {
        const { data: completions } = await this.db
          .from('lesson_completions')
          .select('lesson_id')
          .eq('user_id', userId);
        ((completions as unknown as any[]) || []).forEach(c => completedSet.add(c.lesson_id));
      }

      const formattedModules: CourseModuleRecord[] = rawModules.map(m => ({
        ...m,
        lessons: lessonsData
          .filter(l => l.module_id === m.id)
          .map(l => ({
            ...l,
            is_completed: completedSet.has(l.id),
          })),
      }));

      const u = course.users;
      const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
      const lastName = rest.join(' ');

      return {
        ...course,
        instructor: u ? {
          id: u.id,
          full_name: u.full_name || '',
          first_name: firstName,
          last_name: lastName,
          avatar_url: u.avatar_url || null,
        } : null,
        organization: course.organizations,
        modules: formattedModules,
      } as CourseRecord;
    } catch (error) {
      if (isAppError(error)) throw error;
      console.error('Error fetching course by id:', error);
      return null;
    }
  }

  /**
   * Enroll user in course
   */
  async enrollCourse(courseId: string, userId: string): Promise<EnrollmentRecord> {
    try {
      const { data, error } = await this.db
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: userId,
          status: 'enrolled',
          progress_percentage: 0,
        })
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to enroll in course', {
          cause: error,
          context: { courseId, userId },
        });
      }
      return data as unknown as EnrollmentRecord;
    } catch (error) {
      if (isAppError(error)) throw error;
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  /**
   * Get user's enrollment for a course
   */
  async getEnrollment(courseId: string, userId: string): Promise<EnrollmentRecord | null> {
    try {
      const { data, error } = await this.db
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) return null;
      return data as unknown as EnrollmentRecord | null;
    } catch {
      return null;
    }
  }

  /**
   * Mark lesson as completed and update progress
   */
  /**
   * Mark lesson as completed and update progress (COURSE-005, LMS-013)
   */
  async completeLesson(lessonId: string, courseId: string, userId: string): Promise<boolean> {
    try {
      // 1. Mark lesson completed
      await this.db
        .from('lesson_completions')
        .upsert(
          { lesson_id: lessonId, user_id: userId },
          { onConflict: 'lesson_id,user_id' }
        );

      // 2. Count total lessons in course
      const { data: modules } = await this.db
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);
      
      const rawModules = (modules as unknown as Array<{ id: string }>) || [];
      const moduleIds = rawModules.map(m => m.id);

      if (moduleIds.length > 0) {
        // Count total lessons in course
        const { data: allLessons } = await this.db
          .from('course_lessons')
          .select('id')
          .in('module_id', moduleIds);
        
        const rawLessons = (allLessons as unknown as Array<{ id: string }>) || [];
        const allLessonIds = rawLessons.map(l => l.id);
        const totalLessons = rawLessons.length;

        // Count completed lessons in this course
        const { data: completions } = await this.db
          .from('lesson_completions')
          .select('id, lesson_id')
          .eq('user_id', userId)
          .in('lesson_id', allLessonIds);
        
        const completedCount = ((completions as unknown as any[]) || []).length;

        const progress = totalLessons > 0
          ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
          : 100;

        const isFullyCompleted = progress >= 100;

        await this.db
          .from('course_enrollments')
          .update({
            progress_percentage: progress,
            status: isFullyCompleted ? 'completed' : 'in_progress',
            completed_at: isFullyCompleted ? new Date().toISOString() : null,
          })
          .eq('course_id', courseId)
          .eq('user_id', userId);

        if (isFullyCompleted) {
          // 1. Issue verifiable certificate (COURSE-005)
          try {
            await this.issueCertificate(courseId, userId);
          } catch (certErr) {
            console.warn('Non-blocking certificate issuance failed:', certErr);
          }

          // 2. Award Course Completion XP (LMS-013)
          try {
            const { data: courseData } = await this.db
              .from('courses')
              .select('title, xp_reward')
              .eq('id', courseId)
              .maybeSingle();

            const xpAmount = (courseData as any)?.xp_reward || 250;
            const courseTitle = (courseData as any)?.title || 'Course';

            await this.db.from('xp_ledger').insert({
              user_id: userId,
              amount: xpAmount,
              transaction_type: 'bonus',
              source_type: 'course_completion',
              source_id: courseId,
              description: `Completed course: ${courseTitle}`,
              balance_after: xpAmount,
            });
          } catch (xpErr) {
            console.warn('Non-blocking course XP award failed:', xpErr);
          }
        }
      }

      return true;
    } catch (error) {
      if (isAppError(error)) throw error;
      console.error('Error completing lesson:', error);
      return false;
    }
  }

  /**
   * Issue a verifiable course completion certificate (COURSE-005)
   */
  async issueCertificate(courseId: string, userId: string): Promise<CertificateRecord | null> {
    try {
      // 1. Check if certificate already exists
      const { data: existing } = await this.db
        .from('certificates')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        return existing as unknown as CertificateRecord;
      }

      // 2. Generate unique certificate number
      const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timePart = Date.now().toString(36).toUpperCase();
      const certNumber = `TS-CERT-${randPart}-${timePart}`;

      const { data: cert, error } = await this.db
        .from('certificates')
        .insert({
          course_id: courseId,
          user_id: userId,
          certificate_number: certNumber,
          credential_url: `/certificates/${certNumber}`,
          issued_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        throw AppErrors.database('Failed to issue certificate', { cause: error, context: { courseId, userId } });
      }

      // 3. Send automated in-app notification (NOTIF-005)
      try {
        const { data: courseData } = await this.db
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .maybeSingle();

        const courseTitle = (courseData as any)?.title || 'Course';
        await this.db.from('notifications').insert({
          user_id: userId,
          type: 'badge_earned',
          title: 'Certificate Issued!',
          message: `Congratulations! You have completed "${courseTitle}" and earned your verifiable certificate.`,
          link_url: `/certificates/${certNumber}`,
          link_label: 'View Certificate',
          channel: 'in_app',
          metadata: { courseId, certificateNumber: certNumber },
          is_read: false,
          is_archived: false,
        });
      } catch (notifErr) {
        console.warn('Non-blocking certificate notification failed:', notifErr);
      }

      return cert as unknown as CertificateRecord;
    } catch (err) {
      if (isAppError(err)) throw err;
      console.error('Error in issueCertificate:', err);
      return null;
    }
  }

  /**
   * Get certificate by course ID and user ID (COURSE-005)
   */
  async getCertificate(courseId: string, userId: string): Promise<CertificateRecord | null> {
    try {
      const { data, error } = await this.db
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            slug,
            thumbnail_url
          )
        `)
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;
      const cert = data as any;
      let course = cert.courses;
      if (!course && cert.course_id) {
        const { data: c } = await this.db.from('courses').select('id, title, slug, thumbnail_url').eq('id', cert.course_id).maybeSingle();
        course = c;
      }
      return {
        ...cert,
        course,
      } as unknown as CertificateRecord;
    } catch {
      return null;
    }
  }

  /**
   * Verify certificate by certificate number (Public Verification Route COURSE-005)
   */
  async getCertificateByNumber(certificateNumber: string): Promise<CertificateRecord | null> {
    try {
      const { data, error } = await this.db
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            slug,
            description,
            thumbnail_url,
            level
          ),
          users (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('certificate_number', certificateNumber)
        .maybeSingle();

      if (error || !data) return null;

      const cert = data as any;
      let course = cert.courses;
      let user = cert.users;

      if (!course && cert.course_id) {
        const { data: c } = await this.db.from('courses').select('*').eq('id', cert.course_id).maybeSingle();
        course = c;
      }
      if (!user && cert.user_id) {
        const { data: u } = await this.db.from('users').select('id, full_name, email, avatar_url').eq('id', cert.user_id).maybeSingle();
        user = u;
      }

      return {
        ...cert,
        course,
        user,
      } as CertificateRecord;
    } catch {
      return null;
    }
  }

  /**
   * Get user certificates
   */
  async getUserCertificates(userId: string): Promise<CertificateRecord[]> {
    try {
      const { data, error } = await this.db
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            slug,
            thumbnail_url
          )
        `)
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) return [];
      return (data || []) as unknown as CertificateRecord[];
    } catch {
      return [];
    }
  }

  /**
   * Get quiz for a lesson with its questions and answer choices (LMS-005)
   */
  async getLessonQuiz(lessonId: string): Promise<QuizRecord | null> {
    try {
      const { data: quizData, error } = await this.db
        .from('course_quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error || !quizData) {
        return null;
      }

      const quizId = (quizData as any).id;
      return this.getQuizById(quizId);
    } catch (err) {
      console.error('Error fetching lesson quiz:', err);
      return null;
    }
  }

  /**
   * Get quiz by quiz ID with questions and answers (LMS-005)
   */
  async getQuizById(quizId: string): Promise<QuizRecord | null> {
    try {
      const { data: quizData, error: quizError } = await this.db
        .from('course_quizzes')
        .select('*')
        .eq('id', quizId)
        .maybeSingle();

      if (quizError || !quizData) return null;

      const { data: questionsData } = await this.db
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      const rawQuestions = ((questionsData as unknown as any[]) || []);
      const questionIds = rawQuestions.map(q => q.id);

      let allAnswers: any[] = [];
      if (questionIds.length > 0) {
        const { data: answersData } = await this.db
          .from('quiz_answers')
          .select('*')
          .in('question_id', questionIds)
          .order('order_index', { ascending: true });
        allAnswers = (answersData as unknown as any[]) || [];
      }

      const formattedQuestions: QuizQuestionRecord[] = rawQuestions.map(q => ({
        ...q,
        answers: allAnswers
          .filter(a => a.question_id === q.id)
          .map(a => ({
            id: a.id,
            question_id: a.question_id,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
            order_index: a.order_index,
          })),
      }));

      return {
        ...(quizData as any),
        questions: formattedQuestions,
      } as QuizRecord;
    } catch (err) {
      console.error('Error fetching quiz by ID:', err);
      return null;
    }
  }

  /**
   * Submit quiz attempt and calculate score (LMS-005)
   */
  async submitQuizAttempt(params: {
    quizId: string;
    userId: string;
    answers: Record<string, string>; // questionId -> answerId
    courseId?: string;
    lessonId?: string;
  }): Promise<QuizAttemptResult> {
    try {
      const quiz = await this.getQuizById(params.quizId);
      if (!quiz) {
        throw AppErrors.notFound('Quiz', params.quizId);
      }

      // 1. Calculate score
      let correctCount = 0;
      const totalQuestions = quiz.questions.length;
      const responsesToInsert: any[] = [];

      for (const question of quiz.questions) {
        const selectedAnswerId = params.answers[question.id];
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
        const isCorrect = Boolean(selectedAnswer?.is_correct);
        if (isCorrect) {
          correctCount += 1;
        }

        responsesToInsert.push({
          question_id: question.id,
          selected_answer_id: selectedAnswerId || null,
          is_correct: isCorrect,
          points_earned: isCorrect ? (question.points || 1) : 0,
        });
      }

      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
      const passingScore = quiz.passing_score ?? 70;
      const passed = score >= passingScore;

      // 2. Determine attempt number
      const { data: previousAttempts } = await this.db
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', params.quizId)
        .eq('user_id', params.userId);

      const attemptNumber = ((previousAttempts as unknown as any[]) || []).length + 1;

      // 3. Create quiz attempt record
      const { data: attemptRecord, error: attemptError } = await this.db
        .from('quiz_attempts')
        .insert({
          quiz_id: params.quizId,
          user_id: params.userId,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          score,
          passed,
          attempt_number: attemptNumber,
        })
        .select('*')
        .single();

      if (attemptError) {
        throw AppErrors.database('Failed to record quiz attempt', { cause: attemptError, context: params });
      }

      // 4. Record individual quiz responses
      const attemptId = (attemptRecord as any).id;
      for (const resp of responsesToInsert) {
        await this.db.from('quiz_responses').insert({
          attempt_id: attemptId,
          question_id: resp.question_id,
          selected_answer_id: resp.selected_answer_id,
          is_correct: resp.is_correct,
          points_earned: resp.points_earned,
        });
      }

      // 5. If passed and lessonId + courseId are provided, mark lesson completed
      let certificateIssued = false;
      let certificateNumber: string | undefined;

      if (passed && params.lessonId && params.courseId) {
        await this.completeLesson(params.lessonId, params.courseId, params.userId);

        const cert = await this.getCertificate(params.courseId, params.userId);
        if (cert) {
          certificateIssued = true;
          certificateNumber = cert.certificate_number;
        }
      }

      return {
        attempt: attemptRecord as unknown as QuizAttemptRecord,
        totalQuestions,
        correctCount,
        score,
        passed,
        passingScore,
        certificateIssued,
        certificateNumber,
      };
    } catch (err) {
      if (isAppError(err)) throw err;
      console.error('Error submitting quiz attempt:', err);
      throw AppErrors.database('Failed to submit quiz attempt', { cause: err, context: params });
    }
  }

  /**
   * Get past quiz attempts for a user (LMS-005)
   */
  async getQuizAttempts(quizId: string, userId: string): Promise<QuizAttemptRecord[]> {
    try {
      const { data, error } = await this.db
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', userId)
        .order('attempt_number', { ascending: false });

      if (error) return [];
      return (data || []) as unknown as QuizAttemptRecord[];
    } catch {
      return [];
    }
  }

  /**
   * Submit or update a course review (LMS-009)
   */
  async submitCourseReview(params: {
    courseId: string;
    userId: string;
    rating: number;
    reviewText?: string;
  }): Promise<CourseReviewRecord> {
    try {
      if (!params.courseId || !params.userId) {
        throw AppErrors.validation('courseId and userId are required');
      }

      const rating = Math.round(params.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw AppErrors.validation('Rating must be an integer between 1 and 5');
      }

      // Check for existing review
      const { data: existing } = await this.db
        .from('course_reviews')
        .select('*')
        .eq('course_id', params.courseId)
        .eq('user_id', params.userId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingRecord = (existing as unknown as any[])?.[0];
      const now = new Date().toISOString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resultRecord: any;

      if (existingRecord) {
        const { data: updated, error: updateError } = await this.db
          .from('course_reviews')
          .update({
            rating,
            review_text: params.reviewText?.trim() || null,
            updated_at: now,
          })
          .eq('id', existingRecord.id);

        if (updateError) {
          throw AppErrors.database('Failed to update course review', { cause: updateError, context: params });
        }
        resultRecord = Array.isArray(updated) ? updated[0] : (updated || { ...existingRecord, rating, review_text: params.reviewText?.trim() || null, updated_at: now });
      } else {
        const { data: inserted, error: insertError } = await this.db
          .from('course_reviews')
          .insert({
            course_id: params.courseId,
            user_id: params.userId,
            rating,
            review_text: params.reviewText?.trim() || null,
            created_at: now,
            updated_at: now,
          });

        if (insertError) {
          throw AppErrors.database('Failed to submit course review', { cause: insertError, context: params });
        }
        resultRecord = Array.isArray(inserted) ? inserted[0] : inserted;
      }

      // Enrich with user profile info if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let userProfile: any = null;
      try {
        const { data: userData } = await this.db
          .from('users')
          .select('id, full_name, avatar_url')
          .eq('id', params.userId)
          .maybeSingle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userProfile = userData as any;
      } catch {
        // Non-blocking fallback
      }

      return {
        ...(resultRecord || {}),
        user: userProfile ? {
          id: userProfile.id,
          full_name: userProfile.full_name || 'Anonymous Learner',
          avatar_url: userProfile.avatar_url || null,
        } : null,
      } as unknown as CourseReviewRecord;
    } catch (error) {
      if (isAppError(error)) throw error;
      console.error('Error submitting course review:', error);
      throw AppErrors.database('Failed to submit course review', { cause: error, context: params });
    }
  }

  /**
   * Get all reviews for a course with user profile enrichment (LMS-009)
   */
  async getCourseReviews(courseId: string): Promise<CourseReviewRecord[]> {
    try {
      const { data: reviewsData, error } = await this.db
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviews = (reviewsData as unknown as any[]) || [];
      if (reviews.length === 0) return [];

      const userIds = [...new Set(reviews.map(r => r.user_id).filter(Boolean))];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userMap = new Map<string, any>();

      if (userIds.length > 0) {
        try {
          const { data: usersData } = await this.db
            .from('users')
            .select('id, full_name, avatar_url')
            .in('id', userIds);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((usersData as unknown as any[]) || []).forEach(u => userMap.set(u.id, u));
        } catch {
          // Relational query fallback
        }
      }

      return reviews.map(r => {
        const u = userMap.get(r.user_id);
        return {
          ...r,
          user: u ? {
            id: u.id,
            full_name: u.full_name || 'Anonymous Learner',
            avatar_url: u.avatar_url || null,
          } : null,
        };
      }) as unknown as CourseReviewRecord[];
    } catch {
      return [];
    }
  }

  /**
   * Get course rating summary and star distribution (LMS-009)
   */
  async getCourseRatingSummary(courseId: string): Promise<CourseRatingSummary> {
    try {
      const { data: reviewsData, error } = await this.db
        .from('course_reviews')
        .select('rating')
        .eq('course_id', courseId);

      if (error || !reviewsData) {
        return {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }

      const reviews = (reviewsData as unknown as Array<{ rating: number }>) || [];
      const totalReviews = reviews.length;
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          distribution,
        };
      }

      let ratingSum = 0;
      reviews.forEach(r => {
        const rating = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
        if (rating >= 1 && rating <= 5) {
          distribution[rating as keyof typeof distribution] = (distribution[rating as keyof typeof distribution] || 0) + 1;
          ratingSum += rating;
        }
      });

      const averageRating = Number((ratingSum / totalReviews).toFixed(1));

      return {
        averageRating,
        totalReviews,
        distribution,
      };
    } catch {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
  }

  /**
   * Get current user's review for a course if exists (LMS-009)
   */
  async getUserCourseReview(courseId: string, userId: string): Promise<CourseReviewRecord | null> {
    try {
      const { data, error } = await this.db
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId);

      if (error || !data) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const record = (data as unknown as any[])?.[0];
      return (record || null) as unknown as CourseReviewRecord | null;
    } catch {
      return null;
    }
  }

  /**
   * Save video playback position for resuming (LMS-010)
   */
  async savePlaybackPosition(params: {
    userId: string;
    lessonId: string;
    courseId: string;
    positionSeconds: number;
    durationSeconds?: number;
  }): Promise<MediaProgressRecord> {
    try {
      if (!params.userId || !params.lessonId || !params.courseId) {
        throw AppErrors.validation('userId, lessonId, and courseId are required');
      }

      const positionSeconds = Math.max(0, Number(params.positionSeconds) || 0);
      const now = new Date().toISOString();

      const { data: existing } = await this.db
        .from('lesson_media_progress')
        .select('*')
        .eq('user_id', params.userId)
        .eq('lesson_id', params.lessonId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingRecord = (existing as unknown as any[])?.[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resultRecord: any;

      if (existingRecord) {
        const { data: updated, error: updateError } = await this.db
          .from('lesson_media_progress')
          .update({
            current_position_seconds: positionSeconds,
            total_duration_seconds: params.durationSeconds ?? existingRecord.total_duration_seconds ?? null,
            last_watched_at: now,
          })
          .eq('id', existingRecord.id);

        if (updateError) {
          throw AppErrors.database('Failed to update playback position', { cause: updateError, context: params });
        }
        resultRecord = Array.isArray(updated) ? updated[0] : (updated || { ...existingRecord, current_position_seconds: positionSeconds, last_watched_at: now });
      } else {
        const { data: inserted, error: insertError } = await this.db
          .from('lesson_media_progress')
          .insert({
            user_id: params.userId,
            lesson_id: params.lessonId,
            course_id: params.courseId,
            current_position_seconds: positionSeconds,
            total_duration_seconds: params.durationSeconds ?? null,
            last_watched_at: now,
          });

        if (insertError) {
          throw AppErrors.database('Failed to save playback position', { cause: insertError, context: params });
        }
        resultRecord = Array.isArray(inserted) ? inserted[0] : inserted;
      }

      return resultRecord as unknown as MediaProgressRecord;
    } catch (error) {
      if (isAppError(error)) throw error;
      console.error('Error saving playback position:', error);
      throw AppErrors.database('Failed to save playback position', { cause: error, context: params });
    }
  }

  /**
   * Get saved playback position for a lesson (LMS-010)
   */
  async getPlaybackPosition(userId: string, lessonId: string): Promise<MediaProgressRecord | null> {
    try {
      const { data, error } = await this.db
        .from('lesson_media_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error || !data) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const record = (data as unknown as any[])?.[0];
      return (record || null) as unknown as MediaProgressRecord | null;
    } catch {
      return null;
    }
  }

  /**
   * Get the most recently watched lesson for a course to resume learning (LMS-010)
   */
  async getLastWatchedLesson(userId: string, courseId: string): Promise<MediaProgressRecord | null> {
    try {
      const { data, error } = await this.db
        .from('lesson_media_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('last_watched_at', { ascending: false })
        .limit(1);

      if (error || !data) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const record = (data as unknown as any[])?.[0];
      return (record || null) as unknown as MediaProgressRecord | null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance for backward compatibility
const defaultAdapter = createDatabaseAdapter({
  supabaseUrl: AppConfig.supabase.url,
  supabaseKey: AppConfig.supabase.anonKey,
});
export const courseService = new CourseService(defaultAdapter);
