import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Route } from 'lucide-react';
import TourJourneyManager from './TourJourneyManager';

interface IntegratedScheduleManagerProps {
  tourId: string;
}

export default function IntegratedScheduleManager({ tourId }: IntegratedScheduleManagerProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Route className="w-5 h-5" />
          일정 관리
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          투어의 전체 여정을 관리합니다. 날짜별 정보, 탑승지, 경유지, 관광지 등을 설정할 수 있습니다.
        </p>
      </div>

      {/* 여정 관리 컴포넌트 */}
      <TourJourneyManager tourId={tourId} />
    </div>
  );
}
