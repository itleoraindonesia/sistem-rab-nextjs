"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, FileDown, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"

// Kategori Surat Options
export const KATEGORI_SURAT = [
  "Surat Penawaran",
  "Surat Kontrak",
  "Surat Pemberitahuan",
  "Surat Permohonan",
  "Surat Keterangan",
  "Lainnya",
] as const

// Mock data based on new specification
const mockOutgoingLetters = [
  {
    id: "1",
    // Section 1: Identitas Surat
    no_ref: null, // auto-generated when approved
    instansi: "PT Leora Konstruksi Indonesia",
    kategori_surat: "Surat Penawaran",
    tanggal: "2026-01-10T10:00:00Z",
    
    // Section 2: Konten Surat
    perihal: "Penawaran Proyek Perumahan Griya Asri",
    isi_surat: "Dengan hormat, kami mengajukan penawaran untuk proyek pembangunan perumahan...",
    
    // Section 3: Pengirim (auto-filled from login)
    pengirim: {
      dept: "Sales & Marketing",
      name: "John Doe",
      email: "john.doe@leora.co.id",
    },
    
    // Section 4: Penerima
    penerima: {
      nama_instansi: "PT Maju Jaya Konstruksi",
      nama_penerima: "Budi Santoso",
      alamat: "Jl. Sudirman No. 123, Jakarta Pusat",
      whatsapp: "+62812345678",
      email: "budi@majujaya.co.id",
    },
    
    // Section 5: Lampiran & Tanda Tangan
    has_lampiran: true,
    lampiran_files: ["proposal.pdf", "rab.xlsx"],
    signatures: [
      { name: "John Doe", position: "Sales Manager", order: 1 },
      { name: "Jane Smith", position: "Director", order: 2 },
    ],
    
    // Workflow
    status: "draft",
    created_by: "John Doe",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "2",
    no_ref: "002/SK/LEORA/I/2026",
    instansi: "PT Maju Mandiri Gemilang Terang",
    kategori_surat: "Surat Kontrak",
    tanggal: "2026-01-09T14:30:00Z",
    
    perihal: "Kontrak Kerjasama Proyek Gedung Perkantoran",
    isi_surat: "Berdasarkan kesepakatan bersama, kami menyetujui kontrak kerjasama...",
    
    pengirim: {
      dept: "Legal & Contract",
      name: "Jane Smith",
      email: "jane.smith@mmgt.co.id",
    },
    
    penerima: {
      nama_instansi: "CV Berkah Abadi",
      nama_penerima: "Ahmad Wijaya",
      alamat: "Jl. Gatot Subroto No. 45, Bandung",
      whatsapp: "+62823456789",
      email: "ahmad@berkah.co.id",
    },
    
    has_lampiran: false,
    lampiran_files: [],
    signatures: [
      { name: "Jane Smith", position: "Legal Manager", order: 1 },
    ],
    
    status: "under_review",
    created_by: "Jane Smith",
    reviewed_by: "Manager Review",
    created_at: "2026-01-09T14:30:00Z",
  },
  {
    id: "3",
    no_ref: "003/SK/LEORA/I/2026",
    instansi: "PT Leora Konstruksi Indonesia",
    kategori_surat: "Surat Pemberitahuan",
    tanggal: "2026-01-08T09:15:00Z",
    
    perihal: "Pemberitahuan Perubahan Harga Material",
    isi_surat: "Dengan ini kami memberitahukan adanya perubahan harga material konstruksi...",
    
    pengirim: {
      dept: "Procurement",
      name: "Bob Wilson",
      email: "bob.wilson@leora.co.id",
    },
    
    penerima: {
      nama_instansi: "PT Sumber Makmur",
      nama_penerima: "Siti Nurhaliza",
      alamat: "Jl. Asia Afrika No. 78, Surabaya",
      whatsapp: "+62834567890",
      email: "siti@sumbermakmur.co.id",
    },
    
    has_lampiran: true,
    lampiran_files: ["price_list_2026.pdf"],
    signatures: [
      { name: "Bob Wilson", position: "Procurement Manager", order: 1 },
      { name: "Director", position: "Director", order: 2 },
    ],
    
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
            <strong>Struktur Dokumen:</strong> 5 Section (Identitas, Konten, Pengirim, Penerima, Lampiran & TTD)
            <br />
            <strong>Kategori:</strong> Dropdown pilihan tetap | <strong>TTD:</strong> Support multiple signatures
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
                    <th className="text-left p-4 font-semibold">Instansi</th>
                    <th className="text-left p-4 font-semibold">Kategori</th>
                    <th className="text-left p-4 font-semibold">Perihal</th>
                    <th className="text-left p-4 font-semibold">Penerima</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">TTD</th>
                    <th className="text-left p-4 font-semibold">Tanggal</th>
                    <th className="text-left p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOutgoingLetters.map((letter) => (
                    <tr key={letter.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm">
                        {letter.no_ref || <span className="text-gray-400 italic">Auto-generated</span>}
                      </td>
                      <td className="p-4 text-sm">{letter.instansi}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                          {letter.kategori_surat}
                        </span>
                      </td>
                      <td className="p-4">{letter.perihal}</td>
                      <td className="p-4 text-sm">{letter.penerima.nama_instansi}</td>
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
                      <td className="p-4 text-sm text-gray-600">
                        {letter.signatures.length} orang
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(letter.tanggal).toLocaleDateString("id-ID")}
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
