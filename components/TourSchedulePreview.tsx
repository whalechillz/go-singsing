import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Download, Share2, Printer, Calendar, MapPin, Phone, Clock, Users, FileText, Eye, Home, Car, Flag, Building } from 'lucide-react';
import { BRAND_COLORS, DOCUMENT_COLOR_SCHEME } from '@/design-system/brand-colors';

interface TourSchedulePreviewProps {
  tourId: string;
}

// 텍스트를 파싱하여 "제목: 내용" 형식을 볼드 처리하는 함수
const formatTextWithBold = (text: string): string => {
  if (!text) return '';
  return text.split('\n').map(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1 && colonIndex < line.length - 1) {
      const title = line.substring(0, colonIndex).trim();
      const content = line.substring(colonIndex + 1).trim();
      return `<strong>${title}:</strong> ${content}`;
    }
    return line;
  }).join('<br>');
};

export default function TourSchedulePreview({ tourId }: TourSchedulePreviewProps) {
  const [tourData, setTourData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [documentNotices, setDocumentNotices] = useState<any>({});
  const [documentFooters, setDocumentFooters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customer_schedule');
  const [staffDocumentHTML, setStaffDocumentHTML] = useState<string>('');
  const [roomAssignmentHTML, setRoomAssignmentHTML] = useState<string>('');
  const [roomAssignmentStaffHTML, setRoomAssignmentStaffHTML] = useState<string>('');
  const [teeTimeCustomerHTML, setTeeTimeCustomerHTML] = useState<string>('');
  const [teeTimeStaffHTML, setTeeTimeStaffHTML] = useState<string>('');
  const [tourBoardingPlaces, setTourBoardingPlaces] = useState<any[]>([]);
  const [tourWaypoints, setTourWaypoints] = useState<any[]>([]);
  const searchParams = useSearchParams();

  // 문서 타입 정의
  const DOCUMENT_TYPES = [
    { id: 'customer_schedule', label: '고객용 일정표', icon: '📋' },
    { id: 'customer_boarding', label: '고객용 탑승안내서', icon: '🚌' },
    { id: 'staff_boarding', label: '스탭용 탑승안내서', icon: '👥' },
    { id: 'room_assignment', label: '객실 배정표 (고객용)', icon: '🏨' },
    { id: 'room_assignment_staff', label: '객실 배정표 (스탭용)', icon: '🏨' },
    { id: 'customer_timetable', label: '티타임표 (고객용)', icon: '⛳' },
    { id: 'staff_timetable', label: '티타임표 (내부용)', icon: '⛳' },
    { id: 'simplified', label: '간편 일정표', icon: '📄' }
  ];

  useEffect(() => {
    if (tourId) {
      fetchAllData();
    }
  }, [tourId]);
  
  const fetchAllData = async () => {
    await fetchTourBoardingPlaces();
    await fetchTourData();
  };

  // URL 파라미터로 뷰 자동 선택
  useEffect(() => {
    const view = searchParams.get('view');
    if (view && DOCUMENT_TYPES.some(doc => doc.id === view)) {
      setActiveTab(view);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'staff_boarding' && tourData) {
      fetchParticipantsForStaff();
    } else if ((activeTab === 'room_assignment' || activeTab === 'room_assignment_staff') && tourData) {
      fetchRoomAssignments();
    } else if ((activeTab === 'customer_timetable' || activeTab === 'staff_timetable') && tourData) {
      fetchTeeTimes();
    }
  }, [activeTab, tourData]);

  const fetchTourData = async () => {
    try {
      setLoading(true);
      
      // 투어 정보 가져오기
      const { data: tour, error: tourError } = await supabase
        .from('singsing_tours')
        .select(`
          *,
          singsing_tour_staff (*)
        `)
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;

      // 일정 정보 가져오기
      const { data: schedules, error: schedulesError } = await supabase
        .from('singsing_schedules')
        .select('*')
        .eq('tour_id', tourId)
        .order('date');

      if (schedulesError) throw schedulesError;
      
      // 경유지 정보를 다시 가져오기 (수정된 방법)
      const { data: waypointsData } = await supabase
        .from('singsing_tour_boarding_times')
        .select('*')
        .eq('tour_id', tourId)
        .eq('is_waypoint', true)
        .order('visit_date')
        .order('order_no');

      let enrichedWaypoints = [];
      if (waypointsData) {
        // 경유지 중 관광지와 매칭되는 정보 가져오기
        enrichedWaypoints = await Promise.all(waypointsData.map(async (waypoint) => {
          const { data: attractionData } = await supabase
            .from('tourist_attractions')
            .select('*')
            .ilike('name', `%${waypoint.waypoint_name}%`)
            .single();
          
          if (attractionData) {
            waypoint.attraction_data = attractionData;
          }
          return waypoint;
        }));
      }
      
      // 각 일정의 schedule_items에서 관광지 정보 enriching
      if (schedules) {
        for (const schedule of schedules) {
          const scheduleDate = schedule.date || schedule.schedule_date;
          
          if (schedule.schedule_items && Array.isArray(schedule.schedule_items)) {
            for (const item of schedule.schedule_items) {
              // 1. 구체적인 관광지 이름이 있는 경우
              if (item.content && (item.content.includes('송광사') || item.content.includes('순천만'))) {
                // tourist_attractions 테이블에서 매칭되는 정보 찾기
                const { data: attractionData } = await supabase
                  .from('tourist_attractions')
                  .select('*')
                  .ilike('name', `%${item.content.replace('관광', '').replace('투어', '').trim()}%`)
                  .single();
                
                if (attractionData) {
                  item.attraction_data = attractionData;
                }
              }
              // 2. "관광지 투어"라고만 되어 있는 경우, 해당 날짜의 경유지 정보 사용
              else if (item.content && (item.content === '관광지 투어' || item.content.includes('관광지 투어'))) {
                // 해당 날짜의 관광지 경유지 찾기
                const dayWaypoints = enrichedWaypoints.filter(w => {
                  const waypointDate = w.visit_date ? w.visit_date.split('T')[0] : '';
                  const scheduleDateFormatted = scheduleDate ? scheduleDate.split('T')[0] : '';
                  return waypointDate === scheduleDateFormatted && 
                    w.attraction_data && 
                    !w.waypoint_name?.includes('휴게소');
                });
                
                if (dayWaypoints.length > 0) {
                  // 첫 번째 관광지를 사용
                  const waypoint = dayWaypoints[0];
                  item.content = `${waypoint.waypoint_name} 관광`;
                  item.attraction_data = waypoint.attraction_data;
                }
              }
            }
          }
        }
      }
      
      console.log('Schedules data:', schedules);
      // 식사 정보 확인
      schedules?.forEach((schedule, idx) => {
        console.log(`Day ${idx + 1} 식사 정보:`, {
          meal_breakfast: schedule.meal_breakfast,
          menu_breakfast: schedule.menu_breakfast,
          meal_lunch: schedule.meal_lunch,
          menu_lunch: schedule.menu_lunch,
          meal_dinner: schedule.meal_dinner,
          menu_dinner: schedule.menu_dinner
        });
      });

      // 여행상품 정보 가져오기
      if (tour.tour_product_id) {
        const { data: product, error: productError } = await supabase
          .from('tour_products')
          .select('*')
          .eq('id', tour.tour_product_id)
          .single();

        if (!productError && product) {
          console.log('Product data:', product);
          setProductData(product);
        }
      }

      // 문서별 하단 내용 가져오기 - 테이블이 없으면 스킵
      try {
        const { data: footers, error: footersError } = await supabase
          .from('document_footers')
          .select('*')
          .eq('tour_id', tourId);

        if (!footersError && footers) {
          const footersByType = footers.reduce((acc, footer) => {
            if (!acc[footer.document_type]) {
              acc[footer.document_type] = {};
            }
            acc[footer.document_type][footer.section_title] = footer.content;
            return acc;
          }, {});
          setDocumentFooters(footersByType);
        }
      } catch (e) {
        console.log('document_footers 테이블이 없거나 접근할 수 없습니다.');
        // 기본값 사용
        setDocumentFooters({});
      }

      // 데이터 통합
      setTourData({
        ...tour,
        schedules: schedules,
        staff: tour.singsing_tour_staff || [],
        // 티타임표에 필요한 필드 추가
        tour_period: tour.tour_period || `${tour.start_date} ~ ${tour.end_date}`,
        show_staff_info: tour.show_staff_info ?? true,
        show_footer_message: tour.show_footer_message ?? true,
        show_company_phones: tour.show_company_phones ?? true,
        show_golf_phones: tour.show_golf_phones ?? true,
        company_phone: tour.company_phone || '031-215-3990',
        company_mobile: tour.company_mobile || '010-3332-9020',
        golf_reservation_phone: tour.golf_reservation_phone || '',
        golf_reservation_mobile: tour.golf_reservation_mobile || '',
        footer_message: tour.footer_message || '♡ 즐거운 하루 되시길 바랍니다. ♡',
        notices: tour.notices || '• 집합시간: 티오프 시간 30분 전 골프장 도착\n• 준비사항: 골프복, 골프화, 모자, 선글라스\n• 카트배정: 4인 1카트 원칙\n• 날씨대비: 우산, 우의 등 개인 준비'
      });
    } catch (error) {
      console.error('Error fetching tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTourBoardingPlaces = async () => {
    try {
      // 투어 전체 기간 정보 가져오기
      const { data: tourInfo } = await supabase
        .from('singsing_tours')
        .select('start_date, end_date')
        .eq('id', tourId)
        .single();

      if (!tourInfo) return;

      // 가는 날 탑승지만 가져오기 (탑승지는 첫날만)
      const { data, error } = await supabase
        .from('singsing_tour_boarding_times')
        .select(`
          *,
          boarding_place:singsing_boarding_places (*)
        `)
        .eq('tour_id', tourId)
        .eq('is_waypoint', false)
        .eq('visit_date', tourInfo.start_date.split('T')[0])
        .order('order_no');

      if (error) {
        console.error('Error fetching tour boarding places:', error);
      } else {
        setTourBoardingPlaces(data || []);
      }

      // 전체 투어 기간의 모든 경유지 정보 가져오기
      const { data: waypoints } = await supabase
        .from('singsing_tour_boarding_times')
        .select('*')
        .eq('tour_id', tourId)
        .eq('is_waypoint', true)
        .order('visit_date')
        .order('order_no');

      if (waypoints) {
        // 경유지 중 관광지와 매칭되는 정보 가져오기
        const enrichedWaypoints = await Promise.all(waypoints.map(async (waypoint) => {
          // waypoint_name이 tourist_attractions 테이블에 있는지 확인
          const { data: attractionData } = await supabase
            .from('tourist_attractions')
            .select('*')
            .ilike('name', `%${waypoint.waypoint_name}%`)
            .single();
          
          if (attractionData) {
            waypoint.attraction_data = attractionData;
          }
          return waypoint;
        }));
        
        console.log('전체 경유지 정보:', enrichedWaypoints);
        setTourWaypoints(enrichedWaypoints);
      }
    } catch (error) {
      console.error('Error in fetchTourBoardingPlaces:', error);
      // 테이블이 없을 수 있으므로 예외 처리
      setTourBoardingPlaces([]);
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
        .order('team_name', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      if (participants) {
        setStaffDocumentHTML(generateStaffHTML(participants));
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchRoomAssignments = async () => {
    try {
      // 참가자 정보 가져오기
      const { data: assignments, error } = await supabase
        .from('singsing_participants')
        .select('*')
        .eq('tour_id', tourId)
        .order('room_id');

      if (error) throw error;
      
      // 객실 정보 가져오기
      const { data: rooms, error: roomsError } = await supabase
        .from('singsing_rooms')
        .select('*')
        .eq('tour_id', tourId)
        .order('room_number');
        
      if (roomsError) throw roomsError;
      
      // 스태프 정보 가져오기 (기사 정보를 위해)
      const { data: staffData } = await supabase
        .from('singsing_tour_staff')
        .select('*')
        .eq('tour_id', tourId)
        .eq('role', '기사')
        .order('display_order')
        .limit(1);
      
      const tourStaff = staffData && staffData.length > 0 ? staffData[0] : null;
      console.log('기사 정보:', tourStaff);
      
      if (assignments && rooms) {
        setRoomAssignmentHTML(generateRoomAssignmentHTML(assignments, rooms, tourStaff, false)); // 고객용
        setRoomAssignmentStaffHTML(generateRoomAssignmentHTML(assignments, rooms, tourStaff, true)); // 스탭용
      }
    } catch (error) {
      console.error('Error fetching room assignments:', error);
    }
  };

  const fetchTeeTimes = async () => {
    try {
      // 티타임 정보 가져오기
      const { data: teeTimes, error } = await supabase
        .from('singsing_tee_times')
        .select('*')
        .eq('tour_id', tourId)
        .order('play_date')
        .order('tee_time');

      if (error) {
        console.error('티타임 조회 오류:', error);
        throw error;
      }
      
      console.log('티타임 데이터:', teeTimes);
      
      if (teeTimes && teeTimes.length > 0) {
        // 각 티타임별로 배정된 참가자 정보 가져오기
        const teeTimesWithPlayers = await Promise.all(teeTimes.map(async (teeTime) => {
          // singsing_participant_tee_times 테이블에서 배정 정보 가져오기
          const { data: assignments, error: assignError } = await supabase
            .from('singsing_participant_tee_times')
            .select(`
              participant_id,
              singsing_participants (
                id,
                name,
                phone,
                team_name,
                gender
              )
            `)
            .eq('tee_time_id', teeTime.id);
            
          if (assignError) {
            console.error('배정 정보 조회 오류:', assignError);
          }
          
          // 티타임 데이터에 플레이어 정보 추가
          return {
            ...teeTime,
            // 필드명 통일: play_date -> date, golf_course -> course
            date: teeTime.play_date || teeTime.date,
            course: teeTime.golf_course || teeTime.course,
            // 배정된 참가자 정보를 singsing_tee_time_players 형식으로 변환
            singsing_tee_time_players: assignments?.map((a, index) => ({
              participant_id: a.participant_id,
              order_no: index + 1,
              singsing_participants: a.singsing_participants
            })) || []
          };
        }));
        
        console.log('플레이어 정보가 포함된 티타임 데이터:', teeTimesWithPlayers);
        
        const customerHTML = generateTeeTimeHTML(teeTimesWithPlayers, false); // 고객용
        const staffHTML = generateTeeTimeHTML(teeTimesWithPlayers, true); // 내부용
        console.log('HTML 생성됨:', customerHTML.length, staffHTML.length);
        setTeeTimeCustomerHTML(customerHTML);
        setTeeTimeStaffHTML(staffHTML);
      } else {
        console.log('티타임 데이터가 없습니다');
        setTeeTimeCustomerHTML('<div class="no-data">티타임 데이터가 없습니다.</div>');
        setTeeTimeStaffHTML('<div class="no-data">티타임 데이터가 없습니다.</div>');
      }
    } catch (error) {
      console.error('Error fetching tee times:', error);
      setTeeTimeCustomerHTML('<div class="error">티타임 데이터를 불러오는 중 오류가 발생했습니다.</div>');
      setTeeTimeStaffHTML('<div class="error">티타임 데이터를 불러오는 중 오류가 발생했습니다.</div>');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = getDocumentHTML();
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tourData.title}_${activeTab}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tourData?.title,
        text: `${tourData?.title} 문서`,
        url: window.location.href,
      });
    }
  };

  // 문서별 HTML 생성
  const getDocumentHTML = () => {
    switch (activeTab) {
      case 'customer_schedule':
        return getCustomerScheduleHTML();
      case 'customer_boarding':
        return getCustomerBoardingHTML();
      case 'staff_boarding':
        return staffDocumentHTML || '<div>스탭용 문서를 생성 중입니다...</div>';
      case 'room_assignment':
        return roomAssignmentHTML || '<div>객실 배정표를 생성 중입니다...</div>';
      case 'room_assignment_staff':
        return roomAssignmentStaffHTML || '<div>객실 배정표를 생성 중입니다...</div>';
      case 'customer_timetable':
        return teeTimeCustomerHTML || '<div>티타임표를 생성 중입니다...</div>';
      case 'staff_timetable':
        return teeTimeStaffHTML || '<div>티타임표를 생성 중입니다...</div>';
      case 'simplified':
        return getSimplifiedScheduleHTML();
      default:
        return getCustomerScheduleHTML();
    }
  };

  // 고객용 일정표 HTML
  const getCustomerScheduleHTML = () => {
    const notices = documentNotices.customer_schedule || [];
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 고객용 일정표</title>
  <style>
    ${getCustomerScheduleStyles()}
  </style>
</head>
<body>
  <div class="container">
    <!-- 헤더 -->
    <div class="header">
      <div class="logo">싱싱골프투어</div>
      <div class="company-info">
        수원시 영통구 법조로149번길 200<br>
        고객센터 TEL 031-215-3990
      </div>
    </div>
    
    <!-- 상품 정보 -->
    <div class="section">
      <div class="section-title">상품 정보</div>
      <div class="product-info-box">
        <div class="info-row">
          <div class="info-label">상품명</div>
          <div class="info-value important">${tourData.title}</div>
        </div>
        <div class="info-row">
          <div class="info-label">일정</div>
          <div class="info-value important">
            ${new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
            ${new Date(tourData.end_date).toLocaleDateString('ko-KR')}
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">골프장</div>
          <div class="info-value">
            ${productData?.golf_course || ''}
          </div>
        </div>
        ${productData?.courses?.length > 0 ? `
        <div class="info-row">
          <div class="info-label">코스</div>
          <div class="info-value">${productData.courses.join(', ')}</div>
        </div>
        ` : ''}
        <div class="info-row">
          <div class="info-label">숙소</div>
          <div class="info-value">${productData?.hotel || ''}</div>
        </div>
        <div class="info-row">
          <div class="info-label">포함사항</div>
          <div class="info-value">${productData?.included_items || ''}</div>
        </div>
        <div class="info-row">
          <div class="info-label">불포함사항</div>
          <div class="info-value">${productData?.excluded_items || ''}</div>
        </div>
      </div>
    </div>

    <!-- 특별 공지사항 (투어) -->
    ${tourData.special_notices && tourData.special_notices.length > 0 ? `
      <div class="section">
        <div class="section-title">특별 공지사항</div>
        <div class="notice-box">
          <ul class="notice-list">
            ${tourData.special_notices.map((notice: any) => 
              `<li>${notice.content || notice}</li>`
            ).join('') || ''}
          </ul>
        </div>
      </div>
    ` : ''}

    <!-- 일반 공지사항 (여행상품) -->
    ${productData?.general_notices && productData.general_notices.length > 0 ? `
      <div class="section">
        <div class="section-title">예약 안내 사항</div>
        <div class="notice-box">
          <ul class="notice-list">
            ${productData.general_notices.map((notice: any) => `
              <li>${notice.content || notice}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    ` : productData?.usage_round || productData?.usage_hotel || productData?.usage_meal || productData?.usage_bus || productData?.usage_tour || productData?.usage_locker ? `
      <div class="section">
        <div class="section-title">예약 안내 사항</div>
        <div class="notice-box">
          <ul class="notice-list">
            ${productData.usage_round ? `<li>라운딩 규정: ${productData.usage_round}</li>` : ''}
            ${productData.usage_hotel ? `<li>숙소 이용: ${productData.usage_hotel}</li>` : ''}
            ${productData.usage_meal ? `<li>식사 안내: ${productData.usage_meal}</li>` : ''}
            ${productData.usage_locker ? `<li>락카 이용: ${productData.usage_locker}</li>` : ''}
            ${productData.usage_bus ? `<li>버스 이용: ${productData.usage_bus}</li>` : ''}
            ${productData.usage_tour ? `<li>관광지 투어: ${productData.usage_tour}</li>` : ''}
          </ul>
        </div>
      </div>
    ` : ''}

    <!-- 예약 안내사항 (투어) -->
    ${tourData.reservation_notices?.length > 0 ? `
      <div class="section">
        <div class="section-title">예약 안내사항</div>
        <div class="reservation-box">
          <ul class="reservation-list">
            ${tourData.reservation_notices.map((notice: any) => `
              <li>${notice.title}: ${notice.content}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    ` : ''}
    
    <!-- 일정 안내 -->
    <div class="section">
      <div class="section-title">일정 안내</div>
      <div class="schedule-section" style="padding-top: 5px;">
        ${tourData.schedules?.map((schedule: any, idx: number) => `
          <div class="day-schedule">
            <div class="day-title">
              <div>Day ${idx + 1} - ${new Date(schedule.date || schedule.schedule_date).toLocaleDateString('ko-KR')}</div>
              <div class="day-round">${schedule.title || ''}</div>
            </div>
            <div class="day-content">
              <div class="schedule-content">
                ${schedule.schedule_items?.length > 0 ? `
                  <div class="schedule-timeline">
                    ${schedule.schedule_items.map((item: any) => {
                      // 아이콘 결정
                      let icon = '';
                      let iconClass = '';
                      const content = item.content.toLowerCase();
                      
                      if (content.includes('탑승') || content.includes('출발')) {
                        icon = '🚌';
                        iconClass = 'departure';
                      } else if (content.includes('이동') || content.includes('경유')) {
                        icon = '🚗';
                        iconClass = 'transit';
                      } else if (content.includes('라운드') || content.includes('골프')) {
                        icon = '⛳';
                        iconClass = 'golf';
                      } else if (content.includes('조식') || content.includes('아침')) {
                        icon = '🌅';
                        iconClass = 'meal';
                      } else if (content.includes('중식') || content.includes('점심')) {
                        icon = '🍴';
                        iconClass = 'meal';
                      } else if (content.includes('석식') || content.includes('저녁')) {
                        icon = '🌙';
                        iconClass = 'meal';
                      } else if (content.includes('휴식') || content.includes('자유')) {
                        icon = '🏨';
                        iconClass = 'rest';
                      } else if (content.includes('도착')) {
                        icon = '📍';
                        iconClass = 'arrival';
                      } else if (content.includes('마트') || content.includes('쇼핑')) {
                        icon = '🛒';
                        iconClass = 'shopping';
                      } else if (content.includes('관광') || content.includes('투어')) {
                        icon = '🏛️';
                        iconClass = 'tour';
                      } else {
                        icon = '•';
                        iconClass = 'default';
                      }
                      
                      return `
                        <div class="timeline-item ${iconClass}">
                          <div class="timeline-icon">${icon}</div>
                          <div class="timeline-content">
                            ${item.time ? `<span class="timeline-time">${item.time}</span>` : ''}
                            <span class="timeline-text">${item.content}</span>
                            ${item.attraction_data ? `
                              <div class="attraction-detail">
                                ${item.attraction_data.main_image_url || item.attraction_data.image_urls?.[0] ? `
                                  <img src="${item.attraction_data.main_image_url || item.attraction_data.image_urls[0]}" alt="${item.attraction_data.name}" class="attraction-thumb" />
                                ` : ''}
                                <div class="attraction-info">
                                  <p class="attraction-desc">${item.attraction_data.description}</p>
                                  ${item.attraction_data.features?.length > 0 ? `
                                    <div class="attraction-features">
                                      ${item.attraction_data.features.map((feature: string) => `<span class="feature-tag">${feature}</span>`).join('')}
                                    </div>
                                  ` : ''}
                                  ${item.attraction_data.address ? `<p class="attraction-addr">📍 ${item.attraction_data.address}</p>` : ''}
                                  ${item.attraction_data.recommended_duration ? `<p class="attraction-duration">추천 체류시간: ${item.attraction_data.recommended_duration}분</p>` : ''}
                                </div>
                              </div>
                            ` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : schedule.description ? `<p class="schedule-description">${schedule.description}</p>` : ''}
              </div>
              
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
              ${(schedule.meal_breakfast && schedule.menu_breakfast) || 
                (schedule.meal_lunch && schedule.menu_lunch) || 
                (schedule.meal_dinner && schedule.menu_dinner) ? `
              <div class="meal-menu-section">
                <div class="meal-menu-title">식사 메뉴</div>
                ${schedule.meal_breakfast && schedule.menu_breakfast ? `<div class="meal-menu-item">조식: ${schedule.menu_breakfast}</div>` : ''}
                ${schedule.meal_lunch && schedule.menu_lunch ? `<div class="meal-menu-item">중식: ${schedule.menu_lunch}</div>` : ''}
                ${schedule.meal_dinner && schedule.menu_dinner ? `<div class="meal-menu-item">석식: ${schedule.menu_dinner}</div>` : ''}
              </div>
              ` : ''}
            </div>
          </div>
        `).join('') || ''}
      </div>
    </div>

    <!-- 이용 안내 (여행상품) -->
    ${productData?.usage_round || productData?.usage_hotel || productData?.usage_meal || productData?.usage_bus || productData?.usage_tour || productData?.usage_locker ? `
      <div class="section">
        <div class="section-title">이용 안내</div>
        <div class="usage-section">
          ${productData.usage_round ? `
            <div class="usage-item">
              <div class="usage-header">라운딩 규정</div>
              <div class="usage-content">${formatTextWithBold(productData.usage_round)}</div>
            </div>
          ` : ''}
          ${productData.usage_hotel ? `
            <div class="usage-item">
              <div class="usage-header">숙소 이용</div>
              <div class="usage-content">${formatTextWithBold(productData.usage_hotel)}</div>
            </div>
          ` : ''}
          ${productData.usage_meal ? `
            <div class="usage-item">
              <div class="usage-header">식사 안내</div>
              <div class="usage-content">${formatTextWithBold(productData.usage_meal)}</div>
            </div>
          ` : ''}
          ${productData.usage_locker ? `
            <div class="usage-item">
              <div class="usage-header">락카 이용</div>
              <div class="usage-content">${formatTextWithBold(productData.usage_locker)}</div>
            </div>
          ` : ''}
          ${productData.usage_bus ? `
            <div class="usage-item">
              <div class="usage-header">버스 이용</div>
              <div class="usage-content">${formatTextWithBold(productData.usage_bus)}</div>
            </div>
          ` : ''}
          ${productData.usage_tour ? `
            <div class="usage-item">
              <div class="usage-header">관광지 투어</div>
              <div class="usage-content">${formatTextWithBold(productData.usage_tour)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <!-- 기타 안내문구 -->
    ${tourData.other_notices ? `
      <div class="other-notice">
        ${tourData.other_notices}
      </div>
    ` : ''}
    
    <div class="footer">
      <p>♡ 즐거운 하루 되시길 바랍니다. ♡</p>
      <p>싱싱골프투어 ☎ 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 고객용 탑승안내서 HTML
  const getCustomerBoardingHTML = () => {
    const notices = documentNotices.customer_boarding || [];
    
    // 도착 시간 계산 함수
    const getArrivalTime = (departureTime: string) => {
      if (!departureTime || departureTime === '미정') return '미정';
      const [hour, minute] = departureTime.split(':').map(Number);
      const arrivalHour = hour + 1;
      return `${arrivalHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 탑승 안내</title>
  <style>
    ${getBoardingGuideStyles()}
  </style>
</head>
<body>
  <div class="container">
    ${/* 헤더 하나로 통합 */''}
    <div class="route-section">
      <div class="route-header-box">
        <div class="route-header-title">싱싱골프투어</div>
        <div class="route-header-subtitle">${tourData.title}</div>
        <div class="route-header-date">${tourData.start_date && tourData.end_date ? `${new Date(tourData.start_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }).replace('. ', '/').replace('.', '')}(${['일','월','화','수','목','금','토'][new Date(tourData.start_date).getDay()]})~${new Date(tourData.end_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }).replace('. ', '/').replace('.', '')}(${['일','월','화','수','목','금','토'][new Date(tourData.end_date).getDay()]})` : ''}</div>
      </div>
      <div class="boarding-cards">
        ${tourBoardingPlaces.map((place: any, index: number) => {
          const boardingPlace = place.boarding_place;
          if (!boardingPlace) return '';
          const departureTime = place.departure_time ? place.departure_time.slice(0, 5) : '미정';
          const hour = departureTime !== '미정' ? parseInt(departureTime.split(':')[0]) : 0;
          const timePrefix = hour < 12 ? '오전' : '오후';
          const displayHour = hour > 12 ? hour - 12 : hour;
          const displayTime = departureTime !== '미정' ? `${displayHour}:${departureTime.split(':')[1]}` : '미정';
          
          // 관광지 이미지 표시 (제거)
          
          return `
          <div class="boarding-card route-stop">
            <div class="card-border"></div>
            <div class="card-content">
              <div class="route-header">
                <div class="route-number">${index + 1}</div>
                <div class="route-info-main">
                  <div class="card-title">
                    <span class="location-name">${boardingPlace.name}</span>
                    <span class="location-type">(${boardingPlace.district || '탑승지'})</span>
                  </div>
                  <div class="time-wrapper">
                    <span class="time-prefix" style="font-size: inherit;">${timePrefix}</span>
                    <span class="card-time">${displayTime}</span>
                  </div>
                  <div class="card-date">${new Date(tourData.start_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }).replace('. ', '월 ').replace('.', '일')} (${['일','월','화','수','목','금','토'][new Date(tourData.start_date).getDay()]})</div>
                </div>
              </div>
              
              <div class="card-info">
                <div class="info-parking">주차: ${boardingPlace.parking_info || '무료'}</div>
                <div class="info-arrival">${place.arrival_time ? place.arrival_time.slice(0, 5) : getArrivalTime(place.departure_time)} 도착</div>
              </div>
              
              ${boardingPlace.boarding_main || boardingPlace.boarding_sub || boardingPlace.parking_main ? `
                <div class="location-info">
                  ${boardingPlace.boarding_main ? `
                    <div class="location-section">
                      <p class="location-title">📍 버스탑승지</p>
                      <p class="location-main">${boardingPlace.boarding_main}</p>
                      ${boardingPlace.boarding_sub ? `<p class="location-sub">${boardingPlace.boarding_sub}</p>` : ''}
                    </div>
                  ` : ''}
                  
                  ${boardingPlace.parking_main ? `
                    <div class="location-section">
                      <p class="location-title">📍 주차장 오는길</p>
                      <p class="location-main">${boardingPlace.parking_main}</p>
                      ${boardingPlace.parking_map_url ? `
                        <a href="${boardingPlace.parking_map_url}" class="map-link" target="_blank">네이버 지도에서 보기</a>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          `;
        }).join('')}
        
        ${tourWaypoints.map((waypoint: any, waypointIndex: number) => {
          const orderNumber = tourBoardingPlaces.length + waypointIndex + 1;
          const isRestStop = waypoint.waypoint_name?.includes('휴게소');
          const isTourist = waypoint.waypoint_name?.includes('송광사') || waypoint.waypoint_name?.includes('관광') || waypoint.waypoint_name?.includes('사찰');
          
          // 날짜 표시
          const waypointDate = waypoint.visit_date ? new Date(waypoint.visit_date) : null;
          const startDate = new Date(tourData.start_date);
          const dayNumber = waypointDate ? Math.floor((waypointDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
          
          const waypointTime = waypoint.waypoint_time ? waypoint.waypoint_time.slice(0, 5) : '미정';
          const hour = waypointTime !== '미정' ? parseInt(waypointTime.split(':')[0]) : 0;
          const timePrefix = hour < 12 ? '오전' : '오후';
          const displayHour = hour > 12 ? hour - 12 : hour;
          const displayTime = waypointTime !== '미정' ? `${displayHour}:${waypointTime.split(':')[1]}` : '미정';
          
          // 아이콘 설정
          const icon = isRestStop ? '☕' : isTourist ? '🏛️' : '📍';
          
          return `
          <div class="boarding-card waypoint-stop">
            <div class="card-border ${isRestStop ? 'rest-stop' : isTourist ? 'tourist-stop' : ''}"></div>
            <div class="card-content">
              ${waypoint.attraction_data?.main_image_url || waypoint.attraction_data?.image_urls?.[0] ? `
                <div class="attraction-image-container">
                  <img src="${waypoint.attraction_data.main_image_url || waypoint.attraction_data.image_urls[0]}" alt="${waypoint.waypoint_name}" class="attraction-image" />
                </div>
              ` : ''}
              <div class="route-header">
                <div class="route-number ${isRestStop ? 'rest' : isTourist ? 'tourist' : ''}">${orderNumber}</div>
                <div class="route-info-main">
                  <div class="card-title">
                    <span class="waypoint-icon">${icon}</span>
                    <span class="location-name">${waypoint.waypoint_name}</span>
                  </div>
                  <div class="time-wrapper">
                    <span class="time-prefix" style="font-size: inherit;">${timePrefix}</span>
                    <span class="card-time waypoint-time">${displayTime}</span>
                  </div>
                  ${waypointDate ? `<div class="card-date">${waypointDate.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }).replace('. ', '월 ').replace('.', '일')} (${['일','월','화','수','목','금','토'][waypointDate.getDay()]})</div>` : ''}
                </div>
              </div>
              
              <div class="waypoint-info">
                <div class="waypoint-duration">정차시간: 약 ${waypoint.waypoint_duration || waypoint.attraction_data?.recommended_duration || 30}분</div>
                ${waypoint.waypoint_description ? `<div class="waypoint-desc">${waypoint.waypoint_description}</div>` : ''}
                ${waypoint.attraction_data ? `
                  <div class="attraction-info">
                    ${waypoint.attraction_data.description ? `<div class="attraction-desc">${waypoint.attraction_data.description}</div>` : ''}
                    ${waypoint.attraction_data.features?.length > 0 ? `
                      <div class="attraction-features">
                        ${waypoint.attraction_data.features.map((feature: string) => `<span class="feature-tag">${feature}</span>`).join('')}
                      </div>
                    ` : ''}
                    ${waypoint.attraction_data.address ? `<div class="attraction-address">📍 ${waypoint.attraction_data.address}</div>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <div class="common-info">
      ${documentFooters.boarding_guide?.['탑승 주의사항'] ? `
        <h3 class="section-title">탑승 주의사항</h3>
        <ul class="notice-list">
          ${documentFooters.boarding_guide['탑승 주의사항'].split('\n').map((line: string) => `
            <li class="notice-item">${line.replace('•', '').trim()}</li>
          `).join('')}
        </ul>
      ` : ''}
      
      ${tourData.staff?.length > 0 ? `
        <div class="contact-box">
          <div class="contact-title">비상 연락처</div>
          ${tourData.staff.map((staff: any) => `
            <div class="contact-phone">${staff.name} ${staff.role} - ${staff.phone}</div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>즐거운 골프 여행 되시길 바랍니다</p>
      <p>싱싱골프투어 | 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 간편 일정표 HTML
  const getSimplifiedScheduleHTML = () => {
    const notices = documentNotices.simplified || [];
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 간편 일정표</title>
  <style>
    ${getSimplifiedStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${tourData.title}</h1>
      <p>${new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(tourData.end_date).toLocaleDateString('ko-KR')}</p>
    </div>
    
    <div class="quick-info">
      <div class="info-item">
        <div>
          <strong>⛳ 골프장</strong>
          <p>${productData?.golf_course || ''}</p>
        </div>
      </div>
      <div class="info-item">
        <div>
          <strong>🏨 숙소</strong>
          <p>${productData?.hotel || ''}</p>
        </div>
      </div>
    </div>
    
    <div class="schedule-summary">
      ${tourData.schedules?.map((schedule: any, index: number) => `
        <div class="day-summary">
          <div class="day-header">Day ${schedule.day_number || (index + 1)} - ${new Date(schedule.date || schedule.schedule_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' })}</div>
          <div class="day-subtitle">Day ${schedule.day_number || (index + 1)} 일정</div>

          <div class="main-events">
            ${(schedule.schedule_items || schedule.tour_schedule_items)?.map((item: any) => `
              <div class="event">${item.time ? item.time + ' ' : ''}${item.content}</div>
            `).join('') || ''}
          </div>
        </div>
      `).join('') || ''}
    </div>
    
    ${notices.length > 0 ? `
      <div class="notices">
        ${notices.map((notice: any) => `
          <p>${notice.content}</p>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="footer">
      <p>싱싱골프투어 ☎ 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 객실 배정표 HTML 생성
  const generateRoomAssignmentHTML = (assignments: any[], rooms: any[], tourStaff: any, isStaff: boolean = false) => {
    // 참가자를 room_id로 그룹화
    const participantsByRoom = assignments.reduce((acc, participant) => {
      const roomId = participant.room_id;
      if (!roomId) return acc;
      if (!acc[roomId]) acc[roomId] = [];
      acc[roomId].push(participant);
      return acc;
    }, {} as Record<string, any[]>);

    // 객실 정보를 ID로 매핑
    const roomsMap = rooms.reduce((acc, room) => {
      acc[room.id] = room;
      return acc;
    }, {} as Record<string, any>);

    const notices = documentNotices.room_assignment || [];
    
    // 스탭용일 때 기사님 정보 표시
    const driverInfo = isStaff && tourStaff ? {
      name: tourStaff.name,
      phone: tourStaff.phone,
      room: tourStaff.room_number || '별도 배정'
    } : null;

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 객실 배정표${isStaff ? ' (스탭용)' : ''}</title>
  <style>
    ${getRoomAssignmentStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>객실 배정표${isStaff ? ' (스탭용)' : ''}</h1>
      <p>${tourData.title}</p>
    </div>
    
    <div class="content">
      ${rooms.sort((a, b) => {
        // room_number가 있으면 그걸로 정렬, 없으면 room_seq로 정렬
        if (a.room_number && b.room_number) {
          return a.room_number.localeCompare(b.room_number, 'ko', { numeric: true });
        }
        return (a.room_seq || 0) - (b.room_seq || 0);
      }).map(room => {
        const roomParticipants = participantsByRoom[room.id] || [];
        const isEmpty = roomParticipants.length === 0;
        const isCompRoom = room.room_type?.includes('콤프') || room.room_type?.includes('COMP') || room.is_comp;
        
        return `
        <div class="room-card ${isCompRoom ? 'comp-room' : ''}">
          <div class="room-header ${isCompRoom ? 'comp-header' : ''}">
            <span class="room-number">${room.room_number || `객실 ${room.room_seq || ''}`}</span>
            <span class="room-type">${room.room_type}${isCompRoom && isStaff ? ' (콤프)' : ''}</span>
            <span class="room-capacity">${roomParticipants.length}/${room.capacity}명</span>
          </div>
          <div class="room-body">
            ${isEmpty ? `
              <div class="empty-room">빈 객실</div>
            ` : `
              <table class="participant-table">
                <thead>
                  <tr>
                    ${isStaff ? '<th width="30">No</th>' : '<th width="40">No</th>'}
                    <th>성명</th>
                    ${isStaff ? '<th width="110">연락처</th>' : ''}
                    <th width="80">팀</th>
                    ${isStaff ? '<th width="100">비고</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${roomParticipants.map((participant: any, index: number) => `
                    <tr>
                      <td class="text-center">${index + 1}</td>
                      <td class="text-center">${participant.name}</td>
                      ${isStaff ? `<td class="text-center">${participant.phone || '-'}</td>` : ''}
                      <td class="text-center">${participant.team_name || '-'}</td>
                      ${isStaff ? `<td class="text-center">${participant.special_notes || '-'}</td>` : ''}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>
        `;
      }).join('')}
    </div>
    
    ${isStaff && driverInfo ? `
    <div class="internal-info">
      <h3>기사님 정보</h3>
      <p><strong>성명:</strong> ${driverInfo.name}</p>
      <p><strong>연락처:</strong> ${driverInfo.phone || '-'}</p>
      <p><strong>객실:</strong> ${driverInfo.room}</p>
    </div>
    ` : ''}
    
    ${isStaff ? `
    <div class="internal-info">
      <p style="color: #e74c3c; font-weight: bold;">※ 콤프룸은 붉은색으로 표시되어 있습니다.</p>
      <p>※ 이 문서는 내부용으로 고객에게 제공하지 마세요.</p>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
  };

  // 티타임표 HTML 생성
  const generateTeeTimeHTML = (teeTimes: any[], isStaff: boolean = false) => {
    const teeTimesByDate = teeTimes.reduce((acc, teeTime) => {
      const date = teeTime.date || teeTime.play_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(teeTime);
      return acc;
    }, {});

    const notices = documentNotices.tee_time || [];

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 티타임 안내</title>
  <style>
    ${isStaff ? getStaffTeeTimeStyles() : getTeeTimeStyles()}
  </style>
</head>
<body>
  <div class="container">
    ${isStaff ? `
    <!-- 내부용 헤더 섹션 -->
    <div class="header-container">
      <div class="header-content">
        <div class="title-section">
          <h1>티타임표</h1>
          <p class="subtitle">${tourData.title} / ${tourData.tour_period || `${new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(tourData.end_date).toLocaleDateString('ko-KR')}`}</p>
        </div>
        <div class="logo-section">
          <div class="logo-text">싱싱골프투어</div>
        </div>
      </div>
    </div>
    
    <!-- 전체 통계 -->
    <div class="stats-container">
      ${Object.entries(teeTimesByDate).map(([date, times]: [string, any]) => {
        const totalPlayers = times.reduce((sum: number, tt: any) => {
          const playerCount = tt.singsing_tee_time_players ? tt.singsing_tee_time_players.length : 0;
          return sum + playerCount;
        }, 0);
        const totalCapacity = times.reduce((sum: number, tt: any) => sum + (tt.max_players || 4), 0);
        
        return `
          <div class="stat-card">
            <div class="stat-title">${new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</div>
            <div class="stat-value">${totalPlayers}/${totalCapacity}</div>
            <div class="stat-detail">티타임 ${times.length}개</div>
          </div>
        `;
      }).join('')}
    </div>
    ` : `
    <!-- 헤더 -->
    <div class="header">
      <h1>${tourData.title}</h1>
      <p>${tourData.tour_period || `${new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(tourData.end_date).toLocaleDateString('ko-KR')}`}</p>
    </div>
    `}
    
    ${Object.entries(teeTimesByDate).map(([date, times]: [string, any]) => {
      if (isStaff) {
        // 내부용 스타일
        const dateStr = new Date(date).toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long' 
        });
        
        // 코스별로 그룹화
        const courseGroups = times.reduce((acc: any, teeTime: any) => {
          const course = teeTime.golf_course || teeTime.course || '미지정';
          if (!acc[course]) acc[course] = [];
          acc[course].push(teeTime);
          return acc;
        }, {} as Record<string, typeof times>);
        
        return `
          <div class="day-header">${dateStr}</div>
          <div class="table-container">
            ${Object.entries(courseGroups).map(([course, courseTimes]: [string, any]) => {
              // 코스별 헤더 클래스 결정
              let headerClass = 'course-header course-header-default';
              if (course.includes('레이크') || course.includes('Lake') || course.includes('lake')) {
                headerClass = 'course-header course-header-lake';
              } else if (course.includes('파인') || course.includes('Pine') || course.includes('pine')) {
                headerClass = 'course-header course-header-pine';
              } else if (course.includes('힐스') || course.includes('Hills') || course.includes('hills')) {
                headerClass = 'course-header course-header-hills';
              } else if (course.includes('밸리') || course.includes('Valley') || course.includes('valley')) {
                headerClass = 'course-header course-header-valley';
              } else if (course.includes('오션') || course.includes('Ocean') || course.includes('ocean')) {
                headerClass = 'course-header course-header-ocean';
              }
              
              // 코스명 표시 함수 (골프장 이름 제거)
              const formatCourseDisplay = (courseName: string) => {
                if (!courseName) return '';
                if (courseName.includes(' - ')) {
                  return courseName.split(' - ')[1] || courseName;
                }
                return courseName;
              };
              
              return `
                <table>
                  <tr>
                    <td colspan="4" class="${headerClass}">${formatCourseDisplay(course)}</td>
                  </tr>
                  <tr>
                    <th>시간</th>
                    <th>코스</th>
                    <th>팀</th>
                    <th>플레이어</th>
                  </tr>
                  ${courseTimes.map((teeTime: any) => {
                    const players = teeTime.singsing_tee_time_players || [];
                    const sortedPlayers = players.sort((a: any, b: any) => (a.order_no || 0) - (b.order_no || 0));
                    const formattedTime = teeTime.tee_time ? teeTime.tee_time.substring(0, 5) : '';
                    
                    if (sortedPlayers.length === 0) {
                      return `
                        <tr>
                          <td class="time-column">${formattedTime}</td>
                          <td class="course-column">${formatCourseDisplay(teeTime.course || teeTime.golf_course)}</td>
                          <td class="team-column">-</td>
                          <td class="player-cell">배정된 참가자가 없습니다</td>
                        </tr>
                      `;
                    } else {
                      // 팀 성별 분석
                      const teamGenderAnalysis = () => {
                        const maleCount = sortedPlayers.filter((p: any) => 
                          p.singsing_participants?.gender === 'M' || p.singsing_participants?.gender === '남'
                        ).length;
                        const femaleCount = sortedPlayers.filter((p: any) => 
                          p.singsing_participants?.gender === 'F' || p.singsing_participants?.gender === '여'
                        ).length;
                        
                        if (maleCount > 0 && femaleCount > 0) return '(혼성팀)';
                        if (maleCount > 0) return '(남성팀)';
                        if (femaleCount > 0) return '(여성팀)';
                        return '';
                      };
                      
                      const teamGenderType = teamGenderAnalysis();
                      
                      // 참가자 이름을 한 줄로 표시
                      const playerNames = sortedPlayers.map((p: any) => {
                        const participant = p.singsing_participants;
                        if (!participant) return '';
                        
                        const genderSuffix = participant.gender ? 
                          (participant.gender === 'M' || participant.gender === '남' ? '(남)' : '(여)') : '';
                        
                        if (genderSuffix) {
                          if (participant.gender === 'M' || participant.gender === '남') {
                            return `<span class="male">${participant.name}${genderSuffix}</span>`;
                          } else {
                            return `<span class="female">${participant.name}${genderSuffix}</span>`;
                          }
                        }
                        return participant.name;
                      }).join(' · ');
                      
                      return `
                        <tr>
                          <td class="time-column">${formattedTime}</td>
                          <td class="course-column">${formatCourseDisplay(teeTime.course || teeTime.golf_course)}</td>
                          <td class="team-column">${teamGenderType}</td>
                          <td class="player-cell">${playerNames}</td>
                        </tr>
                      `;
                    }
                  }).join('')}
                </table>
              `;
            }).join('')}
          </div>
        `;
      } else {
        // 고객용 버전
        const dateStr = new Date(date).toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long' 
        });
        
        // 코스별로 그룹화
        const courseGroups = times.reduce((acc: any, teeTime: any) => {
          const course = teeTime.golf_course || teeTime.course || '미지정';
          if (!acc[course]) acc[course] = [];
          acc[course].push(teeTime);
          return acc;
        }, {} as Record<string, typeof times>);
        
        // 코스명 표시 함수 (골프장 이름 제거)
        const formatCourseDisplay = (courseName: string) => {
          if (!courseName) return '';
          if (courseName.includes(' - ')) {
            return courseName.split(' - ')[1] || courseName;
          }
          return courseName;
        };
        
        return `
          <div class="schedule-card">
            <div class="date-header">${dateStr}</div>
            
            ${Object.entries(courseGroups).map(([course, courseTimes]: [string, any]) => `
              <div class="tee-time-table" style="margin-bottom: 16px;">
                <div class="tee-time-header">${formatCourseDisplay(course)}</div>
                ${courseTimes.map((teeTime: any) => {
                  const players = teeTime.singsing_tee_time_players || [];
                  const sortedPlayers = players.sort((a: any, b: any) => (a.order_no || 0) - (b.order_no || 0));
                  const formattedTime = teeTime.tee_time ? teeTime.tee_time.substring(0, 5) : '';
                  
                  if (sortedPlayers.length === 0) {
                    return '';
                  }
                  
                  // 참가자 이름 (성별 표시 제거)
                  const playerNames = sortedPlayers.map((p: any) => {
                    const participant = p.singsing_participants;
                    return participant ? participant.name : '';
                  }).filter(name => name).join(', ');
                  
                  return `
                    <div class="tee-time-row">
                      <div class="time-box">${formattedTime}</div>
                      <div class="players-info">
                        <div class="player-names">${playerNames}</div>
                        <div class="player-count">${sortedPlayers.length}명</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </div>
        `;
      }
    }).join('')}
    
    ${!isStaff ? `
    <!-- 연락처 정보 -->
    ${tourData.show_company_phones && (tourData.company_phone || tourData.company_mobile) ? `
    <div class="contact-section">
      <div class="contact-title">문의처</div>
      <div class="contact-grid">
        ${tourData.company_phone ? `
          <div class="contact-card">
            <div class="contact-name">싱싱골프투어</div>
            <a href="tel:${tourData.company_phone}" class="contact-phone">${tourData.company_phone}</a>
          </div>
        ` : ''}
        ${tourData.company_mobile ? `
          <div class="contact-card">
            <div class="contact-name">담당자</div>
            <a href="tel:${tourData.company_mobile}" class="contact-phone">${tourData.company_mobile}</a>
          </div>
        ` : ''}
      </div>
    </div>
    ` : ''}
    
    <!-- 안내사항 -->
    ${tourData.notices ? `
    <div class="info-section">
      <div class="info-title">안내사항</div>
      <ul class="info-list">
        ${tourData.notices.split('\n').map((notice: string) => 
          notice.trim() ? `<li>${notice.replace(/^[•·\-]\s*/, '')}</li>` : ''
        ).join('')}
      </ul>
    </div>
    ` : ''}
    
    <!-- 푸터 -->
    <div class="footer">
      <div class="footer-message">${tourData.footer_message || '즐거운 라운딩 되세요!'}</div>
      <div class="footer-brand">싱싱골프투어</div>
    </div>
    ` : ''}
    
    ${isStaff ? `
    <!-- 비상 연락처 (기사님만) -->
    ${tourData.staff?.filter((staff: any) => staff.role.includes('기사')).length > 0 ? `
    <div class="contact-info">
      <div class="contact-title">비상 연락처</div>
      <div class="contact-grid">
        ${tourData.staff.filter((staff: any) => staff.role.includes('기사')).map((staff: any) => `
          <div class="contact-item">
            <div class="contact-name">${staff.name} ${staff.role}</div>
            ${staff.phone ? `<div class="contact-phone">${staff.phone}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <!-- 푸터 -->
    <div class="footer">
      <div class="footer-message">♡ 즐거운 라운딩 되세요! ♡</div>
      <div class="footer-detail">싱싱골프투어와 함께하는 특별한 하루</div>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
  };

  // 스탭용 탑승안내서 HTML 생성
  const generateStaffHTML = (participants: any[]) => {
    // 탑승지별로 참가자 그룹화
    const participantsByLocation = participants.reduce((acc, participant) => {
      const location = participant.pickup_location || '미정';
      if (!acc[location]) acc[location] = [];
      acc[location].push(participant);
      return acc;
    }, {} as Record<string, any[]>);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 스탭용 탑승명단</title>
  <style>
    ${getStaffDocumentStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>스탭용 탑승명단</h1>
      <p>${tourData.title}</p>
      <p>${new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(tourData.end_date).toLocaleDateString('ko-KR')}</p>
    </div>

    <div class="summary">
      <p>총 참가자: ${participants.length}명</p>
    </div>

    ${Object.entries(participantsByLocation).map(([location, locationParticipants]) => {
      const participants = locationParticipants as any[];
      return `
      <div class="location-section">
        <h2>${location} (${participants.length}명)</h2>
        <table class="participant-table">
          <thead>
            <tr>
              <th width="40">No</th>
              <th width="80">성명</th>
              <th width="120">연락처</th>
              <th width="100">팀</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            ${participants.map((participant: any, index: number) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${participant.name}</td>
                <td class="text-center">${participant.phone}</td>
                <td class="text-center">${participant.team_name || '-'}</td>
                <td>${participant.special_notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    }).join('')}

    ${tourData.staff?.length > 0 ? `
      <div class="staff-info">
        <h3>스탭 정보</h3>
        ${tourData.staff.map((staff: any) => `
          <p>${staff.role}: ${staff.name} (${staff.phone})</p>
        `).join('')}
      </div>
    ` : ''}
  </div>
</body>
</html>`;
  };

  // 스타일 함수들
  const getCustomerScheduleStyles = () => {
    return `
      body {
        margin: 0;
        padding: 0;
        font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #333;
        font-size: 14px;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
      }
      
      .header {
        text-align: center;
        padding-bottom: 30px;
        border-bottom: 3px solid #2c5282;
        margin-bottom: 30px;
      }
      
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #2c5282;
        margin-bottom: 10px;
      }
      
      .company-info {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
      
      .section {
        margin-bottom: 30px;
      }
      
      .section-title {
        font-size: 18px;
        font-weight: bold;
        color: #2c5282;
        padding: 10px;
        background: #e7f3ff;
        margin-bottom: 15px;
        border-left: 4px solid #2c5282;
      }
      
      .product-info-box {
        border: 1px solid #ddd;
        padding: 0;
      }
      
      .info-row {
        display: flex;
        border-bottom: 1px solid #eee;
      }
      
      .info-row:last-child {
        border-bottom: none;
      }
      
      .info-label {
        width: 120px;
        padding: 12px;
        background: #f8f9fa;
        font-weight: bold;
        color: #555;
        border-right: 1px solid #eee;
      }
      
      .info-value {
        flex: 1;
        padding: 12px;
      }
      
      .info-value.important {
        font-weight: bold;
        color: #2c5282;
      }
      
      .notice-box, .reservation-box {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 5px;
      }
      
      .notice-list, .reservation-list {
        margin: 0;
        padding-left: 20px;
      }
      
      .notice-list li, .reservation-list li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
      
      .schedule-section {
        padding: 0;
      }
      
      .day-schedule {
        margin-bottom: 25px;
        border: 1px solid #ddd;
        border-radius: 5px;
        overflow: hidden;
      }
      
      .day-title {
        background: #2c5282;
        color: white;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }
      
      .day-round {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .day-content {
        padding: 20px;
      }
      
      .schedule-content {
        margin-bottom: 20px;
      }
      
      .schedule-timeline {
        padding-left: 20px;
      }
      
      .timeline-item {
        position: relative;
        padding: 10px 0;
        padding-left: 40px;
        min-height: 40px;
      }
      
      .timeline-icon {
        position: absolute;
        left: 0;
        top: 10px;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        background: #f0f0f0;
        border-radius: 50%;
      }
      
      .timeline-item.departure .timeline-icon { background: #e3f2fd; }
      .timeline-item.golf .timeline-icon { background: #e8f5e9; }
      .timeline-item.meal .timeline-icon { background: #fff3e0; }
      .timeline-item.rest .timeline-icon { background: #f3e5f5; }
      .timeline-item.tour .timeline-icon { background: #fce4ec; }
      
      .timeline-content {
        line-height: 1.6;
      }
      
      .timeline-time {
        font-weight: bold;
        color: #2c5282;
        margin-right: 10px;
      }
      
      .timeline-text {
        color: #333;
      }
      
      /* 관광지 정보 스타일 */
      .attraction-detail {
        margin-top: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }
      
      .attraction-thumb {
        width: 100%;
        max-width: 400px;
        height: auto;
        border-radius: 8px;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .attraction-info {
        font-size: 13px;
      }
      
      .attraction-desc {
        color: #555;
        line-height: 1.6;
        margin-bottom: 10px;
      }
      
      .attraction-features {
        margin: 10px 0;
      }
      
      .feature-tag {
        display: inline-block;
        padding: 4px 10px;
        margin: 2px 4px 2px 0;
        background: #e7f3ff;
        color: #2c5282;
        border-radius: 15px;
        font-size: 12px;
      }
      
      .attraction-addr {
        color: #666;
        font-size: 12px;
        margin: 8px 0;
      }
      
      .attraction-duration {
        color: #4a6fa5;
        font-weight: bold;
        font-size: 12px;
        margin-top: 8px;
      }
      
      .meal-info {
        display: flex;
        gap: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 5px;
        margin-bottom: 15px;
      }
      
      .meal {
        flex: 1;
        text-align: center;
      }
      
      .meal-status {
        font-size: 20px;
        font-weight: bold;
        margin-top: 5px;
      }
      
      .meal-status.included {
        color: #2F855A;
      }
      
      .meal-status.not-included {
        color: #E53E3E;
      }
      
      .meal-menu-section {
        background: #f0f7ff;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #d0e2ff;
      }
      
      .meal-menu-title {
        font-weight: bold;
        color: #2c5282;
        margin-bottom: 10px;
      }
      
      .meal-menu-item {
        font-size: 13px;
        margin-bottom: 5px;
        color: #555;
      }
      
      .usage-section {
        padding: 0;
      }
      
      .usage-item {
        margin-bottom: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
        overflow: hidden;
      }
      
      .usage-header {
        background: #4a6fa5;
        color: white;
        padding: 10px 15px;
        font-weight: bold;
      }
      
      .usage-content {
        padding: 15px;
        line-height: 1.8;
        color: #555;
      }
      
      .other-notice {
        margin-top: 30px;
        padding: 20px;
        background: #fff8dc;
        border: 1px solid #ffd700;
        border-radius: 5px;
        text-align: center;
        font-size: 14px;
        line-height: 1.8;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
        text-align: center;
        color: #666;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 100%;
          padding: 20px;
        }
        
        .day-schedule {
          page-break-inside: avoid;
        }
        
        .attraction-thumb {
          max-width: 300px;
        }
      }
    `;
  };

  const getBoardingGuideStyles = () => {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #333;
        font-size: 14px;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
      }
      
      .route-section {
        margin-bottom: 30px;
      }
      
      .route-header-box {
        text-align: center;
        padding: 20px;
        background: #2c5282;
        color: white;
        margin-bottom: 30px;
        border-radius: 10px;
      }
      
      .route-header-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .route-header-subtitle {
        font-size: 18px;
        margin-bottom: 5px;
      }
      
      .route-header-date {
        font-size: 16px;
        opacity: 0.9;
      }
      
      .boarding-cards {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .boarding-card {
        border: 1px solid #ddd;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .card-border {
        height: 5px;
        background: #4a6fa5;
      }
      
      .card-border.rest-stop {
        background: #F59E0B;
      }
      
      .card-border.tourist-stop {
        background: #10B981;
      }
      
      .card-content {
        padding: 20px;
      }
      
      .route-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;
      }
      
      .route-number {
        width: 40px;
        height: 40px;
        background: #4a6fa5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: bold;
        font-size: 18px;
        margin-right: 15px;
        flex-shrink: 0;
      }
      
      .route-number.rest {
        background: #F59E0B;
      }
      
      .route-number.tourist {
        background: #10B981;
      }
      
      .route-info-main {
        flex: 1;
      }
      
      .card-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .location-name {
        color: #2c5282;
      }
      
      .location-type {
        font-size: 14px;
        color: #666;
        font-weight: normal;
      }
      
      .time-wrapper {
        display: flex;
        align-items: baseline;
        gap: 5px;
        margin-bottom: 5px;
      }
      
      .time-prefix {
        font-size: 14px;
        color: #666;
      }
      
      .card-time {
        font-size: 24px;
        font-weight: bold;
        color: #2c5282;
      }
      
      .card-time.waypoint-time {
        color: #4a6fa5;
      }
      
      .card-date {
        font-size: 14px;
        color: #666;
      }
      
      .card-info {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
        margin: 15px 0;
      }
      
      .info-parking, .info-arrival {
        font-size: 14px;
        color: #555;
      }
      
      .location-info {
        margin-top: 15px;
      }
      
      .location-section {
        margin-bottom: 15px;
      }
      
      .location-title {
        font-size: 14px;
        font-weight: bold;
        color: #4a6fa5;
        margin-bottom: 5px;
      }
      
      .location-main {
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        margin-bottom: 5px;
      }
      
      .location-sub {
        font-size: 13px;
        color: #666;
        margin-left: 20px;
      }
      
      .map-link {
        display: inline-block;
        margin-top: 5px;
        padding: 5px 10px;
        background: #4a6fa5;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-size: 12px;
      }
      
      .waypoint-icon {
        font-size: 20px;
      }
      
      .waypoint-info {
        margin-top: 15px;
      }
      
      .waypoint-duration {
        font-size: 14px;
        color: #4a6fa5;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .waypoint-desc {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
      }
      
      /* 관광지 이미지 스타일 */
      .attraction-image-container {
        margin: -20px -20px 15px -20px;
        height: 200px;
        overflow: hidden;
      }
      
      .attraction-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .attraction-info {
        margin-top: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .attraction-desc {
        font-size: 14px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 10px;
      }
      
      .attraction-features {
        margin: 10px 0;
      }
      
      .feature-tag {
        display: inline-block;
        padding: 4px 10px;
        margin: 2px 4px 2px 0;
        background: #e7f3ff;
        color: #2c5282;
        border-radius: 15px;
        font-size: 12px;
      }
      
      .attraction-address {
        font-size: 13px;
        color: #666;
        margin-top: 10px;
      }
      
      .common-info {
        margin-top: 40px;
      }
      
      .section-title {
        font-size: 18px;
        font-weight: bold;
        color: #2c5282;
        margin-bottom: 15px;
      }
      
      .notice-list {
        margin: 0;
        padding-left: 20px;
      }
      
      .notice-item {
        margin-bottom: 8px;
        line-height: 1.6;
      }
      
      .contact-box {
        margin-top: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
        text-align: center;
      }
      
      .contact-title {
        font-size: 16px;
        font-weight: bold;
        color: #2c5282;
        margin-bottom: 10px;
      }
      
      .contact-phone {
        font-size: 14px;
        color: #333;
        margin-bottom: 5px;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 100%;
          padding: 20px;
        }
        
        .boarding-card {
          page-break-inside: avoid;
        }
        
        .attraction-image-container {
          height: 150px;
        }
      }
    `;
  };

  const getRoomAssignmentStyles = () => {
    return `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.5;
        color: #333;
        font-size: 11px;
      }
      
      .container {
        width: 100%;
        max-width: 190mm;
        margin: 0 auto;
        background: white;
        padding: 0;
      }
      
      .header {
        text-align: center;
        padding: 15px;
        background: #e6eef7;
        margin-bottom: 15px;
      }
      
      .header h1 {
        font-size: 20px;
        color: #4a6fa5;
        margin: 0 0 8px 0;
        font-weight: bold;
      }
      
      .header p {
        font-size: 14px;
        color: #555;
        margin: 0;
        font-weight: 500;
      }
      
      .content {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        padding: 0 5px;
      }
      
      .room-card {
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
        background: white;
        page-break-inside: avoid;
        height: fit-content;
      }
      
      .room-card.comp-room {
        border: 2px solid #e74c3c;
      }
      
      .room-header {
        background: #a1b7d1;
        color: #2c5282;
        padding: 8px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }
      
      .room-header.comp-header {
        background: #e74c3c;
        color: white;
      }
      
      .room-number {
        font-size: 13px;
        font-weight: bold;
      }
      
      .room-type {
        font-size: 11px;
        flex: 1;
        text-align: center;
      }
      
      .room-capacity {
        font-size: 11px;
        background: rgba(255, 255, 255, 0.3);
        padding: 2px 5px;
        border-radius: 8px;
      }
      
      .room-body {
        padding: 0;
      }
      
      .empty-room {
        text-align: center;
        color: #999;
        padding: 15px;
        font-style: italic;
        font-size: 11px;
      }
      
      .participant-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      
      .participant-table th {
        background: #f8f9fa;
        padding: 4px 3px;
        text-align: center;
        font-size: 10px;
        color: #555;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
      }
      
      .participant-table td {
        padding: 4px 3px;
        font-size: 10px;
        border-bottom: 1px solid #eee;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .participant-table tr:last-child td {
        border-bottom: none;
      }
      
      .text-center {
        text-align: center;
      }
      
      /* 내부용 표시 */
      .internal-info {
        margin: 15px 5px;
        padding: 10px;
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
      }
      
      .internal-info h3 {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #856404;
      }
      
      .internal-info p {
        margin: 3px 0;
        font-size: 11px;
        color: #856404;
      }
      
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .container {
          padding: 0;
          max-width: 190mm;
        }
        
        .content {
          gap: 8px;
          grid-template-columns: repeat(3, 1fr);
        }
        
        .room-card {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .header {
          background: #e6eef7 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .room-header {
          background: #a1b7d1 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .room-header.comp-header {
          background: #e74c3c !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
      
      @media screen {
        .container {
          padding: 20px;
          max-width: 1200px;
        }
        
        .content {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
      }
    `;
  };

  const getStaffTeeTimeStyles = () => {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      body {
        font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        color: #2d3436;
        line-height: 1.6;
        padding: 20px 10px;
        min-height: 100vh;
      }
      
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        padding: 30px;
        backdrop-filter: blur(10px);
        animation: fadeIn 0.8s ease-out;
      }
      
      /* 헤더 스타일 */
      .header-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        color: white;
        position: relative;
        overflow: hidden;
      }
      
      .header-container::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -10%;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
      }
      
      h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      h1::before {
        content: '⛳';
        font-size: 36px;
        animation: fadeIn 1s ease-out;
      }
      
      .subtitle {
        font-size: 18px;
        font-weight: 400;
        opacity: 0.95;
      }
      
      .logo-section {
        text-align: right;
      }
      
      .logo-text {
        font-size: 24px;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      /* 날짜 헤더 */
      .day-header {
        background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
        color: white;
        padding: 15px 25px;
        margin: 30px 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(72, 198, 239, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .day-header::before {
        content: '📅';
        font-size: 20px;
      }
      
      /* 테이블 컨테이너 */
      .table-container {
        display: grid;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      /* 테이블 스타일 */
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 14px;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
        animation: slideIn 0.6s ease-out;
      }
      
      th, td {
        padding: 12px 15px;
        text-align: center;
        border-bottom: 1px solid #f0f0f0;
      }
      
      th {
        background: #f8f9fa;
        font-weight: 600;
        color: #495057;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      tr:hover {
        background-color: #f8f9ff;
        transition: background-color 0.3s ease;
      }
      
      /* 코스별 헤더 색상 */
      .course-header {
        color: white;
        font-weight: 700;
        font-size: 16px;
        padding: 15px 20px;
        text-align: center;
        letter-spacing: 0.5px;
      }
      
      .course-header-lake { 
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      
      .course-header-pine { 
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
      
      .course-header-hills { 
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
      
      .course-header-valley { 
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      }
      
      .course-header-ocean { 
        background: linear-gradient(135deg, #3d84a8 0%, #48b1bf 100%);
      }
      
      .course-header-default { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      /* 컬럼 스타일 */
      .time-column {
        width: 90px;
        background: #f8f9ff;
        font-weight: 600;
        color: #5a67d8;
        font-size: 15px;
      }
      
      .course-column {
        width: 120px;
        font-weight: 500;
        color: #4a5568;
      }
      
      .team-column {
        width: 90px;
        background: #fef5e7;
        font-weight: 500;
        color: #e67e22;
        font-size: 13px;
      }
      
      /* 성별 스타일 */
      .male {
        color: #3498db;
        font-weight: 600;
      }
      
      .female {
        color: #e74c3c;
        font-weight: 600;
      }
      
      .player-cell {
        text-align: center;
        padding: 12px 20px;
        font-size: 14px;
        line-height: 1.6;
        white-space: nowrap;
      }
      
      /* 통계 요약 */
      .stats-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      
      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        border-left: 4px solid;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: fadeIn 0.5s ease-out backwards;
      }
      
      .stat-card:nth-child(1) { animation-delay: 0.1s; }
      .stat-card:nth-child(2) { animation-delay: 0.2s; }
      .stat-card:nth-child(3) { animation-delay: 0.3s; }
      .stat-card:nth-child(4) { animation-delay: 0.4s; }
      
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
      }
      
      .stat-card:nth-of-type(1) { border-left-color: #4facfe; }
      .stat-card:nth-of-type(2) { border-left-color: #43e97b; }
      .stat-card:nth-of-type(3) { border-left-color: #fa709a; }
      .stat-card:nth-of-type(4) { border-left-color: #a8edea; }
      
      .stat-title {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #2d3436;
        margin-bottom: 4px;
      }
      
      .stat-detail {
        font-size: 12px;
        color: #95a5a6;
      }
      
      /* 연락처 정보 */
      .contact-info {
        margin: 30px 0;
        padding: 25px;
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(252, 182, 159, 0.3);
      }
      
      .contact-title {
        font-weight: 700;
        color: #2d3436;
        margin-bottom: 15px;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .contact-title::before {
        content: '📞';
        font-size: 20px;
      }
      
      .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
      }
      
      .contact-item {
        padding: 15px;
        border-radius: 10px;
        background: white;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease;
      }
      
      .contact-item:hover {
        transform: translateY(-2px);
      }
      
      .contact-name {
        font-weight: 600;
        color: #2d3436;
        margin-bottom: 5px;
        font-size: 15px;
      }
      
      .contact-phone {
        color: #5a67d8;
        font-weight: 500;
        font-size: 14px;
      }
      
      /* 푸터 */
      .footer {
        text-align: center;
        margin-top: 40px;
        padding: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        color: white;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      }
      
      .footer-message {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 10px;
      }
      
      .footer-detail {
        font-size: 14px;
        opacity: 0.9;
      }
      
      /* 모바일 대응 */
      @media (max-width: 768px) {
        body {
          padding: 10px;
        }
        
        .container {
          padding: 20px;
          border-radius: 15px;
        }
        
        .header-container {
          padding: 20px;
        }
        
        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        h1 {
          font-size: 24px;
        }
        
        .subtitle {
          font-size: 14px;
        }
        
        .logo-text {
          font-size: 18px;
        }
        
        .day-header {
          font-size: 14px;
          padding: 10px 15px;
        }
        
        table {
          font-size: 11px;
        }
        
        th, td {
          padding: 8px 5px;
        }
        
        .course-header {
          font-size: 13px;
          padding: 10px;
        }
        
        .time-column {
          width: 60px;
          font-size: 12px;
        }
        
        .course-column {
          width: 70px;
          font-size: 11px;
        }
        
        .team-column {
          width: 60px;
          font-size: 11px;
        }
        
        .player-cell {
          padding: 8px 10px;
          font-size: 11px;
          white-space: normal;
        }
        
        .stats-container {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .stat-card {
          padding: 15px;
        }
        
        .stat-value {
          font-size: 22px;
        }
      }
      
      /* 프린트 스타일 */
      @media print {
        body {
          background: white;
          padding: 0;
        }
        
        .container {
          background: white;
          box-shadow: none;
          padding: 10px;
          border-radius: 0;
          max-width: 100%;
        }
        
        .header-container,
        .day-header,
        .course-header,
        .contact-info,
        .footer {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .stats-container {
          page-break-inside: avoid;
        }
        
        table {
          page-break-inside: auto;
        }
        
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        
        .day-header {
          page-break-after: avoid;
        }
        
        .footer {
          margin-top: 20px;
        }
      }
    `;
  };

  const getTeeTimeStyles = () => {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #ffffff;
        color: #1a1a1a;
        line-height: 1.6;
        padding: 0;
      }
      
      .container {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        background: #ffffff;
        padding: 20px;
      }
      
      /* 헤더 */
      .header {
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border-radius: 20px;
        margin-bottom: 40px;
        position: relative;
        overflow: hidden;
      }
      
      .header::before {
        content: '⛳';
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 80px;
        opacity: 0.1;
      }
      
      .header h1 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .header p {
        font-size: 16px;
        opacity: 0.95;
      }
      
      /* 일정 카드 */
      .schedule-card {
        background: #f8fafc;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        border: 1px solid #e2e8f0;
      }
      
      .date-header {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .date-header::before {
        content: '📅';
        font-size: 24px;
      }
      
      /* 티타임 테이블 */
      .tee-time-table {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .tee-time-header {
        background: #3b82f6;
        color: white;
        padding: 12px 20px;
        font-weight: 600;
        font-size: 15px;
      }
      
      .tee-time-row {
        display: flex;
        padding: 16px 20px;
        border-bottom: 1px solid #f1f5f9;
        align-items: center;
        transition: background-color 0.2s;
      }
      
      .tee-time-row:hover {
        background-color: #f8fafc;
      }
      
      .tee-time-row:last-child {
        border-bottom: none;
      }
      
      .time-box {
        background: #eff6ff;
        color: #1e40af;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        margin-right: 20px;
        min-width: 80px;
        text-align: center;
      }
      
      .players-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .player-names {
        font-size: 15px;
        color: #334155;
        font-weight: 500;
      }
      
      .player-count {
        background: #e0e7ff;
        color: #3730a3;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
      }
      
      /* 연락처 정보 */
      .contact-section {
        background: #f0f9ff;
        border-radius: 16px;
        padding: 24px;
        margin-top: 40px;
        text-align: center;
      }
      
      .contact-title {
        font-size: 18px;
        font-weight: 600;
        color: #0369a1;
        margin-bottom: 16px;
      }
      
      .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
      
      .contact-card {
        background: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .contact-name {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4px;
      }
      
      .contact-phone {
        color: #3b82f6;
        font-size: 15px;
        text-decoration: none;
      }
      
      /* 안내사항 */
      .info-section {
        background: #fef3c7;
        border-radius: 16px;
        padding: 24px;
        margin-top: 24px;
      }
      
      .info-title {
        font-size: 16px;
        font-weight: 600;
        color: #92400e;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .info-title::before {
        content: '📌';
        font-size: 20px;
      }
      
      .info-list {
        list-style: none;
        padding: 0;
      }
      
      .info-list li {
        color: #78350f;
        font-size: 14px;
        padding: 4px 0;
        padding-left: 20px;
        position: relative;
      }
      
      .info-list li::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #f59e0b;
        font-weight: bold;
      }
      
      /* 푸터 */
      .footer {
        text-align: center;
        margin-top: 40px;
        padding: 30px;
        background: #1e293b;
        color: white;
        border-radius: 16px;
      }
      
      .footer-message {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      .footer-brand {
        font-size: 14px;
        opacity: 0.8;
      }
      
      /* 모바일 최적화 */
      @media (max-width: 640px) {
        .container {
          padding: 16px;
        }
        
        .header {
          padding: 30px 20px;
          border-radius: 16px;
        }
        
        .header h1 {
          font-size: 24px;
        }
        
        .schedule-card {
          padding: 20px;
        }
        
        .date-header {
          font-size: 18px;
        }
        
        .tee-time-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .time-box {
          margin-right: 0;
          margin-bottom: 8px;
        }
        
        .players-info {
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .contact-grid {
          grid-template-columns: 1fr;
        }
      }
      
      /* 프린트 최적화 */
      @media print {
        body {
          background: white;
        }
        
        .container {
          max-width: 100%;
          padding: 20px;
        }
        
        .header,
        .schedule-card,
        .contact-section,
        .info-section,
        .footer {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          page-break-inside: avoid;
        }
      }
    `;
  };

  const getStaffDocumentStyles = () => {
    return `
      body {
        margin: 0;
        padding: 0;
        font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #333;
        font-size: 14px;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
      }
      
      .header {
        text-align: center;
        padding-bottom: 30px;
        border-bottom: 3px solid #2c5282;
        margin-bottom: 30px;
      }
      
      .header h1 {
        font-size: 28px;
        color: #2c5282;
        margin-bottom: 10px;
      }
      
      .header p {
        font-size: 16px;
        color: #666;
        margin: 5px 0;
      }
      
      .summary {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 30px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        color: #2c5282;
      }
      
      .location-section {
        margin-bottom: 30px;
      }
      
      .location-section h2 {
        font-size: 20px;
        color: #2c5282;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e7f3ff;
      }
      
      .participant-table {
        width: 100%;
        border-collapse: collapse;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .participant-table th {
        background: #4a6fa5;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: bold;
      }
      
      .participant-table td {
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .participant-table tr:nth-child(even) {
        background: #f8f9fa;
      }
      
      .text-center {
        text-align: center;
      }
      
      .staff-info {
        margin-top: 40px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .staff-info h3 {
        font-size: 18px;
        color: #2c5282;
        margin-bottom: 15px;
      }
      
      .staff-info p {
        font-size: 14px;
        margin: 5px 0;
      }
      
      @media print {
        .container {
          max-width: 100%;
          padding: 20px;
        }
        
        .location-section {
          page-break-inside: avoid;
        }
      }
    `;
  };

  const getSimplifiedStyles = () => {
    return `
      body {
        margin: 0;
        padding: 0;
        font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #333;
        font-size: 14px;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        padding: 30px;
      }
      
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 3px solid #2c5282;
        margin-bottom: 20px;
      }
      
      .header h1 {
        font-size: 24px;
        color: #2c5282;
        margin-bottom: 10px;
      }
      
      .header p {
        font-size: 16px;
        color: #666;
      }
      
      .quick-info {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .info-item {
        flex: 1;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        text-align: center;
      }
      
      .info-item strong {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .info-item p {
        font-size: 16px;
        color: #2c5282;
        font-weight: bold;
        margin: 0;
      }
      
      .schedule-summary {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .day-summary {
        padding: 15px;
        border-bottom: 1px solid #eee;
        text-align: left;
      }
      
      .day-summary:last-child {
        border-bottom: none;
      }
      
      .day-header {
        font-size: 16px;
        font-weight: bold;
        color: #2c5282;
        margin-bottom: 5px;
        text-align: left;
      }
      
      .day-date {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
        text-align: left;
      }
      
      .day-subtitle {
        font-size: 15px;
        color: #333;
        margin-bottom: 10px;
        text-align: center;
        background: #f0f0f0;
        padding: 5px;
        border-radius: 4px;
      }
      
      .main-events {
        font-size: 14px;
        text-align: left;
      }
      
      .event {
        margin-bottom: 5px;
        padding-left: 20px;
        position: relative;
        text-align: left;
      }
      
      .event:before {
        content: '•';
        position: absolute;
        left: 5px;
        color: #4a6fa5;
      }
      
      .notices {
        margin-top: 30px;
        padding: 20px;
        background: #fff8dc;
        border: 1px solid #ffd700;
        border-radius: 8px;
      }
      
      .notices p {
        font-size: 14px;
        margin: 0 0 10px 0;
      }
      
      .notices p:last-child {
        margin-bottom: 0;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      
      @media print {
        .container {
          max-width: 100%;
          padding: 20px;
        }
      }
    `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p>문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 문서 탭 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-4 overflow-x-auto">
              {DOCUMENT_TYPES.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveTab(doc.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === doc.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{doc.icon}</span>
                  {doc.label}
                </button>
              ))}
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                title="인쇄"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                title="다운로드"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                title="공유"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 문서 내용 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div dangerouslySetInnerHTML={{ __html: getDocumentHTML() }} />
          </div>
        </div>
      </div>
    </div>
  );
}