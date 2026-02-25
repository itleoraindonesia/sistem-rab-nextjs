/**
 * Letter Service - Supabase Operations
 * 
 * Handles all database operations for outgoing letters workflow
 * including CRUD and workflow state transitions
 * Uses simplified schema: letter_histories replaces letter_workflow_trackings
 */

import { supabase } from '../supabase/client';
import type { 
  OutgoingLetterInsert, 
  LetterHistoryInsert,
  StageType
} from '@/types/letter';

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new letter draft
 */
export async function createLetter(data: OutgoingLetterInsert) {
  const { data: letter, error } = await supabase
    .from('outgoing_letters')
    .insert({
      ...data,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  
  // Create history record
  await insertLetterHistory({
    letter_id: letter.id,
    action_by_id: letter.created_by_id,
    action_type: 'CREATED',
    to_status: 'DRAFT',
    notes: 'Letter created'
  });
  
  return letter;
}

/**
 * Get a single letter with relations
 */
export async function getLetter(letterId: string) {
  console.log('[getLetter] Fetching letter:', letterId);
  
  const { data, error } = await supabase
    .from('outgoing_letters')
    .select(`
      *,
      document_type:document_types(*),
      company:instansi(*),
      created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email, jabatan),
      sender:users!outgoing_letters_sender_id_fkey(id, nama, email, jabatan),
      histories:letter_histories(
        *,
        action_by:users!letter_histories_action_by_id_fkey(id, nama, email)
      )
    `)
    .eq('id', letterId)
    .single();

  console.log('[getLetter] Result:', { data, error });

  if (error) {
    console.error('[getLetter] Error:', error);
    throw error;
  }
  
  return data;
}

export interface LetterWithRelations {
  id: string;
  document_number: string | null;
  subject: string;
  recipient_company: string | null;
  letter_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  document_type_id: number | null;
  company_id: string | null;
  created_by_id: string | null;
  document_type: { id: number; name: string; code: string } | null;
  company: { id: string; nama: string } | null;
  created_by: { id: string; nama: string; email: string } | null;
}

export interface GetLettersFilters {
  status?: string;
  document_type_id?: number;
  created_by_id?: string;
  limit?: number;
  offset?: number;
  page?: number;
  search?: string;
  sortBy?: 'created_at' | 'letter_date' | 'document_number';
  sortOrder?: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 20;

export async function getLetters(filters?: GetLettersFilters): Promise<{
  data: LetterWithRelations[];
  totalCount: number;
  page: number;
  totalPages: number;
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || ITEMS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';

  let query = supabase
    .from('outgoing_letters')
    .select(`
      *,
      document_type:document_types(*),
      company:instansi(*),
      created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
    `, { count: 'exact' });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.document_type_id) {
    query = query.eq('document_type_id', filters.document_type_id);
  }
  if (filters?.created_by_id) {
    query = query.eq('created_by_id', filters.created_by_id);
  }
  if (filters?.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.trim();
    query = query.or(`document_number.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,recipient_company.ilike.%${searchTerm}%`);
  }

  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  
  return {
    data: (data as LetterWithRelations[]) || [],
    totalCount: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Update a letter
 */
export async function updateLetter(letterId: string, updates: Partial<OutgoingLetterInsert>) {
  const { data, error } = await supabase
    .from('outgoing_letters')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', letterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a letter (only DRAFT status)
 */
export async function deleteLetter(letterId: string) {
  const { error } = await supabase
    .from('outgoing_letters')
    .delete()
    .eq('id', letterId);

  if (error) throw error;
}

// ============================================
// WORKFLOW OPERATIONS
// ============================================

/**
 * Submit letter for review
 * - Creates workflow stages in letter_histories
 * - Updates status to SUBMITTED_TO_REVIEW
 */
export async function submitForReview(letterId: string, userId: string) {
  try {
    // 1. Try to use the optimized RPC first (Server-side transaction)
    console.log('Calling RPC submit_letter_for_review with:', { letterId, userId });
    const { data, error } = await supabase.rpc('submit_letter_for_review', {
      p_letter_id: letterId, 
      p_user_id: userId
    });

    console.log('RPC Response:', { data, error });

    if (error) {
      console.error('RPC Network/System Error:', error);
      throw error;
    }

    // Check application level error from RPC (V3)
    if (data && data.success === false) {
      console.error('RPC Application Error Data:', JSON.stringify(data));
      throw new Error(data.error || 'Unknown RPC error');
    }

    return { id: letterId, status: 'SUBMITTED_TO_REVIEW' };

  } catch (rpcError: any) {
    console.warn('RPC failed, falling back to client-side submit (slower):', rpcError);

    // --- FALLBACK: CLIENT-SIDE LOGIC ---
    // 1. Get current letter status
    const letter = await getLetter(letterId);
    if (letter.status !== 'DRAFT') {
      throw new Error('Only draft letters can be submitted for review');
    }

    // 2. Get workflow stages from document_workflow_stages
    const { data: stages } = await supabase
      .from('document_workflow_stages')
      .select('*')
      .eq('document_type_id', letter.document_type_id)
      .eq('is_active', true)
      .eq('stage_type', 'REVIEW')
      .order('sequence', { ascending: true });

    if (!stages || stages.length === 0) {
      throw new Error('No workflow stages found for this document type');
    }

    // 3. Create history entries for each reviewer
    for (const stage of stages) {
      const assignees = stage.assignees || [];
      for (const assignee of assignees) {
        await insertLetterHistory({
          letter_id: letterId,
          action_by_id: userId, // submitted by
          assigned_to_id: assignee.user_id,
          action_type: 'SUBMITTED',
          from_status: 'DRAFT',
          to_status: null, // Pending action - no status yet
          stage_type: 'REVIEW',
          sequence: stage.sequence,
          notes: `Submitted for review - Stage: ${stage.stage_name}`
        });
      }
    }

    // 4. Update letter status
    const updatedLetter = await updateLetter(letterId, {
      status: 'SUBMITTED_TO_REVIEW',
    });

    // 5. Create history for status change
    await insertLetterHistory({
      letter_id: letterId,
      action_by_id: userId,
      action_type: 'SUBMITTED',
      from_status: 'DRAFT',
      to_status: 'SUBMITTED_TO_REVIEW',
      notes: 'Submitted for review'
    });

    return updatedLetter;
  }
}

/**
 * Resubmit revision for review
 * - For letters in REVISION_REQUESTED status
 * - Creates new workflow stages in letter_histories
 * - Updates status to SUBMITTED_TO_REVIEW
 */
export async function resubmitRevision(letterId: string, userId: string) {
  try {
    // 1. Try to use the optimized RPC first (Server-side transaction)
    console.log('Calling RPC resubmit_revision with:', { letterId, userId });
    const { data, error } = await supabase.rpc('resubmit_revision', {
      p_letter_id: letterId, 
      p_user_id: userId
    });

    console.log('RPC Response:', { data, error });

    if (error) {
      console.error('RPC Network/System Error:', error);
      throw error;
    }

    // Check application level error from RPC (V3)
    if (data && data.success === false) {
      console.error('RPC Application Error Data:', JSON.stringify(data));
      throw new Error(data.error || 'Unknown RPC error');
    }

    return { id: letterId, status: 'SUBMITTED_TO_REVIEW' };

  } catch (rpcError: any) {
    console.warn('RPC failed, falling back to client-side resubmit (slower):', rpcError);

    // --- FALLBACK: CLIENT-SIDE LOGIC ---
    // 1. Get current letter status
    const letter = await getLetter(letterId);
    if (letter.status !== 'REVISION_REQUESTED') {
      throw new Error('Only letters in revision can be resubmitted for review');
    }

    // 2. Get workflow stages from document_workflow_stages
    const { data: stages } = await supabase
      .from('document_workflow_stages')
      .select('*')
      .eq('document_type_id', letter.document_type_id)
      .eq('is_active', true)
      .eq('stage_type', 'REVIEW')
      .order('sequence', { ascending: true });

    if (!stages || stages.length === 0) {
      throw new Error('No workflow stages found for this document type');
    }

    // 3. Delete old pending review entries (to_status is null)
    await supabase
      .from('letter_histories')
      .delete()
      .eq('letter_id', letterId)
      .eq('stage_type', 'REVIEW')
      .is('to_status', null);

    // 4. Create history entries for each reviewer
    for (const stage of stages) {
      const assignees = stage.assignees || [];
      for (const assignee of assignees) {
        await insertLetterHistory({
          letter_id: letterId,
          action_by_id: userId, // submitted by
          assigned_to_id: assignee.user_id,
          action_type: 'SUBMITTED',
          from_status: 'REVISION_REQUESTED',
          to_status: null, // Pending action - no status yet
          stage_type: 'REVIEW',
          sequence: stage.sequence,
          notes: `Resubmitted for review - Stage: ${stage.stage_name}`
        });
      }
    }

    // 5. Update letter status
    const updatedLetter = await updateLetter(letterId, {
      status: 'SUBMITTED_TO_REVIEW',
    });

    // 6. Create history for status change
    await insertLetterHistory({
      letter_id: letterId,
      action_by_id: userId,
      action_type: 'SUBMITTED',
      from_status: 'REVISION_REQUESTED',
      to_status: 'SUBMITTED_TO_REVIEW',
      notes: 'Resubmitted for review after revision'
    });

    return updatedLetter;
  }
}

/**
 * Reviewer reviews a letter
 * - Can APPROVE or REQUEST_REVISION
 * - If all reviewers approve, move to REVIEWED status
 */
export async function reviewLetter(
  letterId: string, 
  userId: string, 
  action: 'APPROVE' | 'REQUEST_REVISION',
  notes?: string
) {
  try {
    // 1. Try Optimized RPC (Server-side transaction)
    console.log('Calling RPC review_letter:', { letterId, userId, action });
    const { data, error } = await supabase.rpc('review_letter', {
      p_letter_id: letterId,
      p_user_id: userId,
      p_action: action,
      p_notes: notes || null
    });

    if (error) {
      console.warn('RPC review_letter failed, falling back to client logic:', error);
      throw error;
    }

    if (data && data.success === false) {
      throw new Error(data.error || 'Review failed');
    }

    return getLetter(letterId);

  } catch (rpcError) {
    console.log('Using client-side fallback for reviewLetter...');

    // --- FALLBACK: SIMPLIFIED CLIENT-SIDE LOGIC ---
    // Prevent duplicate reviews by checking existing action
    const { data: existingReview } = await supabase
      .from('letter_histories')
      .select('id, to_status')
      .eq('letter_id', letterId)
      .eq('assigned_to_id', userId)
      .eq('stage_type', 'REVIEW')
      .not('to_status', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingReview && existingReview.length > 0) {
      console.log('User already reviewed this letter, skipping duplicate');
      return await getLetter(letterId);
    }

    // Get the pending review entry
    const { data: pendingReviews, error: selectError } = await supabase
      .from('letter_histories')
      .select('*')
      .eq('letter_id', letterId)
      .eq('assigned_to_id', userId)
      .eq('stage_type', 'REVIEW')
      .is('to_status', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (selectError) {
      console.error('Failed to get pending review:', selectError);
      throw selectError;
    }

    if (!pendingReviews || pendingReviews.length === 0) {
      throw new Error('You are not assigned to review this letter');
    }

    const reviewEntry = pendingReviews[0];
    const newStatus = action === 'REQUEST_REVISION' ? 'REVISION_REQUESTED' : 'APPROVED';
    const newActionType = action === 'REQUEST_REVISION' ? 'REVISION_REQUESTED' : 'APPROVED_REVIEW';

    // Update existing history entry instead of inserting new one
    const { error: updateHistoryError } = await supabase
      .from('letter_histories')
      .update({
        action_by_id: userId,
        action_type: newActionType,
        from_status: 'SUBMITTED_TO_REVIEW',
        to_status: newStatus,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewEntry.id);

    if (updateHistoryError) {
      console.error('Failed to update history:', updateHistoryError);
      throw updateHistoryError;
    }

    // Update letter status directly
    const { error: updateStatusError } = await supabase
      .from('outgoing_letters')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', letterId);

    if (updateStatusError) {
      console.error('Failed to update letter status:', updateStatusError);
      throw updateStatusError;
    }

    console.log('Fallback review completed successfully');
    return await getLetter(letterId);
  }
}

/**
 * Check if all reviewers have approved
 */
async function checkAllReviewersApproved(letterId: string): Promise<boolean> {
  // Get all review stage history entries for this letter
  const { data: histories } = await supabase
    .from('letter_histories')
    .select('*')
    .eq('letter_id', letterId)
    .eq('stage_type', 'REVIEW');

  if (!histories || histories.length === 0) return false;

  // Group by assigned_to_id to check each reviewer's latest action
  const reviewerStatus = new Map<string, string>();
  
  for (const history of histories) {
    if (history.assigned_to_id) {
      const current = reviewerStatus.get(history.assigned_to_id);
      // Keep the latest entry (by created_at)
      if (!current || new Date(history.created_at) > new Date(current)) {
        reviewerStatus.set(history.assigned_to_id, history.to_status);
      }
    }
  }

  // Check if all have approved
  for (const status of reviewerStatus.values()) {
    if (status !== 'APPROVED') {
      return false;
    }
  }

  return reviewerStatus.size > 0;
}

/**
 * Approver approves a letter
 * - Generates document number
 * - Updates status to APPROVED
 */
export async function approveLetter(letterId: string, userId: string) {
  const letter = await getLetter(letterId);
  
  if (letter.status !== 'REVIEWED') {
    throw new Error('Letter is not ready for approval');
  }

  // Find the approver's pending approval entry (to_status is null for pending)
  const { data: pendingApprovals } = await supabase
    .from('letter_histories')
    .select('*')
    .eq('letter_id', letterId)
    .eq('assigned_to_id', userId)
    .eq('stage_type', 'APPROVAL')
    .is('to_status', null)
    .order('created_at', { ascending: false });

  if (!pendingApprovals || pendingApprovals.length === 0) {
    throw new Error('You are not assigned to approve this letter');
  }

  const approvalEntry = pendingApprovals[0];

  // Generate document number
  const { data: docNumber } = await supabase
    .rpc('generate_test_document_number');

  // Update history entry
  await insertLetterHistory({
    letter_id: letterId,
    action_by_id: userId,
    action_type: 'APPROVED_FINAL',
    from_status: 'REVIEWED',
    to_status: 'APPROVED',
    stage_type: 'APPROVAL',
    sequence: approvalEntry.sequence,
    notes: `Letter approved. Document number: ${docNumber}`
  });

  // Update letter
  const updatedLetter = await updateLetter(letterId, {
    status: 'APPROVED',
    document_number: docNumber,
    approved_at: new Date().toISOString(),
  });

  return updatedLetter;
}

/**
 * Approver rejects a letter
 * - Permanent rejection
 * - Updates status to REJECTED
 */
export async function rejectLetter(letterId: string, userId: string, notes?: string) {
  const letter = await getLetter(letterId);
  
  if (letter.status !== 'REVIEWED') {
    throw new Error('Letter is not ready for rejection');
  }

  // Find the approver's pending approval entry (to_status is null for pending)
  const { data: pendingApprovals } = await supabase
    .from('letter_histories')
    .select('*')
    .eq('letter_id', letterId)
    .eq('assigned_to_id', userId)
    .eq('stage_type', 'APPROVAL')
    .is('to_status', null)
    .order('created_at', { ascending: false });

  if (!pendingApprovals || pendingApprovals.length === 0) {
    throw new Error('You are not assigned to approve this letter');
  }

  const approvalEntry = pendingApprovals[0];

  // Update history entry
  await insertLetterHistory({
    letter_id: letterId,
    action_by_id: userId,
    action_type: 'REJECTED',
    from_status: 'REVIEWED',
    to_status: 'REJECTED',
    stage_type: 'APPROVAL',
    sequence: approvalEntry.sequence,
    notes: notes || 'Letter rejected'
  });

  // Update letter
  const updatedLetter = await updateLetter(letterId, {
    status: 'REJECTED',
    rejected_at: new Date().toISOString(),
  });

  return updatedLetter;
}

/**
 * Creator revises and resubmits a letter
 * - Creates new history entries
 * - Returns to DRAFT status
 */
export async function reviseAndResubmit(letterId: string, userId: string) {
  const letter = await getLetter(letterId);
  
  if (letter.status !== 'REVISION_REQUESTED') {
    throw new Error('Letter is not in revision state');
  }

  // Update letter back to draft
  const updatedLetter = await updateLetter(letterId, {
    status: 'DRAFT',
  });

  // Create history
  await insertLetterHistory({
    letter_id: letterId,
    action_by_id: userId,
    action_type: 'REVISED',
    from_status: 'REVISION_REQUESTED',
    to_status: 'DRAFT',
    notes: 'Letter revised and returned to draft'
  });

  return updatedLetter;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Insert a history record
 */
async function insertLetterHistory(data: {
  letter_id: string;
  action_by_id: string;
  action_type: string;
  from_status?: string | null;
  to_status?: string | null;
  stage_type?: StageType;
  sequence?: number;
  assigned_to_id?: string;
  notes?: string;
}) {
  const insertData = {
    letter_id: data.letter_id,
    action_by_id: data.action_by_id,
    action_type: data.action_type,
    from_status: data.from_status || null,
    to_status: data.to_status || null,
    stage_type: data.stage_type || null,
    sequence: data.sequence || null,
    assigned_to_id: data.assigned_to_id || null,
    notes: data.notes || null,
    created_at: new Date().toISOString(),
  };

  console.log('Inserting letter history:', insertData);
  
  const { data: result, error } = await supabase.from('letter_histories').insert(insertData).select();

  if (error) {
    console.error('Error inserting letter history:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to insert letter history: ${error.message}`);
  }

  console.log('Letter history inserted successfully:', result);
  return result;
}

/**
 * Create approval stage entries
 */
async function createApprovalStageEntries(letterId: string, documentTypeId: number, userId: string) {
  console.log('[createApprovalStageEntries] Starting - letterId:', letterId, 'documentTypeId:', documentTypeId);
  
  const { data: stages, error: stageError } = await supabase
    .from('document_workflow_stages')
    .select('*')
    .eq('document_type_id', documentTypeId)
    .eq('stage_type', 'APPROVAL')
    .eq('is_active', true)
    .order('sequence', { ascending: true });

  console.log('[createApprovalStageEntries] Stages found:', stages?.length || 0);
  if (stageError) {
    console.error('[createApprovalStageEntries] Stage error:', stageError);
  }

  for (const stage of stages || []) {
    const assignees = stage.assignees || [];
    console.log('[createApprovalStageEntries] Processing stage:', stage.stage_name, 'assignees:', assignees.length);
    
    for (const assignee of assignees) {
      console.log('[createApprovalStageEntries] Inserting history for approver:', assignee.user_id);
      
      await insertLetterHistory({
        letter_id: letterId,
        action_by_id: userId,
        assigned_to_id: assignee.user_id,
        action_type: 'SUBMITTED',
        from_status: 'REVIEWED',
        to_status: null, // Pending action - no status yet
        stage_type: 'APPROVAL',
        sequence: stage.sequence,
        notes: `Submitted for approval - Stage: ${stage.stage_name}`
      });
    }
  }
  
  console.log('[createApprovalStageEntries] Completed successfully');
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Get letters pending review for a user
 * Uses letter_histories instead of letter_workflow_trackings
 */
export async function getPendingReviews(userId: string) {
  // Use view or query letter_histories directly
  // Pending items have to_status = null (reviewer hasn't acted yet)
  // AND letter status must be SUBMITTED_TO_REVIEW (exclude REVISION_REQUESTED, REJECTED, APPROVED, REVIEWED)
  const { data, error } = await supabase
    .from('letter_histories')
    .select(`
      *,
      letter:outgoing_letters!letter_id(
        *,
        document_type:document_types(*),
        created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
      ),
      action_by:users!letter_histories_action_by_id_fkey(id, nama, email)
    `)
    .eq('assigned_to_id', userId)
    .is('to_status', null)
    .eq('stage_type', 'REVIEW')
    .not('letter.status', 'in', '(REVISION_REQUESTED,REJECTED,APPROVED,REVIEWED)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Filter out items where letter data is incomplete (null subject)
  return data?.filter(item => 
    item.letter?.subject && 
    item.letter?.letter_date &&
    item.letter.id
  ) || [];
}

/**
 * Get letters pending approval for a user
 * Uses letter_histories instead of letter_workflow_trackings
 */
export async function getPendingApprovals(userId: string) {
  // Pending items have to_status = null (approver hasn't acted yet)
  const { data, error } = await supabase
    .from('letter_histories')
    .select(`
      *,
      letter:outgoing_letters!letter_id(
        *,
        document_type:document_types(*),
        created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
      ),
      action_by:users!letter_histories_action_by_id_fkey(id, nama, email)
    `)
    .eq('assigned_to_id', userId)
    .is('to_status', null)
    .eq('stage_type', 'APPROVAL')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get workflow stages for a document type
 */
export async function getWorkflowStages(documentTypeId: number) {
  const { data, error } = await supabase
    .from('document_workflow_stages')
    .select('*')
    .eq('document_type_id', documentTypeId)
    .eq('is_active', true)
    .order('sequence', { ascending: true });

  if (error) throw error;
  return data;
}