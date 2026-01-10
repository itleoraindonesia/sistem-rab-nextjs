import React from 'react'
import { render, screen } from '../utils/test-utils'
import FormRAB from '../../components/form/FormRAB'
import { mockPanels, mockOngkir } from '../mocks/mockData'

// Mock the hooks
jest.mock('../../hooks/useRABCalculation', () => ({
  useRABCalculation: jest.fn(() => ({
    hasil: null,
    calculateRAB: jest.fn(),
    setHasil: jest.fn(),
  })),
}))

jest.mock('../../hooks/useWilayahData', () => ({
  useWilayahData: () => ({
    getKabupaten: jest.fn(() => Promise.resolve(['Jakarta Pusat', 'Jakarta Selatan'])),
    loadingKabupaten: {},
  }),
}))

const mockProps = {
  control: {} as any,
  handleSubmit: jest.fn((fn) => (data: any) => fn(data)),
  setValue: jest.fn(),
  formState: {
    errors: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    submitCount: 0,
    isValidating: false,
    touchedFields: {},
    dirtyFields: {},
    defaultValues: {},
  } as any,
  onSubmit: jest.fn(),
  panels: mockPanels,
  ongkir: mockOngkir,
  hasil: null,
  onBack: jest.fn(),
  title: 'Test Form',
}

describe('FormRAB Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<FormRAB {...mockProps} />)
    expect(screen.getByText('Test Form')).toBeInTheDocument()
  })

  it('should render main form sections', () => {
    render(<FormRAB {...mockProps} />)
    expect(screen.getByText('Data Proyek')).toBeInTheDocument()
    expect(screen.getByText('Ongkos Kirim')).toBeInTheDocument()
    expect(screen.getByText('Hasil Perhitungan')).toBeInTheDocument()
  })

  it('should show calculation info message when no results', () => {
    render(<FormRAB {...mockProps} />)
    expect(screen.getByText('Pilih Jenis Perhitungan')).toBeInTheDocument()
  })

  it('should render calculation results when provided', () => {
    const propsWithResults = {
      ...mockProps,
      hasil: {
        luasDinding: 72,
        luasLantai: 32,
        subtotalDinding: 10350000,
        subtotalLantai: 5165000,
        biayaOngkir: 3000000,
        grandTotal: 18515000,
        items: [],
      },
    }

    render(<FormRAB {...propsWithResults} />)
    expect(screen.getByText('72 m²')).toBeInTheDocument()
    expect(screen.getByText('32 m²')).toBeInTheDocument()
  })

  it('should show submit button', () => {
    render(<FormRAB {...mockProps} />)
    const submitButton = screen.getByRole('button', { name: /simpan/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('should show back button', () => {
    render(<FormRAB {...mockProps} />)
    const backButton = screen.getByRole('button', { name: /kembali/i })
    expect(backButton).toBeInTheDocument()
  })
})
