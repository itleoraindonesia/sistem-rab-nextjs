"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { RichTextEditor } from "../../../../../components/ui"

export default function BuatMemoPage() {
  const router = useRouter()
  const [isiMemo, setIsiMemo] = React.useState('')

  return (
 <div >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Buat Internal Memo Baru</h1>
            <p className="text-gray-600">Isi form di bawah untuk membuat memo internal</p>
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
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Dasar</h3>
                
                <div>
                  <Label htmlFor="title">Judul Memo *</Label>
                  <Input id="title" placeholder="Contoh: Pengumuman Libur Akhir Tahun..." />
                </div>

                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <select id="priority" className="w-full border rounded-md p-2">
                    <option value="low">Low</option>
                    <option value="normal" selected>Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="content">Isi Memo *</Label>
                  <RichTextEditor
                    value={isiMemo}
                    onChange={setIsiMemo}
                    placeholder={`Sehubungan dengan...

Dengan ini diberitahukan bahwa...

Untuk itu, dimohon agar...

Demikian memo ini disampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih.

[Gunakan toolbar di atas untuk memformat teks memo]`}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Rich text editor dengan toolbar lengkap untuk memformat memo profesional
                  </p>
                </div>
              </div>

              {/* Recipients Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Penerima</h3>
                
                <div>
                  <Label htmlFor="recipients">Pilih Penerima *</Label>
                  <div className="mt-2 p-4 border rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Multi-select users (akan menggunakan component)</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">All Staff</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Management</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">HR Department</span>
                    </div>
                  </div>
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
                    <li>Published → Memo tersedia untuk penerima</li>
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

        {/* Database Schema Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Field Mapping ke Database</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Form Fields → Database Columns:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>• Judul Memo → title (string)</li>
                  <li>• Priority → priority (enum)</li>
                  <li>• Isi Memo → content (text)</li>
                  <li>• Penerima → recipients (jsonb/array)</li>
                  <li>• Status → status (enum)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Auto-filled Fields:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>• created_by → current user ID</li>
                  <li>• created_at → current timestamp</li>
                  <li>• reviewed_by → assigned reviewer</li>
                  <li>• approved_by → assigned approver</li>
                  <li>• published_at → on publish</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
