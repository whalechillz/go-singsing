import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Users, AlertCircle, Check } from 'lucide-react';

interface DuplicateParticipant {
  clean_name: string;
  phone: string;
  participants: {
    id: string;
    name: string;
    created_at: string;
    tee_time_id?: string;
  }[];
}

export const ParticipantDuplicateCleaner: React.FC<{ tourId: string }> = ({ tourId }) => {
  const [duplicates, setDuplicates] = useState<DuplicateParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMerges, setSelectedMerges] = useState<Record<string, string>>({});

  useEffect(() => {
    findDuplicates();
  }, [tourId]);

  const findDuplicates = async () => {
    try {
      // 모든 참가자 가져오기
      const { data: participants, error } = await supabase
        .from('singsing_participants')
        .select('*')
        .eq('tour_id', tourId)
        .order('created_at');

      if (error) throw error;

      // 중복 그룹화 (이름에서 날짜 부분 제거)
      const groups: Record<string, typeof participants> = {};
      
      participants?.forEach(p => {
        // 이름에서 날짜 부분 제거 (예: "조민자 (4/14)" -> "조민자")
        const cleanName = p.name.replace(/\s*\([^)]*\)$/, '').trim();
        const key = `${cleanName}|${p.phone || 'no-phone'}`;
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
      });

      // 중복된 그룹만 필터링
      const duplicateGroups = Object.entries(groups)
        .filter(([_, participants]) => participants.length > 1)
        .map(([key, participants]) => {
          const [clean_name, phone] = key.split('|');
          return {
            clean_name,
            phone: phone === 'no-phone' ? '' : phone,
            participants: participants.map(p => ({
              id: p.id,
              name: p.name,
              created_at: p.created_at,
              tee_time_id: p.tee_time_id
            }))
          };
        });

      setDuplicates(duplicateGroups);
      
      // 기본 선택: 첫 번째 참가자를 대표로
      const defaultSelections: Record<string, string> = {};
      duplicateGroups.forEach(group => {
        const key = `${group.clean_name}|${group.phone}`;
        defaultSelections[key] = group.participants[0].id;
      });
      setSelectedMerges(defaultSelections);
      
    } catch (error) {
      console.error('Error finding duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!window.confirm('선택한 대로 중복 참가자를 병합하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    
    setProcessing(true);
    try {
      for (const group of duplicates) {
        const key = `${group.clean_name}|${group.phone}`;
        const primaryId = selectedMerges[key];
        
        if (!primaryId) continue;
        
        // 다른 참가자들의 티타임을 primary 참가자로 이전
        const otherParticipants = group.participants.filter(p => p.id !== primaryId);
        
        for (const other of otherParticipants) {
          // 기존 티타임 배정 정보 가져오기
          if (other.tee_time_id) {
            // 다대다 테이블에 추가
            await supabase
              .from('singsing_participant_tee_times')
              .insert({
                participant_id: primaryId,
                tee_time_id: other.tee_time_id
              })
              .select();
          }
        }
        
        // 대표 참가자의 이름을 깔끔하게 정리
        await supabase
          .from('singsing_participants')
          .update({ 
            name: group.clean_name,
            // 날짜별 정보는 제거하고 원래 이름만 저장
          })
          .eq('id', primaryId);
        
        // 중복 참가자 삭제
        const idsToDelete = otherParticipants.map(p => p.id);
        if (idsToDelete.length > 0) {
          await supabase
            .from('singsing_participants')
            .delete()
            .in('id', idsToDelete);
        }
      }
      
      alert('중복 참가자 병합이 완료되었습니다.');
      window.location.reload(); // 페이지 새로고침
      
    } catch (error: any) {
      alert(`병합 중 오류 발생: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-4">중복 참가자 확인 중...</div>;
  }

  if (duplicates.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-800">
          <Check className="w-5 h-5" />
          <span>중복된 참가자가 없습니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold">중복 참가자 정리</h3>
      </div>
      
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">날짜별로 분리된 참가자를 하나로 병합합니다.</p>
            <p>각 그룹에서 대표 참가자를 선택하면, 나머지는 삭제되고 티타임 정보는 대표 참가자로 이전됩니다.</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-4">
        {duplicates.map((group, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">
                {group.clean_name} {group.phone && `(${group.phone})`}
              </h4>
              <span className="text-sm text-gray-500">
                {group.participants.length}개 중복
              </span>
            </div>
            
            <div className="space-y-2">
              {group.participants.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name={`merge-${group.clean_name}-${group.phone}`}
                    value={p.id}
                    checked={selectedMerges[`${group.clean_name}|${group.phone}`] === p.id}
                    onChange={(e) => {
                      setSelectedMerges({
                        ...selectedMerges,
                        [`${group.clean_name}|${group.phone}`]: e.target.value
                      });
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      등록일: {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  {selectedMerges[`${group.clean_name}|${group.phone}`] === p.id && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      대표
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleMerge}
        disabled={processing}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-medium"
      >
        {processing ? '병합 중...' : `${duplicates.length}개 그룹 병합하기`}
      </button>
    </div>
  );
};