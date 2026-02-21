"use client";

import { useState, useRef } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { ChevronLeft, Calculator, Plus, Trash2, Truck, Boxes, Code, Copy, X, ExternalLink, FileText, Image, Check, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
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
  const exportRef = useRef<HTMLDivElement>(null);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
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

  // Watch values for formula display
  const watchedPerimeter = useWatch({ control, name: 'perimeter' });
  const watchedTinggi = useWatch({ control, name: 'tinggi_lantai' });
  const watchedBidang = useWatch({ control, name: 'bidang' });

  // Generate formula text for lantai (sum of all bidang)
  const getLantaiFormula = () => {
    if (!watchedBidang || watchedBidang.length === 0) return '';
    if (watchedBidang.length === 1) {
      const b = watchedBidang[0];
      return `${b?.panjang || 0} m × ${b?.lebar || 0} m`;
    }
    // Multiple bidang - show each calculation
    return watchedBidang.map((b: any, i: number) => 
      `(${b?.panjang || 0} × ${b?.lebar || 0})`
    ).join(' + ');
  };

  const embedUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/embed/kalkulator-harga/panel`
    : '/embed/kalkulator-harga/panel';

  const elementorCode = `<iframe 
  src="${embedUrl}"
  width="100%" 
  frameborder="0"
  id="panel-calculator"
  style="min-height: 800px;"
></iframe>

<script>
window.addEventListener('message', (e) => {
  if (e.data.type === 'resize') {
    document.getElementById('panel-calculator').style.height = 
      e.data.height + 'px';
  }
});
<\/script>`;

  const copyToClipboard = async (text: string, type: 'url' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate text format for copying
  const generateTextResult = () => {
    if (!result || result.grandTotal === 0) return '';
    
    const lines: string[] = [];
    lines.push('=== HASIL PERHITUNGAN PANEL ===');
    lines.push(`Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    lines.push('');
    
    if (watchedHitungDinding && result.luasDinding) {
      lines.push('--- PANEL DINDING ---');
      lines.push(`Luas Dinding: ${result.luasDinding.toFixed(2)} m²`);
      result.items?.filter((item: any) => item.desc.includes('Dinding')).forEach((item: any) => {
        lines.push(`${item.desc}: ${item.qty} ${item.unit || 'lembar'} @ ${formatRupiah(item.unit_price)} = ${formatRupiah(item.amount)}`);
      });
      lines.push(`Subtotal Dinding: ${formatRupiah(result.subtotalDinding || 0)}`);
      lines.push('');
    }
    
    if (watchedHitungLantai && result.luasLantai) {
      lines.push('--- PANEL LANTAI ---');
      lines.push(`Luas Lantai: ${result.luasLantai.toFixed(2)} m²`);
      result.items?.filter((item: any) => item.desc.includes('Lantai')).forEach((item: any) => {
        lines.push(`${item.desc}: ${item.qty} ${item.unit || 'lembar'} @ ${formatRupiah(item.unit_price)} = ${formatRupiah(item.amount)}`);
      });
      lines.push(`Subtotal Lantai: ${formatRupiah(result.subtotalLantai || 0)}`);
      lines.push('');
    }
    
    if (result.biayaOngkir && result.biayaOngkir > 0) {
      lines.push('--- ONGKOS KIRIM ---');
      result.items?.filter((item: any) => item.desc.includes('Angkutan')).forEach((item: any) => {
        lines.push(`${item.desc}: ${item.qty} ${item.unit} @ ${formatRupiah(item.unit_price)} = ${formatRupiah(item.amount)}`);
      });
      lines.push(`Subtotal Ongkir: ${formatRupiah(result.biayaOngkir)}`);
      lines.push('');
    }
    
    lines.push('================================');
    lines.push(`TOTAL: ${formatRupiah(result.grandTotal)}`);
    
    return lines.join('\n');
  };

  const handleCopyAsText = async () => {
    const text = generateTextResult();
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleCopyAsImage = async () => {
    if (!exportRef.current || isCopyingImage) return;
    
    setIsCopyingImage(true);
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2000);
          } catch (err) {
            console.error('Failed to copy image to clipboard:', err);
          }
        }
        setIsCopyingImage(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to capture image:', err);
      setIsCopyingImage(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Kalkulator Panel Lantai & Dinding</h1>
            <p className="text-sm text-green-600 mt-1 font-medium">Hitung kebutuhan panel untuk proyek Anda</p>
          </div>
          <button
            onClick={() => setIsEmbedModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-dark transition-colors shadow-sm"
          >
            <Code size={18} />
            <span>Embed</span>
          </button>
        </div>
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
                    <label className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-5 w-5 rounded text-blue-600"
                      />
                      <span className="font-medium text-blue-800">Hitung Dinding</span>
                    </label>
                  )}
                />

                {/* Hitung Dinding Inputs */}
                {watchedHitungDinding && (
                  <div className="space-y-3 pl-6 border-l-2 border-blue-300 ml-2">
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
                    <label className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-5 w-5 rounded text-green-600"
                      />
                      <span className="font-medium text-green-800">Hitung Lantai</span>
                    </label>
                  )}
                />

                {/* Hitung Lantai Inputs */}
                {watchedHitungLantai && (
                  <div className="space-y-3 pl-6 border-l-2 border-green-300 ml-2">
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

                {/* Copy Buttons */}
                {(result?.grandTotal || 0) > 0 && (
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={handleCopyAsText}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        copiedText
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {copiedText ? (
                        <>
                          <Check size={18} />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <FileText size={18} />
                          <span>Copy as Text</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAsImage}
                      disabled={isCopyingImage}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        copiedImage
                          ? 'bg-green-600 text-white'
                          : isCopyingImage
                          ? 'bg-brand-primary/70 text-white cursor-wait'
                          : 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                      }`}
                    >
                      {copiedImage ? (
                        <>
                          <Check size={18} />
                          <span>Tersalin!</span>
                        </>
                      ) : isCopyingImage ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Copying...</span>
                        </>
                      ) : (
                        <>
                          <Image size={18} />
                          <span>Copy as Image</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Hidden Export Container for Image Capture */}
      <div
        ref={exportRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '600px',
          backgroundColor: '#ffffff',
          padding: '32px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '3px solid #16a34a', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img 
              src="/Logo-Leora-PNG.png" 
              alt="LEORA Logo" 
              crossOrigin="anonymous"
              style={{ height: '48px', width: 'auto' }}
            />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>ESTIMASI PERHITUNGAN BIAYA</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {(result?.grandTotal || 0) > 0 && (
          <>
            {/* Luas Summary */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {watchedHitungLantai && (result?.luasLantai || 0) > 0 && (
                <div style={{ flex: 1, backgroundColor: '#f0fdf4', padding: '4px 16px 16px 16px', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#166534' }}>Luas Lantai</div>
                  <div style={{ fontSize: '11px', color: '#15803d' }}>{getLantaiFormula()}</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#166534' }}>{result?.luasLantai?.toFixed(2)} m²</div>
                </div>
              )}
              {watchedHitungDinding && (result?.luasDinding || 0) > 0 && (
                <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '4px 16px 16px 16px', borderRadius: '8px', border: '1px solid #93c5fd', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#1e40af' }}>Luas Dinding</div>
                  <div style={{ fontSize: '11px', color: '#1d4ed8' }}>{watchedPerimeter || 0} m × {watchedTinggi || 0} m</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af' }}>{result?.luasDinding?.toFixed(2)} m²</div>
                </div>
              )}
            </div>

            {/* Dinding Details */}
            {watchedHitungDinding && (result?.items?.filter((item: any) => item.desc.includes('Dinding'))?.length || 0) > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #dbeafe' }}>
                  Panel Dinding
                </div>
                {result?.items?.filter((item: any) => item.desc.includes('Dinding')).map((item: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
                    <span>{item.desc}</span>
                    <span>{item.qty} {item.unit || 'lembar'} @ {formatRupiah(item.unit_price)} = <strong>{formatRupiah(item.amount)}</strong></span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#1e40af', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #93c5fd' }}>
                  <span>Subtotal Dinding</span>
                  <span>{formatRupiah(result?.subtotalDinding || 0)}</span>
                </div>
              </div>
            )}

            {/* Lantai Details */}
            {watchedHitungLantai && (result?.items?.filter((item: any) => item.desc.includes('Lantai'))?.length || 0) > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #dcfce7' }}>
                  Panel Lantai
                </div>
                {result?.items?.filter((item: any) => item.desc.includes('Lantai')).map((item: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
                    <span>{item.desc}</span>
                    <span>{item.qty} {item.unit || 'lembar'} @ {formatRupiah(item.unit_price)} = <strong>{formatRupiah(item.amount)}</strong></span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#166534', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #86efac' }}>
                  <span>Subtotal Lantai</span>
                  <span>{formatRupiah(result?.subtotalLantai || 0)}</span>
                </div>
              </div>
            )}

            {/* Ongkir Details */}
            {(result?.biayaOngkir || 0) > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #fef3c7' }}>
                  Ongkos Kirim
                </div>
                {result?.items?.filter((item: any) => item.desc.includes('Angkutan')).map((item: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
                    <span>{item.desc}</span>
                    <span>{item.qty} {item.unit} @ {formatRupiah(item.unit_price)} = <strong>{formatRupiah(item.amount)}</strong></span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#92400e', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #fcd34d' }}>
                  <span>Subtotal Ongkir</span>
                  <span>{formatRupiah(result?.biayaOngkir || 0)}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '4px 16px 16px 16px', borderRadius: '8px', border: '2px solid #16a34a', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#166534' }}>TOTAL</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{formatRupiah(result?.grandTotal || 0)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Embed Modal */}
      {isEmbedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Embed Kalkulator</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Salin kode berikut untuk menampilkan kalkulator di website Anda
                </p>
              </div>
              <button
                onClick={() => setIsEmbedModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Embed URL Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Embed
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={embedUrl}
                    readOnly
                    className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(embedUrl, 'url')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      copiedUrl
                        ? 'bg-green-600 text-white'
                        : 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                    }`}
                  >
                    {copiedUrl ? (
                      <>
                        <span>✓</span>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Elementor Code Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode HTML untuk Elementor / WordPress
                </label>
                <div className="relative">
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {elementorCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(elementorCode, 'code')}
                    className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      copiedCode
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <span>✓</span>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <ExternalLink size={18} />
                  Petunjuk Penggunaan
                </h3>
                <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                  <li>Copy kode HTML di atas</li>
                  <li>Buka halaman Elementor / WordPress Anda</li>
                  <li>Tambahkan widget "HTML" atau "Custom HTML"</li>
                  <li>Paste kode tersebut</li>
                  <li>Simpan dan publish halaman</li>
                </ol>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Responsive & mobile-friendly</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Auto-resize iframe</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Tanpa login / public access</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Data real-time dari database</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsEmbedModalOpen(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary-dark transition-colors flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Lihat Preview
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
