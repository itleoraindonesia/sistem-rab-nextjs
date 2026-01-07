'use client';

import { RABFormData } from '../../schemas/rabSchema';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface CalculationResultsProps {
  hasil: {
    total_wall_panels?: number;
    total_floor_panels?: number;
    total_additional_costs?: number;
    ongkir?: number;
    grand_total?: number;
  };
  watchedValues: Partial<RABFormData>;
  isSubmitting: boolean;
  isValid: boolean;
}

export default function CalculationResults({
  hasil,
  watchedValues,
  isSubmitting,
  isValid
}: CalculationResultsProps) {
  // Calculate totals from form data
  const calculateBidangTotal = () => {
    return (watchedValues.bidang || []).reduce((total, bidang) => {
      const panjang = bidang?.panjang || 0;
      const lebar = bidang?.lebar || 0;
      const luas = panjang * lebar;
      return total + luas;
    }, 0) * 100000; // Mock calculation per m²
  };

  const bidangTotal = calculateBidangTotal();
  const grandTotal = bidangTotal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-primary">Ringkasan Biaya RAB</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bidang Area Cost */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Biaya Area</span>
              <span className="font-medium">{formatCurrency(bidangTotal)}</span>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center py-3 bg-brand-primary/10 rounded-lg px-3">
              <span className="text-lg font-semibold text-brand-primary">Total RAB</span>
              <span className="text-xl font-bold text-brand-primary">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-primary">Ringkasan Proyek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Nama Proyek:</span>
              <p className="font-medium">{watchedValues.project_name || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Lokasi:</span>
              <p className="font-medium">
                {[watchedValues.location_provinsi, watchedValues.location_kabupaten]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </p>
              {watchedValues.location_address && (
                <p className="text-sm text-gray-500 mt-1">{watchedValues.location_address}</p>
              )}
            </div>
            <div>
              <span className="text-sm text-gray-600">Jumlah Bidang:</span>
              <p className="font-medium">{watchedValues.bidang?.length || 0} area</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Luas:</span>
              <p className="font-medium">
                {(watchedValues.bidang || []).reduce((total, bidang) => {
                  return total + ((bidang?.panjang || 0) * (bidang?.lebar || 0));
                }, 0).toFixed(2)} m²
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-dark"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan RAB'}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
          >
            Simpan Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
          >
            Preview PDF
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Mohon lengkapi semua field yang wajib diisi sebelum menyimpan.
          </p>
        </div>
      )}

      {/* Success Message */}
      {isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✅ Form siap disimpan. Total biaya: {formatCurrency(grandTotal)}
          </p>
        </div>
      )}
    </div>
  );
}
