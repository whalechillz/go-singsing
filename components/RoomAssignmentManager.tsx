"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Check, AlertCircle, RefreshCw, X, Eye, FileText } from "lucide-react";

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
  tour_title: string;
  tour_period: string;
};

type Props = { tourId: string };

const roomTypeColors: Record<string, string> = {
  "미배정": "bg-gray-200 text-gray-700",
  "2인실": "bg-blue-100 text-blue-700",
  "3인실": "bg-green-100 text-green-700",
  "4인실": "bg-purple-100 text-purple-700",
};

const RoomAssignmentManager: React.FC<Props> = ({ tourId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [newRoomType, setNewRoomType] = useState<string>("");
  const [newRoomCount, setNewRoomCount] = useState<number>(1);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<'customer' | 'staff'>('customer');

  // 데이터 fetch
  const fetchData = async () => {
    setLoading(true);
    setError("");
    const [{ data: participantsData, error: participantsError }, { data: roomsData, error: roomsError }, { data: tourData, error: tourError }] = await Promise.all([
      supabase.from("singsing_participants").select("*, singsing_rooms:room_id(room_type, room_seq, room_number)").eq("tour_id", tourId).order("created_at", { ascending: true }),
      supabase.from("singsing_rooms").select("*").eq("tour_id", tourId),
      supabase.from("singsing_tours").select("*").eq("id", tourId).single()
    ]);
    if (participantsError) setError(participantsError.message);
    else setParticipants((participantsData || []) as Participant[]);
    if (roomsError) setError(roomsError.message);
    else setRooms((roomsData || []) as Room[]);
    if (tourError) setError(tourError.message);
    else setTour(tourData as Tour);
    setLoading(false);
  };

  useEffect(() => { if (tourId) fetchData(); }, [tourId]);

  // 객실 자동 생성
  const handleAddRooms = async () => {
    const trimmedRoomType = newRoomType.trim();
    if (!trimmedRoomType || newRoomCount < 1) {
      setError("객실 타입을 입력해 주세요.");
      return;
    }
    // 같은 타입의 마지막 객실 번호 계산
    const sameTypeRooms = rooms.filter(r => r.room_type === trimmedRoomType);
    const lastNum = sameTypeRooms.length;
    // capacity 자동 추출(2, 3, 4, 8인실 등)
    const getCapacity = (type: string) => {
      if (type.includes("2인실")) return 2;
      if (type.includes("3인실")) return 3;
      if (type.includes("4인실")) return 4;
      if (type.includes("8인실")) return 8;
      return 2; // 기본값
    };
    const newRooms = Array.from({ length: newRoomCount }, (_, i) => ({
      tour_id: tourId,
      room_type: trimmedRoomType,
      room_seq: lastNum + i + 1,
      room_number: `${trimmedRoomType}-${String(lastNum + i + 1).padStart(2, '0')}`,
      capacity: getCapacity(trimmedRoomType),
      quantity: 1,
    }));
    // Supabase에 insert (room_seq, room_number 반드시 포함)
    const { error } = await supabase
      .from("singsing_rooms")
      .insert(newRooms);
    if (error) {
      setError(error.message);
    }
    setNewRoomType("");
    setNewRoomCount(1);
    fetchData();
  };

  // 객실별로 참가자 그룹핑
  const roomGroups: Record<string, Participant[]> = {};
  rooms.forEach(room => {
    if (room.room_number) {
      roomGroups[room.room_number] = [];
    }
  });
  participants.forEach(p => {
    if (p.singsing_rooms?.room_number && roomGroups[p.singsing_rooms.room_number]) roomGroups[p.singsing_rooms.room_number].push(p);
  });
  // 미배정 참가자
  const unassigned = participants.filter(p => !p.room_id);
  // 미배정 참가자 필터링
  const filteredUnassigned = participants.filter(p => !p.room_id && p.name.includes(unassignedSearch));

  // 객실명 표시 함수
  const displayRoomName = (room: Room | undefined) => {
    if (!room) return "미배정";
    return `${room.room_number}호`;
  };

  // 객실 배정 변경
  const handleAssignRoom = async (participantId: string, roomId: string) => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      const assignedCount = participants.filter(p => p.room_id === roomId).length;
      // 정원 초과 시 배정 불가
      if (room && assignedCount >= room.capacity) {
        alert('이 객실은 정원이 가득 찼습니다.');
        return;
      }
    }
    setAssigning(participantId);
    setAssignSuccess(null);
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, room_id: roomId === "" ? null : roomId }
          : p
      )
    );
    const { error } = await supabase
      .from("singsing_participants")
      .update({ room_id: roomId === "" ? null : roomId })
      .eq("id", participantId);
    setAssigning(null);
    if (!error) {
      setAssignSuccess(participantId);
      setTimeout(() => setAssignSuccess(null), 1200);
    } else {
      setError(error.message);
      fetchData();
    }
  };

  // 객실 삭제
  const handleDeleteRoom = async (roomName: string) => {
    await supabase.from("singsing_participants").update({ room_id: null }).eq("room_number", roomName);
    await supabase.from("singsing_rooms").delete().eq("room_number", roomName).eq("tour_id", tourId);
    fetchData();
  };

  // 미리보기 HTML 생성
  const generatePreviewHTML = (type: 'customer' | 'staff') => {
    const assignedParticipants = participants.filter(p => p.room_id);
    const sortedParticipants = [...assignedParticipants].sort((a, b) => {
      const roomA = rooms.find(r => r.id === a.room_id);
      const roomB = rooms.find(r => r.id === b.room_id);
      if (!roomA || !roomB) return 0;
      return roomA.room_number!.localeCompare(roomB.room_number!);
    });

    const tourTitle = tour?.tour_title || "투어명";
    const tourPeriod = tour?.tour_period || "투어 기간";
    const isStaff = type === 'staff';

    const participantRows = sortedParticipants.map((p, index) => {
      const room = rooms.find(r => r.id === p.room_id);
      const roomParticipants = sortedParticipants.filter(pp => pp.room_id === p.room_id);
      const isFirstInRoom = roomParticipants.indexOf(p) === 0;
      const roomRowspan = roomParticipants.length;

      let row = `<tr class="team-row">
        <td>${index + 1}</td>
        <td>${p.name}</td>`;
      
      if (isStaff) {
        row += `<td>${p.phone || ''}</td>`;
      }
      
      if (isFirstInRoom) {
        row += `
        <td rowspan="${roomRowspan}">${p.team_name || ''}</td>
        <td rowspan="${roomRowspan}">${roomRowspan}</td>
        <td rowspan="${roomRowspan}">${room?.room_type || '미배정'}</td>`;
        if (isStaff) {
          row += `
        <td rowspan="${roomRowspan}">${p.note || ''}</td>`;
        }
      }
      
      row += `
      </tr>`;
      return row;
    }).join('\n');

    return isStaff ? `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>팀명단 / 객실배정 (스탭용)</title>
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
        <h1>팀명단 / 객실배정 (스탭용)</h1>
        <p class="subtitle">${tourTitle} / ${tourPeriod}</p>
      </div>
      <div class="info-section">
        <p>담당: 기사님</p>
        <p>연락처: 010-0000-0000</p>
      </div>
    </div>
    <p class="staff-note">※ 이 명단은 스탭용으로 고객 연락처 정보가 포함되어 있습니다.</p>
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
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          ${participantRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>` : `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>팀명단 / 객실배정 (고객용)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', 'Arial', sans-serif; }
    body { background-color: #f5f7fa; color: #2D3748; line-height: 1.6; padding: 10px; }
    .container { width: 100%; max-width: 850px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 20px; }
    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3182ce; }
    .title-section { flex: 1; }
    .info-section { text-align: right; padding: 8px 12px; background-color: #ebf8ff; border-radius: 4px; border: 1px solid #bee3f8; margin-left: 15px; }
    .info-section p { margin: 0; line-height: 1.5; font-size: 14px; }
    h1 { color: #2c5282; font-size: 22px; margin-bottom: 8px; }
    .subtitle { font-size: 16px; font-weight: 500; color: #4A5568; margin-bottom: 6px; }
    .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #E2E8F0; padding: 10px; text-align: center; }
    th { background-color: #EBF8FF; font-weight: bold; color: #2C5282; }
    .team-row { background-color: rgba(235, 248, 255, 0.3); }
    tbody tr:hover { background-color: #F7FAFC; }
    .notice { padding: 15px; background-color: #FFF5F5; border: 1px solid #FED7D7; border-radius: 6px; font-size: 14px; margin-bottom: 20px; }
    .notice-title { font-weight: bold; color: #E53E3E; margin-bottom: 8px; }
    .notice-list { list-style-type: disc; margin-left: 20px; }
    .notice-list li { margin-bottom: 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 13px; }
    @media (max-width: 600px) { table { font-size: 12px; } th, td { padding: 6px 4px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-container">
      <div class="title-section">
        <h1>팀명단 / 객실배정</h1>
        <p class="subtitle">${tourTitle} / ${tourPeriod}</p>
      </div>
      <div class="info-section">
        <p>담당: 기사님</p>
        <p>연락처: 010-0000-0000</p>
      </div>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>NO.</th>
            <th>성명</th>
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
    <div class="notice">
      <div class="notice-title">객실 이용 안내</div>
      <ul class="notice-list">
        <li><strong>체크아웃:</strong> 10시 이전 골프 이용고객(패키지팀)의 경우 퇴실 당일 골프예약시간 이전</li>
        <li><strong>기본 제공:</strong> 샴푸, 린스, 비누, 바디워시, 로션, 스킨, 드라이기, 커피포트</li>
        <li><strong>준비 필요:</strong> 칫솔, 치약, 면도기, 휴대폰 충전기</li>
      </ul>
    </div>
    <div class="footer">
      <p>즐거운 골프 여행 되시길 바랍니다.</p>
      <p>싱싱골프투어 | 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 미리보기 열기
  const handlePreview = () => {
    const html = generatePreviewHTML(previewType);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">객실별 참가자 그룹핑</h2>
        <div className="flex gap-2">
          <select
            value={previewType}
            onChange={(e) => setPreviewType(e.target.value as 'customer' | 'staff')}
            className="border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900 text-sm"
          >
            <option value="customer">고객용</option>
            <option value="staff">스탭용</option>
          </select>
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-8">
          {rooms.map(room => {
            const assigned = participants.filter(p => p.room_id === room.id);
            return (
              <div key={room.id} className="mb-6 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-800 text-base">{room.room_number}호</span>
                  <span className={assigned.length === room.capacity ? "text-red-600 font-bold" : "text-gray-500"}>
                    현재 {assigned.length} / 정원 {room.capacity}
                  </span>
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
                          className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 text-right ml-2"
                          value={p.room_id || ""}
                        onChange={e => handleAssignRoom(p.id, e.target.value)}
                        aria-label="객실 선택"
                        tabIndex={0}
                        disabled={!!assigning}
                      >
                        <option value="">미배정</option>
                          {rooms.map(r => {
                            const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                            const isFull = assignedCount >= r.capacity;
                            return (
                              <option key={r.id} value={r.id} disabled={isFull && r.id !== p.room_id}>
                                {`${r.room_number}호`}
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
          {/* 미배정 */}
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
                      className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 text-right"
                      value={p.room_id || ""}
                      onChange={e => handleAssignRoom(p.id, e.target.value)}
                      aria-label="객실 선택"
                      tabIndex={0}
                      disabled={!!assigning}
                    >
                      <option value="">미배정</option>
                      {rooms.map(r => {
                        const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                        const isFull = assignedCount >= r.capacity;
                        return (
                          <option key={r.id} value={r.id} disabled={isFull}>
                            {`${r.room_number}호`}
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
      )}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default RoomAssignmentManager;