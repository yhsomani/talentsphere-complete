export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: 'text' | 'video' | 'interactive' | 'quiz';
  contentBody: string;
  durationMinutes: number;
  orderIndex: number;
  prerequisiteLessonId?: string | null;
  isFreePreview: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: CourseLesson[];
}
