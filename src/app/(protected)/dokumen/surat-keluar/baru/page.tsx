"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, Upload, X } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"

export default function BuatSuratKeluarPage() {
  const router = useRouter()
  const [attachments, setAttachments] = React.useState<Array<{ id: string; name: string; size: string }>>([])

  const handleAddFile = () => {
    // Mock file addition - in real app, this would open file picker
    const newFile = {
      id: Date.now().toString(),
      name: `document-${attachments.length + 1}.pdf`,
      size: "2.3 MB"
    }
    setAttachments([...attachments, newFile])
  }

  const handleRemoveFile = (id: string) => {
    setAttachments(attachments.filter(file => file.id !== id))
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Buat Surat Keluar Baru</h1>
            <p className="text-gray-600">Isi form di bawah untuk membuat surat keluar</p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="bg-rose-50 border-rose-200">
          <AlertTitle className="text-rose-900">Preview Mode - Form Fields</AlertTitle>
          <AlertDescription className="text-rose-800">
            Form ini menampilkan semua field yang akan ada di database. Belum ada fungsi simpan.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Dasar</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Judul Surat *</Label>
                    <Input id="title" placeholder="Contoh: Surat Penawaran Proyek..." />
                  </div>
                  
                  <div>
                    <Label htmlFor="recipient">Penerima *</Label>
                    <Input id="recipient" placeholder="Nama perusahaan/instansi penerima" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Isi Surat *</Label>
                  <textarea
                    id="content"
                    rows={10}
                    className="w-full border rounded-md p-3"
                    placeholder="Tulis isi surat di sini... (akan menggunakan rich text editor)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Akan menggunakan rich text editor (TipTap/Quill) untuk formatting
                  </p>
                </div>
              </div>

              {/* Attachment Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Lampiran</h3>
                
                <div>
                  <Label htmlFor="attachment">Upload File (Opsional)</Label>
                  <div className="mt-2">
                    <Button type="button" variant="outline" onClick={handleAddFile}>
                      <Upload className="mr-2 h-4 w-4" />
                      Tambah File
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Max 5MB per file - PDF, DOC, DOCX, JPG, PNG
                    </p>
                  </div>

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">File yang akan diupload ({attachments.length}):</p>
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                              📄
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-600">{file.size}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(file.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Workflow Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Workflow</h3>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Alur Persetujuan:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Draft (Anda sedang di sini)</li>
                    <li>Submit → Menunggu Review</li>
                    <li>Review oleh Reviewer → Approve/Request Revision</li>
                    <li>Approval oleh Approver → Approve/Reject</li>
                    <li>Published → Surat siap dikirim</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status Saat Ini</Label>
                    <div className="mt-2">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        Draft
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Nomor Surat</Label>
                    <p className="text-sm text-gray-500 mt-2">
                      Akan di-generate otomatis setelah approval
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="button" variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Draft
                </Button>
                <Button type="button">
                  <Send className="mr-2 h-4 w-4" />
                  Submit untuk Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
