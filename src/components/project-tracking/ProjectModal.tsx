'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ProjectSummary } from '@/types/project-tracking'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  existingData?: ProjectSummary | null
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
]

export default function ProjectModal({
  isOpen,
  onClose,
  onSuccess,
  existingData = null,
}: ProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_name: '',
    customer_name: '',
    contract_value: '',
    status: 'active',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        setFormData({
          project_name: existingData.project_name,
          customer_name: existingData.customer_name,
          contract_value: existingData.contract_value.toString(),
          status: existingData.status,
        })
      } else {
        setFormData({
          project_name: '',
          customer_name: '',
          contract_value: '',
          status: 'active',
        })
      }
      setErrors({})
    }
  }, [isOpen, existingData])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Nama project harus diisi'
    }
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Nama customer harus diisi'
    }
    
    const value = parseFloat(formData.contract_value)
    if (!formData.contract_value || isNaN(value)) {
      newErrors.contract_value = 'Contract value harus diisi'
    } else if (value <= 0) {
      newErrors.contract_value = 'Contract value harus lebih dari 0'
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
      
      const newProject: ProjectSummary = {
        id: existingData?.id || `proj-${Date.now()}`,
        project_name: formData.project_name.trim(),
        customer_name: formData.customer_name.trim(),
        contract_value: parseFloat(formData.contract_value),
        total_spk: existingData?.total_spk || 0,
        project_progress: existingData?.project_progress || 0,
        status: formData.status as 'active' | 'completed',
        vendor_paid: existingData?.vendor_paid || 0,
        customer_paid: existingData?.customer_paid || 0,
      }
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('project-update', { detail: newProject })
        window.dispatchEvent(event)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving project:', error)
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
            {existingData ? 'Edit Project' : 'Tambah Project'}
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
              Nama Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.project_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nama project"
            />
            {errors.project_name && (
              <p className="text-xs text-red-600 mt-1">{errors.project_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Customer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.customer_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nama customer"
            />
            {errors.customer_name && (
              <p className="text-xs text-red-600 mt-1">{errors.customer_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Value <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
              <input
                type="number"
                min="0"
                value={formData.contract_value}
                onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm ${
                  errors.contract_value ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
              />
            </div>
            {errors.contract_value && (
              <p className="text-xs text-red-600 mt-1">{errors.contract_value}</p>
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
