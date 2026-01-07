'use client';

import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

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
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [editingOngkir, setEditingOngkir] = useState<Ongkir | null>(null);
  const [newPanel, setNewPanel] = useState<Panel | null>(null);
  const [newOngkir, setNewOngkir] = useState<Ongkir | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMasterData, setSelectedMasterData] = useState<'panel' | 'ongkir' | null>(null);

  // Modal states
  const [showModalPanel, setShowModalPanel] = useState(false);
  const [showModalOngkir, setShowModalOngkir] = useState(false);

  // Search states
  const [searchPanel, setSearchPanel] = useState('');
  const [searchOngkir, setSearchOngkir] = useState('');
  const [debouncedSearchPanel, setDebouncedSearchPanel] = useState('');
  const [debouncedSearchOngkir, setDebouncedSearchOngkir] = useState('');

  // useTransition for non-blocking search
  const [isPending, startTransition] = useTransition();

  // Load master data on mount
  useEffect(() => {
    loadMasterData();
  }, []);

  // Debouncing search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchPanel(searchPanel);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchPanel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchOngkir(searchOngkir);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchOngkir]);

  const loadMasterData = async () => {
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
  };

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  // ========== PANEL FUNCTIONS ==========
  const handleSavePanel = async () => {
    if (!newPanel && !editingPanel) return;
    if (!supabase) {
      alert("Database tidak tersedia");
      return;
    }

    try {
      const data = {
        id: editingPanel ? editingPanel.id : newPanel!.id,
        name: editingPanel ? editingPanel.name : newPanel!.name,
        type: editingPanel ? editingPanel.type : newPanel!.type,
        harga: editingPanel ? editingPanel.harga : newPanel!.harga,
        berat: editingPanel ? editingPanel.berat || 0 : newPanel!.berat || 0,
        volume: editingPanel ? editingPanel.volume || 0 : newPanel!.volume || 0,
        jumlah_per_truck: editingPanel
          ? editingPanel.jumlah_per_truck || 0
          : newPanel!.jumlah_per_truck || 0,
        keterangan: editingPanel
          ? editingPanel.keterangan || ""
          : newPanel!.keterangan || "",
      };

      let result;
      if (editingPanel) {
        result = await (supabase as any)
          .from("master_panel")
          .update(data)
          .eq("id", editingPanel.id);
      } else {
        result = await (supabase as any).from("master_panel").insert(data);
      }

      if (result.error) throw result.error;

      alert(`${editingPanel ? "Edit" : "Tambah"} panel berhasil`);
      setEditingPanel(null);
      setNewPanel(null);
      setShowModalPanel(false);
      loadMasterData();
    } catch (err) {
      console.error("Gagal simpan panel:", err);
      alert("Gagal menyimpan: " + (err as Error).message);
    }
  };

  const hapusPanel = async (id: string, nama: string) => {
    if (
      !confirm(
        `Hapus panel "${nama}"? Ini akan memengaruhi dokumen yang menggunakan panel ini.`
      )
    )
      return;

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

  // ========== SEARCH AND FILTER FUNCTIONS ==========
  const filteredPanels = useMemo(() => {
    return panels.filter(panel =>
      panel.id.toLowerCase().includes(debouncedSearchPanel.toLowerCase()) ||
      panel.name.toLowerCase().includes(debouncedSearchPanel.toLowerCase()) ||
      panel.type.toLowerCase().includes(debouncedSearchPanel.toLowerCase())
    );
  }, [panels, debouncedSearchPanel]);

  const filteredOngkir = useMemo(() => {
    return ongkir.filter(item =>
      item.provinsi.toLowerCase().includes(debouncedSearchOngkir.toLowerCase()) ||
      (item.kabupaten && item.kabupaten.toLowerCase().includes(debouncedSearchOngkir.toLowerCase()))
    );
  }, [ongkir, debouncedSearchOngkir]);

  // ========== ONGKIR FUNCTIONS ==========
  const handleSaveOngkir = async () => {
    if (!newOngkir && !editingOngkir) return;
    if (!supabase) {
      alert("Database tidak tersedia");
      return;
    }

    try {
      const data = {
        provinsi: editingOngkir ? editingOngkir.provinsi : newOngkir!.provinsi,
        biaya: editingOngkir ? editingOngkir.biaya : newOngkir!.biaya,
        kabupaten: editingOngkir ? editingOngkir.kabupaten || "UNKNOWN" : newOngkir!.kabupaten || "UNKNOWN",
      };

      let result;
      if (editingOngkir && editingOngkir.id) {
        result = await (supabase as any)
          .from("master_ongkir")
          .update(data)
          .eq("id", editingOngkir.id);
      } else {
        result = await (supabase as any).from("master_ongkir").insert(data);
      }

      if (result.error) throw result.error;

      alert(`${editingOngkir ? "Edit" : "Tambah"} ongkir berhasil`);
      setEditingOngkir(null);
      setNewOngkir(null);
      setShowModalOngkir(false);
      loadMasterData();
    } catch (err) {
      console.error("Gagal simpan ongkir:", err);
      alert("Gagal menyimpan: " + (err as Error).message);
    }
  };

  const hapusOngkir = async (provinsi: string) => {
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
        <div className='bg-white rounded-lg shadow'>
          <div className='p-4 border-b'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold'>Daftar Panel</h2>
              <div className='flex items-center gap-4'>
                <input
                  type='text'
                  placeholder='Cari panel (ID, nama, tipe)...'
                  value={searchPanel}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchPanel(value);
                    startTransition(() => {
                      setDebouncedSearchPanel(value);
                    });
                  }}
                  className='w-64 p-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                />
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setNewPanel({
                        id: "",
                        name: "",
                        type: "dinding",
                        harga: 0,
                        berat: 0,
                        volume: 0,
                        jumlah_per_truck: 0,
                        keterangan: "",
                      });
                      setShowModalPanel(true);
                    }}
                    className='bg-brand-primary hover:bg-brand-dark text-white p-2 rounded-lg'
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedMasterData(null)}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm'
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Panel */}
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 table-auto'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    ID
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Nama
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Tipe
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Berat (kg)
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Volume (m³)
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Jumlah/Truck
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Harga
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Keterangan
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredPanels.map((panel) => (
                  <tr key={panel.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 text-sm font-mono text-gray-700'>
                      {panel.id}
                    </td>
                    <td className='px-4 py-2 text-sm text-gray-700'>
                      {panel.name}
                    </td>
                    <td className='px-4 py-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          panel.type === "dinding"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {panel.type}
                      </span>
                    </td>
                    <td className='px-4 py-2 text-right text-sm text-gray-700'>
                      {panel.berat || 0}
                    </td>
                    <td className='px-4 py-2 text-right text-sm text-gray-700'>
                      {panel.volume || 0}
                    </td>
                    <td className='px-4 py-2 text-right text-sm text-gray-700'>
                      {panel.jumlah_per_truck || 0}
                    </td>
                    <td className='px-4 py-2 text-right text-sm font-medium text-gray-900'>
                      {formatRupiah(panel.harga)}
                    </td>
                    <td className='px-4 py-2 text-sm text-gray-700'>
                      {panel.keterangan || '-'}
                    </td>
                    <td className='px-4 py-2 text-right flex gap-2'>
                      <button
                        onClick={() => {
                          setEditingPanel({ ...panel });
                          setShowModalPanel(true);
                        }}
                        className='text-brand-primary hover:text-brand-dark'
                        title='Edit'
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => hapusPanel(panel.id, panel.name)}
                        className='text-red-600 hover:text-red-900'
                        title='Hapus'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ongkir Table */}
      {selectedMasterData === 'ongkir' && (
        <div className='bg-white rounded-lg shadow'>
          <div className='p-4 border-b'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold'>Ongkos Kirim</h2>
              <div className='flex items-center gap-4'>
                <input
                  type='text'
                  placeholder='Cari ongkir (provinsi, kabupaten)...'
                  value={searchOngkir}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchOngkir(value);
                    startTransition(() => {
                      setDebouncedSearchOngkir(value);
                    });
                  }}
                  className='w-64 p-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                />
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setNewOngkir({
                        provinsi: "",
                        biaya: 0,
                        kabupaten: "UNKNOWN",
                      });
                      setShowModalOngkir(true);
                    }}
                    className='bg-brand-primary hover:bg-brand-dark text-white p-2 rounded-lg'
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedMasterData(null)}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm'
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Ongkir */}
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 table-auto'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Provinsi
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Kabupaten
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Biaya
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredOngkir.map((item, index) => (
                  <tr key={`${item.provinsi}-${item.kabupaten || 'UNKNOWN'}-${index}`} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 text-sm font-medium text-gray-900'>
                      {item.provinsi}
                    </td>
                    <td className='px-4 py-2 text-sm text-gray-700'>
                      {item.kabupaten || 'UNKNOWN'}
                    </td>
                    <td className='px-4 py-2 text-right text-sm font-semibold text-gray-900'>
                      {formatRupiah(item.biaya)}
                    </td>
                    <td className='px-4 py-2 text-right flex gap-2'>
                      <button
                        onClick={() => {
                          setEditingOngkir({ ...item });
                          setShowModalOngkir(true);
                        }}
                        className='text-brand-primary hover:text-brand-dark'
                        title='Edit'
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => hapusOngkir(item.provinsi)}
                        className='text-red-600 hover:text-red-900'
                        title='Hapus'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Panel */}
      {showModalPanel && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>
                {editingPanel ? 'Edit Panel' : 'Tambah Panel Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowModalPanel(false);
                  setEditingPanel(null);
                  setNewPanel(null);
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={24} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm text-gray-700 mb-1'>ID</label>
                <input
                  value={editingPanel ? editingPanel.id : (newPanel?.id || '')}
                  onChange={(e) => {
                    if (editingPanel) {
                      setEditingPanel({ ...editingPanel, id: e.target.value });
                    } else if (newPanel) {
                      setNewPanel({ ...newPanel, id: e.target.value });
                    }
                  }}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  placeholder='d-75-60-300'
                  disabled={!!editingPanel}
                />
              </div>

              <div>
                <label className='block text-sm text-gray-700 mb-1'>Nama Panel</label>
                <input
                  value={editingPanel ? editingPanel.name : (newPanel?.name || '')}
                  onChange={(e) => {
                    if (editingPanel) {
                      setEditingPanel({ ...editingPanel, name: e.target.value });
                    } else if (newPanel) {
                      setNewPanel({ ...newPanel, name: e.target.value });
                    }
                  }}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm text-gray-700 mb-1'>Tipe</label>
                <select
                  value={editingPanel ? editingPanel.type : (newPanel?.type || 'dinding')}
                  onChange={(e) => {
                    if (editingPanel) {
                      setEditingPanel({ ...editingPanel, type: e.target.value });
                    } else if (newPanel) {
                      setNewPanel({ ...newPanel, type: e.target.value });
                    }
                  }}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                >
                  <option value='dinding'>Dinding</option>
                  <option value='lantai'>Lantai</option>
                </select>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>Berat (kg)</label>
                  <input
                    type='number'
                    value={editingPanel?.berat ?? newPanel?.berat ?? 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editingPanel) {
                        setEditingPanel({ ...editingPanel, berat: value });
                      } else if (newPanel) {
                        setNewPanel({ ...newPanel, berat: value });
                      }
                    }}
                    className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm text-gray-700 mb-1'>Volume (m³)</label>
                  <input
                    type='number'
                    step='0.01'
                    value={editingPanel?.volume ?? newPanel?.volume ?? 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editingPanel) {
                        setEditingPanel({ ...editingPanel, volume: value });
                      } else if (newPanel) {
                        setNewPanel({ ...newPanel, volume: value });
                      }
                    }}
                    className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>Jumlah per Truck</label>
                  <input
                    type='number'
                    value={editingPanel?.jumlah_per_truck ?? newPanel?.jumlah_per_truck ?? 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (editingPanel) {
                        setEditingPanel({ ...editingPanel, jumlah_per_truck: value });
                      } else if (newPanel) {
                        setNewPanel({ ...newPanel, jumlah_per_truck: value });
                      }
                    }}
                    className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm text-gray-700 mb-1'>Harga (Rp)</label>
                  <input
                    type='number'
                    value={editingPanel?.harga ?? newPanel?.harga ?? 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (editingPanel) {
                        setEditingPanel({ ...editingPanel, harga: value });
                      } else if (newPanel) {
                        setNewPanel({ ...newPanel, harga: value });
                      }
                    }}
                    className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm text-gray-700 mb-1'>Keterangan</label>
                <textarea
                  value={editingPanel ? (editingPanel.keterangan || '') : (newPanel?.keterangan || '')}
                  onChange={(e) => {
                    if (editingPanel) {
                      setEditingPanel({ ...editingPanel, keterangan: e.target.value });
                    } else if (newPanel) {
                      setNewPanel({ ...newPanel, keterangan: e.target.value });
                    }
                  }}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  rows={3}
                />
              </div>
            </div>

            <div className='flex gap-2 mt-6'>
              <button
                onClick={handleSavePanel}
                className='flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2'
              >
                <Save size={16} />
                {editingPanel ? 'Simpan Perubahan' : 'Simpan'}
              </button>
              <button
                onClick={() => {
                  setShowModalPanel(false);
                  setEditingPanel(null);
                  setNewPanel(null);
                }}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50'
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ongkir */}
      {showModalOngkir && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>
                {editingOngkir ? 'Edit Ongkos Kirim' : 'Tambah Ongkos Kirim'}
              </h3>
              <button
                onClick={() => {
                  setShowModalOngkir(false);
                  setEditingOngkir(null);
                  setNewOngkir(null);
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={24} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm text-gray-700 mb-1'>Provinsi</label>
                <input
                  value={editingOngkir ? editingOngkir.provinsi : (newOngkir?.provinsi || '')}
                  onChange={(e) => {
                    if (editingOngkir) {
                      setEditingOngkir({ ...editingOngkir, provinsi: e.target.value });
                    } else if (newOngkir) {
                      setNewOngkir({ ...newOngkir, provinsi: e.target.value });
                    }
                  }}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  placeholder='Daerah Istimewa Yogyakarta'
                  disabled={!!editingOngkir}
                />
              </div>

              <div>
                <label className='block text-sm text-gray-700 mb-1'>Kabupaten</label>
                <input
                  value={editingOngkir ? (editingOngkir.kabupaten || '') : (newOngkir?.kabupaten || '')}
                  onChange={(e) => {
                    if (editingOngkir) {
                      setEditingOngkir({ ...editingOngkir, kabupaten: e.target.value });
                    } else if (newOngkir) {
                      setNewOngkir({ ...newOngkir, kabupaten: e.target.value });
                    }
                  }}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                  placeholder='Sleman'
                />
              </div>

              <div>
                <label className='block text-sm text-gray-700 mb-1'>Biaya (Rp)</label>
                <input
                  type='number'
                  value={editingOngkir?.biaya ?? newOngkir?.biaya ?? 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (editingOngkir) {
                      setEditingOngkir({ ...editingOngkir, biaya: value });
                    } else if (newOngkir) {
                      setNewOngkir({ ...newOngkir, biaya: value });
                    }
                  }}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex gap-2 mt-6'>
              <button
                onClick={handleSaveOngkir}
                className='flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2'
              >
                <Save size={16} />
                {editingOngkir ? 'Simpan Perubahan' : 'Simpan'}
              </button>
              <button
                onClick={() => {
                  setShowModalOngkir(false);
                  setEditingOngkir(null);
                  setNewOngkir(null);
                }}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50'
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
