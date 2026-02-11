/**
 * Types for Workflow Management
 */

export type StageType = 'REVIEW' | 'APPROVAL'
export type CompletionRule = 'ALL' | 'ANY_ONE' | 'MAJORITY'

export interface WorkflowAssignee {
  user_id: string
  user_name: string
  user_role: string
  is_primary: boolean
}

export interface WorkflowStage {
  id?: number
  document_type_id: number
  stage_type: StageType
  stage_name: string
  sequence: number
  assignees: WorkflowAssignee[]
  completion_rule: CompletionRule
  is_required: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface DocumentTypeWithWorkflow {
  id: number
  name: string
  code: string
  description: string | null
  category: string | null
  is_active: boolean
  stages: WorkflowStage[]
}

export interface WorkflowSummary {
  document_type_id: number
  document_type_name: string
  document_type_code: string
  stage_id: number | null
  stage_type: StageType | null
  stage_name: string | null
  sequence: number | null
  assignees: WorkflowAssignee[] | null
  completion_rule: CompletionRule | null
  is_required: boolean | null
  is_active: boolean | null
  assignee_count: number | null
}
