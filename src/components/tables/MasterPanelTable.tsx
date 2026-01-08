import React, { useMemo } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import DataTable, { Column, columnRenderers } from '../ui/DataTable';
import TableActions from '../ui/TableActions';
import SearchBar from '../ui/SearchBar';

interface Panel {
  id: string;
  name: string;
  type: string;
  harga: number;
  berat?: number;
  volume?: number;
  jumlah_per_truck?: number;
  keterangan?: string;
}

interface MasterPanelTableProps {
  data: Panel[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (panel: Panel) => void;
  onDelete: (id: string, name: string) => void;
}

export default function MasterPanelTable({
  data,
  loading = false,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete
}: MasterPanelTableProps) {
  const filteredData = useMemo(() => {
    return data.filter(panel =>
      panel.id.toLowerCase().includes(search.toLowerCase()) ||
      panel.name.toLowerCase().includes(search.toLowerCase()) ||
      panel.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const columns: Column[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => <div className='font-mono font-medium'>{value}</div>,
    },
    {
      key: 'name',
      header: 'Nama',
    },
    {
      key: 'type',
      header: 'Tipe',
      render: columnRenderers.status,
    },
    {
      key: 'berat',
      header: 'Berat (kg)',
      className: 'text-right',
      render: (value) => value || 0,
    },
    {
      key: 'volume',
      header: 'Volume (m³)',
      className: 'text-right',
      render: (value) => value || 0,
    },
    {
      key: 'jumlah_per_truck',
      header: 'Jumlah/Truck',
      className: 'text-right',
      render: (value) => value || 0,
    },
    {
      key: 'harga',
      header: 'Harga',
      className: 'text-right font-semibold',
      render: columnRenderers.currency,
    },
    {
      key: 'keterangan',
      header: 'Keterangan',
      render: (value) => value || '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (value, item) => (
        <TableActions
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id, item.name)}
        />
      ),
    },
  ];

  return (
    <div className='bg-surface rounded-lg shadow'>
      <div className='p-4 border-b'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold'>Daftar Panel</h2>
          <div className='flex items-center gap-4'>
            <SearchBar
              placeholder='Cari panel (ID, nama, tipe)...'
              value={search}
              onChange={onSearchChange}
              className='w-64'
            />
            <button
              onClick={onAdd}
              className='bg-brand-primary hover:bg-brand-dark text-white p-2 rounded-lg'
              title='Tambah Panel'
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage='Belum ada data panel'
        emptyIcon='🔧'
      />
    </div>
  );
}