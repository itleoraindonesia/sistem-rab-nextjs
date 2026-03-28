import { Database } from '@/types/database'

export type ProjectStatus = 'active' | 'completed'

export type VendorSpkStatus = 'active' | 'completed'

export type JenisPembayaran = 'dp' | 'term' | 'pelunasan'

export type CustomerTermin = 'dp' | 'term' | 'final'

export interface Project {
  id: string
  project_name: string
  customer_name: string
  contract_value: number
  status: ProjectStatus
  created_at: string
  updated_at?: string
}

export interface VendorSpk {
  id: string
  project_id: string
  vendor_name: string
  nilai_spk: number
  status: VendorSpkStatus
  lampiran_url?: string
  created_at: string
  updated_at?: string
}

export interface VendorProgress {
  id: string
  vendor_spk_id: string
  progress_percent: number
  tanggal: string
  keterangan?: string
  created_at: string
}

export interface VendorPayment {
  id: string
  vendor_spk_id: string
  jumlah: number
  jenis_pembayaran: JenisPembayaran
  tanggal: string
  keterangan?: string
  created_at: string
}

export interface CustomerPayment {
  id: string
  project_id: string
  jumlah: number
  termin: CustomerTermin
  tanggal: string
  keterangan?: string
  created_at: string
}

export interface ProjectWithRelations extends Project {
  vendor_spk?: VendorSpkWithProgress[]
  customer_payments?: CustomerPayment[]
}

export interface VendorSpkWithProgress extends VendorSpk {
  latest_progress?: VendorProgress
  payments?: VendorPayment[]
}

export interface ProjectSummary {
  id: string
  project_name: string
  customer_name: string
  contract_value: number
  total_spk: number
  project_progress: number
  status: ProjectStatus
  vendor_paid: number
  customer_paid: number
}

export interface ProjectDetailSummary {
  id: string
  project_name: string
  customer_name: string
  contract_value: number
  total_spk: number
  project_progress: number
  status: ProjectStatus
  vendor_paid: number
  customer_paid: number
  vendor_outstanding: number
  customer_outstanding: number
}
