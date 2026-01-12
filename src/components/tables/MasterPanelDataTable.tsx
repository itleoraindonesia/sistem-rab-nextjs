"use client"

import * as React from "react"
import Link from "next/link"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Plus, Search } from "lucide-react"

import Button from "../ui/Button"
import { Input } from "../ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Badge } from "../ui/badge"
import { formatRupiah } from "../../lib/utils"

export type Panel = {
  id: string
  name: string
  type: string
  harga: number
  berat?: number
  volume?: number
  jumlah_per_truck?: number
  keterangan?: string
}

function getColumns(onEdit?: (panel: Panel) => void, onDelete?: (id: string, name: string) => void): ColumnDef<Panel>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Panel
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tipe
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <Badge
            variant={
              type === "dinding"
                ? "default"
                : type === "lantai"
                ? "secondary"
                : "outline"
            }
            className={
              type === "dinding"
                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                : type === "lantai"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : ""
            }
          >
            {type === "dinding" ? "Dinding" : type === "lantai" ? "Lantai" : type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "berat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Berat (kg)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const berat = row.getValue("berat") as number
        return <div className="text-right">{berat || 0}</div>
      },
    },
    {
      accessorKey: "volume",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Volume (m³)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const volume = row.getValue("volume") as number
        return <div className="text-right">{volume || 0}</div>
      },
    },
    {
      accessorKey: "jumlah_per_truck",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Jumlah/Truck
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const jumlah = row.getValue("jumlah_per_truck") as number
        return <div className="text-right">{jumlah || 0}</div>
      },
    },
    {
      accessorKey: "harga",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Harga
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const harga = row.getValue("harga") as number
        return <div className="text-right font-medium">{harga ? formatRupiah(harga) : "-"}</div>
      },
    },
    {
      accessorKey: "keterangan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Keterangan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("keterangan") || "-"}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit?.(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(item.id, item.name)}
                className="text-red-600 focus:text-red-600"
              >
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

interface MasterPanelDataTableProps {
  data: Panel[]
  loading?: boolean
  onAdd?: () => void
  onEdit?: (panel: Panel) => void
  onDelete?: (id: string, name: string) => void
}

export function MasterPanelDataTable({ data, loading, onAdd, onEdit, onDelete }: MasterPanelDataTableProps) {
  // Destructure props for actions
  const handleEdit = onEdit
  const handleDelete = onDelete
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const columns = getColumns(handleEdit, handleDelete)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Memuat data panel...</p>
        </div>
      </div>
    )
  }

  return (
  <div className="w-full">
  {/* Header with title and add button */}
  <div className="flex items-center justify-between py-4">
    <h2 className="text-lg font-semibold">Daftar Panel</h2>
    {onAdd && (
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Tambah Panel
      </Button>
    )}
  </div>

  {/* Search Input */}
  <div className="flex items-center py-4">
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Cari panel (ID, nama, tipe)..."
        value={globalFilter ?? ""}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="pl-10"
      />
    </div>
  </div>

  {/* Table with horizontal scroll - FIXED */}
  <div className="w-full overflow-hidden rounded-md border">
    <div className="overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const getColumnWidth = (columnId: string) => {
                  switch (columnId) {
                    case 'id': return 'min-w-24'
                    case 'name': return 'min-w-48'
                    case 'type': return 'min-w-20'
                    case 'berat': return 'min-w-24'
                    case 'volume': return 'min-w-24'
                    case 'jumlah_per_truck': return 'min-w-24'
                    case 'harga': return 'min-w-32'
                    case 'keterangan': return 'min-w-40'
                    case 'actions': return 'min-w-16'
                    default: return ''
                  }
                }

                return (
                  <TableHead
                    key={header.id}
                    className={`${getColumnWidth(header.column.id)} ${
                      header.column.id === 'harga' ? 'text-right' : ''
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const getColumnWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'id': return 'min-w-24'
                      case 'name': return 'min-w-48'
                      case 'type': return 'min-w-20'
                      case 'berat': return 'min-w-24'
                      case 'volume': return 'min-w-24'
                      case 'jumlah_per_truck': return 'min-w-24'
                      case 'harga': return 'min-w-32'
                      case 'keterangan': return 'min-w-40'
                      case 'actions': return 'min-w-16'
                      default: return ''
                    }
                  }

                  return (
                    <TableCell 
                      key={cell.id} 
                      className={getColumnWidth(cell.column.id)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <div className="text-4xl mb-2">🔧</div>
                  <p>Belum ada data panel</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </div>
</div>
  )
}
