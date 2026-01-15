'use client';

import { useState, useEffect } from 'react';
import { Client, supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardStats {
  total: number;
  thisMonth: number;
  thisWeek: number;
  byKabupaten: { name: string; value: number }[];
  byKebutuhan: { name: string; value: number }[];
  byMonth: { name: string; value: number }[];
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    byKabupaten: [],
    byKebutuhan: [],
    byMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    console.log('CRMDashboard: Starting to fetch stats...');

    if (!supabase) {
      console.error('CRMDashboard: Supabase client not available');
      setStats(prevStats => ({ ...prevStats, total: -1 })); // Special flag for no supabase
      setLoading(false);
      return;
    }

    console.log('CRMDashboard: Supabase client available, fetching data...');

    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('CRMDashboard: Query result:', { clients: clients?.length, error });

      // Type assertion to fix TypeScript errors
      const typedClients = clients as Client[] | null;

      if (error) throw error;

      if (!typedClients || typedClients.length === 0) {
        console.log('CRMDashboard: No clients data available');
        setLoading(false);
        return;
      }

      console.log('CRMDashboard: Processing', typedClients.length, 'clients');

      // Calculate stats
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisWeek = typedClients.filter(c => new Date(c.created_at) >= startOfWeek).length;
      const thisMonth = typedClients.filter(c => new Date(c.created_at) >= startOfMonth).length;

      // By Kabupaten
      const kabupatenMap = new Map<string, number>();
      typedClients.forEach(c => {
        if (c.lokasi) {
          kabupatenMap.set(c.lokasi, (kabupatenMap.get(c.lokasi) || 0) + 1);
        }
      });
      console.log('CRMDashboard: kabupatenMap size:', kabupatenMap.size, 'entries:', Array.from(kabupatenMap.entries()));
      const byKabupaten = Array.from(kabupatenMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      console.log('CRMDashboard: byKabupaten:', byKabupaten);

      // By Kebutuhan
      const kebutuhanMap = new Map<string, number>();
      typedClients.forEach(c => {
        if (c.kebutuhan) {
          kebutuhanMap.set(c.kebutuhan, (kebutuhanMap.get(c.kebutuhan) || 0) + 1);
        }
      });
      console.log('CRMDashboard: kebutuhanMap size:', kebutuhanMap.size, 'entries:', Array.from(kebutuhanMap.entries()));
      const byKebutuhan = Array.from(kebutuhanMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      console.log('CRMDashboard: byKebutuhan:', byKebutuhan);

      // By Month (last 6 months)
      const monthMap = new Map<string, number>();
      typedClients.forEach(c => {
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

      console.log('CRMDashboard: Stats calculated:', {
        total: typedClients.length,
        thisMonth,
        thisWeek,
        byKabupaten: byKabupaten.length,
        byKebutuhan: byKebutuhan.length,
        byMonth: last6Months.length
      });

      setStats({
        total: typedClients.length,
        thisMonth,
        thisWeek,
        byKabupaten,
        byKebutuhan,
        byMonth: last6Months,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
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

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ Error loading dashboard</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (stats.total === -1) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-orange-500 mb-2">⚠️ Database connection unavailable</div>
          <div className="text-gray-600 text-sm">
            Please check your Supabase configuration and try again.
          </div>
        </div>
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
          <h3 className="text-lg font-semibold mb-4">📍 Clients by Kabupaten</h3>
          {stats.byKabupaten.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byKabupaten}>
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
