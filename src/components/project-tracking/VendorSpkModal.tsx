'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { VendorSpkWithProgress } from '@/types/project-tracking'

interface VendorSpkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  existingData?: VendorSpkWithProgress | null
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
]

export default function VendorSpkModal({
  isOpen,
  onClose,
  onSuccess,
  existingData = null,
}: VendorSpkModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    vendor_name: '',
    nilai_spk: '',
    status: 'active',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        setFormData({
          vendor_name: existingData.vendor_name,
          nilai_spk: existingData.nilai_spk.toString(),
          status: existingData.status,
        })
      } else {
        setFormData({
          vendor_name: '',
          nilai_spk: '',
          status: 'active',
        })
      }
      setErrors({})
    }
  }, [isOpen, existingData])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = 'Nama vendor harus diisi'
    }
    
    const nilai = parseFloat(formData.nilai_spk)
    if (!formData.nilai_spk || isNaN(nilai)) {
      newErrors.nilai_spk = 'Nilai SPK harus diisi'
    } else if (nilai <= 0) {
      newErrors.nilai_spk = 'Nilai SPK harus lebih dari 0'
    }
    
    if (!formData.status) {
      newErrors.status = 'Pilih status'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newVendorSpk: VendorSpkWithProgress = {
        id: existingData?.id || `vspk-${Date.now()}`,
        project_id: existingData?.project_id || '',
        vendor_name: formData.vendor_name.trim(),
        nilai_spk: parseFloat(formData.nilai_spk),
        status: formData.status as 'active' | 'completed',
        created_at: existingData?.created_at || new Date().toISOString(),
        latest_progress: existingData?.latest_progress,
      }
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('vendor-spk-update', { detail: newVendorSpk })
        window.dispatchEvent(event)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving vendor SPK:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {existingData ? 'Edit Vendor SPK' : 'Tambah Vendor SPK'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.vendor_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nama vendor"
            />
            {errors.vendor_name && (
              <p className="text-xs text-red-600 mt-1">{errors.vendor_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nilai SPK <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
              <input
                type="number"
                min="0"
                value={formData.nilai_spk}
                onChange={(e) => setFormData({ ...formData, nilai_spk: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm ${
                  errors.nilai_spk ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
              />
            </div>
            {errors.nilai_spk && (
              <p className="text-xs text-red-600 mt-1">{errors.nilai_spk}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.status ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-red-600 mt-1">{errors.status}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
