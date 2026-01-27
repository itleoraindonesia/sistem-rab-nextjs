"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, Upload, X, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { RichTextEditor } from "../../../../../components/ui"
import { KATEGORI_SURAT } from "../page"

// Instansi options
const INSTANSI_OPTIONS = [
  "PT Maju Mandiri Gemilang Terang",
  "PT Leora Konstruksi Indonesia",
]

// Mock Pengirim Options
const SENDER_OPTIONS = [
  { id: "1", dept: "Sales & Marketing", name: "John Doe", email: "john.doe@leora.co.id" },
  { id: "2", dept: "Legal & Contract", name: "Jane Smith", email: "jane.smith@mmgt.co.id" },
  { id: "3", dept: "Procurement", name: "Bob Wilson", email: "bob.wilson@leora.co.id" },
]

interface Signature {
  id: string
  name: string
  position: string
  order: number
  pihak?: string
}

export default function BuatSuratKeluarPage() {
  const router = useRouter()
  const [attachments, setAttachments] = React.useState<Array<{ id: string; name: string; size: string }>>([])
  const [signatures, setSignatures] = React.useState<Signature[]>([
    { id: "1", name: "", position: "", order: 1, pihak: "" }
  ])
  const [hasLampiran, setHasLampiran] = React.useState(false)
  const [isiSurat, setIsiSurat] = React.useState('')
  const [pembuka, setPembuka] = React.useState('Dengan hormat,')
  const [penutup, setPenutup] = React.useState('Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.')
  
  const [perihal, setPerihal] = React.useState('')
  const [perihalError, setPerihalError] = React.useState('')
  
  const [selectedKategori, setSelectedKategori] = React.useState<string>("")
  const [selectedSenderId, setSelectedSenderId] = React.useState<string>("")
  const selectedSender = SENDER_OPTIONS.find(s => s.id === selectedSenderId)

  const handlePerihalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const words = value.trim().split(/\s+/)
    
    if (words.length > 4) {
      setPerihalError('Maksimal 4 kata')
    } else {
      setPerihalError('')
    }
    setPerihal(value)
  }

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

  const handleAddSignature = () => {
    const newSignature: Signature = {
      id: Date.now().toString(),
      name: "",
      position: "",
      order: signatures.length + 1,
      pihak: ""
    }
    setSignatures([...signatures, newSignature])
  }

  const handleRemoveSignature = (id: string) => {
    setSignatures(signatures.filter(sig => sig.id !== id))
  }

  const handleSignatureChange = (id: string, field: keyof Signature, value: string) => {
    setSignatures(signatures.map(sig => 
      sig.id === id ? { ...sig, [field]: value } : sig
    ))
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
            <p className="text-gray-600">Isi form dengan 5 section sesuai format surat resmi</p>
          </div>
        </div>

    

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form className="space-y-8">
              {/* Section 1: Identitas Surat */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Identitas Surat</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="no_ref">Nomor Surat</Label>
                    <Input 
                      id="no_ref" 
                      disabled 
                      placeholder="Auto-generated setelah approved"
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Akan dibuat otomatis saat surat di-approve
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="instansi">Instansi *</Label>
                    <select 
                      id="instansi"
                      className="w-full border rounded-md p-2 h-10"
                      defaultValue=""
                    >
                      <option value="" disabled>Pilih Instansi</option>
                      {INSTANSI_OPTIONS.map((inst) => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="kategori">Kategori Surat *</Label>
                    <div className="space-y-2">
                      <select 
                        id="kategori"
                        className="w-full border rounded-md p-2 h-10"
                        value={selectedKategori}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                      >
                        <option value="" disabled>Pilih Kategori</option>
                        {KATEGORI_SURAT.map((kat) => (
                          <option key={kat.label} value={kat.label}>{kat.label}</option>
                        ))}
                      </select>
                      
                      {selectedKategori && (
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 border border-blue-100">
                          {KATEGORI_SURAT.find(k => k.label === selectedKategori)?.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tanggal">Tanggal *</Label>
                    <Input 
                      id="tanggal" 
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default: hari ini
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Konten Surat */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">Konten Surat</h3>
                </div>

                <div>
                  <Label htmlFor="perihal">Perihal *</Label>
                  <Input 
                    id="perihal" 
                    placeholder="Contoh: Penawaran Proyek"
                    value={perihal}
                    onChange={handlePerihalChange}
                    className={perihalError ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between mt-1">
                    <p className={`text-xs ${perihalError ? "text-red-500 font-medium" : "text-gray-500"}`}>
                      {perihalError || "Ringkasan singkat isi surat"}
                    </p>
                    <p className={`text-xs ${perihal.trim().split(/\s+/).length > 4 ? "text-red-500" : "text-gray-500"}`}>
                      {perihal ? perihal.trim().split(/\s+/).length : 0}/4 Kata
                    </p>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-4 bg-gray-50/50">
                   <Label className="text-base text-gray-700 font-semibold">Struktur Isi Surat:</Label>
                   
                   {/* Pembuka */}
                   <div>
                      <Label htmlFor="pembuka">Pembuka</Label>
                      <textarea
                        id="pembuka"
                        value={pembuka}
                        onChange={(e) => setPembuka(e.target.value)}
                        className="w-full min-h-[60px] p-3 border rounded-md mt-1 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Dengan hormat,"
                      />
                   </div>

                   {/* Isi Utama */}
                    <div>
                      <Label htmlFor="isi_surat">Isi Utama *</Label>
                      <RichTextEditor
                        value={isiSurat}
                        onChange={setIsiSurat}
                        placeholder="Tuliskan inti surat di sini..."
                        className="mt-1 bg-white"
                      />
                    </div>

                   {/* Penutup */}
                   <div>
                      <Label htmlFor="penutup">Penutup</Label>
                      <textarea
                        id="penutup"
                        value={penutup}
                        onChange={(e) => setPenutup(e.target.value)}
                        className="w-full min-h-[60px] p-3 border rounded-md mt-1 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Hormat kami,"
                      />
                   </div>
                </div>
              </div>

              {/* Section 3: Pengirim */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">Pengirim</h3>
                </div>

                <div className="p-4 rounded-md border bg-white">
                  <div className="mb-4">
                     <Label>Pilih Data Pengirim *</Label>
                     <select
                        className="w-full border rounded-md p-2 mt-1"
                        value={selectedSenderId}
                        onChange={(e) => setSelectedSenderId(e.target.value)}
                     >
                       <option value="" disabled>-- Pilih Nama/Unit Pengirim --</option>
                       {SENDER_OPTIONS.map(sender => (
                         <option key={sender.id} value={sender.id}>
                           {sender.name} - {sender.dept}
                         </option>
                       ))}
                     </select>
                  </div>

                  {selectedSender && (
                    <div className="bg-green-50 p-4 rounded-md border border-green-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-green-900 text-xs uppercase tracking-wide">Departemen</Label>
                        <p className="font-medium text-green-900">{selectedSender.dept}</p>
                      </div>
                      <div>
                        <Label className="text-green-900 text-xs uppercase tracking-wide">Nama</Label>
                         <p className="font-medium text-green-900">{selectedSender.name}</p>
                      </div>
                      <div>
                        <Label className="text-green-900 text-xs uppercase tracking-wide">Email</Label>
                         <p className="font-medium text-green-900">{selectedSender.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Penerima */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <h3 className="text-lg font-semibold">Penerima</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="penerima_instansi">Nama Instansi *</Label>
                    <Input 
                      id="penerima_instansi" 
                      placeholder="PT Maju Jaya Konstruksi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="penerima_nama">Nama Penerima *</Label>
                    <Input 
                      id="penerima_nama" 
                      placeholder="Budi Santoso"
                    />
                  </div>

                  <div>
                    <Label htmlFor="penerima_whatsapp">WhatsApp Number *</Label>
                    <Input 
                      id="penerima_whatsapp" 
                      type="tel"
                      placeholder="+62812345678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="penerima_email">Email</Label>
                    <Input 
                      id="penerima_email" 
                      type="email"
                      placeholder="budi@majujaya.co.id"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="penerima_alamat">Alamat *</Label>
                    <Input 
                      id="penerima_alamat" 
                      placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Lampiran & Tanda Tangan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <h3 className="text-lg font-semibold">Lampiran & Tanda Tangan</h3>
                </div>

                {/* Lampiran */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="has_lampiran"
                      checked={hasLampiran}
                      onChange={(e) => setHasLampiran(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="has_lampiran" className="cursor-pointer">
                      Surat ini memiliki lampiran dokumen
                    </Label>
                  </div>

                  {hasLampiran && (
                    <div className="ml-7 space-y-3">
                      <div>
                        <Button type="button" variant="outline" onClick={handleAddFile}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          Max 5MB per file - PDF, DOC, DOCX, JPG, PNG
                        </p>
                      </div>

                      {/* File List */}
                      {attachments.length > 0 && (
                        <div className="space-y-2">
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
                  )}
                </div>

                {/* Tanda Tangan */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Kolom Tanda Tangan *</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddSignature}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah TTD
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Definisikan siapa saja yang bertanda tangan.
                  </p>

                  <div className="space-y-3">
                    {signatures.map((sig, index) => (
                      <div 
                        key={sig.id}
                        className="p-4 border rounded-md bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-sm font-medium text-gray-700">
                            Tanda Tangan #{index + 1}
                          </p>
                          {signatures.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSignature(sig.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 -mt-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           <div>
                            <Label htmlFor={`sig_pihak_${sig.id}`}>Pihak</Label>
                            <Input 
                              id={`sig_pihak_${sig.id}`}
                              placeholder="Cth: Pihak Pertama"
                              value={sig.pihak}
                              onChange={(e) => handleSignatureChange(sig.id, 'pihak', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`sig_name_${sig.id}`}>Nama *</Label>
                            <Input 
                              id={`sig_name_${sig.id}`}
                              placeholder="Nama Lengkap"
                              value={sig.name}
                              onChange={(e) => handleSignatureChange(sig.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`sig_position_${sig.id}`}>Jabatan *</Label>
                            <Input 
                              id={`sig_position_${sig.id}`}
                              placeholder="Jabatan"
                              value={sig.position}
                              onChange={(e) => handleSignatureChange(sig.id, 'position', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workflow Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Workflow</h3>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Alur Persetujuan:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li><strong>Draft</strong> (Anda sedang di sini)</li>
                    <li>Submit → Menunggu Review</li>
                    <li>Review oleh Reviewer → Approve/Request Revision</li>
                    <li>Approval oleh Approver → Approve/Reject</li>
                    <li><strong>Published</strong> → Surat siap dikirim (Nomor surat di-generate)</li>
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
