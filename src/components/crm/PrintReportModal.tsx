'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import Card, { CardContent } from '@/components/ui/Card';
import DateRangePicker from '@/components/ui/DateRangePicker';
import ReportChartsPreview, { ChartImages } from './ReportChartsPreview';
import { useClientStats, DateRangeFilter } from '@/hooks/useClients';
import { Printer, FileImage, Clipboard, Loader2, Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';

const getPeriodeText = (dateRange: DateRangeFilter): string => {
  if (!dateRange?.startDate && !dateRange?.endDate) return 'Semua Tanggal';
  const format = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  if (dateRange.startDate && dateRange.endDate) {
    return `${format(dateRange.startDate)} - ${format(dateRange.endDate)}`;
  }
  if (dateRange.startDate) return `Dari ${format(dateRange.startDate)}`;
  if (dateRange.endDate) return `Sampai ${format(dateRange.endDate)}`;
  return 'Semua Tanggal';
};

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OutputFormat = 'pdf' | 'image' | 'clipboard';

const CHART_OPTIONS = [
  { id: 'summary', label: 'Summary Cards' },
  { id: 'pipeline', label: 'Pipeline Status' },
  { id: 'kabupaten', label: 'Top Wilayah' },
  { id: 'produk', label: 'Distribusi Produk' },
  { id: 'kebutuhan', label: 'Tipe Bangunan' },
  { id: 'trend', label: 'Tren Data' },
];

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export default function PrintReportModal({
  isOpen,
  onClose,
}: PrintReportModalProps) {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [selectedCharts, setSelectedCharts] = useState<string[]>([
    'summary',
    'pipeline',
    'kabupaten',
    'produk',
    'kebutuhan',
    'trend',
  ]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const chartImagesGetterRef = useRef<(() => ChartImages) | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const { data: stats, isLoading } = useClientStats(dateRange);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        const scale = containerWidth / PAGE_WIDTH;
        setPreviewScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleToggleChart = (chartId: string) => {
    setSelectedCharts((prev) =>
      prev.includes(chartId)
        ? prev.filter((c) => c !== chartId)
        : [...prev, chartId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCharts.length === CHART_OPTIONS.length) {
      setSelectedCharts([]);
    } else {
      setSelectedCharts(CHART_OPTIONS.map((c) => c.id));
    }
  };

  const handleChartReady = useCallback((getChartImages: () => ChartImages) => {
    chartImagesGetterRef.current = getChartImages;
  }, []);

  const generateImageFromCanvas = useCallback(async () => {
    if (!previewContainerRef.current) return null;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvas(previewContainerRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      foreignObjectRendering: false,
    });

    return canvas;
  }, []);

  const generatePDFWithCharts = useCallback(async () => {
    if (!chartImagesGetterRef.current || !stats) return;

    const chartImages = chartImagesGetterRef.current();
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.setLineHeightFactor(1.15);

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const footerY = pageHeight - 6;

    const showSummary = selectedCharts.includes('summary');
    const showPipeline = selectedCharts.includes('pipeline');
    const showKabupaten = selectedCharts.includes('kabupaten');
    const showProduk = selectedCharts.includes('produk');
    const showKebutuhan = selectedCharts.includes('kebutuhan');
    const showTrend = selectedCharts.includes('trend');

    const headerHeight = 12;
    const kpiHeight = 15;
    const chartFullHeight = 32;
    const chartHalfHeight = 26;
    const trendHeight = 18;
    const sectionGap = 3;

    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let yPos = margin;

    pdf.setFillColor(9, 85, 64);
    pdf.roundedRect(margin, yPos, 6, 4, 1, 1, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CRM', margin + 1.5, yPos + 2.8);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary Report', margin + 9, yPos + 2.8);

    yPos += 6;
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${currentDate} | Periode: ${getPeriodeText(dateRange)}`, margin + 9, yPos + 2.5);

    yPos += headerHeight - 6 + sectionGap;

    if (showSummary) {
      const kpiH = kpiHeight;
      const kpiW = (contentWidth - 4) / 3;
      const kpiGap = 2;
      const labelOffset = 3;
      const numOffset = kpiH * 0.4;
      const subOffset = kpiH * 0.7;

      pdf.setFillColor(5, 58, 44);
      pdf.roundedRect(margin, yPos, kpiW, kpiH, 1.5, 1.5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(4);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Data', margin + labelOffset, yPos + kpiH * 0.25);
      pdf.setFontSize(11);
      pdf.text(String(stats.total), margin + labelOffset, yPos + numOffset);
      pdf.setFontSize(3);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Master DB Records', margin + labelOffset, yPos + subOffset);

      const prospekX = margin + kpiW + kpiGap;
      pdf.setFillColor(9, 85, 64);
      pdf.roundedRect(prospekX, yPos, kpiW, kpiH, 1.5, 1.5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(4);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Prospek', prospekX + labelOffset, yPos + kpiH * 0.25);
      pdf.setFontSize(11);
      pdf.text(String(stats.prospek), prospekX + labelOffset, yPos + numOffset);
      pdf.setFontSize(3);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Pipeline', prospekX + labelOffset, yPos + subOffset);

      const closingX = prospekX + kpiW + kpiGap;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(241, 245, 249);
      pdf.roundedRect(closingX, yPos, kpiW, kpiH, 1.5, 1.5, 'FD');
      pdf.setTextColor(203, 213, 225);
      pdf.setFontSize(4);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Closing', closingX + labelOffset, yPos + kpiH * 0.25);
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(11);
      pdf.text(String(stats.closing), closingX + labelOffset, yPos + numOffset);
      pdf.setTextColor(203, 213, 225);
      pdf.setFontSize(3);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Deal', closingX + labelOffset, yPos + subOffset);

      yPos += kpiH + sectionGap;
    }

    if (showPipeline) {
      const chartRowH = chartFullHeight;
      const chartPadding = 2;
      const chartTitleH = 4;
      const chartImgH = chartRowH - chartTitleH - chartPadding * 2;

      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(margin, yPos, contentWidth, chartRowH, 1.5, 1.5, 'F');

      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(4);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pipeline Status', margin + chartPadding, yPos + chartPadding + 2);

      if (chartImages.pipeline) {
        const imgData = `data:image/png;base64,${chartImages.pipeline}`;
        pdf.addImage(imgData, 'PNG', margin + chartPadding, yPos + chartTitleH + chartPadding, contentWidth - chartPadding * 2, chartImgH);
      }

      yPos += chartRowH + sectionGap;
    }

    if (showKabupaten) {
      const chartRowH = chartFullHeight;
      const chartPadding = 2;
      const chartTitleH = 4;
      const chartImgH = chartRowH - chartTitleH - chartPadding * 2;

      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(margin, yPos, contentWidth, chartRowH, 1.5, 1.5, 'F');

      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(4);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top 8 Sebaran Wilayah', margin + chartPadding, yPos + chartPadding + 2);

      if (chartImages.wilayah) {
        const imgData = `data:image/png;base64,${chartImages.wilayah}`;
        pdf.addImage(imgData, 'PNG', margin + chartPadding, yPos + chartTitleH + chartPadding, contentWidth - chartPadding * 2, chartImgH);
      }

      yPos += chartRowH + sectionGap;
    }

    if (showProduk || showKebutuhan) {
      const chartRowH = chartHalfHeight;
      const chartPadding = 2;
      const chartTitleH = 4;
      const chartImgH = chartRowH - chartTitleH - chartPadding * 2;

      if (showProduk && chartImages.produk) {
        const produkW = showKebutuhan ? contentWidth / 2 - 1.5 : contentWidth;

        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(margin, yPos, produkW, chartRowH, 1.5, 1.5, 'F');

        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(4);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Distribusi Produk', margin + chartPadding, yPos + chartPadding + 2);

        const imgData = `data:image/png;base64,${chartImages.produk}`;
        pdf.addImage(imgData, 'PNG', margin + chartPadding, yPos + chartTitleH + chartPadding, produkW - chartPadding * 2, chartImgH);
      }

      if (showKebutuhan && chartImages.kebutuhan) {
        const kebutuhanX = showProduk ? margin + contentWidth / 2 : margin;
        const kebutuhanW = showProduk ? contentWidth / 2 - 1.5 : contentWidth;

        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(kebutuhanX, yPos, kebutuhanW, chartRowH, 1.5, 1.5, 'F');

        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(4);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tipe Bangunan', kebutuhanX + chartPadding, yPos + chartPadding + 2);

        const imgData = `data:image/png;base64,${chartImages.kebutuhan}`;
        pdf.addImage(imgData, 'PNG', kebutuhanX + chartPadding, yPos + chartTitleH + chartPadding, kebutuhanW - chartPadding * 2, chartImgH);
      }

      yPos += chartRowH + sectionGap;
    }

    if (showTrend) {
      const chartRowH = trendHeight;
      const chartPadding = 2;
      const chartTitleH = 4;
      const chartImgH = chartRowH - chartTitleH - chartPadding * 2;

      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(margin, yPos, contentWidth, chartRowH, 1.5, 1.5, 'F');

      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(4);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tren Data Masuk', margin + chartPadding, yPos + chartPadding + 2);

      if (chartImages.trend) {
        const imgData = `data:image/png;base64,${chartImages.trend}`;
        pdf.addImage(imgData, 'PNG', margin + chartPadding, yPos + chartTitleH + chartPadding, contentWidth - chartPadding * 2, chartImgH);
      }
    }

    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(4);
    pdf.setFont('helvetica', 'bold');
    pdf.text('© 2026 Leora - CRM System', margin, footerY);
    pdf.text('Halaman 1 / 1', pageWidth - margin - 10, footerY);

    pdf.save(`crm-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [selectedCharts, stats, dateRange]);

  const handleGenerate = async () => {
    const chartCount = selectedCharts.filter((id) => id !== 'summary').length;
    if (chartCount === 0 && !selectedCharts.includes('summary')) {
      alert('Pilih minimal satu grafik untuk dicetak');
      return;
    }

    if (!stats) {
      alert('Data belum tersedia');
      return;
    }

    setIsGenerating(true);

    try {
      if (outputFormat === 'pdf') {
        await generatePDFWithCharts();
      } else if (outputFormat === 'clipboard') {
        const canvas = await generateImageFromCanvas();
        if (!canvas) return;

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            alert('Gambar berhasil disalin ke clipboard!');
          } catch {
            alert('Gagal menyalin ke clipboard. Browser mungkin tidak mendukung.');
          }
        }, 'image/png');
      } else if (outputFormat === 'image') {
        const canvas = await generateImageFromCanvas();
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `crm-report-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      onClose();
    } catch (error) {
      console.error('Generate error:', error);
      alert('Gagal membuat report. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[1400px] w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Cetak Report CRM
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-[3] overflow-hidden border-r bg-gray-50 p-4">
            <div
              ref={previewContainerRef}
              className="w-full h-full overflow-hidden rounded-lg shadow-lg bg-white"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  <span>Loading preview...</span>
                </div>
              ) : stats ? (
                <div
                  style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <ReportChartsPreview
                    stats={stats}
                    selectedCharts={selectedCharts}
                    dateRange={dateRange}
                    onChartReady={handleChartReady}
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Tidak ada data untuk ditampilkan
                </div>
              )}
            </div>
          </div>

          <div className="flex-[2] overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Filter Tanggal</Label>
              <DateRangePicker
                startDate={dateRange.startDate ?? null}
                endDate={dateRange.endDate ?? null}
                onDateChange={handleDateChange}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Pilih Grafik</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs h-7"
                >
                  {selectedCharts.length === CHART_OPTIONS.length
                    ? 'Hapus Semua'
                    : 'Pilih Semua'}
                </Button>
              </div>
              <Card>
                <CardContent className="p-3 grid grid-cols-2 gap-2">
                  {CHART_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedCharts.includes(option.id)}
                        onCheckedChange={() => handleToggleChart(option.id)}
                      />
                      <Label
                        htmlFor={option.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Format Output</Label>
              <RadioGroup
                value={outputFormat}
                onValueChange={(value) => setOutputFormat(value as OutputFormat)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-1 cursor-pointer text-sm">
                    <FileText className="w-4 h-4" />
                    PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="flex items-center gap-1 cursor-pointer text-sm">
                    <FileImage className="w-4 h-4" />
                    PNG
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clipboard" id="clipboard" />
                  <Label htmlFor="clipboard" className="flex items-center gap-1 cursor-pointer text-sm">
                    <Clipboard className="w-4 h-4" />
                    Clipboard
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 border-t space-y-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Batal
              </Button>
              <Button
                onClick={handleGenerate}
                isLoading={isGenerating}
                loadingText="Generating..."
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate {outputFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
