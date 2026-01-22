"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, FileDown, AlertTriangle, Loader2 } from "lucide-react"
import { Card, CardContent } from "../../../../components/ui"
import Button from "../../../../components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"

export default function MoMPage() {
  const { data: momMeetings, isLoading, error } = useQuery({
    queryKey: ['mom-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mom_meetings')
        .select(`
          *,
          users!mom_meetings_created_by_fkey (
            nama
          )
        `)
        .order('meeting_date', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="space-y-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-brand-primary">Minutes of Meeting (MoM)</h1>
            <p className="text-gray-600">Dokumentasi notulen rapat internal dan eksternal</p>
          </div>
          <div className="text-red-500">Error loading meetings: {error.message}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-brand-primary">Minutes of Meeting (MoM)</h1>
          <p className="text-gray-600">Dokumentasi notulen rapat internal dan eksternal</p>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Link href="/meeting/baru">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat MoM Baru
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
            {/* Table */}
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Judul Meeting</th>
                        <th className="text-left p-4 font-semibold">Tanggal</th>
                        <th className="text-left p-4 font-semibold">Tipe</th>
                        <th className="text-left p-4 font-semibold">Peserta</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Pembuat</th>
                        <th className="text-left p-4 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {momMeetings?.map((mom) => (
                        <tr key={mom.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{mom.title}</td>
                          <td className="p-4 text-sm">
                            {new Date(mom.meeting_date).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                mom.meeting_type === "internal"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {mom.meeting_type === "internal" ? "Internal" : "External"}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{mom.participants?.length || 0} peserta</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                mom.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {mom.status === "published" ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {mom.users?.nama?.split(' ')[0] || mom.created_by}
                          </td>
                          <td className="p-4">
                            <Link href={`/meeting/mom/${mom.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {momMeetings?.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-gray-500">
                            Belum ada meeting yang dibuat
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
