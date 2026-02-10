"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, FileDown, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"

// Mock data for Internal Memo
const mockMemos = [
  {
    id: "1",
    title: "Pengumuman Libur Akhir Tahun 2026",
    priority: "normal",
    recipients: ["All Staff", "Management"],
    status: "published",
    created_by: "HR Department",
    reviewed_by: "HR Manager",
    approved_by: "Director",
    created_at: "2026-01-10T10:00:00Z",
    published_at: "2026-01-11T15:00:00Z",
  },
  {
    id: "2",
    title: "Update Prosedur Keamanan Kantor",
    priority: "high",
    recipients: ["Security Team", "All Staff"],
    status: "under_review",
    created_by: "Security Manager",
    created_at: "2026-01-09T14:30:00Z",
  },
  {
    id: "3",
    title: "Perubahan Jam Operasional Kantor",
    priority: "urgent",
    recipients: ["All Staff"],
    status: "approved",
    created_by: "Admin",
    reviewed_by: "Office Manager",
    approved_by: "Director",
    created_at: "2026-01-08T09:00:00Z",
  },
]

export default function InternalMemoPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-brand-primary">Internal Memo</h1>
          <p className="text-gray-600">Memo internal untuk komunikasi antar departemen</p>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Link href="/documents/memo/baru">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Memo Baru
            </Button>
          </Link>
        </div>

        {/* Info Alert */}
        <Alert className="bg-rose-50 border-rose-200">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertTitle className="text-rose-900">Preview Mode - Mock Data</AlertTitle>
          <AlertDescription className="text-rose-800">
            Workflow: Draft → Submit → Review → Approval → Published (sama seperti Surat Keluar)
            <br />
            <strong>Kolom:</strong> Judul, Priority, Penerima, Status, Pembuat, Tanggal
          </AlertDescription>
        </Alert>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Judul Memo</th>
                    <th className="text-left p-4 font-semibold">Priority</th>
                    <th className="text-left p-4 font-semibold">Penerima</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Pembuat</th>
                    <th className="text-left p-4 font-semibold">Tanggal</th>
                    <th className="text-left p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMemos.map((memo) => (
                    <tr key={memo.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{memo.title}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            memo.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : memo.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : memo.priority === "normal"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {memo.priority === "urgent"
                            ? "Urgent"
                            : memo.priority === "high"
                            ? "High"
                            : memo.priority === "normal"
                            ? "Normal"
                            : "Low"}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{memo.recipients.join(", ")}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            memo.status === "published"
                              ? "bg-green-100 text-green-800"
                              : memo.status === "under_review"
                              ? "bg-orange-100 text-orange-800"
                              : memo.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {memo.status === "published"
                            ? "Published"
                            : memo.status === "under_review"
                            ? "Under Review"
                            : memo.status === "approved"
                            ? "Approved"
                            : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{memo.created_by}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(memo.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        <Link href={`/documents/memo/${memo.id}`}>
                          <Button variant="ghost" size="sm">
                            Detail
                          </Button>
                        </Link>
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
            <h3 className="font-semibold mb-4">📋 Database Schema - internal_memos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Core Fields:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• id (uuid, primary key)</li>
                  <li>• title (string, required)</li>
                  <li>• content (text, rich text)</li>
                  <li>• priority (enum: low, normal, high, urgent)</li>
                  <li>• status (enum: draft, submitted, under_review, approved, published)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Workflow & Relations:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• created_by (uuid, foreign key to users)</li>
                  <li>• reviewed_by (uuid, nullable)</li>
                  <li>• approved_by (uuid, nullable)</li>
                  <li>• recipients (array of user IDs or JSON)</li>
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
