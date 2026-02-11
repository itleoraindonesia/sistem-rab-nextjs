import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase/client";

interface UseWilayahDataResult {
  kabupatenCache: Record<string, string[]>;
  loadingKabupaten: Record<string, boolean>;
  getKabupaten: (provinsi: string) => Promise<string[]>;
  clearCache: () => void;
}

export function useWilayahData(): UseWilayahDataResult {
  const [kabupatenCache, setKabupatenCache] = useState<Record<string, string[]>>({});
  const [loadingKabupaten, setLoadingKabupaten] = useState<Record<string, boolean>>({});

  const getKabupaten = useCallback(async (provinsi: string): Promise<string[]> => {
    // Return from cache if available
    if (kabupatenCache[provinsi]) {
      return kabupatenCache[provinsi];
    }

    if (!supabase) {
      console.error("Supabase not configured");
      return [];
    }

    // Set loading state
    setLoadingKabupaten(prev => ({ ...prev, [provinsi]: true }));

    try {
      const { data, error } = await supabase
        .from("master_ongkir")
        .select("kabupaten")
        .eq("provinsi", provinsi)
        .order("kabupaten");

      if (error) throw error;

      // Extract unique kabupaten
      const kabupatenList = [...new Set((data as any)?.map((item: any) => item.kabupaten).filter(Boolean) || [])] as string[];

      // Update cache
      setKabupatenCache(prev => ({
        ...prev,
        [provinsi]: kabupatenList
      }));

      return kabupatenList;
    } catch (error) {
      console.error(`Error loading kabupaten for ${provinsi}:`, error);
      // Return empty array on error
      return [];
    } finally {
      // Clear loading state
      setLoadingKabupaten(prev => ({ ...prev, [provinsi]: false }));
    }
  }, [kabupatenCache]);

  const clearCache = useCallback(() => {
    setKabupatenCache({});
    setLoadingKabupaten({});
  }, []);

  return {
    kabupatenCache,
    loadingKabupaten,
    getKabupaten,
    clearCache,
  };
}
