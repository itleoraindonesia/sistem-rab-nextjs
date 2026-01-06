"use client";

import {
  UseFormReturn,
  FieldArrayWithId,
  useWatch,
  useFieldArray,
  Controller,
} from "react-hook-form";
import { ChevronLeft, Plus, Calculator, Truck } from "lucide-react";
import { RABFormData } from "../../schemas/rabSchema";

interface Panel {
  id: number;
  name: string;
  harga: number;
  luas_per_lembar: number;
  type: string;
}

interface Ongkir {
  provinsi: string;
  biaya: number;
}

interface CalculationResult {
  luasDinding: number;
  luasLantai: number;
  subtotalDinding: number;
  subtotalLantai: number;
  biayaOngkir: number;
  grandTotal: number;
  items: any[];
}

interface FormRABProps {
  // Form hooks
  control: UseFormReturn<RABFormData>["control"];
  handleSubmit: UseFormReturn<RABFormData>["handleSubmit"];
  setValue: UseFormReturn<RABFormData>["setValue"];
  formState: UseFormReturn<RABFormData>["formState"];
  onSubmit: (data: RABFormData, hasil?: any) => Promise<void>;

  // Data
  panels: Panel[];
  ongkir: Ongkir[];
  hasil: CalculationResult | null;

  // Navigation
  onBack: () => void;
  title: string;
}

export default function FormRAB({
  control,
  handleSubmit,
  setValue,
  formState: { errors, isSubmitting, isValid },
  onSubmit,
  panels,
  ongkir,
  hasil,
  onBack,
  title,
}: FormRABProps) {
  // Use RHF utilities
  const watchedValues = useWatch({ control });
  const {
    fields,
    remove,
    append: tambahBidang,
  } = useFieldArray({
    control,
    name: "bidang",
  });

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  

  return (
    <div className='min-h-screen bg-gray-50 max-w-7xl mx-auto'>
      <div className='bg-green-600 border-b border-gray-200 shadow-sm lg:hidden'>
        <div className='px-4 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <button
              onClick={onBack}
              className='flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors'
            >
              <ChevronLeft size={20} />
            </button>
            <div className='flex-1 flex justify-center'>
              <div className=' text-white px-6 py-2 rounded-lg font-bold text-center text-xl min-w-30'>
                {title}
              </div>
            </div>
            <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-200  text-transparent rounded-lg font-medium transition-colors'>
              <ChevronLeft size={20} />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, hasil))}>
        <div className='p-3 md:p-4 grid grid-cols-1 lg:grid-cols-5 gap-6'>
          {/* Left Column: Form */}
          <div className='lg:col-span-3'>
            <div className='bg-white rounded-xl shadow mb-4 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-2 h-2 bg-brand-accent rounded-full'></div>
                <span className='text-xs font-medium text-brand-primary uppercase'>
                  No Ref
                </span>
              </div>
              <p className='text-lg font-mono font-bold text-gray-900'>
                {watchedValues.no_ref}
              </p>
            </div>

            <div className='bg-white rounded-xl shadow overflow-hidden'>
              <div className='p-4 border-b'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                  <span className='text-brand-accent'>📋</span>
                  Data Proyek
                </h2>
              </div>

              <div className='p-4 space-y-4'>
                {watchedValues.status === "approved" && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
                    <div className='flex items-center gap-2'>
                      <div className='text-red-600 text-lg'>🔒</div>
                      <div>
                        <h3 className='font-medium text-red-800'>
                          Dokumen Terkunci
                        </h3>
                        <p className='text-red-700 text-sm'>
                          Dokumen yang sudah disetujui tidak dapat diedit atau
                          dihapus.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {watchedValues.status === "sent" && (
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
                    <div className='flex items-center gap-2'>
                      <div className='text-yellow-600 text-lg'>📨</div>
                      <div>
                        <h3 className='font-medium text-yellow-800'>
                          Dokumen Terkirim
                        </h3>
                        <p className='text-yellow-700 text-sm'>
                          Dokumen sudah terkirim. Ubah status ke "Draft" untuk membuat perubahan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Controller
                  name='project_name'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Nama Proyek
                      </label>
                      <input
                        {...field}
                        disabled={watchedValues.status === "sent" || watchedValues.status === "approved"}
                        className={`w-full p-3 border rounded-lg text-base ${
                          errors.project_name
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      />
                      {errors.project_name && (
                        <span className='text-red-500 text-sm mt-1 block'>
                          {errors.project_name.message}
                        </span>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name='location'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Lokasi
                      </label>
                      <select
                        {...field}
                        disabled={watchedValues.status === "sent" || watchedValues.status === "approved"}
                        className={`w-full p-3 border rounded-lg text-base appearance-none bg-white ${
                          errors.location ? "border-red-500" : "border-gray-200"
                        }`}
                      >
                        <option value=''>Pilih Lokasi</option>
                        {ongkir.map((o) => (
                          <option key={o.provinsi} value={o.provinsi}>
                            {o.provinsi}
                          </option>
                        ))}
                      </select>
                      {errors.location && (
                        <span className='text-red-500 text-sm mt-1 block'>
                          {errors.location.message}
                        </span>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Status
                      </label>
                      <select
                        {...field}
                        className={`w-full p-3 border rounded-lg text-base appearance-none bg-white ${
                          errors.status ? "border-red-500" : "border-gray-200"
                        }`}
                        onChange={(e) => {
                          if (e.target.value === "approved") {
                            const confirmed = window.confirm(
                              "Dokumen yang sudah disetujui tidak dapat diedit atau dihapus. Apakah Anda yakin ingin menyetujui dokumen ini?"
                            );
                            if (!confirmed) {
                              setValue(
                                "status",
                                (watchedValues.status || "draft") as
                                  | "draft"
                                  | "sent"
                                  | "approved"
                              );
                              return;
                            }
                          }
                          field.onChange(e);
                        }}
                      >
                        <option value=''>Pilih Status</option>
                        <option value='draft'>Draft</option>
                        <option value='sent'>Terkirim</option>
                        <option value='approved'>Disetujui</option>
                      </select>
                      {errors.status && (
                        <span className='text-red-500 text-sm mt-1 block'>
                          {errors.status.message}
                        </span>
                      )}
                    </div>
                  )}
                />

                {/* Error message untuk validasi perhitungan */}
                {errors.hitung_dinding && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <span className='text-red-700 text-sm'>
                      {errors.hitung_dinding.message}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className='mt-4 space-y-4'>
              <div className='border rounded-lg overflow-hidden'>
                <Controller
                  name='hitung_dinding'
                  control={control}
                  render={({ field }) => (
                    <label className='flex items-center gap-3 p-3 bg-blue-50'>
                      <input
                        type='checkbox'
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={watchedValues.status === "sent" || watchedValues.status === "approved"}
                        className='h-5 w-5 rounded text-brand-primary'
                      />
                      <span className='font-medium text-blue-800'>
                        Hitung Dinding
                      </span>
                    </label>
                  )}
                />

                {watchedValues.hitung_dinding && (
                  <div className='p-3 space-y-3'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <Controller
                        name='perimeter'
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className='block text-xs text-gray-600 mb-1'>
                              Panjang Perimeter (m)
                            </label>
                            <input
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              disabled={watchedValues.status === "approved"}
                              type='number'
                              className={`w-full p-3 border rounded-lg text-base ${
                                errors.perimeter
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                              step='0.01'
                            />
                            {errors.perimeter && (
                              <span className='text-red-500 text-sm mt-1 block'>
                                {errors.perimeter.message}
                              </span>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name='tinggi_lantai'
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className='block text-xs text-gray-600 mb-1'>
                              Tinggi Lantai (m)
                            </label>
                            <input
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              disabled={watchedValues.status === "approved"}
                              type='number'
                              className={`w-full p-3 border rounded-lg text-base ${
                                errors.tinggi_lantai
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                              step='0.01'
                            />
                            {errors.tinggi_lantai && (
                              <span className='text-red-500 text-sm mt-1 block'>
                                {errors.tinggi_lantai.message}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <Controller
                      name='panel_dinding_id'
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className='block text-xs text-gray-600 mb-1'>
                            Panel Dinding
                          </label>
                          <select
                            {...field}
                            disabled={watchedValues.status === "approved"}
                            className={`w-full p-3 border rounded-lg text-base appearance-none bg-white ${
                              errors.panel_dinding_id
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                          >
                            <option value=''>Pilih Panel Dinding</option>
                            {panels
                              .filter((p) => p.type === "dinding")
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} - {formatRupiah(p.harga)}/lembar
                                </option>
                              ))}
                          </select>
                          {errors.panel_dinding_id && (
                            <span className='text-red-500 text-sm mt-1 block'>
                              {errors.panel_dinding_id.message}
                            </span>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className='border rounded-lg overflow-hidden'>
                <Controller
                  name='hitung_lantai'
                  control={control}
                  render={({ field }) => (
                    <label className='flex items-center gap-3 p-3 bg-green-50'>
                      <input
                        type='checkbox'
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={watchedValues.status === "approved"}
                        className='h-5 w-5 rounded text-brand-primary'
                      />
                      <span className='font-medium text-green-800'>
                        Hitung Lantai
                      </span>
                    </label>
                  )}
                />

                {watchedValues.hitung_lantai && (
                  <div className='p-3 space-y-3'>
                    <div>
                      <label className='block text-xs text-gray-600 mb-2'>
                        Bidang (Lantai)
                      </label>
                      {fields?.map((field, i) => (
                        <div key={field.id} className='mb-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium text-gray-700'>
                              Bidang {i + 1}
                            </span>
                            {fields.length > 1 && (
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-gray-500'>
                                  {watchedValues.bidang?.[i]?.panjang || 0} ×{" "}
                                  {watchedValues.bidang?.[i]?.lebar || 0} ={" "}
                                  {(
                                    (watchedValues.bidang?.[i]?.panjang || 0) *
                                    (watchedValues.bidang?.[i]?.lebar || 0)
                                  ).toFixed(2)}{" "}
                                  m²
                                </span>
                                {fields.length > 1 && (
                                  <button
                                    type='button'
                                    onClick={() => remove(i)}
                                    disabled={
                                      watchedValues.status === "approved"
                                    }
                                    className='text-red-500 text-xs hover:text-red-700'
                                  >
                                    Hapus
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <div className='grid grid-cols-2 gap-2'>
                            <Controller
                              name={`bidang.${i}.panjang`}
                              control={control}
                              render={({ field: fieldItem }) => (
                                <div>
                                  <label className='block text-xs text-gray-600 mb-1'>
                                    Panjang (m)
                                  </label>
                                  <input
                                    {...fieldItem}
                                    value={fieldItem.value || ""}
                                    onChange={(e) =>
                                      fieldItem.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    disabled={
                                      watchedValues.status === "approved"
                                    }
                                    type='number'
                                    className='w-full p-2 border border-gray-200 rounded-lg text-base'
                                    step='0.01'
                                  />
                                </div>
                              )}
                            />
                            <Controller
                              name={`bidang.${i}.lebar`}
                              control={control}
                              render={({ field: fieldItem }) => (
                                <div>
                                  <label className='block text-xs text-gray-600 mb-1'>
                                    Lebar (m)
                                  </label>
                                  <input
                                    {...fieldItem}
                                    value={fieldItem.value || ""}
                                    onChange={(e) =>
                                      fieldItem.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    disabled={
                                      watchedValues.status === "approved"
                                    }
                                    type='number'
                                    className='w-full p-2 border border-gray-200 rounded-lg text-base'
                                    step='0.01'
                                  />
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type='button'
                        onClick={() => tambahBidang({ panjang: 0, lebar: 0 })}
                        disabled={watchedValues.status === "approved"}
                        className='flex items-center gap-2 text-brand-primary font-medium'
                      >
                        <Plus size={18} />
                        Tambah Bidang
                      </button>
                    </div>

                    <Controller
                      name='panel_lantai_id'
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className='block text-xs text-gray-600 mb-1'>
                            Panel Lantai
                          </label>
                          <select
                            {...field}
                            disabled={watchedValues.status === "approved"}
                            className={`w-full p-3 border rounded-lg text-base appearance-none bg-white ${
                              errors.panel_lantai_id
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                          >
                            <option value=''>Pilih Panel Lantai</option>
                            {panels
                              .filter((p) => p.type === "lantai")
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} - {formatRupiah(p.harga)}/lembar
                                </option>
                              ))}
                          </select>
                          {errors.panel_lantai_id && (
                            <span className='text-red-500 text-sm mt-1 block'>
                              {errors.panel_lantai_id.message}
                            </span>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className='lg:col-span-2'>
            {/* Hasil Hitung */}
            <div className='bg-white rounded-xl shadow overflow-hidden'>
              <div className='p-4 border-b bg-gray-50'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                  <Calculator size={20} className='text-brand-accent' />
                  Hasil Perhitungan
                </h2>
              </div>

              <div className='p-4 space-y-4'>
                {/* Info message */}
                {!watchedValues.hitung_dinding &&
                  !watchedValues.hitung_lantai && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                      <div className='flex items-center gap-2'>
                        <Calculator className='text-blue-600' size={20} />
                        <div>
                          <h3 className='font-medium text-blue-800'>
                            Pilih Jenis Perhitungan
                          </h3>
                          <p className='text-blue-700 text-sm'>
                            Centang "Hitung Dinding" atau "Hitung Lantai" untuk
                            melihat hasil perhitungan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Luas summary */}
                {(watchedValues.hitung_lantai ||
                  watchedValues.hitung_dinding) && (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {watchedValues.hitung_lantai && (
                      <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                        <div className='text-green-800 text-sm font-medium'>
                          Luas Lantai
                        </div>
                        <div className='text-2xl font-bold text-green-900 mt-1'>
                          {hasil?.luasLantai?.toFixed(2) || 0} m²
                        </div>
                      </div>
                    )}
                    {watchedValues.hitung_dinding && (
                      <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                        <div className='text-blue-800 text-sm font-medium'>
                          Luas Dinding
                        </div>
                        <div className='text-2xl font-bold text-blue-900 mt-1'>
                          {hasil?.luasDinding?.toFixed(2) || 0} m²
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Detail Perhitungan */}
                {(hasil?.grandTotal || 0) > 0 && (
                  <div className='bg-gray-50 p-3 rounded-lg border border-gray-200'>
                    <h3 className='font-medium mb-2 flex items-center gap-2 text-gray-900'>
                      <Calculator size={16} />
                      Detail Perhitungan
                    </h3>
                    <div className='space-y-4'>
                      {/* Dinding */}
                      {watchedValues.hitung_dinding &&
                        (hasil?.items?.filter((item: any) =>
                          item.desc.includes("Dinding")
                        )?.length || 0) > 0 && (
                          <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                            <h4 className='font-medium text-blue-800 mb-2'>
                              Dinding Panel
                            </h4>
                            <div className='space-y-2'>
                              {hasil?.items
                                ?.filter((item: any) =>
                                  item.desc.includes("Dinding")
                                )
                                .map((item: any, index: number) => (
                                  <div key={index} className='text-sm'>
                                    <div className='text-blue-700'>
                                      {item.desc}
                                    </div>
                                    <div className='text-blue-900 font-medium'>
                                      {item.qty} {item.unit || "lembar"} @{" "}
                                      {formatRupiah(item.unit_price)} ={" "}
                                      {formatRupiah(item.amount)}
                                    </div>
                                  </div>
                                ))}
                              <div className='border-t pt-2 flex justify-between font-semibold text-blue-800'>
                                <span>Subtotal Dinding</span>
                                <span>
                                  {formatRupiah(hasil?.subtotalDinding || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      {/* Lantai */}
                      {watchedValues.hitung_lantai &&
                        (hasil?.items?.filter((item: any) =>
                          item.desc.includes("Lantai")
                        )?.length || 0) > 0 && (
                          <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                            <h4 className='font-medium text-green-800 mb-2'>
                              Lantai Panel
                            </h4>
                            <div className='space-y-2'>
                              {hasil?.items
                                ?.filter((item: any) =>
                                  item.desc.includes("Lantai")
                                )
                                .map((item: any, index: number) => (
                                  <div key={index} className='text-sm'>
                                    <div className='text-green-700'>
                                      {item.desc}
                                    </div>
                                    <div className='text-green-900 font-medium'>
                                      {item.qty} {item.unit || "lembar"} @{" "}
                                      {formatRupiah(item.unit_price)} ={" "}
                                      {formatRupiah(item.amount)}
                                    </div>
                                  </div>
                                ))}
                              <div className='border-t pt-2 flex justify-between font-semibold text-green-800'>
                                <span>Subtotal Lantai</span>
                                <span>
                                  {formatRupiah(hasil?.subtotalLantai || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      {/* Ongkir */}
                      {hasil?.items?.some((item: any) =>
                        item.desc.includes("Ongkos Kirim")
                      ) && (
                        <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
                          <h4 className='font-medium text-yellow-800 mb-2'>
                            Ongkos Kirim
                          </h4>
                          <div className='space-y-2'>
                            {hasil.items
                              ?.filter((item: any) =>
                                item.desc.includes("Ongkos Kirim")
                              )
                              .map((item: any, index: number) => (
                                <div key={index} className='text-sm'>
                                  <div className='text-yellow-700'>
                                    {item.desc}
                                  </div>
                                  <div className='text-yellow-900 font-medium'>
                                    {item.qty} unit @{" "}
                                    {formatRupiah(item.unit_price)} ={" "}
                                    {formatRupiah(item.amount)}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rincian Biaya */}
                {(watchedValues.hitung_dinding ||
                  watchedValues.hitung_lantai) && (
                  <div className='border-t pt-4'>
                    <h3 className='font-medium mb-3 flex items-center gap-2 text-gray-900'>
                      <Truck size={18} className='text-brand-accent' />
                      Rincian Biaya
                    </h3>
                    <div className='space-y-2 text-sm'>
                      {watchedValues.hitung_dinding &&
                        (hasil?.subtotalDinding || 0) > 0 && (
                          <div className='flex justify-between'>
                            <span className='text-gray-700'>Dinding</span>
                            <span className='font-semibold text-gray-900'>
                              {formatRupiah(hasil?.subtotalDinding || 0)}
                            </span>
                          </div>
                        )}
                      {watchedValues.hitung_lantai &&
                        (hasil?.subtotalLantai || 0) > 0 && (
                          <div className='flex justify-between'>
                            <span className='text-gray-700'>Lantai</span>
                            <span className='font-semibold text-gray-900'>
                              {formatRupiah(hasil?.subtotalLantai || 0)}
                            </span>
                          </div>
                        )}
                      {(hasil?.biayaOngkir || 0) > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Ongkos Kirim</span>
                          <span className='font-semibold text-gray-900'>
                            {formatRupiah(hasil?.biayaOngkir || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                {(watchedValues.hitung_dinding ||
                  watchedValues.hitung_lantai) && (
                  <div className='border-t pt-3 flex justify-between font-bold text-lg text-brand-primary'>
                    <span>Total</span>
                    <span>{formatRupiah(hasil?.grandTotal || 0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className='mt-4 hidden md:block'>
              <button
                type='submit'
                disabled={isSubmitting || !isValid}
                className='w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
