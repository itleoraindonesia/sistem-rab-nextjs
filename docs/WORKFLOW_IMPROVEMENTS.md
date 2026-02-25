# Workflow Management Improvements - Implementation Guide

File ini berisi semua perubahan yang diperlukan untuk meningkatkan fitur Workflow Management.

---

## Table of Contents
1. [Phase 1: Critical Fixes](#phase-1-critical-fixes)
2. [Phase 2: UX Improvements](#phase-2-ux-improvements)
3. [Phase 3: Backend Enhancements](#phase-3-backend-enhancements)
4. [Database Migration](#database-migration)

---

## Phase 1: Critical Fixes

### 1.1 Create ConfirmDialog Component

**File: `src/components/ui/ConfirmDialog.tsx`**

```tsx
"use client"

import * as React from "react"
import { AlertTriangle, Trash2, Info, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  isLoading?: boolean
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn("flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center", config.iconBg)}>
              <Icon className={cn("w-6 h-6", config.iconColor)} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
              config.confirmBtn
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### 1.2 Updated Edit Workflow Page with All Fixes

**File: `src/app/(protected)/setting/workflow/document-types/[id]/page.tsx`**

```tsx
"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save, Loader2, ChevronUp, ChevronDown, Star, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useWorkflowStages,
  useCreateWorkflowStage,
  useUpdateWorkflowStage,
  useDeleteWorkflowStage,
} from "@/hooks/useWorkflow"
import { useDocumentTypes } from "@/hooks/useLetters"
import { useUsersList } from "@/hooks/useLetters"
import type { WorkflowAssignee, StageType, CompletionRule, WorkflowStage } from "@/types/workflow"

export default function EditWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const documentTypeId = parseInt(params.id as string)
  const { toast } = useToast()

  const { data: documentTypes } = useDocumentTypes()
  const { data: users } = useUsersList()
  const { data: stages, isLoading: stagesLoading } = useWorkflowStages(documentTypeId)
  const createStage = useCreateWorkflowStage()
  const updateStage = useUpdateWorkflowStage()
  const deleteStage = useDeleteWorkflowStage()

  const documentType = documentTypes?.find(dt => dt.id === documentTypeId)

  const [localStages, setLocalStages] = React.useState<WorkflowStage[]>([])
  const [deletedStageIds, setDeletedStageIds] = React.useState<number[]>([])
  const [saving, setSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant: "danger" | "warning" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger",
  })

  // Track original stages for comparison
  const originalStagesRef = React.useRef<WorkflowStage[]>([])

  React.useEffect(() => {
    if (stages) {
      setLocalStages(stages)
      originalStagesRef.current = stages
    }
  }, [stages])

  // Track changes
  React.useEffect(() => {
    const hasLocalChanges = JSON.stringify(localStages) !== JSON.stringify(originalStagesRef.current)
    const hasDeletions = deletedStageIds.length > 0
    setHasChanges(hasLocalChanges || hasDeletions)
  }, [localStages, deletedStageIds])

  // Warn before leaving with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges])

  const addStage = () => {
    const newSequence = (localStages?.length || 0) + 1
    const newStage: WorkflowStage = {
      document_type_id: documentTypeId,
      stage_type: 'REVIEW' as StageType,
      stage_name: `Stage ${newSequence}`,
      sequence: newSequence,
      assignees: [] as WorkflowAssignee[],
      completion_rule: 'ALL' as CompletionRule,
      is_required: true,
      is_active: true,
    }
    setLocalStages(prev => [...(prev || []), newStage])
  }

  const updateLocalStage = (index: number, updates: Partial<WorkflowStage>) => {
    setLocalStages(prev =>
      prev?.map((stage, i) => i === index ? { ...stage, ...updates } : stage)
    )
  }

  const removeStage = (index: number) => {
    const stage = localStages[index]
    
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Stage",
      message: `Apakah Anda yakin ingin menghapus "${stage.stage_name}"?${stage.id ? ' Stage ini akan dihapus permanen dari database.' : ''}`,
      variant: "danger",
      onConfirm: () => {
        // Track deleted stage IDs for backend deletion
        if (stage.id) {
          setDeletedStageIds(prev => [...prev, stage.id])
        }
        // Remove from local state
        setLocalStages(prev => prev?.filter((_, i) => i !== index))
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        
        toast({
          title: "Stage dihapus",
          description: "Stage akan dihapus setelah menyimpan perubahan.",
        })
      },
    })
  }

  const moveStageUp = (index: number) => {
    if (index === 0) return
    setLocalStages(prev => {
      const newStages = [...(prev || [])]
      const temp = newStages[index - 1]
      newStages[index - 1] = newStages[index]
      newStages[index] = temp
      // Update sequence numbers
      return newStages.map((s, i) => ({ ...s, sequence: i + 1 }))
    })
  }

  const moveStageDown = (index: number) => {
    if (index >= (localStages?.length || 0) - 1) return
    setLocalStages(prev => {
      const newStages = [...(prev || [])]
      const temp = newStages[index + 1]
      newStages[index + 1] = newStages[index]
      newStages[index] = temp
      // Update sequence numbers
      return newStages.map((s, i) => ({ ...s, sequence: i + 1 }))
    })
  }

  const addAssignee = (stageIndex: number, userId: string) => {
    const user = users?.find(u => u.id === userId)
    if (!user) return

    const newAssignee: WorkflowAssignee = {
      user_id: user.id,
      user_name: user.nama,
      user_role: user.jabatan || 'user',
      is_primary: false,
    }

    setLocalStages(prev => 
      prev?.map((stage, i) => 
        i === stageIndex 
          ? { ...stage, assignees: [...stage.assignees, newAssignee] }
          : stage
      )
    )
  }

  const removeAssignee = (stageIndex: number, assigneeIndex: number) => {
    setLocalStages(prev => 
      prev?.map((stage, i) => 
        i === stageIndex 
          ? { ...stage, assignees: stage.assignees.filter((_, j) => j !== assigneeIndex) }
          : stage
      )
    )
  }

  const setPrimaryAssignee = (stageIndex: number, assigneeIndex: number) => {
    setLocalStages(prev => 
      prev?.map((stage, i) => {
        if (i !== stageIndex) return stage
        return {
          ...stage,
          assignees: stage.assignees.map((a, j) => ({
            ...a,
            is_primary: j === assigneeIndex,
          })),
        }
      })
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Delete removed stages (soft delete - just mark is_active = false)
      for (const stageId of deletedStageIds) {
        await deleteStage.mutateAsync(stageId)
      }

      // 2. Create or update stages
      for (let i = 0; i < (localStages?.length || 0); i++) {
        const stage = localStages![i]
        if (stage.id) {
          // Update existing
          await updateStage.mutateAsync({
            stageId: stage.id,
            updates: {
              stage_type: stage.stage_type,
              stage_name: stage.stage_name,
              sequence: stage.sequence,
              assignees: stage.assignees,
              completion_rule: stage.completion_rule,
              is_required: stage.is_required,
            },
          })
        } else {
          // Create new
          await createStage.mutateAsync({
            document_type_id: documentTypeId,
            stage_type: stage.stage_type,
            stage_name: stage.stage_name,
            sequence: stage.sequence,
            assignees: stage.assignees,
            completion_rule: stage.completion_rule,
            is_required: stage.is_required,
            is_active: true,
          })
        }
      }

      // Clear deleted IDs
      setDeletedStageIds([])
      setHasChanges(false)
      
      toast({
        title: "Berhasil",
        description: "Workflow berhasil disimpan.",
      })
      
      router.push('/setting/workflow')
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast({
        title: "Gagal",
        description: "Gagal menyimpan workflow. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (hasChanges) {
      setConfirmDialog({
        isOpen: true,
        title: "Perubahan Belum Disimpan",
        message: "Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?",
        variant: "warning",
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
          router.push('/setting/workflow')
        },
      })
    } else {
      router.push('/setting/workflow')
    }
  }

  if (stagesLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data workflow...</span>
        </div>
      </div>
    )
  }

  if (!documentType) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-gray-500">Document type tidak ditemukan.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/setting/workflow')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-brand-primary">
                Edit Workflow: {documentType.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Konfigurasi workflow approval untuk {documentType.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-sm text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Ada perubahan belum disimpan
              </span>
            )}
            <Button 
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-4">
          {localStages?.map((stage, index) => (
            <Card key={stage.id || `new-${index}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm flex items-center justify-center font-bold">
                      {stage.sequence}
                    </span>
                    Stage {stage.sequence}: {stage.stage_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Move Up/Down Buttons */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStageUp(index)}
                        disabled={index === 0}
                        title="Pindah ke atas"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStageDown(index)}
                        disabled={index >= (localStages?.length || 0) - 1}
                        title="Pindah ke bawah"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStage(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stage Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipe Stage</Label>
                    <Select
                      value={stage.stage_type}
                      onValueChange={(value: StageType) => 
                        updateLocalStage(index, { stage_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="APPROVAL">Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nama Stage</Label>
                    <Input
                      value={stage.stage_name}
                      onChange={(e) => updateLocalStage(index, { stage_name: e.target.value })}
                      placeholder="Contoh: Review oleh Manager"
                    />
                  </div>
                </div>

                {/* Completion Rule */}
                <div className="space-y-2">
                  <Label>Aturan Penyelesaian</Label>
                  <Select
                    value={stage.completion_rule}
                    onValueChange={(value: CompletionRule) => 
                      updateLocalStage(index, { completion_rule: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua harus approve (ALL)</SelectItem>
                      <SelectItem value="ANY_ONE">Salah satu bisa approve (ANY_ONE)</SelectItem>
                      <SelectItem value="MAJORITY">Mayoritas harus approve (MAJORITY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignees */}
                <div className="space-y-2">
                  <Label>Assignees</Label>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => addAssignee(index, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Tambah assignee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.filter(u => 
                          !stage.assignees.some(a => a.user_id === u.id)
                        ).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nama} ({user.jabatan || 'No Role'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignee List */}
                  {stage.assignees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {stage.assignees.map((assignee, assigneeIndex) => (
                        <div
                          key={assignee.user_id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                        >
                          {/* Primary Indicator */}
                          {assignee.is_primary && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                          <span>{assignee.user_name}</span>
                          
                          {/* Set Primary Button */}
                          {!assignee.is_primary && (
                            <button
                              onClick={() => setPrimaryAssignee(index, assigneeIndex)}
                              className="text-gray-400 hover:text-yellow-500"
                              title="Jadikan Primary"
                            >
                              <Star className="h-3 w-3" />
                            </button>
                          )}
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeAssignee(index, assigneeIndex)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {stage.assignees.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Belum ada assignee. Tambahkan minimal satu assignee.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Stage Button */}
          <Button
            variant="outline"
            className="w-full py-8 border-dashed"
            onClick={addStage}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Stage
          </Button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        isLoading={saving}
      />
    </div>
  )
}
```

---

## Phase 2: UX Improvements

### 2.1 Updated Workflow List Page with Delete Confirmation

**File: `src/app/(protected)/setting/workflow/page.tsx`**

Add delete functionality with confirmation. Add this to the existing file:

```tsx
// Add imports
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/use-toast"

// Add inside component
const { toast } = useToast()
const [deleteDocType, setDeleteDocType] = React.useState<{ id: number; name: string } | null>(null)
const [isDeleting, setIsDeleting] = React.useState(false)

// Add delete handler
const handleDeleteDocType = async () => {
  if (!deleteDocType) return
  setIsDeleting(true)
  try {
    const { error } = await supabase
      .from('document_types')
      .update({ is_active: false })
      .eq('id', deleteDocType.id)
    
    if (error) throw error
    
    toast({
      title: "Berhasil",
      description: `Document type "${deleteDocType.name}" berhasil dinonaktifkan.`,
    })
    
    queryClient.invalidateQueries({ queryKey: ['document-types'] })
    queryClient.invalidateQueries({ queryKey: ['document-types-with-workflow'] })
  } catch (error) {
    toast({
      title: "Gagal",
      description: "Gagal menghapus document type.",
      variant: "destructive",
    })
  } finally {
    setIsDeleting(false)
    setDeleteDocType(null)
  }
}

// Add delete button in UI (modify the existing action buttons)
<Button
  variant="ghost"
  size="sm"
  onClick={() => setDeleteDocType({ id: docType.id, name: docType.name })}
  className="text-red-500 hover:text-red-700"
>
  <Trash2 className="h-4 w-4" />
</Button>

// Add ConfirmDialog at the end
<ConfirmDialog
  isOpen={!!deleteDocType}
  onClose={() => setDeleteDocType(null)}
  onConfirm={handleDeleteDocType}
  title="Hapus Document Type"
  message={`Apakah Anda yakin ingin menghapus "${deleteDocType?.name}"? Document type akan dinonaktifkan dan tidak akan muncul di daftar.`}
  variant="danger"
  isLoading={isDeleting}
  confirmText="Hapus"
/>
```

---

## Phase 3: Backend Enhancements

### 3.1 Updated useWorkflow Hook with Soft Delete

**File: `src/hooks/useWorkflow.ts`**

Replace the `useDeleteWorkflowStage` function:

```tsx
/**
 * Delete workflow stage (soft delete)
 */
export function useDeleteWorkflowStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stageId: number) => {
      // Soft delete - set is_active = false
      const { data, error } = await supabase
        .from('document_workflow_stages')
        .update({ is_active: false })
        .eq('id', stageId)
        .select()
        .single()
      
      if (error) throw error
      return data as WorkflowStage
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stage', data.id] })
      queryClient.invalidateQueries({ queryKey: ['workflow-stages', data.document_type_id] })
      queryClient.invalidateQueries({ queryKey: ['workflow-summary'] })
      queryClient.invalidateQueries({ queryKey: ['document-types-with-workflow'] })
    },
  })
}

/**
 * Get workflow audit logs for a document type
 */
export function useWorkflowAuditLogs(documentTypeId?: number) {
  return useQuery({
    queryKey: ['workflow-audit-logs', documentTypeId],
    queryFn: async () => {
      if (!documentTypeId) return []
      
      const { data, error } = await supabase
        .from('workflow_audit_logs')
        .select(`
          *,
          changed_by:users(id, nama, email)
        `)
        .eq('document_type_id', documentTypeId)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return data
    },
    enabled: !!documentTypeId,
  })
}

/**
 * Log workflow change
 */
export function useLogWorkflowChange() {
  return useMutation({
    mutationFn: async ({
      documentTypeId,
      action,
      details,
      stageId,
    }: {
      documentTypeId: number
      action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REORDER'
      details: string
      stageId?: number
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      const { error } = await supabase
        .from('workflow_audit_logs')
        .insert({
          document_type_id: documentTypeId,
          stage_id: stageId,
          action,
          details,
          changed_by_id: user.id,
        })
      
      if (error) throw error
    },
  })
}
```

---

### 3.2 Add Audit Log to Preview Page

**File: `src/app/(protected)/setting/workflow/document-types/[id]/preview/page.tsx`**

Add audit log section at the end of the page:

```tsx
// Add import
import { useWorkflowAuditLogs } from "@/hooks/useWorkflow"

// Add inside component, after stages query
const { data: auditLogs } = useWorkflowAuditLogs(documentTypeId)

// Add new Card after "Rules Explanation" Card
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <History className="h-5 w-5" />
      Audit Log
    </CardTitle>
  </CardHeader>
  <CardContent>
    {!auditLogs || auditLogs.length === 0 ? (
      <p className="text-gray-500 text-center py-4">
        Belum ada riwayat perubahan.
      </p>
    ) : (
      <div className="space-y-3">
        {auditLogs.map((log: any) => (
          <div 
            key={log.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                  log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {log.action}
                </span>
                <span className="font-medium text-sm">{log.details}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{log.changed_by?.nama || 'Unknown'}</span>
                <span>•</span>
                <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

---

## Database Migration

### Migration File: `supabase/migrations/20250225_workflow_audit_logs.sql`

```sql
-- =====================================================
-- Workflow Audit Logs Table
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type_id INTEGER NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  stage_id INTEGER REFERENCES document_workflow_stages(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'REORDER')),
  details TEXT NOT NULL,
  changed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_document_type_id 
  ON workflow_audit_logs(document_type_id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_created_at 
  ON workflow_audit_logs(created_at DESC);

-- =====================================================
-- Unique Constraint for Stage Sequence
-- =====================================================

-- Add unique constraint for document_type_id + sequence
ALTER TABLE document_workflow_stages 
ADD CONSTRAINT unique_doc_type_sequence 
UNIQUE (document_type_id, sequence);

-- =====================================================
-- Trigger for Audit Logging
-- =====================================================

-- Function to log workflow changes
CREATE OR REPLACE FUNCTION log_workflow_change()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_details TEXT;
  v_user_id UUID;
BEGIN
  -- Get current user
  SELECT id INTO v_user_id FROM auth.users WHERE id = auth.uid();
  
  -- Determine action and details
  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATE';
    v_details := 'Created stage: ' || NEW.stage_name || ' (Sequence: ' || NEW.sequence || ')';
    
    INSERT INTO workflow_audit_logs (
      document_type_id,
      stage_id,
      action,
      details,
      changed_by_id
    ) VALUES (
      NEW.document_type_id,
      NEW.id,
      v_action,
      v_details,
      v_user_id
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_details := 'Updated stage: ' || NEW.stage_name;
    
    -- Check what changed
    IF OLD.stage_name != NEW.stage_name THEN
      v_details := v_details || ' (Name: ' || OLD.stage_name || ' → ' || NEW.stage_name || ')';
    END IF;
    IF OLD.sequence != NEW.sequence THEN
      v_details := v_details || ' (Sequence: ' || OLD.sequence || ' → ' || NEW.sequence || ')';
    END IF;
    IF OLD.stage_type != NEW.stage_type THEN
      v_details := v_details || ' (Type: ' || OLD.stage_type || ' → ' || NEW.stage_type || ')';
    END IF;
    
    INSERT INTO workflow_audit_logs (
      document_type_id,
      stage_id,
      action,
      details,
      changed_by_id
    ) VALUES (
      NEW.document_type_id,
      NEW.id,
      v_action,
      v_details,
      v_user_id
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_details := 'Deleted stage: ' || OLD.stage_name;
    
    INSERT INTO workflow_audit_logs (
      document_type_id,
      stage_id,
      action,
      details,
      changed_by_id
    ) VALUES (
      OLD.document_type_id,
      NULL, -- Stage is deleted
      v_action,
      v_details,
      v_user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_log_workflow_change ON document_workflow_stages;
CREATE TRIGGER trigger_log_workflow_change
AFTER INSERT OR UPDATE OR DELETE ON document_workflow_stages
FOR EACH ROW EXECUTE FUNCTION log_workflow_change();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE workflow_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view audit logs
CREATE POLICY "Users can view workflow audit logs" ON workflow_audit_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can insert audit logs (trigger bypasses this)
CREATE POLICY "Only system can insert audit logs" ON workflow_audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE workflow_audit_logs IS 'Audit log for workflow configuration changes';
COMMENT ON COLUMN workflow_audit_logs.action IS 'Action type: CREATE, UPDATE, DELETE, REORDER';
COMMENT ON COLUMN workflow_audit_logs.details IS 'Human-readable description of the change';
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/components/ui/ConfirmDialog.tsx` | **NEW** - Reusable confirmation dialog |
| `src/app/.../[id]/page.tsx` | Delete fix, reordering, primary toggle, unsaved warning |
| `src/app/.../page.tsx` | Delete document type with confirmation |
| `src/hooks/useWorkflow.ts` | Soft delete, audit log hooks |
| `src/app/.../[id]/preview/page.tsx` | Audit log display |
| `supabase/migrations/...` | Audit log table, constraints, triggers |

---

## Implementation Order

1. **Run database migration first** - Creates audit log table and constraints
2. **Create ConfirmDialog component** - Used by other components
3. **Update hooks** - Add soft delete and audit log functions
4. **Update edit workflow page** - Main implementation
5. **Update workflow list page** - Add delete confirmation
6. **Update preview page** - Add audit log display

---

## Testing Checklist

- [ ] Create new document type
- [ ] Add stages and assignees
- [ ] Reorder stages (up/down)
- [ ] Set primary assignee
- [ ] Delete stage with confirmation
- [ ] Navigate away with unsaved changes (should show warning)
- [ ] Check audit log shows all changes
- [ ] Test on mobile device
- [ ] Verify soft delete (stage should not appear but still in DB)
