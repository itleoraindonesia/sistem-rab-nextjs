"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase/client";
import { MasterOngkirDataTable } from "../../../../components/tables/MasterOngkirDataTable";

interface Ongkir {
  id?: string;
  provinsi: string;
  biaya: number;
  kabupaten?: string;
}

export default function MasterOngkirPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [ongkir, setOngkir] = useState<Ongkir[]>([]);
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
 <div className=' '>
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

  // Load ongkir data
  const loadOngkir = useCallback(async () => {
    try {
      setLoading(true);

      if (supabase) {
        const { data: ongkirData, error: ongkirError } = await supabase
          .from('master_ongkir')
          .select('*')
          .order('provinsi', { ascending: true });

        if (ongkirError) {
          console.error('Error fetching ongkir from Supabase:', ongkirError);
        } else {
          setOngkir(ongkirData && ongkirData.length > 0 ? ongkirData : [
            { provinsi: 'DKI Jakarta', biaya: 50000 },
            { provinsi: 'Jawa Barat', biaya: 75000 },
            { provinsi: 'Jawa Tengah', biaya: 100000 },
          ]);
        }
      } else {
        setOngkir([
          { provinsi: 'DKI Jakarta', biaya: 50000 },
          { provinsi: 'Jawa Barat', biaya: 75000 },
          { provinsi: 'Jawa Tengah', biaya: 100000 },
        ]);
      }
    } catch (error) {
      console.error('Error loading ongkir:', error);
      setOngkir([
        { provinsi: 'DKI Jakarta', biaya: 50000 },
        { provinsi: 'Jawa Barat', biaya: 75000 },
        { provinsi: 'Jawa Tengah', biaya: 100000 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOngkir();
  }, [loadOngkir]);

  // Ongkir handlers
  const handleAddOngkir = () => {
    alert('Fitur tambah ongkir akan diimplementasikan');
  };

  const handleEditOngkir = (ongkir: Ongkir) => {
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
      loadOngkir();
    } catch (err) {
      console.error("Gagal hapus ongkir:", err);
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  return (
 <div className=' '>
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold text-brand-primary'>Data Ongkos Kirim</h1>
          <p className='text-gray-600'>Kelola biaya pengiriman berdasarkan provinsi tujuan</p>
        </div>

        {/* Ongkir Table */}
        <MasterOngkirDataTable
          data={ongkir}
          loading={loading}
          onAdd={handleAddOngkir}
          onEdit={handleEditOngkir}
          onDelete={handleDeleteOngkir}
        />
      </div>
    </div>
  );
}
