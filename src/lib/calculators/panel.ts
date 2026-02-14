/**
 * Panel Calculator Config
 * 1 file = 1 kalkulator (config + calculation logic)
 */

import { CalculatorConfig, CalculationResult, CalculatorMasterData, CalculatorValues } from './types';

/**
 * Calculate Panel (Lantai & Dinding)
 * Logic extracted from useRABCalculation hook
 */
function calculatePanel(values: CalculatorValues, masterData: CalculatorMasterData): CalculationResult {
  const { panels, ongkir } = masterData;
  const parameters = masterData.parameters || {
    wasteFactor: 1.1,
    upahPasang: 200000,
    hargaJoint: 2300,
  };

  const {
    bidang,
    perimeter,
    tinggi_lantai,
    hitung_dinding,
    hitung_lantai,
    location_kabupaten,
    panel_dinding_id,
    panel_lantai_id,
  } = values;

  // Hitung luas
  const luasLantai = bidang?.reduce(
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

    // Total truk dan biaya angkutan
    const totalTruk = jumlahTrukDinding + jumlahTrukLantai;
    if (totalTruk > 0) {
      biayaAngkutan = totalTruk * ongkirData.biaya;
    }
  }

  const grandTotal = subtotalDinding + subtotalLantai + biayaAngkutan;

  // Build result
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
              unit: 'lembar',
              unit_price: panelDinding.harga,
              amount: lembarDinding * panelDinding.harga,
            },
            {
              desc: 'Upah Pasang Dinding',
              qty: luasDinding,
              unit: 'm²',
              unit_price: parameters.upahPasang,
              amount: luasDinding * parameters.upahPasang,
            },
            {
              desc: 'Joint/Angkur Dinding',
              qty: titikJointDinding,
              unit: 'titik',
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
              unit: 'lembar',
              unit_price: panelLantai.harga,
              amount: lembarLantai * panelLantai.harga,
            },
            {
              desc: 'Upah Pasang Lantai',
              qty: luasLantai,
              unit: 'm²',
              unit_price: parameters.upahPasang,
              amount: luasLantai * parameters.upahPasang,
            },
            {
              desc: 'Joint/Angkur Lantai',
              qty: titikJointLantai,
              unit: 'titik',
              unit_price: parameters.hargaJoint,
              amount: titikJointLantai * parameters.hargaJoint,
            },
          ]
        : []),
      ...(ongkirData && (jumlahTrukDinding > 0 || jumlahTrukLantai > 0) ? [{
        desc: `Angkutan Truk ke ${location_kabupaten || 'Unknown'}`,
        qty: jumlahTrukDinding + jumlahTrukLantai,
        unit: 'Unit',
        unit_price: ongkirData.biaya,
        amount: biayaAngkutan,
      }] : []),
    ].filter((item) => item.amount > 0),
  };

  // Add optional fields
  if (lembarDinding > 0) result.lembarDinding = lembarDinding;
  if (lembarLantai > 0) result.lembarLantai = lembarLantai;
  if (titikJointDinding > 0) result.titikJointDinding = titikJointDinding;
  if (titikJointLantai > 0) result.titikJointLantai = titikJointLantai;

  return result;
}

/**
 * Panel Calculator Config
 * Config-driven: 1 file contains fields + calculation
 */
export const panelConfig: CalculatorConfig = {
  id: 'panel',
  name: 'Panel Lantai & Dinding',
  description: 'Hitung kebutuhan panel lantai dan dinding dengan akurat',
  status: 'active',
  icon: 'Boxes',

  // Fields configuration
  fields: [
    // Dinding section
    {
      name: 'hitung_dinding',
      type: 'checkbox',
      label: 'Hitung Dinding',
    },
    {
      name: 'perimeter',
      type: 'number',
      label: 'Panjang Perimeter (m)',
      placeholder: 'Masukkan panjang perimeter',
      visibleWhen: { field: 'hitung_dinding', value: true },
    },
    {
      name: 'tinggi_lantai',
      type: 'number',
      label: 'Tinggi Dinding (m)',
      placeholder: 'Masukkan tinggi dinding',
      visibleWhen: { field: 'hitung_dinding', value: true },
    },
    {
      name: 'panel_dinding_id',
      type: 'select',
      label: 'Pilih Panel Dinding',
      visibleWhen: { field: 'hitung_dinding', value: true },
      options: [], // Will be populated from master data
    },

    // Lantai section
    {
      name: 'hitung_lantai',
      type: 'checkbox',
      label: 'Hitung Lantai',
    },
    {
      name: 'bidang',
      type: 'fieldarray',
      label: 'Bidang Lantai',
      visibleWhen: { field: 'hitung_lantai', value: true },
    },
    {
      name: 'panel_lantai_id',
      type: 'select',
      label: 'Pilih Panel Lantai',
      visibleWhen: { field: 'hitung_lantai', value: true },
      options: [], // Will be populated from master data
    },

    // Ongkir (optional for calculator)
    {
      name: 'location_kabupaten',
      type: 'select',
      label: 'Kabupaten Tujuan',
      options: [], // Will be populated from master data
    },
  ],

  // Field array fields for dynamic fields like bidang[]
  fieldArrayFields: {
    bidang: [
      { name: 'panjang', type: 'number', label: 'Panjang (m)' },
      { name: 'lebar', type: 'number', label: 'Lebar (m)' },
    ],
  },

  // Default parameters
  defaultParameters: {
    wasteFactor: 1.1,
    upahPasang: 200000,
    hargaJoint: 2300,
  },
};

// Export calculate function
export const panelCalculate = calculatePanel;
