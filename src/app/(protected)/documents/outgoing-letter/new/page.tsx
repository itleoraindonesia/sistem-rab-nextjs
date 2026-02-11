"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save, Send, Upload, X, Plus, Trash2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui"
import Button from "../../../../../components/ui/Button"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert"
import { RichTextEditor } from "../../../../../components/ui"
import { useDocumentTypes, useInstansiList, useUsersList, useCreateLetter, useSubmitForReview } from "../../../../../hooks/useLetters"
import { outgoingLetterSchema, type OutgoingLetterFormData, type SignatureData, type AttachmentData } from "../../../../../schemas/outgoing-letter.schema"
import { uploadFile, deleteFile, validateFile, formatFileSize, getFileIcon } from "../../../../../lib/supabase/storage"
import { supabase } from "@/lib/supabase/client";

export default function BuatSuratKeluarPage() {
  const router = useRouter()
  
  // Queries
  const { data: documentTypes, isLoading: loadingDocTypes } = useDocumentTypes()
  const { data: instansiList, isLoading: loadingInstansi } = useInstansiList()
  const { data: usersList, isLoading: loadingUsers } = useUsersList()
  
  // Mutations
  const createLetter = useCreateLetter()
  const submitForReview = useSubmitForReview()
  
  // React Hook Form with Zod validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OutgoingLetterFormData>({
    resolver: zodResolver(outgoingLetterSchema) as any,
    defaultValues: {
      letter_date: new Date().toISOString().split('T')[0],
      opening: 'Dengan hormat,',
      closing: 'Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
      body: '',
      subject: '',
      has_attachments: false,
      attachments: null,
      signatories: [
        { id: "1", name: "", position: "", order: 1, pihak: "" }
      ],
    },
  })
  
  // Watch form values
  const watchedSender = watch('sender_id')
  const watchedDocType = watch('document_type_id')
  const watchedHasAttachments = watch('has_attachments')
  const watchedSignatories = watch('signatories')
  const watchedAttachments = watch('attachments')
  const watchedSubject = watch('subject')
  
  // Get selected data
  const selectedSender = usersList?.find(u => u.id === watchedSender)
  const selectedDocType = documentTypes?.find(d => d.id === watchedDocType)
  
  // Update sender info when sender changes
  React.useEffect(() => {
    if (selectedSender) {
      setValue('sender_name', selectedSender.nama || '')
      setValue('sender_email', selectedSender.email || '')
      setValue('sender_department', selectedSender.departemen || '')
    }
  }, [selectedSender, setValue])
  
  // State for UI feedback
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = React.useState<boolean>(false)
  const [tempLetterId] = React.useState(() => `temp-${Date.now()}`) // Temporary ID for uploads
  
  // Handle signature operations
  const handleAddSignature = () => {
    const currentSigs = watchedSignatories || []
    const newSignature: SignatureData = {
      id: Date.now().toString(),
      name: "",
      position: "",
      order: currentSigs.length + 1,
      pihak: ""
    }
    setValue('signatories', [...currentSigs, newSignature])
  }

  const handleRemoveSignature = (id: string) => {
    const currentSigs = watchedSignatories || []
    setValue('signatories', currentSigs.filter(sig => sig.id !== id))
  }

  const handleSignatureChange = (id: string, field: keyof SignatureData, value: string) => {
    const currentSigs = watchedSignatories || []
    setValue('signatories', currentSigs.map(sig => 
      sig.id === id ? { ...sig, [field]: value } : sig
    ))
  }

  // Handle attachment operations with real file upload
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingFiles(true)
    setError(null)

    try {
      const currentAttachments = watchedAttachments || []
      
      // Check total files limit
      if (currentAttachments.length + files.length > 10) {
        throw new Error('Maksimal 10 file lampiran')
      }

      const uploadedFiles: AttachmentData[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
          throw new Error(`${file.name}: ${validation.error}`)
        }

        // Upload to Supabase Storage
        const uploadedFile = await uploadFile(file, tempLetterId)
        
        uploadedFiles.push({
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          url: uploadedFile.url,
          path: uploadedFile.path,
        })
      }

      // Add to form
      setValue('attachments', [...currentAttachments, ...uploadedFiles])
      
    } catch (err: any) {
      setError(err.message || 'Gagal upload file')
    } finally {
      setUploadingFiles(false)
      // Reset input
      event.target.value = ''
    }
  }

  const handleRemoveFile = async (id: string, path?: string) => {
    try {
      // Delete from storage if path exists
      if (path) {
        await deleteFile(path)
      }
      
      // Remove from form
      const currentAttachments = watchedAttachments || []
      setValue('attachments', currentAttachments.filter(file => file.id !== id))
    } catch (err: any) {
      console.error('Error removing file:', err)
      setError('Gagal menghapus file')
    }
  }

  // Save as draft
  const onSaveDraft = async (data: OutgoingLetterFormData) => {
    setError(null)
    setSuccess(null)
    
    try {
      const letter = await createLetter.mutateAsync(data)
      router.push(`/documents/outgoing-letter/${letter.id}`)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan draft')
    }
  }

  // Submit for review
  const onSubmitForReview = async (data: OutgoingLetterFormData) => {
    setError(null)
    setSuccess(null)
    
    try {
      const letter = await createLetter.mutateAsync(data)
      await submitForReview.mutateAsync(letter.id)
      router.push(`/documents/outgoing-letter/${letter.id}`)
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim surat')
    }
  }

  // Word count for subject
  const subjectWordCount = watchedSubject ? watchedSubject.trim().split(/\s+/).length : 0

  if (loadingDocTypes || loadingInstansi || loadingUsers) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
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
                    <Label htmlFor="company_id">Instansi *</Label>
                    <select 
                      id="company_id"
                      {...register('company_id')}
                      className={`w-full border rounded-md p-2 h-10 ${errors.company_id ? 'border-red-500' : ''}`}
                    >
                      <option value="">Pilih Instansi</option>
                      {instansiList?.map((inst) => (
                        <option key={inst.id} value={inst.id}>{inst.nama}</option>
                      ))}
                    </select>
                    {errors.company_id && (
                      <p className="text-xs text-red-500 mt-1">{errors.company_id.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="document_type_id">Kategori Surat *</Label>
                    <div className="space-y-2">
                      <select 
                        id="document_type_id"
                        {...register('document_type_id', { valueAsNumber: true })}
                        className={`w-full border rounded-md p-2 h-10 ${errors.document_type_id ? 'border-red-500' : ''}`}
                      >
                        <option value="">Pilih Kategori</option>
                        {documentTypes?.map((dt) => (
                          <option key={dt.id} value={dt.id}>{dt.name}</option>
                        ))}
                      </select>
                      {errors.document_type_id && (
                        <p className="text-xs text-red-500 mt-1">{errors.document_type_id.message}</p>
                      )}
                      
                      {selectedDocType && (
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 border border-blue-100">
                          {selectedDocType.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="letter_date">Tanggal *</Label>
                    <Input 
                      id="letter_date" 
                      type="date"
                      {...register('letter_date')}
                      className={errors.letter_date ? 'border-red-500' : ''}
                    />
                    {errors.letter_date && (
                      <p className="text-xs text-red-500 mt-1">{errors.letter_date.message}</p>
                    )}
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
                  <Label htmlFor="subject">Perihal *</Label>
                  <Input 
                    id="subject" 
                    placeholder="Contoh: Penawaran Proyek Solar Panel"
                    {...register('subject')}
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between mt-1">
                    <p className={`text-xs ${errors.subject ? "text-red-500 font-medium" : "text-gray-500"}`}>
                      {errors.subject?.message || "Ringkasan singkat isi surat (maksimal 4 kata)"}
                    </p>
                    <p className={`text-xs font-medium ${
                      subjectWordCount === 0 ? "text-gray-400" :
                      subjectWordCount > 4 ? "text-red-500" : 
                      subjectWordCount >= 1 && subjectWordCount <= 4 ? "text-green-600" : 
                      "text-gray-500"
                    }`}>
                      {subjectWordCount}/4 kata
                    </p>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-4 bg-gray-50/50">
                   <Label className="text-base text-gray-700 font-semibold">Struktur Isi Surat:</Label>
                   
                   {/* Pembuka */}
                   <div>
                      <Label htmlFor="opening">Pembuka</Label>
                      <textarea
                        id="opening"
                        {...register('opening')}
                        className={`w-full min-h-[60px] p-3 border rounded-md mt-1 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${errors.opening ? 'border-red-500' : ''}`}
                        placeholder="Dengan hormat,"
                      />
                      {errors.opening && (
                        <p className="text-xs text-red-500 mt-1">{errors.opening.message}</p>
                      )}
                   </div>

                   {/* Isi Utama */}
                    <div>
                      <Label htmlFor="body">Isi Utama *</Label>
                      <Controller
                        name="body"
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Tuliskan inti surat di sini..."
                            className="mt-1 bg-white"
                          />
                        )}
                      />
                      {errors.body && (
                        <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>
                      )}
                    </div>

                   {/* Penutup */}
                   <div>
                      <Label htmlFor="closing">Penutup</Label>
                      <textarea
                        id="closing"
                        {...register('closing')}
                        className={`w-full min-h-[60px] p-3 border rounded-md mt-1 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${errors.closing ? 'border-red-500' : ''}`}
                        placeholder="Hormat kami,"
                      />
                      {errors.closing && (
                        <p className="text-xs text-red-500 mt-1">{errors.closing.message}</p>
                      )}
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
                        {...register('sender_id')}
                        className={`w-full border rounded-md p-2 mt-1 ${errors.sender_id ? 'border-red-500' : ''}`}
                     >
                       <option value="">-- Pilih Nama/Unit Pengirim --</option>
                       {usersList?.map(sender => (
                         <option key={sender.id} value={sender.id}>
                           {sender.nama} - {sender.departemen}
                         </option>
                       ))}
                     </select>
                     {errors.sender_id && (
                       <p className="text-xs text-red-500 mt-1">{errors.sender_id.message}</p>
                     )}
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
                    <Label htmlFor="recipient_company">Nama Instansi *</Label>
                    <Input 
                      id="recipient_company"
                      placeholder="PT Maju Jaya Konstruksi"
                      {...register('recipient_company')}
                      className={errors.recipient_company ? 'border-red-500' : ''}
                    />
                    {errors.recipient_company && (
                      <p className="text-xs text-red-500 mt-1">{errors.recipient_company.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipient_name">Nama Penerima *</Label>
                    <Input 
                      id="recipient_name"
                      placeholder="Budi Santoso"
                      {...register('recipient_name')}
                      className={errors.recipient_name ? 'border-red-500' : ''}
                    />
                    {errors.recipient_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.recipient_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipient_whatsapp">WhatsApp Number *</Label>
                    <Input 
                      id="recipient_whatsapp"
                      type="tel"
                      placeholder="+62812345678"
                      {...register('recipient_whatsapp')}
                      className={errors.recipient_whatsapp ? 'border-red-500' : ''}
                    />
                    {errors.recipient_whatsapp && (
                      <p className="text-xs text-red-500 mt-1">{errors.recipient_whatsapp.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipient_email">Email</Label>
                    <Input 
                      id="recipient_email" 
                      type="email"
                      placeholder="budi@majujaya.co.id"
                      {...register('recipient_email')}
                      className={errors.recipient_email ? 'border-red-500' : ''}
                    />
                    {errors.recipient_email && (
                      <p className="text-xs text-red-500 mt-1">{errors.recipient_email.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="recipient_address">Alamat *</Label>
                    <Input 
                      id="recipient_address"
                      placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                      {...register('recipient_address')}
                      className={errors.recipient_address ? 'border-red-500' : ''}
                    />
                    {errors.recipient_address && (
                      <p className="text-xs text-red-500 mt-1">{errors.recipient_address.message}</p>
                    )}
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
                      id="has_attachments"
                      {...register('has_attachments')}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="has_attachments" className="cursor-pointer">
                      Surat ini memiliki lampiran dokumen
                    </Label>
                  </div>

                  {watchedHasAttachments && (
                    <div className="ml-7 space-y-3">
                      <div>
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          disabled={uploadingFiles}
                          className="hidden"
                        />
                        <label htmlFor="file-upload">
                          <Button 
                            type="button" 
                            variant="outline" 
                            disabled={uploadingFiles}
                            onClick={() => document.getElementById('file-upload')?.click()}
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
                      {watchedAttachments && watchedAttachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">File terupload ({watchedAttachments.length}/10):</p>
                          {watchedAttachments.map((file) => (
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
                  {errors.signatories && (
                    <p className="text-xs text-red-500">{errors.signatories.message}</p>
                  )}

                  <div className="space-y-3">
                    {watchedSignatories?.map((sig, index) => (
                      <div 
                        key={sig.id}
                        className="p-4 border rounded-md bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-sm font-medium text-gray-700">
                            Tanda Tangan #{index + 1}
                          </p>
                          {watchedSignatories.length > 1 && (
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
                              value={sig.pihak || ''}
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
                              className={errors.signatories?.[index]?.name ? 'border-red-500' : ''}
                            />
                            {errors.signatories?.[index]?.name && (
                              <p className="text-xs text-red-500 mt-1">{errors.signatories[index].name?.message}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor={`sig_position_${sig.id}`}>Jabatan *</Label>
                            <Input 
                              id={`sig_position_${sig.id}`}
                              placeholder="Jabatan"
                              value={sig.position}
                              onChange={(e) => handleSignatureChange(sig.id, 'position', e.target.value)}
                              className={errors.signatories?.[index]?.position ? 'border-red-500' : ''}
                            />
                            {errors.signatories?.[index]?.position && (
                              <p className="text-xs text-red-500 mt-1">{errors.signatories[index].position?.message}</p>
                            )}
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
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSubmit(onSaveDraft)} 
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Draft
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit(onSubmitForReview)} 
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Mengirim...' : 'Submit untuk Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}