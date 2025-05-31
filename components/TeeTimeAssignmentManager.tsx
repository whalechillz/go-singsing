"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Check, AlertCircle, Eye, Clock, Calendar, Phone, User, FileText, CheckSquare } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  tee_time_id?: string | null;
};

type TeeTime = {
  id: string;
  tour_id: string;
  play_date: string;
  golf_course: string;
  tee_time: string;
  max_players: number;
};

type Tour = {
  id: string;
  tour_title: string;
  tour_period: string;
  
  // 문서 표시 옵션
  show_staff_info?: boolean;
  show_footer_message?: boolean;
  show_company_phones?: boolean;
  show_golf_phones?: boolean;
  
  // 연락처 정보
  company_phone?: string;
  company_mobile?: string;
  golf_reservation_phone?: string;
  golf_reservation_mobile?: string;
  
  // 푸터 및 주의사항
  footer_message?: string;
  notices?: string;
};

type StaffMember = {
  id: string;
  name: string;
  phone?: string;
  role: string;
  display_order: number;
};

type Props = { tourId: string; refreshKey?: number };

const TeeTimeAssignmentManager: React.FC<Props> = ({ tourId, refreshKey }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [tour, setTour] = useState<Tour | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [previewType, setPreviewType] = useState<'customer' | 'staff'>('customer');
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [bulkAssignDate, setBulkAssignDate] = useState<string>('');

  // 데이터 fetch
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 참가자 데이터 가져오기 - 모든 커럼 시도
      let participantsData;
      let participantsError;
      
      try {
        // 먼저 모든 커럼을 가져오려고 시도
        const result = await supabase
          .from("singsing_participants")
          .select("*")
          .eq("tour_id", tourId)
          .order("created_at", { ascending: true });
          
        participantsData = result.data;
        participantsError = result.error;
      } catch (err) {
        console.log('Fallback to specific columns due to error:', err);
        // 에러 발생 시 특정 커럼만 가져오기
        const result = await supabase
          .from("singsing_participants")
          .select("id, name, phone, team_name, note, status, tour_id")
          .eq("tour_id", tourId)
          .order("created_at", { ascending: true });
          
        participantsData = result.data;
        participantsError = result.error;
      }
      
      if (participantsError) {
        console.error('Participants fetch error:', participantsError);
        throw participantsError;
      }
      
      // 정상적으로 tee_time_id 사용
      console.log('Sample participant data:', participantsData?.[0]);
      
      setParticipants((participantsData || []) as Participant[]);
      
      // 티타임 데이터 가져오기 - 두 가지 형식 모두 지원
      const { data: teeTimesData, error: teeTimesError } = await supabase
        .from("singsing_tee_times")
        .select("*")
        .eq("tour_id", tourId);
        
      if (teeTimesError) throw teeTimesError;
      
      // 티타임 데이터 정규화
      const normalizedTeeTimes = (teeTimesData || []).map((tt: any) => ({
        id: tt.id,
        tour_id: tt.tour_id,
        play_date: tt.play_date || tt.date,
        golf_course: tt.golf_course || tt.course,
        tee_time: tt.tee_time,
        max_players: tt.max_players || 4
      }));
      
      setTeeTimes(normalizedTeeTimes.sort((a: TeeTime, b: TeeTime) => {
        if (a.play_date < b.play_date) return -1;
        if (a.play_date > b.play_date) return 1;
        if (a.tee_time < b.tee_time) return -1;
        if (a.tee_time > b.tee_time) return 1;
        return 0;
      }));
      
      // 투어 데이터 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single();
        
      if (tourError && tourError.code !== 'PGRST116') throw tourError;
      
      if (tourData) {
        setTour({
          id: tourData.id,
          tour_title: tourData.title || tourData.tour_title || '',
          tour_period: tourData.tour_period || `${tourData.start_date} ~ ${tourData.end_date}`,
          show_staff_info: tourData.show_staff_info ?? true,
          show_footer_message: tourData.show_footer_message ?? true,
          show_company_phones: tourData.show_company_phones ?? true,
          show_golf_phones: tourData.show_golf_phones ?? true,
          company_phone: tourData.company_phone || '031-215-3990',
          company_mobile: tourData.company_mobile || '010-3332-9020',
          golf_reservation_phone: tourData.golf_reservation_phone || '',
          golf_reservation_mobile: tourData.golf_reservation_mobile || '',
          footer_message: tourData.footer_message || '♡ 즐거운 하루 되시길 바랍니다. ♡',
          notices: tourData.notices || '• 집합시간: 티오프 시간 30분 전 골프장 도착\n• 준비사항: 골프복, 골프화, 모자, 선글라스\n• 카트배정: 4인 1카트 원칙\n• 날씨대비: 우산, 우의 등 개인 준비'
        });
      }
      
      // 스텝진 데이터 가져오기
      const { data: staffData, error: staffError } = await supabase
        .from("singsing_tour_staff")
        .select("*")
        .eq("tour_id", tourId)
        .order("display_order");
        
      if (!staffError && staffData) {
        setStaffMembers(staffData);
      } else {
        console.log('Staff fetch info:', staffError);
        setStaffMembers([]);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tourId) fetchData(); }, [tourId, refreshKey]);

  // 티타임 배정 변경
  const handleAssignTeeTime = async (participantId: string, teeTimeId: string) => {
    if (teeTimeId) {
      const teeTime = teeTimes.find(t => t.id === teeTimeId);
      const assignedCount = participants.filter(p => p.tee_time_id === teeTimeId).length;
      if (teeTime && assignedCount >= teeTime.max_players) {
        alert('이 티타임은 정원이 가득 찼습니다.');
        return;
      }
    }
    
    try {
      setAssigning(participantId);
      const { error } = await supabase
        .from("singsing_participants")
        .update({ tee_time_id: teeTimeId === "" ? null : teeTimeId })
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

  // 미리보기 HTML 생성
  const generatePreviewHTML = (type: 'customer' | 'staff') => {
    const assignedParticipants = participants.filter(p => p.tee_time_id);
    const teeTimesByDate = teeTimes.reduce((acc, tt) => {
      const date = tt.play_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(tt);
      return acc;
    }, {} as Record<string, TeeTime[]>);

    const tourTitle = tour?.tour_title || "투어명";
    const tourPeriod = tour?.tour_period || "투어 기간";
    const isStaff = type === 'staff';

    // 스텝진 정보 HTML 생성
    let staffInfoHTML = '';
    if (tour?.show_staff_info && staffMembers.length > 0) {
      staffInfoHTML = staffMembers.map(staff => `
        <p>${staff.role}: ${staff.name}${staff.phone ? ` / ${staff.phone}` : ''}</p>
      `).join('');
    }

    // 연락처 정보 HTML 생성
    let contactHTML = '';
    if (tour?.show_company_phones || tour?.show_golf_phones) {
      const contacts = [];
      if (tour.show_company_phones) {
        if (tour.company_phone) contacts.push(`대표: ${tour.company_phone}`);
        if (tour.company_mobile) contacts.push(`업무: ${tour.company_mobile}`);
      }
      if (tour.show_golf_phones) {
        if (tour.golf_reservation_phone) contacts.push(`골프장: ${tour.golf_reservation_phone}`);
        if (tour.golf_reservation_mobile) contacts.push(`예약담당: ${tour.golf_reservation_mobile}`);
      }
      if (contacts.length > 0) {
        contactHTML = `<p class="contact-info">${contacts.join(' | ')}</p>`;
      }
    }

    let tablesHTML = '';
    Object.entries(teeTimesByDate).forEach(([date, times]) => {
      const dateStr = new Date(date).toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long' 
      });

      let tableHTML = `
        <h2 class="date-header">${dateStr}</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>시간</th>
                <th>골프장</th>
                <th>NO.</th>
                <th>성명</th>
                ${isStaff ? '<th>연락처</th>' : ''}
                <th>팀명</th>
                ${isStaff ? '<th>비고</th>' : ''}
              </tr>
            </thead>
            <tbody>`;

      times.forEach(teeTime => {
        const teeTimeParticipants = assignedParticipants.filter(p => p.tee_time_id === teeTime.id);
        
        if (teeTimeParticipants.length === 0) {
          tableHTML += `
            <tr>
              <td>${teeTime.tee_time}</td>
              <td>${teeTime.golf_course}</td>
              <td colspan="${isStaff ? 5 : 3}" class="empty-slot">배정된 참가자가 없습니다</td>
            </tr>`;
        } else {
          teeTimeParticipants.forEach((p, index) => {
            tableHTML += `
              <tr>
                ${index === 0 ? `
                  <td rowspan="${teeTimeParticipants.length}">${teeTime.tee_time}</td>
                  <td rowspan="${teeTimeParticipants.length}">${teeTime.golf_course}</td>
                ` : ''}
                <td>${index + 1}</td>
                <td>${p.name}</td>
                ${isStaff ? `<td>${p.phone || ''}</td>` : ''}
                <td>${p.team_name || ''}</td>
                ${isStaff ? `<td>${p.note || ''}</td>` : ''}
              </tr>`;
          });
        }
      });

      tableHTML += `
            </tbody>
          </table>
        </div>`;
      
      tablesHTML += tableHTML;
    });

    // 주의사항 HTML 생성
    let noticesHTML = '';
    if (tour?.notices && !isStaff) {
      const noticeItems = tour.notices.split('\n').filter(n => n.trim()).map(notice => 
        `<li>${notice.replace(/^[•·\-\*]\s*/, '')}</li>`
      ).join('');
      noticesHTML = `
        <div class="notice">
          <div class="notice-title">라운딩 이용 안내</div>
          <ul class="notice-list">
            ${noticeItems}
          </ul>
        </div>`;
    }

    // 푸터 메시지 HTML 생성
    let footerHTML = '';
    if (tour?.show_footer_message && tour?.footer_message) {
      footerHTML = `
        <div class="footer">
          <p>${tour.footer_message}</p>
          ${contactHTML}
        </div>`;
    } else if (contactHTML) {
      footerHTML = `<div class="footer">${contactHTML}</div>`;
    }

    return isStaff ? `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>라운딩 시간표 (스탭용)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', 'Arial', sans-serif; }
    body { background-color: #FFFFFF; color: #2D3748; line-height: 1.6; padding: 20px; }
    .container { width: 100%; max-width: 900px; margin: 0 auto; }
    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #DEE2E6; }
    .title-section { flex: 1; }
    .info-section { text-align: right; padding: 8px 12px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #DEE2E6; margin-left: 15px; }
    .info-section p { margin: 0; line-height: 1.5; font-size: 14px; }
    h1 { color: #34699C; font-size: 22px; margin-bottom: 8px; }
    .subtitle { font-size: 16px; font-weight: 500; color: #4A5568; margin-bottom: 6px; }
    .date-header { color: #2C5282; font-size: 18px; margin: 20px 0 10px 0; padding: 8px; background-color: #EBF8FF; border-radius: 4px; }
    .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #DEE2E6; padding: 8px 10px; text-align: center; }
    th { background-color: #ECF0F1; font-weight: bold; color: #34699C; }
    tr:hover { background-color: #F7FAFC; }
    .empty-slot { color: #999; font-style: italic; }
    .staff-note { color: #e53e3e; font-weight: bold; text-align: center; margin-bottom: 15px; padding: 8px; background-color: #fff5f5; border-radius: 4px; border: 1px solid #fed7d7; }
    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 13px; }
    .contact-info { margin-top: 5px; }
    @media (max-width: 600px) { table { font-size: 12px; } th, td { padding: 6px 4px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-container">
      <div class="title-section">
        <h1>라운딩 시간표 (스탭용)</h1>
        <p class="subtitle">${tourTitle} / ${tourPeriod}</p>
      </div>
      <div class="info-section">
        ${staffInfoHTML}
      </div>
    </div>
    <p class="staff-note">※ 이 명단은 스탭용으로 고객 연락처 정보가 포함되어 있습니다.</p>
    ${tablesHTML}
    ${footerHTML}
  </div>
</body>
</html>` : `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>라운딩 시간표</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', 'Arial', sans-serif; }
    body { background-color: #f5f7fa; color: #2D3748; line-height: 1.6; padding: 20px; }
    .container { width: 100%; max-width: 900px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 30px; }
    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3182ce; }
    .title-section { flex: 1; }
    .info-section { text-align: right; padding: 8px 12px; background-color: #ebf8ff; border-radius: 4px; border: 1px solid #bee3f8; margin-left: 15px; }
    .info-section p { margin: 0; line-height: 1.5; font-size: 14px; }
    h1 { color: #2c5282; font-size: 22px; margin-bottom: 8px; }
    .subtitle { font-size: 16px; font-weight: 500; color: #4A5568; margin-bottom: 6px; }
    .date-header { color: #2C5282; font-size: 18px; margin: 25px 0 15px 0; padding: 10px; background-color: #EBF8FF; border-radius: 6px; }
    .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #E2E8F0; padding: 10px; text-align: center; }
    th { background-color: #EBF8FF; font-weight: bold; color: #2C5282; }
    tr:hover { background-color: #F7FAFC; }
    .empty-slot { color: #999; font-style: italic; }
    .notice { padding: 15px; background-color: #FFF5F5; border: 1px solid #FED7D7; border-radius: 6px; font-size: 14px; margin-bottom: 20px; }
    .notice-title { font-weight: bold; color: #E53E3E; margin-bottom: 8px; }
    .notice-list { list-style-type: disc; margin-left: 20px; }
    .notice-list li { margin-bottom: 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 13px; }
    .contact-info { margin-top: 5px; font-weight: 500; }
    @media (max-width: 600px) { table { font-size: 12px; } th, td { padding: 6px 4px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-container">
      <div class="title-section">
        <h1>라운딩 시간표</h1>
        <p class="subtitle">${tourTitle} / ${tourPeriod}</p>
      </div>
      <div class="info-section">
        ${staffInfoHTML}
      </div>
    </div>
    ${tablesHTML}
    ${noticesHTML}
    ${footerHTML}
  </div>
</body>
</html>`;
  };

  // 전체 투어 자동 배정 기능 (날짜별 균등 분배)
  const handleAutoAssignAll = async () => {
    if (!window.confirm('모든 미배정 참가자를 전체 티타임에 균등하게 분배하시겠습니까?')) return;
    
    try {
      const unassigned = participants.filter(p => !p.tee_time_id);
      if (unassigned.length === 0) {
        alert('미배정 참가자가 없습니다.');
        return;
      }
      
      // 날짜별로 티타임 그룹화
      const dateGroups = Object.entries(teeTimesByDate).sort(([a], [b]) => a.localeCompare(b));
      const totalAvailableSlots = teeTimes.reduce((sum, tt) => {
        const assigned = participants.filter(p => p.tee_time_id === tt.id).length;
        return sum + (tt.max_players - assigned);
      }, 0);
      
      if (totalAvailableSlots < unassigned.length) {
        alert(`배정 가능한 자리(${totalAvailableSlots})가 참가자 수(${unassigned.length})보다 적습니다.`);
      }
      
      let assignedCount = 0;
      let participantIndex = 0;
      
      // 날짜별로 번갈아가며 배정
      let hasAvailableSlots = true;
      while (participantIndex < unassigned.length && hasAvailableSlots) {
        hasAvailableSlots = false;
        
        for (const [date, dayTeeTimes] of dateGroups) {
          if (participantIndex >= unassigned.length) break;
          
          // 해당 날짜의 빈 자리 찾기
          for (const teeTime of dayTeeTimes) {
            const currentAssigned = participants.filter(p => p.tee_time_id === teeTime.id).length;
            if (currentAssigned < teeTime.max_players) {
              await supabase
                .from("singsing_participants")
                .update({ tee_time_id: teeTime.id })
                .eq("id", unassigned[participantIndex].id);
              
              participantIndex++;
              assignedCount++;
              hasAvailableSlots = true;
              break; // 다음 날짜로 이동
            }
          }
        }
      }
      
      alert(`${assignedCount}명을 자동 배정했습니다.`);
      await fetchData();
    } catch (error: any) {
      setError(`자동 배정 중 오류: ${error.message}`);
    }
  };
  
  // 일괄 배정 기능
  const handleBulkAssign = async () => {
    if (selectedForBulk.length === 0 || !bulkAssignDate) {
      alert('참가자와 날짜를 선택해주세요.');
      return;
    }

    const dateTeeTimes = teeTimes.filter(tt => tt.play_date === bulkAssignDate);
    if (dateTeeTimes.length === 0) {
      alert('선택한 날짜에 티타임이 없습니다.');
      return;
    }

    try {
      let participantIndex = 0;
      
      for (const teeTime of dateTeeTimes) {
        const currentAssigned = participants.filter(p => p.tee_time_id === teeTime.id).length;
        const availableSlots = teeTime.max_players - currentAssigned;
        
        for (let i = 0; i < availableSlots && participantIndex < selectedForBulk.length; i++) {
          await supabase
            .from("singsing_participants")
            .update({ tee_time_id: teeTime.id })
            .eq("id", selectedForBulk[participantIndex]);
          
          participantIndex++;
        }
        
        if (participantIndex >= selectedForBulk.length) break;
      }
      
      alert(`${participantIndex}명을 ${bulkAssignDate} 티타임에 배정했습니다.`);
      setSelectedForBulk([]);
      setBulkAssignDate('');
      await fetchData();
    } catch (error: any) {
      setError(`일괄 배정 중 오류: ${error.message}`);
    }
  };

  // 날짜별 배정 초기화 기능
  const handleResetDateAssignments = async (date: string) => {
    if (!window.confirm(`${new Date(date).toLocaleDateString('ko-KR')} 티타임의 모든 배정을 취소하시겠습니까?`)) return;
    
    try {
      // 해당 날짜의 티타임 ID들 가져오기
      const dateTeeTimeIds = teeTimes
        .filter(tt => tt.play_date === date)
        .map(tt => tt.id);
      
      // 해당 티타임에 배정된 참가자들의 tee_time_id를 null로 업데이트
      const { error } = await supabase
        .from("singsing_participants")
        .update({ tee_time_id: null })
        .in("tee_time_id", dateTeeTimeIds);
      
      if (error) throw error;
      
      alert(`${new Date(date).toLocaleDateString('ko-KR')} 티타임 배정이 모두 취소되었습니다.`);
      await fetchData();
    } catch (error: any) {
      setError(`배정 취소 중 오류: ${error.message}`);
    }
  };

  const handlePreview = () => {
    const html = generatePreviewHTML(previewType);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  // 미배정 참가자 필터링
  const filteredUnassigned = participants.filter(p => !p.tee_time_id && p.name.includes(unassignedSearch));
  
  // 통계 계산
  const assignedParticipants = participants.filter(p => p.tee_time_id).length;
  const totalParticipants = participants.length;
  const unassignedParticipants = totalParticipants - assignedParticipants;
  
  const totalCapacity = teeTimes.reduce((sum, tt) => sum + tt.max_players, 0);
  const occupiedSpaces = participants.filter(p => p.tee_time_id).length;
  const availableSpaces = totalCapacity - occupiedSpaces;

  // 날짜 유효성 검사 함수
  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  // 날짜별로 티타임 그룹화
  const teeTimesByDate = teeTimes.reduce((acc, tt) => {
    const date = tt.play_date;
    // Invalid date 체크
    if (!date || date === 'Invalid Date' || !isValidDate(date)) {
      console.warn('Invalid date found in tee time:', tt);
      return acc;
    }
    if (!acc[date]) acc[date] = [];
    acc[date].push(tt);
    return acc;
  }, {} as Record<string, TeeTime[]>);

  return (
    <div className="mb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">티타임별 참가자 그룹핑</h2>
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
        <>
          {/* 통계 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">참가자 현황</div>
              <div className="text-2xl font-bold text-blue-900">{assignedParticipants}/{totalParticipants}</div>
              <div className="text-xs text-blue-600">배정완료 / 총인원</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">티타임 현황</div>
              <div className="text-2xl font-bold text-green-900">{occupiedSpaces}/{totalCapacity}</div>
              <div className="text-xs text-green-600">사용중 / 총정원</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">남은 자리</div>
              <div className="text-2xl font-bold text-yellow-900">{availableSpaces}개</div>
              <div className="text-xs text-yellow-600">예약 가능</div>
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
          
          <div className="space-y-6">
            {/* 날짜별 티타임 배정 */}
            {Object.entries(teeTimesByDate).map(([date, times]) => (
              <div key={date} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900 text-lg">
                      {new Date(date).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long' 
                      })}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleResetDateAssignments(date)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    이 날짜 배정 취소
                  </button>
                </div>
                
                <div className="space-y-3">
                  {times.map(teeTime => {
                    const assigned = participants.filter(p => p.tee_time_id === teeTime.id);
                    return (
                      <div key={teeTime.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-blue-800">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {teeTime.tee_time}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              {teeTime.golf_course}
                            </span>
                          </div>
                          <span className={assigned.length === teeTime.max_players ? "text-red-600 font-bold" : "text-gray-500"}>
                            {assigned.length} / {teeTime.max_players}명
                          </span>
                        </div>
                        
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {assigned.length === 0 ? (
                            <li className="text-gray-400 text-sm col-span-full">배정된 참가자가 없습니다.</li>
                          ) : (
                            assigned.map(p => (
                              <li key={p.id} className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{p.name}</span>
                                <span className="text-xs text-gray-500">({p.team_name || '개인'})</span>
                                <select
                                  className="ml-auto border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-blue-500"
                                  value={p.tee_time_id || ""}
                                  onChange={e => handleAssignTeeTime(p.id, e.target.value)}
                                  disabled={!!assigning}
                                >
                                  <option value="">미배정</option>
                                  {teeTimes.map(t => {
                                    const assignedCount = participants.filter(pp => pp.tee_time_id === t.id).length;
                                    const isFull = assignedCount >= t.max_players;
                                    const label = `${new Date(t.play_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} ${t.tee_time} ${t.golf_course} (${assignedCount}/${t.max_players})`;
                                    return (
                                      <option key={t.id} value={t.id} disabled={isFull && t.id !== p.tee_time_id}>
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
                </div>
              </div>
            ))}

            {/* 미배정 참가자 */}
            <div className="bg-gray-50 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-gray-700">미배정 참가자</div>
                
                {/* 일괄 배정 컨트롤 */}
                <div className="flex items-center gap-2">
                  <select
                    value={bulkAssignDate}
                    onChange={(e) => setBulkAssignDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">날짜 선택</option>
                    {Object.keys(teeTimesByDate).map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedForBulk(filteredUnassigned.map(p => p.id))}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <CheckSquare className="w-4 h-4" />
                    전체선택
                  </button>
                  <button
                    onClick={handleBulkAssign}
                    disabled={selectedForBulk.length === 0 || !bulkAssignDate}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    <Users className="w-4 h-4" />
                    선택한 {selectedForBulk.length}명 일괄배정
                  </button>
                  <button
                    onClick={handleAutoAssignAll}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    전체 자동배정
                  </button>
                </div>
              </div>
              
              <input
                type="text"
                placeholder="이름으로 검색"
                value={unassignedSearch}
                onChange={e => setUnassignedSearch(e.target.value)}
                className="mb-3 w-full max-w-xs border border-gray-300 rounded px-2 py-1 text-sm focus:outline-blue-500"
              />
              {filteredUnassigned.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    {participants.filter(p => !p.tee_time_id).length === 0 
                      ? "현재 모든 참가자가 티타임에 배정되었습니다."
                      : "검색 결과가 없습니다."}
                  </div>
                  {participants.filter(p => !p.tee_time_id).length === 0 && (
                    <p className="text-sm text-gray-500">
                      위의 날짜별 "배정 취소" 버튼으로 배정을 취소할 수 있습니다.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredUnassigned.map(p => (
                    <li
                      key={p.id}
                      className="bg-white rounded-lg shadow px-3 py-2 transition hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedForBulk.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedForBulk([...selectedForBulk, p.id]);
                              } else {
                                setSelectedForBulk(selectedForBulk.filter(id => id !== p.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.team_name || '개인'}</div>
                          </div>
                        </div>
                        <select
                          className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-blue-500"
                          value={p.tee_time_id || ""}
                          onChange={e => handleAssignTeeTime(p.id, e.target.value)}
                          disabled={!!assigning}
                        >
                          <option value="">미배정</option>
                          {teeTimes.map(t => {
                            const assignedCount = participants.filter(pp => pp.tee_time_id === t.id).length;
                            const isFull = assignedCount >= t.max_players;
                            const label = `${new Date(t.play_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} ${t.tee_time} ${t.golf_course} (${assignedCount}/${t.max_players})`;
                            return (
                              <option key={t.id} value={t.id} disabled={isFull}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
      
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default TeeTimeAssignmentManager;