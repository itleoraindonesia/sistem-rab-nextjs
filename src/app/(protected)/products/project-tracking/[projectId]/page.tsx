"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
// Remove Tabs import - using simple state-based tabs instead
import { ArrowLeft, Activity, Briefcase, CreditCard, DollarSign } from "lucide-react"

// Types (Mock)
interface ProjectDetail {
  id: string
  project_name: string
  contract_value: number
  total_spk: number
  vendor_paid: number
  customer_paid: number
  project_progress: number
}

// Mock Data
const mockProjectDetails: Record<string, ProjectDetail> = {
  "PROJ-001": {
    id: "PROJ-001",
    project_name: "Pembangunan Gudang PT ABC",
    contract_value: 1500000000,
    total_spk: 1200000000,
    vendor_paid: 600000000,
    customer_paid: 500000000,
    project_progress: 45.5,
  },
}

const mockVendors = [
  { id: "VSPK-001", vendor_name: "CV Mandiri Bangun", status: "active", spk_value: 800000000, progress: 50 },
  { id: "VSPK-002", vendor_name: "PT Baja Struktur", status: "active", spk_value: 400000000, progress: 36.5 },
]

const mockVendorPayments = [
  { id: "VPAY-001", vendor_name: "CV Mandiri Bangun", date: "2026-03-01", type: "dp", amount: 200000000 },
  { id: "VPAY-002", vendor_name: "CV Mandiri Bangun", date: "2026-03-15", type: "term", amount: 400000000 },
]

const mockCustomerPayments = [
  { id: "CPAY-001", date: "2026-02-28", termin: "dp", amount: 500000000 },
]

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [activeTab, setActiveTab] = useState("vendor_spk")

  useEffect(() => {
    // Simulate Fetch
    if (typeof projectId === "string") {
      setProject(mockProjectDetails[projectId] || mockProjectDetails["PROJ-001"])
    }
  }, [projectId])

  if (!project) return <div className="p-6">Loading...</div>

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const vendorOutstanding = project.total_spk - project.vendor_paid
  const customerOutstanding = project.contract_value - project.customer_paid

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{project.project_name}</h1>
            <p className="text-sm text-gray-500 mt-1">ID Project: {project.id}</p>
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Project Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Progress</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{project.project_progress.toFixed(1)}%</h3>
                </div>
                <div className="p-3 bg-blue-100/50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${project.project_progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Total SPK Vendor */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total SPK Vendor</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(project.total_spk)}</h3>
                </div>
                <div className="p-3 bg-purple-100/50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Paid */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer Paid (Revenue)</p>
                  <h3 className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(project.customer_paid)}</h3>
                  <p className="text-xs text-gray-400 mt-1">Outstanding: {formatCurrency(customerOutstanding)}</p>
                </div>
                <div className="p-3 bg-green-100/50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Paid */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vendor Paid (Cost)</p>
                  <h3 className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(project.vendor_paid)}</h3>
                  <p className="text-xs text-gray-400 mt-1">Outstanding: {formatCurrency(vendorOutstanding)}</p>
                </div>
                <div className="p-3 bg-orange-100/50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8">
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

          {/* Tab Content */}
          {activeTab === "vendor_spk" && (
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-800">Daftar Kontrak Vendor</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">NAMA VENDOR</th>
                        <th className="px-6 py-4 whitespace-nowrap text-right">NILAI SPK</th>
                        <th className="px-6 py-4 whitespace-nowrap">PROGRESS</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockVendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{vendor.vendor_name}</td>
                          <td className="px-6 py-4 text-right">{formatCurrency(vendor.spk_value)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[100px]">
                                <div
                                  className="bg-blue-500 h-full rounded-full"
                                  style={{ width: `${vendor.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700">{vendor.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                              {vendor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "vendor_payment" && (
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-800">History Pembayaran Vendor</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">TANGGAL</th>
                        <th className="px-6 py-4 whitespace-nowrap">VENDOR</th>
                        <th className="px-6 py-4 whitespace-nowrap">JENIS</th>
                        <th className="px-6 py-4 whitespace-nowrap text-right">JUMLAH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockVendorPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">{payment.date}</td>
                          <td className="px-6 py-4 text-gray-900">{payment.vendor_name}</td>
                          <td className="px-6 py-4 uppercase text-xs font-semibold text-gray-500">{payment.type}</td>
                          <td className="px-6 py-4 font-medium text-right">{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "customer_payment" && (
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-800">History Pembayaran Customer</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">TANGGAL</th>
                        <th className="px-6 py-4 whitespace-nowrap">TERMIN</th>
                        <th className="px-6 py-4 whitespace-nowrap text-right">JUMLAH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockCustomerPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">{payment.date}</td>
                          <td className="px-6 py-4 uppercase text-xs font-semibold text-gray-500">{payment.termin}</td>
                          <td className="px-6 py-4 font-medium text-right text-green-700">{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
