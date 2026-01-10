import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import DataTable, { Column, columnRenderers } from "../ui/DataTable";
import TableActions from "../ui/TableActions";
import SearchBar from "../ui/SearchBar";
import { formatRupiah, translateStatus } from "../../lib/utils";

const formatTanggal = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

interface RABDocument {
  id: string;
  no_ref: string;
  project_name: string;
  location_kabupaten?: string;
  client_profile?: {
    nama?: string;
  };
  status: string;
  total: number;
  created_at: string;
}

interface RABTableProps {
  data: RABDocument[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onDelete: (id: string, projectName: string, status?: string) => void;
  showSearchAndExport?: boolean;
}

export default function RABTable({
  data,
  loading = false,
  search,
  onSearchChange,
  onDelete,
}: RABTableProps) {
  const router = useRouter();
  const filteredData = useMemo(() => {
    const searchTerm = (search || "").toLowerCase();
    return data.filter(
      (doc) =>
        (doc.project_name || "").toLowerCase().includes(searchTerm) ||
        (doc.location_kabupaten || "").toLowerCase().includes(searchTerm) ||
        (doc.no_ref || "").toLowerCase().includes(searchTerm)
    );
  }, [search, data]);

  const exportToExcel = () => {
    const exportData = filteredData.map((doc) => ({
      "No Ref": doc.no_ref || "-",
      "Proyek": doc.project_name,
      "Kabupaten": doc.location_kabupaten || "-",
      "Client": doc.client_profile?.nama || "-",
      "Total":
        doc.total !== null && doc.total !== undefined
          ? formatRupiah(doc.total)
          : "-",
      "Status": doc.status,
      "Tanggal": new Date(doc.created_at).toLocaleDateString("id-ID"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dokumen RAB");

    XLSX.writeFile(
      workbook,
      `dokumen_rab_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const columns: Column[] = [
    {
      key: "no_ref",
      header: "No",
      className: "text-left",
      sortable: true,
      render: (value, item) => (
        <div className='font-medium text-left'>
          {value || `#${data.indexOf(item) + 1}`}
        </div>
      ),
    },
    {
      key: "project_name",
      header: "Proyek",
      className: "text-left",
      sortable: true,
      render: (value, item) => (
        <div className='font-medium text-left'>{value}</div>
      ),
    },
    {
      key: "location_kabupaten",
      header: "Kabupaten",
      className: "text-left",
      sortable: true,
      render: (value, item) => <div className='text-left'>{value || "-"}</div>,
    },
    {
      key: "client_profile",
      header: "Client",
      className: "text-left",
      sortable: true,
      render: (value, item) => (
        <div className='text-left'>{value?.nama || "-"}</div>
      ),
    },
    {
      key: "total",
      header: "Total",
      className: "text-center font-semibold",
      sortable: true,
      render: (value) => (
        <div className='text-center'>
          {value !== null && value !== undefined ? formatRupiah(value) : "-"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      sortable: true,
      render: columnRenderers.status,
    },
    {
      key: "created_at",
      header: "Tanggal Dibuat",
      className: "text-center",
      sortable: true,
      render: (value, item) => (
        <div className='text-center text-sm text-gray-600'>
          {formatTanggal(value)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      className: "text-center",
      render: (value, item) => (
        <TableActions
          item={item}
          onView={() => router?.push(`/rab/${item.id}`)}
          onEdit={() => router?.push(`/rab/edit/${item.id}`)}
        />
      ),
    },
  ];

  const mobileCardRender = (item: RABDocument, index: number) => (
    <Link
      key={item.id}
      href={`/rab/${item.id}`}
      className='bg-white hover:bg-blue-50/50 border border-gray-200 rounded-lg p-3 mb-2 block transition-all duration-200 relative'
    >
      {/* Status Badge - Top Right */}
      <div className='absolute top-3 right-3'>
        {columnRenderers.status(item.status)}
      </div>

      {/* Header Row - Code & Project Name */}
      <div className='mb-3 pr-20'>
        <div className='flex items-center gap-2 mb-2'>
          <span className='bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full'>
            {item.no_ref || `#${index + 1}`}
          </span>
        </div>
        <h3 className='font-bold text-gray-900 text-lg leading-tight line-clamp-2'>
          {item.project_name}
        </h3>
      </div>

      {/* Info Row - Date & Location */}
      <div className='flex items-center justify-between text-xs text-gray-600 mb-2'>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <div className='flex items-center gap-1'>
            <span className='text-gray-400'>📅</span>
            <span className='truncate'>
              {new Date(item.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='text-gray-400'>📍</span>
            <span className='truncate'>{item.location_kabupaten || "-"}</span>
          </div>
        </div>
      </div>

      {/* Client Info - Only show if exists */}
      {item.client_profile?.nama && (
        <div className='flex items-center gap-1 text-xs text-gray-500 mb-2'>
          <span className='text-gray-400'>👤</span>
          <span className='truncate'>{item.client_profile.nama}</span>
        </div>
      )}

      {/* Total Price - Bottom Right */}
      <div className='absolute bottom-3 right-3'>
        <div className='font-bold text-green-600 text-lg'>
          {item.total !== null && item.total !== undefined
            ? formatRupiah(item.total)
            : "-"}
        </div>
      </div>
    </Link>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      loading={loading}
      emptyMessage='Belum ada dokumen RAB'
      emptyIcon='📁'
      mobileCardRender={mobileCardRender}
    />
  );
}
