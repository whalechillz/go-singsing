"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Check, AlertCircle, RefreshCw, X, Eye, FileText } from "lucide-react";
import RoomAssignmentPreview from "./RoomAssignmentPreview";

type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  room_id?: string | null;
  singsing_rooms?: {
    room_type?: string;
    room_seq?: number;
    room_number?: string;
  };
};

type Room = {
  id: string;
  room_type: string;
  room_seq: number;
  room_number?: string;
  capacity: number;
  quantity: number;
  tour_id: string;
};

type Tour = {
  id: string;
  title: string;  // 실제 DB 커럼명
  start_date: string;
  end_date: string;
  driver_name?: string;
  driver_phone?: string;
};

type Staff = {
  id: string;
  tour_id: string;
  name: string;
  phone: string;
  role: string;
  order: number;
};

type Props = { tourId: string; refreshKey?: number };

const RoomAssignmentManager: React.FC<Props> = ({ tourId, refreshKey }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tour, setTour] = useState<Tour | null>(null);
  const [tourStaff, setTourStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [previewType, setPreviewType] = useState<'staff'>('staff');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 데이터 fetch
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: participantsData, error: participantsError }, { data: roomsData, error: roomsError }, { data: tourData, error: tourError }, { data: staffData, error: staffError }] = await Promise.all([
        supabase
          .from("singsing_participants")
          .select("*, singsing_rooms:room_id(id, room_type, room_seq, room_number, capacity)")
          .eq("tour_id", tourId)
          .order("created_at", { ascending: true }),
        supabase
          .from("singsing_rooms")
          .select("*")
          .eq("tour_id", tourId)
          .order("room_seq"),
        supabase
          .from("singsing_tours")
          .select("*")
          .eq("id", tourId)
          .single(),
        supabase
          .from("singsing_tour_staff")
          .select("*")
          .eq("tour_id", tourId)
          .eq("role", "기사")
          .order("order")
          .limit(1)
      ]);
      
      if (participantsError) throw participantsError;
      if (roomsError) throw roomsError;
      if (tourError && tourError.code !== 'PGRST116') throw tourError;
      
      setParticipants((participantsData || []) as Participant[]);
      setRooms((roomsData || []) as Room[]);
      setTour(tourData as Tour);
      setTourStaff(staffData && staffData.length > 0 ? staffData[0] as Staff : null);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tourId) fetchData(); }, [tourId, refreshKey]);

  // 객실 배정 변경
  const handleAssignRoom = async (participantId: string, roomId: string) => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      const assignedCount = participants.filter(p => p.room_id === roomId).length;
      if (room && assignedCount >= room.capacity) {
        alert('이 객실은 정원이 가득 찼습니다.');
        return;
      }
    }
    
    try {
      setAssigning(participantId);
      const { error } = await supabase
        .from("singsing_participants")
        .update({ room_id: roomId === "" ? null : roomId })
        .eq("id", participantId);
      
      if (error) throw error;
      
      await fetchData();
      setAssignSuccess(participantId);
      setTimeout(() => setAssignSuccess(null), 1200);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAssigning(null);
    }
  };

  // 개별 객실 삭제
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('이 객실을 삭제하시겠습니까? 배정된 참가자들은 미배정 상태가 됩니다.')) {
      return;
    }
    
    try {
      const { error: updateError } = await supabase
        .from("singsing_participants")
        .update({ room_id: null })
        .eq("room_id", roomId);
      
      if (updateError) throw updateError;
      
      const { error: deleteError } = await supabase
        .from("singsing_rooms")
        .delete()
        .eq("id", roomId);
      
      if (deleteError) throw deleteError;
      
      await fetchData();
    } catch (error: any) {
      setError(`객실 삭제 중 오류 발생: ${error.message}`);
    }
  };

  // 미리보기 HTML 생성
  const generatePreviewHTML = (type: 'staff', driverName?: string, driverPhone?: string) => {
    const assignedParticipants = participants.filter(p => p.room_id);
    const sortedParticipants = [...assignedParticipants].sort((a, b) => {
      const roomA = rooms.find(r => r.id === a.room_id);
      const roomB = rooms.find(r => r.id === b.room_id);
      if (!roomA || !roomB) return 0;
      return roomA.room_number!.localeCompare(roomB.room_number!);
    });

    const tourTitle = tour?.title || "투어명";
    
    // 투어 기간 계산
    let tourPeriod = "투어 기간";
    if (tour?.start_date && tour?.end_date) {
      const startDate = new Date(tour.start_date);
      const endDate = new Date(tour.end_date);
      const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[date.getDay()];
        return `${month}/${day}(${weekday})`;
      };
      tourPeriod = `${formatDate(startDate)}~${formatDate(endDate)}`;
    }
    const currentDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    
    // 기사 정보 결정 (우선순위: 전달받은 값 > 스태프 정보 > 투어 정보 > 기본값)
    const finalDriverName = driverName || tourStaff?.name || tour?.driver_name || '기사님';
    const finalDriverPhone = driverPhone || tourStaff?.phone || tour?.driver_phone || '010-0000-0000';

    const participantRows = sortedParticipants.map((p, index) => {
      const room = rooms.find(r => r.id === p.room_id);
      const roomParticipants = sortedParticipants.filter(pp => pp.room_id === p.room_id);
      const isFirstInRoom = roomParticipants.indexOf(p) === 0;
      const roomRowspan = roomParticipants.length;

      let row = `<tr class="team-row">
        <td>${index + 1}</td>
        <td>${p.name}</td>
        <td>${p.phone || ''}</td>`;
      
      if (isFirstInRoom) {
        row += `
        <td rowspan="${roomRowspan}">${p.team_name || ''}</td>
        <td rowspan="${roomRowspan}">${roomRowspan}</td>
        <td rowspan="${roomRowspan}">${room?.room_number || '미배정'}</td>`;
      }
      
      row += `
      </tr>`;
      return row;
    }).join('\n');

    // 객실별 통계 계산
    const roomStats = rooms.map(room => {
      const assigned = sortedParticipants.filter(p => p.room_id === room.id);
      return { room, assigned: assigned.length };
    });
    
    const totalRooms = rooms.filter(r => r.capacity > 0).length;
    const occupiedRoomCount = roomStats.filter(rs => rs.assigned > 0).length;
    
    // 콤프룸 정보 계산
    const compRoomsInfo = compRooms.map(room => {
      const assigned = sortedParticipants.filter(p => p.room_id === room.id);
      return {
        room,
        assigned: assigned.length,
        participants: assigned
      };
    });

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>팀명단 / 객실배정 (내부용)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', 'Arial', sans-serif; }
    body { background-color: #FFFFFF; color: #2D3748; line-height: 1.6; padding: 10px; }
    .container { width: 100%; max-width: 850px; margin: 0 auto; }
    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #DEE2E6; }
    .title-section { flex: 1; }
    .info-section { text-align: right; padding: 8px 12px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #DEE2E6; margin-left: 15px; }
    .info-section p { margin: 0; line-height: 1.5; font-size: 14px; }
    h1 { color: #34699C; font-size: 22px; margin-bottom: 8px; }
    .subtitle { font-size: 16px; font-weight: 500; color: #4A5568; margin-bottom: 6px; }
    .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #DEE2E6; padding: 8px 10px; text-align: center; }
    th { background-color: #ECF0F1; font-weight: bold; color: #34699C; }
    .team-row { background-color: rgba(123, 196, 162, 0.15); }
    .staff-note { color: #e53e3e; font-weight: bold; text-align: center; margin-bottom: 15px; padding: 8px; background-color: #fff5f5; border-radius: 4px; border: 1px solid #fed7d7; }
    @media (max-width: 600px) { table { font-size: 12px; } th, td { padding: 6px 4px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-container">
      <div class="title-section">
        <h1>팀명단 / 객실배정 (내부용)</h1>
        <p class="subtitle">${tourTitle} / ${tourPeriod}</p>
      </div>

    </div>
    <div style="margin-bottom: 20px; padding: 15px; background-color: #f1f5f9; border: 2px solid #64748b; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #94a3b8; padding-bottom: 10px;">
        <p style="font-weight: bold; font-size: 16px; color: #334155;">${tourTitle} 탑승 ${sortedParticipants.length}명</p>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <div style="flex: 2; min-width: 250px; background-color: #ffffff; padding: 10px; border-radius: 4px; border-left: 4px solid #3b82f6;">
          <p style="font-weight: bold; margin-bottom: 5px; color: #1e40af;">투어 참가자 객실</p>
          <p>총 ${totalRooms}객 중 ${occupiedRoomCount}객 사용</p>
        </div>
        ${compRoomsInfo.length > 0 ? `
        <div style="flex: 1; min-width: 200px; background-color: #ffffff; padding: 10px; border-radius: 4px; border-left: 4px solid #8b5cf6;">
          <p style="font-weight: bold; margin-bottom: 5px; color: #6b21a8;">콤프룸 현황</p>
          ${compRoomsInfo.map(comp => `
            <p style="margin: 2px 0; font-size: 14px;">${comp.room.room_number}호: ${comp.participants.map(p => p.name).join(', ') || '미배정'}</p>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
    
    <p class="staff-note">※ 이 명단은 내부용으로 고객 연락처 정보가 포함되어 있습니다.</p>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>NO.</th>
            <th>성명</th>
            <th>연락처</th>
            <th>팀명/동호회</th>
            <th>인원</th>
            <th>객실</th>
          </tr>
        </thead>
        <tbody>
          ${participantRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePreview = () => {
    // 기본 기사 정보 설정
    const defaultDriverName = tourStaff?.name || tour?.driver_name || '기사님';
    const defaultDriverPhone = tourStaff?.phone || '010-0000-0000';
    
    const html = generatePreviewHTML(previewType, defaultDriverName, defaultDriverPhone);
    setPreviewHtml(html);
    setIsPreviewOpen(true);
  };

  // 미배정 참가자 필터링
  const filteredUnassigned = participants.filter(p => !p.room_id && p.name.includes(unassignedSearch));
  
  // 통계 계산
  const assignedParticipants = participants.filter(p => p.room_id).length;
  const totalParticipants = participants.length;
  const unassignedParticipants = totalParticipants - assignedParticipants;
  
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupiedSpaces = participants.filter(p => p.room_id).length;
  const availableSpaces = totalCapacity - occupiedSpaces;
  
  const compRooms = rooms.filter(room => {
    const name = room.room_type.toLowerCase();
    return name.includes('가이드') || 
           name.includes('기사') || 
           name.includes('comp') ||
           name.includes('무료') ||
           name === '가이드' ||
           name === '콤프룸' ||
           name === 'comp룸';
  });
  
  // 빈 객실: 참가자가 한 명도 배정되지 않은 객실 (정원 0인 객실 제외)
  const emptyRooms = rooms.filter(room => {
    if (room.capacity === 0) return false; // 정원 0인 객실은 제외
    const assignedToRoom = participants.filter(p => p.room_id === room.id).length;
    return assignedToRoom === 0;
  }).length;
  
  // 사용 가능한 객실 수 (정원이 1 이상인 객실)
  const usableRooms = rooms.filter(room => room.capacity > 0).length;
  const occupiedRooms = usableRooms - emptyRooms;

  return (
    <div className="mb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">객실별 참가자 그룹핑</h2>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await fetchData();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '새로고침 중...' : '새로고침'}
          </button>
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            내부용 미리보기
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <>
          {/* 통계 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">참가자 현황</div>
              <div className="text-2xl font-bold text-blue-900">{assignedParticipants}/{totalParticipants}</div>
              <div className="text-xs text-blue-600">배정완료 / 총인원</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">객실 현황</div>
              <div className="text-2xl font-bold text-green-900">{occupiedSpaces}/{totalCapacity}</div>
              <div className="text-xs text-green-600">사용중 / 총정원</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">빈 객실</div>
              <div className="text-2xl font-bold text-yellow-900">{emptyRooms}/{usableRooms}</div>
              <div className="text-xs text-yellow-600">빈 방 / 사용가능 객실</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">콤프룸</div>
              <div className="text-2xl font-bold text-purple-900">{compRooms.length}개</div>
              <div className="text-xs text-purple-600">가이드/기사 객실</div>
            </div>
          </div>
          
          {/* 미배정 경고 */}
          {unassignedParticipants > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">
                미배정 참가자가 {unassignedParticipants}명 있습니다. 남은 자리: {availableSpaces}개
              </span>
            </div>
          )}
          
          <div className="space-y-4">
          {/* 객실별 참가자 배정 */}
          {rooms.map(room => {
            const assigned = participants.filter(p => p.room_id === room.id);
            return (
              <div key={room.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-800 text-base">{room.room_number}호</span>
                  <div className="flex items-center gap-4">
                    <span className={assigned.length === room.capacity ? "text-red-600 font-bold" : "text-gray-500"}>
                      현재 {assigned.length} / 정원 {room.capacity}
                    </span>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="객실 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {assigned.length === 0 ? (
                    <li className="text-gray-400 text-sm">배정된 참가자가 없습니다.</li>
                  ) : (
                    assigned.map(p => (
                      <li key={p.id} className="flex items-center gap-1 flex-1 min-w-[120px]">
                        <div className="flex flex-col items-start min-w-0">
                          <span className="font-medium text-gray-900 truncate">{p.name}</span>
                        </div>
                        <select
                          className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 ml-2"
                          value={p.room_id || ""}
                          onChange={e => handleAssignRoom(p.id, e.target.value)}
                          disabled={!!assigning}
                        >
                          <option value="">미배정</option>
                          {rooms.map(r => {
                            const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                            const isFull = assignedCount >= r.capacity;
                            const label = `${r.room_number}호 (${assignedCount}/${r.capacity}명)`;
                            return (
                              <option key={r.id} value={r.id} disabled={isFull && r.id !== p.room_id}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}

          {/* 미배정 참가자 */}
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="font-bold text-gray-700 mb-2">미배정</div>
            <input
              type="text"
              placeholder="이름으로 검색"
              value={unassignedSearch}
              onChange={e => setUnassignedSearch(e.target.value)}
              className="mb-3 w-full max-w-xs border border-gray-300 rounded px-2 py-1 text-sm focus:outline-blue-500"
            />
            {filteredUnassigned.length === 0 ? (
              <div className="text-gray-400 text-sm">검색 결과가 없습니다.</div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                {filteredUnassigned.map(p => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between bg-white rounded-lg shadow px-3 py-2 transition hover:bg-blue-50"
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-medium text-gray-900 truncate">{p.name}</span>
                    </div>
                    <select
                    className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500"
                    value={p.room_id || ""}
                    onChange={e => handleAssignRoom(p.id, e.target.value)}
                    disabled={!!assigning}
                    >
                      <option value="">미배정</option>
                      {rooms.map(r => {
                        const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                        const isFull = assignedCount >= r.capacity;
                        const label = `${r.room_number}호 (${assignedCount}/${r.capacity}명)`;
                        return (
                          <option key={r.id} value={r.id} disabled={isFull}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </>
      )}
      
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      
      {/* 미리보기 모달 */}
      <RoomAssignmentPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        html={previewHtml}
        type={previewType}
        initialDriverName={tourStaff?.name || tour?.driver_name || '기사님'}
        initialDriverPhone={tourStaff?.phone || tour?.driver_phone || '010-0000-0000'}
      />
    </div>
  );
};

export default RoomAssignmentManager;