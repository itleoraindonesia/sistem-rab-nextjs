"use client";

import { MeetingForm } from "@/components/meeting/MeetingForm";

export default function CreateMeetingPage() {
  return (
    <div className='container mx-auto max-w-4xl'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Buat Meeting Baru</h1>
      </div>

      <MeetingForm />
    </div>
  );
}
