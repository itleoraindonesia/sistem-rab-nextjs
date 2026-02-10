"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, FileDown, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"
import { useLetters } from "../../../../hooks/useLetters"





export default function SuratKeluarPage() {
  const { data: letters, isLoading, error } = useLetters()

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Memuat data surat keluar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

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
          <Link href="/documents/outgoing-letter/baru">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Surat Baru
            </Button>
          </Link>
        </div>



        {/* Table */}
        <Card>
          <CardContent className="p-6">
            {!letters || letters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada surat keluar. Klik "Buat Surat Baru" untuk memulai.</p>
              </div>
            ) : (
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
                    <th className="text-left p-4 font-semibold">Tanggal</th>
                    <th className="text-left p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {letters.map((letter) => (
                    <tr key={letter.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm">
                        {letter.document_number || <span className="text-gray-400 italic">Pending</span>}
                      </td>
                      <td className="p-4 text-sm">{letter.company?.nama || '-'}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                          {letter.document_type?.name || '-'}
                        </span>
                      </td>
                      <td className="p-4">{letter.subject}</td>
                      <td className="p-4 text-sm">{letter.recipient_company}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            letter.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-800"
                              : letter.status === "SUBMITTED_TO_REVIEW"
                              ? "bg-orange-100 text-orange-800"
                              : letter.status === "REVIEWED"
                              ? "bg-blue-100 text-blue-800"
                              : letter.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : letter.status === "NEEDS_REVISION"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {letter.status === "DRAFT"
                            ? "Draft"
                            : letter.status === "SUBMITTED_TO_REVIEW"
                            ? "Under Review"
                            : letter.status === "REVIEWED"
                            ? "Reviewed"
                            : letter.status === "APPROVED"
                            ? "Approved"
                            : letter.status === "NEEDS_REVISION"
                            ? "Needs Revision"
                            : letter.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(letter.letter_date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        <Link href={`/documents/outgoing-letter/${letter.id}`}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
