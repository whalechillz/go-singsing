"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Check, AlertCircle, Eye, Clock, Calendar, Phone, User, FileText, CheckSquare, X, UserCheck, RefreshCw } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  tee_time_assignments?: string[]; // 배정된 티타임 ID들
};

type TeeTime = {
  id: string;
  tour_id: string;
  play_date: string;
  golf_course: string;
  tee_time: string;
  max_players: number;
  assigned_count?: number; // 현재 배정된 인원
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

const TeeTimeAssignmentManagerV2: React.FC<Props> = ({ tourId, refreshKey }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [tour, setTour] = useState<Tour | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // 토스트 메시지 표시 함수
  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [previewType, setPreviewType] = useState<'customer' | 'staff'>('customer');
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [bulkAssignOption, setBulkAssignOption] = useState<'all' | 'specific'>('all');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [participationMode, setParticipationMode] = useState<'full' | 'partial'>('full');

  // 데이터 fetch - 다대다 관계 처리 (완전히 새로 작성)
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. 참가자 데이터 가져오기 (이 투어만)
      const { data: participantsData, error: participantsError } = await supabase
        .from("singsing_participants")
        .select("*")
        .eq("tour_id", tourId)
        .order("created_at", { ascending: true });
      
      if (participantsError) throw participantsError;
      
      // 2. 티타임 데이터 가져오기
      const { data: teeTimesData, error: teeTimesError } = await supabase
        .from("singsing_tee_times")
        .select("*")
        .eq("tour_id", tourId);
        
      if (teeTimesError) throw teeTimesError;
      
      // 3. 티타임 배정 정보 가져오기 (중복 제거된 데이터)
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("singsing_participant_tee_times")
        .select("participant_id, tee_time_id")
        .in("participant_id", participantsData?.map(p => p.id) || []);
      
      if (assignmentsError) {
        console.log("배정 데이터 조회 오류:", assignmentsError);
      }
      
      // 4. 중복 제거된 배정 정보만 사용
      const assignmentMap = new Map<string, Set<string>>();
      assignmentsData?.forEach(assignment => {
        if (!assignmentMap.has(assignment.participant_id)) {
          assignmentMap.set(assignment.participant_id, new Set());
        }
        assignmentMap.get(assignment.participant_id)?.add(assignment.tee_time_id);
      });
      
      // 5. 참가자별 티타임 배정 정보 매핑
      const participantsWithAssignments = participantsData?.map(participant => ({
        ...participant,
        tee_time_assignments: Array.from(assignmentMap.get(participant.id) || [])
      })) || [];
      
      setParticipants(participantsWithAssignments);
      
      // 6. 티타임별 배정 인원 계산 (중복 제거)
      const teeTimeAssignmentCount = new Map<string, number>();
      assignmentsData?.forEach(assignment => {
        const count = teeTimeAssignmentCount.get(assignment.tee_time_id) || 0;
        teeTimeAssignmentCount.set(assignment.tee_time_id, count + 1);
      });
      
      const teeTimesWithCount = teeTimesData?.map(teeTime => ({
        ...teeTime,
        play_date: teeTime.play_date || teeTime.date,
        golf_course: teeTime.golf_course || teeTime.course,
        max_players: teeTime.max_players || 4,
        assigned_count: teeTimeAssignmentCount.get(teeTime.id) || 0
      })) || [];
      
      setTeeTimes(teeTimesWithCount.sort((a, b) => {
        if (a.play_date < b.play_date) return -1;
        if (a.play_date > b.play_date) return 1;
        if (a.tee_time < b.tee_time) return -1;
        if (a.tee_time > b.tee_time) return 1;
        return 0;
      }));
      
      // 7. 투어 및 스탭 데이터 가져오기
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
      
      const { data: staffData, error: staffError } = await supabase
        .from("singsing_tour_staff")
        .select("*")
        .eq("tour_id", tourId)
        .order("display_order");
        
      if (!staffError && staffData) {
        setStaffMembers(staffData);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tourId) fetchData(); }, [tourId, refreshKey]);

  // 티타임 배정/해제 (안전하게 수정)
  const handleToggleTeeTimeAssignment = async (participantId: string, teeTimeId: string) => {
    try {
      setAssigning(participantId);
      
      // 현재 배정 상태 확인
      const { data: existingAssignment } = await supabase
        .from("singsing_participant_tee_times")
        .select("*")
        .eq("participant_id", participantId)
        .eq("tee_time_id", teeTimeId)
        .maybeSingle();
      
      if (existingAssignment) {
        // 배정 해제
        const { error } = await supabase
          .from("singsing_participant_tee_times")
          .delete()
          .eq("participant_id", participantId)
          .eq("tee_time_id", teeTimeId);
        
        if (error) throw error;
        
        // 즉시 로컬 상태 업데이트 (미배정 참가자 즉시 표시)
        setParticipants(prev => prev.map(p => {
          if (p.id === participantId) {
            const updatedAssignments = p.tee_time_assignments?.filter(id => id !== teeTimeId) || [];
            return {
              ...p,
              tee_time_assignments: updatedAssignments
            };
          }
          return p;
        }));
        
        // 티타임 카운트도 즉시 업데이트
        setTeeTimes(prev => prev.map(tt => {
          if (tt.id === teeTimeId) {
            return {
              ...tt,
              assigned_count: Math.max(0, (tt.assigned_count || 0) - 1)
            };
          }
          return tt;
        }));
        
        // 성공 메시지
        const participant = participants.find(p => p.id === participantId);
        showToast('success', `${participant?.name || '참가자'}님의 배정이 해제되었습니다.`);
        setAssignSuccess(participantId);
        setTimeout(() => setAssignSuccess(null), 1200);
        
      } else {
        // 배정 추가
        const teeTime = teeTimes.find(t => t.id === teeTimeId);
        if (teeTime && (teeTime.assigned_count || 0) >= teeTime.max_players) {
          showToast('error', '이 티타임은 정원이 가득 찼습니다.');
          return;
        }
        
        // 삽입 (중복 방지)
        const { error } = await supabase
          .from("singsing_participant_tee_times")
          .insert({ 
            participant_id: participantId, 
            tee_time_id: teeTimeId 
          });
        
        if (error) {
          // 중복 키 오류는 무시
          if (error.code === '23505') {
            console.log('이미 배정됨');
            // 이미 배정된 경우 데이터 새로고침
            await fetchData();
            return;
          } else {
            throw error;
          }
        }
        
        // 즉시 로컬 상태 업데이트 (배정 즉시 표시)
        setParticipants(prev => prev.map(p => {
          if (p.id === participantId) {
            const currentAssignments = p.tee_time_assignments || [];
            if (!currentAssignments.includes(teeTimeId)) {
              return {
                ...p,
                tee_time_assignments: [...currentAssignments, teeTimeId]
              };
            }
          }
          return p;
        }));
        
        // 티타임 카운트도 즉시 업데이트
        setTeeTimes(prev => prev.map(tt => {
          if (tt.id === teeTimeId) {
            return {
              ...tt,
              assigned_count: (tt.assigned_count || 0) + 1
            };
          }
          return tt;
        }));
        
        // 성공 메시지
        const participant = participants.find(p => p.id === participantId);
        const teeTimeInfo = teeTimes.find(t => t.id === teeTimeId);
        showToast('success', `${participant?.name || '참가자'}님이 ${teeTimeInfo?.tee_time || '티타임'}에 배정되었습니다.`);
        setAssignSuccess(participantId);
        setTimeout(() => setAssignSuccess(null), 1200);
      }
      
      // 백그라운드에서 전체 데이터 새로고침 제거 (로컬 상태만 사용)
      // fetchData(); // 제거 - 로컬 상태 업데이트로 충분
      
    } catch (error: any) {
      console.error('티타임 배정 오류:', error);
      showToast('error', `오류 발생: ${error.message}`);
      // 오류 시에만 데이터 다시 로드
      await fetchData();
    } finally {
      setAssigning(null);
    }
  };

  // 일괄 배정 (중복 방지 강화)
  const handleBulkAssign = async () => {
    if (selectedForBulk.length === 0) {
      alert('참가자를 선택해주세요.');
      return;
    }

    const targetDates = bulkAssignOption === 'all' 
      ? Object.keys(teeTimesByDate)
      : selectedDates;

    if (targetDates.length === 0) {
      alert('날짜를 선택해주세요.');
      return;
    }

    try {
      let totalAssigned = 0;
      
      for (const participantId of selectedForBulk) {
        for (const date of targetDates) {
          // 이미 해당 날짜에 배정되어 있는지 확인
          const { data: existingOnDate } = await supabase
            .from("singsing_participant_tee_times")
            .select("tee_time_id")
            .eq("participant_id", participantId)
            .in("tee_time_id", teeTimes.filter(tt => tt.play_date === date).map(tt => tt.id));
          
          if (existingOnDate && existingOnDate.length > 0) {
            continue; // 이미 배정됨
          }
          
          const dateTeeTimes = teeTimes.filter(tt => tt.play_date === date);
          
          // 빈 자리가 있는 첫 번째 티타임 찾기
          for (const teeTime of dateTeeTimes) {
            // 현재 배정 인원 다시 확인
            const { data: currentAssignments } = await supabase
              .from("singsing_participant_tee_times")
              .select("participant_id")
              .eq("tee_time_id", teeTime.id);
            
            const currentCount = currentAssignments?.length || 0;
            
            if (currentCount < teeTime.max_players) {
              // 배정 시도
              const { error } = await supabase
                .from("singsing_participant_tee_times")
                .insert({
                  participant_id: participantId,
                  tee_time_id: teeTime.id
                });
              
              if (!error) {
                totalAssigned++;
                break; // 성공했으면 다음 날짜로
              } else if (error.code !== '23505') {
                // 중복 키 오류가 아닌 경우만 에러 처리
                console.error('배정 오류:', error);
              }
            }
          }
        }
      }

      alert(`${totalAssigned}건의 배정이 완료되었습니다.`);
      setSelectedForBulk([]);
      setSelectedDates([]);
      await fetchData();
    } catch (error: any) {
      setError(`일괄 배정 중 오류: ${error.message}`);
    }
  };

  // 자동 배정 (중복 방지 강화)
  const handleSmartAutoAssign = async () => {
    if (!window.confirm('미배정 참가자를 자동으로 전체 일정에 배정하시겠습니까?')) return;
    
    try {
      // 완전 미배정 참가자 찾기
      const unassigned = participants.filter(p => 
        !p.tee_time_assignments || p.tee_time_assignments.length === 0
      );
      
      if (unassigned.length === 0) {
        alert('미배정 참가자가 없습니다.');
        return;
      }

      let totalAssigned = 0;
      const dateGroups = Object.entries(teeTimesByDate).sort(([a], [b]) => a.localeCompare(b));

      for (const participant of unassigned) {
        for (const [date, dayTeeTimes] of dateGroups) {
          // 가장 여유있는 티타임 찾기
          let assigned = false;
          
          for (const teeTime of dayTeeTimes) {
            // 현재 배정 인원 확인
            const { data: currentAssignments } = await supabase
              .from("singsing_participant_tee_times")
              .select("participant_id")
              .eq("tee_time_id", teeTime.id);
            
            const currentCount = currentAssignments?.length || 0;
            
            if (currentCount < teeTime.max_players) {
              const { error } = await supabase
                .from("singsing_participant_tee_times")
                .insert({
                  participant_id: participant.id,
                  tee_time_id: teeTime.id
                });
              
              if (!error) {
                totalAssigned++;
                assigned = true;
                break;
              } else if (error.code !== '23505') {
                console.error('배정 오류:', error);
              }
            }
          }
          
          if (!assigned) {
            console.log(`${participant.name}님을 ${date}에 배정할 수 없습니다 (자리 없음)`);
          }
        }
      }

      alert(`${totalAssigned}건의 배정이 완료되었습니다.`);
      await fetchData();
    } catch (error: any) {
      setError(`자동 배정 중 오류: ${error.message}`);
    }
  };

  // 참가자의 날짜별 참여 상태 확인
  const isParticipantAssignedToDate = (participantId: string, date: string) => {
    const participant = participants.find(p => p.id === participantId);
    const dateTeeTimeIds = teeTimes
      .filter(tt => tt.play_date === date)
      .map(tt => tt.id);
    
    return participant?.tee_time_assignments?.some(id => dateTeeTimeIds.includes(id)) || false;
  };

  // 미리보기 HTML 생성
  const generatePreviewHTML = (type: 'customer' | 'staff') => {
    const teeTimesByDate = teeTimes.reduce((acc, tt) => {
      const date = tt.play_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(tt);
      return acc;
    }, {} as Record<string, TeeTime[]>);

    const tourTitle = tour?.tour_title || "투어명";
    const tourPeriod = tour?.tour_period || "투어 기간";
    const isStaff = type === 'staff';

    // 스탭진 정보 HTML
    let staffInfoHTML = '';
    if (tour?.show_staff_info && staffMembers.length > 0) {
      staffInfoHTML = staffMembers.map(staff => `
        <p>${staff.role}: ${staff.name}${staff.phone ? ` / ${staff.phone}` : ''}</p>
      `).join('');
    }

    // 연락처 정보 HTML
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
        const teeTimeParticipants = participants.filter(p => 
          p.tee_time_assignments?.includes(teeTime.id)
        );
        
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

    // 주의사항 HTML
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

    // 푸터 메시지 HTML
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

  // 날짜별로 티타임 그룹화
  const teeTimesByDate = teeTimes.reduce((acc, tt) => {
    const date = tt.play_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(tt);
    return acc;
  }, {} as Record<string, TeeTime[]>);

  // 통계 계산
  const totalParticipants = participants.length;
  const fullyAssignedParticipants = participants.filter(p => {
    const totalDates = Object.keys(teeTimesByDate).length;
    const assignedDates = new Set(
      p.tee_time_assignments?.map(id => 
        teeTimes.find(tt => tt.id === id)?.play_date
      ).filter(Boolean)
    ).size;
    return assignedDates === totalDates;
  }).length;
  const partiallyAssignedParticipants = participants.filter(p => 
    p.tee_time_assignments && p.tee_time_assignments.length > 0 && 
    p.tee_time_assignments.length < Object.keys(teeTimesByDate).length
  ).length;
  const unassignedParticipants = participants.filter(p => 
    !p.tee_time_assignments || p.tee_time_assignments.length === 0
  ).length;

  const handlePreview = () => {
    const html = generatePreviewHTML(previewType);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  // 미배정 참가자 필터링
  const filteredUnassigned = participants.filter(p => 
    (!p.tee_time_assignments || p.tee_time_assignments.length === 0) && 
    p.name.includes(unassignedSearch)
  );

  // 데이터 새로고침 버튼
  const handleRefresh = async () => {
    showToast('success', '데이터를 새로고침 중입니다...');
    await fetchData();
    showToast('success', '데이터가 업데이트되었습니다.');
  };

  return (
    <div className="mb-8 relative">
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all transform ${
            toastMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toastMessage.message}</span>
          </div>
        </div>
      )}
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">티타임별 참가자 배정</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">전체 일정 참가</div>
              <div className="text-2xl font-bold text-green-900">{fullyAssignedParticipants}명</div>
              <div className="text-xs text-green-600">모든 날짜 참여</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">부분 참가</div>
              <div className="text-2xl font-bold text-yellow-900">{partiallyAssignedParticipants}명</div>
              <div className="text-xs text-yellow-600">일부 날짜만</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 font-medium">미배정</div>
              <div className="text-2xl font-bold text-red-900">{unassignedParticipants}명</div>
              <div className="text-xs text-red-600">배정 필요</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">총 참가자</div>
              <div className="text-2xl font-bold text-blue-900">{totalParticipants}명</div>
              <div className="text-xs text-blue-600">전체 인원</div>
            </div>
          </div>

          {/* 일괄 배정 컨트롤 */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-900 mb-3">일괄 배정 도구</h3>
            
            {/* 참가 모드 선택 */}
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700">참가 모드:</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="full"
                    checked={participationMode === 'full'}
                    onChange={(e) => setParticipationMode(e.target.value as 'full' | 'partial')}
                    className="mr-2"
                  />
                  전체 일정 참가
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="partial"
                    checked={participationMode === 'partial'}
                    onChange={(e) => setParticipationMode(e.target.value as 'full' | 'partial')}
                    className="mr-2"
                  />
                  선택 날짜 참가
                </label>
              </div>
            </div>

            {/* 날짜 선택 (부분 참가 모드일 때만) */}
            {participationMode === 'partial' && (
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">참가 날짜 선택:</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {Object.keys(teeTimesByDate).map(date => (
                    <label key={date} className="flex items-center bg-white px-3 py-1 rounded border">
                      <input
                        type="checkbox"
                        value={date}
                        checked={selectedDates.includes(date)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDates([...selectedDates, date]);
                          } else {
                            setSelectedDates(selectedDates.filter(d => d !== date));
                          }
                        }}
                        className="mr-2"
                      />
                      {new Date(date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedForBulk(filteredUnassigned.map(p => p.id))}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                <CheckSquare className="w-4 h-4" />
                미배정자 전체선택
              </button>
              
              <button
                onClick={() => {
                  setBulkAssignOption(participationMode === 'full' ? 'all' : 'specific');
                  if (participationMode === 'full') {
                    setSelectedDates(Object.keys(teeTimesByDate));
                  }
                  handleBulkAssign();
                }}
                disabled={selectedForBulk.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300"
              >
                <Users className="w-4 h-4" />
                선택 참가자 배정
              </button>

              <button
                onClick={handleSmartAutoAssign}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4" />
                스마트 자동배정
              </button>

              {selectedForBulk.length > 0 && (
                <button
                  onClick={() => setSelectedForBulk([])}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                  선택취소 ({selectedForBulk.length}명)
                </button>
              )}
            </div>
          </div>

          {/* 날짜별 티타임 배정 */}
          <div className="space-y-6">
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
                  <div className="text-sm text-gray-600">
                    참가: {participants.filter(p => isParticipantAssignedToDate(p.id, date)).length}명
                  </div>
                </div>
                
                <div className="space-y-3">
                  {times.map(teeTime => {
                    const assignedParticipants = participants.filter(p => 
                      p.tee_time_assignments?.includes(teeTime.id)
                    );
                    
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
                          <span className={assignedParticipants.length === teeTime.max_players ? "text-red-600 font-bold" : "text-gray-500"}>
                            {assignedParticipants.length} / {teeTime.max_players}명
                          </span>
                        </div>
                        
                        {assignedParticipants.length === 0 ? (
                          <div className="text-gray-400 text-sm">배정된 참가자가 없습니다.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {assignedParticipants.map(p => (
                              <div key={p.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{p.name}</span>
                                  <span className="text-xs text-gray-500">({p.team_name || '개인'})</span>
                                </div>
                                <button
                                  onClick={() => handleToggleTeeTimeAssignment(p.id, teeTime.id)}
                                  className={`text-red-600 hover:text-red-800 text-sm transition-all ${
                                    assigning === p.id ? 'animate-pulse' : ''
                                  }`}
                                  disabled={!!assigning}
                                  title="배정 해제"
                                >
                                  {assigning === p.id ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* 이 티타임에 배정 가능한 참가자 표시 (정원 미달 시) */}
                        {assignedParticipants.length < teeTime.max_players && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">티타임에 추가 가능: {teeTime.max_players - assignedParticipants.length}명</div>
                            <div className="flex flex-wrap gap-1">
                              {participants
                                .filter(p => {
                                  // 이미 이 티타임에 배정된 사람 제외
                                  if (p.tee_time_assignments?.includes(teeTime.id)) return false;
                                  // 같은 날짜의 다른 티타임에 이미 배정된 사람 제외
                                  const sameDateTeeTimeIds = teeTimes
                                    .filter(tt => tt.play_date === teeTime.play_date)
                                    .map(tt => tt.id);
                                  const alreadyAssignedToDate = p.tee_time_assignments?.some(id => 
                                    sameDateTeeTimeIds.includes(id)
                                  );
                                  return !alreadyAssignedToDate;
                                })
                                .slice(0, 5) // 최대 5명만 표시
                                .map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => handleToggleTeeTimeAssignment(p.id, teeTime.id)}
                                    disabled={!!assigning}
                                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                                  >
                                    + {p.name}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 미배정 참가자 섹션 */}
          <div className="mt-6 bg-gray-50 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-bold text-gray-700">미배정 참가자</div>
                <div className="text-xs text-gray-500 mt-1">전체 일정에 배정되지 않은 참가자</div>
              </div>
              <input
                type="text"
                placeholder="이름으로 검색"
                value={unassignedSearch}
                onChange={e => setUnassignedSearch(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-blue-500"
              />
            </div>
            
            {filteredUnassigned.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {unassignedParticipants === 0 
                  ? "모든 참가자가 배정되었습니다."
                  : "검색 결과가 없습니다."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredUnassigned.map(p => {
                  // 참가자가 배정되지 않은 날짜 찾기
                  const assignedDates = new Set(
                    p.tee_time_assignments?.map(id => 
                      teeTimes.find(tt => tt.id === id)?.play_date
                    ).filter(Boolean)
                  );
                  const unassignedDates = Object.keys(teeTimesByDate).filter(
                    date => !assignedDates.has(date)
                  );
                  
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-lg shadow px-3 py-2 transition hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between mb-1">
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
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        미배정: {unassignedDates.map(date => 
                          new Date(date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
                        ).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* 부분 배정 참가자 섹션 (추가 배정 가능) */}
          {partiallyAssignedParticipants > 0 && (
            <div className="mt-4 bg-yellow-50 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-bold text-yellow-700">부분 배정 참가자</div>
                  <div className="text-xs text-yellow-600 mt-1">일부 날짜만 배정됨 (추가 배정 가능)</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {participants
                  .filter(p => 
                    p.tee_time_assignments && 
                    p.tee_time_assignments.length > 0 && 
                    p.tee_time_assignments.length < Object.keys(teeTimesByDate).length &&
                    p.name.includes(unassignedSearch)
                  )
                  .map(p => {
                    const assignedDatesCount = new Set(
                      p.tee_time_assignments?.map(id => 
                        teeTimes.find(tt => tt.id === id)?.play_date
                      ).filter(Boolean)
                    ).size;
                    
                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-lg shadow px-3 py-2 transition hover:bg-yellow-100"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.team_name || '개인'}</div>
                            <div className="text-xs text-yellow-600 mt-1">
                              {assignedDatesCount}/{Object.keys(teeTimesByDate).length}일 배정됨
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
      
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default TeeTimeAssignmentManagerV2;
