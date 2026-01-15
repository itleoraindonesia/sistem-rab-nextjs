"use client";

import { useState } from "react";
import { Button, Input, Label, Textarea, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

export default function CreateMeetingPage() {
  return (
    <div className='container mx-auto max-w-2xl'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Buat Meeting Baru</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul Meeting</Label>
              <Input id="judul" placeholder="Contoh: Weekly Sync" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input id="tanggal" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waktu">Waktu</Label>
                <Input id="waktu" type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi / Link Meeting</Label>
              <Input id="lokasi" placeholder="Ruang Meeting A atau Link Zoom" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea id="agenda" placeholder="Agenda pembahasan..." className="min-h-[100px]" />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">Buat Jadwal Meeting</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
