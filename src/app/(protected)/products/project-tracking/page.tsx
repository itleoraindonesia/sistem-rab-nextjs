"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Plus, FileDown, ChevronRight, Package } from "lucide-react"
import { 
  ProjectSummary, 
  VendorSpkWithProgress, 
  VendorPayment, 
  CustomerPayment 
} from "@/types/project-tracking"

const mockProjects: ProjectSummary[] = [
  {
    id: "proj-001",
    project_name: "Pembangunan Gudang PT ABC",
    customer_name: "PT ABC",
    contract_value: 1500000000,
    total_spk: 1200000000,
    project_progress: 45.5,
    status: "active",
    vendor_paid: 600000000,
    customer_paid: 500000000,
  },
  {
    id: "proj-002",
    project_name: "Pagar Panel Beton Perumahan XYZ",
    customer_name: "Perumahan XYZ",
    contract_value: 300000000,
    total_spk: 250000000,
    project_progress: 80.0,
    status: "active",
    vendor_paid: 200000000,
    customer_paid: 150000000,
  },
  {
    id: "proj-003",
    project_name: "Renovasi Ruko 3 Lantai",
    customer_name: "Bpk. Budi",
    contract_value: 800000000,
    total_spk: 600000000,
    project_progress: 100.0,
    status: "completed",
    vendor_paid: 600000000,
    customer_paid: 800000000,
  },
]

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

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
]

export default function ProjectTrackingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((p) => {
      const matchesSearch =
        p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus ? p.status === filterStatus : true
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, filterStatus])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      alert("Fungsi export Excel belum tersedia (Mock)")
    }, 1000)
  }

  const totalContractValue = filteredProjects.reduce((sum, p) => sum + p.contract_value, 0)
  const avgProgress = filteredProjects.length > 0
    ? filteredProjects.reduce((sum, p) => sum + p.project_progress, 0) / filteredProjects.length
    : 0

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Project Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor progress dan pembayaran proyek secara terpusat</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportToExcel}
              disabled={isExporting}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? "Mengexport..." : "Export Excel"}
            </button>

            <button
              className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Project Baru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{filteredProjects.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Contract Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalContractValue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Rata-rata Progress</p>
            <p className="text-2xl font-bold text-gray-900">{avgProgress.toFixed(1)}%</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama project atau customer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || filterStatus) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilterStatus("")
                }}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                ✕ Reset Filter
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 w-12">No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Nama Project</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-right">Contract Value</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-right">Total SPK Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Progress</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]" title={project.project_name}>
                      {project.project_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={project.customer_name}>
                      {project.customer_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(project.contract_value)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatCurrency(project.total_spk)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 max-w-[120px]">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 flex-1">
                          <div
                            className={`h-full rounded-full ${
                              project.project_progress === 100 ? "bg-green-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${project.project_progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-10 text-right">{project.project_progress.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${
                        project.status === "active" 
                          ? "bg-blue-50 text-blue-700" 
                          : "bg-green-50 text-green-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          project.status === "active" ? "bg-blue-500" : "bg-green-500"
                        }`}></span>
                        {project.status === "active" ? "Aktif" : "Selesai"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/project-tracking/${project.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors"
                      >
                        Detail
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300 mb-2" />
                        <div className="text-gray-500">Tidak ada project yang ditemukan</div>
                        {(searchTerm || filterStatus) && (
                          <div className="text-sm text-gray-400 mt-1">Coba ubah filter pencarian</div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden">
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/products/project-tracking/${project.id}`}
                className="block bg-white p-3 rounded-lg border border-gray-200 shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2 min-w-0">
                    <div className="font-semibold text-gray-900 truncate mt-0.5">{project.project_name}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent shrink-0 ${
                    project.status === "active" 
                      ? "bg-blue-50 text-blue-700" 
                      : "bg-green-50 text-green-700"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      project.status === "active" ? "bg-blue-500" : "bg-green-500"
                    }`}></span>
                    {project.status === "active" ? "Aktif" : "Selesai"}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer:</span>
                    <span className="truncate max-w-[150px]">{project.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Value:</span>
                    <span>{formatCurrency(project.contract_value)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Progress:</span>
                    <span className="flex items-center gap-2 w-24">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-full rounded-full ${
                            project.project_progress === 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${project.project_progress}%` }}
                        />
                      </div>
                      <span>{project.project_progress.toFixed(0)}%</span>
                    </span>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
