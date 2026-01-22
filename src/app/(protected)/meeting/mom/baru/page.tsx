"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"

export default function BuatMoMPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Buat Minutes of Meeting Baru</h1>
            <p className="text-gray-600">Dokumentasi notulen rapat</p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertTitle>Preview Mode - Form Fields</AlertTitle>
          <AlertDescription>
            Form ini menampilkan semua field yang akan ada di database. Belum ada fungsi simpan.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Meeting</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Judul Meeting *</Label>
                    <Input id="title" placeholder="Contoh: Rapat Koordinasi Proyek Q1..." />
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting_type">Tipe Meeting *</Label>
                    <select id="meeting_type" className="w-full border rounded-md p-2">
                      <option value="internal" selected>Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meeting_date">Tanggal Meeting *</Label>
                    <Input id="meeting_date" type="date" />
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting_time">Waktu Meeting *</Label>
                    <Input id="meeting_time" type="time" />
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Peserta Meeting</h3>
                
                <div>
                  <Label htmlFor="participants">Pilih Peserta *</Label>
                  <div className="mt-2 p-4 border rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Multi-select users (akan menggunakan component)</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">John Doe</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Jane Smith</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Bob Wilson</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Deskripsi Meeting</h3>

                <div>
                  <Label htmlFor="description">Deskripsi Meeting *</Label>
                  <textarea
                    id="description"
                    rows={8}
                    className="w-full border rounded-md p-3"
                    placeholder="Jelaskan tujuan dan agenda meeting... (akan menggunakan rich text editor)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Akan menggunakan rich text editor untuk format yang lebih baik
                  </p>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Lampiran File</h3>

                <div>
                  <Label htmlFor="attachments">Upload File Lampiran</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      className="w-full border rounded-md p-2"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      💡 Support: PDF, Office docs, gambar. Max 10MB per file
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Features Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">AI MoM Generator (Opsional)</h3>

                <div className="bg-purple-50 p-4 rounded-md">
                  <h4 className="font-medium text-purple-900 mb-2">Generate MoM Otomatis dari Rekaman</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Upload rekaman meeting untuk generate MoM PDF otomatis dengan AI
                  </p>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="recording">Upload Rekaman Meeting (Audio/Video)</Label>
                      <input
                        type="file"
                        id="recording"
                        className="w-full border rounded-md p-2 mt-1"
                        accept=".mp3,.wav,.m4a,.mp4,.avi,.mov"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        💡 Support: MP3, WAV, MP4, AVI, MOV. Max 100MB
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="use_ai" className="rounded" />
                      <Label htmlFor="use_ai" className="text-sm">
                        Generate MoM PDF dengan AI setelah meeting selesai
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Workflow</h3>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Alur Publikasi:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Draft (Anda sedang di sini)</li>
                    <li>Publish → Langsung tersedia untuk peserta (No approval needed)</li>
                    <li>Dokumentasi factual, tidak perlu approval</li>
                  </ol>
                </div>

                <div>
                  <Label>Status Saat Ini</Label>
                  <div className="mt-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      Draft
                    </span>
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
                  Publish MoM
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Database Schema Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Field Mapping ke Database - mom_meetings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Core Fields:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>• title → string (required)</li>
                  <li>• meeting_type → enum: internal/external</li>
                  <li>• meeting_date → timestamp (required)</li>
                  <li>• participants → jsonb array (required)</li>
                  <li>• description → text (required)</li>
                  <li>• attachments → jsonb array files</li>
                  <li>• status → enum: draft/published</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">AI Features:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>• original_recording → file (audio/video)</li>
                  <li>• transcription → text</li>
                  <li>• ai_generated_content → text</li>
                  <li>• ai_processing_status → enum</li>
                  <li>• pdf_file → file (AI generated)</li>
                  <li>• pdf_generated_at → timestamp</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Auto-filled Fields:</h4>
              <ul className="space-y-1 text-gray-600 font-mono text-xs">
                <li>• created_by → current user ID</li>
                <li>• created_at → current timestamp</li>
                <li>• published_at → on publish (nullable)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
