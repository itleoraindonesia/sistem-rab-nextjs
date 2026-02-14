"use client";

import { CalculationResult } from "@/lib/calculators";
import { Calculator, Truck, LayoutGrid } from "lucide-react";

interface CalculatorResultsProps {
  result: CalculationResult | null;
  title?: string;
}

export function CalculatorResults({ result, title = "Hasil Perhitungan" }: CalculatorResultsProps) {
  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  if (!result || result.grandTotal === 0) {
    return (
      <div className="bg-surface rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calculator size={20} className="text-brand-accent" />
            {title}
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-2">
            <LayoutGrid size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">
            Masukkan dimensi untuk melihat hasil perhitungan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calculator size={20} className="text-brand-accent" />
          {title}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Luas Summary */}
        {(result.luasLantai || result.luasDinding) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.luasLantai && result.luasLantai > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-800 text-sm font-medium">
                  Luas Lantai
                </div>
                <div className="text-2xl font-bold text-green-800 mt-1">
                  {result.luasLantai.toFixed(2)} m²
                </div>
              </div>
            )}
            {result.luasDinding && result.luasDinding > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-blue-800 text-sm font-medium">
                  Luas Dinding
                </div>
                <div className="text-2xl font-bold text-blue-800 mt-1">
                  {result.luasDinding.toFixed(2)} m²
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detail Perhitungan */}
        {result.items.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-900">
              <Calculator size={16} />
              Detail Perhitungan
            </h3>
            <div className="space-y-4">
              {/* Dinding Items */}
              {result.items.filter((item) => item.desc.includes("Dinding")).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Dinding Panel
                  </h4>
                  <div className="space-y-2">
                    {result.items
                      .filter((item) => item.desc.includes("Dinding"))
                      .map((item, index) => (
                        <div key={index} className="text-sm">
                          <div className="text-blue-700">{item.desc}</div>
                          <div className="text-blue-800 font-medium">
                            {item.qty} {item.unit || "lembar"} @{" "}
                            {formatRupiah(item.unit_price)} ={" "}
                            {formatRupiah(item.amount)}
                          </div>
                        </div>
                      ))}
                    {result.subtotalDinding && result.subtotalDinding > 0 && (
                      <div className="border-t border-blue-300 pt-2 flex justify-between font-semibold text-blue-800">
                        <span>Subtotal Dinding</span>
                        <span>{formatRupiah(result.subtotalDinding)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lantai Items */}
              {result.items.filter((item) => item.desc.includes("Lantai")).length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    Lantai Panel
                  </h4>
                  <div className="space-y-2">
                    {result.items
                      .filter((item) => item.desc.includes("Lantai"))
                      .map((item, index) => (
                        <div key={index} className="text-sm">
                          <div className="text-green-700">{item.desc}</div>
                          <div className="text-green-800 font-medium">
                            {item.qty} {item.unit || "lembar"} @{" "}
                            {formatRupiah(item.unit_price)} ={" "}
                            {formatRupiah(item.amount)}
                          </div>
                        </div>
                      ))}
                    {result.subtotalLantai && result.subtotalLantai > 0 && (
                      <div className="border-t border-green-300 pt-2 flex justify-between font-semibold text-green-800">
                        <span>Subtotal Lantai</span>
                        <span>{formatRupiah(result.subtotalLantai)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ongkir Items */}
              {result.items.filter((item) => item.desc.includes("Angkutan")).length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Truck size={16} />
                    Angkutan
                  </h3>
                  <div className="space-y-2">
                    {result.items
                      .filter((item) => item.desc.includes("Angkutan"))
                      .map((item, index) => (
                        <div key={index} className="text-sm">
                          <div className="text-yellow-700">{item.desc}</div>
                          <div className="text-yellow-800 font-medium">
                            {item.qty} {item.unit} @{" "}
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
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3 flex items-center gap-2 text-primary">
            <Truck size={18} className="text-brand-accent" />
            Rincian Biaya
          </h3>
          <div className="space-y-2 text-sm">
            {result.subtotalDinding && result.subtotalDinding > 0 && (
              <div className="flex justify-between">
                <span className="text-primary">Dinding</span>
                <span className="font-semibold text-primary">
                  {formatRupiah(result.subtotalDinding)}
                </span>
              </div>
            )}
            {result.subtotalLantai && result.subtotalLantai > 0 && (
              <div className="flex justify-between">
                <span className="text-primary">Lantai</span>
                <span className="font-semibold text-primary">
                  {formatRupiah(result.subtotalLantai)}
                </span>
              </div>
            )}
            {result.biayaOngkir && result.biayaOngkir > 0 && (
              <div className="flex justify-between">
                <span className="text-primary">Angkutan Truk</span>
                <span className="font-semibold text-primary">
                  {formatRupiah(result.biayaOngkir)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-3 flex justify-between font-bold text-lg text-brand-primary">
          <span>Total</span>
          <span>{formatRupiah(result.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default CalculatorResults;
