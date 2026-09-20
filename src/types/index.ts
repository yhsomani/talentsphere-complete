/**
 * TalentSphere Type Definitions
 * 
 * Based on TalentSphere Project & Product Specification
 * Core domain types for the Unified Talent Operating System
 */

// ============================================================================
// USER & ROLE TYPES
// ============================================================================

export type UserRole = 
  | 'candidate'
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'
  | 'admin'
  | 'institution_admin'
  | 'institution_instructor'
  | 'institution_student'
  | 'provider'
  | 'mentor'
  | 'coach';

export interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_active_at?: string;
}

export interface CandidateProfile {
  id?: string;
  user_id: string;
  headline?: string;
  bio?: string;
  summary?: string;
  location?: string;
  avatar_url?: string;
  timezone?: string;
  availability_status: 'available' | 'employed' | 'open_to_work' | 'not_interested';
  xp_points: number;
  level: number;
  badges: Badge[];
  skills: SkillMatch[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  portfolio_items: PortfolioItem[];
  resume_url?: string;
  visibility: 'public' | 'connections' | 'private';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SKILL & VERIFICATION TYPES
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  parent_skill_id?: string;
  is_verified: boolean;
  created_at: string;
}

export interface SkillMatch {
  id: string;
  skill_id: string;
  skill: Skill;
  name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verification_source: 'course_completion' | 'challenge' | 'assessment' | 'work_sample' | 'peer_endorsement';
  verified_at: string;
  expires_at?: string;
  evidence_urls: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: 'skill' | 'achievement' | 'milestone' | 'event';
  earned_at: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// EXPERIENCE & EDUCATION TYPES
// ============================================================================

export interface Experience {
  id: string;
  candidate_id: string;
  company_name: string;
  job_title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  skills_used: string[];
  verified: boolean;
  verified_by?: string;
  created_at: string;
}

export interface Education {
  id: string;
  candidate_id: string;
  institution_name: string;
  degree?: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  activities?: string[];
  created_at: string;
}

export interface Certification {
  id: string;
  candidate_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  skills: string[];
  created_at: string;
}

// ============================================================================
// PORTFOLIO TYPES
// ============================================================================

export interface PortfolioItem {
  id: string;
  candidate_id: string;
  title: string;
  description: string;
  project_type: 'personal' | 'academic' | 'professional' | 'open_source' | 'freelance';
  url?: string;
  repository_url?: string;
  demo_url?: string;
  media_urls: string[];
  skills_demonstrated: string[];
  started_at: string;
  completed_at?: string;
  is_featured: boolean;
  visibility: 'public' | 'private' | 'connections';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// JOB & OPPORTUNITY TYPES
// ============================================================================

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'apprenticeship';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'filled';

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  responsibilities?: string[];
  requirements: string[];
  nice_to_have: string[];
  required_skills: string[];
  preferred_skills: string[];
  application_count?: number;
  job_type: JobType;
  work_mode: WorkMode;
  location?: string;
  location_city?: string | null;
  location_country?: string | null;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  salary_period: 'hourly' | 'monthly' | 'yearly';
  status: JobStatus;
  openings: number;
  application_deadline?: string;
  start_date?: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department?: string;
  reports_to?: string;
  benefits: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  headquarters?: string;
  founded_year?: number;
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  culture_values: string[];
  benefits: string[];
  hiring_process_description?: string;
  response_rate?: number;
  avg_response_time_hours?: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export type ApplicationStatus = 
  | 'submitted'
  | 'screening'
  | 'under_review'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_declined'
  | 'rejected'
  | 'withdrawn'
  | 'on_hold';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  submitted_at: string;
  updated_at: string;
  cover_letter?: string;
  resume_snapshot: unknown;
  profile_snapshot: unknown;
  source: 'direct' | 'referral' | 'platform_suggestion';
  referral_user_id?: string;
  assigned_recruiter_id?: string;
  current_stage_id?: string;
  score?: number;
  notes?: string;
  tags: string[];
}

export interface HiringPipelineStage {
  id: string;
  job_id: string;
  name: string;
  order: number;
  type: 'screening' | 'assessment' | 'interview' | 'offer' | 'decision';
  instructions?: string;
  required_scorecards: boolean;
  auto_advance: boolean;
  sla_hours?: number;
}

export interface Scorecard {
  id: string;
  application_id: string;
  stage_id: string;
  evaluator_id: string;
  ratings: ScorecardRating[];
  overall_recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
  comments?: string;
  submitted_at: string;
}

export interface ScorecardRating {
  criterion: string;
  score: 1 | 2 | 3 | 4 | 5;
  comments?: string;
}

// ============================================================================
// LEARNING & COURSE TYPES
// ============================================================================

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'video' | 'article' | 'quiz' | 'assignment' | 'project' | 'live_session';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'expired';

export interface Course {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  level: CourseLevel;
  estimated_hours: number;
  skills_taught: string[];
  prerequisites: string[];
  learning_objectives: string[];
  modules: CourseModule[];
  price?: number;
  currency: string;
  is_published: boolean;
  rating_average?: number;
  rating_count: number;
  enrollment_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  estimated_hours: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: ContentType;
  content_url: string;
  duration_seconds?: number;
  order: number;
  is_preview: boolean;
  quiz?: Quiz;
  assignment?: Assignment;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  questions: QuizQuestion[];
  passing_score: number;
  max_attempts: number;
  time_limit_seconds?: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'code';
  text: string;
  options?: string[];
  correct_answer: unknown;
  points: number;
}

export interface Assignment {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  deliverables: string[];
  rubric: RubricCriterion[];
  due_date?: string;
  max_points: number;
}

export interface RubricCriterion {
  criterion: string;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string;
  points: number;
  description: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  current_lesson_id?: string;
  started_at: string;
  completed_at?: string;
  expires_at?: string;
  certificate_issued: boolean;
  final_score?: number;
}

// ============================================================================
// ASSESSMENT & CHALLENGE TYPES
// ============================================================================

export type ChallengeType = 'coding' | 'multiple_choice' | 'practical' | 'case_study' | 'portfolio_review';
export type ChallengeStatus = 'draft' | 'published' | 'active' | 'completed' | 'archived';
export type SubmissionStatus = 'submitted' | 'graded' | 'reviewed' | 'appealed';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  skills_assessed: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimated_minutes: number;
  max_score: number;
  passing_score: number;
  time_limit_seconds?: number;
  attempts_allowed: number;
  instructions: string;
  starter_code?: string;
  test_cases: TestCase[];
  status: ChallengeStatus;
  author_id: string;
  xp_reward: number;
  badge_id?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  points: number;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  solution: string;
  language?: string;
  status: SubmissionStatus;
  score: number;
  feedback?: string;
  test_results: TestResult[];
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
}

export interface TestResult {
  test_case_id: string;
  passed: boolean;
  actual_output?: string;
  execution_time_ms?: number;
  memory_used_kb?: number;
  error_message?: string;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: 'course_completion' | 'challenge_pass' | 'job_application' | 'profile_complete' | 'referral' | 'daily_login' | 'community_contribution';
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user: User;
  total_xp: number;
  rank: number;
  period: 'all_time' | 'monthly' | 'weekly';
  badges_earned: number;
  challenges_completed: number;
  courses_completed: number;
  jobs_applied: number;
  jobs_received: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'application_update'
  | 'new_message'
  | 'challenge_result'
  | 'course_reminder'
  | 'assignment_due'
  | 'badge_earned'
  | 'xp_milestone'
  | 'job_match'
  | 'interview_request'
  | 'system_announcement';

export type NotificationChannel = 'in_app' | 'email' | 'push';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: unknown;
  action_url?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  is_read: boolean;
  read_at?: string;
  sent_at?: string;
  created_at: string;
}

export interface NotificationPreference {
  user_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  updated_at: string;
}

// ============================================================================
// MESSAGE & COMMUNICATION TYPES
// ============================================================================

export interface Conversation {
  id: string;
  participants: string[];
  subject?: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count: Record<string, number>;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments: MessageAttachment[];
  is_read: boolean;
  read_at?: string;
  sent_at: string;
  delivered_at?: string;
}

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  uploaded_at: string;
}

// ============================================================================
// INSTITUTION & B2B TYPES
// ============================================================================

export interface Institution {
  id: string;
  name: string;
  type: 'university' | 'college' | 'bootcamp' | 'corporate';
  website?: string;
  logo_url?: string;
  description?: string;
  admin_user_ids: string[];
  instructor_user_ids: string[];
  student_count: number;
  active_licenses: License[];
  created_at: string;
  updated_at: string;
}

export interface License {
  id: string;
  institution_id: string;
  license_type: 'seat_based' | 'course_based' | 'enterprise';
  total_seats: number;
  used_seats: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  auto_renew: boolean;
  features: string[];
  created_at: string;
}

export interface Cohort {
  id: string;
  institution_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  student_user_ids: string[];
  assigned_course_ids: string[];
  instructor_user_ids: string[];
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  outcomes: CohortOutcomes;
  created_at: string;
}

export interface CohortOutcomes {
  enrollment_count: number;
  completion_count: number;
  placement_count: number;
  average_score: number;
  satisfaction_score?: number;
}

// ============================================================================
// ANALYTICS & REPORTING TYPES
// ============================================================================

export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  properties: Record<string, unknown>;
  context: {
    page?: string;
    referrer?: string;
    user_agent?: string;
    ip_address?: string;
  };
}

export interface DashboardMetric {
  metric_name: string;
  value: number;
  change_from_previous: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  last_updated: string;
}

// ============================================================================
// SYSTEM & AUDIT TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_role: UserRole;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SystemConfig {
  key: string;
  value: unknown;
  description?: string;
  is_public: boolean;
  updated_by: string;
  updated_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  field_errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// PAGINATION & FILTERING TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  per_page: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'contains';
  value: unknown;
}

// ============================================================================
// JOB LISTING & FILTERS (for job board)
// ============================================================================

export interface JobListing extends Job {
  organization?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
    description?: string;
    website?: string;
    size?: string;
  };
  posted_by?: {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar_url?: string;
  };
  skills?: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
  applications_count?: number;
  application_count?: number;
  is_bookmarked?: boolean;
  is_featured?: boolean;
}

export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: JobType;
  workLocation?: WorkMode;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  postedWithin?: '24h' | '7d' | '30d' | '90d';
  organizationId?: string;
  status?: JobStatus;
}

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type WorkLocation = WorkMode;
