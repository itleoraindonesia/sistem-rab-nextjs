'use client';

import { useState, useEffect } from 'react';
import { Client, supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardStats {
  total: number;
  thisMonth: number;
  thisWeek: number;
  byLokasi: { name: string; value: number }[];
  byKebutuhan: { name: string; value: number }[];
  byMonth: { name: string; value: number }[];
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    byLokasi: [],
    byKebutuhan: [],
    byMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!supabase) {
      console.error('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!clients) {
        setLoading(false);
        return;
      }

      // Calculate stats
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisWeek = clients.filter(c => new Date(c.created_at) >= startOfWeek).length;
      const thisMonth = clients.filter(c => new Date(c.created_at) >= startOfMonth).length;

      // By Lokasi (Kabupaten/Kota)
      const lokasiMap = new Map<string, number>();
      clients.forEach(c => {
        const lokasi = c.lokasi.trim();
        lokasiMap.set(lokasi, (lokasiMap.get(lokasi) || 0) + 1);
      });
      const byLokasi = Array.from(lokasiMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // By Kebutuhan
      const kebutuhanMap = new Map<string, number>();
      clients.forEach(c => {
        kebutuhanMap.set(c.kebutuhan, (kebutuhanMap.get(c.kebutuhan) || 0) + 1);
      });
      const byKebutuhan = Array.from(kebutuhanMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // By Month (last 6 months)
      const monthMap = new Map<string, number>();
      clients.forEach(c => {
        const date = new Date(c.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
      });

      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
        last6Months.push({
          name: monthName,
          value: monthMap.get(monthKey) || 0,
        });
      }

      setStats({
        total: clients.length,
        thisMonth,
        thisWeek,
        byLokasi,
        byKebutuhan,
        byMonth: last6Months,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Clients</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-3xl font-bold text-blue-600">{stats.thisMonth}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">This Week</div>
          <div className="text-3xl font-bold text-green-600">{stats.thisWeek}</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Lokasi */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">📍 Clients by Lokasi</h3>
          {stats.byLokasi.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byLokasi}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* By Kebutuhan */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">📦 Clients by Kebutuhan</h3>
          {stats.byKebutuhan.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byKebutuhan} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Leads Trend */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">📈 Leads Trend (Last 6 Months)</h3>
        {stats.byMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
