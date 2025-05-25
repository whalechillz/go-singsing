"use client";

import ParticipantsManagerV2 from "@/components/ParticipantsManagerV2";

export default function ParticipantsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-2xl font-bold">전체 참가자 관리</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <ParticipantsManagerV2 />
      </div>
    </div>
  );
}