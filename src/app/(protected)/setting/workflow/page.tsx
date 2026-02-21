"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings, Users, FileText, ArrowRight, Edit, Trash2, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { useDocumentTypesWithWorkflow } from "../../../../hooks/useWorkflow"
import { useDocumentTypes } from "../../../../hooks/useLetters"

export default function WorkflowAdminPage() {
  const router = useRouter()
  const { data: documentTypesWithWorkflow, isLoading } = useDocumentTypesWithWorkflow()
  const { data: allDocTypes } = useDocumentTypes()

  if (isLoading) {
    return (
 <div className=" py-8">
        <div className="text-center">
          <p>Memuat data workflow...</p>
        </div>
      </div>
    )
  }

  const docTypesWithoutWorkflow = allDocTypes?.filter(
    dt => !documentTypesWithWorkflow?.find(dtw => dtw.id === dt.id)
  ) || []

  return (
 <div className=" py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Workflow Management</h1>
            <p className="text-gray-600 mt-1">
              Kelola workflow approval untuk setiap jenis dokumen
            </p>
          </div>
          <Button onClick={() => router.push('/setting/workflow/document-types/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Document Type
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Document Types</p>
                  <p className="text-2xl font-bold text-brand-primary mt-1">
                    {allDocTypes?.length || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Workflow</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {documentTypesWithWorkflow?.filter(dt => dt.stages.length > 0).length || 0}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Without Workflow</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {docTypesWithoutWorkflow.length}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Stages</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {documentTypesWithWorkflow?.reduce((sum, dt) => sum + dt.stages.length, 0) || 0}
                  </p>
                </div>
                <ArrowRight className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Types with Workflow */}
        <Card>
          <CardHeader>
            <CardTitle>Document Types & Workflow Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {!documentTypesWithWorkflow || documentTypesWithWorkflow.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada document type. Klik "Tambah Document Type" untuk memulai.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documentTypesWithWorkflow.map((docType) => (
                  <div
                    key={docType.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Document Type Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{docType.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">
                            {docType.code}
                          </span>
                          {!docType.is_active && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        {docType.description && (
                          <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/setting/workflow/document-types/${docType.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/setting/workflow/document-types/${docType.id}/preview`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Workflow Stages */}
                    {docType.stages.length === 0 ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                        <p className="text-sm text-orange-800">
                          ⚠️ Workflow belum dikonfigurasi.{' '}
                          <button
                            onClick={() => router.push(`/setting/workflow/document-types/${docType.id}`)}
                            className="underline font-medium hover:text-orange-900"
                          >
                            Klik di sini untuk setup
                          </button>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          Workflow Stages ({docType.stages.length}):
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {docType.stages.map((stage, index) => (
                            <React.Fragment key={stage.id}>
                              {/* Stage Card */}
                              <div className="flex-shrink-0 bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center font-bold">
                                    {stage.sequence}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    stage.stage_type === 'REVIEW' 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {stage.stage_type}
                                  </span>
                                </div>
                                <p className="font-medium text-sm mb-2">{stage.stage_name}</p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Users className="h-3 w-3" />
                                    <span>{stage.assignees.length} assignee(s)</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Rule: <span className="font-medium">{stage.completion_rule}</span>
                                  </div>
                                </div>
                                {/* Assignees */}
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  {stage.assignees.slice(0, 2).map((assignee, idx) => (
                                    <div key={idx} className="text-xs text-gray-700 truncate">
                                      • {assignee.user_name}
                                      {assignee.is_primary && (
                                        <span className="ml-1 text-brand-primary">★</span>
                                      )}
                                    </div>
                                  ))}
                                  {stage.assignees.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{stage.assignees.length - 2} more
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Arrow */}
                              {index < docType.stages.length - 1 && (
                                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Types Without Workflow */}
        {docTypesWithoutWorkflow.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700">
                Document Types Tanpa Workflow ({docTypesWithoutWorkflow.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {docTypesWithoutWorkflow.map((docType) => (
                  <div
                    key={docType.id}
                    className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{docType.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{docType.code}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/setting/workflow/document-types/${docType.id}`)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Setup
                      </Button>
                    </div>
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
