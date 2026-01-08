import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import DataTable, { Column, columnRenderers } from "../ui/DataTable";
import TableActions from "../ui/TableActions";
import SearchBar from "../ui/SearchBar";
import { formatRupiah, translateStatus } from "../../lib/utils";

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
      className: "text-center",
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
      sortable: true,
      render: (value, item) => <div className='font-medium text-left'>{value}</div>,
    },
    {
      key: "location_kabupaten",
      header: "Kabupaten",
      sortable: true,
      render: (value, item) => <div className='text-left'>{value || "-"}</div>,
    },
    {
      key: "client_profile",
      header: "Client",
      sortable: true,
      render: (value, item) => <div className='text-left'>{value?.nama || "-"}</div>,
    },
    {
      key: "total",
      header: "Total",
      className: "text-center font-semibold",
      sortable: true,
      render: (value) => (
        <div className='text-right'>
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
      key: "actions",
      header: "Action",
      className: "text-center",
      render: (value, item) => (
        <TableActions
          item={item}
          onView={() => router?.push(`/rab/${item.id}`)}
          onEdit={() => router?.push(`/rab/edit/${item.id}`)}
          onDelete={() => onDelete(item.id, item.project_name, item.status)}
        />
      ),
    },
  ];

  const mobileCardRender = (item: RABDocument, index: number) => (
    <Link
      key={item.id}
      href={`/rab/${item.id}`}
      className='min-h-fit border-b border-default p-4 bg-surface hover:bg-surface-hover border block'
    >
      <div className='flex h-full'>
        {/* Left Column - Main Content */}
        <div className='flex-1 flex flex-col justify-between'>
          {/* Kode di kiri atas */}
          <div className='mb-1'>
            <span className='font-semibold text-sm text-primary'>
              {item.no_ref || `#${index + 1}`}
            </span>
          </div>

          {/* Middle: Project Name (Prioritized) */}
          <h3 className='font-bold text-base text-primary line-clamp-2 mb-1'>
            {item.project_name}
          </h3>

          {/* Bottom: Kabupaten, Client & Date */}
          <div className='space-y-1'>
            <div className='flex items-center text-xs text-muted'>
              <span className='mr-1'>📍</span>
              <span className='truncate'>{item.location_kabupaten || "-"}</span>
            </div>
            {item.client_profile?.nama && (
              <div className='flex items-center text-xs text-muted'>
                <span className='mr-1'>👤</span>
                <span className='truncate'>{item.client_profile.nama}</span>
              </div>
            )}
            <div className='flex items-center text-xs text-muted'>
              <span className='mr-1'>📅</span>
              <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Action Button Group */}
        <div className='flex flex-col justify-between items-end pl-3'>
          {/* Status badge di atas */}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              item.status === "draft"
                ? "bg-warning-surface text-warning-darker"
                : item.status === "sent"
                ? "bg-info-surface text-info-darker"
                : "bg-success-surface text-success-darkest"
            }`}
          >
            {translateStatus(item.status)}
          </span>
          <div className='text-subtle'>
            <span className='font-semibold text-primary'>
              {item.total !== null && item.total !== undefined
                ? formatRupiah(item.total)
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className='space-y-4'>
      {/* Search and Export */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <SearchBar
          placeholder='Cari proyek, lokasi, atau no ref...'
          value={search}
          onChange={onSearchChange}
          className='w-full sm:w-96'
        />

        <button
          onClick={exportToExcel}
          className='flex items-center gap-2 bg-surface border border-secondary text-secondary px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-surface-hover text-sm md:text-base'
        >
          <FileDown size={16} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage='Belum ada dokumen RAB'
        emptyIcon='📁'
        mobileCardRender={mobileCardRender}
      />
    </div>
  );
}
