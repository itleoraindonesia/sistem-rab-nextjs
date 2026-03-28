'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { VendorSpkWithProgress, VendorProgress } from '@/types/project-tracking'

interface VendorProgressModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vendorSpkList: VendorSpkWithProgress[]
  existingData?: VendorProgress | null
}

export default function VendorProgressModal({
  isOpen,
  onClose,
  onSuccess,
  vendorSpkList,
  existingData = null,
}: VendorProgressModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    vendor_spk_id: '',
    progress_percent: '',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        setFormData({
          vendor_spk_id: existingData.vendor_spk_id,
          progress_percent: existingData.progress_percent.toString(),
          tanggal: existingData.tanggal,
          keterangan: existingData.keterangan || '',
        })
      } else {
        setFormData({
          vendor_spk_id: vendorSpkList[0]?.id || '',
          progress_percent: '',
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: '',
        })
      }
      setErrors({})
    }
  }, [isOpen, existingData, vendorSpkList])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.vendor_spk_id) {
      newErrors.vendor_spk_id = 'Pilih vendor SPK'
    }
    
    const progress = parseFloat(formData.progress_percent)
    if (!formData.progress_percent || isNaN(progress)) {
      newErrors.progress_percent = 'Progress harus diisi'
    } else if (progress < 0 || progress > 100) {
      newErrors.progress_percent = 'Progress harus antara 0-100'
    }
    
    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal harus diisi'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newProgress: VendorProgress = {
        id: existingData?.id || `vprog-${Date.now()}`,
        vendor_spk_id: formData.vendor_spk_id,
        progress_percent: parseFloat(formData.progress_percent),
        tanggal: formData.tanggal,
        keterangan: formData.keterangan || undefined,
        created_at: existingData?.created_at || new Date().toISOString(),
      }
      
      // Update mock data (in real app, this would be a Supabase call)
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('vendor-progress-update', { detail: newProgress })
        window.dispatchEvent(event)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving progress:', error)
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
            {existingData ? 'Edit Progress' : 'Tambah Progress'}
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
              Vendor SPK <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.vendor_spk_id}
              onChange={(e) => setFormData({ ...formData, vendor_spk_id: e.target.value })}
              disabled={!!existingData}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.vendor_spk_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } ${existingData ? 'bg-gray-100' : ''}`}
            >
              <option value="">Pilih Vendor SPK</option>
              {vendorSpkList.map((vspk) => (
                <option key={vspk.id} value={vspk.id}>
                  {vspk.vendor_name}
                </option>
              ))}
            </select>
            {errors.vendor_spk_id && (
              <p className="text-xs text-red-600 mt-1">{errors.vendor_spk_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.progress_percent}
              onChange={(e) => setFormData({ ...formData, progress_percent: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.progress_percent ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="0-100"
            />
            {errors.progress_percent && (
              <p className="text-xs text-red-600 mt-1">{errors.progress_percent}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.tanggal ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.tanggal && (
              <p className="text-xs text-red-600 mt-1">{errors.tanggal}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              placeholder="Keterangan (opsional)"
            />
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
