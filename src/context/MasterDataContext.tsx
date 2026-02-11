"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase/client";

interface Panel {
  id: number;
  name: string;
  harga: number;
  luas_per_lembar: number;
  jumlah_per_truck: number;
  type: string;
  created_at?: string;
  updated_at?: string;
}

interface Ongkir {
  id?: number;
  provinsi: string;
  biaya: number;
  kabupaten?: string;
  created_at?: string;
  updated_at?: string;
}

interface MasterDataContextType {
  panels: Panel[];
  ongkir: Ongkir[];
  provinsiList: string[];
  parameters: {
    wasteFactor: number;
    jointFactorDinding: number;
    jointFactorLantai: number;
    upahPasang: number;
    hargaJoint: number;
  };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(
  undefined
);

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [masterData, setMasterData] = useState<{
    panels: Panel[];
    ongkir: Ongkir[];
    provinsiList: string[];
    parameters: {
      wasteFactor: number;
      jointFactorDinding: number;
      jointFactorLantai: number;
      upahPasang: number;
      hargaJoint: number;
    };
  }>({
    panels: [],
    ongkir: [],
    provinsiList: [],
    parameters: {
      wasteFactor: 1.05,
      jointFactorDinding: 2.5,
      jointFactorLantai: 1.8,
      upahPasang: 50000,
      hargaJoint: 2500,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error("Database not configured");
      }

      // Parallel fetch
      const [panelsRes, ongkirRes, provinsiRes] = await Promise.all([
        supabase
          .from("master_panel")
          .select("*")
          .order("type", { ascending: true }),
        supabase.from("master_ongkir").select("*"),
        supabase
          .from("master_ongkir")
          .select("provinsi")
          .order("provinsi") as any,
      ]);

      if (panelsRes.error) throw panelsRes.error;
      if (ongkirRes.error) throw ongkirRes.error;
      if (provinsiRes.error) throw provinsiRes.error;

      // Get unique provinsi list
      const uniqueProvinsi = [...new Set((provinsiRes.data as any)?.map((item: any) => item.provinsi) || [])];

      setMasterData((prev) => ({
        ...prev,
        panels: panelsRes.data || [],
        ongkir: ongkirRes.data || [],
        provinsiList: uniqueProvinsi as string[],
      }));
    } catch (err) {
      console.error("Gagal load master data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Don't update masterData on error to keep previous stable data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => loadData();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...masterData,
    loading,
    error,
    refresh,
  }), [masterData.panels, masterData.ongkir, masterData.provinsiList, masterData.parameters, loading, error]);

  return (
    <MasterDataContext.Provider value={contextValue}>
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
