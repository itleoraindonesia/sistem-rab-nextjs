'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { CustomerPayment } from '@/types/project-tracking'

interface CustomerPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  existingData?: CustomerPayment | null
}

const TERMIN_OPTIONS = [
  { value: 'dp', label: 'DP (Down Payment)' },
  { value: 'term', label: 'Termin' },
  { value: 'final', label: 'Final' },
]

export default function CustomerPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  existingData = null,
}: CustomerPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    jumlah: '',
    termin: 'dp',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        setFormData({
          jumlah: existingData.jumlah.toString(),
          termin: existingData.termin,
          tanggal: existingData.tanggal,
          keterangan: existingData.keterangan || '',
        })
      } else {
        setFormData({
          jumlah: '',
          termin: 'dp',
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: '',
        })
      }
      setErrors({})
    }
  }, [isOpen, existingData])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    const jumlah = parseFloat(formData.jumlah)
    if (!formData.jumlah || isNaN(jumlah)) {
      newErrors.jumlah = 'Jumlah harus diisi'
    } else if (jumlah <= 0) {
      newErrors.jumlah = 'Jumlah harus lebih dari 0'
    }
    
    if (!formData.termin) {
      newErrors.termin = 'Pilih termin'
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
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newPayment: CustomerPayment = {
        id: existingData?.id || `cpay-${Date.now()}`,
        project_id: existingData?.project_id || '',
        jumlah: parseFloat(formData.jumlah),
        termin: formData.termin as 'dp' | 'term' | 'final',
        tanggal: formData.tanggal,
        keterangan: formData.keterangan || undefined,
        created_at: existingData?.created_at || new Date().toISOString(),
      }
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('customer-payment-update', { detail: newPayment })
        window.dispatchEvent(event)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving payment:', error)
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
            {existingData ? 'Edit Pembayaran Customer' : 'Tambah Pembayaran Customer'}
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
              Jumlah <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
              <input
                type="number"
                min="0"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm ${
                  errors.jumlah ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
              />
            </div>
            {errors.jumlah && (
              <p className="text-xs text-red-600 mt-1">{errors.jumlah}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Termin <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.termin}
              onChange={(e) => setFormData({ ...formData, termin: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.termin ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              {TERMIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.termin && (
              <p className="text-xs text-red-600 mt-1">{errors.termin}</p>
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
