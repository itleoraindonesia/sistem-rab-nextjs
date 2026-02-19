import { createClient } from "@/lib/supabase/server";
import EmbeddedPanelCalculator from "./EmbeddedPanelCalculator";
import ErrorState from "@/components/form/ErrorState";

export const dynamic = "force-dynamic";

export default async function PanelCalculatorEmbedPage() {
  let initialPanels: any[] = [];
  let initialOngkir: any[] = [];
  let initialProvinsiList: string[] = [];
  let error: string | null = null;

  try {
    const supabase = await createClient();

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

    initialPanels = panelsRes.data || [];
    initialOngkir = ongkirRes.data || [];

    const uniqueProvinsi = [
      ...new Set(
        (provinsiRes.data as any)?.map((item: any) => item.provinsi) || []
      ),
    ];
    initialProvinsiList = uniqueProvinsi as string[];
  } catch (err) {
    console.error("Gagal load master data:", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorState
          error={error}
          title="Gagal Memuat Data"
          description="Terjadi kesalahan saat memuat data panel. Silakan refresh halaman untuk mencoba lagi."
        />
      </div>
    );
  }

  return (
    <EmbeddedPanelCalculator
      initialPanels={initialPanels}
      initialOngkir={initialOngkir}
      initialProvinsiList={initialProvinsiList}
    />
  );
}
