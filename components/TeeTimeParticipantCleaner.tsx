"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, CheckCircle, Trash2, Users } from 'lucide-react';

interface Props {
  tourId: string;
  onComplete?: () => void;
}

// 코스명 간소화 함수
const simplifyCourseName = (fullName: string): string => {
  // "골프장명 - 코스명" 형태에서 코스명만 추출
  const parts = fullName.split(' - ');
  return parts.length > 1 ? parts[1] : fullName;
};

export const TeeTimeParticipantCleaner: React.FC<Props> = ({ tourId, onComplete }) => {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ total: 0, duplicates: 0, cleaned: 0 });

  useEffect(() => {
    checkDuplicates();
  }, [tourId]);

  const checkDuplicates = async () => {
    try {
      // 다대다 테이블에서 중복 확인
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('singsing_participant_tee_times')
        .select(`
          participant_id,
          tee_time_id,
          singsing_participants!inner(name, phone),
          singsing_tee_times!inner(play_date, tee_time, golf_course)
        `)
        .order('participant_id');

      if (assignmentError) throw assignmentError;

      // 중복 찾기
      const duplicateMap = new Map();
      
      assignmentData?.forEach(item => {
        const key = `${item.participant_id}-${item.tee_time_id}`;
        if (duplicateMap.has(key)) {
          duplicateMap.get(key).count++;
        } else {
          duplicateMap.set(key, {
            ...item,
            count: 1,
            key
          });
        }
      });

      const duplicateEntries = Array.from(duplicateMap.values())
        .filter(item => item.count > 1)
        .sort((a, b) => b.count - a.count);

      setDuplicates(duplicateEntries);
      setStats({
        total: assignmentData?.length || 0,
        duplicates: duplicateEntries.length,
        cleaned: 0
      });
      
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanDuplicates = async () => {
    if (!window.confirm('중복된 티타임 배정을 정리하시겠습니까?')) return;
    
    setProcessing(true);
    let cleanedCount = 0;

    try {
      // 각 중복 항목에 대해 하나만 남기고 삭제
      for (const dup of duplicates) {
        // 먼저 해당 조합의 모든 레코드 가져오기
        const { data: records, error: fetchError } = await supabase
          .from('singsing_participant_tee_times')
          .select('*')
          .eq('participant_id', dup.participant_id)
          .eq('tee_time_id', dup.tee_time_id);

        if (fetchError) throw fetchError;

        // 첫 번째를 제외한 나머지 삭제
        if (records && records.length > 1) {
          const idsToDelete = records.slice(1).map(r => r.id).filter(Boolean);
          
          if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('singsing_participant_tee_times')
              .delete()
              .in('id', idsToDelete);

            if (deleteError) throw deleteError;
            cleanedCount += idsToDelete.length;
          }
        }
      }

      alert(`${cleanedCount}개의 중복 배정이 제거되었습니다.`);
      setStats(prev => ({ ...prev, cleaned: cleanedCount }));
      
      if (onComplete) onComplete();
      
      // 다시 확인
      await checkDuplicates();
      
    } catch (error: any) {
      alert(`정리 중 오류 발생: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-4">중복 확인 중...</div>;
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">티타임 배정 중복 정리</h3>
      </div>
      
      {duplicates.length === 0 ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>중복된 티타임 배정이 없습니다.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">중복된 티타임 배정 발견</p>
                <p>동일한 참가자가 같은 티타임에 여러 번 배정되어 있습니다.</p>
                <p className="mt-2">
                  • 전체 배정: {stats.total}건<br/>
                  • 중복 항목: {stats.duplicates}건
                </p>
              </div>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto mb-4 border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">참가자</th>
                  <th className="text-left p-2">날짜</th>
                  <th className="text-left p-2">티타임</th>
                  <th className="text-left p-2">코스</th>
                  <th className="text-right p-2">중복 수</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.slice(0, 10).map((dup, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{dup.singsing_participants?.name}</td>
                    <td className="p-2">{dup.singsing_tee_times?.play_date}</td>
                    <td className="p-2">{dup.singsing_tee_times?.tee_time}</td>
                    <td className="p-2">{simplifyCourseName(dup.singsing_tee_times?.golf_course || '')}</td>
                    <td className="p-2 text-right font-medium text-red-600">
                      {dup.count}개
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {duplicates.length > 10 && (
              <div className="p-2 text-center text-sm text-gray-500">
                ... 외 {duplicates.length - 10}건
              </div>
            )}
          </div>
          
          <button
            onClick={cleanDuplicates}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {processing ? '정리 중...' : '중복 제거하기'}
          </button>
        </>
      )}
    </div>
  );
};
