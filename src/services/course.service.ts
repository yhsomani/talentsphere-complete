import { createBrowserClient } from '@/lib/supabase';

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

const supabase = createBrowserClient();

export const courseService = {
  /**
   * Get all published courses with optional filtering
   */
  async getCourses(filters: { category?: string; level?: string; search?: string } = {}): Promise<CourseRecord[]> {
    try {
      let query = supabase
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
      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((c: any) => {
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
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  /**
   * Get single course with full modules and lessons
   */
  async getCourseById(courseId: string, userId?: string): Promise<CourseRecord | null> {
    try {
      // 1. Fetch course details
      const { data: course, error } = await supabase
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

      if (error || !course) return null;

      // 2. Fetch modules
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      const moduleIds = (modulesData || []).map(m => m.id);

      // 3. Fetch lessons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lessonsData: any[] = [];
      if (moduleIds.length > 0) {
        const { data: lessons } = await supabase
          .from('course_lessons')
          .select('*')
          .in('module_id', moduleIds)
          .order('order_index', { ascending: true });
        lessonsData = lessons || [];
      }

      // 4. Fetch completed lesson IDs if user is signed in
      const completedSet = new Set<string>();
      if (userId) {
        const { data: completions } = await supabase
          .from('lesson_completions')
          .select('lesson_id')
          .eq('user_id', userId);
        (completions || []).forEach(c => completedSet.add(c.lesson_id));
      }

      const formattedModules: CourseModuleRecord[] = (modulesData || []).map(m => ({
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
      console.error('Error fetching course by id:', error);
      return null;
    }
  },

  /**
   * Enroll user in course
   */
  async enrollCourse(courseId: string, userId: string): Promise<EnrollmentRecord> {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: userId,
          status: 'enrolled',
          progress_percentage: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as EnrollmentRecord;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  /**
   * Get user's enrollment for a course
   */
  async getEnrollment(courseId: string, userId: string): Promise<EnrollmentRecord | null> {
    try {
      const { data, error } = await supabase
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
  },

  /**
   * Mark lesson as completed and update progress
   */
  async completeLesson(lessonId: string, courseId: string, userId: string): Promise<boolean> {
    try {
      // 1. Mark lesson completed
      await supabase
        .from('lesson_completions')
        .upsert(
          { lesson_id: lessonId, user_id: userId },
          { onConflict: 'lesson_id,user_id' }
        );

      // 2. Count total lessons in course
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);
      
      const moduleIds = (modules || []).map(m => m.id);

      if (moduleIds.length > 0) {
        const { count: totalLessons } = await supabase
          .from('course_lessons')
          .select('id', { count: 'exact', head: true })
          .in('module_id', moduleIds);

        // Count completed lessons in this course
        const { data: allLessons } = await supabase
          .from('course_lessons')
          .select('id')
          .in('module_id', moduleIds);
        
        const allLessonIds = (allLessons || []).map(l => l.id);

        const { count: completedCount } = await supabase
          .from('lesson_completions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .in('lesson_id', allLessonIds);

        const progress = totalLessons && totalLessons > 0
          ? Math.min(100, Math.round(((completedCount || 0) / totalLessons) * 100))
          : 100;

        const isFullyCompleted = progress >= 100;

        await supabase
          .from('course_enrollments')
          .update({
            progress_percentage: progress,
            status: isFullyCompleted ? 'completed' : 'in_progress',
            completed_at: isFullyCompleted ? new Date().toISOString() : null,
          })
          .eq('course_id', courseId)
          .eq('user_id', userId);
      }

      return true;
    } catch (error) {
      console.error('Error completing lesson:', error);
      return false;
    }
  },
};
