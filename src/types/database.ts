export type UserRole = 'admin' | 'manager' | 'reviewer' | 'approver' | 'user'

export interface Instansi {
  id: string
  nama: string
  alamat?: string
  telepon?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  nik: string
  username: string
  email: string
  nama: string
  jabatan?: string
  departemen?: string
  no_hp?: string
  instansi_id?: string
  instansi?: Instansi
  role: UserRole
  is_active: boolean
  avatar_url?: string
  signature_image?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      instansi: {
        Row: Instansi
        Insert: Omit<Instansi, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Instansi, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
