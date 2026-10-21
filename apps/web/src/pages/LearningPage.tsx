import React, { useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import {
  Button,
  Card,
  CardContent,
  Input,
  Notice,
  PageHeader,
  Select,
} from '../components/ui/index.js';

type Level = 'beginner' | 'intermediate' | 'advanced';

interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: Level;
  estimatedDurationMinutes: number;
  moduleCount: number;
  lessonCount: number;
}

const LEVEL_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const LearningPage: React.FC = () => {
  usePageMeta('Learning', 'Browse courses and start one when you are ready.');
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadError(null);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (level) params.set('level', level);
    const query = params.toString();
    apiJson<{ courses: CourseSummary[] }>(`/api/v1/courses${query ? `?${query}` : ''}`)
      .then(({ courses: list }) => {
        if (active) setCourses(list);
      })
      .catch((err) => {
        if (active) setLoadError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [search, level]);

  const enroll = async (course: CourseSummary) => {
    if (enrolling) return;
    setActionError(null);
    setNotice(null);
    setEnrolling(course.id);
    try {
      await apiJson(`/api/v1/courses/${course.id}/enroll`, { method: 'POST' });
      setNotice(`You are enrolled in "${course.title}".`);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div>
      <PageHeader title="Learning" intro="Courses that build the skills employers ask for." />
      {/* shortcut: this module keeps data in server memory, a restart clears it, upgrade when moved to durable storage */}
      <Notice tone="info" style={{ marginBottom: spacing.lg }} data-testid="ephemeral-notice">
        This page is not saved permanently yet. A server restart clears your enrolments.
      </Notice>

      <Card style={{ marginBottom: spacing.lg }}>
        <CardContent style={{ padding: spacing.lg }}>
          <Input
            id="learning-search"
            label="Search courses"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="learning-search"
          />
          <Select
            id="learning-level"
            label="Level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={LEVEL_OPTIONS}
            data-testid="learning-level"
          />
        </CardContent>
      </Card>

      {actionError && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="learning-error">
          {actionError}
        </Notice>
      )}
      {notice && (
        <Notice tone="success" style={{ marginBottom: spacing.md }} data-testid="learning-notice">
          {notice}
        </Notice>
      )}
      {loadError && (
        <Notice tone="error" style={{ marginBottom: spacing.md }}>
          {loadError}
        </Notice>
      )}
      {!loadError && courses === null && <p role="status">Loading courses.</p>}
      {courses?.length === 0 && (
        <p style={{ color: colors.neutral[700] }} data-testid="learning-empty">
          No courses match these filters.
        </p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="learning-list">
        {courses?.map((course) => (
          <li
            key={course.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: spacing.md,
              alignItems: 'center',
              padding: `${spacing.lg} 0`,
              borderTop: `1px solid ${colors.neutral[300]}`,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h2 className="serif-display" style={{ fontSize: '1.375rem' }}>
                {course.title}
              </h2>
              <p style={{ marginTop: spacing.xs }}>{course.description}</p>
              <p
                style={{
                  marginTop: spacing.xs,
                  color: colors.neutral[700],
                  fontSize: '0.875rem',
                }}
              >
                {course.level}, {course.moduleCount} modules, {course.lessonCount} lessons, about{' '}
                {course.estimatedDurationMinutes} minutes
              </p>
            </div>
            <Button
              loading={enrolling === course.id}
              onClick={() => void enroll(course)}
              data-testid="learning-enroll"
            >
              Enroll
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
