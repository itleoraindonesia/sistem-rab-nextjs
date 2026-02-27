/**
 * Letter Service - Supabase Operations (Simplified)
 * 
 * All workflow operations use RPC functions for atomicity
 * CRUD operations use standard Supabase queries
 */

import { supabase } from '../supabase/client';
import type { TablesInsert } from '@/types/database';
import type { StageType } from '@/types/workflow';

// ============================================
// CRUD OPERATIONS
// ============================================

export async function createLetter(data: TablesInsert<'outgoing_letters'>) {
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

  if (error) throw new Error(`Create letter failed: ${error.message}`);
  return letter;
}

export async function getLetter(letterId: string) {
  if (!letterId) throw new Error('Letter ID is required');

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(letterId)) {
    throw new Error(`Invalid letter ID format`);
  }

  const { data, error } = await supabase
    .from('outgoing_letters')
    .select(`
      *,
      document_type:document_types(*),
      company:instansi(*),
      created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email, jabatan),
      sender:users!outgoing_letters_sender_id_fkey(id, nama, email, jabatan)
    `)
    .eq('id', letterId)
    .single();

  if (error) {
    console.error('[getLetter] Error:', error);
    throw new Error(error.message || 'Failed to fetch letter');
  }

  if (!data) throw new Error('Letter not found');

  // Fetch histories separately to avoid join issues
  const { data: histories, error: historiesError } = await supabase
    .from('letter_histories')
    .select(`
      *,
      action_by:users!letter_histories_action_by_id_fkey(id, nama, email),
      assigned_to_user:users!letter_histories_assigned_to_id_fkey(id, nama, email)
    `)
    .eq('letter_id', letterId)
    .order('created_at', { ascending: false });

  if (historiesError) {
    console.warn('[getLetter] Failed to fetch histories:', historiesError);
  }

  return { ...data, histories: histories || [] };
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

export async function getLetters(filters?: GetLettersFilters) {
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
      document_type:document_types(id, name, code),
      company:instansi(id, nama),
      created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
    `, { count: 'exact' });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.document_type_id) query = query.eq('document_type_id', filters.document_type_id);
  if (filters?.created_by_id) query = query.eq('created_by_id', filters.created_by_id);
  if (filters?.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(`document_number.ilike.%${term}%,subject.ilike.%${term}%,recipient_company.ilike.%${term}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`Get letters failed: ${error.message}`);

  return {
    data: (data as LetterWithRelations[]) || [],
    totalCount: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function updateLetter(letterId: string, updates: Partial<TablesInsert<'outgoing_letters'>>) {
  const { data, error } = await supabase
    .from('outgoing_letters')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', letterId)
    .select()
    .single();

  if (error) throw new Error(`Update letter failed: ${error.message}`);
  return data;
}

export async function deleteLetter(letterId: string) {
  const { data: letter } = await supabase
    .from('outgoing_letters')
    .select('status')
    .eq('id', letterId)
    .single();

  if (letter?.status !== 'DRAFT') {
    throw new Error(`Can only delete draft letters. Current status: ${letter?.status}`);
  }

  const { error } = await supabase.from('outgoing_letters').delete().eq('id', letterId);
  if (error) throw new Error(`Delete letter failed: ${error.message}`);
}

// ============================================
// WORKFLOW OPERATIONS (RPC ONLY)
// ============================================

export async function submitForReview(letterId: string, userId: string) {
  console.log('[submitForReview] RPC call:', { letterId, userId });

  if (!letterId || !userId) {
    throw new Error('Letter ID and User ID are required');
  }

  // Cek apakah document_workflow_stages sudah dikonfigurasi untuk letter ini
  const { data: letter } = await supabase
    .from('outgoing_letters')
    .select('document_type_id, status')
    .eq('id', letterId)
    .single();

  if (letter?.status !== 'DRAFT') {
    throw new Error(`Hanya surat berstatus DRAFT yang bisa disubmit. Status saat ini: ${letter?.status}`);
  }

  if (letter?.document_type_id) {
    const { data: stages } = await supabase
      .from('document_workflow_stages')
      .select('id')
      .eq('document_type_id', letter.document_type_id)
      .eq('is_active', true)
      .eq('stage_type', 'REVIEW')
      .limit(1);

    if (!stages || stages.length === 0) {
      throw new Error(
        'Workflow reviewer belum dikonfigurasi untuk jenis dokumen ini. ' +
        'Hubungi admin untuk mengatur konfigurasi workflow.'
      );
    }
  }

  const { data, error } = await supabase.rpc('submit_letter_for_review', {
    p_letter_id: letterId,
    p_user_id: userId
  });

  if (error) {
    console.error('[submitForReview] RPC error:', error);
    throw new Error(`Submit gagal: ${error.message}`);
  }

  if (data?.success === false) {
    throw new Error(data.error || 'Submit gagal');
  }

  console.log('[submitForReview] Success:', data);
  return { id: letterId, status: 'SUBMITTED_TO_REVIEW' };
}

export async function resubmitRevision(letterId: string, userId: string) {
  console.log('[resubmitRevision] RPC call:', { letterId, userId });

  if (!letterId || !userId) {
    throw new Error('Letter ID and User ID are required');
  }

  const { data, error } = await supabase.rpc('resubmit_revision', {
    p_letter_id: letterId,
    p_user_id: userId
  });

  if (error) {
    console.error('[resubmitRevision] RPC error:', error);
    throw new Error(`Resubmit gagal: ${error.message}`);
  }

  if (data?.success === false) {
    throw new Error(data.error || 'Resubmit gagal - pastikan status surat adalah REVISION_REQUESTED');
  }

  return { id: letterId, status: 'SUBMITTED_TO_REVIEW' };
}

export async function reviewLetter(
  letterId: string,
  userId: string,
  action: 'APPROVE' | 'REQUEST_REVISION',
  notes?: string
) {
  console.log('[reviewLetter] RPC call:', { letterId, userId, action });

  if (!letterId || !userId) {
    throw new Error('Letter ID dan User ID wajib diisi');
  }

  if (action === 'REQUEST_REVISION' && !notes?.trim()) {
    throw new Error('Catatan wajib diisi untuk permintaan revisi');
  }

  const { data, error } = await supabase.rpc('review_letter', {
    p_action: action,
    p_letter_id: letterId,
    p_user_id: userId,
    p_notes: notes?.trim() || null
  });

  if (error) {
    console.error('[reviewLetter] RPC error:', error);
    throw new Error(`Review gagal: ${error.message}`);
  }

  if (data?.success === false) {
    console.error('[reviewLetter] RPC returned failure:', data);
    throw new Error(data.error || 'Review gagal');
  }

  console.log('[reviewLetter] Success:', data);
  return getLetter(letterId);
}

export async function approveLetter(letterId: string, userId: string, notes?: string) {
  console.log('[approveLetter] RPC call:', { letterId, userId });

  const { data, error } = await supabase.rpc('review_letter', {
    p_action: 'APPROVED_FINAL',
    p_letter_id: letterId,
    p_user_id: userId,
    p_notes: notes || null
  });

  if (error) {
    console.error('[approveLetter] RPC error:', error);
    throw new Error(`Approval failed: ${error.message}`);
  }

  if (data?.success === false) {
    throw new Error(data.error || 'Approval failed');
  }

  return getLetter(letterId);
}

export async function rejectLetter(letterId: string, userId: string, notes?: string) {
  console.log('[rejectLetter] RPC call:', { letterId, userId });

  const { data, error } = await supabase.rpc('review_letter', {
    p_action: 'REJECT',
    p_letter_id: letterId,
    p_user_id: userId,
    p_notes: notes || null
  });

  if (error) {
    console.error('[rejectLetter] RPC error:', error);
    throw new Error(`Reject failed: ${error.message}`);
  }

  if (data?.success === false) {
    throw new Error(data.error || 'Reject failed');
  }

  return getLetter(letterId);
}

// ============================================
// QUERY HELPERS
// ============================================

export async function getPendingReviews(userId: string) {
  // Note: Supabase client tidak mendukung filter nested relation (.not('letter.status', ...)),
  // sehingga filter status dilakukan di aplikasi setelah fetch.
  const { data, error } = await supabase
    .from('letter_histories')
    .select(`
      *,
      letter:outgoing_letters!letter_id(
        *,
        document_type:document_types(id, name, code),
        created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
      )
    `)
    .eq('assigned_to_id', userId)
    .is('to_status', null)
    .eq('stage_type', 'REVIEW')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPendingReviews] Error:', error);
    throw new Error(`Failed to fetch pending reviews: ${error.message}`);
  }

  // Filter di aplikasi: hanya surat yang masih SUBMITTED_TO_REVIEW
  const INVALID_STATUSES = ['REVISION_REQUESTED', 'REJECTED', 'APPROVED', 'REVIEWED'];
  return data?.filter(item =>
    item.letter?.subject &&
    item.letter?.letter_date &&
    !INVALID_STATUSES.includes(item.letter?.status)
  ) || [];
}

export async function getPendingApprovals(userId: string) {
  const { data, error } = await supabase
    .from('letter_histories')
    .select(`
      *,
      letter:outgoing_letters!letter_id(
        *,
        document_type:document_types(id, name, code),
        created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
      )
    `)
    .eq('assigned_to_id', userId)
    .is('to_status', null)
    .eq('stage_type', 'APPROVAL')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPendingApprovals] Error:', error);
    throw new Error(`Failed to fetch pending approvals: ${error.message}`);
  }

  // Filter di aplikasi: hanya surat yang masih REVIEWED (menunggu approval)
  return data?.filter(item =>
    item.letter?.status === 'REVIEWED'
  ) || [];
}

export async function getWorkflowStages(documentTypeId: number) {
  const { data, error } = await supabase
    .from('document_workflow_stages')
    .select('*')
    .eq('document_type_id', documentTypeId)
    .eq('is_active', true)
    .order('sequence', { ascending: true });

  if (error) throw new Error(`Failed to fetch workflow stages: ${error.message}`);
  return data;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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
  const { error } = await supabase.from('letter_histories').insert({
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
  });

  if (error) throw new Error(`Insert history failed: ${error.message}`);
}
