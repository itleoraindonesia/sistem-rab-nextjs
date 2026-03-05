"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, Trash2, Save, Loader2, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase/client"
import {
  useWorkflowStages,
  useCreateWorkflowStage,
  useUpdateWorkflowStage,
  useDeleteWorkflowStage,
} from "@/hooks/useWorkflow"
import { useDocumentTypes } from "@/hooks/useLetters"
import { useUsersList } from "@/hooks/useLetters"
import type { WorkflowAssignee, StageType, CompletionRule } from "@/types/workflow"

export default function EditWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const documentTypeId = parseInt(params.id as string)

  const { data: documentTypes } = useDocumentTypes()
  const { data: users } = useUsersList()
  const { data: stages, isLoading: stagesLoading } = useWorkflowStages(documentTypeId)
  const createStage = useCreateWorkflowStage()
  const updateStage = useUpdateWorkflowStage()
  const deleteStage = useDeleteWorkflowStage()

  const documentType = documentTypes?.find(dt => dt.id === documentTypeId)

  const [localStages, setLocalStages] = React.useState<typeof stages>([])
  const [saving, setSaving] = React.useState(false)
  const [docName, setDocName] = React.useState("")
  const [docDesc, setDocDesc] = React.useState("")

  React.useEffect(() => {
    if (stages) {
      setLocalStages(stages)
    }
  }, [stages])

  React.useEffect(() => {
    if (documentType) {
      setDocName(documentType.name || "")
      setDocDesc(documentType.description || "")
    }
  }, [documentType])

  const addStage = () => {
    if ((localStages?.length || 0) >= 2) {
      alert("Maksimal hanya 2 stage (Review dan Approval)")
      return
    }
    const newSequence = (localStages?.length || 0) + 1
    const newStageType = newSequence === 1 ? 'REVIEW' : 'APPROVAL'
    const newStage = {
      document_type_id: documentTypeId,
      stage_type: newStageType as StageType,
      sequence: newSequence,
      assignees: [] as WorkflowAssignee[],
      completion_rule: 'ALL' as CompletionRule,
      is_required: true,
      is_active: true,
    }
    setLocalStages(prev => [...(prev || []), newStage])
  }

  const updateLocalStage = (index: number, updates: Partial<import('@/types/workflow').WorkflowStage>) => {
    setLocalStages(prev =>
      prev?.map((stage, i) => i === index ? { ...stage, ...updates } : stage)
    )
  }

  const removeStage = (index: number) => {
    setLocalStages(prev => prev?.filter((_, i) => i !== index))
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

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update document type if changed
      if (documentType && (docName !== documentType.name || docDesc !== documentType.description)) {
        await supabase
          .from('document_types')
          .update({ name: docName, description: docDesc })
          .eq('id', documentTypeId)
      }

      // Save all stages
      for (let i = 0; i < (localStages?.length || 0); i++) {
        const stage = localStages![i]
        if (stage.id) {
          // Update existing
          await updateStage.mutateAsync({
            stageId: stage.id,
            updates: {
              stage_type: stage.stage_type,
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
            sequence: stage.sequence,
            assignees: stage.assignees,
            completion_rule: stage.completion_rule,
            is_required: stage.is_required,
            is_active: true,
          })
        }
      }

      router.push('/setting/workflow')
    } catch (error) {
      console.error('Error saving workflow:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Gagal menyimpan workflow: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  if (stagesLoading) {
    return (
 <div className=" py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data workflow...</span>
        </div>
      </div>
    )
  }

  if (!documentType) {
    return (
 <div className=" py-8">
        <div className="text-center">
          <p className="text-gray-500">Document type tidak ditemukan.</p>
        </div>
      </div>
    )
  }

  return (
 <div className=" py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary">
                Konfigurasi Workflow
              </h1>
              <p className="text-gray-600 mt-1">
                Atur informasi dan tahapan alur untuk {docName || documentType.code}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saving}
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

        {/* Header Section: Document Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informasi Document Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="docName">Nama Dokumen</Label>
              <Input
                id="docName"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Contoh: Surat Perjalanan Dinas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="docDesc">Keterangan</Label>
              <Textarea
                id="docDesc"
                value={docDesc}
                onChange={(e) => setDocDesc(e.target.value)}
                placeholder="Deskripsi singkat jenis dokumen ini..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Stages Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Tahapan Workflow (Horizontal)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            {localStages?.map((stage, index) => (
              <React.Fragment key={stage.id || index}>
                <Card className="w-full relative shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gray-50/80 border-b pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm flex items-center justify-center font-bold shadow-sm">
                          {stage.sequence}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                          stage.stage_type === 'REVIEW'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {stage.stage_type === 'REVIEW' ? 'Review' : 'Approval'}
                        </span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Completion Rule */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Aturan Penyelesaian</Label>
                      <Select
                        value={stage.completion_rule}
                        onValueChange={(value: CompletionRule) => 
                          updateLocalStage(index, { completion_rule: value })
                        }
                      >
                        <SelectTrigger className="w-full md:w-2/3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Semua harus setuju (ALL)</SelectItem>
                          <SelectItem value="ANY_ONE">Salah satu bisa setuju (ANY_ONE)</SelectItem>
                          <SelectItem value="MAJORITY">Mayoritas harus setuju (MAJORITY)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Menentukan berapa banyak assignee yang diwajibkan untuk menyelesaikan tahap ini.
                      </p>
                    </div>

                    {/* Assignees */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <Label className="text-gray-700 font-medium">Assignees (Penanggung Jawab)</Label>
                      <div className="flex gap-2 w-full md:w-2/3">
                        <Select
                          onValueChange={(value) => addAssignee(index, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Tambah assignee baru..." />
                          </SelectTrigger>
                          <SelectContent>
                            {users?.filter(u => 
                              !stage.assignees.some(a => a.user_id === u.id)
                            ).map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.nama} {user.jabatan ? `(${user.jabatan})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Assignee List */}
                      {stage.assignees.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {stage.assignees.map((assignee, assigneeIndex) => (
                            <div
                              key={assignee.user_id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm group"
                            >
                              <span className="font-medium text-gray-700">{assignee.user_name}</span>
                              <span className="text-xs text-gray-500 max-w-[150px] truncate hidden sm:inline">
                                {assignee.user_role}
                              </span>
                              <button
                                onClick={() => removeAssignee(index, assigneeIndex)}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                                title="Hapus assignee"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-orange-50 border border-orange-100 rounded-md mt-2">
                          <p className="text-sm text-orange-800">Belum ada assignee. Silakan tambah minimal satu orang.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}

            {/* Add Stage Button */}
            {(!localStages || localStages.length < 2) && (
              <Button
                variant="outline"
                className="w-full h-full min-h-[300px] border-dashed flex flex-col items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary/50 transition-colors rounded-xl"
                onClick={addStage}
              >
                <Plus className="mb-2 h-8 w-8 text-gray-400" />
                <span className="font-medium text-gray-600 text-lg">Tambah Tahap Baru</span>
                <span className="text-xs text-gray-400 mt-1">Maksimal 2 tahap (Review & Approval)</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
