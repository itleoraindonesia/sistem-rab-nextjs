import React, { useMemo } from "react";
import { Plus } from "lucide-react";
import DataTable, { Column, columnRenderers } from "../ui/DataTable";
import TableActions from "../ui/TableActions";
import SearchBar from "../ui/SearchBar";

interface Ongkir {
  id?: string;
  provinsi: string;
  biaya: number;
  kabupaten?: string;
}

interface MasterOngkirTableProps {
  data: Ongkir[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (ongkir: Ongkir) => void;
  onDelete: (provinsi: string) => void;
}

export default function MasterOngkirTable({
  data,
  loading = false,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
}: MasterOngkirTableProps) {
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.provinsi.toLowerCase().includes(search.toLowerCase()) ||
        (item.kabupaten &&
          item.kabupaten.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, search]);

  const columns: Column[] = [
    {
      key: "provinsi",
      header: "Provinsi",
      render: (value) => <div className='font-medium'>{value}</div>,
    },
    {
      key: "kabupaten",
      header: "Kabupaten",
      render: (value) => value || "UNKNOWN",
    },
    {
      key: "biaya",
      header: "Biaya",
      className: "text-right font-semibold",
      render: columnRenderers.currency,
    },
    {
      key: "actions",
      header: "Aksi",
      className: "text-right",
      render: (value, item) => (
        <TableActions
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.provinsi)}
        />
      ),
    },
  ];

  return (
    <div className='bg-surface rounded-lg shadow'>
      <div className='p-4 border-b'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold'>Ongkos Kirim</h2>
          <div className='flex items-center gap-4'>
            <SearchBar
              placeholder='Cari ongkir (provinsi, kabupaten)...'
              value={search}
              onChange={onSearchChange}
              className='w-64'
            />
            <button
              onClick={onAdd}
              className='bg-brand-primary hover:bg-brand-dark text-white p-2 rounded-lg'
              title='Tambah Ongkir'
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
        emptyMessage='Belum ada data ongkos kirim'
        emptyIcon='🚚'
      />
    </div>
  );
}
