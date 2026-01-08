import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  formatRupiah,
  getStatusBadge,
  getStatusLabel,
  translateStatus,
} from "../../lib/utils";

export interface Column {
  key: string;
  header: string;
  render?: (value: any, item: any) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  mobileCardRender?: (item: any, index: number) => React.ReactNode;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyMessage = "Tidak ada data",
  emptyIcon,
  className = "",
  mobileCardRender,
  onSort,
}: DataTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sort data if sorting is enabled
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }

      // Convert to string for comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, start with ascending
      setSortField(field);
      setSortDirection('asc');
    }

    // Call external sort handler if provided
    if (onSort) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    }
  };
  if (loading) {
    return (
      <div className='p-10 text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto'></div>
        <p className='mt-4 text-muted'>Memuat data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='bg-surface rounded-lg shadow p-12 text-center'>
        {emptyIcon && (
          <div className='text-subtle mb-4 text-4xl'>{emptyIcon}</div>
        )}
        <h3 className='text-lg font-medium text-primary mb-2'>
          Tidak ada data
        </h3>
        <p className='text-muted'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/Tablet View - Table */}
      <div
        className={`hidden md:block bg-surface rounded-lg shadow overflow-hidden ${className}`}
      >
        <div className='overflow-x-auto'>
          <table className='table table-zebra table-pin-rows'>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={column.className}>
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:bg-surface-hover px-2 py-1 rounded"
                      >
                        {column.header}
                        {sortField === column.key && (
                          sortDirection === 'asc' ?
                            <ChevronUp size={14} /> :
                            <ChevronDown size={14} />
                        )}
                        {sortField !== column.key && (
                          <div className="w-3.5 h-3.5 flex items-center justify-center opacity-30">
                            <ChevronUp size={10} className="absolute" />
                            <ChevronDown size={10} className="absolute" />
                          </div>
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={item.id || index}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View - Cards */}
      {mobileCardRender && (
        <div className='md:hidden'>
          {data.map((item, index) => (
            <div key={item.id || index}>{mobileCardRender(item, index)}</div>
          ))}
        </div>
      )}
    </>
  );
}

// Helper function to create common column renderers
export const columnRenderers = {
  currency: (value: number) => {
    if (value === null || value === undefined) return "-";
    return formatRupiah(value);
  },

  status: (value: string) => {
    if (!value) return "-";
    const getStatusClasses = (status: string) => {
      switch (status) {
        case "draft":
          return "bg-warning-surface text-warning-darker";
        case "sent":
          return "bg-info-surface text-info-darker";
        case "approved":
          return "bg-success-surface text-success-darkest";
        default:
          return "bg-surface-muted text-secondary";
      }
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(
          value
        )}`}
      >
        {translateStatus(value)}
      </span>
    );
  },

  date: (value: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID");
  },

  text: (value: any) => value || "-",
};
