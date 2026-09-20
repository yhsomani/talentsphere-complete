import { createBrowserClient } from '@/lib/supabase';

export interface SubmitApplicationInput {
  jobId: string;
  candidateProfileId: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrls?: string[];
  answersToQuestions?: Record<string, unknown>;
  referralSource?: string;
}

export interface ApplicationRecord {
  id: string;
  job_id: string;
  candidate_profile_id: string;
  status: 'submitted' | 'screening' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_extended' | 'offer_accepted' | 'offer_declined' | 'rejected' | 'withdrawn';
  cover_letter: string | null;
  resume_url: string | null;
  portfolio_urls: string[] | null;
  answers_to_questions: Record<string, unknown> | null;
  referral_source: string | null;
  current_stage_id: string | null;
  applied_at: string;
  updated_at: string;
  reviewed_at: string | null;
  decision_at: string | null;
  jobs?: {
    id: string;
    title: string;
    slug: string;
    job_type: string;
    work_mode: string;
    location_city: string | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    salary_period: string | null;
    status: string;
    organizations?: {
      id: string;
      name: string;
      logo_url: string | null;
      industry: string | null;
    } | null;
  } | null;
  candidate_profiles?: {
    id: string;
    headline: string | null;
    summary: string | null;
    location_city: string | null;
    users?: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  } | null;
  hiring_pipeline_stages?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface ScorecardRecord {
  id: string;
  application_id: string;
  interviewer_id: string;
  stage_id: string | null;
  overall_decision: 'strong_yes' | 'yes' | 'no' | 'strong_no';
  overall_score: number | null;
  technical_score: number | null;
  communication_score: number | null;
  culture_fit_score: number | null;
  problem_solving_score: number | null;
  leadership_score: number | null;
  comments: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  would_rehire: boolean | null;
  submitted_at: string;
  users?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

export interface CreateScorecardInput {
  applicationId: string;
  interviewerId: string;
  stageId?: string | null;
  overallDecision: 'strong_yes' | 'yes' | 'no' | 'strong_no';
  overallScore: number;
  technicalScore?: number | null;
  communicationScore?: number | null;
  cultureFitScore?: number | null;
  problemSolvingScore?: number | null;
  leadershipScore?: number | null;
  comments?: string;
  strengths?: string[];
  weaknesses?: string[];
  wouldRehire?: boolean;
}

const supabase = createBrowserClient();

export const applicationService = {
  /**
   * Submit a new job application
   */
  async submitApplication(input: SubmitApplicationInput): Promise<ApplicationRecord> {
    try {
      // 1. Insert application
      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_id: input.jobId,
          candidate_profile_id: input.candidateProfileId,
          cover_letter: input.coverLetter || null,
          resume_url: input.resumeUrl || null,
          portfolio_urls: input.portfolioUrls || [],
          answers_to_questions: input.answersToQuestions || {},
          referral_source: input.referralSource || null,
          status: 'submitted',
        })
        .select(`
          *,
          jobs (
            id,
            title,
            slug,
            job_type,
            work_mode,
            location_city,
            salary_min,
            salary_max,
            salary_currency,
            salary_period,
            status,
            organizations (
              id,
              name,
              logo_url,
              industry
            )
          )
        `)
        .single();

      if (error) throw error;

      // 2. Log activity entry
      try {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from('application_activity_log').insert({
          application_id: data.id,
          actor_id: userData?.user?.id || null,
          action: 'application_submitted',
          new_value: { status: 'submitted' },
          metadata: { timestamp: new Date().toISOString() },
        });
      } catch (logErr) {
        console.warn('Non-blocking activity log failed:', logErr);
      }

      return data as unknown as ApplicationRecord;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  /**
   * Check if candidate has already applied to a specific job
   */
  async checkHasApplied(jobId: string, candidateProfileId: string): Promise<ApplicationRecord | null> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          candidate_profile_id,
          status,
          applied_at,
          current_stage_id,
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `)
        .eq('job_id', jobId)
        .eq('candidate_profile_id', candidateProfileId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as ApplicationRecord | null;
    } catch (error) {
      console.error('Error checking application status:', error);
      return null;
    }
  },

  /**
   * Get all applications submitted by a candidate profile
   */
  async getCandidateApplications(candidateProfileId: string): Promise<ApplicationRecord[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            slug,
            job_type,
            work_mode,
            location_city,
            salary_min,
            salary_max,
            salary_currency,
            salary_period,
            status,
            organizations (
              id,
              name,
              logo_url,
              industry
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `)
        .eq('candidate_profile_id', candidateProfileId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ApplicationRecord[];
    } catch (error) {
      console.error('Error fetching candidate applications:', error);
      throw error;
    }
  },

  /**
   * Get single application details with activity log
   */
  async getApplicationById(applicationId: string): Promise<{
    application: ApplicationRecord;
    activityLog: Array<{ id: string; action: string; created_at: string; previous_value?: unknown; new_value?: unknown }>;
  }> {
    try {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            slug,
            description,
            requirements,
            responsibilities,
            benefits,
            job_type,
            work_mode,
            experience_level,
            location_city,
            salary_min,
            salary_max,
            salary_currency,
            salary_period,
            status,
            organizations (
              id,
              name,
              logo_url,
              industry,
              description,
              website
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type,
            description
          )
        `)
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      const { data: activityLog } = await supabase
        .from('application_activity_log')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      return {
        application: application as unknown as ApplicationRecord,
        activityLog: activityLog || [],
      };
    } catch (error) {
      console.error('Error fetching application by id:', error);
      throw error;
    }
  },

  /**
   * Withdraw an application
   */
  async withdrawApplication(applicationId: string, candidateProfileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'withdrawn',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('candidate_profile_id', candidateProfileId);

      if (error) throw error;

      // Activity log
      try {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from('application_activity_log').insert({
          application_id: applicationId,
          actor_id: userData?.user?.id || null,
          action: 'application_withdrawn',
          new_value: { status: 'withdrawn' },
        });
      } catch {
        // Non-blocking
      }

      return true;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  },

  /**
   * Get applications for a job (Recruiter view)
   */
  async getJobApplications(jobId: string): Promise<ApplicationRecord[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          candidate_profiles (
            id,
            headline,
            summary,
            location_city,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ApplicationRecord[];
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error;
    }
  },

  /**
   * Update application stage/status (Recruiter action)
   */
  async updateApplicationStage(applicationId: string, stageId: string | null, status: string, note?: string): Promise<boolean> {
    return this.updateApplicationStatus(applicationId, status as ApplicationRecord['status'], stageId, note);
  },

  /**
   * Update application status and stage with full activity logging
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationRecord['status'],
    stageId?: string | null,
    note?: string
  ): Promise<boolean> {
    try {
      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (stageId !== undefined) {
        updatePayload.current_stage_id = stageId;
      }

      if (['offer_extended', 'offer_accepted', 'offer_declined', 'rejected'].includes(status)) {
        updatePayload.decision_at = new Date().toISOString();
      }

      if (status !== 'submitted') {
        updatePayload.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', applicationId);

      if (error) throw error;

      try {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from('application_activity_log').insert({
          application_id: applicationId,
          actor_id: userData?.user?.id || null,
          action: `status_changed_to_${status}`,
          new_value: { status, stage_id: stageId || null, note: note || null },
          metadata: { timestamp: new Date().toISOString(), note: note || null },
        });
      } catch (logErr) {
        console.warn('Non-blocking activity log failed:', logErr);
      }

      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  /**
   * Fetch pipeline stages (default system stages + organization custom stages)
   */
  async getPipelineStages(organizationId?: string | null): Promise<Array<{
    id: string;
    organization_id: string | null;
    name: string;
    order_index: number;
    type: string;
    description: string | null;
    is_default: boolean;
  }>> {
    try {
      let query = supabase
        .from('hiring_pipeline_stages')
        .select('*')
        .order('order_index', { ascending: true });

      if (organizationId) {
        query = query.or(`organization_id.is.null,organization_id.eq.${organizationId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        organization_id: string | null;
        name: string;
        order_index: number;
        type: string;
        description: string | null;
        is_default: boolean;
      }>;
    } catch (error) {
      console.error('Error fetching pipeline stages:', error);
      return [];
    }
  },

  /**
   * Get all recruiter jobs and their incoming applications
   */
  async getRecruiterOverview(recruiterUserId: string, organizationId?: string | null): Promise<{
    jobs: Array<{
      id: string;
      title: string;
      department: string | null;
      location_city: string | null;
      work_mode: string;
      status: string;
      created_at: string;
      application_count: number;
    }>;
    recentApplications: ApplicationRecord[];
  }> {
    try {
      let jobsQuery = supabase
        .from('jobs')
        .select('id, title, department, location_city, work_mode, status, created_at, application_count')
        .order('created_at', { ascending: false });

      if (organizationId) {
        jobsQuery = jobsQuery.or(`employer_id.eq.${recruiterUserId},organization_id.eq.${organizationId}`);
      } else {
        jobsQuery = jobsQuery.eq('employer_id', recruiterUserId);
      }

      const { data: jobs, error: jobsError } = await jobsQuery;
      if (jobsError) throw jobsError;

      if (!jobs || jobs.length === 0) {
        return { jobs: [], recentApplications: [] };
      }

      const jobIds = jobs.map(j => j.id);

      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            slug,
            job_type,
            work_mode,
            location_city,
            status
          ),
          candidate_profiles (
            id,
            headline,
            summary,
            location_city,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          ),
          hiring_pipeline_stages (
            id,
            name,
            type
          )
        `)
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false })
        .limit(50);

      if (appsError) throw appsError;

      return {
        jobs: jobs || [],
        recentApplications: (apps || []) as unknown as ApplicationRecord[],
      };
    } catch (error) {
      console.error('Error fetching recruiter overview:', error);
      return { jobs: [], recentApplications: [] };
    }
  },

  /**
   * Get all scorecards submitted for an application
   */
  async getScorecards(applicationId: string): Promise<ScorecardRecord[]> {
    try {
      const { data, error } = await supabase
        .from('scorecards')
        .select(`
          *,
          users!interviewer_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('application_id', applicationId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ScorecardRecord[];
    } catch (err) {
      console.error('Error fetching scorecards:', err);
      return [];
    }
  },

  /**
   * Submit an interview scorecard evaluation
   */
  async createScorecard(input: CreateScorecardInput): Promise<ScorecardRecord | null> {
    try {
      const { data, error } = await supabase
        .from('scorecards')
        .insert({
          application_id: input.applicationId,
          interviewer_id: input.interviewerId,
          stage_id: input.stageId || null,
          overall_decision: input.overallDecision,
          overall_score: input.overallScore,
          technical_score: input.technicalScore ?? null,
          communication_score: input.communicationScore ?? null,
          culture_fit_score: input.cultureFitScore ?? null,
          problem_solving_score: input.problemSolvingScore ?? null,
          leadership_score: input.leadershipScore ?? null,
          comments: input.comments || null,
          strengths: input.strengths || [],
          weaknesses: input.weaknesses || [],
          would_rehire: input.wouldRehire ?? true,
        })
        .select(`
          *,
          users!interviewer_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data as unknown as ScorecardRecord;
    } catch (err) {
      console.error('Error creating scorecard:', err);
      throw err;
    }
  },
};
