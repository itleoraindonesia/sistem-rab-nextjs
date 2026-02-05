'use client';

import { useClientStats } from '@/hooks/useClients';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))'
];

export default function CRMDashboard() {
  const { data: stats, isLoading, error, refetch, isFetching } = useClientStats();

  // Debug: Log query state
  console.log('[CRMDashboard] Query State:', {
    hasStats: !!stats,
    isLoading,
    isFetching,
    total: stats?.total,
    prospek: stats?.prospek,
    closing: stats?.closing
  });

  // Show loading ONLY on initial load (no data at all)
  if (isLoading && !stats) {
    return <div className="flex justify-center py-12 text-gray-500">Loading dashboard...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-red-500">Error: {(error as Error).message}</div>
        <div className="text-sm text-gray-500">Pastikan koneksi internet Anda aktif dan coba lagi.</div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isFetching ? '🔄 Loading...' : '🔄 Retry'}
        </button>
      </div>
    );
  }

  // If no stats after loading, return null
  if (!stats) return null;


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
                <YAxis
                  interval={0}
                  domain={[0, 'dataMax']}
                  allowDecimals={false}
                />
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
