"use client";

import { EditMeetingForm } from "@/components/meeting/EditMeetingForm";

export default function EditMeetingPage({ params }: { params: { id: string } }) {
  return (
    <div className='container mx-auto max-w-4xl'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Edit Meeting</h1>
      </div>

      <EditMeetingForm meetingId={params.id} />
    </div>
  );
}
