"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase/client";
import { MasterPanelDataTable } from "../../../../components/tables/MasterPanelDataTable";

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

export default function MasterPanelPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(userData?.role === 'admin');
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkUserRole();
  }, []);

  // Check if user has admin access
  if (authLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='p-4 max-w-7xl mx-auto'>
        <div className='text-center py-20'>
          <div className='text-6xl mb-4'>🔒</div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Akses Terbatas
          </h1>
          <p className='text-gray-600'>
            Anda tidak memiliki akses ke halaman Master Data
          </p>
        </div>
      </div>
    );
  }

  // Load panels data
  const loadPanels = useCallback(async () => {
    try {
      setLoading(true);

      if (supabase) {
        const { data: panelsData, error: panelsError } = await supabase
          .from('master_panel')
          .select('*')
          .order('id', { ascending: false });

        if (panelsError) {
          console.error('Error fetching panels from Supabase:', panelsError);
        } else {
          setPanels(panelsData && panelsData.length > 0 ? panelsData : [
            { id: 'd-75-60-300', name: 'Panel Dinding Standard', type: 'dinding', harga: 150000 },
            { id: 'd-100-60-300', name: 'Panel Dinding Premium', type: 'dinding', harga: 250000 },
            { id: 'l-75-30-300', name: 'Panel Lantai Standard', type: 'lantai', harga: 200000 },
          ]);
        }
      } else {
        setPanels([
          { id: 'd-75-60-300', name: 'Panel Dinding Standard', type: 'dinding', harga: 150000 },
          { id: 'd-100-60-300', name: 'Panel Dinding Premium', type: 'dinding', harga: 250000 },
          { id: 'l-75-30-300', name: 'Panel Lantai Standard', type: 'lantai', harga: 200000 },
        ]);
      }
    } catch (error) {
      console.error('Error loading panels:', error);
      setPanels([
        { id: 'd-75-60-300', name: 'Panel Dinding Standard', type: 'dinding', harga: 150000 },
        { id: 'd-100-60-300', name: 'Panel Dinding Premium', type: 'dinding', harga: 250000 },
        { id: 'l-75-30-300', name: 'Panel Lantai Standard', type: 'lantai', harga: 200000 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPanels();
  }, [loadPanels]);

  // Panel handlers
  const handleAddPanel = () => {
    alert('Fitur tambah panel akan diimplementasikan');
  };

  const handleEditPanel = (panel: Panel) => {
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
      loadPanels();
    } catch (err) {
      console.error("Gagal hapus panel:", err);
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  return (
    <div className='container mx-auto'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold text-brand-primary'>Data Panel</h1>
          <p className='text-gray-600'>Kelola data panel dinding dan lantai untuk proyek konstruksi</p>
        </div>

        {/* Panel Table */}
        <MasterPanelDataTable
          data={panels}
          loading={loading}
          onAdd={handleAddPanel}
          onEdit={handleEditPanel}
          onDelete={handleDeletePanel}
        />
      </div>
    </div>
  );
}
