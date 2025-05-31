// 참가자 전체 일정 참가 설정 컴포넌트
import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ParticipationScheduleProps {
  tourId: string;
  participantId?: string;
  participantName: string;
  onClose: () => void;
  onSave: () => void;
}

interface TeeTimeDate {
  date: string;
  teeTimeIds: string[];
  isAssigned: boolean;
}

export const ParticipationSchedule: React.FC<ParticipationScheduleProps> = ({
  tourId,
  participantId,
  participantName,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(true);
  const [teeTimeDates, setTeeTimeDates] = useState<TeeTimeDate[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [participationMode, setParticipationMode] = useState<'full' | 'partial'>('full');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeeTimesAndAssignments();
  }, [tourId, participantId]);

  const fetchTeeTimesAndAssignments = async () => {
    try {
      // 투어의 모든 티타임 가져오기
      const { data: teeTimes, error: teeTimesError } = await supabase
        .from('singsing_tee_times')
        .select('*')
        .eq('tour_id', tourId)
        .order('play_date', { ascending: true });

      if (teeTimesError) throw teeTimesError;

      // 날짜별로 그룹화
      const dateMap = new Map<string, string[]>();
      teeTimes?.forEach(tt => {
        const date = tt.play_date || tt.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, []);
        }
        dateMap.get(date)?.push(tt.id);
      });

      // 참가자의 현재 배정 상태 확인
      let currentAssignments: string[] = [];
      if (participantId) {
        const { data: assignments } = await supabase
          .from('singsing_participant_tee_times')
          .select('tee_time_id')
          .eq('participant_id', participantId);

        currentAssignments = assignments?.map(a => a.tee_time_id) || [];
      }

      // TeeTimeDate 배열 생성
      const dates: TeeTimeDate[] = Array.from(dateMap.entries()).map(([date, teeTimeIds]) => ({
        date,
        teeTimeIds,
        isAssigned: teeTimeIds.some(id => currentAssignments.includes(id))
      }));

      setTeeTimeDates(dates);
      
      // 선택된 날짜 초기화
      const assignedDates = dates.filter(d => d.isAssigned).map(d => d.date);
      setSelectedDates(assignedDates);
      
      // 참가 모드 결정
      if (assignedDates.length === dates.length && dates.length > 0) {
        setParticipationMode('full');
      } else {
        setParticipationMode('partial');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching tee times:', error);
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedDates(teeTimeDates.map(d => d.date));
    setParticipationMode('full');
  };

  const handleDeselectAll = () => {
    setSelectedDates([]);
    setParticipationMode('partial');
  };

  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
      setParticipationMode('partial');
    } else {
      const newSelected = [...selectedDates, date];
      setSelectedDates(newSelected);
      if (newSelected.length === teeTimeDates.length) {
        setParticipationMode('full');
      }
    }
  };

  const handleSave = async () => {
    if (!participantId) {
      alert('참가자 ID가 없습니다.');
      return;
    }

    setSaving(true);
    try {
      // 기존 배정 모두 삭제
      const { error: deleteError } = await supabase
        .from('singsing_participant_tee_times')
        .delete()
        .eq('participant_id', participantId);

      if (deleteError) throw deleteError;

      // 선택된 날짜에 대해 새로 배정
      const assignments = [];
      for (const selectedDate of selectedDates) {
        const dateInfo = teeTimeDates.find(d => d.date === selectedDate);
        if (dateInfo && dateInfo.teeTimeIds.length > 0) {
          // 각 날짜의 첫 번째 빈 티타임에 배정
          for (const teeTimeId of dateInfo.teeTimeIds) {
            // 해당 티타임의 현재 배정 인원 확인
            const { data: currentAssignments } = await supabase
              .from('singsing_participant_tee_times')
              .select('id')
              .eq('tee_time_id', teeTimeId);

            const { data: teeTime } = await supabase
              .from('singsing_tee_times')
              .select('max_players')
              .eq('id', teeTimeId)
              .single();

            const maxPlayers = teeTime?.max_players || 4;
            const currentCount = currentAssignments?.length || 0;

            if (currentCount < maxPlayers) {
              assignments.push({
                participant_id: participantId,
                tee_time_id: teeTimeId
              });
              break; // 하나의 티타임에만 배정
            }
          }
        }
      }

      if (assignments.length > 0) {
        const { error: insertError } = await supabase
          .from('singsing_participant_tee_times')
          .insert(assignments);

        if (insertError) throw insertError;
      }

      alert(`${participantName}님의 일정이 업데이트되었습니다. (${selectedDates.length}개 날짜)`);
      onSave();
      onClose();
    } catch (error: any) {
      alert(`저장 중 오류 발생: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {participantName}님 일정 설정
        </h3>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              총 {teeTimeDates.length}개 날짜
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                전체 선택
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                전체 해제
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {teeTimeDates.map(dateInfo => {
              const isSelected = selectedDates.includes(dateInfo.date);
              const dateObj = new Date(dateInfo.date);
              const dateStr = dateObj.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              });

              return (
                <div
                  key={dateInfo.date}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleDate(dateInfo.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}>
                        {dateStr}
                      </span>
                    </div>
                    {dateInfo.isAssigned && (
                      <span className="text-xs text-green-600 font-medium">
                        현재 배정됨
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">
            선택한 날짜: <span className="font-semibold text-gray-900">{selectedDates.length}개</span>
            {participationMode === 'full' && (
              <span className="ml-2 text-green-600 font-medium">(전체 일정 참가)</span>
            )}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedDates.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};