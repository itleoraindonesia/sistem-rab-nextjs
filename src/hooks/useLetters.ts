/**
 * Letters Custom Hooks
 * 
 * React Query hooks for fetching and managing letter data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from './useUser';
import * as letterService from '@/lib/supabase/letters';
import { supabase } from '@/lib/supabase/client';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get letters list with optional filters
 */
export function useLetters(filters?: {
  status?: string;
  document_type_id?: number;
  created_by_id?: string;
  limit?: number;
  offset?: number;
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['letters', filters],
    queryFn: () => letterService.getLetters(filters),
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

/**
 * Get single letter with relations
 */
export function useLetter(letterId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['letter', letterId],
    queryFn: () => letterService.getLetter(letterId),
    enabled: enabled && !!letterId,
  });
}

/**
 * Get letters pending review for current user
 */
export function usePendingReviews(userId?: string) {
  return useQuery({
    queryKey: ['pending-reviews', userId],
    queryFn: () => letterService.getPendingReviews(userId || ''),
    enabled: !!userId,
  });
}

/**
 * Get letters pending approval for current user
 */
export function usePendingApprovals(userId?: string) {
  return useQuery({
    queryKey: ['pending-approvals', userId],
    queryFn: async () => {
      console.log('[usePendingApprovals] Fetching for userId:', userId);
      const result = await letterService.getPendingApprovals(userId || '');
      console.log('[usePendingApprovals] Result:', result);
      return result;
    },
    enabled: !!userId,
  });
}

/**
 * Get document types (for dropdown)
 */
export function useDocumentTypes() {
  return useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      const { data } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return data;
    },
  });
}

/**
 * Get instansi list (for dropdown)
 */
export function useInstansiList() {
  return useQuery({
    queryKey: ['instansi-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('instansi')
        .select('*')
        .order('nama');
      return data;
    },
  });
}

/**
 * Get users list (for sender selection)
 */
export function useUsersList() {
  return useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('id, nama, email, jabatan, departemen')
        .eq('is_active', true)
        .order('nama');
      return data;
    },
  });
}

/**
 * Create document type mutation
 */
export function useCreateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
      description?: string;
      category?: string;
    }) => {
      const { data: newDocType, error } = await supabase
        .from('document_types')
        .insert({
          ...data,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return newDocType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-types'] });
      queryClient.invalidateQueries({ queryKey: ['document-types-with-workflow'] });
    },
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create letter mutation
 */
export function useCreateLetter() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: (data: Omit<Parameters<typeof letterService.createLetter>[0], 'created_by_id'>) => {
      if (!user?.id) throw new Error('User info not loaded. Please try again.');
      
      return letterService.createLetter({
        ...data,
        created_by_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

/**
 * Update letter mutation
 */
export function useUpdateLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ letterId, updates }: { letterId: string; updates: Parameters<typeof letterService.updateLetter>[1] }) =>
      letterService.updateLetter(letterId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['letter', variables.letterId] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

/**
 * Delete letter mutation
 */
export function useDeleteLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (letterId: string) => letterService.deleteLetter(letterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

// ============================================
// WORKFLOW MUTATION HOOKS
// ============================================

/**
 * Submit for review mutation
 */
export function useSubmitForReview() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: (letterId: string) => {
      if (!user?.id) throw new Error('User info not loaded. Please try again.');
      return letterService.submitForReview(letterId, user.id);
    },
    onSuccess: (_, letterId) => {
      queryClient.invalidateQueries({ queryKey: ['letter', letterId] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
    },
  });
}

/**
 * Review letter mutation
 */
export function useReviewLetter() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: ({
      letterId,
      action,
      notes,
    }: {
      letterId: string;
      action: 'APPROVE' | 'REQUEST_REVISION';
      notes?: string;
    }) => letterService.reviewLetter(letterId, user?.id || '', action, notes),
    onSuccess: (_, variables) => {
      // Invalidate all related queries including userId
      queryClient.invalidateQueries({ queryKey: ['letter', variables.letterId] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals', user?.id] });
      // Also invalidate revision memos query
      queryClient.invalidateQueries({ 
        queryKey: ['letters', { status: 'REVISION_REQUESTED', created_by_id: user?.id }] 
      });
    },
    onError: (error: any) => {
      console.error('Review mutation failed:', error);
    },
  });
}

/**
 * Approve letter mutation
 */
export function useApproveLetter() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: (letterId: string) =>
      letterService.approveLetter(letterId, user?.id || ''),
    onSuccess: (_, letterId) => {
      queryClient.invalidateQueries({ queryKey: ['letter', letterId] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
  });
}

/**
 * Reject letter mutation
 */
export function useRejectLetter() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: ({
      letterId,
      notes,
    }: {
      letterId: string;
      notes?: string;
    }) => letterService.rejectLetter(letterId, user?.id || '', notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['letter', variables.letterId] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
  });
}

/**
 * Revise and resubmit mutation
 */
export function useReviseAndResubmit() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: (letterId: string) =>
      letterService.reviseAndResubmit(letterId, user?.id || ''),
    onSuccess: (_, letterId) => {
      queryClient.invalidateQueries({ queryKey: ['letter', letterId] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

/**
 * Resubmit revision mutation
 */
export function useResubmitRevision() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: (letterId: string) =>
      letterService.resubmitRevision(letterId, user?.id || ''),
    onSuccess: (_, letterId) => {
      queryClient.invalidateQueries({ queryKey: ['letter', letterId] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

// ============================================
// COMBINED HOOKS
// ============================================

/**
 * Get workflow info for a letter
 * Returns review/approval status for current user
 * Uses letter_histories instead of letter_workflow_trackings
 */
export function useLetterWorkflow(letterId: string, userId?: string) {
  const { data: letter } = useLetter(letterId);
  const { data: histories } = useQuery({
    queryKey: ['letter-workflow-histories', letterId],
    queryFn: async () => {
      const { data } = await supabase
        .from('letter_histories')
        .select('*, action_by:users(id, nama, email)')
        .eq('letter_id', letterId)
        .not('stage_type', 'is', null)
        .order('sequence', { ascending: true })
        .order('created_at', { ascending: false });
      return data;
    },
    enabled: !!letterId,
  });

  // Get the latest history entry for current user (if any)
  const myHistory = histories?.find(h => h.assigned_to_id === userId);
  
  // Check if user has a pending review/approval (to_status is null for pending items)
  const myPendingReview = histories?.find(
    h => h.assigned_to_id === userId && 
         h.stage_type === 'REVIEW' && 
         h.to_status === null
  );
  
  const myPendingApproval = histories?.find(
    h => h.assigned_to_id === userId && 
         h.stage_type === 'APPROVAL' && 
         h.to_status === null
  );

  return {
    letter,
    histories,
    myHistory,
    canReview: !!myPendingReview,
    canApprove: !!myPendingApproval,
    canRevise: letter?.status === 'REVISION_REQUESTED' && letter?.created_by_id === userId,
    canSubmit: letter?.status === 'DRAFT' && letter?.created_by_id === userId,
  };
}
