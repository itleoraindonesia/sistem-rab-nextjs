'use client';

import CRMDashboard from '@/components/crm/CRMDashboard';
import ConnectionStatus from '@/components/crm/ConnectionStatus';
import PrintReportModal from '@/components/crm/PrintReportModal';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState } from 'react';
import { DateRangeFilter } from '@/hooks/useClients';
import { Printer } from 'lucide-react';

export default function CRMDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setDateRange({ startDate: start, endDate: end });
  };

  return (
    <div className="min-h-screen bg-white">
      <ConnectionStatus />
      <div>
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
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
            <Button
              variant="outline"
              onClick={() => setIsPrintModalOpen(true)}
            >
              <Printer className="w-4 h-4 mr-2" />
              Cetak Report
            </Button>
            <Button variant="outline" asChild>
              <Link href="/crm/clients">Lihat Semua Client</Link>
            </Button>
            <Button asChild>
              <Link href="/crm/input">+ Input Data Baru</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard */}
        <CRMDashboard dateRange={dateRange} />
      </div>

      {/* Print Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
