"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { pdf } from "@react-pdf/renderer"
import { FileDown, Send, BarChart3, AlertCircle, Pencil, Printer, ClipboardEdit, Eye, Clock, Check, X, CheckCircle2, ShieldCheck, XCircle, RotateCcw, FileText, User } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { useLetter, useSubmitForReview } from "../../../../../hooks/useLetters"
import { useUser } from "../../../../../hooks/useUser"
import { LetterHistory } from "../../../../../types/letter"
import { LetterPDFDocument } from "../../../../../components/LetterPDFDocument"

const ACTION_LABEL: Record<string, string> = {
  CREATED:            'Surat Dibuat',
  SUBMITTED:          'Diajukan untuk Review',
  APPROVED_REVIEW:    'Disetujui (Review)',
  APPROVED_FINAL:     'Disetujui (Final)',
  REJECTED:           'Ditolak',
  REVISION_REQUESTED: 'Diminta Revisi',
  REVISED:            'Telah Direvisi',
  CANCELLED:          'Dibatalkan',
  PENDING_REVIEW:     'Menunggu Review',
  PENDING_APPROVAL:   'Menunggu Approval',
};

const getActionLabel = (action_type: string) =>
  ACTION_LABEL[action_type] ?? action_type.replace(/_/g, ' ');

type ActionStyle = {
  dot: string;
  icon: string;
  card: string;
  title: string;
  sub: string;
  note: string;
};

const ACTION_STYLE: Record<string, ActionStyle> = {
  CREATED: {
    dot:   'bg-[#737373]',
    icon:  '✓',
    card:  'bg-[#F5F5F5] border-[#E5E5E5]',
    title: 'text-[#737373]',
    sub:   'text-[#A3A3A3]',
    note:  'text-[#888888]',
  },
  SUBMITTED: {
    dot:   'bg-[#5B7C99]',
    icon:  '✓',
    card:  'bg-[#E8EEF4] border-[#DCE4ED]',
    title: 'text-[#5B7C99]',
    sub:   'text-[#7FA1BD]',
    note:  'text-[#6B8BA6]',
  },
  PENDING_REVIEW: {
    dot:   'bg-[#5B7C99]',
    icon:  '✓',
    card:  'bg-[#E8EEF4] border-[#DCE4ED]',
    title: 'text-[#5B7C99]',
    sub:   'text-[#7FA1BD]',
    note:  'text-[#6B8BA6]',
  },
  PENDING_APPROVAL: {
    dot:   'bg-[#5B7C99]',
    icon:  '✓',
    card:  'bg-[#E8EEF4] border-[#DCE4ED]',
    title: 'text-[#5B7C99]',
    sub:   'text-[#7FA1BD]',
    note:  'text-[#6B8BA6]',
  },
  APPROVED_REVIEW: {
    dot:   'bg-[#5B7C5B]',
    icon:  '✓',
    card:  'bg-[#E8F0E8] border-[#DCE6DC]',
    title: 'text-[#5B7C5B]',
    sub:   'text-[#7FA17F]',
    note:  'text-[#6B8B6B]',
  },
  APPROVED_FINAL: {
    dot:   'bg-[#5B7C5B]',
    icon:  '✓',
    card:  'bg-[#E8F0E8] border-[#DCE6DC]',
    title: 'text-[#5B7C5B]',
    sub:   'text-[#7FA17F]',
    note:  'text-[#6B8B6B]',
  },
  REVISED: {
    dot:   'bg-[#5B7C5B]',
    icon:  '✓',
    card:  'bg-[#E8F0E8] border-[#DCE6DC]',
    title: 'text-[#5B7C5B]',
    sub:   'text-[#7FA17F]',
    note:  'text-[#6B8B6B]',
  },
  // Merah halus (muted red) bila ditolak
  REJECTED: {
    dot:   'bg-[#995B5B]',
    icon:  '✕',
    card:  'bg-[#F9E8E8] border-[#EEDCDC]',
    title: 'text-[#995B5B]',
    sub:   'text-[#BD7F7F]',
    note:  'text-[#A66B6B]',
  },
  REVISION_REQUESTED: {
    dot:   'bg-[#8B7355]',
    icon:  '✕',
    card:  'bg-[#F0EDE5] border-[#E5E2D9]',
    title: 'text-[#8B7355]',
    sub:   'text-[#A6947D]',
    note:  'text-[#968369]',
  },
};

const DEFAULT_STYLE: ActionStyle = {
  dot:   'bg-[#737373]',
  icon:  '✓',
  card:  'bg-[#F5F5F5] border-[#E5E5E5]',
  title: 'text-[#737373]',
  sub:   'text-[#A3A3A3]',
  note:  'text-[#888888]',
};

const getActionStyle = (action_type: string): ActionStyle =>
  ACTION_STYLE[action_type] ?? DEFAULT_STYLE;

const ACTION_ICON: Record<string, React.ElementType> = {
  CREATED:            FileText,
  SUBMITTED:          Send,
  APPROVED_REVIEW:    CheckCircle2,
  APPROVED_FINAL:     ShieldCheck,
  REJECTED:           XCircle,
  REVISION_REQUESTED: AlertCircle,
  REVISED:            RotateCcw,
  PENDING_REVIEW:     Eye,
  PENDING_APPROVAL:   ShieldCheck,
};

const getActionIcon = (action_type: string): React.ElementType =>
  ACTION_ICON[action_type] ?? FileText;

const getFirstMiddleName = (fullName?: string) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return parts.slice(0, 2).join(' ');
};

export default function SuratDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { data: user } = useUser()

  const { data: letter, isLoading, error } = useLetter(id)
  const submitMutation = useSubmitForReview()

  if (isLoading) {
    return (
      <div className="py-8">
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
      <div className="py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    )
  }

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

  const latestRevisionNote = letter.histories
    ?.filter((h: LetterHistory) => h.action_type === 'REVISION_REQUESTED')
    .sort((a: LetterHistory, b: LetterHistory) =>
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )[0];

  // Deduplikasi pending tasks: hanya tampilkan 1 baris status per stage_type yang sedang berjalan
  const pendingStagesMatched = new Set<string>();

  const sortedHistories = [...(letter.histories ?? [])]
    .filter((h: LetterHistory) => {
      // Hilangkan entri sistem yang dibatalkan
      if (h.action_type === 'CANCELLED') return false;
      
      // Deduplikasi pending task: jika ada beberapa reviewer di stage yang sama, 
      // cukup tampilkan satu baris status "Proses Review" atau "Menunggu Approval"
      if (h.assigned_to_id && h.to_status === null) {
        const stageKey = `${h.stage_type}-${h.sequence}`;
        if (pendingStagesMatched.has(stageKey)) return false;
        pendingStagesMatched.add(stageKey);
      }
      return true;
    })
    .map((h: LetterHistory) => {
      // Remap pending tasks agar bisa dirender khusus
      if (h.assigned_to_id && h.to_status === null) {
        if ((h.stage_type as string) === 'APPROVAL') return { ...h, action_type: 'PENDING_APPROVAL' } as unknown as LetterHistory;
        if ((h.stage_type as string) === 'REVIEW')   return { ...h, action_type: 'PENDING_REVIEW' } as unknown as LetterHistory;
      }
      return h;
    })
    .sort(
      (a: LetterHistory, b: LetterHistory) =>
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    );

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">
            {letter.document_type?.name ? `(${letter.document_type.name}) ` : ''}{letter.subject} - {letter.recipient_company || letter.recipient_name}
          </h1>
          {letter.document_number && <p className="text-gray-600">{letter.document_number}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {letter.status === 'DRAFT' && (
            <>
              <Button
                onClick={() => router.push(`/documents/outgoing-letter/${id}/edit`)}
                variant="default"
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
                {submitMutation.isPending ? 'Submitting...' : 'Kirim'}
              </Button>
            </>
          )}
          {letter.status === 'REVISION_REQUESTED' && letter.created_by_id === user?.id && (
            <Button
              onClick={() => router.push(`/documents/outgoing-letter/${id}/edit`)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ClipboardEdit className="mr-2 h-4 w-4" />
              Revisi
            </Button>
          )}
          <Button variant="default" onClick={async () => {
            try {
              const blob = await pdf(<LetterPDFDocument letter={letter} attachments={letter.attachments} />).toBlob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${letter.document_number || 'surat'}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("Print failed:", error);
              alert("Gagal membuat PDF: " + (error as Error).message);
            }
          }}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </div>

      {Array.isArray(letter.attachments) && letter.attachments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Lampiran ({letter.attachments.length} file)</h3>
            <div className="space-y-2">
              {letter.attachments.map((file: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <FileDown className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-600">{file.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Lihat</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 w-full lg:w-auto">
          <Card className="shadow-lg">
              <CardContent className="p-0">
                <div id="letter-preview" className="bg-white flex flex-col" style={{ aspectRatio: "210/297" }}>
                  <div className="border-b-4 border-brand-primary p-6 md:p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-xl md:text-2xl">
                          {(letter.company?.nama || 'L').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-brand-primary">
                            {letter.company?.nama || '-'}
                          </h2>
                        </div>
                      </div>
                      <div className="text-right text-xs md:text-sm text-gray-600">
                        {letter.company?.alamat && <p className="hidden sm:block">{letter.company.alamat}</p>}
                        {letter.company?.telepon && <p className="mt-1">Tel: {letter.company.telepon}</p>}
                        {letter.company?.email && <p>Email: {letter.company.email}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-4 md:space-y-6 flex-1">
                    <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
                      <div className="grid grid-cols-[auto_10px_1fr] gap-x-1 gap-y-1">
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
                      <div className="text-left sm:text-right">
                        <p>Jakarta, {new Date(letter.letter_date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p>Kepada Yth,</p>
                      <p className="font-semibold">{letter.recipient_name}</p>
                      <p className="font-semibold">{letter.recipient_company}</p>
                      <p>{letter.recipient_address}</p>
                    </div>

                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      <p>{letter.opening}</p>
                      <div dangerouslySetInnerHTML={{ __html: letter.body }} className="my-3 md:my-4" />
                      <p>{letter.closing}</p>
                    </div>

                    <div className="mt-32 md:mt-40 px-4 md:px-12">
                      {letter.signatories && Array.isArray(letter.signatories) && letter.signatories.length > 0 ? (
                        <div className={`flex w-full ${(letter.signatories as any[]).length === 1 ? 'justify-end' : 'justify-between items-end'} gap-4 md:gap-8`}>
                          {(letter.signatories as any[]).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((sig: any, index: number) => (
                            <div key={index} className="text-center min-w-[150px] md:min-w-[200px]">
                              <p className="text-sm mb-12 md:mb-16 font-medium">{sig.pihak || (index === 0 && letter.signatories.length === 1 ? "Hormat kami," : "")}</p>
                              <div className="border-t-2 border-gray-800 pt-2">
                                <p className="font-semibold">{sig.name}</p>
                                <p className="text-sm text-gray-600">{sig.position}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <div className="text-center min-w-[150px] md:min-w-[200px]">
                            <p className="text-sm mb-12 md:mb-16">Hormat kami,</p>
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

                  <div className="border-t-2 border-brand-primary p-3 md:p-4">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <p>© {new Date().getFullYear()} {letter.company?.nama || '-'} - All Rights Reserved</p>
                      <p>Halaman 1 dari 1</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        <div className="w-full lg:w-[300px] lg:shrink-0 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Informasi Dokumen</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium w-fit ${
                    letter.status === 'DRAFT'               ? 'bg-gray-100 text-gray-800' :
                    letter.status === 'SUBMITTED_TO_REVIEW' ? 'bg-orange-100 text-orange-800' :
                    letter.status === 'REVIEWED'            ? 'bg-purple-100 text-purple-800' :
                    letter.status === 'APPROVED'            ? 'bg-green-100 text-green-800' :
                    letter.status === 'REJECTED'            ? 'bg-red-100 text-red-800' :
                    letter.status === 'REVISION_REQUESTED'  ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {letter.status === 'DRAFT'               ? 'Draft' :
                     letter.status === 'SUBMITTED_TO_REVIEW' ? 'Sedang Direview' :
                     letter.status === 'REVIEWED'            ? 'Menunggu Approval' :
                     letter.status === 'APPROVED'            ? 'Disetujui' :
                     letter.status === 'REJECTED'            ? 'Ditolak' :
                     letter.status === 'REVISION_REQUESTED'  ? 'Perlu Revisi' :
                     letter.status}
                  </span>
                  <span className="text-gray-600 text-xs">No. Surat</span>
                  <span className="font-medium font-mono text-xs">{letter.document_number || "-"}</span>
                  <span className="text-gray-600 text-xs">Perihal</span>
                  <span className="font-medium text-xs">{letter.subject || "-"}</span>
                  <span className="text-gray-600 text-xs">Tujuan</span>
                  <span className="font-medium text-xs">{letter.recipient_company || letter.recipient_name}</span>
                  <span className="text-gray-600 text-xs">Tgl. Dibuat</span>
                  <span className="font-medium text-xs">
                    {new Date(letter.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                      })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Orang Terlibat</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 text-xs">Reviewer</span>
                  <p className="font-medium">{reviewerNames.length > 0 ? reviewerNames.join(', ') : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs">Approver</span>
                  <p className="font-medium">{approverNames.length > 0 ? approverNames.join(', ') : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs">Dibuat oleh</span>
                  <p className="font-medium">{letter.created_by?.nama}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-500 shrink-0" />
                <span>Riwayat Dokumen</span>
              </h3>
              <div>
                {sortedHistories.map((history: LetterHistory, index: number) => {
                  const s = getActionStyle(history.action_type);
                  const isFirst = index === 0;
                  const isLast = index === sortedHistories.length - 1;
                  const ActionIcon = getActionIcon(history.action_type);

                  return (
                    <div key={index} className="flex gap-3">
                      {/* Kolom kiri: dot + garis vertikal */}
                      <div className="relative w-6 flex-shrink-0 flex items-center justify-center self-stretch">
                        {/* Garis atas: dari top row ke center dot (untuk semua kecuali item pertama) */}
                        {!isFirst && (
                          <div className="absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 w-0.5 bg-gray-300" />
                        )}
                        {/* Garis bawah: dari center dot ke bottom row (untuk semua kecuali item terakhir) */}
                        {!isLast && (
                          <div className="absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-300" />
                        )}
                        {/* Dot — selalu di center vertikal */}
                        <div className={`relative z-10 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${s.dot}`}>
                          <ActionIcon className="h-3 w-3" />
                        </div>
                      </div>
                      {/* Konten kanan: card */}
                      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                        <div className={`border rounded-md p-2 ${s.card}`}>
                          {(history.action_type as string) === 'PENDING_REVIEW' ? (
                            <>
                              {/* Title: Proses Review by [reviewer] */}
                              <div className={`flex items-center gap-1 font-semibold text-xs ${s.title}`}>
                                <span>Proses Review by {reviewerNames.length > 0 ? reviewerNames.map(n => getFirstMiddleName(n)).join(', ') : '-'}</span>
                              </div>
                            </>
                          ) : (history.action_type as string) === 'PENDING_APPROVAL' ? (
                            <>
                              {/* Title: Approval by [approver] */}
                              <div className={`flex items-center gap-1 font-semibold text-xs ${s.title}`}>
                                <span>Approval by {approverNames.length > 0 ? approverNames.map(n => getFirstMiddleName(n)).join(', ') : '-'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Title: [ActionIcon] + label + by [action_by] */}
                              {(() => {
                                let byText = '';
                                
                                // Untuk APPROVED_REVIEW, APPROVED_FINAL, dan REVISION_REQUESTED, gunakan assigned_to_user (reviewer/approver)
                                if (history.action_type === 'APPROVED_REVIEW' || 
                                    history.action_type === 'APPROVED_FINAL' || 
                                    history.action_type === 'REVISION_REQUESTED') {
                                  const actionName = history.assigned_to_user?.nama || history.action_by?.nama || letter.created_by?.nama;
                                  byText = actionName ? ` by ${getFirstMiddleName(actionName)}` : '';
                                } else {
                                  // Untuk action lain (REVISED, REJECTED, dll), gunakan action_by, fallback ke created_by
                                  const actionName = history.action_by?.nama || letter.created_by?.nama;
                                  byText = actionName ? ` by ${getFirstMiddleName(actionName)}` : '';
                                }
                                
                                return (
                                  <div className={`flex items-center gap-1 font-semibold text-xs ${s.title}`}>
                                    <span>{getActionLabel(history.action_type)}{byText}</span>
                                  </div>
                                );
                              })()}
                            </>
                          )}

                          <span className={`text-xs ${s.sub}`}>
                            {new Date(history.created_at || '').toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          {history.notes && (
                            <p className={`text-xs mt-1 italic ${s.note}`}>
                              &ldquo;{history.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sortedHistories.length === 0 && (
                  <div className="p-3 text-center text-gray-500 text-xs">Belum ada riwayat.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
