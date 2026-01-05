import { useState, useCallback } from 'react';
import { RABFormData } from '../schemas/rabSchema';

interface Panel {
  id: number;
  name: string;
  harga: number;
  luasPerLembar: number;
  type: string;
}

interface Ongkir {
  provinsi: string;
  biaya: number;
}

interface Parameters {
  wasteFactor: number;
  jointFactorDinding: number;
  jointFactorLantai: number;
  upahPasang: number;
  hargaJoint: number;
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

export function useRABCalculation(
  panels: Panel[] = [],
  ongkir: Ongkir[] = [],
  parameters: Parameters = {
    wasteFactor: 1.05,
    jointFactorDinding: 2.5,
    jointFactorLantai: 1.8,
    upahPasang: 50000,
    hargaJoint: 2500,
  },
  masterLoading: boolean = false
) {
  const [hasil, setHasil] = useState<CalculationResult>({
    luasDinding: 0,
    luasLantai: 0,
    subtotalDinding: 0,
    subtotalLantai: 0,
    biayaOngkir: 0,
    grandTotal: 0,
    items: [],
  });

  const calculateRAB = useCallback((watchedValues: Partial<RABFormData>) => {
    if (masterLoading || !panels.length) return;

    let luasDinding = 0;
    let luasLantai = 0;
    let subtotalDinding = 0;
    let subtotalLantai = 0;
    let biayaOngkir = 0;

    const items: any[] = [];

    // Calculate wall area if hitung_dinding is checked
    if (watchedValues.hitung_dinding) {
      const perimeter = watchedValues.perimeter || 0;
      const tinggiLantai = watchedValues.tinggi_lantai || 0;
      luasDinding = perimeter * tinggiLantai;

      // Find selected wall panel
      const selectedPanel = panels.find(p => p.id.toString() === watchedValues.panel_dinding_id);
      if (selectedPanel && luasDinding > 0) {
        const panelCost = Math.ceil(luasDinding / selectedPanel.luasPerLembar) * selectedPanel.harga * parameters.wasteFactor;
        const installationCost = luasDinding * parameters.upahPasang;
        const jointCost = luasDinding * parameters.jointFactorDinding * parameters.hargaJoint;

        subtotalDinding = panelCost + installationCost + jointCost;

        items.push({
          desc: `Panel Dinding ${selectedPanel.name}`,
          qty: Math.ceil(luasDinding / selectedPanel.luasPerLembar),
          unit: 'lembar',
          unit_price: selectedPanel.harga,
          amount: panelCost
        });

        if (installationCost > 0) {
          items.push({
            desc: 'Pemasangan Panel Dinding',
            qty: luasDinding,
            unit: 'm²',
            unit_price: parameters.upahPasang,
            amount: installationCost
          });
        }

        if (jointCost > 0) {
          items.push({
            desc: 'Joint/Anchor Dinding',
            qty: luasDinding * parameters.jointFactorDinding,
            unit: 'buah',
            unit_price: parameters.hargaJoint,
            amount: jointCost
          });
        }
      }
    }

    // Calculate floor area if hitung_lantai is checked
    if (watchedValues.hitung_lantai) {
      const bidang = watchedValues.bidang || [];
      luasLantai = bidang.reduce((total, area) => {
        return total + ((area.panjang || 0) * (area.lebar || 0));
      }, 0);

      // Find selected floor panel
      const selectedPanel = panels.find(p => p.id.toString() === watchedValues.panel_lantai_id);
      if (selectedPanel && luasLantai > 0) {
        const panelCost = Math.ceil(luasLantai / selectedPanel.luasPerLembar) * selectedPanel.harga * parameters.wasteFactor;
        const installationCost = luasLantai * parameters.upahPasang;
        const jointCost = luasLantai * parameters.jointFactorLantai * parameters.hargaJoint;

        subtotalLantai = panelCost + installationCost + jointCost;

        items.push({
          desc: `Panel Lantai ${selectedPanel.name}`,
          qty: Math.ceil(luasLantai / selectedPanel.luasPerLembar),
          unit: 'lembar',
          unit_price: selectedPanel.harga,
          amount: panelCost
        });

        if (installationCost > 0) {
          items.push({
            desc: 'Pemasangan Panel Lantai',
            qty: luasLantai,
            unit: 'm²',
            unit_price: parameters.upahPasang,
            amount: installationCost
          });
        }

        if (jointCost > 0) {
          items.push({
            desc: 'Joint/Anchor Lantai',
            qty: luasLantai * parameters.jointFactorLantai,
            unit: 'buah',
            unit_price: parameters.hargaJoint,
            amount: jointCost
          });
        }
      }
    }

    // Calculate ongkir based on location
    const selectedLocation = ongkir.find(o => o.provinsi === watchedValues.location);
    if (selectedLocation) {
      biayaOngkir = selectedLocation.biaya;
      items.push({
        desc: `Ongkos Kirim ke ${selectedLocation.provinsi}`,
        qty: 1,
        unit: 'kali',
        unit_price: selectedLocation.biaya,
        amount: selectedLocation.biaya
      });
    }

    // Calculate grand total
    const grandTotal = subtotalDinding + subtotalLantai + biayaOngkir;

    const newHasil = {
      luasDinding,
      luasLantai,
      subtotalDinding,
      subtotalLantai,
      biayaOngkir,
      grandTotal,
      items,
    };

    setHasil(newHasil as any);
  }, [panels, ongkir, parameters, masterLoading]);

  return { hasil, calculateRAB };
}
