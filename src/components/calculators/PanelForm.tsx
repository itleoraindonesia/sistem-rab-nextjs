"use client";

import { Controller } from "react-hook-form";
import { ChevronLeft, Calculator, Plus, Trash2, Truck } from "lucide-react";

// Reusable Form Components adapted from FormRAB
interface FormFieldProps {
  name: string;
  label: string;
  control: any;
  errors: any;
  type?: "text" | "number";
  placeholder?: string;
  step?: string;
  disabled?: boolean;
}

const FormField = ({
  name,
  label,
  control,
  errors,
  type = "text",
  placeholder,
  step,
  disabled = false,
}: FormFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <div className="w-full">
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
        </label>
        <input
          {...field}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          step={step}
          value={field.value || ""}
          className={`w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors[name]
              ? "border-error focus:ring-error/20 bg-error-surface/30"
              : "border-gray-300 focus:ring-brand-primary/60 bg-surface hover:bg-surface-secondary"
          }`}
        />
        {errors[name] && (
          <span className="text-error text-sm mt-1 block" role="alert">
            {errors[name].message}
          </span>
        )}
      </div>
    )}
  />
);

interface FormSelectProps {
  name: string;
  label: string;
  control: any;
  errors: any;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

const FormSelect = ({
  name,
  label,
  control,
  errors,
  options,
  disabled = false,
}: FormSelectProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <div className="w-full">
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
        </label>
        <select
          {...field}
          disabled={disabled}
          value={field.value || ""}
          className={`w-full px-3 py-2 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors[name]
              ? "border-error focus:ring-error/20 bg-error-surface/30"
              : "border-gray-300 focus:ring-brand-primary/60 bg-surface hover:bg-surface-secondary"
          }`}
        >
          <option value="">Pilih opsi</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors[name] && (
          <span className="text-error text-sm mt-1 block" role="alert">
            {errors[name].message}
          </span>
        )}
      </div>
    )}
  />
);

interface FormCheckboxProps {
  name: string;
  description: string;
  control: any;
  errors: any;
  disabled?: boolean;
}

const FormCheckbox = ({
  name,
  description,
  control,
  errors,
  disabled = false,
}: FormCheckboxProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <label className="flex items-center gap-3 p-3 bg-info-surface rounded-lg border border-info">
        <input
          type="checkbox"
          checked={field.value || false}
          onChange={(e) => field.onChange(e.target.checked)}
          disabled={disabled}
          className="h-5 w-5 rounded text-brand-primary"
        />
        <span className="font-medium text-info-darker">{description}</span>
        {errors[name] && (
          <span className="text-error text-sm mt-1 block" role="alert">
            {errors[name].message}
          </span>
        )}
      </label>
    )}
  />
);

interface PanelFormProps {
  control: any;
  setValue: any;
  result: any;
  panels: any[];
  ongkir: any[];
  loading: boolean;
  fields: any[];
  append: (entry?: any) => void;
  remove: (index: number) => void;
  panelDindingOptions: Array<{ value: string; label: string }>;
  panelLantaiOptions: Array<{ value: string; label: string }>;
  ongkirOptions: Array<{ value: string; label: string }>;
  watchedHitungDinding: boolean;
  watchedHitungLantai: boolean;
  onBack: () => void;
}

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

export default function PanelForm({
  control,
  setValue,
  result,
  panels,
  ongkir,
  loading,
  fields,
  append,
  remove,
  panelDindingOptions,
  panelLantaiOptions,
  ongkirOptions,
  watchedHitungDinding,
  watchedHitungLantai,
  onBack,
}: PanelFormProps) {
  return (
    <div className="min-h-screen bg-surface-secondary max-w-7xl mx-auto pb-20 md:pb-4">
      {/* Mobile Header */}
      <div className="bg-success border-b border-gray-300 shadow-sm lg:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover text-secondary rounded-lg font-medium transition-colors"
            >
              <ChevronLeft size={20} />
              Kembali
            </button>
            <div className="flex-1 flex justify-center">
              <div className=" text-inverse px-6 py-2 rounded-lg font-bold text-center text-xl min-w-30">
                Kalkulator Panel Lantai & Dinding
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-surface-hover  text-transparent rounded-lg font-medium transition-colors">
              <ChevronLeft size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-3">
          {/* Dinding Section */}
          <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Panel Dinding
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <FormCheckbox
                name="hitung_dinding"
                description="Hitung Dinding"
                control={control}
                errors={{}}
              />

              {watchedHitungDinding && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      name="perimeter"
                      label="Panjang Perimeter (m)"
                      type="number"
                      control={control}
                      errors={{}}
                      placeholder="Masukkan panjang perimeter"
                      step="0.01"
                    />
                    <FormField
                      name="tinggi_lantai"
                      label="Tinggi Dinding (m)"
                      type="number"
                      control={control}
                      errors={{}}
                      placeholder="Masukkan tinggi dinding"
                      step="0.01"
                    />
                  </div>

                  <FormSelect
                    name="panel_dinding_id"
                    label="Pilih Panel Dinding"
                    control={control}
                    errors={{}}
                    options={panelDindingOptions}
                  />
                </>
              )}
            </div>
          </div>

          {/* Lantai Section */}
          <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden mt-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Panel Lantai
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <FormCheckbox
                name="hitung_lantai"
                description="Hitung Lantai"
                control={control}
                errors={{}}
              />

              {watchedHitungLantai && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Bidang Lantai
                    </label>
                    {fields.map((field, index) => (
                      <div key={field.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">
                            Bidang {index + 1}
                          </span>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-error text-sm hover:text-error-dark"
                            >
                              <Trash2 size={14} />
                              Hapus
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            name={`bidang.${index}.panjang`}
                            label=""
                            type="number"
                            control={control}
                            errors={{}}
                            placeholder="Panjang (m)"
                            step="0.01"
                          />
                          <FormField
                            name={`bidang.${index}.lebar`}
                            label=""
                            type="number"
                            control={control}
                            errors={{}}
                            placeholder="Lebar (m)"
                            step="0.01"
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

                  <FormSelect
                    name="panel_lantai_id"
                    label="Pilih Panel Lantai"
                    control={control}
                    errors={{}}
                    options={panelLantaiOptions}
                  />
                </>
              )}
            </div>
          </div>

          {/* Ongkir Section */}
          <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden mt-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck size={20} className="text-primary" />
                Ongkos Kirim (Opsional)
              </h2>
            </div>
            <div className="p-4">
              <FormSelect
                name="location_kabupaten"
                label="Kabupaten Tujuan"
                control={control}
                errors={{}}
                options={ongkirOptions}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:flex-1">
          <div className="bg-surface rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calculator size={20} className="text-brand-accent" />
                Hasil Perhitungan
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Info message */}
              {!watchedHitungDinding && !watchedHitungLantai && (
                <div className="border border-red-200 rounded-lg p-4 mb-4 bg-red-50">
                  <div className="flex items-center gap-2">
                    <Calculator className="text-red-600" size={20} />
                    <div>
                      <h3 className="font-medium text-red-800">Pilih Jenis Perhitungan</h3>
                      <p className="text-red-700 text-sm">
                        Centang "Hitung Dinding" atau "Hitung Lantai" untuk melihat hasil perhitungan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Luas summary */}
              {(result?.grandTotal || 0) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(result?.luasLantai || 0) > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-green-800 text-sm font-medium">
                        Luas Lantai
                      </div>
                      <div className="text-2xl font-bold text-green-800 mt-1">
                        {result?.luasLantai?.toFixed(2)} m²
                      </div>
                    </div>
                  )}
                  {(result?.luasDinding || 0) > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-blue-800 text-sm font-medium">
                        Luas Dinding
                      </div>
                      <div className="text-2xl font-bold text-blue-800 mt-1">
                        {result?.luasDinding?.toFixed(2)} m²
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detail Perhitungan */}
              {(result?.grandTotal || 0) > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-900">
                    <Calculator size={16} />
                    Detail Perhitungan
                  </h3>
                  <div className="space-y-4">
                    {/* Dinding */}
                    {(result?.items?.filter((item: any) =>
                      item.desc.includes("Dinding")
                    )?.length || 0) > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Panel Dinding</h4>
                        <div className="space-y-2">
                          {result?.items
                            ?.filter((item: any) =>
                              item.desc.includes("Dinding")
                            )
                            .map((item: any, index: number) => (
                              <div key={index} className="text-base">
                                <div className="text-blue-700">{item.desc}</div>
                                <div className="text-blue-800 font-medium text-base">
                                  {item.qty} {item.unit || "lembar"} @ {formatRupiah(item.unit_price)} = {formatRupiah(item.amount)}
                                </div>
                              </div>
                            ))}
                          <div className="border-t border-blue-300 pt-2 flex justify-between font-semibold text-blue-800">
                            <span>Subtotal Dinding</span>
                            <span>{formatRupiah(result?.subtotalDinding || 0)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Lantai */}
                    {(result?.items?.filter((item: any) =>
                      item.desc.includes("Lantai")
                    )?.length || 0) > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">Panel Lantai</h4>
                        <div className="space-y-2">
                          {result?.items
                            ?.filter((item: any) =>
                              item.desc.includes("Lantai")
                            )
                            .map((item: any, index: number) => (
                              <div key={index} className="text-base">
                                <div className="text-green-700">{item.desc}</div>
                                <div className="text-green-800 font-medium text-base">
                                  {item.qty} {item.unit || "lembar"} @ {formatRupiah(item.unit_price)} = {formatRupiah(item.amount)}
                                </div>
                              </div>
                            ))}
                          <div className="border-t border-green-300 pt-2 flex justify-between font-semibold text-green-800">
                            <span>Subtotal Lantai</span>
                            <span>{formatRupiah(result?.subtotalLantai || 0)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kebutuhan Truk */}
              {result?.items?.some((item: any) =>
                item.desc.includes("Angkutan Truk")
              ) && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Truck size={16} />
                    Kebutuhan Truk
                  </h3>
                  <div className="space-y-2">
                    {result?.items
                      ?.filter((item: any) => item.desc.includes("Angkutan Truk"))
                      .map((item: any, index: number) => (
                        <div key={index} className="text-base">
                          <div className="text-yellow-700">{item.desc}</div>
                          <div className="text-yellow-800 font-medium text-base">
                            {item.qty} {item.unit} @ {formatRupiah(item.unit_price)} = {formatRupiah(item.amount)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {result?.grandTotal > 0 && (
                <div className="border-t pt-3 flex justify-between font-bold text-xl text-brand-primary">
                  <span>Total</span>
                  <span className="text-2xl">{formatRupiah(result.grandTotal)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}