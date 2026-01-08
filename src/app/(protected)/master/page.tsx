'use client';

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import MasterPanelTable from "../../../components/tables/MasterPanelTable";
import MasterOngkirTable from "../../../components/tables/MasterOngkirTable";

interface Panel {
  id: string;
  name: string;
  type: string;
  harga: number;
  berat?: number;
  volume?: number;
  jumlah_per_truck?: number;
  keterangan?: string;
}

interface Ongkir {
  id?: string;
  provinsi: string;
  biaya: number;
  kabupaten?: string;
}

export default function MasterData() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [ongkir, setOngkir] = useState<Ongkir[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMasterData, setSelectedMasterData] = useState<'panel' | 'ongkir' | null>(null);

  // Search states
  const [searchPanel, setSearchPanel] = useState('');
  const [searchOngkir, setSearchOngkir] = useState('');

  // Load master data on mount
  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = useCallback(async () => {
    try {
      setLoading(true);

      if (supabase) {
        // Load panels directly from Supabase
        const { data: panelsData, error: panelsError } = await supabase
          .from('master_panel')
          .select('*')
          .order('id', { ascending: false });

        if (panelsError) {
          console.error('Error fetching panels from Supabase:', panelsError);
        } else {
          // Use database data if available, otherwise fallback to mock data
          setPanels(panelsData && panelsData.length > 0 ? panelsData : [
            { id: 'd-75-60-300', name: 'Panel Dinding Standard', type: 'dinding', harga: 150000 },
            { id: 'd-100-60-300', name: 'Panel Dinding Premium', type: 'dinding', harga: 250000 },
            { id: 'l-75-30-300', name: 'Panel Lantai Standard', type: 'lantai', harga: 200000 },
          ]);
        }

        // Load ongkir directly from Supabase
        const { data: ongkirData, error: ongkirError } = await supabase
          .from('master_ongkir')
          .select('*')
          .order('provinsi', { ascending: true });

        if (ongkirError) {
          console.error('Error fetching ongkir from Supabase:', ongkirError);
        } else {
          // Use database data if available, otherwise fallback to mock data
          setOngkir(ongkirData && ongkirData.length > 0 ? ongkirData : [
            { provinsi: 'DKI Jakarta', biaya: 50000 },
            { provinsi: 'Jawa Barat', biaya: 75000 },
            { provinsi: 'Jawa Tengah', biaya: 100000 },
          ]);
        }
      } else {
        // Supabase not configured, use fallback data
        console.log('Supabase not configured, using fallback data');
        setPanels([
          { id: 'd-75-60-300', name: 'Panel Dinding Standard', type: 'dinding', harga: 150000 },
          { id: 'd-100-60-300', name: 'Panel Dinding Premium', type: 'dinding', harga: 250000 },
          { id: 'l-75-30-300', name: 'Panel Lantai Standard', type: 'lantai', harga: 200000 },
        ]);
        setOngkir([
          { provinsi: 'DKI Jakarta', biaya: 50000 },
          { provinsi: 'Jawa Barat', biaya: 75000 },
          { provinsi: 'Jawa Tengah', biaya: 100000 },
        ]);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
      // Fallback to mock data if everything fails
      setPanels([
        { id: 'd-75-60-300', name: 'Panel Dinding Standard', type: 'dinding', harga: 150000 },
        { id: 'd-100-60-300', name: 'Panel Dinding Premium', type: 'dinding', harga: 250000 },
        { id: 'l-75-30-300', name: 'Panel Lantai Standard', type: 'lantai', harga: 200000 },
      ]);
      setOngkir([
        { provinsi: 'DKI Jakarta', biaya: 50000 },
        { provinsi: 'Jawa Barat', biaya: 75000 },
        { provinsi: 'Jawa Tengah', biaya: 100000 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Panel handlers
  const handleAddPanel = () => {
    // TODO: Implement modal for adding panel
    alert('Fitur tambah panel akan diimplementasikan');
  };

  const handleEditPanel = (panel: Panel) => {
    // TODO: Implement modal for editing panel
    alert('Fitur edit panel akan diimplementasikan');
  };

  const handleDeletePanel = async (id: string, name: string) => {
    if (!confirm(`Hapus panel "${name}"? Ini akan memengaruhi dokumen yang menggunakan panel ini.`)) return;

    if (!supabase) {
      alert("Database tidak tersedia");
      return;
    }

    try {
      const { error } = await supabase
        .from("master_panel")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("Panel berhasil dihapus");
      loadMasterData();
    } catch (err) {
      console.error("Gagal hapus panel:", err);
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  // Ongkir handlers
  const handleAddOngkir = () => {
    // TODO: Implement modal for adding ongkir
    alert('Fitur tambah ongkir akan diimplementasikan');
  };

  const handleEditOngkir = (ongkir: Ongkir) => {
    // TODO: Implement modal for editing ongkir
    alert('Fitur edit ongkir akan diimplementasikan');
  };

  const handleDeleteOngkir = async (provinsi: string) => {
    if (!confirm(`Hapus ongkir untuk "${provinsi}"?`)) return;

    if (!supabase) {
      alert("Database tidak tersedia");
      return;
    }

    try {
      const { error } = await supabase
        .from("master_ongkir")
        .delete()
        .eq("provinsi", provinsi);

      if (error) throw error;

      alert("Ongkir berhasil dihapus");
      loadMasterData();
    } catch (err) {
      console.error("Gagal hapus ongkir:", err);
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className='p-10 text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto'></div>
        <p className='mt-4 text-gray-600'>Memuat data master...</p>
      </div>
    );
  }

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-brand-primary'>Master Data</h1>
        <p className='text-gray-600'>Kelola data panel dan ongkos kirim</p>
      </div>

      {/* Master Data Cards */}
      {!selectedMasterData && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          {/* Panel Card */}
          <div
            onClick={() => setSelectedMasterData('panel')}
            className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-brand-primary'
          >
            <div className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Data Panel</h3>
              <p className='text-gray-600 text-sm'>Kelola data panel dinding dan lantai untuk proyek konstruksi</p>
            </div>
          </div>

          {/* Ongkir Card */}
          <div
            onClick={() => setSelectedMasterData('ongkir')}
            className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-brand-primary'
          >
            <div className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Data Ongkos Kirim</h3>
              <p className='text-gray-600 text-sm'>Kelola biaya pengiriman berdasarkan provinsi tujuan</p>
            </div>
          </div>
        </div>
      )}

      {/* Panel Table */}
      {selectedMasterData === 'panel' && (
        <MasterPanelTable
          data={panels}
          loading={loading}
          search={searchPanel}
          onSearchChange={setSearchPanel}
          onAdd={handleAddPanel}
          onEdit={handleEditPanel}
          onDelete={handleDeletePanel}
        />
      )}

      {/* Ongkir Table */}
      {selectedMasterData === 'ongkir' && (
        <MasterOngkirTable
          data={ongkir}
          loading={loading}
          search={searchOngkir}
          onSearchChange={setSearchOngkir}
          onAdd={handleAddOngkir}
          onEdit={handleEditOngkir}
          onDelete={handleDeleteOngkir}
        />
      )}
    </div>
  );
}
