"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings, Users, FileText, ArrowRight, Edit, Trash2, Eye, ChevronDown } from "lucide-react"
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

        {/* Document Types with Workflow */}
        <div className="w-full">
          {!documentTypesWithWorkflow || documentTypesWithWorkflow.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada document type. Klik "Tambah Document Type" untuk memulai.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                {documentTypesWithWorkflow.map((docType) => (
                  <details
                    key={docType.id}
                    className="group bg-white overflow-hidden hover:bg-gray-50/50 transition-all duration-200"
                  >
                    <summary className="list-none cursor-pointer p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none outline-none">
                      {/* Left: Doc Type Info */}
                      <div className="flex items-center gap-3 w-full md:w-1/3">
                        <div className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                          <ChevronDown className="h-5 w-5 text-gray-400 group-open:-rotate-180 transition-transform duration-200" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium md:font-semibold text-gray-900 truncate">{docType.name}</h3>
                            <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-blue-50 text-blue-700 text-[10px] font-mono rounded border border-blue-100 flex-shrink-0">
                              {docType.code}
                            </span>
                            {!docType.is_active && (
                              <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded flex-shrink-0">
                                Inactive
                              </span>
                            )}
                          </div>
                          {docType.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate hidden md:block">{docType.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Middle: Mini Stepper */}
                      <div className="w-full md:flex-1 flex items-center justify-center py-2 md:py-0">
                        {docType.stages && docType.stages.length > 0 ? (
                          <div className="flex items-center w-full max-w-sm lg:max-w-md justify-center">
                            {docType.stages.map((stage, idx) => (
                              <React.Fragment key={stage.id}>
                                <div className="flex flex-col items-center relative group/tooltip">
                                  <div 
                                    className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full z-10 ${
                                      stage.stage_type === 'REVIEW' ? 'bg-blue-400' : 'bg-emerald-400'
                                    } ring-2 ring-white shadow-sm`} 
                                  />
                                  <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block z-[60] bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
                                    <span className="font-semibold">{stage.stage_type}</span>
                                    <span className="text-gray-300 ml-1">({stage.assignees?.length || 0} Assignees)</span>
                                  </div>
                                </div>
                                {idx < docType.stages.length - 1 && (
                                  <div className="h-[2px] w-6 sm:w-10 md:w-16 bg-gray-200" />
                                )}
                              </React.Fragment>
                            ))}
                            <span className="ml-3 md:ml-4 text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-200">
                              {docType.stages.length} Tahap
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] md:text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                            Belum dikonfigurasi
                          </span>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 w-full md:w-auto md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 md:flex-none h-8 text-xs md:text-sm text-gray-600 hover:text-gray-900"
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/setting/workflow/document-types/${docType.id}`);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5 md:mr-1" />
                          <span className="hidden md:inline">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 md:flex-none h-8 text-xs md:text-sm text-gray-600 hover:text-gray-900"
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/setting/workflow/document-types/${docType.id}/preview`);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 md:mr-1" />
                          <span className="hidden md:inline">Preview</span>
                        </Button>
                      </div>
                    </summary>

                    {/* Expanded Content (Details) */}
                    <div className="px-4 pb-5 pt-2 md:pl-[4.5rem] border-t border-gray-100 bg-gray-50/50">
                      {docType.stages && docType.stages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-2">
                          {docType.stages.map((stage) => (
                            <div key={stage.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${
                                  stage.stage_type === 'REVIEW' ? 'bg-blue-500' : 'bg-emerald-500'
                                }`}>
                                  {stage.sequence}
                                </span>
                                <span className={`text-xs font-semibold ${
                                  stage.stage_type === 'REVIEW' ? 'text-blue-700' : 'text-emerald-700'
                                }`}>
                                  {stage.stage_type}
                                </span>
                                <div className="ml-auto text-[10px] text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded truncate max-w-[80px]" title={stage.completion_rule}>
                                  {stage.completion_rule}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                  <Users className="h-3.5 w-3.5 text-gray-400" />
                                  <span>{stage.assignees?.length || 0} Assignee(s)</span>
                                </div>
                                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                                  {stage.assignees?.map((assignee, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50/80 p-1.5 rounded border border-gray-100">
                                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${assignee.is_primary ? 'bg-brand-primary' : 'bg-gray-300'}`} />
                                      <span className="truncate flex-1" title={assignee.user_name}>{assignee.user_name}</span>
                                      {assignee.is_primary && (
                                        <span className="text-[9px] text-brand-primary font-medium px-1 py-0.5 bg-brand-primary/10 rounded uppercase flex-shrink-0 tracking-wider">Primary</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2">
                          <p className="text-sm text-gray-500">
                            Silakan klik tombol Edit untuk menambahkan tahapan pada dokumen ini.
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
          )}
        </div>

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
                    className="border border-orange-200 bg-orange-50 rounded-lg p-4 hover:bg-orange-100/50 transition-colors"
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
