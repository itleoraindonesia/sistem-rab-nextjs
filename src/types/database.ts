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
          kebutuhan: Database["public"]["Enums"]["kebutuhan_type"]
          luasan: number | null
          nama: string
          produk: Database["public"]["Enums"]["produk_type"] | null
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
          kebutuhan: Database["public"]["Enums"]["kebutuhan_type"]
          luasan?: number | null
          nama: string
          produk?: Database["public"]["Enums"]["produk_type"] | null
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
          kebutuhan?: Database["public"]["Enums"]["kebutuhan_type"]
          luasan?: number | null
          nama?: string
          produk?: Database["public"]["Enums"]["produk_type"] | null
          provinsi?: string | null
          status?: Database["public"]["Enums"]["sales_stage"] | null
          tracking_source?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      customer_payment: {
        Row: {
          catatan: string | null
          created_at: string | null
          id: string
          jumlah: number
          project_id: string
          tanggal_pembayaran: string
          termin: Database["public"]["Enums"]["customer_payment_termin"]
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          jumlah: number
          project_id: string
          tanggal_pembayaran: string
          termin: Database["public"]["Enums"]["customer_payment_termin"]
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          jumlah?: number
          project_id?: string
          tanggal_pembayaran?: string
          termin?: Database["public"]["Enums"]["customer_payment_termin"]
        }
        Relationships: [
          {
            foreignKeyName: "customer_payment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_payment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      department_permissions: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          permissions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          permissions?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          permissions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_permissions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: true
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
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
          code: string | null
          created_at: string | null
          email: string | null
          id: string
          nama: string
          telepon: string | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nama: string
          telepon?: string | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          code?: string | null
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "user_profiles"
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
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
          company_id: string
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
          reviewed_at: string | null
          revision_count: number
          sender_department: string | null
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          signatories: Json | null
          status: Database["public"]["Enums"]["letter_status"]
          subject: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          attachments?: Json | null
          body: string
          closing?: string | null
          company_id: string
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
          reviewed_at?: string | null
          revision_count?: number
          sender_department?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          signatories?: Json | null
          status?: Database["public"]["Enums"]["letter_status"]
          subject: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          attachments?: Json | null
          body?: string
          closing?: string | null
          company_id?: string
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
          reviewed_at?: string | null
          revision_count?: number
          sender_department?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          signatories?: Json | null
          status?: Database["public"]["Enums"]["letter_status"]
          subject?: string
          submitted_at?: string | null
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
            referencedRelation: "user_profiles"
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
            referencedRelation: "user_profiles"
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
      projects: {
        Row: {
          client_id: string | null
          contract_value: number
          created_at: string | null
          customer_name: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          contract_value?: number
          created_at?: string | null
          customer_name: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          contract_value?: number
          created_at?: string | null
          customer_name?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
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
      roles: {
        Row: {
          created_at: string | null
          id: string
          is_system_role: boolean | null
          name: string
          permissions: Json
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          permissions?: Json
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          permissions?: Json
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          is_active: boolean | null
          is_approver_eligible: boolean | null
          is_reviewer_eligible: boolean | null
          jabatan: string | null
          last_login_at: string | null
          nama: string
          nik: string | null
          no_hp: string | null
          role_id: string
          signature_image: string | null
          stakeholder_type: Database["public"]["Enums"]["stakeholder_type"]
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_approver_eligible?: boolean | null
          is_reviewer_eligible?: boolean | null
          jabatan?: string | null
          last_login_at?: string | null
          nama: string
          nik?: string | null
          no_hp?: string | null
          role_id: string
          signature_image?: string | null
          stakeholder_type?: Database["public"]["Enums"]["stakeholder_type"]
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_approver_eligible?: boolean | null
          is_reviewer_eligible?: boolean | null
          jabatan?: string | null
          last_login_at?: string | null
          nama?: string
          nik?: string | null
          no_hp?: string | null
          role_id?: string
          signature_image?: string | null
          stakeholder_type?: Database["public"]["Enums"]["stakeholder_type"]
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payment: {
        Row: {
          catatan: string | null
          created_at: string | null
          id: string
          jenis_pembayaran: Database["public"]["Enums"]["vendor_payment_jenis"]
          jumlah: number
          lampiran: Json | null
          tanggal_pembayaran: string
          vendor_spk_id: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          jenis_pembayaran: Database["public"]["Enums"]["vendor_payment_jenis"]
          jumlah: number
          lampiran?: Json | null
          tanggal_pembayaran: string
          vendor_spk_id: string
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          jenis_pembayaran?: Database["public"]["Enums"]["vendor_payment_jenis"]
          jumlah?: number
          lampiran?: Json | null
          tanggal_pembayaran?: string
          vendor_spk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payment_vendor_spk_id_fkey"
            columns: ["vendor_spk_id"]
            isOneToOne: false
            referencedRelation: "vendor_spk"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_progress: {
        Row: {
          catatan: string | null
          created_at: string | null
          id: string
          lampiran: Json | null
          progress_percent: number
          tanggal: string
          vendor_spk_id: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          lampiran?: Json | null
          progress_percent: number
          tanggal: string
          vendor_spk_id: string
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          lampiran?: Json | null
          progress_percent?: number
          tanggal?: string
          vendor_spk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_progress_vendor_spk_id_fkey"
            columns: ["vendor_spk_id"]
            isOneToOne: false
            referencedRelation: "vendor_spk"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_spk: {
        Row: {
          created_at: string | null
          id: string
          nilai_spk: number
          pekerjaan: string
          project_id: string
          status: Database["public"]["Enums"]["vendor_spk_status"]
          updated_at: string | null
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nilai_spk?: number
          pekerjaan: string
          project_id: string
          status?: Database["public"]["Enums"]["vendor_spk_status"]
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nilai_spk?: number
          pekerjaan?: string
          project_id?: string
          status?: Database["public"]["Enums"]["vendor_spk_status"]
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_spk_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_spk_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_spk_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_spk_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_summary: {
        Row: {
          contract_value: number | null
          customer_name: string | null
          customer_outstanding: number | null
          customer_paid: number | null
          id: string | null
          name: string | null
          project_progress: number | null
          total_spk: number | null
          vendor_outstanding: number | null
          vendor_paid: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department_name: string | null
          department_slug: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          is_approver_eligible: boolean | null
          is_reviewer_eligible: boolean | null
          jabatan: string | null
          last_login_at: string | null
          nama: string | null
          nik: string | null
          no_hp: string | null
          role_name: string | null
          role_permissions: Json | null
          role_slug: string | null
          signature_image: string | null
          stakeholder_type:
            | Database["public"]["Enums"]["stakeholder_type"]
            | null
          updated_at: string | null
          username: string | null
        }
        Relationships: []
      }
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
      current_user_id: { Args: never; Returns: string }
      generate_document_number: {
        Args: { p_letter_id: string }
        Returns: string
      }
      generate_meeting_number: { Args: never; Returns: string }
      get_generated_meeting_number_preview: { Args: never; Returns: string }
      get_next_meeting_number_preview: { Args: never; Returns: string }
      get_project_progress: { Args: { p_project_id: string }; Returns: number }
      get_roman_month: { Args: { month_int: number }; Returns: string }
      get_user_department_slug: { Args: never; Returns: string }
      get_user_permissions: { Args: never; Returns: Json }
      get_user_role_slug: { Args: never; Returns: string }
      get_user_stakeholder_type: { Args: never; Returns: string }
      is_client: { Args: never; Returns: boolean }
      is_internal_user: { Args: never; Returns: boolean }
      is_vendor: { Args: never; Returns: boolean }
      resubmit_revision: {
        Args: { p_letter_id: string; p_user_id: string }
        Returns: Json
      }
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
      user_has_permission: { Args: { p_permission: string }; Returns: boolean }
    }
    Enums: {
      customer_payment_termin: "dp" | "term" | "final"
      kebutuhan_type:
        | "Pagar"
        | "Gudang"
        | "Kos/Kontrakan"
        | "Toko/Ruko"
        | "Rumah"
        | "Villa"
        | "Hotel"
        | "Rumah Sakit"
        | "Panel Saja"
        | "U-Ditch"
        | "Plastik Board"
        | "Lapangan"
        | "Sekolah"
        | "Kantor"
        | "Tahu Beton"
      letter_action_type:
        | "CREATED"
        | "SUBMITTED"
        | "APPROVED_REVIEW"
        | "APPROVED_FINAL"
        | "REJECTED"
        | "REVISION_REQUESTED"
        | "REVISED"
        | "CANCELLED"
      letter_status:
        | "DRAFT"
        | "SUBMITTED_TO_REVIEW"
        | "REVIEWED"
        | "APPROVED"
        | "REJECTED"
        | "REVISION_REQUESTED"
      meeting_status_enum: "draft" | "published"
      meeting_type_enum: "internal" | "external"
      produk_type:
        | "Panel Beton"
        | "Pagar Beton"
        | "Sandwich Panel"
        | "Panel Surya"
        | "Plastik Board"
        | "Ponton Terapung"
        | "Jasa Konstruksi"
        | "Jasa Renovasi"
        | "Jasa RAB/Gambar"
        | "U-Ditch"
        | "Tahu Beton"
      sales_stage:
        | "IG_Lead"
        | "WA_Negotiation"
        | "Quotation_Sent"
        | "Follow_Up"
        | "Invoice_Deal"
        | "WIP"
        | "Finish"
        | "Cancelled"
      stakeholder_type: "internal" | "vendor" | "client"
      vendor_payment_jenis: "dp" | "term" | "pelunasan"
      vendor_spk_status: "active" | "completed"
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
      customer_payment_termin: ["dp", "term", "final"],
      kebutuhan_type: [
        "Pagar",
        "Gudang",
        "Kos/Kontrakan",
        "Toko/Ruko",
        "Rumah",
        "Villa",
        "Hotel",
        "Rumah Sakit",
        "Panel Saja",
        "U-Ditch",
        "Plastik Board",
        "Lapangan",
        "Sekolah",
        "Kantor",
        "Tahu Beton",
      ],
      letter_action_type: [
        "CREATED",
        "SUBMITTED",
        "APPROVED_REVIEW",
        "APPROVED_FINAL",
        "REJECTED",
        "REVISION_REQUESTED",
        "REVISED",
        "CANCELLED",
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
      produk_type: [
        "Panel Beton",
        "Pagar Beton",
        "Sandwich Panel",
        "Panel Surya",
        "Plastik Board",
        "Ponton Terapung",
        "Jasa Konstruksi",
        "Jasa Renovasi",
        "Jasa RAB/Gambar",
        "U-Ditch",
        "Tahu Beton",
      ],
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
      stakeholder_type: ["internal", "vendor", "client"],
      vendor_payment_jenis: ["dp", "term", "pelunasan"],
      vendor_spk_status: ["active", "completed"],
    },
  },
} as const
