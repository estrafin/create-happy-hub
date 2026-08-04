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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
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
      cases: {
        Row: {
          clinic_id: string | null
          counselor_id: string | null
          created_at: string
          due_date: string | null
          id: string
          lawyer_id: string | null
          parent_id: string
          pregnancy_week: number | null
          reference: string
          status: Database["public"]["Enums"]["case_status"]
          surrogate_id: string | null
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          counselor_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          lawyer_id?: string | null
          parent_id: string
          pregnancy_week?: number | null
          reference?: string
          status?: Database["public"]["Enums"]["case_status"]
          surrogate_id?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          counselor_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          lawyer_id?: string | null
          parent_id?: string
          pregnancy_week?: number | null
          reference?: string
          status?: Database["public"]["Enums"]["case_status"]
          surrogate_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string | null
          category: string
          created_at: string
          file_url: string | null
          id: string
          name: string
          owner_id: string
          requires_signature: boolean
          signed_at: string | null
          signed_by: string[] | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          category?: string
          created_at?: string
          file_url?: string | null
          id?: string
          name: string
          owner_id: string
          requires_signature?: boolean
          signed_at?: string | null
          signed_by?: string[] | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          category?: string
          created_at?: string
          file_url?: string | null
          id?: string
          name?: string
          owner_id?: string
          requires_signature?: boolean
          signed_at?: string | null
          signed_by?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
      matches: {
        Row: {
          created_at: string
          id: string
          initiated_by: string | null
          parent_id: string
          rationale: string | null
          score: number
          status: Database["public"]["Enums"]["match_status"]
          surrogate_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiated_by?: string | null
          parent_id: string
          rationale?: string | null
          score?: number
          status?: Database["public"]["Enums"]["match_status"]
          surrogate_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiated_by?: string | null
          parent_id?: string
          rationale?: string | null
          score?: number
          status?: Database["public"]["Enums"]["match_status"]
          surrogate_id?: string
          updated_at?: string
        }
        Relationships: []
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
          file_url: string | null
          id: string
          kind: string
          reference: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          kind: string
          reference?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          kind?: string
          reference?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
          file_url: string | null
          id: string
          name: string
          owner_id: string
          requires_signature: boolean
          signed_at: string | null
          signed_by: string[] | null
          updated_at: string
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
