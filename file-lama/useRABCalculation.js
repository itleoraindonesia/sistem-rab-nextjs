import { useState, useCallback } from "react";

export function useRABCalculation(panels, ongkir, parameters, masterLoading) {
  const [hasil, setHasil] = useState(null);

  const calculateRAB = useCallback(
    (values) => {
      if (masterLoading || !panels.length) return;

      const {
        bidang,
        perimeter,
        tinggi_lantai,
        hitung_dinding,
        hitung_lantai,
        location,
        panel_dinding_id,
        panel_lantai_id,
      } = values;

      // Hitung luas
      const luasLantai = bidang.reduce(
        (sum, b) => sum + b.panjang * b.lebar,
        0
      );
      const luasDinding = perimeter * tinggi_lantai;

      // Ambil data panel
      const panelDinding = panels.find((p) => p.id === panel_dinding_id);
      const panelLantai = panels.find((p) => p.id === panel_lantai_id);
      const ongkirData = ongkir.find((o) => o.provinsi === location);

      // Hitung biaya dinding
      let subtotalDinding = 0;
      let lembarDinding = 0;
      let titikJointDinding = 0;
      if (hitung_dinding && panelDinding) {
        lembarDinding = Math.ceil(
          (luasDinding / (panelDinding.luasPerLembar || 1.8)) *
            parameters.wasteFactor
        );
        titikJointDinding = Math.round(
          luasDinding * parameters.jointFactorDinding
        );

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
          (luasLantai / (panelLantai.luasPerLembar || 1.8)) *
            parameters.wasteFactor
        );
        titikJointLantai = Math.ceil(luasLantai * parameters.jointFactorLantai);

        const biayaPanel = lembarLantai * panelLantai.harga;
        const biayaUpah = luasLantai * parameters.upahPasang;
        const biayaJoint = titikJointLantai * parameters.hargaJoint;
        subtotalLantai = biayaPanel + biayaUpah + biayaJoint;
      }

      // Hitung ongkir
      const biayaOngkir = ongkirData?.biaya || 0;

      const grandTotal = subtotalDinding + subtotalLantai + biayaOngkir;

      setHasil({
        luasLantai,
        luasDinding,
        lembarDinding,
        lembarLantai,
        titikJointDinding,
        titikJointLantai,
        subtotalDinding,
        subtotalLantai,
        biayaOngkir,
        grandTotal,
        items: [
          ...(hitung_dinding && panelDinding
            ? [
                {
                  desc: `Panel ${panelDinding.name}`,
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
                  desc: `Panel ${panelLantai.name}`,
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
          {
            desc: `Ongkos Kirim ke ${location}`,
            qty: 1,
            unit_price: biayaOngkir,
            amount: biayaOngkir,
          },
        ].filter((item) => item.amount > 0),
      });
    },
    [panels, ongkir, parameters, masterLoading]
  );

  return { hasil, calculateRAB };
}
