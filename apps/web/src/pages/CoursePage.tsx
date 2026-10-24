import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import type { CourseLesson, CourseModule } from '../lib/course.js';
import { safeHref } from '../lib/format.js';
import {
  Button,
  ButtonLink,
  Card,
  CardContent,
  LoadError,
  Notice,
  PageHeader,
} from '../components/ui/index.js';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  estimatedDurationMinutes: number;
  modules: CourseModule[];
}

interface Progress {
  enrolled: boolean;
  enrollment?: { progressPercent: number; status: string };
  completedLessonIds?: string[];
  nextLessonId?: string | null;
  /** lessonId -> why it cannot be completed yet (server-computed, BR-47 / BR-22). */
  locked?: Record<string, string>;
  certificate?: { certificateNumber: string; verificationProofHash: string };
}

/**
 * Lesson player (F-07): open a course, read its lessons in order, mark them complete and
 * see progress. The server decides what may be completed; the page only explains it first.
 */
export const CoursePage: React.FC = () => {
  const { id = '' } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  usePageMeta(course?.title ?? 'Course', 'Work through the lessons of this course.');

  const load = useCallback(async () => {
    setLoadError(null);
    setNotFound(false);
    try {
      const [detail, prog] = await Promise.all([
        apiJson<{ course: CourseDetail }>(`/api/v1/courses/${encodeURIComponent(id)}`),
        apiJson<Progress>(`/api/v1/courses/${encodeURIComponent(id)}/progress`),
      ]);
      setCourse(detail.course);
      setProgress(prog);
      setSelectedId(
        (current) =>
          current ?? prog.nextLessonId ?? detail.course.modules[0]?.lessons[0]?.id ?? null
      );
    } catch (err) {
      // A course that does not exist is a final answer; only a failed request is worth retrying.
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setLoadError(errorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    setSelectedId(null);
    void load();
  }, [load]);

  const refreshProgress = async () => {
    const prog = await apiJson<Progress>(`/api/v1/courses/${encodeURIComponent(id)}/progress`);
    setProgress(prog);
    return prog;
  };

  const enroll = async () => {
    if (busy || !course) return;
    setBusy(true);
    setActionError(null);
    try {
      await apiJson(`/api/v1/courses/${course.id}/enroll`, { method: 'POST' });
      await refreshProgress();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const complete = async (lesson: CourseLesson) => {
    if (busy || !course) return;
    setBusy(true);
    setActionError(null);
    try {
      await apiJson(`/api/v1/lessons/${lesson.id}/complete`, { method: 'POST' });
      const prog = await refreshProgress();
      if (prog.nextLessonId) setSelectedId(prog.nextLessonId);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <PageHeader title="Course not available" />
        <Notice tone="error" data-testid="course-notfound" style={{ marginBottom: spacing.md }}>
          This course does not exist or is no longer available.
        </Notice>
        <ButtonLink to="/learning" variant="outline">
          Back to courses
        </ButtonLink>
      </div>
    );
  }
  if (loadError) return <LoadError message={loadError} onRetry={() => void load()} />;
  if (!course || !progress) return <p role="status">Loading the course.</p>;

  const completed = new Set(progress.completedLessonIds ?? []);
  const lessons = course.modules.flatMap((m) => m.lessons);
  const selected = lessons.find((l) => l.id === selectedId) ?? null;
  const enrolled = progress.enrolled;
  const percent = Math.round(progress.enrollment?.progressPercent ?? 0);
  const locked = selected ? (progress.locked?.[selected.id] ?? null) : null;
  const canRead = enrolled || Boolean(selected?.isFreePreview);
  const videoLink = selected?.contentType === 'video' ? safeHref(selected.contentBody) : undefined;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }} data-testid="course-page">
      <p>
        <Link to="/learning">All courses</Link>
      </p>
      <PageHeader
        title={course.title}
        intro={`${course.description} (${course.level}, about ${course.estimatedDurationMinutes} minutes)`}
      />

      {actionError && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="course-error">
          {actionError}
        </Notice>
      )}

      {!enrolled ? (
        <Notice tone="info" style={{ marginBottom: spacing.md }}>
          Enroll to work through the lessons and track your progress.{' '}
          <Button loading={busy} onClick={() => void enroll()} data-testid="course-enroll">
            Enroll
          </Button>
        </Notice>
      ) : (
        <div style={{ marginBottom: spacing.lg }}>
          <p data-testid="course-progress">
            {completed.size} of {lessons.length} lessons complete ({percent}%)
          </p>
          <div
            role="progressbar"
            aria-label="Course progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            style={{ height: '8px', background: colors.neutral[200], borderRadius: '4px' }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: colors.primary[700],
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      )}

      {progress.certificate && (
        <Notice tone="success" style={{ marginBottom: spacing.md }} data-testid="course-complete">
          Course complete. Certificate {progress.certificate.certificateNumber}.{' '}
          <Link
            to={`/verify/${progress.certificate.verificationProofHash}`}
            data-testid="course-certificate-link"
          >
            Verification link
          </Link>
        </Notice>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: spacing.lg,
          alignItems: 'start',
        }}
      >
        <nav aria-label="Course outline">
          {course.modules.map((m) => (
            <section key={m.id} style={{ marginBottom: spacing.md }}>
              <h2 style={{ fontSize: '1rem' }}>{m.title}</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {m.lessons.map((l) => {
                  const done = completed.has(l.id);
                  const lock = enrolled ? (progress.locked?.[l.id] ?? null) : null;
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        data-testid="lesson-item"
                        aria-current={l.id === selectedId ? 'true' : undefined}
                        onClick={() => setSelectedId(l.id)}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          display: 'block',
                          width: '100%',
                          padding: `${spacing.xs} 0`,
                          fontWeight: l.id === selectedId ? 700 : 400,
                        }}
                      >
                        {l.title}{' '}
                        <span style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                          {done ? '· Done' : lock ? '· Locked' : ''}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        <Card>
          <CardContent style={{ padding: spacing.lg }}>
            {!selected && <p>This course has no lessons yet.</p>}
            {selected && (
              <>
                <h2 style={{ fontSize: '1.25rem' }} data-testid="lesson-title">
                  {selected.title}
                </h2>
                <p style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                  {selected.contentType}, about {selected.durationMinutes} minutes
                </p>
                {canRead ? (
                  <div
                    style={{ whiteSpace: 'pre-wrap', margin: `${spacing.md} 0` }}
                    data-testid="lesson-body"
                  >
                    {selected.contentBody}
                  </div>
                ) : (
                  <p data-testid="lesson-gated">Enroll to read this lesson.</p>
                )}
                {videoLink && (
                  <p>
                    <a href={videoLink} target="_blank" rel="noopener noreferrer">
                      Watch the video (opens in a new tab)
                    </a>
                  </p>
                )}
                {enrolled && selected.contentType === 'quiz' && (
                  <Notice tone="info" style={{ marginBottom: spacing.md }}>
                    Quiz grading is not available yet. Marking this complete records it as done.
                  </Notice>
                )}
                {enrolled && locked && (
                  <Notice
                    tone="warning"
                    style={{ marginBottom: spacing.md }}
                    data-testid="lesson-locked"
                  >
                    {locked}
                  </Notice>
                )}
                {enrolled && completed.has(selected.id) && (
                  <p data-testid="lesson-done">You completed this lesson.</p>
                )}
                {enrolled && !completed.has(selected.id) && (
                  <Button
                    loading={busy}
                    disabled={Boolean(locked)}
                    onClick={() => void complete(selected)}
                    data-testid="lesson-complete"
                  >
                    Mark lesson complete
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
