export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan?: string
        }
        Relationships: [
          {
            foreignKeyName: "agencies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_invitations: {
        Row: {
          agency_id: string
          case_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          permissions: string[]
          role: string
          status: string
        }
        Insert: {
          agency_id: string
          case_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          permissions?: string[]
          role: string
          status?: string
        }
        Update: {
          agency_id?: string
          case_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          permissions?: string[]
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_invitations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_invitations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_members: {
        Row: {
          active: boolean
          agency_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean
          agency_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          active?: boolean
          agency_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          id: string
          kind: string
          location: string | null
          notes: string | null
          scheduled_for: string
          status: string
          title: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          id?: string
          kind?: string
          location?: string | null
          notes?: string | null
          scheduled_for: string
          status?: string
          title: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          location?: string | null
          notes?: string | null
          scheduled_for?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          agency_id: string | null
          case_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          agency_id?: string | null
          case_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          agency_id?: string | null
          case_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_participants: {
        Row: {
          active: boolean
          case_id: string
          created_at: string
          id: string
          permissions: string[]
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean
          case_id: string
          created_at?: string
          id?: string
          permissions?: string[]
          role: string
          user_id: string
        }
        Update: {
          active?: boolean
          case_id?: string
          created_at?: string
          id?: string
          permissions?: string[]
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_participants_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_tasks: {
        Row: {
          assigned_to: string | null
          case_id: string
          created_at: string
          created_by: string
          due_date: string | null
          id: string
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          created_at?: string
          created_by: string
          due_date?: string | null
          id?: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          agency_id: string | null
          case_manager_id: string | null
          clinic_id: string | null
          counselor_id: string | null
          created_at: string
          due_date: string | null
          id: string
          journey_stage: string
          lawyer_id: string | null
          parent_id: string
          pregnancy_week: number | null
          reference: string
          status: Database["public"]["Enums"]["case_status"]
          surrogate_id: string | null
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          case_manager_id?: string | null
          clinic_id?: string | null
          counselor_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          journey_stage?: string
          lawyer_id?: string | null
          parent_id: string
          pregnancy_week?: number | null
          reference?: string
          status?: Database["public"]["Enums"]["case_status"]
          surrogate_id?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          case_manager_id?: string | null
          clinic_id?: string | null
          counselor_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          journey_stage?: string
          lawyer_id?: string | null
          parent_id?: string
          pregnancy_week?: number | null
          reference?: string
          status?: Database["public"]["Enums"]["case_status"]
          surrogate_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_case_manager_id_fkey"
            columns: ["case_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          case_id: string | null
          created_at: string
          id: string
          kind: string
          user_id: string
          version: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: string
          kind: string
          user_id: string
          version?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          category: string
          created_at: string
          expires_at: string | null
          file_url: string | null
          id: string
          name: string
          owner_id: string
          previous_version_id: string | null
          requires_signature: boolean
          signed_at: string | null
          signed_by: string[] | null
          storage_path: string | null
          updated_at: string
          version: number
          visibility_domain: string
        }
        Insert: {
          case_id?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          name: string
          owner_id: string
          previous_version_id?: string | null
          requires_signature?: boolean
          signed_at?: string | null
          signed_by?: string[] | null
          storage_path?: string | null
          updated_at?: string
          version?: number
          visibility_domain?: string
        }
        Update: {
          case_id?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          name?: string
          owner_id?: string
          previous_version_id?: string | null
          requires_signature?: boolean
          signed_at?: string | null
          signed_by?: string[] | null
          storage_path?: string | null
          updated_at?: string
          version?: number
          visibility_domain?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_accounts: {
        Row: {
          balance: number
          case_id: string
          created_at: string
          currency: string
          held: number
          id: string
          released: number
          updated_at: string
        }
        Insert: {
          balance?: number
          case_id: string
          created_at?: string
          currency?: string
          held?: number
          id?: string
          released?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          case_id?: string
          created_at?: string
          currency?: string
          held?: number
          id?: string
          released?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_transactions: {
        Row: {
          amount: number
          case_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["tx_type"]
          milestone_id: string | null
          receipt_number: string
          released_at: string | null
          status: Database["public"]["Enums"]["tx_status"]
        }
        Insert: {
          amount: number
          case_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["tx_type"]
          milestone_id?: string | null
          receipt_number?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
        }
        Update: {
          amount?: number
          case_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["tx_type"]
          milestone_id?: string | null
          receipt_number?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_items: {
        Row: {
          amount: number
          case_id: string
          category: string
          created_at: string
          created_by: string
          due_date: string | null
          external_reference: string | null
          id: string
          label: string
          status: string
        }
        Insert: {
          amount: number
          case_id: string
          category: string
          created_at?: string
          created_by: string
          due_date?: string | null
          external_reference?: string | null
          id?: string
          label: string
          status?: string
        }
        Update: {
          amount?: number
          case_id?: string
          category?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          external_reference?: string | null
          id?: string
          label?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          detail: string | null
          id: string
          resolution: string | null
          resolved_at: string | null
          responder_id: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          detail?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          responder_id?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          detail?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          responder_id?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          agency_id: string | null
          assessment_status: string
          case_id: string | null
          created_at: string
          id: string
          initiated_by: string | null
          parent_id: string
          professional_decision: string | null
          rationale: string | null
          score: number
          status: Database["public"]["Enums"]["match_status"]
          surrogate_id: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          assessment_status?: string
          case_id?: string | null
          created_at?: string
          id?: string
          initiated_by?: string | null
          parent_id: string
          professional_decision?: string | null
          rationale?: string | null
          score?: number
          status?: Database["public"]["Enums"]["match_status"]
          surrogate_id: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          assessment_status?: string
          case_id?: string | null
          created_at?: string
          id?: string
          initiated_by?: string | null
          parent_id?: string
          professional_decision?: string | null
          rationale?: string | null
          score?: number
          status?: Database["public"]["Enums"]["match_status"]
          surrogate_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          body: string
          case_id: string
          channel: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          body: string
          case_id: string
          channel?: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          body?: string
          case_id?: string
          channel?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string
          detail: string | null
          id: string
          label: string
          position: number
          status: Database["public"]["Enums"]["milestone_status"]
          updated_at: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          label: string
          position?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          label?: string
          position?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_profiles: {
        Row: {
          address: string | null
          budget: number | null
          clinic_name: string | null
          created_at: string
          embryos_ready: boolean | null
          emergency_contact: string | null
          marital_status: string | null
          medical_condition: string | null
          non_smoker_required: boolean | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          preferred_blood_group: string | null
          preferred_language: string | null
          preferred_location: string | null
          preferred_religion: string | null
          reason_for_surrogacy: string | null
          timeline: string | null
          travel_required: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          budget?: number | null
          clinic_name?: string | null
          created_at?: string
          embryos_ready?: boolean | null
          emergency_contact?: string | null
          marital_status?: string | null
          medical_condition?: string | null
          non_smoker_required?: boolean | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_blood_group?: string | null
          preferred_language?: string | null
          preferred_location?: string | null
          preferred_religion?: string | null
          reason_for_surrogacy?: string | null
          timeline?: string | null
          travel_required?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          budget?: number | null
          clinic_name?: string | null
          created_at?: string
          embryos_ready?: boolean | null
          emergency_contact?: string | null
          marital_status?: string | null
          medical_condition?: string | null
          non_smoker_required?: boolean | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_blood_group?: string | null
          preferred_language?: string | null
          preferred_location?: string | null
          preferred_religion?: string | null
          reason_for_surrogacy?: string | null
          timeline?: string | null
          travel_required?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pregnancy_updates: {
        Row: {
          author_id: string
          case_id: string
          created_at: string
          doctor_notes: string | null
          id: string
          lab_results_url: string | null
          stage: string
          summary: string | null
          ultrasound_url: string | null
          week: number | null
        }
        Insert: {
          author_id: string
          case_id: string
          created_at?: string
          doctor_notes?: string | null
          id?: string
          lab_results_url?: string | null
          stage: string
          summary?: string | null
          ultrasound_url?: string | null
          week?: number | null
        }
        Update: {
          author_id?: string
          case_id?: string
          created_at?: string
          doctor_notes?: string | null
          id?: string
          lab_results_url?: string | null
          stage?: string
          summary?: string | null
          ultrasound_url?: string | null
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pregnancy_updates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_credentials: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          kind: string
          reference: string | null
          status: string
          user_id: string
          verification_scope: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          kind: string
          reference?: string | null
          status?: string
          user_id: string
          verification_scope?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          reference?: string | null
          status?: string
          user_id?: string
          verification_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          email_verified: boolean
          full_name: string
          id: string
          id_verified: boolean
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          language: string | null
          onboarding_complete: boolean
          organisation: string | null
          phone: string | null
          phone_verified: boolean
          selfie_verified: boolean
          suspended: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean
          full_name?: string
          id: string
          id_verified?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          language?: string | null
          onboarding_complete?: boolean
          organisation?: string | null
          phone?: string | null
          phone_verified?: boolean
          selfie_verified?: boolean
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean
          full_name?: string
          id?: string
          id_verified?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          language?: string | null
          onboarding_complete?: boolean
          organisation?: string | null
          phone?: string | null
          phone_verified?: boolean
          selfie_verified?: boolean
          suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          author_id: string
          case_id: string | null
          comment: string | null
          created_at: string
          id: string
          stars: number
          subject_id: string
        }
        Insert: {
          author_id: string
          case_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          stars: number
          subject_id: string
        }
        Update: {
          author_id?: string
          case_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          stars?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          monthly_amount: number
          plan: string
          status: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          monthly_amount?: number
          plan?: string
          status?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          plan?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          body: string
          created_at: string
          id: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      surrogate_profiles: {
        Row: {
          age: number | null
          age_verified: boolean
          alcohol: boolean | null
          availability: string | null
          blood_group: string | null
          bmi: number | null
          compensation_expectation: number | null
          created_at: string
          genotype: string | null
          height_cm: number | null
          hepatitis_screened: boolean | null
          hiv_screened: boolean | null
          languages: string[] | null
          living_children: number | null
          location: string | null
          medical_clearance: boolean
          medical_notes: string | null
          nin_verified: boolean
          previous_pregnancies: number | null
          previous_surrogate: boolean | null
          psychological_clearance: boolean
          religion: string | null
          smoker: boolean | null
          travel_willing: boolean | null
          updated_at: string
          user_id: string
          visible: boolean
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          age_verified?: boolean
          alcohol?: boolean | null
          availability?: string | null
          blood_group?: string | null
          bmi?: number | null
          compensation_expectation?: number | null
          created_at?: string
          genotype?: string | null
          height_cm?: number | null
          hepatitis_screened?: boolean | null
          hiv_screened?: boolean | null
          languages?: string[] | null
          living_children?: number | null
          location?: string | null
          medical_clearance?: boolean
          medical_notes?: string | null
          nin_verified?: boolean
          previous_pregnancies?: number | null
          previous_surrogate?: boolean | null
          psychological_clearance?: boolean
          religion?: string | null
          smoker?: boolean | null
          travel_willing?: boolean | null
          updated_at?: string
          user_id: string
          visible?: boolean
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          age_verified?: boolean
          alcohol?: boolean | null
          availability?: string | null
          blood_group?: string | null
          bmi?: number | null
          compensation_expectation?: number | null
          created_at?: string
          genotype?: string | null
          height_cm?: number | null
          hepatitis_screened?: boolean | null
          hiv_screened?: boolean | null
          languages?: string[] | null
          living_children?: number | null
          location?: string | null
          medical_clearance?: boolean
          medical_notes?: string | null
          nin_verified?: boolean
          previous_pregnancies?: number | null
          previous_surrogate?: boolean | null
          psychological_clearance?: boolean
          religion?: string | null
          smoker?: boolean | null
          travel_willing?: boolean | null
          updated_at?: string
          user_id?: string
          visible?: boolean
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string
          expires_at: string | null
          file_url: string | null
          id: string
          kind: string
          reference: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          storage_path: string | null
          updated_at: string
          user_id: string
          verification_scope: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          kind: string
          reference?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          storage_path?: string | null
          updated_at?: string
          user_id: string
          verification_scope?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          kind?: string
          reference?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          storage_path?: string | null
          updated_at?: string
          user_id?: string
          verification_scope?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      agency_access: {
        Args: { _agency: string; _manage?: boolean }
        Returns: boolean
      }
      case_access: {
        Args: { _case: string; _domain?: string; _write?: boolean }
        Returns: boolean
      }
      current_user_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_case_member: { Args: { _case_id: string }; Returns: boolean }
      sign_document: {
        Args: { _document_id: string }
        Returns: {
          case_id: string | null
          category: string
          created_at: string
          expires_at: string | null
          file_url: string | null
          id: string
          name: string
          owner_id: string
          previous_version_id: string | null
          requires_signature: boolean
          signed_at: string | null
          signed_by: string[] | null
          storage_path: string | null
          updated_at: string
          version: number
          visibility_domain: string
        }
        SetofOptions: {
          from: "*"
          to: "documents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role:
        | "intended_parent"
        | "surrogate"
        | "clinic"
        | "lawyer"
        | "counselor"
        | "admin"
        | "carrier"
        | "agency_admin"
        | "agency_staff"
        | "professional"
        | "clinic_staff"
        | "nestfam_admin"
      case_status:
        | "matching"
        | "legal"
        | "medical"
        | "pregnant"
        | "delivered"
        | "closed"
        | "disputed"
      kyc_status: "unstarted" | "pending" | "verified" | "rejected"
      match_status:
        | "suggested"
        | "requested"
        | "accepted"
        | "declined"
        | "withdrawn"
      milestone_status: "pending" | "in_progress" | "complete" | "blocked"
      tx_status: "pending" | "held" | "released" | "failed" | "refunded"
      tx_type:
        | "deposit"
        | "milestone_payment"
        | "medical_expense"
        | "hospital_payment"
        | "surrogate_payment"
        | "refund"
        | "platform_fee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "intended_parent",
        "surrogate",
        "clinic",
        "lawyer",
        "counselor",
        "admin",
        "carrier",
        "agency_admin",
        "agency_staff",
        "professional",
        "clinic_staff",
        "nestfam_admin",
      ],
      case_status: [
        "matching",
        "legal",
        "medical",
        "pregnant",
        "delivered",
        "closed",
        "disputed",
      ],
      kyc_status: ["unstarted", "pending", "verified", "rejected"],
      match_status: [
        "suggested",
        "requested",
        "accepted",
        "declined",
        "withdrawn",
      ],
      milestone_status: ["pending", "in_progress", "complete", "blocked"],
      tx_status: ["pending", "held", "released", "failed", "refunded"],
      tx_type: [
        "deposit",
        "milestone_payment",
        "medical_expense",
        "hospital_payment",
        "surrogate_payment",
        "refund",
        "platform_fee",
      ],
    },
  },
} as const
