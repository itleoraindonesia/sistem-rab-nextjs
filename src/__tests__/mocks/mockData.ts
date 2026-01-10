import { RABFormData } from '../../schemas/rabSchema'

// Mock Panels - sesuai hook interface (id as number)
export const mockPanels = [
  {
    id: 1,
    name: 'Panel Dinding Standard',
    type: 'dinding',
    harga: 150000,
    luas_per_lembar: 1.8,
    jumlah_per_truck: 50,
  },
  {
    id: 2,
    name: 'Panel Dinding Premium',
    type: 'dinding',
    harga: 200000,
    luas_per_lembar: 1.8,
    jumlah_per_truck: 45,
  },
  {
    id: 3,
    name: 'Panel Lantai Standard',
    type: 'lantai',
    harga: 180000,
    luas_per_lembar: 1.8,
    jumlah_per_truck: 40,
  },
  {
    id: 4,
    name: 'Panel Lantai Premium',
    type: 'lantai',
    harga: 250000,
    luas_per_lembar: 1.8,
    jumlah_per_truck: 35,
  },
]

// Mock Ongkir - sesuai database schema
export const mockOngkir = [
  {
    id: 'ongkir-1',
    provinsi: 'DKI Jakarta',
    kabupaten: 'Jakarta Pusat',
    biaya: 1500000,
  },
  {
    id: 'ongkir-2',
    provinsi: 'DKI Jakarta',
    kabupaten: 'Jakarta Selatan',
    biaya: 1600000,
  },
  {
    id: 'ongkir-3',
    provinsi: 'Jawa Barat',
    kabupaten: 'Bandung',
    biaya: 2000000,
  },
  {
    id: 'ongkir-4',
    provinsi: 'Jawa Barat',
    kabupaten: 'Bekasi',
    biaya: 1800000,
  },
]

// Mock Form Data - valid RAB form
export const mockValidFormData: RABFormData = {
  no_ref: '001/SPB/LEORA/I/2025',
  project_name: 'Proyek Rumah Minimalis',
  location_provinsi: 'DKI Jakarta',
  location_kabupaten: 'Jakarta Pusat',
  location_address: 'Jl. Sudirman No. 123',
  client_profile: {
    nama: 'John Doe',
    no_hp: '081234567890',
    email: 'john@example.com',
  },
  project_profile: {
    kategori: 'residential',
    deskripsi: 'Rumah 2 lantai dengan desain modern',
  },
  estimasi_pengiriman: '2025-02-01',
  bidang: [
    { panjang: 5, lebar: 4 },
    { panjang: 3, lebar: 4 },
  ],
  perimeter: 24,
  tinggi_lantai: 3,
  panel_dinding_id: '1',
  panel_lantai_id: '3',
  hitung_dinding: true,
  hitung_lantai: true,
  status: 'draft',
}

// Mock Form Data - invalid (missing required fields)
export const mockInvalidFormData: Partial<RABFormData> = {
  project_name: '',
  location_provinsi: '',
  location_kabupaten: '',
  client_profile: {
    nama: '',
    no_hp: '',
    email: '',
  },
  project_profile: {
    kategori: '',
    deskripsi: '',
  },
  hitung_dinding: false,
  hitung_lantai: false,
  status: 'draft',
}

// Mock Calculation Result
export const mockCalculationResult = {
  luasDinding: 72, // 24 * 3
  luasLantai: 32, // (5*4) + (3*4)
  subtotalDinding: 10800000, // calculated
  subtotalLantai: 6400000, // calculated
  biayaOngkir: 1500000, // from ongkir
  grandTotal: 18700000, // sum all
  items: [
    {
      desc: 'Panel Dinding Standard',
      qty: 40,
      unit_price: 150000,
      amount: 6000000,
    },
    {
      desc: 'Upah Pasang Dinding',
      qty: 72,
      unit: 'm²',
      unit_price: 50000,
      amount: 3600000,
    },
    {
      desc: 'Joint/Angkur Dinding',
      qty: 648,
      unit: 'titik',
      unit_price: 2500,
      amount: 1620000,
    },
    {
      desc: 'Panel Lantai Standard',
      qty: 18,
      unit_price: 180000,
      amount: 3240000,
    },
    {
      desc: 'Upah Pasang Lantai',
      qty: 32,
      unit: 'm²',
      unit_price: 50000,
      amount: 1600000,
    },
    {
      desc: 'Joint/Angkur Lantai',
      qty: 230,
      unit: 'titik',
      unit_price: 2500,
      amount: 575000,
    },
    {
      desc: 'Angkutan Truk ke DKI Jakarta - Jakarta Pusat',
      qty: 1,
      unit: 'Unit',
      unit_price: 1500000,
      amount: 1500000,
    },
  ],
}

// Mock Supabase Response
export const mockSupabaseResponse = {
  data: [{
    id: '123e4567-e89b-12d3-a456-426614174000',
    no_ref: '001/SPB/LEORA/I/2025',
    project_name: 'Proyek Rumah Minimalis',
    location_provinsi: 'DKI Jakarta',
    location_kabupaten: 'Jakarta Pusat',
    status: 'draft',
    total: 18700000,
    created_at: '2025-01-10T09:00:00Z',
  }],
  error: null,
}

// Mock Error Response
export const mockSupabaseError = {
  data: null,
  error: {
    message: 'Database connection failed',
    code: 'CONNECTION_ERROR',
  },
}
