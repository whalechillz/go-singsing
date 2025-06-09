import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Route } from 'lucide-react';
import TourJourneyManager from './TourJourneyManager';

interface IntegratedScheduleManagerProps {
  tourId: string;
}

export default function IntegratedScheduleManager({ tourId }: IntegratedScheduleManagerProps) {
  const [loading, setLoading] = useState(false);

  console.log("IntegratedScheduleManager - received tourId:", tourId);

  if (!tourId) {
    return (
      <div className="p-8">
        <div className="text-red-500">IntegratedScheduleManager: tourId가 전달되지 않았습니다.</div>
      </div>
    );
  }

  return (
    <div>
      {/* 여정 관리 컴포넌트 */}
      <TourJourneyManager tourId={tourId} />
    </div>
  );
}
