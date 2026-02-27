"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Save, Send, Upload, X, Plus, Trash2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent } from "../../../../../../components/ui"
import Button from "../../../../../../components/ui/Button"
import { Input } from "../../../../../../components/ui/input"
import { Label } from "../../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../../components/ui/alert"
import { RichTextEditor } from "../../../../../../components/ui"
import { 
  useDocumentTypes, 
  useInstansiList, 
  useUsersList, 
  useLetter, 
  useUpdateLetter, 
  useSubmitForReview,
  useResubmitRevision
} from "../../../../../../hooks/useLetters"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { LetterHistory } from "@/types/letter"
import { uploadFile, deleteFile, validateFile, formatFileSize, getFileIcon } from "../../../../../../lib/supabase/storage"

interface Signature {
  id: string
  name: string
  position: string
  order: number
  pihak?: string
}

interface Attachment {
  id: string
  name: string
  size: number
  type?: string
  url?: string
  path?: string
}

export default function EditSuratKeluarPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  // Queries
  const { data: letter, isLoading: loadingLetter } = useLetter(id)
  const { data: documentTypes, isLoading: loadingDocTypes } = useDocumentTypes()
  const { data: instansiList, isLoading: loadingInstansi } = useInstansiList()
  const { data: usersList, isLoading: loadingUsers } = useUsersList()
  
  // Fetch revision notes if status is REVISION_REQUESTED
  const { data: revisionNote } = useQuery<LetterHistory | null>({
    queryKey: ['revision-note', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('letter_histories')
        .select(`
          *,
          action_by:users!letter_histories_action_by_id_fkey(id, nama, email)
        `)
        .eq('letter_id', id)
        .eq('action_type', 'REVISION_REQUESTED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) {
        console.error('[useRevisionNote] Failed to fetch:', error)
        return null
      }
      
      return data
    },
    enabled: !!id && letter?.status === 'REVISION_REQUESTED'
  })
  
  // Mutations
  const updateLetter = useUpdateLetter()
  const submitForReview = useSubmitForReview()
  const resubmitRevision = useResubmitRevision()
  
  // Form state
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [signatures, setSignatures] = React.useState<Signature[]>([
    { id: "1", name: "", position: "", order: 1, pihak: "" }
  ])
  const [hasLampiran, setHasLampiran] = React.useState(false)
  const [isiSurat, setIsiSurat] = React.useState('')
  const [pembuka, setPembuka] = React.useState('Dengan hormat,')
  const [penutup, setPenutup] = React.useState('Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.')
  const [letterDate, setLetterDate] = React.useState('')
  const [uploadingFiles, setUploadingFiles] = React.useState(false)
  
  const [perihal, setPerihal] = React.useState('')
  const [perihalError, setPerihalError] = React.useState('')
  
  const [selectedInstansiId, setSelectedInstansiId] = React.useState<string>("")
  const [selectedDocTypeId, setSelectedDocTypeId] = React.useState<number | null>(null)
  const [selectedSenderId, setSelectedSenderId] = React.useState<string>("")
  
  // Recipient State
  const [recipientCompany, setRecipientCompany] = React.useState('')
  const [recipientName, setRecipientName] = React.useState('')
  const [recipientWhatsapp, setRecipientWhatsapp] = React.useState('')
  const [recipientEmail, setRecipientEmail] = React.useState('')
  const [recipientAddress, setRecipientAddress] = React.useState('')
  
  // Get selected data
  const selectedInstansi = instansiList?.find(i => i.id === selectedInstansiId)
  const selectedDocType = documentTypes?.find(d => d.id === selectedDocTypeId)
  const selectedSender = usersList?.find(u => u.id === selectedSenderId)
  
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  
  // Form refs
  const formRef = React.useRef<HTMLFormElement>(null)

  // Populate form with existing data
  React.useEffect(() => {
    if (letter) {
      setSelectedDocTypeId(letter.document_type_id)
      setSelectedInstansiId(letter.company_id || "")
      setLetterDate(letter.letter_date ? new Date(letter.letter_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
      
      setPerihal(letter.subject || "")
      setPembuka(letter.opening || "")
      setIsiSurat(letter.body || "")
      setPenutup(letter.closing || "")
      
      setRecipientCompany(letter.recipient_company || "")
      setRecipientName(letter.recipient_name || "")
      setRecipientWhatsapp(letter.recipient_whatsapp || "")
      setRecipientEmail(letter.recipient_email || "")
      setRecipientAddress(letter.recipient_address || "")
      
      setSelectedSenderId(letter.sender_id || "")
      
      setHasLampiran(letter.has_attachments || false)
      if (letter.attachments) {
        setAttachments(letter.attachments as Attachment[])
      }
      
      if (letter.signatories) {
        setSignatures(letter.signatories as Signature[])
      }
    }
  }, [letter])
  
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingFiles(true)
    setError(null)

    try {
      if (attachments.length + files.length > 10) {
        throw new Error('Maksimal 10 file lampiran')
      }

      const uploadedFiles: Attachment[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const validation = validateFile(file)
        if (!validation.valid) {
          throw new Error(`${file.name}: ${validation.error}`)
        }
        const uploadedFile = await uploadFile(file, id)
        uploadedFiles.push({
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          url: uploadedFile.url,
          path: uploadedFile.path,
        })
      }

      setAttachments([...attachments, ...uploadedFiles])
    } catch (err: any) {
      setError(err.message || 'Gagal upload file')
    } finally {
      setUploadingFiles(false)
      event.target.value = ''
    }
  }

  const handleRemoveFile = async (id: string, path?: string) => {
    try {
      if (path) {
        await deleteFile(path)
      }
      setAttachments(attachments.filter(file => file.id !== id))
    } catch (err: any) {
      console.error('Error removing file:', err)
      setError('Gagal menghapus file')
    }
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

  const handleSaveDraft = async () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const letterData = {
        document_type_id: selectedDocTypeId!,
        company_id: selectedInstansiId!,
        letter_date: letterDate || new Date().toISOString().split('T')[0],
        subject: perihal,
        opening: pembuka,
        body: isiSurat,
        closing: penutup,
        recipient_company: recipientCompany,
        recipient_name: recipientName,
        recipient_whatsapp: recipientWhatsapp,
        recipient_email: recipientEmail || null,
        recipient_address: recipientAddress,
        sender_id: selectedSenderId!,
        sender_name: selectedSender?.nama || '',
        sender_email: selectedSender?.email || '',
        sender_department: selectedSender?.departemen || '',
        has_attachments: hasLampiran,
        attachments: (attachments.length > 0 ? attachments : null) as any,
        signatories: (signatures.length > 0 ? signatures : null) as any,
      }
      
      await updateLetter.mutateAsync({ letterId: id, updates: letterData })
      // setSuccess('Perubahan berhasil disimpan!')
      // setTimeout(() => router.push(`/documents/outgoing-letter/${id}`), 1500)
      router.push(`/documents/outgoing-letter/${id}`)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan')
      setLoading(false)
    } 
    // finally removed as redirect handles success
  }

  const handleSubmit = async () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const letterData = {
        document_type_id: selectedDocTypeId!,
        company_id: selectedInstansiId!,
        letter_date: letterDate || new Date().toISOString().split('T')[0],
        subject: perihal,
        opening: pembuka,
        body: isiSurat,
        closing: penutup,
        recipient_company: recipientCompany,
        recipient_name: recipientName,
        recipient_whatsapp: recipientWhatsapp,
        recipient_email: recipientEmail || null,
        recipient_address: recipientAddress,
        sender_id: selectedSenderId!,
        sender_name: selectedSender?.nama || '',
        sender_email: selectedSender?.email || '',
        sender_department: selectedSender?.departemen || '',
        has_attachments: hasLampiran,
        attachments: (attachments.length > 0 ? attachments : null) as any,
        signatories: (signatures.length > 0 ? signatures : null) as any,
      }
      
      await updateLetter.mutateAsync({ letterId: id, updates: letterData })
      
      // Handle different submission flows based on current status
      if (letter?.status === 'REVISION_REQUESTED') {
        // Resubmit revision directly to SUBMITTED_TO_REVIEW
        await resubmitRevision.mutateAsync(id)
      } else {
        // Normal submission from DRAFT
        await submitForReview.mutateAsync(id)
      }
      
      // setSuccess('Surat berhasil dikirim untuk review!')
      // setTimeout(() => router.push('/documents/outgoing-letter'), 1500)
      router.push(`/documents/outgoing-letter/${id}`)
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim surat')
      setLoading(false)
    } 
    // finally removed as redirect handles success
  }

  if (loadingLetter || loadingDocTypes || loadingInstansi || loadingUsers) {
    return (
 <div className=" py-8">
        <div className="text-center">
          <p>Memuat data surat...</p>
        </div>
      </div>
    )
  }

  // Guard: hanya DRAFT dan REVISION_REQUESTED yang boleh diedit
  const EDITABLE_STATUSES = ['DRAFT', 'REVISION_REQUESTED'];
  if (letter && !EDITABLE_STATUSES.includes(letter.status)) {
    return (
 <div className=" py-8">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Surat Tidak Dapat Diedit</h2>
          <p className="text-gray-600">
            Surat dengan status{' '}
            <span className="font-medium text-gray-800">
              {letter.status === 'SUBMITTED_TO_REVIEW' ? 'Under Review' :
               letter.status === 'REVIEWED' ? 'Reviewed' :
               letter.status === 'APPROVED' ? 'Approved' :
               letter.status === 'REJECTED' ? 'Rejected' :
               letter.status}
            </span>{' '}
            tidak dapat diedit.
          </p>
          <button
            onClick={() => router.push(`/documents/outgoing-letter/${id}`)}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-medium"
          >
            Kembali ke Detail Surat
          </button>
        </div>
      </div>
    )
  }

  return (
 <div className=" py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Edit Surat Keluar</h1>
            <p className="text-gray-600">Perbarui data surat sebelum submit</p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Berhasil</AlertTitle>
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Revision Alert - Show when status is REVISION_REQUESTED */}
        {letter?.status === 'REVISION_REQUESTED' && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 font-semibold">
              Surat Perlu Direvisi
            </AlertTitle>
            <AlertDescription className="text-orange-800">
              {revisionNote ? (
                <div className="space-y-2 mt-2">
                  <p className="font-medium">
                    Catatan dari {revisionNote.action_by?.nama}:
                  </p>
                  <p className="italic">
                    &ldquo;{revisionNote.notes || 'Tidak ada catatan spesifik'}&rdquo;
                  </p>
                  <p className="text-sm text-orange-600">
                    Diminta pada: {revisionNote.created_at ? new Date(revisionNote.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </p>
                </div>
              ) : (
                <p className="mt-1">
                  Surat ini diminta untuk direvisi. Silakan periksa catatan di bagian Audit Trail pada halaman detail surat.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form ref={formRef} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <Card>
            <CardContent className="p-6">
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
                      value={letter?.document_number || "Draft"}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nomor surat akan digenerate saat approval
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="instansi">Instansi *</Label>
                    <select 
                      id="instansi"
                      required
                      className="w-full border rounded-md p-2 h-10"
                      value={selectedInstansiId}
                      onChange={(e) => setSelectedInstansiId(e.target.value)}
                    >
                      <option value="" disabled>Pilih Instansi</option>
                      {instansiList?.map((inst) => (
                        <option key={inst.id} value={inst.id}>{inst.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="kategori">Kategori Surat *</Label>
                    <div className="space-y-2">
                      <select 
                        id="kategori"
                        required
                        className="w-full border rounded-md p-2 h-10"
                        value={selectedDocTypeId || ''}
                        onChange={(e) => setSelectedDocTypeId(Number(e.target.value) || null)}
                      >
                        <option value="" disabled>Pilih Kategori</option>
                        {documentTypes?.map((dt) => (
                          <option key={dt.id} value={dt.id}>{dt.name}</option>
                        ))}
                      </select>
                      
                      {selectedDocType && (
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 border border-blue-100">
                          {selectedDocType.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tanggal">Tanggal *</Label>
                    <Input 
                      id="tanggal" 
                      type="date"
                      required
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
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
                    required
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
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
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
                        required
                        className="w-full border rounded-md p-2 mt-1"
                        value={selectedSenderId}
                        onChange={(e) => setSelectedSenderId(e.target.value)}
                     >
                       <option value="" disabled>-- Pilih Nama/Unit Pengirim --</option>
                       {usersList?.map(sender => (
                         <option key={sender.id} value={sender.id}>
                           {sender.nama} - {sender.departemen}
                         </option>
                       ))}
                     </select>
                  </div>

                  {selectedSender && (
                    <div className="bg-green-50 p-4 rounded-md border border-green-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-green-900 text-xs uppercase tracking-wide">Departemen</Label>
                        <p className="font-medium text-green-900">{selectedSender.departemen}</p>
                      </div>
                      <div>
                        <Label className="text-green-900 text-xs uppercase tracking-wide">Nama</Label>
                         <p className="font-medium text-green-900">{selectedSender.nama}</p>
                      </div>
                      <div>
                        <Label className="text-green-900 text-xs uppercase tracking-wide">Email</Label>
                         <p className="font-medium text-green-900">{selectedSender.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
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
                      required
                      placeholder="PT Maju Jaya Konstruksi"
                      value={recipientCompany}
                      onChange={(e) => setRecipientCompany(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="penerima_nama">Nama Penerima *</Label>
                    <Input 
                      id="penerima_nama"
                      required
                      placeholder="Budi Santoso"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="penerima_whatsapp">WhatsApp Number *</Label>
                    <Input 
                      id="penerima_whatsapp"
                      required
                      type="tel"
                      placeholder="+62812345678"
                      value={recipientWhatsapp}
                      onChange={(e) => setRecipientWhatsapp(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="penerima_email">Email</Label>
                    <Input 
                      id="penerima_email" 
                      type="email"
                      placeholder="budi@majujaya.co.id"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="penerima_alamat">Alamat *</Label>
                    <Input 
                      id="penerima_alamat"
                      required
                      placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
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
                        <input
                          type="file"
                          id="file-upload-edit"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          disabled={uploadingFiles}
                          className="hidden"
                        />
                        <label htmlFor="file-upload-edit">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingFiles}
                            onClick={() => document.getElementById('file-upload-edit')?.click()}
                            asChild
                          >
                            <span>
                              {uploadingFiles ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload File
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Max 5MB per file - PDF, DOC, DOCX, JPG, PNG (Maksimal 10 file)
                        </p>
                      </div>

                      {/* File List */}
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">File terupload ({attachments.length}/10):</p>
                          {attachments.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-lg">
                                  {getFileIcon(file.type || '')}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-900">{file.name}</p>
                                  <p className="text-xs text-green-700">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(file.id, file.path)}
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
                              value={sig.pihak || ""}
                              onChange={(e) => handleSignatureChange(sig.id, 'pihak', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`sig_name_${sig.id}`}>Nama *</Label>
                            <Input 
                              id={`sig_name_${sig.id}`}
                              required
                              placeholder="Nama Lengkap"
                              value={sig.name}
                              onChange={(e) => handleSignatureChange(sig.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`sig_position_${sig.id}`}>Jabatan *</Label>
                            <Input 
                              id={`sig_position_${sig.id}`}
                              required
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
            </CardContent>
          </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-4">
                {/* Conditional buttons based on letter status */}
                {letter?.status === 'REVISION_REQUESTED' ? (
                  <>
                    {/* For revision: Save Changes (without changing status) */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSaveDraft} 
                      disabled={loading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </Button>
                    
                    {/* Resubmit for review */}
                    <Button 
                      type="button" 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Kirim Ulang untuk Review
                    </Button>
                  </>
                ) : (
                  <>
                    {/* For draft: Save as draft */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSaveDraft} 
                      disabled={loading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Draft
                    </Button>
                    
                    {/* Submit for review */}
                    <Button 
                      type="button" 
                      onClick={handleSubmit} 
                      disabled={loading}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit untuk Review
                    </Button>
                  </>
                )}
              </div>
        </form>
      </div>
    </div>
  )
}
