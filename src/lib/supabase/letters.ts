/**
 * Letter Service - Supabase Operations
 * 
 * Handles all database operations for outgoing letters workflow
 * including CRUD and workflow state transitions
 */

import { supabase } from '../supabaseClient';
import type { 
  OutgoingLetterInsert, 
  LetterHistoryInsert,
  LetterWorkflowTracking 
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
  await insertLetterHistory(letter.id, letter.created_by_id, 'CREATED', null, 'DRAFT', 'Letter created');
  
  return letter;
}

/**
 * Get a single letter with relations
 */
export async function getLetter(letterId: string) {
  const { data, error } = await supabase
    .from('outgoing_letters')
    .select(`
      *,
      document_type:document_types(*),
      company:instansi(*),
      created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email, jabatan),
      sender:users!outgoing_letters_sender_id_fkey(id, nama, email, jabatan),
      workflow_trackings:letter_workflow_trackings(
        *,
        assigned_to:users(id, nama, email)
      ),
      histories:letter_histories(
        *,
        action_by:users(id, nama, email)
      )
    `)
    .eq('id', letterId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get letters with optional filters
 */
export async function getLetters(filters?: {
  status?: string;
  document_type_id?: number;
  created_by_id?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('outgoing_letters')
    .select(`
      *,
      document_type:document_types(*),
      company:instansi(*),
      created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.document_type_id) {
    query = query.eq('document_type_id', filters.document_type_id);
  }
  if (filters?.created_by_id) {
    query = query.eq('created_by_id', filters.created_by_id);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
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
 * - Creates workflow trackings based on configs
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

    // 2. Get workflow configs
    const { data: configs } = await supabase
      .from('document_workflow_configs')
      .select('*')
      .eq('document_type_id', letter.document_type_id)
      .eq('is_active', true)
      .order('sequence', { ascending: true });

    if (!configs || configs.length === 0) {
      throw new Error('No workflow configuration found for this document type');
    }

    // 3. Create trackings for REVIEW stage (sequence 1)
    const reviewConfigs = configs.filter(c => c.stage_type === 'REVIEW');
    if (reviewConfigs.length === 0) {
      throw new Error('No reviewers configured for this document type');
    }

    // Execute in parallel for speed
    await Promise.all(reviewConfigs.map(config => 
      supabase.from('letter_workflow_trackings').insert({
        letter_id: letterId,
        assigned_to_id: config.user_id,
        stage_type: 'REVIEW',
        sequence: config.sequence,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      })
    ));

    // 4. Update letter status
    const updatedLetter = await updateLetter(letterId, {
      status: 'SUBMITTED_TO_REVIEW',
    });

    // 5. Create history
    await insertLetterHistory(
      letterId, 
      userId, 
      'SUBMITTED', 
      'DRAFT', 
      'SUBMITTED_TO_REVIEW', 
      'Submitted for review'
    );

    return updatedLetter;
  }
}

/**
 * Reviewer reviews a letter
 * - Can APPROVE or REQUEST_REVISION
 * - If all reviewers approve, move to APPROVED status
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
      throw error; // Jump to catch block for fallback
    }

    if (data && data.success === false) {
      throw new Error(data.error || 'Review failed');
    }

    // Success! Return updated letter
    return getLetter(letterId);

  } catch (rpcError) {
    console.log('Using client-side fallback for reviewLetter...');
    
    // --- FALLBACK: ORIGINAL CLIENT-SIDE LOGIC ---
    const letter = await getLetter(letterId);
    
    if (letter.status !== 'SUBMITTED_TO_REVIEW') {
      throw new Error('Letter is not in review stage');
    }

    // Find the user's tracking
    const { data: tracking } = await supabase
      .from('letter_workflow_trackings')
      .select('*')
      .eq('letter_id', letterId)
      .eq('assigned_to_id', userId)
      .eq('stage_type', 'REVIEW')
      .single();

    if (!tracking) {
      throw new Error('You are not assigned to review this letter');
    }

    // Update tracking
    const trackingStatus = action === 'APPROVE' ? 'APPROVED' : 'REQUESTED_REVISION';
    
    await supabase
      .from('letter_workflow_trackings')
      .update({
        status: trackingStatus,
        notes: notes || null,
        action_at: new Date().toISOString(),
      })
      .eq('id', tracking.id);

    // Handle workflow logic
    if (action === 'REQUEST_REVISION') {
      // Move to NEEDS_REVISION
      const updatedLetter = await updateLetter(letterId, {
        status: 'NEEDS_REVISION',
      });

      await insertLetterHistory(
        letterId,
        userId,
        'REVISION_REQUESTED',
        'SUBMITTED_TO_REVIEW',
        'NEEDS_REVISION',
        notes || 'Revision requested'
      );

      return updatedLetter;
    } else {
      // APPROVE action - check if ALL reviewers have approved
      const { data: allTrackings } = await supabase
        .from('letter_workflow_trackings')
        .select('*')
        .eq('letter_id', letterId)
        .eq('stage_type', 'REVIEW');

      const allApproved = allTrackings?.every(t => t.status === 'APPROVED');

      if (allApproved) {
        // ALL reviewers approved - move to REVIEWED status
        const updatedLetter = await updateLetter(letterId, {
          status: 'REVIEWED',
        });

        // Create approval stage trackings
        await createApprovalStageTrackings(letterId, letter.document_type_id);

        await insertLetterHistory(
          letterId,
          userId,
          'APPROVED_REVIEW',
          'SUBMITTED_TO_REVIEW',
          'REVIEWED',
          'All reviewers approved - document ready for approval stage'
        );

        return updatedLetter;
      } else {
        // Not all reviewers approved yet
        await insertLetterHistory(
          letterId,
          userId,
          'APPROVED_REVIEW',
          'SUBMITTED_TO_REVIEW',
          'SUBMITTED_TO_REVIEW',
          notes || 'Reviewer approved - waiting for other reviewers'
        );

        return letter;
      }
    }
  }
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

  // Find the approver's tracking
  const { data: tracking } = await supabase
    .from('letter_workflow_trackings')
    .select('*')
    .eq('letter_id', letterId)
    .eq('assigned_to_id', userId)
    .eq('stage_type', 'APPROVAL')
    .single();

  if (!tracking) {
    throw new Error('You are not assigned to approve this letter');
  }

  // Generate document number
  const { data: docNumber } = await supabase
    .rpc('generate_test_document_number');

  // Update tracking
  await supabase
    .from('letter_workflow_trackings')
    .update({
      status: 'APPROVED',
      action_at: new Date().toISOString(),
    })
    .eq('id', tracking.id);

  // Update letter
  const updatedLetter = await updateLetter(letterId, {
    status: 'APPROVED',
    document_number: docNumber,
    approved_at: new Date().toISOString(),
  });

  // Create history
  await insertLetterHistory(
    letterId,
    userId,
    'APPROVED_FINAL',
    'REVIEWED',
    'APPROVED',
    `Letter approved. Document number: ${docNumber}`
  );

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

  // Find the approver's tracking
  const { data: tracking } = await supabase
    .from('letter_workflow_trackings')
    .select('*')
    .eq('letter_id', letterId)
    .eq('assigned_to_id', userId)
    .eq('stage_type', 'APPROVAL')
    .single();

  if (!tracking) {
    throw new Error('You are not assigned to approve this letter');
  }

  // Update tracking
  await supabase
    .from('letter_workflow_trackings')
    .update({
      status: 'REJECTED',
      notes: notes || null,
      action_at: new Date().toISOString(),
    })
    .eq('id', tracking.id);

  // Update letter
  const updatedLetter = await updateLetter(letterId, {
    status: 'REJECTED',
    rejected_at: new Date().toISOString(),
  });

  // Create history
  await insertLetterHistory(
    letterId,
    userId,
    'REJECTED',
    'REVIEWED',
    'REJECTED',
    notes || 'Letter rejected'
  );

  return updatedLetter;
}

/**
 * Creator revises and resubmits a letter
 * - Resets workflow trackings
 * - Returns to DRAFT status
 */
export async function reviseAndResubmit(letterId: string, userId: string) {
  const letter = await getLetter(letterId);
  
  if (letter.status !== 'NEEDS_REVISION') {
    throw new Error('Letter is not in revision state');
  }

  // Delete existing workflow trackings
  await supabase
    .from('letter_workflow_trackings')
    .delete()
    .eq('letter_id', letterId);

  // Update letter back to draft
  const updatedLetter = await updateLetter(letterId, {
    status: 'DRAFT',
  });

  // Create history
  await insertLetterHistory(
    letterId,
    userId,
    'REVISED',
    'NEEDS_REVISION',
    'DRAFT',
    'Letter revised and returned to draft'
  );

  return updatedLetter;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Insert a history record
 */
async function insertLetterHistory(
  letterId: string,
  actionBy: string,
  actionType: string,
  fromStatus: string | null,
  toStatus: string | null,
  notes?: string
) {
  await supabase.from('letter_histories').insert({
    letter_id: letterId,
    action_by_id: actionBy,
    action_type: actionType,
    from_status: fromStatus,
    to_status: toStatus,
    notes: notes || null,
    created_at: new Date().toISOString(),
  });
}

/**
 * Create approval stage trackings
 */
async function createApprovalStageTrackings(letterId: string, documentTypeId: number) {
  console.log('[createApprovalStageTrackings] Starting - letterId:', letterId, 'documentTypeId:', documentTypeId);
  
  const { data: configs, error: configError } = await supabase
    .from('document_workflow_configs')
    .select('*')
    .eq('document_type_id', documentTypeId)
    .eq('stage_type', 'APPROVAL')
    .eq('is_active', true);

  console.log('[createApprovalStageTrackings] Configs found:', configs?.length || 0);
  if (configError) {
    console.error('[createApprovalStageTrackings] Config error:', configError);
  }

  for (const config of configs || []) {
    console.log('[createApprovalStageTrackings] Inserting tracking for user:', config.user_id);
    
    const { error: insertError } = await supabase.from('letter_workflow_trackings').insert({
      letter_id: letterId,
      assigned_to_id: config.user_id,
      stage_type: 'APPROVAL',
      sequence: config.sequence,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    });
    
    if (insertError) {
      console.error('[createApprovalStageTrackings] Insert error:', insertError);
      throw insertError;
    }
  }
  
  console.log('[createApprovalStageTrackings] Completed successfully');
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Get letters pending review for a user
 */
export async function getPendingReviews(userId: string) {
  const { data, error } = await supabase
    .from('letter_workflow_trackings')
    .select(`
      *,
      letter:outgoing_letters(
        *,
        document_type:document_types(*),
        created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
      )
    `)
    .eq('assigned_to_id', userId)
    .eq('status', 'PENDING')
    .eq('stage_type', 'REVIEW');

  if (error) throw error;
  return data;
}

/**
 * Get letters pending approval for a user
 */
export async function getPendingApprovals(userId: string) {
  const { data, error } = await supabase
    .from('letter_workflow_trackings')
    .select(`
      *,
      letter:outgoing_letters(
        *,
        document_type:document_types(*),
        created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email),
        workflow_trackings:letter_workflow_trackings(
          *,
          assigned_to:users(id, nama, email)
        )
      )
    `)
    .eq('assigned_to_id', userId)
    .eq('status', 'PENDING')
    .eq('stage_type', 'APPROVAL');

  if (error) throw error;
  return data;
}