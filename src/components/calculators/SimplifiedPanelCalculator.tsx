"use client";

import { Controller, useFieldArray } from "react-hook-form";
import { ChevronLeft, Calculator, Plus, Trash2, Truck, Boxes } from "lucide-react";
import { usePanelCalculator } from "@/hooks/usePanelCalculator";
import { useMasterData } from "@/context/MasterDataContext";
import LoadingState from "@/components/form/LoadingState";
import { useRouter } from "next/navigation";

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

export default function SimplifiedPanelCalculator() {
  const router = useRouter();
  const { panels, ongkir, loading: masterLoading } = useMasterData();
  const {
    control,
    result,
    watchedHitungDinding,
    watchedHitungLantai,
    watchedProvinsi,
    watchedKabupaten,
    filteredKabupatenOptions,
  } = usePanelCalculator();

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "bidang",
  });

  if (masterLoading) {
    return <LoadingState />;
  }

  return (
    <>
      {/* Mobile Header - Same as FormRAB */}
      <div className="bg-success border-b border-gray-300 shadow-sm lg:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover text-secondary rounded-lg font-medium transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 flex justify-center">
              <div className="text-inverse px-6 py-2 rounded-lg font-bold text-center text-xl min-w-30">
                Kalkulator Panel
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-surface-hover text-transparent rounded-lg font-medium transition-colors">
              <ChevronLeft size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="px-4 py-6 border-b border-gray-200 bg-surface">
        <h1 className="text-2xl font-bold text-primary">Kalkulator Panel Lantai & Dinding</h1>
        <p className="text-sm text-green-600 mt-1 font-medium">Hitung kebutuhan panel untuk proyek Anda</p>
      </div>

      <form>
        <div className="p-2 md:p-3 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Calculator */}
          <div className="lg:col-span-8 space-y-4">
            {/* Hitung Panel Section - Wrapper for both checkboxes */}
            <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Boxes size={20} className="text-primary" />
                  Hitung Panel
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Hitung Dinding Checkbox */}
                <Controller
                  name="hitung_dinding"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 p-2 bg-info-surface rounded-lg border border-info cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-5 w-5 rounded text-brand-primary"
                      />
                      <span className="font-medium text-info-darker">Hitung Dinding</span>
                    </label>
                  )}
                />

                {/* Hitung Dinding Inputs */}
                {watchedHitungDinding && (
                  <div className="space-y-3 pl-6 border-l-2 border-info ml-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Controller
                        name="perimeter"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-xs font-medium text-green-700 mb-1">
                              Panjang Perimeter (m)
                            </label>
                            <input
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              type="number"
                              className="w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface hover:bg-surface-secondary border-gray-300 focus:ring-brand-primary/60"
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
                            <label className="block text-xs font-medium text-green-700 mb-1">
                              Tinggi Dinding (m)
                            </label>
                            <input
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              type="number"
                              className="w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface hover:bg-surface-secondary border-gray-300 focus:ring-brand-primary/60"
                              step="0.01"
                            />
                          </div>
                        )}
                      />
                    </div>

                    <Controller
                      name="panel_dinding_id"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-xs font-medium text-green-700 mb-1">
                            Panel Dinding
                          </label>
                          <select
                            {...field}
                            className="w-full p-3 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface hover:bg-surface-secondary border-gray-300 focus:ring-brand-primary/60"
                          >
                            <option value="">Pilih Panel Dinding</option>
                            {panels
                              .filter((p) => p.type === "dinding")
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} - Rp {p.harga.toLocaleString()}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    />
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Hitung Lantai Checkbox */}
                <Controller
                  name="hitung_lantai"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 p-2 bg-info-surface rounded-lg border border-info cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-5 w-5 rounded text-brand-primary"
                      />
                      <span className="font-medium text-info-darker">Hitung Lantai</span>
                    </label>
                  )}
                />

                {/* Hitung Lantai Inputs */}
                {watchedHitungLantai && (
                  <div className="space-y-3 pl-6 border-l-2 border-info ml-2">
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-2">
                        Bidang
                      </label>
                      {fields.map((field, index) => (
                        <div key={field.id} className="mb-3 p-3 border rounded-lg bg-surface-secondary">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-primary">Bidang {index + 1}</span>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-error text-sm flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                                Hapus
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Controller
                              name={`bidang.${index}.panjang`}
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Panjang (m)</label>
                                  <input
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    type="number"
                                    className="w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface border-gray-300 focus:ring-brand-primary/60"
                                    step="0.01"
                                  />
                                </div>
                              )}
                            />
                            <Controller
                              name={`bidang.${index}.lebar`}
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Lebar (m)</label>
                                  <input
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    type="number"
                                    className="w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface border-gray-300 focus:ring-brand-primary/60"
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

                    <Controller
                      name="panel_lantai_id"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-xs font-medium text-green-700 mb-1">
                            Panel Lantai
                          </label>
                          <select
                            {...field}
                            className="w-full p-3 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface hover:bg-surface-secondary border-gray-300 focus:ring-brand-primary/60"
                          >
                            <option value="">Pilih Panel Lantai</option>
                            {panels
                              .filter((p) => p.type === "lantai")
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} - Rp {p.harga.toLocaleString()}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ongkir Section */}
            <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Truck size={20} className="text-primary" />
                  Ongkos Kirim (Opsional)
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <Controller
                  name="location_provinsi"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">
                        Provinsi
                      </label>
                      <select
                        {...field}
                        className="w-full p-3 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface hover:bg-surface-secondary border-gray-300 focus:ring-brand-primary/60"
                      >
                        <option value="">Pilih Provinsi</option>
                        {[...new Set(ongkir.map((o) => o.provinsi))].map((provinsi) => (
                          <option key={provinsi} value={provinsi}>
                            {provinsi}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />

                <Controller
                  name="location_kabupaten"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">
                        Kabupaten
                      </label>
                      <select
                        {...field}
                        disabled={!watchedProvinsi}
                        className="w-full p-3 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-surface hover:bg-surface-secondary border-gray-300 focus:ring-brand-primary/60 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">{watchedProvinsi ? 'Pilih Kabupaten' : 'Pilih Provinsi Dulu'}</option>
                        {filteredKabupatenOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      {watchedKabupaten && filteredKabupatenOptions.find(o => o.value === watchedKabupaten)?.biaya && (
                        <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm text-green-700">Biaya per truk: </span>
                          <span className="font-semibold text-green-800">
                            Rp {filteredKabupatenOptions.find(o => o.value === watchedKabupaten)?.biaya?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Results Sidebar */}
          <div className="lg:col-span-4">
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
                    {watchedHitungLantai && (result?.luasLantai || 0) > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-green-800 text-sm font-medium">Luas Lantai</div>
                        <div className="text-2xl font-bold text-green-800 mt-1">
                          {result?.luasLantai?.toFixed(2)} m²
                        </div>
                      </div>
                    )}
                    {watchedHitungDinding && (result?.luasDinding || 0) > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-blue-800 text-sm font-medium">Luas Dinding</div>
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
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-900">
                      <Calculator size={14} />
                      Detail Perhitungan
                    </h3>
                    <div className="space-y-4">
                      {/* Dinding */}
                      {watchedHitungDinding && (result?.items?.filter((item: any) =>
                        item.desc.includes("Dinding")
                      )?.length || 0) > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-2">Panel Dinding</h4>
                          <div className="space-y-2">
                            {result?.items
                              ?.filter((item: any) => item.desc.includes("Dinding"))
                              .map((item: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <div className="text-blue-700">{item.desc}</div>
                                  <div className="text-blue-800 font-medium">
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
                      {watchedHitungLantai && (result?.items?.filter((item: any) =>
                        item.desc.includes("Lantai")
                      )?.length || 0) > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Panel Lantai</h4>
                          <div className="space-y-2">
                            {result?.items
                              ?.filter((item: any) => item.desc.includes("Lantai"))
                              .map((item: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <div className="text-green-700">{item.desc}</div>
                                  <div className="text-green-800 font-medium">
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
                      {/* Ongkir */}
                      {(result?.biayaOngkir || 0) > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                            <Truck size={16} />
                            Ongkos Kirim
                          </h4>
                          <div className="space-y-2">
                            {result?.items
                              ?.filter((item: any) => item.desc.includes("Angkutan"))
                              .map((item: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <div className="text-yellow-700">{item.desc}</div>
                                  <div className="text-yellow-800 font-medium">
                                    {item.qty} {item.unit} @ {formatRupiah(item.unit_price)} = {formatRupiah(item.amount)}
                                  </div>
                                </div>
                              ))}
                            <div className="border-t border-yellow-300 pt-2 flex justify-between font-semibold text-yellow-800">
                              <span>Subtotal Ongkir</span>
                              <span>{formatRupiah(result?.biayaOngkir || 0)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                {(result?.grandTotal || 0) > 0 && (
                  <div className="border-t pt-3 flex justify-between font-bold text-base text-brand-primary">
                    <span>Total</span>
                    <span className="text-lg">{formatRupiah(result?.grandTotal || 0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
