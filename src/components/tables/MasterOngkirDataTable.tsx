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
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Search, Truck } from "lucide-react"

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
import { formatRupiah } from "../../lib/utils"

export type Ongkir = {
  id?: string
  provinsi: string
  biaya: number
  kabupaten?: string
}

function getColumns(handleDelete?: (provinsi: string) => void): ColumnDef<Ongkir>[] {
  return [
    {
      accessorKey: "provinsi",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Provinsi
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("provinsi")}</div>,
    },
    {
      accessorKey: "kabupaten",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kabupaten
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("kabupaten") || "-"}</div>,
    },
    {
      accessorKey: "biaya",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Biaya Ongkir
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const biaya = row.getValue("biaya") as number
        return <div className="text-right font-medium">{biaya ? formatRupiah(biaya) : "-"}</div>
      },
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
              <DropdownMenuItem onClick={() => {}}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete?.(item.provinsi)}
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

interface MasterOngkirDataTableProps {
  data: Ongkir[]
  loading?: boolean
  onAdd?: () => void
  onEdit?: (ongkir: Ongkir) => void
  onDelete?: (provinsi: string) => void
}

export function MasterOngkirDataTable({ data, loading, onAdd, onEdit, onDelete }: MasterOngkirDataTableProps) {
  // Destructure props for actions
  const handleEdit = onEdit
  const handleDelete = onDelete

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const columns = getColumns(handleDelete)

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
          <p className="mt-2 text-sm text-muted-foreground">Memuat data ongkir...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-lg font-semibold">Daftar Ongkos Kirim</h2>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Ongkir
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari provinsi, kabupaten..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table with horizontal scroll */}
      <div className="w-full overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table className="min-w-max">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const getColumnWidth = (columnId: string) => {
                      switch (columnId) {
                        case 'provinsi': return 'min-w-48'
                        case 'kabupaten': return 'min-w-40'
                        case 'biaya': return 'min-w-32'
                        case 'actions': return 'min-w-16'
                        default: return ''
                      }
                    }

                    return (
                      <TableHead
                        key={header.id}
                        className={`${getColumnWidth(header.column.id)} ${
                          header.column.id === 'biaya' ? 'text-right' : ''
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
                          case 'provinsi': return 'min-w-48'
                          case 'kabupaten': return 'min-w-40'
                          case 'biaya': return 'min-w-32'
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
                      <div className="text-4xl mb-2">🚚</div>
                      <p>Belum ada data ongkos kirim</p>
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
