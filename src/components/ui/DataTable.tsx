import React, { useState, useMemo, useEffect, useRef } from "react";
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
  onSort?: (field: string, direction: "asc" | "desc") => void;
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
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const tableRef = useRef<HTMLTableElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);

  // #region agent log
  useEffect(() => {
    if (tableRef.current && theadRef.current) {
      const tableEl = tableRef.current;
      const theadEl = theadRef.current;
      const computedTable = window.getComputedStyle(tableEl);
      const computedThead = window.getComputedStyle(theadEl);
      fetch(
        "http://127.0.0.1:7242/ingest/49f537d8-251b-4d1b-9021-92d0eb2d1e91",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "DataTable.tsx:44",
            message: "Table element classes and computed styles post-fix",
            data: {
              tableClasses: tableEl.className,
              theadClasses: theadEl.className,
              tableDisplay: computedTable.display,
              tableBorderCollapse: computedTable.borderCollapse,
              theadBg: computedThead.backgroundColor,
              theadColor: computedThead.color,
              hasZebraStriping: tableEl
                .querySelector("tbody tr:nth-child(even)")
                ?.classList.contains("bg-gray-50"),
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "post-fix",
            hypothesisId: "A",
          }),
        }
      ).catch(() => {});
    }
  }, [data, columns]);
  // #endregion

  // Sort data if sorting is enabled
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? 1 : -1;
      if (bValue == null) return sortDirection === "asc" ? -1 : 1;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Convert to string for comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, start with ascending
      setSortField(field);
      setSortDirection("asc");
    }

    // Call external sort handler if provided
    if (onSort) {
      onSort(field, sortDirection === "asc" ? "desc" : "asc");
    }
  };
  if (loading) {
    return (
      <div className='card bg-base-100  p-10 text-center'>
        <div className='loading loading-spinner loading-lg text-primary mx-auto'></div>
        <p className='mt-4 text-base-content/70'>Memuat data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='card bg-base-100 border rounded-md border-border-default p-12 text-center'>
        {emptyIcon && (
          <div className='text-base-content/50 mb-4 text-4xl'>{emptyIcon}</div>
        )}
        <h3 className='text-lg font-medium text-base-content mb-2'>
          Tidak ada data
        </h3>
        <p className='text-base-content/70'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/Tablet View - Table */}
      <div className={`hidden md:block ${className}`}>
        {/* #region agent log */}
        {(() => {
          const tableClasses = "w-full border-collapse";
          const theadClasses = "bg-brand-accent text-gray-800";
          fetch(
            "http://127.0.0.1:7242/ingest/49f537d8-251b-4d1b-9021-92d0eb2d1e91",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "DataTable.tsx:137",
                message: "Table classes before render post-fix",
                data: {
                  tableClasses,
                  theadClasses,
                  columnCount: columns.length,
                  dataCount: data.length,
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "post-fix",
                hypothesisId: "B",
              }),
            }
          ).catch(() => {});
          return null;
        })()}
        {/* #endregion */}
        <table ref={tableRef} className='w-full border-collapse'>
          <thead ref={theadRef} className='bg-gray-200'>
            <tr>
              {columns.map((column) => {
                // Extract alignment from column className, default to center for header
                let headerAlign = "text-center";
                if (column.className?.includes("text-left")) {
                  headerAlign = "text-left";
                } else if (column.className?.includes("text-right")) {
                  headerAlign = "text-right";
                } else if (column.className?.includes("text-center")) {
                  headerAlign = "text-center";
                }
                // Remove alignment classes from className to avoid duplication
                const cleanClassName =
                  column.className
                    ?.replace(/text-(left|right|center)/g, "")
                    .trim() || "";
                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 font-semibold ${headerAlign} ${cleanClassName}`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className='flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors text-gray-800 font-semibold'
                      >
                        {column.header}
                        {sortField === column.key &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                        {sortField !== column.key && (
                          <div className='w-3.5 h-3.5 flex items-center justify-center opacity-30'>
                            <ChevronUp size={10} className='absolute' />
                            <ChevronDown size={10} className='absolute' />
                          </div>
                        )}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={item.id || index}
                className={`border-b border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition-colors`}
              >
                {columns.map((column) => {
                  // #region agent log
                  if (index === 0) {
                    fetch(
                      "http://127.0.0.1:7242/ingest/49f537d8-251b-4d1b-9021-92d0eb2d1e91",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          location: "DataTable.tsx:188",
                          message: "Column className and alignment post-fix",
                          data: {
                            columnKey: column.key,
                            columnClassName: column.className,
                            hasTextCenter:
                              column.className?.includes("text-center"),
                            hasTextLeft:
                              column.className?.includes("text-left"),
                            hasTextRight:
                              column.className?.includes("text-right"),
                          },
                          timestamp: Date.now(),
                          sessionId: "debug-session",
                          runId: "post-fix",
                          hypothesisId: "C",
                        }),
                      }
                    ).catch(() => {});
                  }
                  // #endregion
                  return (
                    <td
                      key={column.key}
                      className={`px-4 py-3 ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key] || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
    const getStatusStyle = (status: string): React.CSSProperties => {
      switch (status) {
        case "draft":
          return {
            backgroundColor: "var(--color-bg-warning-surface)",
            color: "var(--color-text-warning)",
            borderColor: "var(--color-border-warning)",
          };
        case "sent":
          return {
            backgroundColor: "var(--color-bg-info-surface)",
            color: "var(--color-text-info)",
            borderColor: "var(--color-border-info)",
          };
        case "approved":
          return {
            backgroundColor: "var(--color-bg-success-surface)",
            color: "var(--color-text-success)",
            borderColor: "var(--color-border-success)",
          };
        default:
          return {
            backgroundColor: "#f3f4f6",
            color: "#4b5563",
            borderColor: "#d1d5db",
          };
      }
    };

    const badgeStyle = getStatusStyle(value);
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border";

    // #region agent log
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const badges = document.querySelectorAll(
          'span[class*="rounded-full"][class*="border"]'
        );
        if (badges.length > 0) {
          const firstBadge = badges[0] as HTMLElement;
          const computed = window.getComputedStyle(firstBadge);
          fetch(
            "http://127.0.0.1:7242/ingest/49f537d8-251b-4d1b-9021-92d0eb2d1e91",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "DataTable.tsx:314",
                message: "Badge status styling check post-fix",
                data: {
                  status: value,
                  badgeStyle,
                  computedBg: computed.backgroundColor,
                  computedColor: computed.color,
                  computedBorder: computed.borderColor,
                  computedDisplay: computed.display,
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "badge-fix-v2",
                hypothesisId: "D",
              }),
            }
          ).catch(() => {});
        }
      }, 100);
    }
    // #endregion

    return (
      <span className={baseClasses} style={badgeStyle}>
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
