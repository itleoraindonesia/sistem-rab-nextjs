import { useState } from "react";
import { useMasterData } from "../context/MasterDataContext";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";
import supabase from "../lib/supabaseClient"; // Pastikan import ini BENAR

export default function MasterData() {
  const { panels, ongkir, refresh } = useMasterData();
  const [editingPanel, setEditingPanel] = useState(null);
  const [editingOngkir, setEditingOngkir] = useState(null);
  const [newPanel, setNewPanel] = useState(null);
  const [newOngkir, setNewOngkir] = useState(null);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  // ========== PANEL FUNCTIONS ==========
  const handleSavePanel = async () => {
    try {
      const data = {
        id: editingPanel ? editingPanel.id : newPanel.id,
        name: editingPanel ? editingPanel.name : newPanel.name,
        type: editingPanel ? editingPanel.type : newPanel.type,
        harga: editingPanel ? editingPanel.harga : newPanel.harga,
        berat: editingPanel ? editingPanel.berat || 0 : newPanel.berat || 0,
        volume: editingPanel ? editingPanel.volume || 0 : newPanel.volume || 0,
        jumlah_per_truck: editingPanel
          ? editingPanel.jumlah_per_truck || 0
          : newPanel.jumlah_per_truck || 0,
        keterangan: editingPanel
          ? editingPanel.keterangan || ""
          : newPanel.keterangan || "",
      };

      let result;
      if (editingPanel) {
        result = await supabase
          .from("master_panel")
          .update(data)
          .eq("id", editingPanel.id);
      } else {
        result = await supabase.from("master_panel").insert(data);
      }

      if (result.error) throw result.error;

      alert(`${editingPanel ? "Edit" : "Tambah"} panel berhasil`);
      setEditingPanel(null);
      setNewPanel(null);
      refresh();
    } catch (err) {
      console.error("Gagal simpan panel:", err);
      alert("Gagal menyimpan: " + err.message);
    }
  };

  const hapusPanel = async (id, nama) => {
    if (
      !confirm(
        `Hapus panel "${nama}"? Ini akan memengaruhi dokumen yang menggunakan panel ini.`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("master_panel")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("Panel berhasil dihapus");
      refresh();
    } catch (err) {
      console.error("Gagal hapus panel:", err);
      alert("Gagal menghapus: " + err.message);
    }
  };

  // ========== ONGKIR FUNCTIONS ==========
  const handleSaveOngkir = async () => {
    try {
      const data = {
        provinsi: editingOngkir ? editingOngkir.provinsi : newOngkir.provinsi,
        biaya: editingOngkir ? editingOngkir.biaya : newOngkir.biaya,
      };

      let result;
      if (editingOngkir) {
        result = await supabase
          .from("master_ongkir")
          .update(data)
          .eq("provinsi", editingOngkir.provinsi);
      } else {
        result = await supabase.from("master_ongkir").insert(data);
      }

      if (result.error) throw result.error;

      alert(`${editingOngkir ? "Edit" : "Tambah"} ongkir berhasil`);
      setEditingOngkir(null);
      setNewOngkir(null);
      refresh();
    } catch (err) {
      console.error("Gagal simpan ongkir:", err);
      alert("Gagal menyimpan: " + err.message);
    }
  };

  const hapusOngkir = async (provinsi) => {
    if (!confirm(`Hapus ongkir untuk "${provinsi}"?`)) return;

    try {
      const { error } = await supabase
        .from("master_ongkir")
        .delete()
        .eq("provinsi", provinsi);

      if (error) throw error;

      alert("Ongkir berhasil dihapus");
      refresh();
    } catch (err) {
      console.error("Gagal hapus ongkir:", err);
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-brand-primary'>Master Data</h1>
        <p className='text-gray-600'>Kelola data panel dan ongkos kirim</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Panel Section */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-4 border-b flex justify-between items-center'>
            <h2 className='font-semibold'>Daftar Panel</h2>
            <button
              onClick={() =>
                setNewPanel({
                  id: "",
                  name: "",
                  type: "dinding",
                  harga: 0,
                  berat: 0,
                  volume: 0,
                  jumlah_per_truck: 0,
                  keterangan: "",
                })
              }
              className='bg-brand-primary hover:bg-brand-dark text-white p-2 rounded-lg'
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Form Tambah Panel */}
          {newPanel && (
            <div className='p-4 border-b bg-blue-50'>
              <h3 className='font-medium mb-3'>Tambah Panel Baru</h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>ID</label>
                  <input
                    value={newPanel.id}
                    onChange={(e) =>
                      setNewPanel({ ...newPanel, id: e.target.value })
                    }
                    className='w-full p-2 border rounded'
                    placeholder='d-75-60-300'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    Nama Panel
                  </label>
                  <input
                    value={newPanel.name}
                    onChange={(e) =>
                      setNewPanel({ ...newPanel, name: e.target.value })
                    }
                    className='w-full p-2 border rounded'
                    required
                  />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      Tipe
                    </label>
                    <select
                      value={newPanel.type}
                      onChange={(e) =>
                        setNewPanel({ ...newPanel, type: e.target.value })
                      }
                      className='w-full p-2 border rounded'
                      required
                    >
                      <option value='dinding'>Dinding</option>
                      <option value='lantai'>Lantai</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      Harga (Rp)
                    </label>
                    <input
                      type='number'
                      value={newPanel.harga}
                      onChange={(e) =>
                        setNewPanel({
                          ...newPanel,
                          harga: parseInt(e.target.value) || 0,
                        })
                      }
                      className='w-full p-2 border rounded'
                      required
                    />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={handleSavePanel}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2'
                  >
                    <Save size={16} /> Simpan
                  </button>
                  <button
                    onClick={() => setNewPanel(null)}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center gap-2'
                  >
                    <X size={16} /> Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Edit Panel */}
          {editingPanel && (
            <div className='p-4 border-b bg-yellow-50'>
              <h3 className='font-medium mb-3'>
                Edit Panel: {editingPanel.name}
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>ID</label>
                  <input
                    value={editingPanel.id}
                    onChange={(e) =>
                      setEditingPanel({ ...editingPanel, id: e.target.value })
                    }
                    className='w-full p-2 border rounded bg-gray-100'
                    disabled
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    Nama Panel
                  </label>
                  <input
                    value={editingPanel.name}
                    onChange={(e) =>
                      setEditingPanel({ ...editingPanel, name: e.target.value })
                    }
                    className='w-full p-2 border rounded'
                    required
                  />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      Tipe
                    </label>
                    <select
                      value={editingPanel.type}
                      onChange={(e) =>
                        setEditingPanel({
                          ...editingPanel,
                          type: e.target.value,
                        })
                      }
                      className='w-full p-2 border rounded'
                      required
                    >
                      <option value='dinding'>Dinding</option>
                      <option value='lantai'>Lantai</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      Harga (Rp)
                    </label>
                    <input
                      type='number'
                      value={editingPanel.harga}
                      onChange={(e) =>
                        setEditingPanel({
                          ...editingPanel,
                          harga: parseInt(e.target.value) || 0,
                        })
                      }
                      className='w-full p-2 border rounded'
                      required
                    />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={handleSavePanel}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2'
                  >
                    <Save size={16} /> Simpan Perubahan
                  </button>
                  <button
                    onClick={() => setEditingPanel(null)}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center gap-2'
                  >
                    <X size={16} /> Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Panel */}
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
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
                    Harga
                  </th>
                  <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {panels.map((panel) => (
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
                    <td className='px-4 py-2 text-right text-sm font-medium text-gray-900'>
                      {formatRupiah(panel.harga)}
                    </td>
                    <td className='px-4  py-5  text-right flex'>
                      <button
                        onClick={() => setEditingPanel({ ...panel })} // ← KUNCI: spread object!
                        className='hover:scale-110 cursor-pointer text-brand-primary hover:text-brand-dark mr-3'
                        title='Edit'
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => hapusPanel(panel.id, panel.name)}
                        className='hover:scale-110 cursor-pointer text-red-600 hover:text-red-900'
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

        {/* Ongkir Section */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-4 border-b flex justify-between items-center'>
            <h2 className='font-semibold'>Ongkos Kirim</h2>
            <button
              onClick={() =>
                setNewOngkir({
                  provinsi: "",
                  biaya: 0,
                })
              }
              className='bg-brand-primary hover:bg-brand-dark text-white p-2 rounded-lg'
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Form Tambah Ongkir */}
          {newOngkir && (
            <div className='p-4 border-b bg-green-50'>
              <h3 className='font-medium mb-3'>Tambah Ongkos Kirim</h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    Provinsi
                  </label>
                  <input
                    value={newOngkir.provinsi}
                    onChange={(e) =>
                      setNewOngkir({ ...newOngkir, provinsi: e.target.value })
                    }
                    className='w-full p-2 border rounded'
                    placeholder='Daerah Istimewa Yogyakarta'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    Biaya (Rp)
                  </label>
                  <input
                    type='number'
                    value={newOngkir.biaya}
                    onChange={(e) =>
                      setNewOngkir({
                        ...newOngkir,
                        biaya: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full p-2 border rounded'
                    required
                  />
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={handleSaveOngkir}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2'
                  >
                    <Save size={16} /> Simpan
                  </button>
                  <button
                    onClick={() => setNewOngkir(null)}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center gap-2'
                  >
                    <X size={16} /> Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Edit Ongkir */}
          {editingOngkir && (
            <div className='p-4 border-b bg-yellow-50'>
              <h3 className='font-medium mb-3'>
                Edit Ongkir: {editingOngkir.provinsi}
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    Provinsi
                  </label>
                  <input
                    value={editingOngkir.provinsi}
                    onChange={(e) =>
                      setEditingOngkir({
                        ...editingOngkir,
                        provinsi: e.target.value,
                      })
                    }
                    className='w-full p-2 border rounded bg-gray-100'
                    disabled
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    Biaya (Rp)
                  </label>
                  <input
                    type='number'
                    value={editingOngkir.biaya}
                    onChange={(e) =>
                      setEditingOngkir({
                        ...editingOngkir,
                        biaya: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full p-2 border rounded'
                    required
                  />
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={handleSaveOngkir}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2'
                  >
                    <Save size={16} /> Simpan Perubahan
                  </button>
                  <button
                    onClick={() => setEditingOngkir(null)}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center gap-2'
                  >
                    <X size={16} /> Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Ongkir */}
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Provinsi
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
                {ongkir.map((item) => (
                  <tr key={item.provinsi} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 text-sm font-medium text-gray-900'>
                      {item.provinsi}
                    </td>
                    <td className='px-4 py-2 text-right text-sm font-semibold text-gray-900'>
                      {formatRupiah(item.biaya)}
                    </td>
                    <td className='px-4 py-2 text-right'>
                      <button
                        onClick={() => setEditingOngkir({ ...item })} // ← KUNCI: spread object!
                        className='text-brand-primary hover:text-brand-dark mr-3'
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => hapusOngkir(item.provinsi)}
                        className='text-red-600 hover:text-red-900'
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
      </div>
    </div>
  );
}
