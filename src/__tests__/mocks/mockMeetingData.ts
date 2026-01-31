import { MeetingFormData } from '../../lib/meeting/schemas'

// Mock Meeting Data - valid meeting
export const mockMeetingData: MeetingFormData = {
  title: 'Rapat Koordinasi Proyek Q1',
  meeting_type: 'internal',
  meeting_date: '2025-02-15',
  meeting_time: '10:00',
  location: 'Ruang Meeting A',
  description: 'Koordinasi progress proyek bulan Februari',
  participants: ['john@example.com', 'jane@example.com', 'bob@example.com']
}

// Mock Meeting Data - invalid (missing required fields)
export const mockInvalidMeetingData: Partial<MeetingFormData> = {
  title: '',
  meeting_type: 'internal',
  meeting_date: '',
  meeting_time: '',
  location: '',
  description: '',
  participants: []
}

// Mock Meeting Data - minimal valid
export const mockMinimalMeetingData: MeetingFormData = {
  title: 'Meeting Singkat',
  meeting_type: 'internal',
  meeting_date: '2025-02-15',
  meeting_time: '10:00',
  location: 'Zoom',
  description: 'Diskusi singkat',
  participants: ['user@example.com']
}

// Mock Meeting from Database
export const mockMeetingFromDB = {
  id: 'meeting-123',
  title: 'Rapat Koordinasi Proyek Q1',
  meeting_number: '001/MOM/II/2025',
  meeting_type: 'internal',
  meeting_date: '2025-02-15T10:00:00.000Z',
  location: 'Ruang Meeting A',
  description: 'Koordinasi progress proyek bulan Februari',
  participants: ['john@example.com', 'jane@example.com', 'bob@example.com'],
  status: 'draft',
  created_by: 'user-123',
  created_at: '2025-02-01T09:00:00.000Z',
  updated_at: '2025-02-01T09:00:00.000Z',
  users: {
    nama: 'John Doe'
  }
}

// Mock Meeting List for Pagination Tests
export const mockMeetingList = [
  {
    id: 'meeting-1',
    title: 'Rapat Koordinasi Proyek Q1',
    meeting_number: '001/MOM/II/2025',
    meeting_type: 'internal',
    meeting_date: '2025-02-15T10:00:00.000Z',
    location: 'Ruang Meeting A',
    description: 'Koordinasi progress proyek',
    participants: ['john@example.com', 'jane@example.com'],
    status: 'published',
    created_by: 'user-1',
    created_at: '2025-02-01T09:00:00.000Z',
    updated_at: '2025-02-01T09:00:00.000Z',
    users: {
      nama: 'John Doe'
    }
  },
  {
    id: 'meeting-2',
    title: 'Meeting dengan Klien PT ABC',
    meeting_number: '002/MOM/II/2025',
    meeting_type: 'external',
    meeting_date: '2025-02-20T14:00:00.000Z',
    location: 'Zoom Meeting',
    description: 'Presentasi proposal proyek',
    participants: ['client@abc.com', 'manager@example.com'],
    status: 'draft',
    created_by: 'user-2',
    created_at: '2025-02-02T10:00:00.000Z',
    updated_at: '2025-02-02T10:00:00.000Z',
    users: {
      nama: 'Jane Smith'
    }
  },
  {
    id: 'meeting-3',
    title: 'Review Mingguan Tim',
    meeting_number: '003/MOM/II/2025',
    meeting_type: 'internal',
    meeting_date: '2025-02-22T09:30:00.000Z',
    location: 'Ruang Meeting B',
    description: 'Review progress minggu ini',
    participants: ['dev1@example.com', 'dev2@example.com', 'dev3@example.com', 'dev4@example.com'],
    status: 'published',
    created_by: 'user-1',
    created_at: '2025-02-03T11:00:00.000Z',
    updated_at: '2025-02-03T11:00:00.000Z',
    users: {
      nama: 'John Doe'
    }
  }
]

// Mock Supabase Response - Create Meeting Success
export const mockCreateMeetingResponse = {
  data: [{
    id: 'new-meeting-123',
    title: 'Rapat Koordinasi Proyek Q1',
    meeting_number: '001/MOM/II/2025',
    meeting_type: 'internal',
    meeting_date: '2025-02-15T10:00:00.000Z',
    location: 'Ruang Meeting A',
    description: 'Koordinasi progress proyek bulan Februari',
    participants: ['john@example.com', 'jane@example.com', 'bob@example.com'],
    status: 'draft',
    created_by: 'user-123',
    created_at: '2025-02-01T09:00:00.000Z'
  }],
  error: null
}

// Mock Supabase Response - Update Meeting Success
export const mockUpdateMeetingResponse = {
  data: [{
    id: 'meeting-123',
    title: 'Rapat Koordinasi Proyek Q1 (Updated)',
    meeting_number: '001/MOM/II/2025',
    meeting_type: 'internal',
    meeting_date: '2025-02-15T10:00:00.000Z',
    location: 'Ruang Meeting B',
    description: 'Koordinasi progress proyek bulan Februari - Updated',
    participants: ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com'],
    status: 'draft',
    created_by: 'user-123',
    updated_at: '2025-02-02T10:00:00.000Z'
  }],
  error: null
}

// Mock Supabase Response - Get Meeting Success
export const mockGetMeetingResponse = {
  data: mockMeetingFromDB,
  error: null
}

// Mock Supabase Response - Get Meetings List Success
export const mockGetMeetingsResponse = {
  data: mockMeetingList,
  count: 3,
  error: null
}

// Mock Supabase Response - Empty List
export const mockEmptyMeetingsResponse = {
  data: [],
  count: 0,
  error: null
}

// Mock Supabase Error Responses
export const mockSupabaseError = {
  data: null,
  error: {
    message: 'Database connection failed',
    code: 'CONNECTION_ERROR'
  }
}

export const mockAuthError = {
  data: null,
  error: {
    message: 'User not authenticated',
    code: 'AUTH_ERROR'
  }
}

export const mockValidationError = {
  data: null,
  error: {
    message: 'Validation failed: title is required',
    code: 'VALIDATION_ERROR'
  }
}

// Mock Auth Session
export const mockAuthSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated'
  },
  access_token: 'test-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: 1234567890
}

// Mock Meeting Number Preview
export const mockMeetingNumberPreview = '001/MOM/II/2025'
