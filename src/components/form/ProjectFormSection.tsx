'use client';

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { RABFormData } from '../../schemas/rabSchema';

interface OngkirOption {
  provinsi: string;
  biaya: number;
}

interface ProjectFormSectionProps {
  register: UseFormRegister<RABFormData>;
  errors: FieldErrors<RABFormData>;
  ongkir?: OngkirOption[];
  watchedValues: Partial<RABFormData>;
  setValue: UseFormSetValue<RABFormData>;
}

export default function ProjectFormSection({
  register,
  errors,
  ongkir = [],
  watchedValues,
  setValue
}: ProjectFormSectionProps) {
  // Mock ongkir options - in real app this would come from API
  const ongkirOptions = [
    { value: 0, label: 'Gratis Ongkir' },
    { value: 50000, label: 'Rp 50.000' },
    { value: 100000, label: 'Rp 100.000' },
    { value: 150000, label: 'Rp 150.000' },
    { value: 200000, label: 'Rp 200.000' },
  ];

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <div>
        <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Proyek *
        </label>
        <input
          {...register('project_name')}
          type="text"
          id="project_name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          placeholder="Masukkan nama proyek"
        />
        {errors.project_name && (
          <p className="mt-1 text-sm text-red-600">{errors.project_name.message}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Lokasi Proyek *
        </label>
        <input
          {...register('location')}
          type="text"
          id="location"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          placeholder="Masukkan lokasi proyek"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Project Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Ringkasan Proyek</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Proyek:</span> {watchedValues.project_name || '-'}
          </div>
          <div>
            <span className="font-medium">Lokasi:</span> {watchedValues.location || '-'}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium">Bidang:</span> {watchedValues.bidang?.length || 0} area
          </div>
        </div>
      </div>
    </div>
  );
}
