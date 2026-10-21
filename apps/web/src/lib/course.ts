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

const inOrder = (modules: CourseModule[]) =>
  [...modules].sort((a, b) => a.orderIndex - b.orderIndex);

/**
 * Why a lesson cannot be completed yet, or null when it can. Mirrors the server's rules
 * (BR-47 sequential modules, BR-22 direct prerequisite) so the page can say so up front;
 * the server stays the authority and rejects an out-of-order completion either way.
 */
export function lockedReason(
  modules: CourseModule[],
  completed: ReadonlySet<string>,
  lesson: CourseLesson
): string | null {
  const ordered = inOrder(modules);
  const own = ordered.find((m) => m.id === lesson.moduleId);
  if (!own) return null;
  for (const m of ordered) {
    if (m.orderIndex >= own.orderIndex) break;
    if (!m.lessons.every((l) => completed.has(l.id))) return `Finish “${m.title}” first.`;
  }
  if (lesson.prerequisiteLessonId && !completed.has(lesson.prerequisiteLessonId)) {
    const prerequisite = ordered
      .flatMap((m) => m.lessons)
      .find((l) => l.id === lesson.prerequisiteLessonId);
    return `Finish “${prerequisite?.title ?? 'the previous lesson'}” first.`;
  }
  return null;
}

/** The first lesson, in course order, that is not done and not locked: where to continue. */
export function nextLesson(
  modules: CourseModule[],
  completed: ReadonlySet<string>
): CourseLesson | null {
  for (const m of inOrder(modules)) {
    for (const l of [...m.lessons].sort((a, b) => a.orderIndex - b.orderIndex)) {
      if (!completed.has(l.id) && lockedReason(modules, completed, l) === null) return l;
    }
  }
  return null;
}
