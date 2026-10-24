import { describe, expect, it } from 'vitest';
import {
  computeCourseLockState,
  type CourseModule,
  type Lesson,
} from '../../packages/domain/src/index.js';

const lesson = (id: string, moduleId: string, orderIndex: number, over: Partial<Lesson> = {}) =>
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
  }) as Lesson;

const mod = (id: string, title: string, orderIndex: number) =>
  ({ id, courseId: 'c', title, orderIndex }) as CourseModule;

// Module 1: a, b (b needs a). Module 2: c. Listed out of order on purpose.
const modules = [mod('m2', 'Second', 1), mod('m1', 'First', 0)];
const lessons = [
  lesson('c', 'm2', 0),
  lesson('b', 'm1', 1, { prerequisiteLessonId: 'a' }),
  lesson('a', 'm1', 0),
];
const state = (done: string[], l = lessons, m = modules) =>
  computeCourseLockState(m, l, new Set(done));

describe('computeCourseLockState locked map', () => {
  it('lets the first lesson of the first module start', () => {
    expect(state([]).locked.a).toBeUndefined();
  });

  it('locks a lesson until its direct prerequisite is done (BR-22)', () => {
    expect(state([]).locked.b).toBe('Finish “Lesson a” first.');
    expect(state(['a']).locked.b).toBeUndefined();
  });

  it('locks a module until every lesson of the earlier modules is done (BR-47)', () => {
    expect(state(['a']).locked.c).toBe('Finish “First” first.');
    expect(state(['a', 'b']).locked.c).toBeUndefined();
  });

  it('does not lock a lesson whose module is unknown', () => {
    expect(state([], [lesson('x', 'missing', 0)]).locked.x).toBeUndefined();
  });

  it('names a generic lesson when the prerequisite is not in the course', () => {
    const orphan = lesson('o', 'm1', 5, { prerequisiteLessonId: 'gone' });
    expect(state([], [...lessons, orphan]).locked.o).toBe('Finish “the previous lesson” first.');
  });
});

describe('computeCourseLockState nextLessonId', () => {
  it('walks the course in order, skipping finished and locked lessons', () => {
    expect(state([]).nextLessonId).toBe('a');
    expect(state(['a']).nextLessonId).toBe('b');
    expect(state(['a', 'b']).nextLessonId).toBe('c');
  });

  it('is null when the course is finished', () => {
    expect(state(['a', 'b', 'c']).nextLessonId).toBeNull();
  });
});
