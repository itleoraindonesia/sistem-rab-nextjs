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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          instagram_username: string | null
          kabupaten: string
          kebutuhan: string
          luasan: number | null
          nama: string
          produk: string | null
          provinsi: string | null
          status: Database["public"]["Enums"]["sales_stage"] | null
          tracking_source: string | null
          updated_at: string | null
          updated_by: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          instagram_username?: string | null
          kabupaten: string
          kebutuhan: string
          luasan?: number | null
          nama: string
          produk?: string | null
          provinsi?: string | null
          status?: Database["public"]["Enums"]["sales_stage"] | null
          tracking_source?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          instagram_username?: string | null
          kabupaten?: string
          kebutuhan?: string
          luasan?: number | null
          nama?: string
          produk?: string | null
          provinsi?: string | null
          status?: Database["public"]["Enums"]["sales_stage"] | null
          tracking_source?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      document_types: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      document_workflow_stages: {
        Row: {
          assignees: Json
          completion_rule: string
          created_at: string | null
          document_type_id: number | null
          id: number
          is_active: boolean
          is_required: boolean
          sequence: number
          stage_name: string
          stage_type: string
          updated_at: string | null
        }
        Insert: {
          assignees?: Json
          completion_rule?: string
          created_at?: string | null
          document_type_id?: number | null
          id?: number
          is_active?: boolean
          is_required?: boolean
          sequence: number
          stage_name: string
          stage_type: string
          updated_at?: string | null
        }
        Update: {
          assignees?: Json
          completion_rule?: string
          created_at?: string | null
          document_type_id?: number | null
          id?: number
          is_active?: boolean
          is_required?: boolean
          sequence?: number
          stage_name?: string
          stage_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_workflow_stages_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
        ]
      }
      instansi: {
        Row: {
          alamat: string | null
          created_at: string | null
          email: string | null
          id: string
          nama: string
          telepon: string | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nama: string
          telepon?: string | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nama?: string
          telepon?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      letter_histories: {
        Row: {
          action_by_id: string
          action_type: Database["public"]["Enums"]["letter_action_type"]
          assigned_to_id: string | null
          created_at: string | null
          from_status: Database["public"]["Enums"]["letter_status"] | null
          id: number
          letter_id: string
          notes: string | null
          sequence: number | null
          stage_type: string | null
          to_status: Database["public"]["Enums"]["letter_status"] | null
        }
        Insert: {
          action_by_id: string
          action_type: Database["public"]["Enums"]["letter_action_type"]
          assigned_to_id?: string | null
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["letter_status"] | null
          id?: number
          letter_id: string
          notes?: string | null
          sequence?: number | null
          stage_type?: string | null
          to_status?: Database["public"]["Enums"]["letter_status"] | null
        }
        Update: {
          action_by_id?: string
          action_type?: Database["public"]["Enums"]["letter_action_type"]
          assigned_to_id?: string | null
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["letter_status"] | null
          id?: number
          letter_id?: string
          notes?: string | null
          sequence?: number | null
          stage_type?: string | null
          to_status?: Database["public"]["Enums"]["letter_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "letter_histories_action_by_id_fkey"
            columns: ["action_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letter_histories_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letter_histories_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "outgoing_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      master_ongkir: {
        Row: {
          biaya: number | null
          created_at: string | null
          id: string
          kabupaten: string | null
          provinsi: string
          updated_at: string | null
        }
        Insert: {
          biaya?: number | null
          created_at?: string | null
          id?: string
          kabupaten?: string | null
          provinsi: string
          updated_at?: string | null
        }
        Update: {
          biaya?: number | null
          created_at?: string | null
          id?: string
          kabupaten?: string | null
          provinsi?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      master_panel: {
        Row: {
          berat: number | null
          harga: number
          id: string
          jumlah_per_truck: number | null
          keterangan: string | null
          name: string
          type: string
          volume: number | null
        }
        Insert: {
          berat?: number | null
          harga: number
          id: string
          jumlah_per_truck?: number | null
          keterangan?: string | null
          name: string
          type: string
          volume?: number | null
        }
        Update: {
          berat?: number | null
          harga?: number
          id?: string
          jumlah_per_truck?: number | null
          keterangan?: string | null
          name?: string
          type?: string
          volume?: number | null
        }
        Relationships: []
      }
      mom_meetings: {
        Row: {
          attachments: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_number: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type_enum"]
          participants: Json
          published_at: string | null
          status: Database["public"]["Enums"]["meeting_status_enum"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_number?: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type_enum"]
          participants: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status_enum"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_number?: string | null
          meeting_type?: Database["public"]["Enums"]["meeting_type_enum"]
          participants?: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status_enum"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mom_meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_letters: {
        Row: {
          approved_at: string | null
          attachments: Json | null
          body: string
          closing: string | null
          company_id: string | null
          created_at: string | null
          created_by_id: string
          current_stage_id: number | null
          document_number: string | null
          document_type_id: number
          has_attachments: boolean | null
          id: string
          letter_date: string
          opening: string | null
          recipient_address: string
          recipient_company: string
          recipient_email: string | null
          recipient_name: string
          recipient_whatsapp: string
          rejected_at: string | null
          sender_department: string | null
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          signatories: Json | null
          status: Database["public"]["Enums"]["letter_status"]
          subject: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          attachments?: Json | null
          body: string
          closing?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by_id: string
          current_stage_id?: number | null
          document_number?: string | null
          document_type_id: number
          has_attachments?: boolean | null
          id?: string
          letter_date?: string
          opening?: string | null
          recipient_address: string
          recipient_company: string
          recipient_email?: string | null
          recipient_name: string
          recipient_whatsapp: string
          rejected_at?: string | null
          sender_department?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          signatories?: Json | null
          status?: Database["public"]["Enums"]["letter_status"]
          subject: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          attachments?: Json | null
          body?: string
          closing?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by_id?: string
          current_stage_id?: number | null
          document_number?: string | null
          document_type_id?: number
          has_attachments?: boolean | null
          id?: string
          letter_date?: string
          opening?: string | null
          recipient_address?: string
          recipient_company?: string
          recipient_email?: string | null
          recipient_name?: string
          recipient_whatsapp?: string
          rejected_at?: string | null
          sender_department?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          signatories?: Json | null
          status?: Database["public"]["Enums"]["letter_status"]
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_letters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "instansi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_letters_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_letters_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "document_workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_letters_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_letters_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rab_documents: {
        Row: {
          client_profile: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string
          location_kabupaten: string | null
          location_provinsi: string | null
          no_ref: string | null
          panel_dinding_id: string | null
          panel_lantai_id: string | null
          project_name: string
          snapshot: Json | null
          status: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          client_profile?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          location_kabupaten?: string | null
          location_provinsi?: string | null
          no_ref?: string | null
          panel_dinding_id?: string | null
          panel_lantai_id?: string | null
          project_name: string
          snapshot?: Json | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          client_profile?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          location_kabupaten?: string | null
          location_provinsi?: string | null
          no_ref?: string | null
          panel_dinding_id?: string | null
          panel_lantai_id?: string | null
          project_name?: string
          snapshot?: Json | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rab_documents_panel_dinding_id_fkey"
            columns: ["panel_dinding_id"]
            isOneToOne: false
            referencedRelation: "master_panel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rab_documents_panel_lantai_id_fkey"
            columns: ["panel_lantai_id"]
            isOneToOne: false
            referencedRelation: "master_panel"
            referencedColumns: ["id"]
          },
        ]
      }
      rab_documents_backup: {
        Row: {
          bidang: Json | null
          client_profile: Json | null
          created_at: string | null
          deleted_at: string | null
          estimasi_pengiriman: string | null
          id: string | null
          location_address: string | null
          location_backup: string | null
          location_kabupaten: string | null
          location_provinsi: string | null
          no_ref: string | null
          panel_dinding_id: string | null
          panel_lantai_id: string | null
          perimeter: number | null
          project_name: string | null
          project_profile: Json | null
          snapshot: Json | null
          status: string | null
          tinggi_lantai: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          bidang?: Json | null
          client_profile?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          estimasi_pengiriman?: string | null
          id?: string | null
          location_address?: string | null
          location_backup?: string | null
          location_kabupaten?: string | null
          location_provinsi?: string | null
          no_ref?: string | null
          panel_dinding_id?: string | null
          panel_lantai_id?: string | null
          perimeter?: number | null
          project_name?: string | null
          project_profile?: Json | null
          snapshot?: Json | null
          status?: string | null
          tinggi_lantai?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          bidang?: Json | null
          client_profile?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          estimasi_pengiriman?: string | null
          id?: string | null
          location_address?: string | null
          location_backup?: string | null
          location_kabupaten?: string | null
          location_provinsi?: string | null
          no_ref?: string | null
          panel_dinding_id?: string | null
          panel_lantai_id?: string | null
          perimeter?: number | null
          project_name?: string | null
          project_profile?: Json | null
          snapshot?: Json | null
          status?: string | null
          tinggi_lantai?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          departemen: string | null
          email: string
          id: string
          is_active: boolean | null
          jabatan: string | null
          last_login_at: string | null
          nama: string
          nik: string | null
          no_hp: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          signature_image: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          departemen?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          jabatan?: string | null
          last_login_at?: string | null
          nama: string
          nik?: string | null
          no_hp?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          signature_image?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          departemen?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          jabatan?: string | null
          last_login_at?: string | null
          nama?: string
          nik?: string | null
          no_hp?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          signature_image?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _email_local_part: { Args: { email: string }; Returns: string }
      backfill_existing_auth_users: {
        Args: never
        Returns: {
          auth_user_id: string
          email: string
          status: string
        }[]
      }
      get_generated_meeting_number_preview: { Args: never; Returns: string }
      get_next_meeting_number_preview: { Args: never; Returns: string }
      get_roman_month: { Args: { month_int: number }; Returns: string }
      review_letter: {
        Args: {
          p_action: string
          p_letter_id: string
          p_notes?: string
          p_user_id: string
        }
        Returns: Json
      }
      submit_letter_for_review: {
        Args: { p_letter_id: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      letter_action_type:
        | "CREATED"
        | "SUBMITTED"
        | "APPROVED_REVIEW"
        | "APPROVED_FINAL"
        | "REJECTED"
        | "REVISION_REQUESTED"
        | "REVISED"
      letter_status:
        | "DRAFT"
        | "SUBMITTED_TO_REVIEW"
        | "REVIEWED"
        | "APPROVED"
        | "REJECTED"
        | "REVISION_REQUESTED"
      meeting_status_enum: "draft" | "published"
      meeting_type_enum: "internal" | "external"
      sales_stage:
        | "IG_Lead"
        | "WA_Negotiation"
        | "Quotation_Sent"
        | "Follow_Up"
        | "Invoice_Deal"
        | "WIP"
        | "Finish"
        | "Cancelled"
      user_role: "admin" | "manager" | "reviewer" | "approver" | "user"
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
      letter_action_type: [
        "CREATED",
        "SUBMITTED",
        "APPROVED_REVIEW",
        "APPROVED_FINAL",
        "REJECTED",
        "REVISION_REQUESTED",
        "REVISED",
      ],
      letter_status: [
        "DRAFT",
        "SUBMITTED_TO_REVIEW",
        "REVIEWED",
        "APPROVED",
        "REJECTED",
        "REVISION_REQUESTED",
      ],
      meeting_status_enum: ["draft", "published"],
      meeting_type_enum: ["internal", "external"],
      sales_stage: [
        "IG_Lead",
        "WA_Negotiation",
        "Quotation_Sent",
        "Follow_Up",
        "Invoice_Deal",
        "WIP",
        "Finish",
        "Cancelled",
      ],
      user_role: ["admin", "manager", "reviewer", "approver", "user"],
    },
  },
} as const
