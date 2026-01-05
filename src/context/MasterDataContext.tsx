"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";

interface Panel {
  id: number;
  name: string;
  harga: number;
  luasPerLembar: number;
  type: string;
  created_at?: string;
  updated_at?: string;
}

interface Ongkir {
  id?: number;
  provinsi: string;
  biaya: number;
  created_at?: string;
  updated_at?: string;
}

interface MasterDataContextType {
  panels: Panel[];
  ongkir: Ongkir[];
  parameters: {
    wasteFactor: number;
    jointFactorDinding: number;
    jointFactorLantai: number;
    upahPasang: number;
    hargaJoint: number;
  };
  loading: boolean;
  refresh: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(
  undefined
);

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [ongkir, setOngkir] = useState<Ongkir[]>([]);
  const [loading, setLoading] = useState(true);

  const parameters = {
    wasteFactor: 1.05,
    jointFactorDinding: 2.5,
    jointFactorLantai: 1.8,
    upahPasang: 50000,
    hargaJoint: 2500,
  };

  const refresh = async () => {
    try {
      setLoading(true);

      if (supabase) {
        // Load panels directly from Supabase
        const { data: panelsData, error: panelsError } = await supabase
          .from("master_panel")
          .select("*")
          .order("id", { ascending: false });

        if (panelsError) {
          console.error("Error fetching panels from Supabase:", panelsError);
        } else {
          // Use database data if available, otherwise fallback to mock data
          setPanels(
            panelsData && panelsData.length > 0
              ? panelsData
              : [
                  {
                    id: 1,
                    name: "Panel Dinding Standard",
                    harga: 150000,
                    luasPerLembar: 1.8,
                    type: "dinding",
                  },
                  {
                    id: 2,
                    name: "Panel Dinding Premium",
                    harga: 250000,
                    luasPerLembar: 1.8,
                    type: "dinding",
                  },
                  {
                    id: 3,
                    name: "Panel Lantai Standard",
                    harga: 200000,
                    luasPerLembar: 1.8,
                    type: "lantai",
                  },
                  {
                    id: 4,
                    name: "Panel Lantai Premium",
                    harga: 350000,
                    luasPerLembar: 1.8,
                    type: "lantai",
                  },
                ]
          );
        }

        // Load ongkir directly from Supabase
        const { data: ongkirData, error: ongkirError } = await supabase
          .from("master_ongkir")
          .select("*")
          .order("provinsi", { ascending: true });

        if (ongkirError) {
          console.error("Error fetching ongkir from Supabase:", ongkirError);
        } else {
          // Use database data if available, otherwise fallback to mock data
          setOngkir(
            ongkirData && ongkirData.length > 0
              ? ongkirData
              : [
                  { id: 1, provinsi: "DKI Jakarta", biaya: 50000 },
                  { id: 2, provinsi: "Jawa Barat", biaya: 75000 },
                  { id: 3, provinsi: "Jawa Tengah", biaya: 100000 },
                ]
          );
        }
      } else {
        // Supabase not configured, use fallback data
        console.log("Supabase not configured, using fallback data");
        setPanels([
          {
            id: 1,
            name: "Panel Dinding Standard",
            harga: 150000,
            luasPerLembar: 1.8,
            type: "dinding",
          },
          {
            id: 2,
            name: "Panel Dinding Premium",
            harga: 250000,
            luasPerLembar: 1.8,
            type: "dinding",
          },
          {
            id: 3,
            name: "Panel Lantai Standard",
            harga: 200000,
            luasPerLembar: 1.8,
            type: "lantai",
          },
          {
            id: 4,
            name: "Panel Lantai Premium",
            harga: 350000,
            luasPerLembar: 1.8,
            type: "lantai",
          },
        ]);
        setOngkir([
          { id: 1, provinsi: "DKI Jakarta", biaya: 50000 },
          { id: 2, provinsi: "Jawa Barat", biaya: 75000 },
          { id: 3, provinsi: "Jawa Tengah", biaya: 100000 },
        ]);
      }
    } catch (error) {
      console.error("Error loading master data:", error);
      // Fallback to mock data if everything fails
      setPanels([
        {
          id: 1,
          name: "Panel Dinding Standard",
          harga: 150000,
          luasPerLembar: 1.8,
          type: "dinding",
        },
        {
          id: 2,
          name: "Panel Dinding Premium",
          harga: 250000,
          luasPerLembar: 1.8,
          type: "dinding",
        },
        {
          id: 3,
          name: "Panel Lantai Standard",
          harga: 200000,
          luasPerLembar: 1.8,
          type: "lantai",
        },
        {
          id: 4,
          name: "Panel Lantai Premium",
          harga: 350000,
          luasPerLembar: 1.8,
          type: "lantai",
        },
      ]);
      setOngkir([
        { id: 1, provinsi: "DKI Jakarta", biaya: 50000 },
        { id: 2, provinsi: "Jawa Barat", biaya: 75000 },
        { id: 3, provinsi: "Jawa Tengah", biaya: 100000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <MasterDataContext.Provider
      value={{
        panels,
        ongkir,
        parameters,
        loading,
        refresh,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (context === undefined) {
    throw new Error("useMasterData must be used within a MasterDataProvider");
  }
  return context;
}
