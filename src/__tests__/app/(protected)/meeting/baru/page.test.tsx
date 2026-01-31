import React from 'react'
import { render, screen, waitFor } from '@/__tests__/utils/meeting-test-utils'
import userEvent from '@testing-library/user-event'
import CreateMeetingPage from '@/app/(protected)/meeting/baru/page'
import { mockMeetingData, mockAuthSession, mockCreateMeetingResponse, mockSupabaseError } from '@/__tests__/mocks/mockMeetingData'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
    })),
    rpc: jest.fn(),
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

describe('CreateMeetingPage', () => {
  const { supabase } = require('@/lib/supabase/client')
  const user = userEvent.setup()

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
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(<CreateMeetingPage />)

      expect(screen.getByText(/memeriksa autentikasi/i)).toBeInTheDocument()
    })

    it('should render page with auth check complete', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })
    })

    it('should display all form sections', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Informasi Meeting')).toBeInTheDocument()
        expect(screen.getByText('Peserta')).toBeInTheDocument()
        expect(screen.getByText('Deskripsi / Agenda')).toBeInTheDocument()
      })
    })

    it('should show loading spinner during auth check', async () => {
      (supabase.auth.getSession as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<CreateMeetingPage />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Critical Path - Form Validation', () => {
    it('should show validation error for empty title', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /buat jadwal meeting/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/judul wajib diisi/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for empty location', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.type(titleInput, 'Test Meeting')

      const submitButton = screen.getByRole('button', { name: /buat jadwal meeting/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/lokasi wajib diisi/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for empty participants', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.type(titleInput, 'Test Meeting')

      const locationInput = screen.getByLabelText(/lokasi/i)
      await user.type(locationInput, 'Ruang Meeting A')

      const dateInput = screen.getByLabelText(/tanggal/i)
      await user.type(dateInput, '2025-02-15')

      const timeInput = screen.getByLabelText(/waktu/i)
      await user.type(timeInput, '10:00')

      const submitButton = screen.getByRole('button', { name: /buat jadwal meeting/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/minimal 1 peserta/i)).toBeInTheDocument()
      })
    })
  })

  describe('Critical Path - Form Submission', () => {
    it('should create meeting successfully', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      const mockInsert = jest.fn().mockResolvedValue(mockCreateMeetingResponse)
      ;(supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.type(titleInput, 'Rapat Koordinasi Proyek Q1')

      const locationInput = screen.getByLabelText(/lokasi/i)
      await user.type(locationInput, 'Ruang Meeting A')

      const dateInput = screen.getByLabelText(/tanggal/i)
      await user.type(dateInput, '2025-02-15')

      const timeInput = screen.getByLabelText(/waktu/i)
      await user.type(timeInput, '10:00')

      const descriptionInput = screen.getByLabelText(/deskripsi/i)
      await user.type(descriptionInput, 'Koordinasi progress proyek')

      const submitButton = screen.getByRole('button', { name: /buat jadwal meeting/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: 'Rapat Koordinasi Proyek Q1',
              location: 'Ruang Meeting A',
            }),
          ])
        )
      })
    })

    it('should disable submit button during submission', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      const mockInsert = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCreateMeetingResponse), 100))
      )
      ;(supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.type(titleInput, 'Test Meeting')

      const submitButton = screen.getByRole('button', { name: /buat jadwal meeting/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
    })

    it('should handle submission error', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      const mockInsert = jest.fn().mockRejectedValue(mockSupabaseError)
      ;(supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert })

      const { toast } = require('@/components/ui/use-toast')

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.type(titleInput, 'Test Meeting')

      const submitButton = screen.getByRole('button', { name: /buat jadwal meeting/i })
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
    it('should allow user to type in title field', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.type(titleInput, 'Rapat Koordinasi Proyek Q1')

      expect(titleInput).toHaveValue('Rapat Koordinasi Proyek Q1')
    })

    it('should allow user to select meeting type', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const typeSelect = screen.getByLabelText(/tipe meeting/i)
      await user.selectOptions(typeSelect, 'external')

      expect(typeSelect).toHaveValue('external')
    })

    it('should allow user to pick date and time', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText(/tanggal/i)
      await user.type(dateInput, '2025-02-15')

      const timeInput = screen.getByLabelText(/waktu/i)
      await user.type(timeInput, '10:00')

      expect(dateInput).toHaveValue('2025-02-15')
      expect(timeInput).toHaveValue('10:00')
    })

    it('should allow user to type in description', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const descriptionInput = screen.getByLabelText(/deskripsi/i)
      await user.type(descriptionInput, 'Koordinasi progress proyek')

      expect(descriptionInput).toHaveValue('Koordinasi progress proyek')
    })

    it('should open Google Meet link when clicked', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const linkButton = screen.getByRole('button', { name: /buat link meeting/i })
      await user.click(linkButton)

      expect(global.open).toHaveBeenCalledWith(
        'https://meet.google.com/landing',
        '_blank'
      )
    })

    it('should display meeting number preview', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: '001/MOM/II/2025',
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const meetingNumberInput = screen.getByLabelText(/meeting number/i)

      expect(meetingNumberInput).toBeDisabled()
    })

    it('should allow user to select meeting type', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const typeSelect = screen.getByLabelText(/tipe meeting/i)
      await user.selectOptions(typeSelect, 'external')

      expect(typeSelect).toHaveValue('external')
    })

    it('should allow user to pick date and time', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const dateInput = screen.getByLabelText(/tanggal/i)
      await user.type(dateInput, '2025-02-15')

      const timeInput = screen.getByLabelText(/waktu/i)
      await user.type(timeInput, '10:00')

      expect(dateInput).toHaveValue('2025-02-15')
      expect(timeInput).toHaveValue('10:00')
    })

    it('should allow user to type in description', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const descriptionInput = screen.getByLabelText(/deskripsi/i)
      await user.type(descriptionInput, 'Koordinasi progress proyek')

      expect(descriptionInput).toHaveValue('Koordinasi progress proyek')
    })

    it('should open Google Meet link when clicked', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const linkButton = screen.getByRole('link', { name: /buat link meeting/i })
      await user.click(linkButton)

      expect(global.open).toHaveBeenCalledWith(
        'https://meet.google.com/landing',
        '_blank'
      )
    })

    it('should display meeting number preview', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: '001/MOM/II/2025',
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const meetingNumberInput = screen.getByLabelText(/meeting number/i)

      expect(meetingNumberInput).toBeDisabled()
    })
  })

  describe('Navigation', () => {
    it('should navigate back when back button clicked', async () => {
      const mockBack = jest.fn()
      const { useRouter } = require('next/navigation')
      useRouter.mockReturnValue({ back: mockBack, push: jest.fn() })

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: '' })
      await user.click(backButton)

      expect(mockBack).toHaveBeenCalled()
    })

    it('should navigate to /meeting/mom after successful creation', async () => {
      const mockPush = jest.fn()
      const { useRouter } = require('next/navigation')
      useRouter.mockReturnValue({ back: jest.fn(), push: mockPush })

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockAuthSession },
        error: null,
      })

      const mockInsert = jest.fn().mockResolvedValue(mockCreateMeetingResponse)
      ;(supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert })

      render(<CreateMeetingPage />)

      await waitFor(() => {
        expect(screen.getByText('Buat Meeting Baru')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/judul meeting/i)
      await user.type(titleInput, 'Test Meeting')

      const submitButton = screen.getByRole('button', { name: /buat jadwal meeting/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/meeting/mom')
      })
    })
  })
})
