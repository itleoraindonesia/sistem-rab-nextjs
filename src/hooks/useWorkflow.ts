/**
 * Workflow Management Hooks
 * 
 * React Query hooks for managing document workflow configurations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { WorkflowStage, DocumentTypeWithWorkflow, WorkflowSummary } from '@/types/workflow'

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get all workflow stages for a document type
 */
export function useWorkflowStages(documentTypeId?: number) {
  return useQuery({
    queryKey: ['workflow-stages', documentTypeId],
    queryFn: async () => {
      if (!documentTypeId) return []
      
      const { data, error } = await supabase
        .from('document_workflow_stages')
        .select('*')
        .eq('document_type_id', documentTypeId)
        .eq('is_active', true)
        .order('sequence', { ascending: true })
      
      if (error) throw error
      return data as WorkflowStage[]
    },
    enabled: !!documentTypeId,
  })
}

/**
 * Get workflow summary (view) for all document types
 */
export function useWorkflowSummary() {
  return useQuery({
    queryKey: ['workflow-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_document_workflow_summary')
        .select('*')
        .order('document_type_id', { ascending: true })
        .order('sequence', { ascending: true })
      
      if (error) throw error
      return data as WorkflowSummary[]
    },
  })
}

/**
 * Get document types with their workflow stages
 */
export function useDocumentTypesWithWorkflow() {
  return useQuery({
    queryKey: ['document-types-with-workflow'],
    queryFn: async () => {
      // Get document types
      const { data: docTypes, error: docError } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (docError) throw docError
      
      // Get all workflow stages
      const { data: stages, error: stagesError } = await supabase
        .from('document_workflow_stages')
        .select('*')
        .eq('is_active', true)
        .order('sequence', { ascending: true })
      
      if (stagesError) throw stagesError
      
      // Combine them
      const result: DocumentTypeWithWorkflow[] = (docTypes || []).map((dt: any) => ({
        ...dt,
        stages: (stages || []).filter((s: any) => s.document_type_id === dt.id) as WorkflowStage[]
      }))
      
      return result
    },
  })
}

/**
 * Get single workflow stage
 */
export function useWorkflowStage(stageId?: number) {
  return useQuery({
    queryKey: ['workflow-stage', stageId],
    queryFn: async () => {
      if (!stageId) return null
      
      const { data, error } = await supabase
        .from('document_workflow_stages')
        .select('*')
        .eq('id', stageId)
        .single()
      
      if (error) throw error
      return data as WorkflowStage
    },
    enabled: !!stageId,
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create workflow stage
 */
export function useCreateWorkflowStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stage: Omit<WorkflowStage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('document_workflow_stages')
        .insert(stage)
        .select()
        .single()
      
      if (error) throw error
      return data as WorkflowStage
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stages', variables.document_type_id] })
      queryClient.invalidateQueries({ queryKey: ['workflow-summary'] })
      queryClient.invalidateQueries({ queryKey: ['document-types-with-workflow'] })
    },
  })
}

/**
 * Update workflow stage
 */
export function useUpdateWorkflowStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      stageId, 
      updates 
    }: { 
      stageId: number
      updates: Partial<Omit<WorkflowStage, 'id' | 'created_at' | 'updated_at'>>
    }) => {
      const { data, error } = await supabase
        .from('document_workflow_stages')
        .update(updates)
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
 * Delete workflow stage
 */
export function useDeleteWorkflowStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stageId: number) => {
      const { error } = await supabase
        .from('document_workflow_stages')
        .delete()
        .eq('id', stageId)
      
      if (error) throw error
      return stageId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stages'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-summary'] })
      queryClient.invalidateQueries({ queryKey: ['document-types-with-workflow'] })
    },
  })
}

/**
 * Bulk update workflow stages (reorder, etc)
 */
export function useBulkUpdateWorkflowStages() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stages: { id: number; sequence: number }[]) => {
      const updates = stages.map(({ id, sequence }) => 
        supabase
          .from('document_workflow_stages')
          .update({ sequence })
          .eq('id', id)
      )
      
      const results = await Promise.all(updates)
      const errors = results.filter(r => r.error)
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} stages`)
      }
      
      return stages
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stages'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-summary'] })
      queryClient.invalidateQueries({ queryKey: ['document-types-with-workflow'] })
    },
  })
}

/**
 * Update assignees for a stage
 */
export function useUpdateStageAssignees() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      stageId, 
      assignees 
    }: { 
      stageId: number
      assignees: WorkflowStage['assignees']
    }) => {
      const { data, error } = await supabase
        .from('document_workflow_stages')
        .update({ assignees })
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
