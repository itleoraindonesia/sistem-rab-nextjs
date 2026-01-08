'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { RABFormData } from '../../schemas/rabSchema';

interface WallPanelSectionProps {
  register: UseFormRegister<RABFormData>;
  errors: FieldErrors<RABFormData>;
  watchedValues: Partial<RABFormData>;
  panels: any[];
}

export default function WallPanelSection({
  register,
  errors,
  watchedValues,
  panels,
}: WallPanelSectionProps) {
  return (
    <div className="bg-surface rounded-xl shadow overflow-hidden">
      <div className="p-4 border-b border-default">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-brand-accent">🏗️</span>
          Panel Dinding
        </h2>
      </div>

      <div className="p-4">
        <div className="text-center py-8 text-muted">
          <div className="text-4xl mb-2">🏗️</div>
          <p>Panel dinding akan ditambahkan selanjutnya</p>
          <p className="text-sm">Fitur form panel dinding dengan dynamic fields</p>
        </div>
      </div>
    </div>
  );
}
