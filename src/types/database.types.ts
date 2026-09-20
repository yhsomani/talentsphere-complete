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
          organization_id: string | null
          title: string
          slug: string
          description: string
          requirements: string[] | null
          responsibilities: string[] | null
          benefits: string[] | null
          job_type: string
          work_mode: string
          experience_level: string
          department: string | null
          location_city: string | null
          location_country: string | null
          location_remote: boolean | null
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          salary_period: string | null
          status: string
          application_deadline: string | null
          start_date: string | null
          positions_available: number | null
          positions_filled: number | null
          is_featured: boolean | null
          is_remote_worldwide: boolean | null
          visa_sponsorship: boolean | null
          relocation_assistance: boolean | null
          required_skills: string[] | null
          preferred_skills: string[] | null
          application_count: number | null
          view_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          organization_id?: string | null
          title: string
          slug: string
          description: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
          job_type: string
          work_mode: string
          experience_level: string
          department?: string | null
          location_city?: string | null
          location_country?: string | null
          location_remote?: boolean | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          salary_period?: string | null
          status?: string
          application_deadline?: string | null
          start_date?: string | null
          positions_available?: number | null
          positions_filled?: number | null
          is_featured?: boolean | null
          is_remote_worldwide?: boolean | null
          visa_sponsorship?: boolean | null
          relocation_assistance?: boolean | null
          required_skills?: string[] | null
          preferred_skills?: string[] | null
          application_count?: number | null
          view_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          organization_id?: string | null
          title?: string
          slug?: string
          description?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
          job_type?: string
          work_mode?: string
          experience_level?: string
          department?: string | null
          location_city?: string | null
          location_country?: string | null
          location_remote?: boolean | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          salary_period?: string | null
          status?: string
          application_deadline?: string | null
          start_date?: string | null
          positions_available?: number | null
          positions_filled?: number | null
          is_featured?: boolean | null
          is_remote_worldwide?: boolean | null
          visa_sponsorship?: boolean | null
          relocation_assistance?: boolean | null
          required_skills?: string[] | null
          preferred_skills?: string[] | null
          application_count?: number | null
          view_count?: number | null
          created_at?: string
          updated_at?: string
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
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link_url: string | null
          link_label: string | null
          is_read: boolean
          read_at: string | null
          channel: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          link_url?: string | null
          link_label?: string | null
          is_read?: boolean
          read_at?: string | null
          channel?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          link_url?: string | null
          link_label?: string | null
          is_read?: boolean
          read_at?: string | null
          channel?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          push_enabled: boolean
          in_app_enabled: boolean
          application_updates: boolean
          job_alerts: boolean
          messages: boolean
          system_announcements: boolean
          gamification_updates: boolean
          marketing_emails: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          push_enabled?: boolean
          in_app_enabled?: boolean
          application_updates?: boolean
          job_alerts?: boolean
          messages?: boolean
          system_announcements?: boolean
          gamification_updates?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          push_enabled?: boolean
          in_app_enabled?: boolean
          application_updates?: boolean
          job_alerts?: boolean
          messages?: boolean
          system_announcements?: boolean
          gamification_updates?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          type: string
          subject: string | null
          created_by: string
          created_at: string
          updated_at: string
          last_message_at: string | null
          is_archived: boolean
        }
        Insert: {
          id?: string
          type?: string
          subject?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
          is_archived?: boolean
        }
        Update: {
          id?: string
          type?: string
          subject?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
          is_archived?: boolean
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
          left_at: string | null
          last_read_at: string | null
          is_muted: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
          last_read_at?: string | null
          is_muted?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
          last_read_at?: string | null
          is_muted?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: string
          attachments: Json | null
          is_edited: boolean
          edited_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: string
          attachments?: Json | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: string
          attachments?: Json | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
      }
      leaderboard_entries: {
        Row: {
          id: string
          user_id: string
          period: string
          year: number
          week: number | null
          rank: number
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          period: string
          year: number
          week?: number | null
          rank: number
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          period?: string
          year?: number
          week?: number | null
          rank?: number
          score?: number
          created_at?: string
        }
      }
      user_levels: {
        Row: {
          id: string
          user_id: string
          current_level: number
          current_xp: number
          level_progress: number | null
          xp_to_next_level: number
          total_xp_earned: number
          last_level_up_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_level?: number
          current_xp?: number
          level_progress?: number | null
          xp_to_next_level: number
          total_xp_earned?: number
          last_level_up_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_level?: number
          current_xp?: number
          level_progress?: number | null
          xp_to_next_level?: number
          total_xp_earned?: number
          last_level_up_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      xp_ledger: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          source_type: string
          source_id: string | null
          description: string | null
          balance_after: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: string
          source_type: string
          source_id?: string | null
          description?: string | null
          balance_after: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: string
          source_type?: string
          source_id?: string | null
          description?: string | null
          balance_after?: number
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
