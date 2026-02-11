import { renderHook, act } from '@testing-library/react'
import { useRABCalculation } from '../../hooks/useRABCalculation'
import { mockPanels, mockOngkir, mockValidFormData, mockCalculationResult } from '../mocks/mockData'

// Mock the master data context
jest.mock('../../context/MasterDataContext', () => ({
  useMasterData: () => ({
    panels: mockPanels,
    ongkir: mockOngkir,
    parameters: {
      wasteFactor: 1.1,
      upahPasang: 200000,
      hargaJoint: 2300,
    },
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}))

describe('useRABCalculation', () => {
  const defaultParameters = {
    wasteFactor: 1.1,
    upahPasang: 200000,
    hargaJoint: 2300,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should return null when masterLoading is true', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, true)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      expect(calculation).toBeNull()
    })

    it('should return null when no panels available', () => {
      const { result } = renderHook(() =>
        useRABCalculation([], mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      expect(calculation).toBeNull()
    })
  })

  describe('Area Calculations', () => {
    it('should calculate wall area correctly (perimeter × height)', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      expect(calculation?.luasDinding).toBe(72) // 24 × 3
    })

    it('should calculate floor area correctly (sum of all bidang)', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      expect(calculation?.luasLantai).toBe(32) // (5×4) + (3×4)
    })

    it('should handle empty bidang array', () => {
      const formData = { ...mockValidFormData, bidang: [] }
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(formData)

      expect(calculation?.luasLantai).toBe(0)
    })
  })

  describe('Panel Calculations', () => {
    it('should calculate wall panel requirements with waste factor', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Wall area: 72m², panel area: 1.8m², waste factor: 1.1
      // Expected: ceil(72 / 1.8 * 1.1) = ceil(44) = 44
      expect(calculation?.lembarDinding).toBe(44)
    })

    it('should calculate floor panel requirements with waste factor', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Floor area: 32m², panel area: 1.8m², waste factor: 1.1
      // Expected: ceil(32 / 1.8 * 1.1) = ceil(19.55) = 20
      expect(calculation?.lembarLantai).toBe(20)
    })

    it('should skip wall calculations when hitung_dinding is false', () => {
      const formData = { ...mockValidFormData, hitung_dinding: false }
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(formData)

      expect(calculation?.subtotalDinding).toBe(0)
      expect(calculation?.lembarDinding).toBeUndefined()
    })

    it('should skip floor calculations when hitung_lantai is false', () => {
      const formData = { ...mockValidFormData, hitung_lantai: false }
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(formData)

      expect(calculation?.subtotalLantai).toBe(0)
      expect(calculation?.lembarLantai).toBeUndefined()
    })
  })

  describe('Joint Calculations', () => {
    it('should calculate wall joints correctly', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Wall panels: 44, joint formula: qty * 5
      // Expected: 44 * 5 = 220
      expect(calculation?.titikJointDinding).toBe(220)
    })

    it('should calculate floor joints correctly', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Floor panels: 20, joint formula: qty * 5
      // Expected: 20 * 5 = 100
      expect(calculation?.titikJointLantai).toBe(100)
    })
  })

  describe('Cost Calculations', () => {
    it('should calculate wall subtotal correctly', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Panel cost: 44 × 150000 = 6,600,000
      // Labor cost: 72 × 200000 = 14,400,000
      // Joint cost: 220 × 2300 = 506,000
      // Total: 21,506,000
      expect(calculation?.subtotalDinding).toBe(21506000)
    })

    it('should calculate floor subtotal correctly', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Panel cost: 20 × 180000 = 3,600,000
      // Labor cost: 32 × 200000 = 6,400,000
      // Joint cost: 100 × 2300 = 230,000
      // Total: 10,230,000
      expect(calculation?.subtotalLantai).toBe(10230000)
    })

    it('should calculate shipping cost based on truck requirements', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Wall panels: 42, truck capacity: 50 → 1 truck
      // Floor panels: 19, truck capacity: 40 → 1 truck
      // Total trucks: 2, cost per truck: 1,500,000
      // Total shipping: 3,000,000
      expect(calculation?.biayaOngkir).toBe(3000000)
    })

    it('should calculate grand total correctly', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      // Wall: 21,506,000 + Floor: 10,230,000 + Shipping: 3,000,000 = 34,736,000
      expect(calculation?.grandTotal).toBe(34736000)
    })
  })

  describe('Items Array', () => {
    it('should generate correct items array for wall panels', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      const wallItems = calculation?.items.filter(item =>
        item.desc.includes('Panel Dinding')
      )

      expect(wallItems).toHaveLength(1)
      expect(wallItems?.[0]).toEqual({
        desc: 'Panel Dinding Standard',
        qty: 44,
        unit_price: 150000,
        amount: 6600000,
      })
    })

    it('should generate correct items array for floor panels', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      const floorItems = calculation?.items.filter(item =>
        item.desc.includes('Panel Lantai')
      )

      expect(floorItems).toHaveLength(1)
      expect(floorItems?.[0]).toEqual({
        desc: 'Panel Lantai Standard',
        qty: 20,
        unit_price: 180000,
        amount: 3600000,
      })
    })

    it('should include shipping item when applicable', () => {
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(mockValidFormData)

      const shippingItems = calculation?.items.filter(item =>
        item.desc.includes('Angkutan Truk')
      )

      expect(shippingItems).toHaveLength(1)
      expect(shippingItems?.[0]).toEqual({
        desc: 'Angkutan Truk ke DKI Jakarta - Jakarta Pusat',
        qty: 2,
        unit: 'Unit',
        unit_price: 1500000,
        amount: 3000000,
      })
    })

    it('should exclude zero-amount items', () => {
      const formData = { ...mockValidFormData, hitung_dinding: false }
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(formData)

      const wallItems = calculation?.items.filter(item =>
        item.desc.includes('Dinding')
      )

      expect(wallItems).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing panel data gracefully', () => {
      const formData = { ...mockValidFormData, panel_dinding_id: 'non-existent' }
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(formData)

      expect(calculation?.subtotalDinding).toBe(0)
    })

    it('should handle missing shipping data gracefully', () => {
      const formData = { ...mockValidFormData, location_kabupaten: 'non-existent' }
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(formData)

      expect(calculation?.biayaOngkir).toBe(0)
    })

    it('should handle zero/undefined numeric values', () => {
      const formData = {
        ...mockValidFormData,
        perimeter: undefined,
        tinggi_lantai: 0,
        bidang: [{ panjang: 0, lebar: 0 }]
      }
      const { result } = renderHook(() =>
        useRABCalculation(mockPanels, mockOngkir, defaultParameters, false)
      )

      const { calculateRAB } = result.current
      const calculation = calculateRAB(formData)

      expect(calculation?.luasDinding).toBe(0)
      expect(calculation?.luasLantai).toBe(0)
    })
  })
})
