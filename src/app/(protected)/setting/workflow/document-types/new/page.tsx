"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter,
  Button, 
  Input, 
  Label,
  Textarea
} from "@/components/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDocumentTypes, useCreateDocumentType } from "@/hooks/useLetters"

// Predefined categories
const CATEGORIES = [
  "Surat Menyurat",
  "Laporan",
  "Administrasi",
  "Keuangan",
  "Legal",
  "HR",
  "Lainnya"
]

export default function NewDocumentTypePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const { data: existingDocTypes, isLoading: isLoadingDocTypes } = useDocumentTypes()
  const createDocumentType = useCreateDocumentType()

  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    description: "",
    category: "",
  })
  
  const [errors, setErrors] = React.useState({
    name: "",
    code: "",
  })
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const validateForm = () => {
    let isValid = true
    const newErrors = { name: "", code: "" }

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = "Nama document type wajib diisi"
      isValid = false
    }

    // Validate Code
    if (!formData.code.trim()) {
      newErrors.code = "Kode wajib diisi"
      isValid = false
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = "Kode hanya boleh huruf kapital dan angka (tanpa spasi)"
      isValid = false
    } else if (existingDocTypes?.some(dt => dt.code === formData.code)) {
      newErrors.code = "Kode ini sudah digunakan"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const newDocType = await createDocumentType.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        category: formData.category || undefined,
      })
      
      // Success
      // queryClient.invalidateQueries is handled in the hook
      
      // Redirect to edit workflow page for this new doc type
      router.push(`/setting/workflow/document-types/${newDocType.id}`)
    } catch (error) {
      console.error("Failed to create document type:", error)
      toast({
        title: "Gagal",
        description: "Gagal membuat document type. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    setFormData(prev => ({ ...prev, code: value }))
    // Clear error when user types
    if (errors.code) setErrors(prev => ({ ...prev, code: "" }))
  }

  return (
 <div className=" py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">
              Buat Document Type Baru
            </h1>
            <p className="text-gray-600 mt-1">
              Tambahkan jenis dokumen baru dan konfigurasi workflownya
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Informasi Document Type</CardTitle>
              <CardDescription>
                Isi detail jenis dokumen yang akan dibuat. Kode harus unik.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Document Type <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Contoh: Surat Perjalanan Dinas"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }))
                  }}
                  disabled={isSubmitting}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Kode <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  placeholder="Contoh: SPPD"
                  value={formData.code}
                  onChange={handleCodeChange}
                  disabled={isSubmitting}
                  className={errors.code ? "border-red-500" : ""}
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">
                  Hanya huruf kapital dan angka. Maksimal 10 karakter.
                </p>
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategori (Opsional)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat tentang penggunaan jenis dokumen ini..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/setting/workflow')}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingDocTypes}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan & Lanjut ke Workflow
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
