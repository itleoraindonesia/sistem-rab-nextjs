import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// Types
export interface Meeting {
  id: string
  title: string
  meeting_type: 'internal' | 'external'
  meeting_date: string
  location: string
  description: string
  participants: string[]
  status: 'draft' | 'published'
  meeting_number?: string
  created_by: string
  created_at: string
  updated_at: string
  users?: {
    nama: string
    email?: string
  }
}

export interface MeetingFilters {
  page?: number
  search?: string
  filterType?: string
}

export interface MeetingFormData {
  title: string
  meeting_type: 'internal' | 'external'
  meeting_date: string
  meeting_time: string
  location: string
  description: string
  participants: string[]
}

const ITEMS_PER_PAGE = 10

// Query Keys
export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (filters: MeetingFilters) => [...meetingKeys.lists(), filters] as const,
  details: () => [...meetingKeys.all, 'detail'] as const,
  detail: (id: string | null) => [...meetingKeys.details(), id] as const,
  numberPreview: () => [...meetingKeys.all, 'number-preview'] as const,
}

// Hook: Fetch meetings list
export function useMeetings(filters: MeetingFilters = {}) {
  const { page = 1, search = '', filterType = '' } = filters

  return useQuery({
    queryKey: meetingKeys.list(filters),
    queryFn: async ({ signal }) => {
      try {
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let query = supabase
          .from('mom_meetings')
          .select(`
            *,
            users!mom_meetings_created_by_fkey (
              nama
            )
          `, { count: 'exact' })

        if (filterType) query = query.eq('meeting_type', filterType)
        
        if (search && search.trim() !== '') {
          const term = search.trim()
          query = query.or(`title.ilike.%${term}%,meeting_number.ilike.%${term}%`)
        }

        const { data, error, count } = await query
          .order('meeting_date', { ascending: false })
          .range(from, to)
        
        if (error) {
          // Don't throw for abort errors - they're normal cancellations
          if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
            console.log('[useMeetings] Request cancelled (AbortError)')
            return { 
              data: [], 
              totalCount: 0,
              page,
              totalPages: 0
            }
          }
          throw error
        }
        
        return { 
          data: (data as Meeting[]) || [], 
          totalCount: count || 0,
          page,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        }
      } catch (err: any) {
        // Don't throw for abort errors - they're normal cancellations
        if (err?.message?.includes('AbortError') || err?.message?.includes('aborted')) {
          console.log('[useMeetings] Request cancelled (AbortError)')
          return { 
            data: [], 
            totalCount: 0,
            page,
            totalPages: 0
          }
        }
        throw err
      }
    },
    placeholderData: (previousData: any) => previousData,
  })
}

// Hook: Fetch single meeting
export function useMeeting(id: string | null) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: async () => {
      if (!id) return null
      
      try {
        const { data, error } = await supabase
          .from('mom_meetings')
          .select(`
            *,
            users!mom_meetings_created_by_fkey (
              nama,
              email
            )
          `)
          .eq('id', id)
          .single()
        
        if (error) {
          // Don't throw for abort errors - they're normal cancellations
          if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
            console.log('[useMeeting] Request cancelled (AbortError)')
            return null
          }
          throw error
        }
        
        return data as Meeting
      } catch (err: any) {
        // Don't throw for abort errors - they're normal cancellations
        if (err?.message?.includes('AbortError') || err?.message?.includes('aborted')) {
          console.log('[useMeeting] Request cancelled (AbortError)')
          return null
        }
        throw err
      }
    },
    placeholderData: (previousData: any) => previousData,
    enabled: !!id,
  })
}

// Hook: Fetch meeting number preview
export function useMeetingNumberPreview() {
  return useQuery({
    queryKey: meetingKeys.numberPreview(),
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_generated_meeting_number_preview')
        if (error) {
          // Don't throw for abort errors - they're normal cancellations
          if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
            console.log('[useMeetingNumberPreview] Request cancelled (AbortError)')
            return null
          }
          console.warn("Failed to fetch meeting number preview:", error)
          return null
        }
        return data as string
      } catch (err: any) {
        // Don't throw for abort errors - they're normal cancellations
        if (err?.message?.includes('AbortError') || err?.message?.includes('aborted')) {
          console.log('[useMeetingNumberPreview] Request cancelled (AbortError)')
          return null
        }
        console.warn("Failed to fetch meeting number preview:", err)
        return null
      }
    },
    // Use global defaults (30 min stale, 24 hours gc)
  })
}

// Hook: Create meeting
export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MeetingFormData) => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) throw new Error("User not authenticated")

      const { data: result, error } = await supabase
        .from("mom_meetings")
        .insert([{
          title: data.title,
          meeting_type: data.meeting_type,
          meeting_date: new Date(`${data.meeting_date}T${data.meeting_time}`).toISOString(),
          location: data.location,
          description: data.description,
          participants: data.participants,
          status: "draft",
          created_by: userId
        }])
        .select()
        .single()
      
      if (error) throw error
      return result as Meeting
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all })
    },
  })
}

// Hook: Update meeting
export function useUpdateMeeting(meetingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MeetingFormData) => {
      const isoDateTime = new Date(`${data.meeting_date}T${data.meeting_time}`).toISOString()

      const { data: result, error } = await supabase
        .from("mom_meetings")
        .update({
          title: data.title,
          meeting_type: data.meeting_type,
          meeting_date: isoDateTime,
          location: data.location,
          description: data.description,
          participants: data.participants,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId)
        .select()
        .single()
      
      if (error) throw error
      return result as Meeting
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all })
    },
  })
}

// Hook: Delete meeting
export function useDeleteMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (meetingId: string) => {
      const { error } = await supabase
        .from('mom_meetings')
        .delete()
        .eq('id', meetingId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all })
    },
  })
}

// Hook: Prefetch meeting (for hover effects)
export function usePrefetchMeeting() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: meetingKeys.detail(id),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('mom_meetings')
          .select(`
            *,
            users!mom_meetings_created_by_fkey (
              nama,
              email
            )
          `)
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data as Meeting
      },
      // Use global defaults (30 min stale, 24 hours gc)
    })
  }
}
