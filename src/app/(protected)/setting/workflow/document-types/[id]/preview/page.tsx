"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Users, CheckCircle, Eye, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import Button from "@/components/ui/Button"
import { useWorkflowStages } from "@/hooks/useWorkflow"
import { useDocumentTypes } from "@/hooks/useLetters"

export default function PreviewWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const documentTypeId = parseInt(params.id as string)

  const { data: documentTypes } = useDocumentTypes()
  const { data: stages, isLoading } = useWorkflowStages(documentTypeId)

  const documentType = documentTypes?.find(dt => dt.id === documentTypeId)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Memuat data workflow...</p>
        </div>
      </div>
    )
  }

  if (!documentType) {
    return (
      <div className="container mx-auto py-8">
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
    <div className="container mx-auto py-6">
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
                Preview Workflow: {documentType.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Visualisasi workflow approval untuk {documentType.code}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button 
              onClick={() => router.push(`/setting/workflow/document-types/${documentTypeId}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Workflow Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            {!stages || stages.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Workflow belum dikonfigurasi.</p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push(`/setting/workflow/document-types/${documentTypeId}`)}
                >
                  Setup Workflow
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Flow Diagram */}
                <div className="flex flex-col items-center">
                  {/* Start */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Start (Draft Created)</span>
                  </div>

                  {/* Stages */}
                  {stages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                      {/* Arrow */}
                      <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 my-2" />

                      {/* Stage Card */}
                      <div className="w-full max-w-2xl border-2 border-gray-200 rounded-lg p-6 bg-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
                              {stage.sequence}
                            </span>
                            <div>
                              <h3 className="font-semibold text-lg">{stage.stage_name}</h3>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                stage.stage_type === 'REVIEW' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {stage.stage_type}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Completion Rule</p>
                            <p className="font-medium">{stage.completion_rule}</p>
                          </div>
                        </div>

                        {/* Assignees */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Assignees ({stage.assignees.length})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {stage.assignees.map((assignee, idx) => (
                              <div 
                                key={assignee.user_id}
                                className="flex items-center justify-between bg-white p-3 rounded border"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                    {assignee.user_name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium">{assignee.user_name}</p>
                                    <p className="text-xs text-gray-500">{assignee.user_role}</p>
                                  </div>
                                </div>
                                {assignee.is_primary && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                    Primary
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="mt-4 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`h-4 w-4 ${stage.is_required ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className={stage.is_required ? 'text-gray-700' : 'text-gray-400'}>
                              {stage.is_required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* End */}
                  <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 my-2" />
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">End (Approved/Rejected)</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brand-primary">{stages.length}</p>
                    <p className="text-sm text-gray-600">Total Stages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {stages.filter(s => s.stage_type === 'REVIEW').length}
                    </p>
                    <p className="text-sm text-gray-600">Review Stages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {stages.filter(s => s.stage_type === 'APPROVAL').length}
                    </p>
                    <p className="text-sm text-gray-600">Approval Stages</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules Explanation */}
        {stages && stages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completion Rules Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">ALL</h4>
                  <p className="text-sm text-blue-700">
                    Semua assignees harus memberikan approval. Stage hanya selesai jika semua setuju.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">ANY_ONE</h4>
                  <p className="text-sm text-green-700">
                    Salah satu assignee saja yang perlu approve. Stage selesai jika minimal satu setuju.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">MAJORITY</h4>
                  <p className="text-sm text-purple-700">
                    Lebih dari 50% assignees harus approve. Stage selesai jika mayoritas setuju.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
