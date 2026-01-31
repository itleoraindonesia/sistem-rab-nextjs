import React from 'react'
import { render, screen, waitFor } from '@/__tests__/utils/meeting-test-utils'
import userEvent from '@testing-library/user-event'
import EditMoMPage from '@/app/(protected)/meeting/mom/[id]/edit/page'
import { mockMeetingFromDB, mockAuthSession, mockUpdateMeetingResponse, mockSupabaseError, mockMeetingData } from '@/__tests__/mocks/mockMeetingData'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock Toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock window.open
global.open = jest.fn()

describe('EditMoMPage', () => {
  const { supabase } = require('@/lib/supabase/client')
  const user = userEvent.setup()
  const mockMeetingId = 'meeting-123'

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Critical Path - Rendering', () => {
    it('should render loading state initially', () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ data: mockMeetingFromDB, error: null }), 100))
        ),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      expect(screen.getByText(/memuat data meeting/i)).toBeInTheDocument()
    })

    it('should render page with data loaded', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })
    })

    it('should pre-fill form with existing data', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/judul meeting/i)
        expect(titleInput).toHaveValue('Rapat Koordinasi Proyek Q1')
      })
    })

    it('should display all form sections', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Informasi Meeting')).toBeInTheDocument()
        expect(screen.getByText('Peserta Meeting')).toBeInTheDocument()
        expect(screen.getByText('Deskripsi Meeting')).toBeInTheDocument()
        expect(screen.getByText('Lampiran File')).toBeInTheDocument()
      })
    })

    it('should show error if meeting not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockSupabaseError,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText(/gagal mengambil data meeting/i)).toBeInTheDocument()
      })
    })

    it('should show readonly meeting number', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        const meetingNumberInput = screen.getByLabelText(/meeting number/i)
        expect(meetingNumberInput).toBeDisabled()
        expect(meetingNumberInput).toHaveValue('001/MOM/II/2025')
      })
    })
  })

  describe('Critical Path - Form Validation', () => {
    it('should show validation error for empty title', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.clear(titleInput)

      const submitButton = screen.getByRole('button', { name: /simpan perubahan/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/judul wajib diisi/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for empty location', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const locationInput = screen.getByLabelText(/lokasi/i)
      await user.clear(locationInput)

      const submitButton = screen.getByRole('button', { name: /simpan perubahan/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/lokasi wajib diisi/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for empty participants', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /simpan perubahan/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/minimal 1 peserta/i)).toBeInTheDocument()
      })
    })
  })

  describe('Critical Path - Form Submission', () => {
    it('should update meeting successfully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Meeting Title')

      const submitButton = screen.getByRole('button', { name: /simpan perubahan/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockQuery.update).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Updated Meeting Title',
          })
        )
      })
    })

    it('should disable submit button during submission', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockEq = jest.fn().mockResolvedValue(mockUpdateMeetingResponse)
      mockQuery.update.mockReturnValue({ eq: mockEq })

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Meeting Title')

      const submitButton = screen.getByRole('button', { name: /simpan perubahan/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
    })

    it('should handle submission error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockEq = jest.fn().mockRejectedValue(mockSupabaseError)
      mockQuery.update.mockReturnValue({ eq: mockEq })

      const { toast } = require('@/components/ui/use-toast')

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Meeting Title')

      const submitButton = screen.getByRole('button', { name: /simpan perubahan/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('User Interactions', () => {
    it('should allow user to modify title field', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Meeting Title')

      expect(titleInput).toHaveValue('Updated Meeting Title')
    })

    it('should allow user to change meeting type', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const typeSelect = screen.getByLabelText(/tipe meeting/i)
      await user.selectOptions(typeSelect, 'external')

      expect(typeSelect).toHaveValue('external')
    })

    it('should allow user to update date and time', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText(/tanggal meeting/i)
      await user.clear(dateInput)
      await user.type(dateInput, '2025-03-15')

      const timeInput = screen.getByLabelText(/waktu meeting/i)
      await user.clear(timeInput)
      await user.type(timeInput, '14:00')

      expect(dateInput).toHaveValue('2025-03-15')
      expect(timeInput).toHaveValue('14:00')
    })

    it('should allow user to update location', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const locationInput = screen.getByLabelText(/lokasi/i)
      await user.clear(locationInput)
      await user.type(locationInput, 'Updated Location')

      expect(locationInput).toHaveValue('Updated Location')
    })

    it('should allow user to update description', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const descriptionInput = screen.getByLabelText(/deskripsi/i)
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated description')

      expect(descriptionInput).toHaveValue('Updated description')
    })

    it('should open Google Meet link when clicked', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const linkButton = screen.getByRole('link', { name: /buat link meeting/i })
      await user.click(linkButton)

      expect(global.open).toHaveBeenCalledWith(
        'https://meet.google.com/landing',
        '_blank'
      )
    })
  })

  describe('Navigation', () => {
    it('should navigate back when back button clicked', async () => {
      const mockBack = jest.fn()
      const { useRouter } = require('next/navigation')
      useRouter.mockReturnValue({ back: mockBack, push: jest.fn() })

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: '' })
      await user.click(backButton)

      expect(mockBack).toHaveBeenCalled()
    })

    it('should navigate to /meeting/mom after successful update', async () => {
      const mockPush = jest.fn()
      const { useRouter } = require('next/navigation')
      useRouter.mockReturnValue({ back: jest.fn(), push: mockPush })

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMeetingFromDB,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockEq = jest.fn().mockResolvedValue(mockUpdateMeetingResponse)
      mockQuery.update.mockReturnValue({ eq: mockEq })

      render(<EditMoMPage params={Promise.resolve({ id: mockMeetingId })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Minutes of Meeting')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Meeting Title')

      const submitButton = screen.getByRole('button', { name: /simpan perubahan/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/meeting/mom')
      })
    })
  })
})
