"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Activity, Briefcase, CreditCard, DollarSign, Package, AlertTriangle, Plus, Pencil, Trash2, Paperclip, Calendar } from "lucide-react"
import { 
  ProjectSummary, 
  VendorSpkWithProgress, 
  VendorPayment, 
  CustomerPayment,
  VendorProgress 
} from "@/types/project-tracking"
import VendorSpkModal from "@/components/project-tracking/VendorSpkModal"
import VendorProgressModal from "@/components/project-tracking/VendorProgressModal"
import VendorPaymentModal from "@/components/project-tracking/VendorPaymentModal"
import CustomerPaymentModal from "@/components/project-tracking/CustomerPaymentModal"
import DeleteConfirmModal from "@/components/project-tracking/DeleteConfirmModal"

const mockProjects: Record<string, ProjectSummary> = {
  "proj-001": {
    id: "proj-001",
    project_name: "Pembangunan Gudang PT ABC",
    customer_name: "PT ABC",
    contract_value: 1500000000,
    total_spk: 1200000000,
    project_progress: 45.5,
    status: "active",
    vendor_paid: 600000000,
    customer_paid: 500000000,
    tanggal_mulai: "2026-01-01",
    tanggal_deadline: "2026-06-30",
    retensi_persen: 5,
  },
  "proj-002": {
    id: "proj-002",
    project_name: "Pagar Panel Beton Perumahan XYZ",
    customer_name: "Perumahan XYZ",
    contract_value: 300000000,
    total_spk: 250000000,
    project_progress: 80.0,
    status: "active",
    vendor_paid: 200000000,
    customer_paid: 150000000,
    tanggal_mulai: "2026-02-01",
    tanggal_deadline: "2026-04-15",
    retensi_persen: 0,
  },
  "proj-003": {
    id: "proj-003",
    project_name: "Renovasi Ruko 3 Lantai",
    customer_name: "Bpk. Budi",
    contract_value: 800000000,
    total_spk: 600000000,
    project_progress: 100.0,
    status: "completed",
    vendor_paid: 600000000,
    customer_paid: 800000000,
    tanggal_mulai: "2025-11-01",
    tanggal_deadline: "2026-03-01",
    retensi_persen: 10,
  },
}

const mockVendorSpk: Record<string, VendorSpkWithProgress[]> = {
  "proj-001": [
    {
      id: "vspk-001",
      project_id: "proj-001",
      vendor_name: "CV Mandiri Bangun",
      nilai_spk: 800000000,
      status: "active",
      created_at: "2026-01-15",
      latest_progress: {
        id: "vprog-001",
        vendor_spk_id: "vspk-001",
        progress_percent: 50,
        tanggal: "2026-03-20",
        created_at: "2026-03-20",
      },
    },
    {
      id: "vspk-002",
      project_id: "proj-001",
      vendor_name: "PT Baja Struktur",
      nilai_spk: 400000000,
      status: "active",
      created_at: "2026-01-20",
      latest_progress: {
        id: "vprog-002",
        vendor_spk_id: "vspk-002",
        progress_percent: 36.5,
        tanggal: "2026-03-20",
        created_at: "2026-03-20",
      },
    },
  ],
  "proj-002": [
    {
      id: "vspk-003",
      project_id: "proj-002",
      vendor_name: "CV Jaya Konstruksi",
      nilai_spk: 250000000,
      status: "active",
      created_at: "2026-02-01",
      latest_progress: {
        id: "vprog-003",
        vendor_spk_id: "vspk-003",
        progress_percent: 80,
        tanggal: "2026-03-18",
        created_at: "2026-03-18",
      },
    },
  ],
  "proj-003": [
    {
      id: "vspk-004",
      project_id: "proj-003",
      vendor_name: "PT Sumber Rejeki",
      nilai_spk: 600000000,
      status: "completed",
      created_at: "2025-12-01",
      latest_progress: {
        id: "vprog-004",
        vendor_spk_id: "vspk-004",
        progress_percent: 100,
        tanggal: "2026-03-01",
        created_at: "2026-03-01",
      },
    },
  ],
}

const mockVendorPayments: Record<string, VendorPayment[]> = {
  "vspk-001": [
    { id: "vpay-001", vendor_spk_id: "vspk-001", jumlah: 200000000, jenis_pembayaran: "dp", tanggal: "2026-02-01", created_at: "2026-02-01" },
    { id: "vpay-002", vendor_spk_id: "vspk-001", jumlah: 400000000, jenis_pembayaran: "term", tanggal: "2026-03-01", created_at: "2026-03-01" },
  ],
  "vspk-002": [
    { id: "vpay-003", vendor_spk_id: "vspk-002", jumlah: 150000000, jenis_pembayaran: "dp", tanggal: "2026-02-15", created_at: "2026-02-15" },
  ],
  "vspk-003": [
    { id: "vpay-004", vendor_spk_id: "vspk-003", jumlah: 200000000, jenis_pembayaran: "dp", tanggal: "2026-02-15", created_at: "2026-02-15" },
  ],
  "vspk-004": [
    { id: "vpay-005", vendor_spk_id: "vspk-004", jumlah: 300000000, jenis_pembayaran: "dp", tanggal: "2025-12-20", created_at: "2025-12-20" },
    { id: "vpay-006", vendor_spk_id: "vspk-004", jumlah: 300000000, jenis_pembayaran: "term", tanggal: "2026-02-01", created_at: "2026-02-01" },
  ],
}

const mockCustomerPayments: Record<string, CustomerPayment[]> = {
  "proj-001": [
    { id: "cpay-001", project_id: "proj-001", jumlah: 500000000, termin: "dp", tanggal: "2026-01-28", created_at: "2026-01-28" },
  ],
  "proj-002": [
    { id: "cpay-002", project_id: "proj-002", jumlah: 150000000, termin: "dp", tanggal: "2026-02-10", created_at: "2026-02-10" },
  ],
  "proj-003": [
    { id: "cpay-003", project_id: "proj-003", jumlah: 400000000, termin: "dp", tanggal: "2025-12-15", created_at: "2025-12-15" },
    { id: "cpay-004", project_id: "proj-003", jumlah: 400000000, termin: "term", tanggal: "2026-02-01", created_at: "2026-02-01" },
  ],
}

function calculateProjectProgress(vendorSpk: VendorSpkWithProgress[]): number {
  const activeVendors = vendorSpk.filter(v => v.status === "active")
  if (activeVendors.length === 0) return 0
  
  const totalNilaiSpk = activeVendors.reduce((sum, v) => sum + v.nilai_spk, 0)
  const weightedProgress = activeVendors.reduce((sum, v) => {
    const progress = v.latest_progress?.progress_percent ?? 0
    return sum + (v.nilai_spk * progress)
  }, 0)
  
  return totalNilaiSpk > 0 ? Math.round((weightedProgress / totalNilaiSpk) * 100) / 100 : 0
}

function calculateTotalSpk(vendorSpk: VendorSpkWithProgress[]): number {
  return vendorSpk.reduce((sum, v) => sum + v.nilai_spk, 0)
}

function calculateVendorPaid(vendorSpk: VendorSpkWithProgress[]): number {
  return vendorSpk.reduce((sum, vspk) => {
    const payments = mockVendorPayments[vspk.id] || []
    return sum + payments.reduce((pSum, p) => pSum + p.jumlah, 0)
  }, 0)
}

function calculateVendorPaidPerVendor(vendorSpkId: string): number {
  const payments = mockVendorPayments[vendorSpkId] || []
  return payments.reduce((sum, p) => sum + p.jumlah, 0)
}

function calculateTotalCustomerPayments(projectId: string): number {
  const payments = mockCustomerPayments[projectId] || []
  return payments.reduce((sum, p) => sum + p.jumlah, 0)
}

function calculateSisaHari(deadline: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  const diffTime = deadlineDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getTerminLabel(termin: string, index: number, totalTerms: number): string {
  if (termin === "dp") return "DP"
  if (termin === "final") return "Final"
  
  // Hitung nomor termin (term)
  const termIndex = index + 1
  return `Termin ${termIndex}`
}

const JENIS_PEMBAYARAN_LABELS: Record<string, string> = {
  "dp": "DP",
  "term": "Termin",
  "pelunasan": "Pelunasan",
}

const TERMIN_LABELS: Record<string, string> = {
  "dp": "DP",
  "term": "Termin",
  "final": "Final",
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const [activeTab, setActiveTab] = useState("vendor_spk")
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Modal states
  const [vendorSpkModal, setVendorSpkModal] = useState({ isOpen: false, data: null as VendorSpkWithProgress | null })
  const [progressModal, setProgressModal] = useState({ isOpen: false, data: null as VendorProgress | null })
  const [vendorPaymentModal, setVendorPaymentModal] = useState({ isOpen: false, data: null as VendorPayment | null })
  const [customerPaymentModal, setCustomerPaymentModal] = useState({ isOpen: false, data: null as CustomerPayment | null })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', id: '', name: '' })

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const project = mockProjects[projectId as string] || mockProjects["proj-001"]
  const vendorSpkList = mockVendorSpk[projectId as string] || mockVendorSpk["proj-001"] || []

  const calculatedProgress = useMemo(() => {
    return calculateProjectProgress(vendorSpkList)
  }, [vendorSpkList])

  const calculatedTotalSpk = useMemo(() => {
    return calculateTotalSpk(vendorSpkList)
  }, [vendorSpkList])

  const vendorPaid = useMemo(() => {
    return calculateVendorPaid(vendorSpkList)
  }, [vendorSpkList])

  const customerPaid = useMemo(() => {
    return calculateTotalCustomerPayments(projectId as string)
  }, [projectId])

  const vendorOutstanding = calculatedTotalSpk - vendorPaid
  const customerOutstanding = project.contract_value - customerPaid
  
  // Business calculations
  const cashFlowAktual = customerPaid - vendorPaid
  const projectedMargin = project.contract_value - calculatedTotalSpk
  const marginPercent = project.contract_value > 0 ? (projectedMargin / project.contract_value) * 100 : 0
  const sisaHari = calculateSisaHari(project.tanggal_deadline)
  
  // Alert conditions
  const isCashFlowNegative = cashFlowAktual < 0
  const isCustomerOutstandingHigh = customerOutstanding > (project.contract_value * 0.5)
  const isDeadlineWarning = sisaHari <= 14 && sisaHari > 0
  const isOverdue = sisaHari <= 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const allVendorPayments = useMemo(() => {
    const payments: (VendorPayment & { vendor_name: string })[] = []
    vendorSpkList.forEach(vspk => {
      const paymentsForVendor = mockVendorPayments[vspk.id] || []
      paymentsForVendor.forEach(p => {
        payments.push({ ...p, vendor_name: vspk.vendor_name })
      })
    })
    return payments.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
  }, [vendorSpkList])

  const customerPayments = mockCustomerPayments[projectId as string] || mockCustomerPayments["proj-001"] || []

  // Calculate termin labels with numbers
  const customerPaymentsWithLabels = useMemo(() => {
    let termCounter = 0
    return customerPayments.map((payment) => {
      if (payment.termin === "dp") {
        return { ...payment, terminLabel: "DP" }
      } else if (payment.termin === "final") {
        return { ...payment, terminLabel: "Final" }
      } else {
        termCounter++
        return { ...payment, terminLabel: `Termin ${termCounter}` }
      }
    })
  }, [customerPayments])

  const vendorSpkWithPayments = useMemo(() => {
    return vendorSpkList.map(vspk => {
      const paid = calculateVendorPaidPerVendor(vspk.id)
      const outstanding = vspk.nilai_spk - paid
      const isOverpaid = paid > vspk.nilai_spk
      return { ...vspk, paid, outstanding, isOverpaid }
    })
  }, [vendorSpkList])

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Project tidak ditemukan</p>
          <Link
            href="/construction/project-tracking"
            className="mt-4 text-primary hover:underline"
          >
            Kembali ke daftar project
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{project.project_name}</h1>
              {/* Alert Badges */}
              {isOverdue && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
                  OVERDUE
                </span>
              )}
              {!isOverdue && isDeadlineWarning && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                  {sisaHari} hari lagi
                </span>
              )}
              {isCashFlowNegative && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200" title="Vendor Paid > Customer Paid">
                  Cash Flow Negatif
                </span>
              )}
              {isCustomerOutstandingHigh && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-200" title="Customer Outstanding > 50% Contract Value">
                  Outstanding Customer Tinggi
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Customer: {project.customer_name}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(project.tanggal_mulai)} - {formatDate(project.tanggal_deadline)}
              </span>
              {!isOverdue && (
                <span className={sisaHari <= 14 ? "text-yellow-600 font-medium" : "text-gray-500"}>
                  Sisa {sisaHari} hari
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Contract Value</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(project.contract_value)}</p>
            {project.retensi_persen > 0 && (
              <p className="text-xs text-gray-500 mt-1">Retensi: {project.retensi_persen}%</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-500">Progress</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{calculatedProgress.toFixed(1)}%</p>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(calculatedProgress, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-medium text-gray-500">Total SPK</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(calculatedTotalSpk)}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <p className="text-xs font-medium text-gray-500">Customer Paid</p>
            </div>
            <p className="text-lg font-bold text-green-600">{formatCurrency(customerPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">Outstanding: {formatCurrency(customerOutstanding)}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <p className="text-xs font-medium text-gray-500">Vendor Paid</p>
            </div>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(vendorPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">Outstanding: {formatCurrency(vendorOutstanding)}</p>
          </div>

          <div className={`p-4 rounded-lg border shadow-sm ${isCashFlowNegative ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`w-4 h-4 ${isCashFlowNegative ? 'text-red-500' : 'text-blue-500'}`} />
              <p className="text-xs font-medium text-gray-500">Cash Flow Aktual</p>
            </div>
            <p className={`text-lg font-bold ${isCashFlowNegative ? 'text-red-600' : 'text-blue-600'}`}>
              {formatCurrency(cashFlowAktual)}
            </p>
            {isCashFlowNegative && (
              <p className="text-xs text-red-500 mt-1">Vendor Paid &gt; Customer Paid</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-medium text-gray-500">Projected Margin</p>
            </div>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(projectedMargin)}</p>
            <p className="text-xs text-gray-500 mt-1">{marginPercent.toFixed(1)}% dari Contract Value</p>
          </div>

          <div className={`p-4 rounded-lg border shadow-sm ${isOverdue ? 'bg-red-50 border-red-200' : isDeadlineWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-500' : isDeadlineWarning ? 'text-yellow-500' : 'text-gray-400'}`} />
              <p className="text-xs font-medium text-gray-500">Sisa Hari</p>
            </div>
            <p className={`text-lg font-bold ${isOverdue ? 'text-red-600' : isDeadlineWarning ? 'text-yellow-600' : 'text-gray-900'}`}>
              {isOverdue ? `${Math.abs(sisaHari)} hari overdue` : `${sisaHari} hari`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Deadline: {formatDate(project.tanggal_deadline)}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Contract Value</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(project.contract_value)}</p>
            {project.retensi_persen > 0 && (
              <p className="text-xs text-gray-500 mt-1">Retensi: {project.retensi_persen}%</p>
            )}
          </div>
        </div>

        {customerPaid > project.contract_value && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Peringatan: Total pembayaran customer melebihi contract value</p>
              <p className="text-xs text-red-600">Customer paid: {formatCurrency(customerPaid)} vs Contract: {formatCurrency(project.contract_value)}</p>
            </div>
          </div>
        )}

        <div>
          <div className="flex space-x-1 bg-white border rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab("vendor_spk")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "vendor_spk"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Vendor SPK & Progress
            </button>
            <button
              onClick={() => setActiveTab("vendor_payment")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "vendor_payment"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pembayaran Vendor
            </button>
            <button
              onClick={() => setActiveTab("customer_payment")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "customer_payment"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pembayaran Customer
            </button>
          </div>

          {activeTab === "vendor_spk" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">Daftar Kontrak Vendor</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProgressModal({ isOpen: true, data: null })}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                  >
                    <Plus className="w-4 h-4" />
                    Progress
                  </button>
                  <button
                    onClick={() => setVendorSpkModal({ isOpen: true, data: null })}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Vendor SPK
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">NAMA VENDOR</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">NILAI SPK</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">BOBOT</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">PAID</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">OUTSTANDING</th>
                      <th className="px-4 py-3 whitespace-nowrap">PROGRESS</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">STATUS</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">LAMPIRAN</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendorSpkWithPayments.map((vendor) => {
                      const bobot = calculatedTotalSpk > 0 ? (vendor.nilai_spk / calculatedTotalSpk) * 100 : 0
                      const kontribusiProgress = bobot * (vendor.latest_progress?.progress_percent ?? 0) / 100
                      return (
                        <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {vendor.isOverpaid && (
                                <span title="Pembayaran melebihi nilai SPK">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                </span>
                              )}
                              <span className="font-medium text-gray-900">{vendor.vendor_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">{formatCurrency(vendor.nilai_spk)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs text-gray-600" title={`Kontribusi progress: ${kontribusiProgress.toFixed(1)}%`}>
                              {bobot.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={vendor.isOverpaid ? "text-red-600 font-bold" : "text-orange-600"}>
                              {formatCurrency(vendor.paid)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={vendor.outstanding < 0 ? "text-red-600 font-bold" : "text-gray-900"}>
                              {formatCurrency(vendor.outstanding)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                <div
                                  className={`h-full rounded-full ${
                                    (vendor.latest_progress?.progress_percent ?? 0) === 100 ? "bg-green-500" : "bg-blue-500"
                                  }`}
                                  style={{ width: `${Math.min(vendor.latest_progress?.progress_percent ?? 0, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700 w-10">{(vendor.latest_progress?.progress_percent ?? 0).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              vendor.status === "active"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-green-50 text-green-700"
                            }`}>
                              {vendor.status === "active" ? "Aktif" : "Selesai"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {vendor.lampiran_url ? (
                              <span title="Ada lampiran SPK">
                                <Paperclip className="w-4 h-4 text-blue-500" />
                              </span>
                            ) : (
                              <span title="Tidak ada lampiran">
                                <Paperclip className="w-4 h-4 text-gray-300" />
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-center">
                              <button
                                onClick={() => setVendorSpkModal({ isOpen: true, data: vendor })}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, type: 'vendor_spk', id: vendor.id, name: vendor.vendor_name })}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {vendorSpkWithPayments.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada vendor SPK
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {vendorSpkWithPayments.length > 0 && (
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td className="px-4 py-3">TOTAL</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(calculatedTotalSpk)}</td>
                        <td className="px-4 py-3 text-right">100%</td>
                        <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(vendorPaid)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(vendorOutstanding)}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {activeTab === "vendor_payment" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">History Pembayaran Vendor</h3>
                <button
                  onClick={() => setVendorPaymentModal({ isOpen: true, data: null })}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Pembayaran
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">TANGGAL</th>
                      <th className="px-4 py-3 whitespace-nowrap">VENDOR</th>
                      <th className="px-4 py-3 whitespace-nowrap">JENIS</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">JUMLAH</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">LAMPIRAN</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allVendorPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{formatDate(payment.tanggal)}</td>
                        <td className="px-4 py-3 text-gray-900">{payment.vendor_name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            {JENIS_PEMBAYARAN_LABELS[payment.jenis_pembayaran] || payment.jenis_pembayaran}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-right text-gray-900">{formatCurrency(payment.jumlah)}</td>
                        <td className="px-4 py-3 text-center">
                          {(payment as VendorPayment & { lampiran_url?: string }).lampiran_url ? (
                            <span title="Ada lampiran">
                              <Paperclip className="w-4 h-4 text-blue-500" />
                            </span>
                          ) : (
                            <span title="Tidak ada lampiran">
                              <Paperclip className="w-4 h-4 text-gray-300" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => setVendorPaymentModal({ isOpen: true, data: payment })}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, type: 'vendor_payment', id: payment.id, name: `Pembayaran ${payment.vendor_name}` })}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allVendorPayments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada pembayaran vendor
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {allVendorPayments.length > 0 && (
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td className="px-4 py-3" colSpan={3}>TOTAL PEMBAYARAN VENDOR</td>
                        <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(vendorPaid)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {activeTab === "customer_payment" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">History Pembayaran Customer</h3>
                <button
                  onClick={() => setCustomerPaymentModal({ isOpen: true, data: null })}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Pembayaran
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">TANGGAL</th>
                      <th className="px-4 py-3 whitespace-nowrap">TERMIN</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">JUMLAH</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">LAMPIRAN</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerPaymentsWithLabels.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{formatDate(payment.tanggal)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded">
                            {payment.terminLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-right text-green-700">{formatCurrency(payment.jumlah)}</td>
                        <td className="px-4 py-3 text-center">
                          {(payment as CustomerPayment & { lampiran_url?: string }).lampiran_url ? (
                            <span title="Ada lampiran">
                              <Paperclip className="w-4 h-4 text-blue-500" />
                            </span>
                          ) : (
                            <span title="Tidak ada lampiran">
                              <Paperclip className="w-4 h-4 text-gray-300" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => setCustomerPaymentModal({ isOpen: true, data: payment })}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, type: 'customer_payment', id: payment.id, name: `Pembayaran ${payment.terminLabel}` })}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customerPaymentsWithLabels.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada pembayaran customer
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {customerPaymentsWithLabels.length > 0 && (
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td className="px-4 py-3" colSpan={2}>TOTAL PEMBAYARAN CUSTOMER</td>
                        <td className="px-4 py-3 text-right text-green-600">{formatCurrency(customerPaid)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-4 py-3" colSpan={2}>OUTSTANDING</td>
                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(customerOutstanding)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <VendorSpkModal
        isOpen={vendorSpkModal.isOpen}
        onClose={() => setVendorSpkModal({ isOpen: false, data: null })}
        onSuccess={refresh}
        existingData={vendorSpkModal.data}
      />

      <VendorProgressModal
        isOpen={progressModal.isOpen}
        onClose={() => setProgressModal({ isOpen: false, data: null })}
        onSuccess={refresh}
        vendorSpkList={vendorSpkList}
        existingData={progressModal.data}
      />

      <VendorPaymentModal
        isOpen={vendorPaymentModal.isOpen}
        onClose={() => setVendorPaymentModal({ isOpen: false, data: null })}
        onSuccess={refresh}
        vendorSpkList={vendorSpkList}
        existingData={vendorPaymentModal.data}
      />

      <CustomerPaymentModal
        isOpen={customerPaymentModal.isOpen}
        onClose={() => setCustomerPaymentModal({ isOpen: false, data: null })}
        onSuccess={refresh}
        existingData={customerPaymentModal.data}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: '', id: '', name: '' })}
        onConfirm={() => {
          // Handle delete based on type
          console.log('Delete:', deleteModal.type, deleteModal.id)
          setDeleteModal({ isOpen: false, type: '', id: '', name: '' })
          refresh()
        }}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus "${deleteModal.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  )
}
