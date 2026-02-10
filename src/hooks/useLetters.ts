/**
 * Letters Custom Hooks
 * 
 * React Query hooks for fetching and managing letter data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from './useUser';
import * as letterService from '@/lib/supabase/letters';
import { supabase } from '@/lib/supabaseClient';

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
}) {
  return useQuery({
    queryKey: ['letters', filters],
    queryFn: () => letterService.getLetters(filters),
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
      queryClient.invalidateQueries({ queryKey: ['letter', variables.letterId] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
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

// ============================================
// COMBINED HOOKS
// ============================================

/**
 * Get workflow info for a letter
 * Returns review/approval status for current user
 */
export function useLetterWorkflow(letterId: string, userId?: string) {
  const { data: letter } = useLetter(letterId);
  const { data: trackings } = useQuery({
    queryKey: ['letter-workflow-trackings', letterId],
    queryFn: async () => {
      const { data } = await supabase
        .from('letter_workflow_trackings')
        .select('*, assigned_to:users(id, nama, email)')
        .eq('letter_id', letterId)
        .order('sequence', { ascending: true });
      return data;
    },
    enabled: !!letterId,
  });

  const myTracking = trackings?.find(t => t.assigned_to_id === userId);

  return {
    letter,
    trackings,
    myTracking,
    canReview: myTracking?.stage_type === 'REVIEW' && myTracking?.status === 'PENDING',
    canApprove: myTracking?.stage_type === 'APPROVAL' && myTracking?.status === 'PENDING',
    canRevise: letter?.status === 'NEEDS_REVISION' && letter?.created_by_id === userId,
    canSubmit: letter?.status === 'DRAFT' && letter?.created_by_id === userId,
  };
}