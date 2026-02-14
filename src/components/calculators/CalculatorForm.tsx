"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { CalculatorConfig, CalculationResult, CalculatorMasterData, CalculatorValues, CalculatorField } from "@/lib/calculators";
import { calculate } from "@/lib/calculators";
import { Plus, Trash2, ChevronLeft } from "lucide-react";

interface CalculatorFormProps {
  config: CalculatorConfig;
  masterData: CalculatorMasterData;
  onCalculate?: (result: CalculationResult) => void;
  onBack?: () => void;
}

export function CalculatorForm({ config, masterData, onCalculate, onBack }: CalculatorFormProps) {
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Build dynamic default values
  const getDefaultValues = useCallback(() => {
    const defaults: Record<string, any> = {};
    
    config.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        defaults[field.name] = false;
      } else if (field.type === 'fieldarray') {
        defaults[field.name] = [{ panjang: 0, lebar: 0 }];
      } else {
        defaults[field.name] = "";
      }
    });
    
    return defaults;
  }, [config.fields]);

  const { control, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bidang",
  });

  // Watch all relevant fields
  const watchedValues = watch();

  // Check if field should be visible
  const isFieldVisible = useCallback((field: CalculatorField): boolean => {
    if (!field.visibleWhen) return true;
    
    const dependentValue = watchedValues[field.visibleWhen.field];
    return dependentValue === field.visibleWhen.value;
  }, [watchedValues]);

  // Get options for select fields (from config or master data)
  const getFieldOptions = useCallback((field: CalculatorField) => {
    // If options are defined in config
    if (field.options && field.options.length > 0) {
      return field.options;
    }
    
    // Dynamic options from master data
    if (field.name === 'panel_dinding_id' && masterData.panels) {
      return masterData.panels
        .filter(p => p.type === 'dinding')
        .map(p => ({ value: p.id.toString(), label: `${p.name} - Rp ${p.harga.toLocaleString('id-ID')}` }));
    }
    
    if (field.name === 'panel_lantai_id' && masterData.panels) {
      return masterData.panels
        .filter(p => p.type === 'lantai')
        .map(p => ({ value: p.id.toString(), label: `${p.name} - Rp ${p.harga.toLocaleString('id-ID')}` }));
    }
    
    if (field.name === 'location_kabupaten' && masterData.ongkir) {
      return masterData.ongkir.map(o => ({ 
        value: o.kabupaten || '', 
        label: o.kabupaten || o.provinsi 
      }));
    }
    
    return [];
  }, [masterData]);

  // Calculate whenever relevant values change
  useEffect(() => {
    // Build values for calculation
    const calcValues: CalculatorValues = { ...watchedValues };
    
    // Perform calculation
    const calcResult = calculate(config.id, calcValues, masterData);
    
    if (calcResult) {
      setResult(calcResult);
      onCalculate?.(calcResult);
    }
  }, [watchedValues, masterData, config.id, onCalculate]);

  // Reset form when config changes
  useEffect(() => {
    reset(getDefaultValues());
  }, [config.id]);

  // Handle checkbox toggle
  const handleCheckboxChange = useCallback((fieldName: string, checked: boolean) => {
    setValue(fieldName, checked);
  }, [setValue]);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-primary hover:underline mb-4"
        >
          <ChevronLeft size={20} />
          Kembali ke Menu
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-3 space-y-4">
          {/* Dinding Section */}
          <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Panel Dinding</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Hitung Dinding Checkbox */}
              <Controller
                name="hitung_dinding"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleCheckboxChange('hitung_dinding', e.target.checked);
                      }}
                      className="h-5 w-5 rounded text-brand-primary"
                    />
                    <span className="font-medium text-blue-800">Hitung Dinding</span>
                  </label>
                )}
              />

              {/* Dinding Fields */}
              {isFieldVisible(config.fields.find(f => f.name === 'perimeter')!) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Controller
                    name="perimeter"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-primary mb-1">
                          Panjang Perimeter (m)
                        </label>
                        <input
                          {...field}
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                          placeholder="Masukkan panjang perimeter"
                          step="0.01"
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="tinggi_lantai"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-primary mb-1">
                          Tinggi Dinding (m)
                        </label>
                        <input
                          {...field}
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                          placeholder="Masukkan tinggi dinding"
                          step="0.01"
                        />
                      </div>
                    )}
                  />
                </div>
              )}

              {isFieldVisible(config.fields.find(f => f.name === 'panel_dinding_id')!) && (
                <Controller
                  name="panel_dinding_id"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        Pilih Panel Dinding
                      </label>
                      <select
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                      >
                        <option value="">Pilih Panel Dinding</option>
                        {getFieldOptions(config.fields.find(f => f.name === 'panel_dinding_id')!).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />
              )}
            </div>
          </div>

          {/* Lantai Section */}
          <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Panel Lantai</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Hitung Lantai Checkbox */}
              <Controller
                name="hitung_lantai"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleCheckboxChange('hitung_lantai', e.target.checked);
                      }}
                      className="h-5 w-5 rounded text-brand-primary"
                    />
                    <span className="font-medium text-green-800">Hitung Lantai</span>
                  </label>
                )}
              />

              {/* Lantai Fields */}
              {isFieldVisible(config.fields.find(f => f.name === 'bidang')!) && (
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Bidang Lantai
                  </label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">Bidang {index + 1}</span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-error text-sm hover:text-error-dark flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Controller
                          name={`bidang.${index}.panjang`}
                          control={control}
                          render={({ field: fieldItem }) => (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Panjang (m)
                              </label>
                              <input
                                {...fieldItem}
                                type="number"
                                value={fieldItem.value || ""}
                                onChange={(e) => fieldItem.onChange(parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Panjang"
                                step="0.01"
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name={`bidang.${index}.lebar`}
                          control={control}
                          render={({ field: fieldItem }) => (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Lebar (m)
                              </label>
                              <input
                                {...fieldItem}
                                type="number"
                                value={fieldItem.value || ""}
                                onChange={(e) => fieldItem.onChange(parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Lebar"
                                step="0.01"
                              />
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => append({ panjang: 0, lebar: 0 })}
                    className="flex items-center gap-2 text-brand-primary font-medium text-sm mt-2"
                  >
                    <Plus size={16} />
                    Tambah Bidang
                  </button>
                </div>
              )}

              {isFieldVisible(config.fields.find(f => f.name === 'panel_lantai_id')!) && (
                <Controller
                  name="panel_lantai_id"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        Pilih Panel Lantai
                      </label>
                      <select
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                      >
                        <option value="">Pilih Panel Lantai</option>
                        {getFieldOptions(config.fields.find(f => f.name === 'panel_lantai_id')!).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />
              )}
            </div>
          </div>

          {/* Ongkir Section */}
          <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Ongkos Kirim (Opsional)</h2>
            </div>
            <div className="p-4">
              <Controller
                name="location_kabupaten"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Kabupaten Tujuan
                    </label>
                    <select
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                    >
                      <option value="">Pilih Kabupaten</option>
                      {getFieldOptions(config.fields.find(f => f.name === 'location_kabupaten')!).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {result && (
            <div className="sticky top-4">
              <CalculationResultDisplay result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Internal component for displaying calculation result
function CalculationResultDisplay({ result }: { result: CalculationResult }) {
  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  return (
    <div className="bg-surface rounded-xl shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Hasil Perhitungan</h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Luas Summary */}
        {(result.luasLantai || result.luasDinding) && (
          <div className="grid grid-cols-2 gap-2">
            {result.luasLantai && result.luasLantai > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-800 text-xs font-medium">Luas Lantai</div>
                <div className="text-xl font-bold text-green-800">
                  {result.luasLantai.toFixed(2)} m²
                </div>
              </div>
            )}
            {result.luasDinding && result.luasDinding > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-800 text-xs font-medium">Luas Dinding</div>
                <div className="text-xl font-bold text-blue-800">
                  {result.luasDinding.toFixed(2)} m²
                </div>
              </div>
            )}
          </div>
        )}

        {/* Total */}
        {result.grandTotal > 0 && (
          <div className="border-t pt-3 flex justify-between font-bold text-lg text-brand-primary">
            <span>Total</span>
            <span>{formatRupiah(result.grandTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalculatorForm;
