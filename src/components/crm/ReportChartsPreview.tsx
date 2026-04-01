'use client';

import ReactECharts from 'echarts-for-react';
import { useRef, useEffect, useCallback } from 'react';
import { DashboardStats, DateRangeFilter } from '@/hooks/useClients';

interface ReportChartsPreviewProps {
  stats: DashboardStats;
  selectedCharts: string[];
  dateRange?: DateRangeFilter;
  isForPrint?: boolean;
  onChartReady?: (getChartImages: () => ChartImages) => void;
}

export interface ChartImages {
  pipeline?: string;
  wilayah?: string;
  produk?: string;
  kebutuhan?: string;
  trend?: string;
}

const BRAND = {
  dark: '#053a2c',
  primary: '#095540',
  accent: '#cdde00',
};

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PADDING = 40;

const FONT_FAMILY = "var(--font-plus-jakarta), 'Segoe UI', system-ui, sans-serif";

export default function ReportChartsPreview({
  stats,
  selectedCharts,
  dateRange,
  isForPrint = false,
  onChartReady,
}: ReportChartsPreviewProps) {
  const showSummary = selectedCharts.includes('summary');
  const showPipeline = selectedCharts.includes('pipeline');
  const showKabupaten = selectedCharts.includes('kabupaten');
  const showProduk = selectedCharts.includes('produk');
  const showKebutuhan = selectedCharts.includes('kebutuhan');
  const showTrend = selectedCharts.includes('trend');

  const getPeriodeText = (dr: DateRangeFilter | undefined): string => {
    if (!dr?.startDate && !dr?.endDate) return 'Semua Tanggal';
    const fmt = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    if (dr.startDate && dr.endDate) return `${fmt(dr.startDate)} - ${fmt(dr.endDate)}`;
    if (dr.startDate) return `Dari ${fmt(dr.startDate)}`;
    if (dr.endDate) return `Sampai ${fmt(dr.endDate)}`;
    return 'Semua Tanggal';
  };

  const periodeText = getPeriodeText(dateRange);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipelineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wilayahRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const produkRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kebutuhanRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trendRef = useRef<any>(null);

  const getChartImages = useCallback((): ChartImages => {
    return {
      pipeline: pipelineRef.current?.getDataURL({ type: 'png', pixelRatio: 2 })?.split(',')[1],
      wilayah: wilayahRef.current?.getDataURL({ type: 'png', pixelRatio: 2 })?.split(',')[1],
      produk: produkRef.current?.getDataURL({ type: 'png', pixelRatio: 2 })?.split(',')[1],
      kebutuhan: kebutuhanRef.current?.getDataURL({ type: 'png', pixelRatio: 2 })?.split(',')[1],
      trend: trendRef.current?.getDataURL({ type: 'png', pixelRatio: 2 })?.split(',')[1],
    };
  }, []);

  useEffect(() => {
    if (onChartReady && stats) {
      const timer = setTimeout(() => {
        onChartReady(getChartImages);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onChartReady, stats, getChartImages]);

  const pipelineOption = {
    indexAxis: 'y' as const,
    grid: { top: 8, right: 50, bottom: 8, left: 100 },
    textStyle: { fontFamily: FONT_FAMILY },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 9, fontWeight: 'bold', color: '#475569' },
      axisLine: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: stats.byStatus.map((item) => item.name.replace(/_/g, ' ')),
      axisLabel: { fontSize: 9, fontWeight: 'bold', color: '#334155' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: stats.byStatus.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: index === 0 ? BRAND.primary : BRAND.accent,
            borderRadius: 6,
          },
          label: {
            show: true,
            position: 'right',
            fontSize: 9,
            fontWeight: 'bold',
            color: '#475569',
          },
        })),
        barWidth: 30,
      },
    ],
  };

  const wilayahOption = {
    indexAxis: 'y' as const,
    grid: { top: 8, right: 50, bottom: 8, left: 100 },
    textStyle: { fontFamily: FONT_FAMILY },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 9, fontWeight: 'bold', color: '#475569' },
      axisLine: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: stats.byKabupaten.slice(0, 8).map((item) => item.name),
      axisLabel: { fontSize: 8, fontWeight: 'bold', color: '#334155' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: stats.byKabupaten.slice(0, 8).map((item) => item.value),
        itemStyle: { color: BRAND.primary, borderRadius: 4 },
        barWidth: 12,
        label: {
          show: true,
          position: 'right',
          fontSize: 8,
          fontWeight: 'bold',
          color: '#475569',
        },
      },
    ],
  };

  const produkOption = {
    grid: { top: 15, right: 15, bottom: 40, left: 10 },
    textStyle: { fontFamily: FONT_FAMILY },
    xAxis: {
      type: 'category',
      data: stats.byProduk.slice(0, 6).map((item) => item.name),
      axisLabel: { fontSize: 8, fontWeight: 'bold', rotate: -30, color: '#334155', interval: 0 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 8, fontWeight: 'bold', color: '#475569' },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: stats.byProduk.slice(0, 6).map((item) => item.value),
        itemStyle: { color: BRAND.dark, borderRadius: 4 },
        barWidth: 20,
        label: {
          show: true,
          position: 'top',
          fontSize: 8,
          fontWeight: 'bold',
          color: '#475569',
        },
      },
    ],
  };

  const kebutuhanOption = {
    grid: { top: 15, right: 15, bottom: 40, left: 10 },
    textStyle: { fontFamily: FONT_FAMILY },
    xAxis: {
      type: 'category',
      data: stats.byKebutuhan.slice(0, 6).map((item) => item.name),
      axisLabel: { fontSize: 8, fontWeight: 'bold', rotate: -30, color: '#334155', interval: 0 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 8, fontWeight: 'bold', color: '#475569' },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: stats.byKebutuhan.slice(0, 6).map((item) => item.value),
        itemStyle: { color: BRAND.accent, borderRadius: 4 },
        barWidth: 20,
        label: {
          show: true,
          position: 'top',
          fontSize: 8,
          fontWeight: 'bold',
          color: '#475569',
        },
      },
    ],
  };

  const trendOption = {
    grid: { top: 8, right: 15, bottom: 15, left: 10 },
    textStyle: { fontFamily: FONT_FAMILY },
    xAxis: {
      type: 'category',
      data: stats.byWeek.map((item) => item.day),
      axisLabel: { fontSize: 9, fontWeight: 'bold', color: '#475569' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        type: 'line',
        data: stats.byWeek.map((item) => item.count),
        smooth: 0.3,
        lineStyle: { color: BRAND.primary, width: 3 },
        itemStyle: {
          color: '#ffffff',
          borderColor: BRAND.primary,
          borderWidth: 2,
        },
        symbolSize: 4,
        areaStyle: {
          color: 'rgba(9, 85, 64, 0.05)',
        },
      },
    ],
  };

  void isForPrint;

  return (
    <div
      className="bg-white"
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        padding: PADDING,
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Header */}
      <div style={{ height: 36 }} className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-3">
          <div className="text-white px-2 py-1 rounded font-black text-sm" style={{ backgroundColor: BRAND.primary }}>
            CRM
          </div>
          <div>
            <h1 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: '#0f172a' }}>
              Executive Summary Report
            </h1>
            <p className="text-[9px] font-semibold" style={{ color: '#94a3b8' }}>
              Generated: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} | Periode: {periodeText}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards - 3 columns */}
      {showSummary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3" style={{ backgroundColor: BRAND.dark, color: '#ffffff' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ opacity: 0.8 }}>Total Data</p>
            <h2 className="text-3xl font-black mt-0.5">{stats.total}</h2>
            <p className="text-[8px] font-medium mt-0.5" style={{ opacity: 0.7 }}>Master DB Records</p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: BRAND.primary, color: '#ffffff' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ opacity: 0.9 }}>Prospek</p>
            <h2 className="text-3xl font-black mt-0.5">{stats.prospek}</h2>
            <p className="text-[8px] font-medium uppercase mt-0.5" style={{ opacity: 0.8 }}>Pipeline</p>
          </div>
          <div className="rounded-lg p-3 bg-white" style={{ border: `1px solid #f1f5f9` }}>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#cbd5e1' }}>Closing</p>
            <h2 className="text-3xl font-black mt-0.5" style={{ color: '#0f172a' }}>{stats.closing}</h2>
            <p className="text-[8px] font-medium uppercase mt-0.5" style={{ color: '#cbd5e1' }}>Deal</p>
          </div>
        </div>
      )}

      {/* Pipeline - Full Width */}
      {showPipeline && stats.byStatus.length > 0 && (
        <div className="rounded-lg p-3" style={{ border: '1px solid #f1f5f9' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#1e293b' }}>Pipeline Status</h3>
          <div style={{ height: 120 }}>
            <ReactECharts ref={pipelineRef} option={pipelineOption} style={{ height: 120 }} />
          </div>
        </div>
      )}

      {/* Wilayah - Full Width */}
      {showKabupaten && stats.byKabupaten.length > 0 && (
        <div className="rounded-lg p-3" style={{ border: '1px solid #f1f5f9' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#1e293b' }}>Top 8 Sebaran Wilayah</h3>
          <div style={{ height: 120 }}>
            <ReactECharts ref={wilayahRef} option={wilayahOption} style={{ height: 120 }} />
          </div>
        </div>
      )}

      {/* Produk + Kebutuhan - Adaptive (side-by-side if both, else full width) */}
      {(showProduk || showKebutuhan) && (
        <div className="grid gap-3" style={{ gridTemplateColumns: showProduk && showKebutuhan ? '1fr 1fr' : '1fr' }}>
          {showProduk && stats.byProduk.length > 0 && (
            <div className="rounded-lg p-3" style={{ border: '1px solid #f1f5f9' }}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#1e293b' }}>Top Distribusi Produk</h3>
              <div style={{ height: 110 }}>
                <ReactECharts ref={produkRef} option={produkOption} style={{ height: 110 }} />
              </div>
            </div>
          )}
          {showKebutuhan && stats.byKebutuhan.length > 0 && (
            <div className="rounded-lg p-3" style={{ border: '1px solid #f1f5f9' }}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#1e293b' }}>Top Tipe Bangunan</h3>
              <div style={{ height: 110 }}>
                <ReactECharts ref={kebutuhanRef} option={kebutuhanOption} style={{ height: 110 }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trend - Full Width */}
      {showTrend && stats.byWeek.length > 0 && (
        <div className="rounded-lg p-3 flex-1" style={{ border: '1px solid #f1f5f9' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#1e293b' }}>Tren Data Masuk</h3>
          <div style={{ height: 70 }}>
            <ReactECharts ref={trendRef} option={trendOption} style={{ height: 70 }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center" style={{ height: 16 }}>
        <p className="text-[7px] font-bold uppercase" style={{ color: '#cbd5e1' }}>
          © 2026 Leora - CRM System
        </p>
        <p className="text-[7px] font-bold uppercase" style={{ color: '#cbd5e1' }}>
          Halaman 1 / 1
        </p>
      </div>
    </div>
  );
}
