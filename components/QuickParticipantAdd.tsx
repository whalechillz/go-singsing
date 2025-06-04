"use client";
import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface QuickParticipantAddProps {
  tourId: string;
  onSuccess: () => void;
  boardingPlaces: { id: string; name: string; }[];
}

const QuickParticipantAdd: React.FC<QuickParticipantAddProps> = ({ tourId, onSuccess, boardingPlaces }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [participants, setParticipants] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any[]>([]);

  // 텍스트 파싱 함수
  const parseParticipants = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = lines.map((line, index) => {
      const parts = line.split(/[\t,]/).map(p => p.trim()); // 탭이나 쉼표로 구분
      
      // 첨 번째는 항상 이름
      const name = parts[0] || '';
      
      // 두 번째와 세 번째 필드 판단
      let phone = '';
      let gender = '';
      
      if (parts[1]) {
        // 두 번째 필드가 성별인지 전화번호인지 판단
        if (isGender(parts[1])) {
          gender = normalizeGender(parts[1]);
          phone = parts[2] ? normalizePhone(parts[2]) : '';
        } else {
          phone = normalizePhone(parts[1]);
          gender = parts[2] ? normalizeGender(parts[2]) : '';
        }
      }
      
      // 나머지 필드들
      const team = parts[3] || '';
      const role = parts[4] || ''; // 기본값 제거
      const pickup_location = parts[5] || '';
      
      return {
        row: index + 1,
        name,
        phone,
        gender,
        team,
        role,
        pickup_location,
        valid: !!name // 최소한 이름은 있어야 함
      };
    });
    
    return parsed;
  };

  // 성별 판단 함수
  const isGender = (value: string) => {
    const normalized = value.toUpperCase();
    return ['남', '여', 'M', 'F'].includes(normalized);
  };

  // 성별 정규화 함수
  const normalizeGender = (value: string) => {
    const normalized = value.toUpperCase();
    if (normalized === 'M' || normalized === '남') return '남';
    if (normalized === 'F' || normalized === '여') return '여';
    return value;
  };

  // 전화번호 정규화
  const normalizePhone = (phone: string) => {
    const numbers = phone.replace(/[^0-9]/g, '');
    if (numbers.length === 10 && !numbers.startsWith('0')) {
      return '0' + numbers;
    }
    return numbers.slice(0, 11);
  };

  // 미리보기
  const handlePreview = () => {
    const parsed = parseParticipants(participants);
    setPreview(parsed);
    
    if (parsed.filter(p => p.valid).length === 0) {
      setError('입력된 유효한 참가자가 없습니다.');
      return;
    }
  };

  // 저장
  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    const validParticipants = preview
      .filter(p => p.valid)
      .map(p => ({
        tour_id: tourId,
        name: p.name,
        phone: p.phone,
        gender: p.gender,
        team_name: p.team,
        role: p.role,
        pickup_location: p.pickup_location,
        status: '확정',
        join_count: 0,
        group_size: 1
      }));

    const { error } = await supabase
      .from('singsing_participants')
      .insert(validParticipants);

    if (error) {
      setError('저장 중 오류가 발생했습니다: ' + error.message);
    } else {
      alert(`${validParticipants.length}명의 참가자가 추가되었습니다.`);
      setIsOpen(false);
      setParticipants('');
      setPreview([]);
      onSuccess();
    }
    
    setLoading(false);
  };

  return (
    <>
      {/* 간단 입력 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        title="간단 입력"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">간단 입력</span>
      </button>

      {/* 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">참가자 간단 입력</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 입력 영역 */}
            {preview.length === 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    엑셀에서 복사하거나 아래 형식으로 입력하세요:
                  </p>
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono mb-4">
                    이름[탭]전화번호[탭]성별[탭]팀[탭]직책[탭]탑승지<br/>
                    홍길동[탭]01012345678[탭]남[탭]A팀[탭]총무[탭]서울<br/>
                    김영희[탭]01098765432[탭]여[탭]B팀[탭]회원[탭]부산<br/>
                    <br/>
                    또는<br/>
                    <br/>
                    이름[탭]성별[탭]전화번호[탭]팀[탭]직책[탭]탑승지<br/>
                    박철수[탭]M[탭]01087654321[탭]C팀[탭]회원[탭]대구
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    * 성별은 남/여 또는 M/F 로 입력 가능합니다<br/>
                    * 이름 다음에 전화번호 또는 성별이 올 수 있습니다<br/>
                    * 필수 항목은 이름만 입니다
                  </p>
                </div>

                <textarea
                  className="w-full h-64 border rounded-lg p-3 font-mono text-sm"
                  placeholder="이름	전화번호	성별	팀	직책	탑승지
홍길동	01012345678	남	A팀	총무	서울
김영희	01098765432	여	B팀	회원	부산"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePreview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={!participants.trim()}
                  >
                    미리보기
                  </button>
                </div>
              </>
            ) : (
              /* 미리보기 영역 */
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    총 {preview.length}명 중 유효: {preview.filter(p => p.valid).length}명
                  </p>
                </div>

                <div className="border rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">이름</th>
                        <th className="px-4 py-2 text-left">전화번호</th>
                        <th className="px-4 py-2 text-left">성별</th>
                        <th className="px-4 py-2 text-left">팀</th>
                        <th className="px-4 py-2 text-left">직책</th>
                        <th className="px-4 py-2 text-left">탑승지</th>
                        <th className="px-4 py-2 text-left">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p, idx) => (
                        <tr key={idx} className={p.valid ? '' : 'bg-red-50'}>
                          <td className="px-4 py-2">{p.row}</td>
                          <td className="px-4 py-2">{p.name || '-'}</td>
                          <td className="px-4 py-2">{p.phone || '-'}</td>
                          <td className="px-4 py-2">{p.gender || '-'}</td>
                          <td className="px-4 py-2">{p.team || '-'}</td>
                          <td className="px-4 py-2">{p.role || '-'}</td>
                          <td className="px-4 py-2">{p.pickup_location || '-'}</td>
                          <td className="px-4 py-2">
                            {p.valid ? (
                              <span className="text-green-600">✓ 유효</span>
                            ) : (
                              <span className="text-red-600">✗ 이름 없음</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setPreview([]);
                      setParticipants('');
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    다시 입력
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={loading || preview.filter(p => p.valid).length === 0}
                  >
                    {loading ? '저장 중...' : `${preview.filter(p => p.valid).length}명 저장`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickParticipantAdd;