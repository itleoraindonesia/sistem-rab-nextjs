"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, FileDown, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"

// Mock data for MoM
const mockMoMs = [
  {
    id: "1",
    title: "Rapat Koordinasi Proyek Q1 2026",
    meeting_date: "2026-01-15T14:00:00Z",
    meeting_type: "internal",
    participants: ["John Doe", "Jane Smith", "Bob Wilson"],
    status: "published",
    created_by: "Meeting Secretary",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "2",
    title: "Meeting dengan Klien PT Maju Jaya",
    meeting_date: "2026-01-12T10:00:00Z",
    meeting_type: "external",
    participants: ["Director", "Sales Manager", "Client Representative"],
    status: "draft",
    created_by: "Sales Admin",
    created_at: "2026-01-09T14:30:00Z",
  },
]

export default function MoMPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-brand-primary">Minutes of Meeting (MoM)</h1>
          <p className="text-gray-600">Dokumentasi notulen rapat internal dan eksternal</p>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Link href="/dokumen/mom/baru">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat MoM Baru
            </Button>
          </Link>
        </div>

        {/* Info Alert */}
        <Alert className="bg-rose-50 border-rose-200">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertTitle className="text-rose-900">Preview Mode - Mock Data</AlertTitle>
          <AlertDescription className="text-rose-800">
            Workflow: Draft → Published (No approval - dokumentasi factual)
            <br />
            <strong>Kolom:</strong> Judul, Tanggal Meeting, Tipe, Peserta, Status, Pembuat
          </AlertDescription>
        </Alert>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Judul Meeting</th>
                    <th className="text-left p-4 font-semibold">Tanggal</th>
                    <th className="text-left p-4 font-semibold">Tipe</th>
                    <th className="text-left p-4 font-semibold">Peserta</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Pembuat</th>
                    <th className="text-left p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMoMs.map((mom) => (
                    <tr key={mom.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{mom.title}</td>
                      <td className="p-4 text-sm">
                        {new Date(mom.meeting_date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            mom.meeting_type === "internal"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {mom.meeting_type === "internal" ? "Internal" : "External"}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{mom.participants.length} peserta</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            mom.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {mom.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{mom.created_by}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Database Schema Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Database Schema - mom_meetings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Core Fields:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• id (uuid, primary key)</li>
                  <li>• title (string, required)</li>
                  <li>• meeting_date (timestamp, required)</li>
                  <li>• meeting_type (enum: internal, external)</li>
                  <li>• content (text, fulltext/rich text)</li>
                  <li>• status (enum: draft, published)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Relations:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• created_by (uuid, foreign key to users)</li>
                  <li>• participants (array of user IDs or JSON)</li>
                  <li>• created_at (timestamp)</li>
                  <li>• published_at (timestamp, nullable)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
