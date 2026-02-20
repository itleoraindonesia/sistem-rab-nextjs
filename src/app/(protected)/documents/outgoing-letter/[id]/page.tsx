"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, Printer, FileDown, MessageSquare, Hash, Send, BarChart3, AlertCircle, Pencil } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { useLetter, useSubmitForReview } from "../../../../../hooks/useLetters"
import { useUser } from "../../../../../hooks/useUser"
import { LetterHistory } from "../../../../../types/letter"

export default function SuratDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { data: user } = useUser()

  const { data: letter, isLoading, error } = useLetter(id)
  const submitMutation = useSubmitForReview()

  // Debug logging
  React.useEffect(() => {
    console.log('Letter ID:', id);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);
    console.log('Letter Data:', letter);
  }, [id, isLoading, error, letter]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-4"></div>
          <p>Memuat data surat...</p>
        </div>
      </div>
    )
  }

  if (error || !letter) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ? (error as Error).message : "Surat tidak ditemukan"}
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    )
  }

  // Helper to get approval info
  const approvalHistory = letter.histories?.find((h: LetterHistory) => h.to_status === 'APPROVED');
  const approverName = approvalHistory?.action_by?.nama || '-';

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Preview Surat</h1>
              <p className="text-gray-600">{letter.document_number || "Draft"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {letter.status === 'DRAFT' && (
              <>
                <Button 
                  onClick={() => router.push(`/documents/outgoing-letter/${id}/edit`)}
                  variant="outline"
                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  onClick={async () => {
                  if (!user) {
                    alert('User tidak ditemukan');
                    return;
                  }
                  
                  if (confirm('Submit surat ini untuk review?\n\nSurat akan dikirim ke reviewer untuk ditinjau.')) {
                    try {
                      await submitMutation.mutateAsync(id);
                      alert('Surat berhasil disubmit untuk review!');
                      router.push('/documents/outgoing-letter');
                    } catch (error: any) {
                      console.error('Submit error:', error);
                      alert(`Gagal submit surat: ${error.message || 'Unknown error'}`);
                    }
                  }
                }}
                disabled={submitMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitMutation.isPending ? 'Submitting...' : 'Submit untuk Review'}
              </Button>
              </>
            )}
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Document Metadata */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Informasi Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded text-xs ${
                     letter.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                     letter.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                     'bg-blue-100 text-blue-800'
                  }`}>
                    {letter.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Nomor Surat:</p>
                <p className="font-medium font-mono">{letter.document_number || "-"}</p>
              </div>
              <div>
                <p className="text-gray-600">Dibuat oleh:</p>
                <p className="font-medium">{letter.created_by?.nama}</p>
              </div>
              <div>
                <p className="text-gray-600">Tanggal Dibuat:</p>
                <p className="font-medium">
                  {new Date(letter.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
              {approverName !== '-' && (
                 <>
                  <div>
                     <p className="text-gray-600">Disetujui oleh:</p>
                     <p className="font-medium">{approverName}</p>
                  </div>
                  <div>
                     <p className="text-gray-600">Tanggal Approval:</p>
                     <p className="font-medium">
                        {approvalHistory?.created_at ? new Date(approvalHistory.created_at).toLocaleDateString("id-ID", {
                           day: "2-digit",
                           month: "long",
                           year: "numeric"
                        }) : '-'}
                     </p>
                  </div>
                 </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Letter Preview - A4 Format */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            {/* A4 Paper Simulation */}
            <div className="bg-white flex flex-col" style={{ aspectRatio: "210/297" }}>
              {/* HEADER - Company Letterhead */}
              <div className="border-b-4 border-brand-primary p-8">
                <div className="flex items-start justify-between">
                  {/* Logo & Company Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                      L
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-brand-primary">PT LEORA INDONESIA</h2>
                      <p className="text-sm text-gray-600 mt-1">Solar Panel & Renewable Energy Solutions</p>
                    </div>
                  </div>
                  {/* Contact Info */}
                  <div className="text-right text-sm text-gray-600">
                    <p>Jl. Raya Industri No. 456</p>
                    <p>Jakarta Selatan 12345</p>
                    <p className="mt-2">Tel: (021) 1234-5678</p>
                    <p>Email: info@leora.co.id</p>
                    <p>www.leora.co.id</p>
                  </div>
                </div>
              </div>

              {/* LETTER CONTENT */}
              <div className="p-8 space-y-6 flex-1">
                {/* Reference Number & Date */}
                <div className="flex justify-between text-sm">
                  <div className="grid grid-cols-[80px_10px_1fr] gap-y-1">
                    <div>Nomor</div>
                    <div>:</div>
                    <div className="font-bold">{letter.document_number || "Pending"}</div>

                    <div>Lampiran</div>
                    <div>:</div>
                    <div>{Array.isArray(letter.attachments) && letter.attachments.length > 0 ? `${letter.attachments.length} file` : "-"}</div>

                    <div>Perihal</div>
                    <div>:</div>
                    <div className="font-bold">{letter.subject}</div>
                  </div>
                  <div className="text-right">
                    <p>Jakarta, {new Date(letter.letter_date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}</p>
                  </div>
                </div>

                {/* Recipient */}
                <div className="text-sm">
                  <p>Kepada Yth,</p>
                  {/* <p className="font-semibold">{letter.recipient_attention}</p> */}
                  <p className="font-semibold">{letter.recipient_name}</p>
                   <p className="font-semibold">{letter.recipient_company}</p>
                  <p>{letter.recipient_address}</p>
                </div>

                {/* Body */}
                <div className="text-sm leading-relaxed whitespace-pre-line">
                   <p>{letter.opening}</p>
                   <div dangerouslySetInnerHTML={{ __html: letter.body }} className="my-4" />
                   <p>{letter.closing}</p>
                </div>

                {/* Signature */}
                <div className="mt-40 px-12">
                  {letter.signatories && Array.isArray(letter.signatories) && letter.signatories.length > 0 ? (
                    <div className={`flex w-full ${(letter.signatories as any[]).length === 1 ? 'justify-end' : 'justify-between items-end'} gap-8`}>
                       {/* Sort by order if available */}
                      {(letter.signatories as any[]).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((sig: any, index: number) => (
                        <div key={index} className="text-center min-w-[200px]">
                          <p className="text-sm mb-16 font-medium">{sig.pihak || (index === 0 && letter.signatories.length === 1 ? "Hormat kami," : "")}</p>
                          <div className="border-t-2 border-gray-800 pt-2">
                            <p className="font-semibold">{sig.name}</p>
                            <p className="text-sm text-gray-600">{sig.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="text-center min-w-[200px]">
                        <p className="text-sm mb-16">Hormat kami,</p>
                        <div className="border-t-2 border-gray-800 pt-2">
                          <p className="font-semibold">{letter.sender?.nama || letter.created_by?.nama}</p>
                          <p className="text-sm text-gray-600">{letter.sender?.jabatan || "Staff"}</p>
                          <p className="text-sm text-gray-600">{letter.sender?.departemen || "PT Leora Indonesia"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t-2 border-brand-primary p-4">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <p>© 2026 PT Leora Indonesia - All Rights Reserved</p>
                  <p>Halaman 1 dari 1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Trail / Document Flow */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Audit Trail - Alur Dokumen</h3>
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Timeline Items from History */}
                <div className="space-y-6">
                  {letter.histories?.sort((a: LetterHistory, b: LetterHistory) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()).map((history: LetterHistory, index: number) => (
                     <div key={index} className="relative flex gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold z-10 ${
                           history.action_type.includes('REJECTED') || history.action_type.includes('REVISION') ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                           {history.action_type.includes('REJECTED') ? '✕' : '✓'}
                        </div>
                        <div className="flex-1 pb-4">
                           <div className={`border rounded-lg p-4 ${
                              history.action_type.includes('REJECTED') || history.action_type.includes('REVISION') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                           }`}>
                              <div className="flex items-start justify-between">
                                 <div>
                                    <p className={`font-semibold ${
                                       history.action_type.includes('REJECTED') || history.action_type.includes('REVISION') ? 'text-red-900' : 'text-green-900'
                                    }`}>
                                       {history.action_type.replace(/_/g, ' ')}
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                       history.action_type.includes('REJECTED') || history.action_type.includes('REVISION') ? 'text-red-700' : 'text-green-700'
                                    }`}>
                                       Oleh <strong>{history.action_by?.nama || history.action_by_id}</strong>
                                    </p>
                                    {history.notes && (
                                       <p className={`text-xs mt-2 italic flex items-center gap-1 ${
                                          history.action_type.includes('REJECTED') || history.action_type.includes('REVISION') ? 'text-red-600' : 'text-green-600'
                                       }`}>
                                          <MessageSquare className="h-3 w-3" />
                                          Catatan: "{history.notes}"
                                       </p>
                                    )}
                                 </div>
                                 <span className={`text-xs font-medium ${
                                    history.action_type.includes('REJECTED') || history.action_type.includes('REVISION') ? 'text-red-600' : 'text-green-600'
                                 }`}>
                                    {new Date(history.created_at || '').toLocaleDateString("id-ID", {
                                       day: "2-digit",
                                       month: "short",
                                       year: "numeric",
                                       hour: "2-digit",
                                       minute: "2-digit"
                                    })}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
                  
                  {(!letter.histories || letter.histories.length === 0) && (
                     <div className="p-4 text-center text-gray-500">Belum ada riwayat aktivitas.</div>
                  )}

                </div>
              </div>

            </div>
           </CardContent>
         </Card>

         {/* Attachments */}
        {Array.isArray(letter.attachments) && letter.attachments.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">📎 Lampiran ({letter.attachments.length} file)</h3>
              <div className="space-y-3">
                {letter.attachments.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileDown className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">{file.size}</p>
                      </div>
                    </div>
                    <Button variant="outline">Lihat File</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
