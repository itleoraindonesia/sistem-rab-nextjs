"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, Users, CheckCircle, Eye, Printer } from "lucide-react"
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
 <div className=" py-8">
        <div className="text-center">
          <p>Memuat data workflow...</p>
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
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-8">
                  {/* Start */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Start</span>
                  </div>

                  {/* Stages */}
                  {stages.map((stage, index) => (
                    <React.Fragment key={stage.id || index}>
                      {/* Arrow */}
                      <ArrowRight className="h-8 w-8 text-gray-300 md:rotate-0 rotate-90 flex-shrink-0" />

                      {/* Stage Card */}
                      <div className="w-full md:w-80 border-2 border-gray-100 shadow-sm rounded-xl p-5 bg-white">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
                            {stage.sequence}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg">{stage.stage_name}</h3>
                            <span className={`inline-block px-2 py-0.5 mt-1 rounded text-xs font-semibold ${
                              stage.stage_type === 'REVIEW' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {stage.stage_type}
                            </span>
                          </div>
                        </div>

                        {/* Assignees */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Assignees ({stage.assignees.length})
                            </span>
                          </div>
                          <div className="space-y-1">
                            {stage.assignees.map((assignee) => (
                              <div 
                                key={assignee.user_id}
                                className="text-sm font-medium text-gray-800"
                              >
                                • {assignee.user_name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* End */}
                  <ArrowRight className="h-8 w-8 text-gray-300 md:rotate-0 rotate-90 flex-shrink-0" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">End</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
