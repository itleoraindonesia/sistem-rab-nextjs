"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, FileDown, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"

// Mock data based on database schema
const mockOutgoingLetters = [
  {
    id: "1",
    no_ref: "001/SK/LEORA/I/2026",
    title: "Surat Penawaran Proyek Perumahan Griya Asri",
    recipient: "PT Maju Jaya Konstruksi",
    status: "draft",
    created_by: "John Doe",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "2",
    no_ref: "002/SK/LEORA/I/2026",
    title: "Surat Kontrak Kerjasama Proyek Gedung Perkantoran",
    recipient: "CV Berkah Abadi",
    status: "under_review",
    created_by: "Jane Smith",
    reviewed_by: "Manager Review",
    created_at: "2026-01-09T14:30:00Z",
  },
  {
    id: "3",
    no_ref: "003/SK/LEORA/I/2026",
    title: "Surat Pemberitahuan Perubahan Harga Material",
    recipient: "PT Sumber Makmur",
    status: "approved",
    created_by: "Bob Wilson",
    approved_by: "Director",
    created_at: "2026-01-08T09:15:00Z",
  },
]

export default function SuratKeluarPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-brand-primary">Surat Keluar</h1>
          <p className="text-gray-600">Kelola surat keluar perusahaan dengan workflow approval</p>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Link href="/dokumen/surat-keluar/baru">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Surat Baru
            </Button>
          </Link>
        </div>

        {/* Info Alert */}
        <Alert className="bg-rose-50 border-rose-200">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertTitle className="text-rose-900">Preview Mode - Mock Data</AlertTitle>
          <AlertDescription className="text-rose-800">
            Ini adalah tampilan preview dengan data contoh. Database belum diimplementasikan.
            <br />
            <strong>Kolom yang ditampilkan:</strong> No Ref, Judul Surat, Penerima, Status, Pembuat, Tanggal
          </AlertDescription>
        </Alert>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">No Ref</th>
                    <th className="text-left p-4 font-semibold">Judul Surat</th>
                    <th className="text-left p-4 font-semibold">Penerima</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Pembuat</th>
                    <th className="text-left p-4 font-semibold">Tanggal</th>
                    <th className="text-left p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOutgoingLetters.map((letter) => (
                    <tr key={letter.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm">{letter.no_ref}</td>
                      <td className="p-4">{letter.title}</td>
                      <td className="p-4">{letter.recipient}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            letter.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : letter.status === "under_review"
                              ? "bg-orange-100 text-orange-800"
                              : letter.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {letter.status === "draft"
                            ? "Draft"
                            : letter.status === "under_review"
                            ? "Under Review"
                            : letter.status === "approved"
                            ? "Approved"
                            : letter.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{letter.created_by}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(letter.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        <Link href={`/dokumen/surat-keluar/${letter.id}`}>
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
      </div>
    </div>
  )
}
