/**
 * Course Service - Data access layer for course and enrollment operations
 * 
 * Refactored to use DatabaseAdapter for:
 * - Loose coupling from Supabase SDK
 * - Built-in retry and circuit breaker patterns
 * - Testability with mock adapters
 * - Consistent error handling
 */

import type { Database } from '@/types/database.types';
import { DatabaseAdapter } from '@/lib/database/adapter';
import { AppErrors, isAppError } from '@/lib/errors';

type CourseInsert = Database['public']['Tables']['courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];

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

export interface CourseFilters {
  category?: string;
  level?: string;
  search?: string;
  organizationId?: string;
  instructorId?: string;
  isPublished?: boolean;
}

/**
 * CourseService class with dependency injection
 */
export class CourseService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all courses with optional filtering and pagination
   */
  async getCourses(filters: CourseFilters = {}, page = 1, limit = 20) {
    try {
      const result = await this.db.list<any>('courses', {
        filters: {
          ...(filters.isPublished !== undefined ? { is_published: filters.isPublished } : {}),
          ...(filters.organizationId ? { organization_id: filters.organizationId } : {}),
          ...(filters.instructorId ? { instructor_id: filters.instructorId } : {}),
        },
        pagination: {
          page,
          pageSize: limit,
          orderBy: 'created_at',
          ascending: false,
        },
      });

      if (result.error) {
        throw result.error;
      }

      let courses = result.data;

      // Apply additional filters that can't be handled by simple equality
      if (filters.category && filters.category !== 'all') {
        courses = courses.filter((c: any) => c.category === filters.category);
      }
      if (filters.level && filters.level !== 'all') {
        courses = courses.filter((c: any) => c.level === filters.level);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        courses = courses.filter((c: any) => 
          c.title?.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        );
      }

      // Fetch instructor details
      const instructorIds = new Set<string>();
      courses.forEach((c: any) => {
        if (c.instructor_id) instructorIds.add(c.instructor_id);
      });

      const instructorMap = new Map<string, any>();
      if (instructorIds.size > 0) {
        const usersResult = await this.db.list<any>('users', {
          filters: { id: Array.from(instructorIds) },
        });
        if (!usersResult.error && usersResult.data) {
          usersResult.data.forEach((u) => instructorMap.set(u.id, u));
        }
      }

      // Fetch organization details
      const orgIds = new Set<string>();
      courses.forEach((c: any) => {
        if (c.organization_id) orgIds.add(c.organization_id);
      });

      const orgMap = new Map<string, any>();
      if (orgIds.size > 0) {
        const orgsResult = await this.db.list<any>('organizations', {
          filters: { id: Array.from(orgIds) },
        });
        if (!orgsResult.error && orgsResult.data) {
          orgsResult.data.forEach((o) => orgMap.set(o.id, o));
        }
      }

      const coursesWithDetails = courses.map((c: any) => {
        const instructor = instructorMap.get(c.instructor_id);
        const [firstName = '', ...rest] = (instructor?.full_name || '').split(' ');
        
        return {
          ...c,
          instructor: instructor ? {
            id: instructor.id,
            full_name: instructor.full_name || '',
            first_name: firstName,
            last_name: rest.join(' '),
            avatar_url: instructor.avatar_url || null,
          } : null,
          organization: orgMap.get(c.organization_id) || null,
        };
      });

      return {
        courses: coursesWithDetails as unknown as CourseRecord[],
        total: result.count ?? courses.length,
        page,
        limit,
        hasMore: (page - 1) * limit + courses.length < (result.count ?? courses.length)
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw AppErrors.database('Failed to fetch courses', { filters, page, limit }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get a single course with full modules and lessons
   */
  async getCourseById(courseId: string, userId?: string): Promise<CourseRecord | null> {
    try {
      // 1. Fetch course details
      const result = await this.db.getById<any>('courses', courseId);
      
      if (result.error || !result.data) {
        return null;
      }

      const course = result.data;

      // 2. Fetch instructor details
      let instructor = null;
      if (course.instructor_id) {
        const userResult = await this.db.getById<any>('users', course.instructor_id);
        if (!userResult.error && userResult.data) {
          const u = userResult.data;
          const [firstName = '', ...rest] = (u.full_name || '').split(' ');
          instructor = {
            id: u.id,
            full_name: u.full_name || '',
            first_name: firstName,
            last_name: rest.join(' '),
            avatar_url: u.avatar_url || null,
          };
        }
      }

      // 3. Fetch organization details
      let organization = null;
      if (course.organization_id) {
        const orgResult = await this.db.getById<any>('organizations', course.organization_id);
        if (!orgResult.error && orgResult.data) {
          organization = orgResult.data;
        }
      }

      // 4. Fetch modules
      const modulesResult = await this.db.list<any>('course_modules', {
        filters: { course_id: courseId },
        pagination: { orderBy: 'order_index', ascending: true },
      });

      const modulesData = modulesResult.data || [];
      const moduleIds = modulesData.map((m: any) => m.id);

      // 5. Fetch lessons
      let lessonsData: any[] = [];
      if (moduleIds.length > 0) {
        const lessonsResult = await this.db.list<any>('course_lessons', {
          filters: { module_id: moduleIds },
          pagination: { orderBy: 'order_index', ascending: true },
        });
        if (!lessonsResult.error && lessonsResult.data) {
          lessonsData = lessonsResult.data;
        }
      }

      // 6. Fetch completed lesson IDs if user is signed in
      const completedSet = new Set<string>();
      if (userId) {
        const completionsResult = await this.db.list<any>('lesson_completions', {
          filters: { user_id: userId },
        });
        if (!completionsResult.error && completionsResult.data) {
          completionsResult.data.forEach((c: any) => completedSet.add(c.lesson_id));
        }
      }

      const formattedModules: CourseModuleRecord[] = modulesData.map((m: any) => ({
        ...m,
        lessons: lessonsData
          .filter((l: any) => l.module_id === m.id)
          .map((l: any) => ({
            ...l,
            is_completed: completedSet.has(l.id),
          })),
      }));

      return {
        ...course,
        instructor,
        organization,
        modules: formattedModules,
      } as CourseRecord;
    } catch (error) {
      console.error('Error fetching course by id:', error);
      throw AppErrors.database('Failed to fetch course', { courseId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: CourseInsert) {
    try {
      const result = await this.db.insert<any>('courses', courseData as Record<string, unknown>);
      
      if (result.error) throw result.error;
      return result.data as CourseRecord;
    } catch (error) {
      console.error('Error creating course:', error);
      throw AppErrors.database('Failed to create course', { courseData }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string, updates: CourseUpdate) {
    try {
      const result = await this.db.update<any>('courses', courseId, {
        ...updates,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>);

      if (result.error) throw result.error;
      return result.data as CourseRecord;
    } catch (error) {
      console.error('Error updating course:', error);
      throw AppErrors.database('Failed to update course', { courseId, updates }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string) {
    try {
      const result = await this.db.delete('courses', courseId);
      
      if (result.error) throw result.error;
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw AppErrors.database('Failed to delete course', { courseId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Enroll user in course
   */
  async enrollCourse(courseId: string, userId: string): Promise<EnrollmentRecord> {
    try {
      // Check if already enrolled
      const existingResult = await this.db.list<any>('course_enrollments', {
        filters: { course_id: courseId, user_id: userId },
      });

      if (!existingResult.error && existingResult.data && existingResult.data.length > 0) {
        throw AppErrors.validation('User is already enrolled in this course', {
          context: { courseId, userId },
        });
      }

      const result = await this.db.insert<any>('course_enrollments', {
        course_id: courseId,
        user_id: userId,
        status: 'enrolled',
        progress_percentage: 0,
      } as Record<string, unknown>);

      if (result.error) throw result.error;
      return result.data as unknown as EnrollmentRecord;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      if (isAppError(error)) throw error;
      throw AppErrors.database('Failed to enroll in course', { courseId, userId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get user's enrollment for a course
   */
  async getEnrollment(courseId: string, userId: string): Promise<EnrollmentRecord | null> {
    try {
      const result = await this.db.list<any>('course_enrollments', {
        filters: { course_id: courseId, user_id: userId },
      });

      if (result.error || !result.data || result.data.length === 0) {
        return null;
      }
      
      return result.data[0] as unknown as EnrollmentRecord;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  }

  /**
   * Get all enrollments for a user
   */
  async getUserEnrollments(userId: string, status?: EnrollmentRecord['status']) {
    try {
      const filters: Record<string, unknown> = { user_id: userId };
      if (status) {
        filters.status = status;
      }

      const result = await this.db.list<any>('course_enrollments', {
        filters,
        pagination: { orderBy: 'enrolled_at', ascending: false },
      });

      if (result.error) throw result.error;
      return result.data as unknown as EnrollmentRecord[];
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      throw AppErrors.database('Failed to fetch user enrollments', { userId, status }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Mark lesson as completed and update progress
   */
  async completeLesson(lessonId: string, courseId: string, userId: string): Promise<boolean> {
    try {
      // 1. Mark lesson completed
      const completionResult = await this.db.query(
        `INSERT INTO lesson_completions (lesson_id, user_id, completed_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (lesson_id, user_id) DO NOTHING`,
        [lessonId, userId, new Date().toISOString()]
      );

      if (completionResult.error) {
        console.warn('Failed to insert lesson completion:', completionResult.error);
      }

      // 2. Count total lessons in course
      const modulesResult = await this.db.list<any>('course_modules', {
        filters: { course_id: courseId },
      });

      const moduleIds = (modulesResult.data || []).map((m: any) => m.id);

      if (moduleIds.length > 0) {
        const lessonsResult = await this.db.list<any>('course_lessons', {
          filters: { module_id: moduleIds },
        });

        const totalLessons = lessonsResult.data?.length || 0;

        if (totalLessons > 0) {
          const allLessons = lessonsResult.data || [];
          const allLessonIds = allLessons.map((l: any) => l.id);

          // Count completed lessons in this course
          const completionsResult = await this.db.list<any>('lesson_completions', {
            filters: { user_id: userId, lesson_id: allLessonIds },
          });

          const completedCount = completionsResult.data?.length || 0;
          const progress = Math.min(100, Math.round((completedCount / totalLessons) * 100));
          const isFullyCompleted = progress >= 100;

          const updateResult = await this.db.update('course_enrollments', userId, {
            progress_percentage: progress,
            status: isFullyCompleted ? 'completed' : 'in_progress',
            completed_at: isFullyCompleted ? new Date().toISOString() : null,
          }, { course_id: courseId });

          if (updateResult.error) {
            console.warn('Failed to update enrollment progress:', updateResult.error);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw AppErrors.database('Failed to complete lesson', { lessonId, courseId, userId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Drop out from a course
   */
  async dropCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.db.update('course_enrollments', userId, {
        status: 'dropped',
        completed_at: null,
      }, { course_id: courseId });

      if (result.error) throw result.error;
      return true;
    } catch (error) {
      console.error('Error dropping course:', error);
      throw AppErrors.database('Failed to drop course', { courseId, userId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get courses by instructor
   */
  async getInstructorCourses(instructorId: string, includeUnpublished = false) {
    try {
      const filters: Record<string, unknown> = { instructor_id: instructorId };
      if (!includeUnpublished) {
        filters.is_published = true;
      }

      const result = await this.db.list<any>('courses', {
        filters,
        pagination: { orderBy: 'created_at', ascending: false },
      });

      if (result.error) throw result.error;
      return result.data as unknown as CourseRecord[];
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      throw AppErrors.database('Failed to fetch instructor courses', { instructorId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get courses by organization
   */
  async getOrganizationCourses(organizationId: string, includeUnpublished = false) {
    try {
      const filters: Record<string, unknown> = { organization_id: organizationId };
      if (!includeUnpublished) {
        filters.is_published = true;
      }

      const result = await this.db.list<any>('courses', {
        filters,
        pagination: { orderBy: 'created_at', ascending: false },
      });

      if (result.error) throw result.error;
      return result.data as unknown as CourseRecord[];
    } catch (error) {
      console.error('Error fetching organization courses:', error);
      throw AppErrors.database('Failed to fetch organization courses', { organizationId }, error instanceof Error ? error : undefined);
    }
  }
}

// Backward compatibility export
// Async initialization helper for modern usage
export const initCourseService = async (): Promise<CourseService> => {
  const { createDatabaseAdapter } = await import('@/lib/database/adapter');
  const { getConfig } = await import('@/lib/config/validation');
  const config = getConfig();
  const db = createDatabaseAdapter({
    supabaseUrl: config.required.supabaseUrl,
    supabaseKey: config.required.supabaseAnonKey,
  });
  return new CourseService(db);
};

// Lazy-initialized service instance for backward compatibility
// Uses dynamic imports to avoid circular dependencies
let _cachedDb: Promise<DatabaseAdapter> | null = null;
const getDbAsync = async (): Promise<DatabaseAdapter> => {
  if (!_cachedDb) {
    const { createDatabaseAdapter } = await import('@/lib/database/adapter');
    const { getConfig } = await import('@/lib/config/validation');
    const config = getConfig();
    _cachedDb = Promise.resolve(createDatabaseAdapter({
      supabaseUrl: config.required.supabaseUrl,
      supabaseKey: config.required.supabaseAnonKey,
    }));
  }
  return _cachedDb;
};

// Initialize service asynchronously
let _courseServiceInstance: CourseService | null = null;
const initServiceSync = () => {
  if (!_courseServiceInstance) {
    try {
      // Try synchronous initialization for Node.js environments
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createDatabaseAdapter } = require('@/lib/database/adapter');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getConfig } = require('@/lib/config/validation');
      const config = getConfig();
      const db = createDatabaseAdapter({
        supabaseUrl: config.required.supabaseUrl,
        supabaseKey: config.required.supabaseAnonKey,
      });
      _courseServiceInstance = new CourseService(db);
    } catch (err) {
      // Fall back to async initialization
      console.warn('[CourseService] Synchronous initialization failed. Use initCourseService() for async usage.');
      throw err;
    }
  }
  return _courseServiceInstance;
};

export const courseService = initServiceSync();
