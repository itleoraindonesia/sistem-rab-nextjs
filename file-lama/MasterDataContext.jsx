import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

const MasterDataContext = createContext();

export function useMasterData() {
  return useContext(MasterDataContext);
}

export function MasterDataProvider({ children }) {
  const [masterData, setMasterData] = useState({
    panels: [],
    ongkir: [],
    parameters: {
      upahPasang: 200000,
      hargaJoint: 2300,
      wasteFactor: 1.1,
      jointFactorDinding: 3.06,
      jointFactorLantai: 3.125,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetch
      const [panelsRes, ongkirRes] = await Promise.all([
        supabase
          .from("master_panel")
          .select("*")
          .order("type", { ascending: true }),
        supabase.from("master_ongkir").select("*"),
      ]);

      if (panelsRes.error) throw panelsRes.error;
      if (ongkirRes.error) throw ongkirRes.error;

      setMasterData((prev) => ({
        ...prev,
        panels: panelsRes.data || [],
        ongkir: ongkirRes.data || [],
      }));
    } catch (err) {
      console.error("Gagal load master data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => loadData();

  return (
    <MasterDataContext.Provider
      value={{
        ...masterData,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}
