"use client";

import {
  UseFormReturn,
  FieldArrayWithId,
  useWatch,
  useFieldArray,
  Controller,
  FieldPath,
  FieldErrors,
} from "react-hook-form";
import { ChevronLeft, Plus, Calculator, Truck } from "lucide-react";
import { RABFormData } from "../../schemas/rabSchema";
import { useState, useEffect, useMemo } from "react";
import { useMasterData } from "../../context/MasterDataContext";
import { useWilayahData } from "../../hooks/useWilayahData";

// Reusable Form Components
interface FormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date";
  control: UseFormReturn<RABFormData>["control"];
  errors: FieldErrors<RABFormData>;
  disabled?: boolean;
  placeholder?: string;
  step?: string;
}

const FormField = ({
  name,
  label,
  type = "text",
  control,
  errors,
  disabled = false,
  placeholder,
  step,
}: FormFieldProps) => (
  <Controller
    name={name as any}
    control={control}
    render={({ field }) => (
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label}
        </label>
        <input
          {...field}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          step={step}
          value={field.value ?? ""} // Ensure controlled input always has a value
          className={`w-full p-3 border rounded-lg text-base ${
            (errors as any)[name] ? "border-red-500" : "border-gray-200"
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          aria-describedby={(errors as any)[name] ? `${name}-error` : undefined}
        />
        {(errors as any)[name] && (
          <span
            id={`${name}-error`}
            className='text-red-500 text-sm mt-1 block'
            role='alert'
          >
            {(errors as any)[name]?.message}
          </span>
        )}
      </div>
    )}
  />
);

interface FormSelectProps {
  name: string;
  label: string;
  control: UseFormReturn<RABFormData>["control"];
  errors: FieldErrors<RABFormData>;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const FormSelect = ({
  name,
  label,
  control,
  errors,
  disabled = false,
  options,
  placeholder = "Pilih opsi",
}: FormSelectProps) => (
  <Controller
    name={name as any}
    control={control}
    render={({ field }) => (
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label}
        </label>
        <select
          {...field}
          value={field.value ?? ""} // Ensure controlled select always has a value
          disabled={disabled}
          className={`w-full p-3 border rounded-lg text-base appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
            (errors as any)[name] ? "border-red-500" : "border-gray-200"
          }`}
          aria-describedby={(errors as any)[name] ? `${name}-error` : undefined}
        >
          <option value=''>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(errors as any)[name] && (
          <span
            id={`${name}-error`}
            className='text-red-500 text-sm mt-1 block'
            role='alert'
          >
            {(errors as any)[name]?.message}
          </span>
        )}
      </div>
    )}
  />
);

interface FormTextareaProps {
  name: string;
  label: string;
  control: UseFormReturn<RABFormData>["control"];
  errors: FieldErrors<RABFormData>;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}

const FormTextarea = ({
  name,
  label,
  control,
  errors,
  disabled = false,
  placeholder,
  rows = 3,
}: FormTextareaProps) => (
  <Controller
    name={name as any}
    control={control}
    render={({ field }) => (
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label}
        </label>
        <textarea
          {...field}
          value={field.value ?? ""} // Ensure controlled textarea always has a value
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={`w-full p-3 border rounded-lg text-base disabled:bg-gray-100 disabled:cursor-not-allowed ${
            (errors as any)[name] ? "border-red-500" : "border-gray-200"
          }`}
          aria-describedby={(errors as any)[name] ? `${name}-error` : undefined}
        />
        {(errors as any)[name] && (
          <span
            id={`${name}-error`}
            className='text-red-500 text-sm mt-1 block'
            role='alert'
          >
            {(errors as any)[name]?.message}
          </span>
        )}
      </div>
    )}
  />
);

interface FormCheckboxProps {
  name: string;
  description: string;
  control: UseFormReturn<RABFormData>["control"];
  errors: FieldErrors<RABFormData>;
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
    name={name as any}
    control={control}
    render={({ field }) => (
      <label className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
        <input
          type='checkbox'
          checked={field.value || false}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          disabled={disabled}
          className='h-5 w-5 rounded text-brand-primary disabled:cursor-not-allowed'
          aria-describedby={(errors as any)[name] ? `${name}-error` : undefined}
        />
        <span className='font-medium text-blue-800'>{description}</span>
        {(errors as any)[name] && (
          <span
            id={`${name}-error`}
            className='text-red-500 text-sm mt-1 block'
            role='alert'
          >
            {(errors as any)[name]?.message}
          </span>
        )}
      </label>
    )}
  />
);

interface Panel {
  id: number;
  name: string;
  harga: number;
  luas_per_lembar: number;
  type: string;
}

interface Ongkir {
  provinsi: string;
  kabupaten?: string;
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
  // Selective useWatch for performance - only watch necessary fields
  const watchedStatus = useWatch({ control, name: "status" });
  const watchedProvinsi = useWatch({ control, name: "location_provinsi" });
  const watchedKabupaten = useWatch({ control, name: "location_kabupaten" });
  const watchedHitungDinding = useWatch({ control, name: "hitung_dinding" });
  const watchedHitungLantai = useWatch({ control, name: "hitung_lantai" });
  const watchedNoRef = useWatch({ control, name: "no_ref" });
  const watchedBidang = useWatch({ control, name: "bidang" });

  // Debug logging for ongkir
  console.log("=== ONGKIR DEBUG ===");
  console.log("Provinsi:", watchedProvinsi);
  console.log("Kabupaten:", watchedKabupaten);
  console.log("Ongkir data:", ongkir);
  console.log("Condition check:", watchedKabupaten && watchedProvinsi);

  // Lazy loading hooks for wilayah data
  const { getKabupaten, loadingKabupaten } = useWilayahData();
  const [kabupatenOptions, setKabupatenOptions] = useState<string[]>([]);

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

  // Load kabupaten ketika provinsi berubah - lazy loading
  useEffect(() => {
    const loadKabupaten = async () => {
      if (watchedProvinsi) {
        try {
          const kabupatenList = await getKabupaten(watchedProvinsi);
          setKabupatenOptions(kabupatenList);

          // Reset kabupaten jika tidak valid untuk provinsi baru
          if (watchedKabupaten && !kabupatenList.includes(watchedKabupaten)) {
            setValue("location_kabupaten", "");
          }
        } catch (error) {
          console.error("Error loading kabupaten:", error);
          setKabupatenOptions([]);
          setValue("location_kabupaten", "");
        }
      } else {
        setKabupatenOptions([]);
        setValue("location_kabupaten", "");
      }
    };

    loadKabupaten();
  }, [watchedProvinsi, watchedKabupaten, getKabupaten, setValue]);

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
                {watchedNoRef}
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
                {watchedStatus === "approved" && (
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

                {watchedStatus === "sent" && (
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
                    <div className='flex items-center gap-2'>
                      <div className='text-yellow-600 text-lg'>📨</div>
                      <div>
                        <h3 className='font-medium text-yellow-800'>
                          Dokumen Terkirim
                        </h3>
                        <p className='text-yellow-700 text-sm'>
                          Dokumen sudah terkirim. Ubah status ke "Draft" untuk
                          membuat perubahan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  name='project_name'
                  label='Nama Proyek *'
                  control={control}
                  errors={errors}
                  disabled={watchedStatus === "approved"}
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
                        disabled={watchedStatus === "approved"}
                        className={`w-full p-3 border rounded-lg text-base appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.status ? "border-red-500" : "border-gray-200"
                        }`}
                        aria-describedby={
                          errors.status ? "status-error" : undefined
                        }
                        onChange={(e) => {
                          if (e.target.value === "approved") {
                            const confirmed = window.confirm(
                              "Dokumen yang sudah disetujui tidak dapat diedit atau dihapus. Apakah Anda yakin ingin menyetujui dokumen ini?"
                            );
                            if (!confirmed) {
                              setValue(
                                "status",
                                (watchedStatus || "draft") as
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
                        <span
                          id='status-error'
                          className='text-red-500 text-sm mt-1 block'
                          role='alert'
                        >
                          {errors.status.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Section Ongkos Kirim */}
            <div className='bg-white rounded-xl shadow overflow-hidden mt-4'>
              <div className='p-4 border-b'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                  <span className='text-brand-accent'>📋</span>
                  Ongkos Kirim
                </h2>
              </div>

              <div className='p-4 space-y-6'>
                {/* Location Section */}
                <div className='space-y-4'>
                  <h3 className='text-md font-medium text-gray-800'>
                    Lokasi Proyek
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <FormSelect
                      name='location_provinsi'
                      label='Provinsi *'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      options={[...new Set(ongkir.map((o) => o.provinsi))].map(
                        (provinsi) => ({
                          value: provinsi,
                          label: provinsi,
                        })
                      )}
                    />

                    <FormSelect
                      name='location_kabupaten'
                      label='Kabupaten *'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      options={kabupatenOptions.map((kabupaten) => ({
                        value: kabupaten,
                        label: kabupaten,
                      }))}
                    />

                    <FormField
                      name='location_address'
                      label='Alamat Lengkap'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      placeholder='Alamat detail proyek'
                    />
                  </div>
                </div>

                {/* Client Profile Section */}
                <div className='space-y-4'>
                  <h3 className='text-md font-medium text-gray-800'>
                    Profil Client
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      name='client_profile.nama'
                      label='Nama Client *'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      placeholder='Nama lengkap client'
                    />

                    <FormField
                      name='client_profile.no_hp'
                      label='No HP Client'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      placeholder='081234567890'
                    />

                    <FormField
                      name='client_profile.email'
                      label='Email Client'
                      type='email'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      placeholder='client@email.com'
                    />
                  </div>
                </div>

                {/* Project Profile Section */}
                <div className='space-y-4'>
                  <h3 className='text-md font-medium text-gray-800'>
                    Profil Proyek
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormSelect
                      name='project_profile.kategori'
                      label='Kategori Proyek *'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      options={[
                        { value: "residential", label: "Residential" },
                        { value: "commercial", label: "Commercial" },
                        { value: "industrial", label: "Industrial" },
                        { value: "public", label: "Public" },
                      ]}
                    />

                    <FormTextarea
                      name='project_profile.deskripsi'
                      label='Deskripsi Proyek'
                      control={control}
                      errors={errors}
                      disabled={
                        watchedStatus === "sent" || watchedStatus === "approved"
                      }
                      placeholder='Deskripsi detail proyek'
                      rows={1}
                    />
                  </div>
                </div>

                {/* Estimasi Pengiriman */}
                <div className='space-y-4'>
                  <FormField
                    name='estimasi_pengiriman'
                    label='Estimasi Pengiriman'
                    type='date'
                    control={control}
                    errors={errors}
                    disabled={
                      watchedStatus === "sent" || watchedStatus === "approved"
                    }
                  />
                </div>
              </div>
            </div>

            <div className='mt-4 space-y-4'>
              {/* Error message untuk validasi perhitungan */}
              {errors.hitung_dinding && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                  <span className='text-red-700 text-sm'>
                    {errors.hitung_dinding.message}
                  </span>
                </div>
              )}
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
                        disabled={
                          watchedStatus === "sent" ||
                          watchedStatus === "approved"
                        }
                        className='h-5 w-5 rounded text-brand-primary'
                      />
                      <span className='font-medium text-blue-800'>
                        Hitung Dinding
                      </span>
                    </label>
                  )}
                />

                {watchedHitungDinding && (
                  <div className='p-3 space-y-3 bg-white'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 '>
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
                              disabled={watchedStatus === "approved"}
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
                              disabled={watchedStatus === "approved"}
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
                            disabled={watchedStatus === "approved"}
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
                        disabled={watchedStatus === "approved"}
                        className='h-5 w-5 rounded text-brand-primary'
                      />
                      <span className='font-medium text-green-800'>
                        Hitung Lantai
                      </span>
                    </label>
                  )}
                />

                {watchedHitungLantai && (
                  <div className='p-3 space-y-3 bg-white'>
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
                                  {watchedBidang?.[i]?.panjang || 0} ×{" "}
                                  {watchedBidang?.[i]?.lebar || 0} ={" "}
                                  {(
                                    (watchedBidang?.[i]?.panjang || 0) *
                                    (watchedBidang?.[i]?.lebar || 0)
                                  ).toFixed(2)}{" "}
                                  m²
                                </span>
                                {fields.length > 1 && (
                                  <button
                                    type='button'
                                    onClick={() => remove(i)}
                                    disabled={watchedStatus === "approved"}
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
                                    disabled={watchedStatus === "approved"}
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
                                    disabled={watchedStatus === "approved"}
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
                        disabled={watchedStatus === "approved"}
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
                            disabled={watchedStatus === "approved"}
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
                {!watchedHitungDinding && !watchedHitungLantai && (
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
                {(hasil?.grandTotal || 0) > 0 && (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {(hasil?.luasLantai || 0) > 0 && (
                      <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                        <div className='text-green-800 text-sm font-medium'>
                          Luas Lantai
                        </div>
                        <div className='text-2xl font-bold text-green-900 mt-1'>
                          {hasil?.luasLantai?.toFixed(2) || 0} m²
                        </div>
                      </div>
                    )}
                    {(hasil?.luasDinding || 0) > 0 && (
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
                      {(hasil?.items?.filter((item: any) =>
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
                      {(hasil?.items?.filter((item: any) =>
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
                    </div>
                  </div>
                )}
                {/* Kebutuhan Truk - dari hasil perhitungan */}
                {hasil?.items?.some((item: any) => item.desc.includes("Angkutan Truk")) && (
                  <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
                    <h3 className='font-medium text-yellow-800 mb-2 flex items-center gap-2'>
                      <Truck size={16} />
                      Kebutuhan Truk
                    </h3>
                    <div className='space-y-2'>
                      {hasil?.items
                        ?.filter((item: any) => item.desc.includes("Angkutan Truk"))
                        .map((item: any, index: number) => (
                          <div key={index} className='text-sm'>
                            <div className='text-yellow-700'>
                              {item.desc}
                            </div>
                            <div className='text-yellow-900 font-medium'>
                              {item.qty} {item.unit} @ {formatRupiah(item.unit_price)} = {formatRupiah(item.amount)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Rincian Biaya */}
                {(hasil?.grandTotal || 0) > 0 && (
                  <div className='border-t pt-4'>
                    <h3 className='font-medium mb-3 flex items-center gap-2 text-gray-900'>
                      <Truck size={18} className='text-brand-accent' />
                      Rincian Biaya
                    </h3>
                    <div className='space-y-2 text-sm'>
                      {(hasil?.subtotalDinding || 0) > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Dinding</span>
                          <span className='font-semibold text-gray-900'>
                            {formatRupiah(hasil?.subtotalDinding || 0)}
                          </span>
                        </div>
                      )}
                      {(hasil?.subtotalLantai || 0) > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Lantai</span>
                          <span className='font-semibold text-gray-900'>
                            {formatRupiah(hasil?.subtotalLantai || 0)}
                          </span>
                        </div>
                      )}
                      {hasil?.biayaOngkir && hasil.biayaOngkir > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Angkutan Truk</span>
                          <span className='font-semibold text-gray-900'>
                            {formatRupiah(hasil.biayaOngkir)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                {(hasil?.grandTotal || 0) > 0 && (
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
