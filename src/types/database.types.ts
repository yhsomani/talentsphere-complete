/**
 * Database Types - Generated from Supabase schema
 * These types match the database structure after migrations are applied
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          user_role: string
          first_name: string | null
          last_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          user_role: string
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_role?: string
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          employer_id: string
          title: string
          description: string
          requirements: string[]
          nice_to_have: string[]
          required_skills: string[]
          preferred_skills: string[]
          job_type: string
          work_location: string
          location: string | null
          salary_min: number | null
          salary_max: number | null
          currency: string
          salary_period: string
          status: string
          openings: number
          application_deadline: string | null
          start_date: string | null
          experience_level: string
          department: string | null
          reports_to: string | null
          benefits: string[]
          created_at: string
          updated_at: string
          published_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          description: string
          requirements?: string[]
          nice_to_have?: string[]
          required_skills?: string[]
          preferred_skills?: string[]
          job_type: string
          work_location: string
          location?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          salary_period?: string
          status?: string
          openings?: number
          application_deadline?: string | null
          start_date?: string | null
          experience_level: string
          department?: string | null
          reports_to?: string | null
          benefits?: string[]
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          employer_id?: string
          title?: string
          description?: string
          requirements?: string[]
          nice_to_have?: string[]
          required_skills?: string[]
          preferred_skills?: string[]
          job_type?: string
          work_location?: string
          location?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          salary_period?: string
          status?: string
          openings?: number
          application_deadline?: string | null
          start_date?: string | null
          experience_level?: string
          department?: string | null
          reports_to?: string | null
          benefits?: string[]
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
        }
      }
      candidate_profiles: {
        Row: {
          id: string
          user_id: string
          headline: string | null
          summary: string | null
          availability_status: string | null
          desired_salary_min: number | null
          desired_salary_max: number | null
          remote_preference: string | null
          relocation_willingness: string | null
          profile_visibility: string
          portfolio_url: string | null
          github_url: string | null
          linkedin_url: string | null
          website_url: string | null
          profile_completeness: number
          xp_points: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          headline?: string | null
          summary?: string | null
          availability_status?: string | null
          desired_salary_min?: number | null
          desired_salary_max?: number | null
          remote_preference?: string | null
          relocation_willingness?: string | null
          profile_visibility?: string
          portfolio_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          profile_completeness?: number
          xp_points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          headline?: string | null
          summary?: string | null
          availability_status?: string | null
          desired_salary_min?: number | null
          desired_salary_max?: number | null
          remote_preference?: string | null
          relocation_willingness?: string | null
          profile_visibility?: string
          portfolio_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          profile_completeness?: number
          xp_points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
