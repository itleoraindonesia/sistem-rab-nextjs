import React from 'react'
import { render, screen, waitFor } from '@/__tests__/utils/meeting-test-utils'
import userEvent from '@testing-library/user-event'
import MoMPage from '@/app/(protected)/meeting/mom/page'
import { mockMeetingList, mockEmptyMeetingsResponse, mockSupabaseError } from '@/__tests__/mocks/mockMeetingData'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('MoMPage', () => {
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
    it('should render page header correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByText('Minutes of Meeting (MoM)')).toBeInTheDocument()
      })
    })

    it('should show loading state initially', () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ data: mockMeetingList, error: null, count: 3 }), 100))
        ),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      expect(screen.getByText(/loading data/i)).toBeInTheDocument()
    })

    it('should display empty state when no meetings', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(mockEmptyMeetingsResponse),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByText(/belum ada meeting yang sesuai filter/i)).toBeInTheDocument()
      })
    })

    it('should show error state on fetch failure', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: null, error: mockSupabaseError, count: 0 }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByText(/error loading meetings/i)).toBeInTheDocument()
      })
    })

    it('should render desktop table view', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByText('No/Judul')).toBeInTheDocument()
        expect(screen.getByText('Waktu & Lokasi')).toBeInTheDocument()
        expect(screen.getByText('Tipe')).toBeInTheDocument()
        expect(screen.getByText('Peserta')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Pembuat')).toBeInTheDocument()
        expect(screen.getByText('Aksi')).toBeInTheDocument()
      })
    })

    it('should render meeting data in table', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByText('Rapat Koordinasi Proyek Q1')).toBeInTheDocument()
        expect(screen.getByText('Meeting dengan Klien PT ABC')).toBeInTheDocument()
        expect(screen.getByText('Review Mingguan Tim')).toBeInTheDocument()
      })
    })
  })

  describe('Critical Path - Search Functionality', () => {
    it('should debounce search input', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/cari judul atau no meeting/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/cari judul atau no meeting/i)
      await user.type(searchInput, 'Rapat')

      jest.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockQuery.or).toHaveBeenCalledWith(expect.stringContaining('Rapat'))
      })
    })

    it('should filter meetings by search term', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockMeetingList[0]],
          error: null,
          count: 1,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      const searchInput = screen.getByPlaceholderText(/cari judul atau no meeting/i)
      await user.type(searchInput, 'Koordinasi')

      jest.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText('Rapat Koordinasi Proyek Q1')).toBeInTheDocument()
      })
    })
  })

  describe('Critical Path - Filter Functionality', () => {
    it('should filter by meeting type - internal', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList.filter((m) => m.meeting_type === 'internal'),
          error: null,
          count: 2,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      const filterSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(filterSelect, 'internal')

      await waitFor(() => {
        expect(mockQuery.eq).toHaveBeenCalledWith('meeting_type', 'internal')
      })
    })

    it('should filter by meeting type - external', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList.filter((m) => m.meeting_type === 'external'),
          error: null,
          count: 1,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      const filterSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(filterSelect, 'external')

      await waitFor(() => {
        expect(mockQuery.eq).toHaveBeenCalledWith('meeting_type', 'external')
      })
    })

    it('should show reset filter button when filters are active', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      const searchInput = screen.getByPlaceholderText(/cari judul atau no meeting/i)
      await user.type(searchInput, 'test')

      jest.advanceTimersByTime(300)

      await waitFor(() => {
        expect(screen.getByText(/reset filter/i)).toBeInTheDocument()
      })
    })

    it('should reset filters when reset button clicked', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      const searchInput = screen.getByPlaceholderText(/cari judul atau no meeting/i)
      await user.type(searchInput, 'test')

      jest.advanceTimersByTime(300)

      const resetButton = screen.getByText(/reset filter/i)
      await user.click(resetButton)

      await waitFor(() => {
        expect(searchInput).toHaveValue('')
      })
    })
  })

  describe('Critical Path - Pagination', () => {
    it('should show pagination controls', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 15,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByText('Sebelumnya')).toBeInTheDocument()
        expect(screen.getByText('Selanjutnya')).toBeInTheDocument()
      })
    })

    it('should disable previous button on first page', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 15,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        const prevButton = screen.getByText('Sebelumnya')
        expect(prevButton).toBeDisabled()
      })
    })

    it('should navigate to next page when clicked', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 25,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        const nextButton = screen.getByText('Selanjutnya')
        expect(nextButton).not.toBeDisabled()
      })

      const nextButton = screen.getByText('Selanjutnya')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Halaman 2 dari 3')).toBeInTheDocument()
      })
    })
  })

  describe('Critical Path - Navigation', () => {
    it('should have create meeting button linking to /meeting/baru', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        const createButton = screen.getByRole('link', { name: /buat mom baru/i })
        expect(createButton).toHaveAttribute('href', '/meeting/baru')
      })
    })

    it('should have edit buttons linking to edit pages', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        const editButtons = screen.getAllByRole('link')
        expect(editButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('User Interactions', () => {
    it('should allow user to type in search box', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/cari judul atau no meeting/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/cari judul atau no meeting/i)
      await user.type(searchInput, 'Test Search')

      expect(searchInput).toHaveValue('Test Search')
    })

    it('should allow user to select meeting type filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      const filterSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(filterSelect, 'internal')

      expect(filterSelect).toHaveValue('internal')
    })

    it('should display correct meeting count', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByText(/menampilkan 3 dari 3 meeting/i)).toBeInTheDocument()
      })
    })
  })

  describe('Export Button', () => {
    it('should render export button', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMeetingList,
          error: null,
          count: 3,
        }),
      }
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      render(<MoMPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      })
    })
  })
})
