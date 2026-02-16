"use client";

import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { panelCalculate } from "@/lib/calculators/panel";
import { useMasterData } from "@/context/MasterDataContext";
import { CalculatorValues, CalculationResult } from "@/lib/calculators";

export function usePanelCalculator() {
  const { panels, ongkir, loading } = useMasterData();

  const masterData = useMemo(() => ({
    panels,
    ongkir,
    parameters: { wasteFactor: 1.1, upahPasang: 200000, hargaJoint: 2300 },
  }), [panels, ongkir]);

  const form = useForm({
    defaultValues: {
      hitung_dinding: false,
      perimeter: 0,
      tinggi_lantai: 0,
      panel_dinding_id: '',
      hitung_lantai: false,
      bidang: [{ panjang: 0, lebar: 0 }],
      panel_lantai_id: '',
      location_provinsi: '',
      location_kabupaten: '',
    },
    mode: "onChange",
  });

  const { control, watch, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bidang",
  });

  const watchedValues = watch();

  const watchedHitungDinding = useWatch({ control, name: 'hitung_dinding' });
  const watchedHitungLantai = useWatch({ control, name: 'hitung_lantai' });
  const watchedProvinsi = useWatch({ control, name: 'location_provinsi' });
  const watchedKabupaten = useWatch({ control, name: 'location_kabupaten' });

  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    if (!loading) {
      const calcResult = panelCalculate(watchedValues, masterData);
      setResult(calcResult);
    }
  }, [JSON.stringify(watchedValues), masterData, loading]);

  const panelDindingOptions = panels.filter(p => p.type === 'dinding').map(p => ({ value: p.id.toString(), label: `${p.name} - Rp ${p.harga.toLocaleString()}` }));
  const panelLantaiOptions = panels.filter(p => p.type === 'lantai').map(p => ({ value: p.id.toString(), label: `${p.name} - Rp ${p.harga.toLocaleString()}` }));
  const ongkirOptions = ongkir.map(o => ({ value: o.kabupaten || '', label: o.kabupaten || o.provinsi }));
  
  // Filter kabupaten based on selected province
  const filteredKabupatenOptions = watchedProvinsi 
    ? ongkir.filter(o => o.provinsi === watchedProvinsi).map(o => ({ 
        value: o.kabupaten || '', 
        label: `${o.kabupaten || o.provinsi} - Rp ${o.biaya?.toLocaleString() || 0}`,
        biaya: o.biaya 
      }))
    : ongkir.map(o => ({ 
        value: o.kabupaten || '', 
        label: `${o.kabupaten || o.provinsi} - Rp ${o.biaya?.toLocaleString() || 0}`,
        biaya: o.biaya 
      }));

  return {
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
    filteredKabupatenOptions,
    watchedHitungDinding,
    watchedHitungLantai,
    watchedProvinsi,
    watchedKabupaten,
  };
}