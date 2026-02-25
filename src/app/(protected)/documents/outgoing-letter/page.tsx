'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDocumentTypes } from '@/hooks/useLetters';
import { supabase } from '@/lib/supabase/client';
import OutgoingLettersTable from '@/components/documents/OutgoingLettersTable';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED_TO_REVIEW', label: 'Under Review' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REVISION_REQUESTED', label: 'Needs Revision' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function SuratKeluarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDocType, setFilterDocType] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: documentTypes } = useDocumentTypes();

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('outgoing_letters')
        .select(`
          *,
          document_type:document_types(*),
          company:instansi(*),
          created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus) query = query.eq('status', filterStatus);
      if (filterDocType) query = query.eq('document_type_id', parseInt(filterDocType));
      if (searchTerm && searchTerm.trim() !== '') {
        const search = searchTerm.trim();
        query = query.or(`document_number.ilike.%${search}%,subject.ilike.%${search}%,recipient_company.ilike.%${search}%`);
      }

      const { data: letters, error } = await query;

      if (error) throw error;

      const exportData = (letters || []).map((letter: any) => ({
        'No Ref': letter.document_number || '-',
        'Instansi': letter.company?.nama || '-',
        'Kategori': letter.document_type?.name || '-',
        'Perihal': letter.subject || '-',
        'Penerima': letter.recipient_company || '-',
        'Status': letter.status || '-',
        'Tanggal Surat': letter.letter_date ? new Date(letter.letter_date).toLocaleDateString('id-ID') : '-',
        'Dibuat Oleh': letter.created_by?.nama || '-',
        'Tanggal Dibuat': letter.created_at ? new Date(letter.created_at).toLocaleDateString('id-ID') : '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Surat Keluar');

      const colWidths = [
        { wch: 20 }, { wch: 25 }, { wch: 20 },
        { wch: 30 }, { wch: 25 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 15 }
      ];
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(
        workbook,
        `surat_keluar_export_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Surat Keluar</h1>
            <p className="text-gray-600 mt-1">Kelola surat keluar perusahaan</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportToExcel}
              disabled={isExporting}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? 'Mengexport...' : 'Export Excel'}
            </button>

            <Link
              href="/documents/outgoing-letter/new"
              className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium shadow-sm hover:shadow transition-all"
            >
              + Buat Surat Baru
            </Link>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari No Ref, Perihal, Penerima..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {documentTypes?.map((dt: any) => (
                  <option key={dt.id} value={dt.id}>{dt.name}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || filterStatus || filterDocType) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                  setFilterDocType('');
                }}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                ✕ Reset Filter
              </button>
            </div>
          )}
        </div>

        <OutgoingLettersTable 
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          filterDocType={filterDocType}
        />
      </div>
    </div>
  );
}
