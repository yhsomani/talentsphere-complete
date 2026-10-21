import { describe, expect, it } from 'vitest';
import {
  lockedReason,
  nextLesson,
  type CourseLesson,
  type CourseModule,
} from '../../apps/web/src/lib/course.js';

const lesson = (
  id: string,
  moduleId: string,
  orderIndex: number,
  over: Partial<CourseLesson> = {}
) =>
  ({
    id,
    moduleId,
    title: `Lesson ${id}`,
    contentType: 'text',
    contentBody: '',
    durationMinutes: 5,
    orderIndex,
    isFreePreview: false,
    ...over,
  }) as CourseLesson;

// Module 1: a, b (b needs a). Module 2: c. Listed out of order on purpose.
const modules: CourseModule[] = [
  { id: 'm2', title: 'Second', orderIndex: 1, lessons: [lesson('c', 'm2', 0)] },
  {
    id: 'm1',
    title: 'First',
    orderIndex: 0,
    lessons: [lesson('b', 'm1', 1, { prerequisiteLessonId: 'a' }), lesson('a', 'm1', 0)],
  },
];
const byId = (id: string) => modules.flatMap((m) => m.lessons).find((l) => l.id === id)!;

describe('lockedReason', () => {
  it('lets the first lesson of the first module start', () => {
    expect(lockedReason(modules, new Set(), byId('a'))).toBeNull();
  });

  it('locks a lesson until its direct prerequisite is done (BR-22)', () => {
    expect(lockedReason(modules, new Set(), byId('b'))).toBe('Finish “Lesson a” first.');
    expect(lockedReason(modules, new Set(['a']), byId('b'))).toBeNull();
  });

  it('locks a module until every lesson of the earlier modules is done (BR-47)', () => {
    expect(lockedReason(modules, new Set(['a']), byId('c'))).toBe('Finish “First” first.');
    expect(lockedReason(modules, new Set(['a', 'b']), byId('c'))).toBeNull();
  });

  it('does not lock anything when its module is unknown', () => {
    expect(lockedReason(modules, new Set(), lesson('x', 'missing', 0))).toBeNull();
  });

  it('names a generic lesson when the prerequisite is not in the course', () => {
    const orphan = lesson('o', 'm1', 5, { prerequisiteLessonId: 'gone' });
    expect(lockedReason(modules, new Set(), orphan)).toBe('Finish “the previous lesson” first.');
  });
});

describe('nextLesson', () => {
  it('walks the course in order, skipping finished and locked lessons', () => {
    expect(nextLesson(modules, new Set())?.id).toBe('a');
    expect(nextLesson(modules, new Set(['a']))?.id).toBe('b');
    expect(nextLesson(modules, new Set(['a', 'b']))?.id).toBe('c');
  });

  it('returns null when the course is finished', () => {
    expect(nextLesson(modules, new Set(['a', 'b', 'c']))).toBeNull();
  });
});
