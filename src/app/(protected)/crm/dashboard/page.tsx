'use client';

import CRMDashboard from '@/components/crm/CRMDashboard';
import ConnectionStatus from '@/components/crm/ConnectionStatus';
import DateRangePicker from '@/components/ui/DateRangePicker';
import Link from 'next/link';
import { useState } from 'react';
import { DateRangeFilter } from '@/hooks/useClients';

export default function CRMDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setDateRange({ startDate: start, endDate: end });
  };

  return (
    <div className="min-h-screen bg-white">
      <ConnectionStatus />
      <div>
        {/* Header & Actions */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">CRM Dashboard</h1>
            <p className="text-gray-600">Statistik dan overview data client & prospek</p>
          </div>

          <div className="flex gap-3 justify-between flex-wrap">
            <DateRangePicker
              startDate={dateRange.startDate ?? null}
              endDate={dateRange.endDate ?? null}
              onDateChange={handleDateChange}
              className="flex-shrink-0"
            />
            <Link
              href="/crm/clients"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Lihat Semua Client
            </Link>
            <Link
              href="/crm/input"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              + Input Data Baru
            </Link>
          </div>
        </div>

        {/* Dashboard */}
        <CRMDashboard dateRange={dateRange} />
      </div>
    </div>
  );
}
