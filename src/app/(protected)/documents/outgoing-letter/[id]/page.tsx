"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { FileDown, MessageSquare, Send, BarChart3, AlertCircle, Pencil, Printer, ClipboardEdit } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { useLetter, useSubmitForReview } from "../../../../../hooks/useLetters"
import { useUser } from "../../../../../hooks/useUser"
import { LetterHistory } from "../../../../../types/letter"

// Mapping action_type ke label Bahasa Indonesia
const ACTION_LABEL: Record<string, string> = {
  CREATED:            'Surat Dibuat',
  SUBMITTED:          'Diajukan untuk Review',
  APPROVED_REVIEW:    'Disetujui (Review)',
  APPROVED_FINAL:     'Disetujui (Final)',
  REJECTED:           'Ditolak',
  REVISION_REQUESTED: 'Diminta Revisi',
  REVISED:            'Telah Direvisi',
};

const getActionLabel = (action_type: string) =>
  ACTION_LABEL[action_type] ?? action_type.replace(/_/g, ' ');

// Warna card per action_type
type ActionStyle = {
  dot: string;   // background dot
  icon: string;  // ✓ atau ✕
  card: string;  // bg + border card
  title: string; // warna judul
  sub: string;   // warna "Oleh ..."
  note: string;  // warna catatan
};

const ACTION_STYLE: Record<string, ActionStyle> = {
  CREATED: {
    dot:   'bg-gray-400',
    icon:  '✓',
    card:  'bg-gray-50 border-gray-200',
    title: 'text-gray-800',
    sub:   'text-gray-600',
    note:  'text-gray-500',
  },
  SUBMITTED: {
    dot:   'bg-blue-500',
    icon:  '✓',
    card:  'bg-blue-50 border-blue-200',
    title: 'text-blue-900',
    sub:   'text-blue-700',
    note:  'text-blue-600',
  },
  APPROVED_REVIEW: {
    dot:   'bg-teal-500',
    icon:  '✓',
    card:  'bg-teal-50 border-teal-200',
    title: 'text-teal-900',
    sub:   'text-teal-700',
    note:  'text-teal-600',
  },
  APPROVED_FINAL: {
    dot:   'bg-green-500',
    icon:  '✓',
    card:  'bg-green-50 border-green-200',
    title: 'text-green-900',
    sub:   'text-green-700',
    note:  'text-green-600',
  },
  REJECTED: {
    dot:   'bg-red-500',
    icon:  '✕',
    card:  'bg-red-50 border-red-200',
    title: 'text-red-900',
    sub:   'text-red-700',
    note:  'text-red-600',
  },
  REVISION_REQUESTED: {
    dot:   'bg-orange-400',
    icon:  '✕',
    card:  'bg-orange-50 border-orange-200',
    title: 'text-orange-900',
    sub:   'text-orange-700',
    note:  'text-orange-600',
  },
  REVISED: {
    dot:   'bg-purple-500',
    icon:  '✓',
    card:  'bg-purple-50 border-purple-200',
    title: 'text-purple-900',
    sub:   'text-purple-700',
    note:  'text-purple-600',
  },
};

const DEFAULT_STYLE: ActionStyle = {
  dot:   'bg-gray-400',
  icon:  '✓',
  card:  'bg-gray-50 border-gray-200',
  title: 'text-gray-800',
  sub:   'text-gray-600',
  note:  'text-gray-500',
};

const getActionStyle = (action_type: string): ActionStyle =>
  ACTION_STYLE[action_type] ?? DEFAULT_STYLE;

export default function SuratDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { data: user } = useUser()

  const { data: letter, isLoading, error } = useLetter(id)
  const submitMutation = useSubmitForReview()

  if (isLoading) {
    return (
      <div className=" py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-4"></div>
          <p>Memuat data surat...</p>
        </div>
      </div>
    )
  }

  if (error || !letter) {
    console.error('[SuratDetailPage] Error loading letter:', error);
    const errorMessage = error
      ? ((error as Error).message || JSON.stringify(error) || "Unknown error")
      : "Surat tidak ditemukan";

    return (
      <div className=" py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Extract assigned reviewers and approvers from histories
  const reviewerSet = new Set<string>();
  const approverSet = new Set<string>();

  letter.histories?.forEach((h: LetterHistory) => {
    if (h.stage_type === 'REVIEW' && h.assigned_to_user?.nama) {
      reviewerSet.add(h.assigned_to_user.nama);
    }
    if (h.stage_type === 'APPROVAL' && h.assigned_to_user?.nama) {
      approverSet.add(h.assigned_to_user.nama);
    }
  });

  const reviewerNames = Array.from(reviewerSet);
  const approverNames = Array.from(approverSet);

  // Get latest revision note for REVISION_REQUESTED status
  const latestRevisionNote = letter.histories
    ?.filter((h: LetterHistory) => h.action_type === 'REVISION_REQUESTED')
    .sort((a: LetterHistory, b: LetterHistory) =>
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )[0];

  // Histories diurutkan dari yang terlama ke terbaru
  const sortedHistories = [...(letter.histories ?? [])].sort(
    (a: LetterHistory, b: LetterHistory) =>
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
  );

  return (
    <div>
      <div className="space-y-6">
        {/* Banner Revisi - tampil saat status REVISION_REQUESTED */}
        {letter.status === 'REVISION_REQUESTED' && (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 font-semibold">
              Surat Perlu Direvisi
            </AlertTitle>
            <AlertDescription className="text-orange-800">
              {latestRevisionNote ? (
                <div className="space-y-1 mt-1">
                  <p>
                    Catatan dari <strong>{latestRevisionNote.action_by?.nama || 'Reviewer'}</strong>:{' '}
                    <em>&ldquo;{latestRevisionNote.notes || 'Tidak ada catatan spesifik'}&rdquo;</em>
                  </p>
                </div>
              ) : (
                <p>Surat ini diminta untuk direvisi. Silakan edit dan kirim ulang.</p>
              )}
              {letter.created_by_id === user?.id && (
                <Button
                  size="sm"
                  className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => router.push(`/documents/outgoing-letter/${id}/edit`)}
                >
                  <ClipboardEdit className="mr-2 h-4 w-4" />
                  Edit &amp; Revisi Sekarang
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">
                {letter.document_type?.name ? `(${letter.document_type.name}) ` : ''}{letter.subject} - {letter.recipient_company || letter.recipient_name}
              </h1>
              {letter.document_number && <p className="text-gray-600">{letter.document_number}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            {/* DRAFT: Edit + Submit */}
            {letter.status === 'DRAFT' && (
              <>
                <Button
                  onClick={() => router.push(`/documents/outgoing-letter/${id}/edit`)}
                  variant="outline"
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
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitMutation.isPending ? 'Submitting...' : 'Submit untuk Review'}
                </Button>
              </>
            )}

            {/* REVISION_REQUESTED: Tombol revisi yang jelas */}
            {letter.status === 'REVISION_REQUESTED' && letter.created_by_id === user?.id && (
              <Button
                onClick={() => router.push(`/documents/outgoing-letter/${id}/edit`)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <ClipboardEdit className="mr-2 h-4 w-4" />
                Revisi Surat
              </Button>
            )}

            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Document Metadata */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Informasi Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      letter.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                      letter.status === 'SUBMITTED_TO_REVIEW' ? 'bg-orange-100 text-orange-800' :
                      letter.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                      letter.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      letter.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      letter.status === 'REVISION_REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {letter.status === 'DRAFT' ? 'Draft' :
                       letter.status === 'SUBMITTED_TO_REVIEW' ? 'Sedang Direview' :
                       letter.status === 'REVIEWED' ? 'Sudah Direview' :
                       letter.status === 'APPROVED' ? 'Disetujui' :
                       letter.status === 'REJECTED' ? 'Ditolak' :
                       letter.status === 'REVISION_REQUESTED' ? 'Perlu Revisi' :
                       letter.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Perihal:</p>
                  <p className="font-medium">{letter.subject || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tujuan / Kepada Yth:</p>
                  <p className="font-medium">{letter.recipient_company || letter.recipient_name}</p>
                </div>
              </div>

              <div className="space-y-4">
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
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Reviewer:</p>
                  <p className="font-medium">
                    {reviewerNames.length > 0 ? reviewerNames.join(', ') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Approver:</p>
                  <p className="font-medium">
                    {approverNames.length > 0 ? approverNames.join(', ') : '-'}
                  </p>
                </div>
              </div>
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
                      {(letter.company?.nama || 'L').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-brand-primary">
                        {letter.company?.nama || '-'}
                      </h2>
                    </div>
                  </div>
                  {/* Contact Info */}
                  <div className="text-right text-sm text-gray-600">
                    {letter.company?.alamat && <p>{letter.company.alamat}</p>}
                    {letter.company?.telepon && <p className="mt-1">Tel: {letter.company.telepon}</p>}
                    {letter.company?.email && <p>Email: {letter.company.email}</p>}
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
                          <p className="text-sm text-gray-600">{letter.sender?.departemen || letter.company?.nama || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t-2 border-brand-primary p-4">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <p>© {new Date().getFullYear()} {letter.company?.nama || '-'} - All Rights Reserved</p>
                  <p>Halaman 1 dari 1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Trail / Riwayat Dokumen */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Riwayat Dokumen
            </h3>
            <div className="space-y-4">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                  {sortedHistories.map((history: LetterHistory, index: number) => {
                    const s = getActionStyle(history.action_type);
                    return (
                      <div key={index} className="relative flex items-center gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold z-10 ${s.dot}`}>
                          {s.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`border rounded-lg p-4 ${s.card}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className={`font-semibold ${s.title}`}>
                                  {getActionLabel(history.action_type)}
                                </p>
                                <p className={`text-sm mt-1 ${s.sub}`}>
                                  Oleh <strong>{history.action_by?.nama || history.action_by_id}</strong>
                                </p>
                                {history.notes && (
                                  <p className={`text-xs mt-2 italic flex items-center gap-1 ${s.note}`}>
                                    <MessageSquare className="h-3 w-3" />
                                    Catatan: &ldquo;{history.notes}&rdquo;
                                  </p>
                                )}
                              </div>
                              <span className={`text-xs font-medium shrink-0 ml-4 ${s.sub}`}>
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
                    );
                  })}

                  {sortedHistories.length === 0 && (
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
