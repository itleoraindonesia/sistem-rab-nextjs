import { useCallback, useState } from "react";
import { RABFormData } from "../schemas/rabSchema";
import { supabase } from "../lib/supabase/client";

interface Panel {
  id: number;
  name: string;
  harga: number;
  luas_per_lembar: number;
  jumlah_per_truck: number;
  type: string;
}

interface Ongkir {
  provinsi: string;
  biaya: number;
  kabupaten?: string;
}

interface Parameters {
  wasteFactor: number;
  upahPasang: number;
  hargaJoint: number;
}

interface CalculationResult {
  luasDinding: number;
  luasLantai: number;
  lembarDinding?: number;
  lembarLantai?: number;
  titikJointDinding?: number;
  titikJointLantai?: number;
  subtotalDinding: number;
  subtotalLantai: number;
  biayaOngkir: number;
  grandTotal: number;
  items: any[];
}

export function useRABCalculation(
  panels: Panel[] = [],
  ongkir: Ongkir[] = [],
  parameters: Parameters = {
    wasteFactor: 1.1,
    upahPasang: 200000,
    hargaJoint: 2300,
  },
  masterLoading: boolean = false
) {
  // Local state for calculation result
  const [hasil, setHasil] = useState<CalculationResult | null>(null);

  const calculateRAB = useCallback(
    (values: Partial<RABFormData>) => {
      if (masterLoading || !panels.length) return null;

      const {
        bidang,
        perimeter,
        tinggi_lantai,
        hitung_dinding,
        hitung_lantai,
        location_provinsi,
        location_kabupaten,
        panel_dinding_id,
        panel_lantai_id,
      } = values;

      // Hitung luas
      const luasLantai =
        bidang?.reduce(
          (sum: number, b: any) => sum + (b.panjang || 0) * (b.lebar || 0),
          0
        ) || 0;
      const luasDinding = (perimeter || 0) * (tinggi_lantai || 0);

      // Ambil data panel
      const panelDinding = panels.find(
        (p) => p.id.toString() === panel_dinding_id
      );
      const panelLantai = panels.find(
        (p) => p.id.toString() === panel_lantai_id
      );
      const ongkirData = ongkir.find((o) => o.kabupaten === location_kabupaten);

      // Debug logging
      console.log("=== ONGKIR CALCULATION DEBUG ===");
      console.log("location_kabupaten:", location_kabupaten);
      console.log("location_provinsi:", location_provinsi);
      console.log("All ongkir data:", ongkir);
      console.log("Found ongkirData:", ongkirData);
      console.log("================================");

      // Hitung biaya dinding
      let subtotalDinding = 0;
      let lembarDinding = 0;
      let titikJointDinding = 0;
      if (hitung_dinding && panelDinding) {
        lembarDinding = Math.ceil(
          (luasDinding / (panelDinding.luas_per_lembar || 1.8)) *
            parameters.wasteFactor
        );
        titikJointDinding = lembarDinding * 5;

        const biayaPanel = lembarDinding * panelDinding.harga;
        const biayaUpah = luasDinding * parameters.upahPasang;
        const biayaJoint = titikJointDinding * parameters.hargaJoint;
        subtotalDinding = biayaPanel + biayaUpah + biayaJoint;
      }

      // Hitung biaya lantai
      let subtotalLantai = 0;
      let lembarLantai = 0;
      let titikJointLantai = 0;
      if (hitung_lantai && panelLantai) {
        lembarLantai = Math.ceil(
          (luasLantai / (panelLantai.luas_per_lembar || 1.8)) *
            parameters.wasteFactor
        );
        titikJointLantai = lembarLantai * 5;

        const biayaPanel = lembarLantai * panelLantai.harga;
        const biayaUpah = luasLantai * parameters.upahPasang;
        const biayaJoint = titikJointLantai * parameters.hargaJoint;
        subtotalLantai = biayaPanel + biayaUpah + biayaJoint;
      }

      // Hitung kebutuhan truk dan biaya angkutan
      let jumlahTrukDinding = 0;
      let jumlahTrukLantai = 0;
      let biayaAngkutan = 0;

      if (ongkirData && (hitung_dinding || hitung_lantai)) {
        // Hitung truk untuk dinding
        if (hitung_dinding && panelDinding && lembarDinding > 0) {
          jumlahTrukDinding = Math.ceil(lembarDinding / panelDinding.jumlah_per_truck);
        }

        // Hitung truk untuk lantai
        if (hitung_lantai && panelLantai && lembarLantai > 0) {
          jumlahTrukLantai = Math.ceil(lembarLantai / panelLantai.jumlah_per_truck);
        }

        // Total truk dan biaya angkutan - hanya jika ada truk yang dibutuhkan
        const totalTruk = jumlahTrukDinding + jumlahTrukLantai;
        if (totalTruk > 0) {
          biayaAngkutan = totalTruk * ongkirData.biaya;
        }
      }

      const grandTotal = subtotalDinding + subtotalLantai + biayaAngkutan;

      const result: CalculationResult = {
        luasLantai,
        luasDinding,
        subtotalDinding,
        subtotalLantai,
        biayaOngkir: biayaAngkutan,
        grandTotal,
        items: [
          ...(hitung_dinding && panelDinding
            ? [
                {
                  desc: `${panelDinding.name}`,
                  qty: lembarDinding,
                  unit_price: panelDinding.harga,
                  amount: lembarDinding * panelDinding.harga,
                },
                {
                  desc: "Upah Pasang Dinding",
                  qty: luasDinding,
                  unit: "m²",
                  unit_price: parameters.upahPasang,
                  amount: luasDinding * parameters.upahPasang,
                },
                {
                  desc: "Joint/Angkur Dinding",
                  qty: titikJointDinding,
                  unit: "titik",
                  unit_price: parameters.hargaJoint,
                  amount: titikJointDinding * parameters.hargaJoint,
                },
              ]
            : []),
          ...(hitung_lantai && panelLantai
            ? [
                {
                  desc: `${panelLantai.name}`,
                  qty: lembarLantai,
                  unit_price: panelLantai.harga,
                  amount: lembarLantai * panelLantai.harga,
                },
                {
                  desc: "Upah Pasang Lantai",
                  qty: luasLantai,
                  unit: "m²",
                  unit_price: parameters.upahPasang,
                  amount: luasLantai * parameters.upahPasang,
                },
                {
                  desc: "Joint/Angkur Lantai",
                  qty: titikJointLantai,
                  unit: "titik",
                  unit_price: parameters.hargaJoint,
                  amount: titikJointLantai * parameters.hargaJoint,
                },
              ]
            : []),
          ...(ongkirData && (jumlahTrukDinding > 0 || jumlahTrukLantai > 0) ? [{
            desc: `Angkutan Truk ke ${location_provinsi || 'Unknown'} - ${location_kabupaten || 'Unknown'}`,
            qty: jumlahTrukDinding + jumlahTrukLantai,
            unit: "Unit",
            unit_price: ongkirData.biaya,
            amount: biayaAngkutan,
          }] : []),
        ].filter((item) => item.amount > 0),
      }

      // Only include optional fields when they have meaningful values
      if (lembarDinding > 0) result.lembarDinding = lembarDinding
      if (lembarLantai > 0) result.lembarLantai = lembarLantai
      if (titikJointDinding > 0) result.titikJointDinding = titikJointDinding
      if (titikJointLantai > 0) result.titikJointLantai = titikJointLantai

      return result
    },
    [panels, ongkir, parameters, masterLoading]
  );

  return { hasil, calculateRAB, setHasil };
}
