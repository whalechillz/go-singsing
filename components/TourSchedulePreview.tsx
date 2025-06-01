import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, Share2, Printer, Calendar, MapPin, Phone, Clock, Users, FileText, Eye } from 'lucide-react';

interface TourSchedulePreviewProps {
  tourId: string;
}

export default function TourSchedulePreview({ tourId }: TourSchedulePreviewProps) {
  const [tourData, setTourData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('full');
  const [staffDocumentHTML, setStaffDocumentHTML] = useState<string>('');

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  useEffect(() => {
    if (activeTab === 'boarding-staff' && tourData) {
      fetchParticipantsForStaff();
    }
  }, [activeTab, tourData]);

  const fetchTourData = async () => {
    try {
      setLoading(true);
      
      // 뷰에서 통합된 데이터 가져오기
      const { data, error } = await supabase
        .from('tour_schedule_preview')
        .select('*')
        .eq('tour_id', tourId)
        .single();

      if (error) throw error;
      setTourData(data);
    } catch (error) {
      console.error('Error fetching tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantsForStaff = async () => {
    try {
      const { data: participants, error } = await supabase
        .from('singsing_participants')
        .select('*')
        .eq('tour_id', tourId)
        .eq('status', '확정')
        .order('pickup_location', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // 참가자 데이터로 스탭용 HTML 생성
      if (participants) {
        setStaffDocumentHTML(generateStaffHTML(participants));
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // HTML을 생성하여 다운로드
    const content = getDocumentHTML();
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tourData.tour_name}_${activeTab}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tourData?.tour_name,
        text: `${tourData?.tour_name} 일정표`,
        url: window.location.href,
      });
    }
  };

  // 문서별 HTML 생성
  const getDocumentHTML = () => {
    switch (activeTab) {
      case 'boarding':
        return getBoardingGuideHTML();
      case 'boarding-staff':
        return getBoardingStaffHTML();
      case 'schedule':
        return getTourScheduleHTML();
      default:
        return getFullScheduleHTML();
    }
  };

  // 탑승 안내문 HTML (고객용)
  const getBoardingGuideHTML = () => {
    const firstSchedule = tourData.schedules?.[0];
    const boardingInfo = firstSchedule?.boarding_info || {};
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 탑승지 안내</title>
  <style>
    ${getBoardingGuideStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">싱싱골프투어</div>
      <div class="header-subtitle">${tourData.tour_name}</div>
    </div>
    
    <div class="boarding-cards">
      ${boardingInfo.routes?.map((route: any, index: number) => `
        <div class="boarding-card">
          <div class="card-border"></div>
          <div class="card-content">
            <div class="card-title">${route.place}</div>
            <div class="card-time">${route.time}</div>
            <div class="card-date">${new Date(tourData.start_date).toLocaleDateString('ko-KR')}</div>
            <div class="card-info">
              <div class="info-parking">주차: ${getParking(route.place)}</div>
              <div class="info-arrival">${getArrivalTime(route.time)} 도착</div>
            </div>
          </div>
        </div>
      `).join('') || ''}
    </div>
    
    <div class="common-info">
      <h3 class="section-title">탑승 주의사항</h3>
      <ul class="notice-list">
        ${tourData.notices?.map((notice: any) => `
          <li class="notice-item">${notice.notice}</li>
        `).join('') || ''}
      </ul>
      
      <div class="contact-box">
        <div class="contact-title">비상 연락처</div>
        ${tourData.staff?.map((staff: any) => `
          <div class="contact-phone">${staff.name} ${staff.role} - ${staff.phone}</div>
        `).join('') || ''}
      </div>
    </div>
    
    <div class="footer">
      <p>즐거운 골프 여행 되시길 바랍니다</p>
      <p>싱싱골프투어 | 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 탑승 안내문 HTML (스탭용)
  const getBoardingStaffHTML = () => {
    return staffDocumentHTML || '<div>스탭용 문서를 생성 중입니다...</div>';
  };

  // 투어 일정표 HTML
  const getTourScheduleHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 일정 안내</title>
  <style>
    ${getTourScheduleStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">싱싱골프투어</div>
      <div class="company-info">
        수원시 영통구 법조로149번길 200<br>
        고객센터 TEL 031-215-3990
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">상품 정보</div>
      <div class="product-info-box">
        <div class="info-row">
          <div class="info-label">상품명</div>
          <div class="info-value important">${tourData.tour_name}</div>
        </div>
        <div class="info-row">
          <div class="info-label">일정</div>
          <div class="info-value important">
            ${new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
            ${new Date(tourData.end_date).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>
      
      <div class="notice-box">
        <div class="notice-title">예약 안내 사항</div>
        <ul class="notice-list">
          ${tourData.notices?.map((notice: any) => `
            <li>${notice.notice}</li>
          `).join('') || ''}
        </ul>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">일정 안내</div>
      <div class="schedule-section">
        ${tourData.schedules?.map((schedule: any) => `
          <div class="day-schedule">
            <div class="day-title">
              <div>Day ${schedule.day_number} - ${new Date(schedule.date).toLocaleDateString('ko-KR')}</div>
            </div>
            <div class="day-content">
              <ol class="schedule-list">
                ${schedule.schedule_items?.map((item: any) => `
                  <li>${item.time ? item.time + ' - ' : ''}${item.content}</li>
                `).join('') || ''}
              </ol>
              
              ${schedule.tee_times?.length > 0 ? `
                <div class="tee-time-box">
                  <div class="tee-time-title">티오프 시간</div>
                  <div class="tee-time-info">
                    ${schedule.tee_times.map((teeTime: any) => `
                      <div class="tee-time-course">${teeTime.course}: ${teeTime.time}</div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              <div class="meal-info">
                <div class="meal">
                  <div>조식</div>
                  <div class="meal-status ${schedule.meal_breakfast ? 'included' : 'not-included'}">
                    ${schedule.meal_breakfast ? 'O' : 'X'}
                  </div>
                </div>
                <div class="meal">
                  <div>중식</div>
                  <div class="meal-status ${schedule.meal_lunch ? 'included' : 'not-included'}">
                    ${schedule.meal_lunch ? 'O' : 'X'}
                  </div>
                </div>
                <div class="meal">
                  <div>석식</div>
                  <div class="meal-status ${schedule.meal_dinner ? 'included' : 'not-included'}">
                    ${schedule.meal_dinner ? 'O' : 'X'}
                  </div>
                </div>
              </div>
              
              ${(schedule.menu_breakfast || schedule.menu_lunch || schedule.menu_dinner) ? `
                <div style="margin-top: 15px; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 14px;">
                  <p style="font-weight: bold; margin-bottom: 5px; color: #2b6cb0;">식사 메뉴</p>
                  <div style="display: flex; flex-direction: column;">
                    ${schedule.menu_breakfast ? `<div style="margin-bottom: 5px;"><span style="font-weight: bold;">조식:</span> ${schedule.menu_breakfast}</div>` : ''}
                    ${schedule.menu_lunch ? `<div style="margin-bottom: 5px;"><span style="font-weight: bold;">중식:</span> ${schedule.menu_lunch}</div>` : ''}
                    ${schedule.menu_dinner ? `<div><span style="font-weight: bold;">석식:</span> ${schedule.menu_dinner}</div>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('') || ''}
      </div>
    </div>
    
    <div class="footer">
      <p>♡ 즐거운 하루 되시길 바랍니다. ♡</p>
      <p>싱싱골프투어 ☎ 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 전체 일정표 HTML
  const getFullScheduleHTML = () => {
    return getTourScheduleHTML(); // 기본은 투어 일정표와 동일
  };

  // 스타일 헬퍼 함수들
  const getBoardingGuideStyles = () => {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }
    body { background-color: #f5f7fa; color: #343a40; line-height: 1.6; padding: 10px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
    .header-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .header-subtitle { font-size: 16px; opacity: 0.9; }
    .boarding-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px; }
    .boarding-card { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; position: relative; }
    .card-border { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: #3182ce; }
    .card-content { padding: 20px 20px 20px 26px; }
    .card-title { font-size: 20px; font-weight: bold; color: #2c5282; margin-bottom: 15px; }
    .card-time { font-size: 32px; font-weight: bold; color: #e53e3e; margin-bottom: 5px; }
    .card-date { font-size: 16px; color: #4a5568; margin-bottom: 10px; }
    .card-info { display: flex; gap: 15px; margin-top: 15px; font-size: 14px; }
    .info-parking { background-color: #ebf8ff; color: #2B6CB0; padding: 5px 10px; border-radius: 4px; }
    .info-arrival { background-color: #fff5f5; color: #e53e3e; padding: 5px 10px; border-radius: 4px; }
    .common-info { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 15px; }
    .section-title { font-size: 18px; font-weight: bold; color: #2c5282; margin-bottom: 15px; }
    .notice-list { list-style: none; margin-left: 5px; }
    .notice-item { position: relative; padding-left: 20px; margin-bottom: 10px; }
    .notice-item:before { content: '※'; position: absolute; left: 0; color: #e53e3e; }
    .contact-box { background-color: #edf2f7; border-radius: 8px; padding: 15px; text-align: center; margin-top: 15px; }
    .contact-title { font-weight: bold; color: #2c5282; margin-bottom: 10px; }
    .contact-phone { font-size: 16px; color: #4a5568; margin: 5px 0; }
    .footer { text-align: center; padding: 15px; background-color: #2c5282; color: white; border-radius: 10px; margin-top: 20px; }
    @media print { body { padding: 0; } .container { max-width: 100%; } }
    `;
  };

  const getBoardingStaffStyles = () => {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }
    body { background-color: #f5f7fa; color: #343a40; padding: 15px; }
    .container { max-width: 900px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    .header-container { display: flex; justify-content: space-between; background-color: #2c5282; color: white; padding: 20px; }
    .title-section h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { font-size: 16px; opacity: 0.9; }
    .info-section { text-align: right; background: rgba(255,255,255,0.15); padding: 10px 15px; border-radius: 4px; }
    .section { padding: 20px; border-bottom: 1px solid #e2e8f0; }
    .section-title { font-size: 18px; font-weight: bold; color: #2c5282; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #DEE2E6; padding: 10px; text-align: center; }
    th { background-color: #ECF0F1; font-weight: bold; color: #34699C; }
    .footer { padding: 15px; text-align: center; background-color: #f8f9fa; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
    `;
  };

  const getTourScheduleStyles = () => {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }
    body { background-color: #f5f7fa; color: #343a40; padding: 0; }
    .container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .header { background-color: #2c5282; color: white; padding: 20px 15px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .company-info { font-size: 13px; opacity: 0.9; }
    .section { padding: 0; margin-bottom: 15px; }
    .section-title { font-size: 16px; font-weight: bold; margin: 0 15px; padding: 15px 0 10px 0; color: #2c5282; border-bottom: 2px solid #2c5282; }
    .product-info-box { margin: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .info-row { display: flex; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { width: 100px; padding: 12px 15px; background-color: #edf2f7; font-weight: bold; }
    .info-value { flex: 1; padding: 12px 15px; }
    .important { font-weight: 600; color: #2d3748; }
    .notice-box { margin: 15px; background-color: #f8f9fa; border-left: 3px solid #4299e1; border-radius: 6px; padding: 14px 16px; }
    .notice-title { font-weight: bold; color: #2b6cb0; margin-bottom: 10px; }
    .notice-list { list-style: none; }
    .notice-list li { padding: 4px 0; color: #4A5568; font-size: 14px; }
    .notice-list li:before { content: "•"; margin-right: 8px; color: #4299e1; }
    .day-schedule { background: white; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .day-title { background: #2c5282; color: white; padding: 10px 15px; font-weight: bold; }
    .day-content { padding: 15px; }
    .schedule-list { padding-left: 20px; margin-bottom: 15px; }
    .schedule-list li { margin-bottom: 8px; color: #4a5568; }
    .tee-time-box { background-color: #ebf8ff; border-left: 3px solid #63b3ed; padding: 10px 12px; margin: 10px 0 15px 0; border-radius: 4px; }
    .tee-time-title { font-weight: bold; color: #2b6cb0; margin-bottom: 5px; }
    .tee-time-course { margin-bottom: 4px; color: #4a5568; }
    .meal-info { display: flex; background: #edf2f7; padding: 10px; border-radius: 6px; justify-content: space-between; }
    .meal { text-align: center; }
    .meal-status { font-weight: bold; margin-top: 4px; }
    .included { color: #2F855A; }
    .not-included { color: #C53030; }
    .footer { text-align: center; padding: 15px; background-color: #f8f9fa; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
    `;
  };

  // 헬퍼 함수들
  const getParking = (place: string) => {
    if (place.includes('양재')) return '10,000원';
    if (place.includes('수원')) return '7,000원';
    return '무료';
  };

  const getArrivalTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const arrivalHour = hour > 0 ? hour - 1 : 23;
    const arrivalMinute = minute >= 20 ? minute - 20 : minute + 40;
    return `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`;
  };

  const generateStaffHTML = (participants: any[]) => {
    // 탑승지별로 참가자 그룹화
    const participantsByLocation = participants.reduce((acc, participant) => {
      const location = participant.pickup_location || '미정';
      if (!acc[location]) acc[location] = [];
      acc[location].push(participant);
      return acc;
    }, {});

    const getRowColor = (index: number) => {
      const colors = ['bg-green-50', 'bg-blue-50', 'bg-yellow-50', 'bg-red-50'];
      return colors[index % colors.length];
    };

    const getParkingInfo = (location: string) => {
      if (location.includes('양재')) return '주차비 일일 10,000원';
      if (location.includes('수원')) return '주차비 일일 7,000원';
      if (location.includes('군포') || location.includes('평택')) return '주차비 무료';
      return '';
    };

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 탑승지별 배정 안내</title>
  <style>
    ${getBoardingStaffStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header-container">
      <div class="title-section">
        <h1>탑승지별 배정 안내</h1>
        <p class="subtitle">${tourData.tour_name} - 탑승 ${participants.length}명</p>
      </div>
      <div class="info-section">
        ${tourData.staff?.map((staff: any) => `
          <p><strong>${staff.name} ${staff.role}</strong></p>
          <p>${staff.phone}</p>
        `).join('') || ''}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">차량 및 탑승 정보</div>
      
      <div class="bus-info">
        <div class="bus-info-col">
          <div class="bus-card">
            <div class="bus-title">차량 정보</div>
            <div class="bus-details">
              <p><strong>차량:</strong> ${participants.length <= 28 ? '28인승' : participants.length <= 45 ? '45인승' : '대형'} 리무진 버스</p>
              <p><strong>총 인원:</strong> ${participants.length}명</p>
              <p><strong>좌석 안내:</strong> 1-3번 좌석은 멀미 고객 우선석</p>
            </div>
          </div>
        </div>
        
        <div class="bus-info-col">
          <div class="bus-card">
            <div class="bus-title">탑승지 정보</div>
            <div class="bus-details">
              ${tourData.schedules?.[0]?.boarding_info?.routes?.map((route: any) => `
                <p><strong>${route.place}:</strong> ${route.time}</p>
              `).join('') || '<p>탑승지 정보 없음</p>'}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 그룹별 총무 연락처 -->
      <div class="emergency-contacts">
        <div class="emergency-title">그룹별 총무 연락처</div>
        <div class="contact-grid">
          ${Object.entries(participantsByLocation).map(([location, locationParticipants]: [string, any]) => {
            const leaders = locationParticipants.filter((p: any) => 
              p.role === '총무' || p.role === '회장' || p.role === '부회장'
            );
            return leaders.map((leader: any) => `
              <div class="contact-item">
                <div class="contact-name">${leader.name} (${location})</div>
                <div class="contact-phone">${leader.phone || '연락처 없음'}</div>
              </div>
            `).join('');
          }).join('') || '<p>총무 정보 없음</p>'}
        </div>
      </div>
    </div>
    
    <!-- 탑승자 명단 섹션 -->
    <div class="section">
      <div class="section-title">탑승자 명단</div>
      
      ${Object.entries(participantsByLocation).map(([location, locationParticipants]: [string, any], index) => `
        <div class="checklist-table">
          <div class="checklist-title">${location} - ${locationParticipants.length}명</div>
          ${getParkingInfo(location) ? `
            <div style="text-align: center; background-color: #e9f5ff; padding: 5px; margin-bottom: 8px; font-size: 13px;">
              <strong>주차 안내:</strong> ${getParkingInfo(location)}
            </div>
          ` : ''}
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">No.</th>
                <th>성함</th>
                <th style="width: 120px;">연락처</th>
                <th style="width: 80px;">팀</th>
              </tr>
            </thead>
            <tbody>
              ${locationParticipants.map((participant: any, idx: number) => `
                <tr class="${getRowColor(index)}">
                  <td>${idx + 1}</td>
                  <td>${participant.name}</td>
                  <td>${participant.phone ? participant.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : '-'}</td>
                  <td>${participant.team_name || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
    
    <div class="footer">
      <p>싱싱골프투어 | 031-215-3990</p>
      ${tourData.staff?.map((staff: any) => `
        <p>담당 ${staff.name} ${staff.role} | ${staff.phone}</p>
      `).join('') || ''}
    </div>
  </div>
</body>
</html>`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tourData) {
    return <div>투어 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2 print:hidden">
        <button 
          className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 flex items-center"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-1" /> 공유
        </button>
        <button 
          className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 flex items-center"
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4 mr-1" /> 인쇄
        </button>
        <button 
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 flex items-center"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-1" /> HTML 다운로드
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b print:hidden">
        <div className="flex space-x-8">
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'full' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('full')}
          >
            전체 일정표
          </button>
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boarding' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('boarding')}
          >
            탑승 안내문 (고객용)
          </button>
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boarding-staff' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('boarding-staff')}
          >
            탑승 안내문 (스탭용)
          </button>
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('schedule')}
          >
            투어 일정표
          </button>
        </div>
      </div>

      {/* 문서 미리보기 */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">문서 미리보기</h3>
          <Eye className="w-5 h-5 text-gray-500" />
        </div>
        
        {/* iframe으로 HTML 미리보기 */}
        <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <iframe
            srcDoc={getDocumentHTML()}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="문서 미리보기"
          />
        </div>
      </div>

      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          iframe, iframe * {
            visibility: visible;
          }
          iframe {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}