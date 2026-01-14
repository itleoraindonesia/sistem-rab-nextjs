import { supabase } from '../supabaseClient';

/**
 * Validates kabupaten and provinsi against master_ongkir database
 * Returns validation result with suggestions if invalid
 */
export async function validateLocationAgainstDB(
  kabupaten: string,
  provinsi: string
): Promise<{ isValid: boolean; suggestions?: string[]; message?: string }> {
  if (!supabase || !kabupaten || !provinsi) {
    return { isValid: false, message: 'Data tidak lengkap' };
  }

  try {
    // Check if the exact combination exists (case-insensitive)
    const { data, error } = await supabase
      .from('master_ongkir')
      .select('kabupaten, provinsi')
      .ilike('kabupaten', kabupaten)
      .ilike('provinsi', provinsi)
      .limit(1);

    if (error) {
      console.error('Error validating location:', error);
      return { isValid: false, message: 'Error validasi database' };
    }

    if (data && data.length > 0) {
      return { isValid: true };
    }

    // If not found, get suggestions for the province
    const { data: suggestions } = await supabase
      .from('master_ongkir')
      .select('kabupaten')
      .ilike('provinsi', provinsi)
      .order('kabupaten')
      .limit(10);

    const suggestionList = [...new Set(suggestions?.map((s: any) => s.kabupaten) || [])];

    return {
      isValid: false,
      suggestions: suggestionList,
      message: `Kabupaten "${kabupaten}" tidak ditemukan di provinsi "${provinsi}"`,
    };
  } catch (error) {
    console.error('Error in location validation:', error);
    return { isValid: false, message: 'Error validasi lokasi' };
  }
}

/**
 * Get list of all unique provinces from master_ongkir
 */
export async function getProvinsiList(): Promise<string[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('master_ongkir')
      .select('provinsi')
      .order('provinsi');

    if (error) throw error;

    return [...new Set(data?.map((item: any) => item.provinsi) || [])];
  } catch (error) {
    console.error('Error fetching provinsi list:', error);
    return [];
  }
}

/**
 * Get list of kabupaten for a specific province
 */
export async function getKabupatenByProvinsi(provinsi: string): Promise<string[]> {
  if (!supabase || !provinsi) return [];

  try {
    const { data, error } = await supabase
      .from('master_ongkir')
      .select('kabupaten')
      .ilike('provinsi', provinsi)
      .order('kabupaten');

    if (error) throw error;

    return [...new Set(data?.map((item: any) => item.kabupaten) || [])];
  } catch (error) {
    console.error('Error fetching kabupaten list:', error);
    return [];
  }
}
