import { Database } from '@/types/database';

// Table types
export type DocumentType = Database['public']['Tables']['document_types']['Row'];
export type DocumentWorkflowConfig = Database['public']['Tables']['document_workflow_configs']['Row'];
export type OutgoingLetter = Database['public']['Tables']['outgoing_letters']['Row'];
export type LetterWorkflowTracking = Database['public']['Tables']['letter_workflow_trackings']['Row'];
export type LetterHistory = Database['public']['Tables']['letter_histories']['Row'];

// Insert types
export type OutgoingLetterInsert = Database['public']['Tables']['outgoing_letters']['Insert'];
export type LetterHistoryInsert = Database['public']['Tables']['letter_histories']['Insert'];

// Enums
export type LetterStatus = 'DRAFT' | 'SUBMITTED_TO_REVIEW' | 'NEEDS_REVISION' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
export type StageType = 'REVIEW' | 'APPROVAL';
export type ReviewMode = 'SEQUENTIAL' | 'PARALLEL';
export type CompletionRule = 'ALL' | 'ANY' | 'MAJORITY';
export type ActionType = 'CREATED' | 'SUBMITTED' | 'APPROVED_REVIEW' | 'REVISION_REQUESTED' | 'REVISED' | 'APPROVED_FINAL' | 'REJECTED';

// Extended types (dengan relasi)
export type OutgoingLetterWithRelations = OutgoingLetter & {
  document_type: DocumentType;
  company: Database['public']['Tables']['instansi']['Row'];
  created_by: Database['public']['Tables']['users']['Row'];
  sender?: Database['public']['Tables']['users']['Row'];
  workflow_trackings?: LetterWorkflowTracking[];
  histories?: LetterHistory[];
};