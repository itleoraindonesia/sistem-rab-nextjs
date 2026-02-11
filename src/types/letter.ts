import { Database } from '@/types/database';

// Table types
export type DocumentType = Database['public']['Tables']['document_types']['Row'];
export type DocumentWorkflowStage = Database['public']['Tables']['document_workflow_stages']['Row'];
export type OutgoingLetter = Database['public']['Tables']['outgoing_letters']['Row'];
export type LetterHistory = Database['public']['Tables']['letter_histories']['Row'] & {
  action_by?: {
    id: string;
    nama: string;
    email: string;
  };
};

// Insert types
export type OutgoingLetterInsert = Database['public']['Tables']['outgoing_letters']['Insert'];
export type LetterHistoryInsert = Database['public']['Tables']['letter_histories']['Insert'];

// Enums - Must match Database['public']['Enums']['letter_status']
export type LetterStatus = 'DRAFT' | 'SUBMITTED_TO_REVIEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
export type StageType = 'REVIEW' | 'APPROVAL';
export type ReviewMode = 'SEQUENTIAL' | 'PARALLEL';
export type CompletionRule = 'ALL' | 'ANY_ONE' | 'MAJORITY';
export type ActionType = 'CREATED' | 'SUBMITTED' | 'APPROVED_REVIEW' | 'REVISION_REQUESTED' | 'REVISED' | 'APPROVED_FINAL' | 'REJECTED';

// Extended types (dengan relasi)
export type OutgoingLetterWithRelations = OutgoingLetter & {
  document_type: DocumentType;
  company: Database['public']['Tables']['instansi']['Row'];
  created_by: Database['public']['Tables']['users']['Row'];
  sender?: Database['public']['Tables']['users']['Row'];
  histories?: LetterHistory[];
};

// Workflow stage tracking (now using letter_histories)
export type WorkflowTrackingFromHistory = {
  stage_type: StageType;
  sequence: number;
  assigned_to_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  action_by?: Database['public']['Tables']['users']['Row'];
};
