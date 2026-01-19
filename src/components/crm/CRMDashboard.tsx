'use client';

import { useState, useEffect } from 'react';
import { Client, supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

interface DashboardStats {
  total: number;
  prospek: number;
  closing: number;
  byKabupaten: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  byWeek: { day: string; date: string; count: number }[];
}

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))'
];

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    prospek: 0,
    closing: 0,
    byKabupaten: [],
    byStatus: [],
    byWeek: [],
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

    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, created_at, status, kabupaten, kebutuhan')
        .order('created_at', { ascending: false });

      // Type assertion to fix TypeScript errors
      const typedClients = clients as Client[] | null;

      if (error) throw error;

      if (!typedClients || typedClients.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Calculate Summary Stats
      const prospekStatus = ['IG_Lead', 'WA_Negotiation', 'Quotation_Sent', 'Follow_Up'];
      const closingStatus = ['Invoice_Deal', 'WIP', 'Finish'];

      const prospekCount = typedClients.filter(c => c.status && prospekStatus.includes(c.status)).length;
      const closingCount = typedClients.filter(c => c.status && closingStatus.includes(c.status)).length;

      // 2. By Kabupaten
      const kabupatenMap = new Map<string, number>();
      typedClients.forEach(c => {
        if (c.kabupaten) {
          kabupatenMap.set(c.kabupaten, (kabupatenMap.get(c.kabupaten) || 0) + 1);
        }
      });
      const byKabupaten = Array.from(kabupatenMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // 3. By Status (Pipeline)
      const statusMap = new Map<string, number>();
      typedClients.forEach(c => {
        const s = c.status || 'Unknown';
        statusMap.set(s, (statusMap.get(s) || 0) + 1);
      });
      
      // Define specific order for pipeline
      const statusOrder = ['IG_Lead', 'WA_Negotiation', 'Quotation_Sent', 'Follow_Up', 'Invoice_Deal', 'WIP', 'Finish', 'Cancelled'];
      const byStatus = statusOrder.map(s => ({
        name: s.replace(/_/g, ' '),
        value: statusMap.get(s) || 0
      })).filter(item => item.value > 0);
      
      // Add any other statuses not in the ordered list at the end
      Array.from(statusMap.entries()).forEach(([key, value]) => {
         if (!statusOrder.includes(key)) {
             byStatus.push({ name: key, value });
         }
      });


      // 4. By Week (last 7 days including today)
      const weekMap = new Map<string, number>();
      const today = new Date();

      // Initialize last 7 days with 0 count
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        weekMap.set(dateKey, 0);
      }

      // Count clients per day
      typedClients.forEach(c => {
        const clientDate = new Date(c.created_at);
        const dateKey = clientDate.toISOString().split('T')[0];

        // Only count if within last 7 days
        if (weekMap.has(dateKey)) {
          weekMap.set(dateKey, (weekMap.get(dateKey) || 0) + 1);
        }
      });

      // Convert to chart format with day names
      const byWeek = Array.from(weekMap.entries())
        .map(([dateKey, count]) => {
          const date = new Date(dateKey + 'T00:00:00');
          const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const dayName = dayNames[date.getDay()];

          return {
            day: dayName,
            date: dateKey,
            count: count
          };
        });

      setStats({
        total: typedClients.length,
        prospek: prospekCount,
        closing: closingCount,
        byKabupaten,
        byStatus,
        byWeek,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12 text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="flex justify-center py-12 text-red-500">Error: {error}</div>;
  if (stats.total === -1) return <div className="flex justify-center py-12 text-orange-500">Database connection unavailable</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="col-span-2 md:col-span-1 bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Data</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-primary/40">
          <div className="text-sm text-gray-600 mb-1">Prospek (Pipeline)</div>
          <div className="text-2xl md:text-3xl font-bold text-primary/80">{stats.prospek}</div>
          <p className="text-xs text-gray-400 mt-1">Lead, Nego, Quotation, Follow Up</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-primary">
          <div className="text-sm text-gray-600 mb-1">Closing (Deal)</div>
          <div className="text-2xl md:text-3xl font-bold text-primary">{stats.closing}</div>
          <p className="text-xs text-gray-400 mt-1">Invoice, WIP, Finish</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Status Pipeline */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">📊 Pipeline Status</h3>
          {stats.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={110} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))">
                  {stats.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        {/* By Kabupaten */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">📍 Sebaran Wilayah (Top 10)</h3>
          {stats.byKabupaten.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byKabupaten}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">📈 Tren Data Masuk (7 Hari Terakhir)</h3>
        {stats.byWeek.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.byWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => `Hari: ${label}`}
                formatter={(value, name) => [value, 'Jumlah Data']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 10 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>
    </div>
  );
}
