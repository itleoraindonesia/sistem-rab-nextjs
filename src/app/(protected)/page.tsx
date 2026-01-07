'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Eye, MapPin, Plus, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    approved: 0,
  });
  const [recentRAB, setRecentRAB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      if (supabase) {
        // Get statistics from Supabase (exclude soft deleted)
        const [totalResult, draftResult, sentResult, approvedResult, recentResult] = await Promise.all([
          supabase.from('rab_documents').select('*', { count: 'exact', head: true }).is("deleted_at", null),
          supabase.from('rab_documents').select('*', { count: 'exact', head: true }).eq('status', 'draft').is("deleted_at", null),
          supabase.from('rab_documents').select('*', { count: 'exact', head: true }).eq('status', 'sent').is("deleted_at", null),
          supabase.from('rab_documents').select('*', { count: 'exact', head: true }).eq('status', 'approved').is("deleted_at", null),
          supabase.from('rab_documents').select('*').is("deleted_at", null).order('created_at', { ascending: false }).limit(3)
        ]);

        setStats({
          total: totalResult.count || 0,
          draft: draftResult.count || 0,
          sent: sentResult.count || 0,
          approved: approvedResult.count || 0,
        });

        setRecentRAB(recentResult.data || []);
      } else {
        // Supabase not configured, use fallback data
        console.log('Supabase not configured, using fallback data');
        setStats({
          total: 3,
          draft: 1,
          sent: 1,
          approved: 1,
        });
        setRecentRAB([
          {
            id: 1,
            no_ref: "RAB-001",
            project_name: "Proyek Gedung A",
            location: "Jakarta",
            status: "draft",
            created_at: "2024-01-15T10:00:00Z"
          },
          {
            id: 2,
            no_ref: "RAB-002",
            project_name: "Renovasi Kantor B",
            location: "Bandung",
            status: "sent",
            created_at: "2024-01-10T10:00:00Z"
          },
          {
            id: 3,
            no_ref: "RAB-003",
            project_name: "Pembangunan Warehouse",
            location: "Surabaya",
            status: "approved",
            created_at: "2024-01-05T10:00:00Z"
          }
        ]);
      }
    } catch (err) {
      console.error("Gagal load dashboard:", err);
      // Fallback to mock data if Supabase fails
      setStats({
        total: 3,
        draft: 1,
        sent: 1,
        approved: 1,
      });
      setRecentRAB([
        {
          id: 1,
          no_ref: "RAB-001",
          project_name: "Proyek Gedung A",
          location: "Jakarta",
          status: "draft",
          created_at: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          no_ref: "RAB-002",
          project_name: "Renovasi Kantor B",
          location: "Bandung",
          status: "sent",
          created_at: "2024-01-10T10:00:00Z"
        },
        {
          id: 3,
          no_ref: "RAB-003",
          project_name: "Pembangunan Warehouse",
          location: "Surabaya",
          status: "approved",
          created_at: "2024-01-05T10:00:00Z"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className='p-10 text-center'>Memuat dashboard...</div>;
  }

  // Fungsi untuk mengonversi nilai status ke teks bahasa Indonesia
  const translateStatus = (status: string) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "sent":
        return "Terkirim";
      case "approved":
        return "Disetujui";
      default:
        return status; // Jika status tidak dikenali, kembalikan nilai aslinya
    }
  };

  return (
    <div className='w-full max-w-7xl mx-auto p-4 md:p-0'>
      <div className='mb-4'>
        <h1 className='text-2xl font-bold text-brand-primary'>Dashboard</h1>
        <p className='text-gray-600'>Ringkasan aktivitas sistem RAB Panel</p>
      </div>

      {/* Statistik */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8'>
        {[
          {
            name: "Total Dokumen",
            value: stats.total,
            bgColor: "bg-blue-50",
            textColor: "text-blue-800",
            dotColor: "text-blue-500",
          },
          {
            name: "Draft",
            value: stats.draft,
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-800",
            dotColor: "text-yellow-500",
          },
          {
            name: "Terkirim",
            value: stats.sent,
            bgColor: "bg-indigo-50",
            textColor: "text-indigo-800",
            dotColor: "text-indigo-500",
          },
          {
            name: "Disetujui",
            value: stats.approved,
            bgColor: "bg-green-50",
            textColor: "text-green-800",
            dotColor: "text-green-500",
          },
        ].map((stat) => (
          <div
            key={stat.name}
            className={`${stat.bgColor} rounded-lg shadow p-4 md:p-6 border border-gray-100`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p
                  className={`text-xs md:text-sm font-medium ${stat.textColor}`}
                >
                  {stat.name}
                </p>
                <p className='text-xl md:text-2xl font-bold text-gray-900'>
                  {stat.value}
                </p>
              </div>
              <div className={`text-sm font-medium ${stat.dotColor}`}>•</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dokumen Terbaru - Responsive List */}
      <div className='bg-white rounded-lg shadow mb-8'>
        <div className='p-6 border-b'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Dokumen Terbaru
            </h2>
            <Link
              href='/rab'
              className='text-sm text-brand-primary hover:text-brand-dark font-medium'
            >
              Lihat Semua
            </Link>
          </div>
        </div>

        <div className='p-4 md:p-6'>
          {recentRAB.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>
              <FileText className='w-12 h-12 mx-auto text-gray-300 mb-3' />
              <p>Belum ada dokumen RAB</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentRAB.map((rab: any) => (
                <div
                  key={rab.id}
                  className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition'
                >
                  <div className='flex-1 mb-3 sm:mb-0'>
                    <div className='flex items-start gap-3'>
                      <div className='bg-gray-100 p-2 rounded-lg'>
                        <FileText className='w-5 h-5 text-gray-600' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <div className='flex items-center gap-1 text-xs text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit'>
                            {rab.no_ref}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rab.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : rab.status === "sent"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {translateStatus(rab.status)}
                          </span>
                        </div>

                        <h3 className='font-medium text-gray-900 mb-1'>
                          {rab.project_name}
                        </h3>
                        <div className='flex items-center gap-3 mb-2'>
                          <div className='flex items-center gap-1 text-xs text-gray-600'>
                            <Calendar className='w-3 h-3' />
                            <span>
                              {new Date(rab.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <div className='flex items-center gap-1 text-xs text-gray-600'>
                            <MapPin className='w-3 h-3' />
                            <span>{rab.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2 w-full sm:w-auto'>
                    <Link
                      href={`/rab/${rab.id}`}
                      className='flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition text-sm font-medium'
                    >
                      <Eye className='w-4 h-4' />
                      <span className='hidden sm:inline'>Lihat Detail</span>
                      <span className='sm:hidden'>Detail</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips Cepat */}
      <div className='mt-8 grid grid-cols-1  gap-6'>
        <div className='bg-brand-primary text-white rounded-lg p-6'>
          <h3 className='font-bold text-lg mb-2'>💡 Tips Sistem RAB Leora</h3>
          <ul className='space-y-2 text-sm opacity-90'>
            <li>• Gunakan status 'Draft' untuk simpan sementara</li>
            <li>
              • Ubah ke 'Terkirim' ketika dokumen telah akan diprint dan
              dikirimkan ke klien. Harga akan terkunci jika sudah terkirim.
            </li>
            <li>
              • Jika sudah disetujui kilen, maka ubah dokumen ke "Disetujui"
              maka dokumen sudah terkunci.
            </li>
            <li>• Export Excel untuk analisis lanjutan</li>
          </ul>
        </div>
      </div>

      {/* Floating Action Button for Mobile - Create New RAB */}
      <div className='md:hidden fixed bottom-20 right-4 z-50'>
        <button
          onClick={() => router.push("/rab/baru")}
          className='w-14 h-14 bg-brand-primary hover:bg-brand-dark text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95'
          aria-label='Buat RAB Baru'
          title='Buat RAB Baru'
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
