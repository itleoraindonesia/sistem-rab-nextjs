"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react"
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

  React.useEffect(() => {
    if (stages) {
      setLocalStages(stages)
    }
  }, [stages])

  const addStage = () => {
    const newSequence = (localStages?.length || 0) + 1
    const newStage = {
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
      // Save all stages
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

      router.push('/setting/workflow')
    } catch (error) {
      console.error('Error saving workflow:', error)
      alert('Gagal menyimpan workflow. Silakan coba lagi.')
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
 <div className=" py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/setting/workflow')}
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

        {/* Stages */}
        <div className="space-y-4">
          {localStages?.map((stage, index) => (
            <Card key={stage.id || index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm flex items-center justify-center font-bold">
                      {stage.sequence}
                    </span>
                    Stage {stage.sequence}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStage(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stage Type */}
                <div className="grid grid-cols-2 gap-4">
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
                          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          <span>{assignee.user_name}</span>
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
    </div>
  )
}
