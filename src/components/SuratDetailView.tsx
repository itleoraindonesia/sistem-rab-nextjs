import * as React from "react"
import { FileDown, User, Building2, Mail, Phone, MapPin, FileText } from "lucide-react"
import { Card, CardContent } from "./ui"
import Button from "./ui/Button"
import { Label } from "./ui/label"

interface Signature {
  name: string
  position: string
  order: number
  pihak?: string // New field
}

interface Pengirim {
  dept: string
  name: string
  email: string
  // Added optional ID if needed for dropdown logic later, but keeping simple for now
}

interface Penerima {
  nama_instansi: string
  nama_penerima: string
  alamat: string
  whatsapp: string
  email?: string
}

interface SuratData {
  // Section 1: Identitas Surat
  no_ref: string | null
  instansi: string
  kategori_surat: string
  tanggal: string
  
  // Section 2: Konten Surat
  perihal: string
  // Changed from string to object
  isi_surat: {
    pembuka: string
    isi: string
    penutup: string
  }
  
  // Section 3: Pengirim
  pengirim: Pengirim
  
  // Section 4: Penerima
  penerima: Penerima
  
  // Section 5: Lampiran & Tanda Tangan
  has_lampiran: boolean
  lampiran_files?: string[]
  signatures: Signature[]
}

interface SuratDetailViewProps {
  data: SuratData
  showSectionNumbers?: boolean
}

export function SuratDetailView({ data, showSectionNumbers = false }: SuratDetailViewProps) {
  const SectionHeader = ({ number, title }: { number: number; title: string }) => (
    <div className="flex items-center gap-2 border-b pb-2 mb-4">
      {showSectionNumbers && (
        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
          {number}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Section 1: Identitas Surat */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader number={1} title="Identitas Surat" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Nomor Surat</Label>
              <p className="font-mono font-medium mt-1">
                {data.no_ref || <span className="text-gray-400 italic">Belum di-generate</span>}
              </p>
            </div>
            
            <div>
              <Label className="text-gray-600">Instansi</Label>
              <p className="font-medium mt-1">{data.instansi}</p>
            </div>

            <div>
              <Label className="text-gray-600">Kategori Surat</Label>
              <div className="mt-1">
                <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                  {data.kategori_surat}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-gray-600">Tanggal</Label>
              <p className="font-medium mt-1">
                {new Date(data.tanggal).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Konten Surat */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader number={2} title="Konten Surat" />

          <div className="space-y-4">
            <div>
              <Label className="text-gray-600">Perihal</Label>
              <p className="font-semibold text-lg mt-1">{data.perihal}</p>
            </div>

            <div>
              <Label className="text-gray-600">Isi Surat</Label>
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-2 space-y-4">
                {/* Pembuka */}
                <div>
                  <p className="whitespace-pre-wrap">{data.isi_surat.pembuka}</p>
                </div>

                {/* Isi HTML */}
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data.isi_surat.isi }}
                />

                {/* Penutup */}
                <div>
                  <p className="whitespace-pre-wrap">{data.isi_surat.penutup}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Pengirim */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader number={3} title="Pengirim" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departemen
              </Label>
              <p className="font-medium mt-1">{data.pengirim.dept}</p>
            </div>

            <div>
              <Label className="text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nama
              </Label>
              <p className="font-medium mt-1">{data.pengirim.name}</p>
            </div>

            <div>
              <Label className="text-gray-600 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="font-medium mt-1">{data.pengirim.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Penerima */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader number={4} title="Penerima" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Nama Instansi
              </Label>
              <p className="font-medium mt-1">{data.penerima.nama_instansi}</p>
            </div>

            <div>
              <Label className="text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nama Penerima
              </Label>
              <p className="font-medium mt-1">{data.penerima.nama_penerima}</p>
            </div>

            <div>
              <Label className="text-gray-600 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </Label>
              <p className="font-medium mt-1">{data.penerima.whatsapp}</p>
            </div>

            <div>
              <Label className="text-gray-600 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="font-medium mt-1">{data.penerima.email || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alamat
              </Label>
              <p className="font-medium mt-1">{data.penerima.alamat}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Lampiran & Tanda Tangan */}
      <Card>
        <CardContent className="p-6">
          <SectionHeader number={5} title="Lampiran & Tanda Tangan" />

          <div className="space-y-6">
            {/* Lampiran */}
            <div>
              <Label className="text-gray-600 flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" />
                Lampiran Dokumen
              </Label>
              
              {data.has_lampiran && data.lampiran_files && data.lampiran_files.length > 0 ? (
                <div className="space-y-2">
                  {data.lampiran_files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <FileDown className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{file}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Lihat File
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Tidak ada lampiran</p>
              )}
            </div>

            {/* Tanda Tangan */}
            <div className="pt-4 border-t">
              <Label className="text-gray-600 flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                Penandatangan ({data.signatures.length} orang)
              </Label>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-3">
                <p className="text-sm text-blue-800">
                  ℹ️ Field tanda tangan akan tersedia di PDF yang di-generate setelah dokumen di-approve
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.signatures.map((sig, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-md bg-white"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray-500">TTD #{sig.order}</p>
                      {sig.pihak && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {sig.pihak}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm">{sig.name}</p>
                    <p className="text-xs text-gray-600">{sig.position}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
