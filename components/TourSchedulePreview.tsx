import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Download, Share2, Printer, Calendar, MapPin, Phone, Clock, Users, FileText, Eye, Home, Car, Flag, Building } from 'lucide-react';

interface TourSchedulePreviewProps {
  tourId: string;
}

export default function TourSchedulePreview({ tourId }: TourSchedulePreviewProps) {
  const [tourData, setTourData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [documentNotices, setDocumentNotices] = useState<any>({});
  const [documentFooters, setDocumentFooters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customer_schedule');
  const [staffDocumentHTML, setStaffDocumentHTML] = useState<string>('');
  const [roomAssignmentHTML, setRoomAssignmentHTML] = useState<string>('');
  const [teeTimeHTML, setTeeTimeHTML] = useState<string>('');
  const [teeTimeStaffHTML, setTeeTimeStaffHTML] = useState<string>('');
  const [tourBoardingPlaces, setTourBoardingPlaces] = useState<any[]>([]);
  const [tourWaypoints, setTourWaypoints] = useState<any[]>([]);
  const searchParams = useSearchParams();

  // 문서 타입 정의
  const DOCUMENT_TYPES = [
    { id: 'customer_schedule', label: '고객용 일정표', icon: '📋' },
    { id: 'customer_boarding', label: '고객용 탑승안내서', icon: '🚌' },
    { id: 'staff_boarding', label: '스탭용 탑승안내서', icon: '👥' },
    { id: 'room_assignment', label: '객실 배정표', icon: '🏨' },
    { id: 'timetable', label: '티타임표 (고객용)', icon: '⛳' },
    { id: 'timetable-staff', label: '티타임표 (스탭용)', icon: '⛳' },
    { id: 'simplified', label: '간편 일정표', icon: '📄' }
  ];

  useEffect(() => {
    fetchTourData();
    fetchTourBoardingPlaces();
  }, [tourId]);

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
    } else if (activeTab === 'room_assignment' && tourData) {
      fetchRoomAssignments();
    } else if ((activeTab === 'timetable' || activeTab === 'timetable-staff') && tourData) {
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
        staff: tour.singsing_tour_staff || []
      });
    } catch (error) {
      console.error('Error fetching tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTourBoardingPlaces = async () => {
    try {
      // 가는 날 탑승지만 가져오기 (가는 날 = start_date)
      const { data: tourInfo } = await supabase
        .from('singsing_tours')
        .select('start_date')
        .eq('id', tourId)
        .single();

      if (!tourInfo) return;

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

      // 경유지 정보도 가져오기
      const { data: waypoints } = await supabase
        .from('singsing_tour_boarding_times')
        .select('*')
        .eq('tour_id', tourId)
        .eq('is_waypoint', true)
        .eq('visit_date', tourInfo.start_date.split('T')[0])
        .order('order_no');

      if (waypoints) {
        setTourWaypoints(waypoints);
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
      const { data: assignments, error } = await supabase
        .from('singsing_participants')
        .select('*')
        .eq('tour_id', tourId)
        .not('room_id', 'is', null)
        .order('room_id');

      if (error) throw error;
      
      if (assignments) {
        setRoomAssignmentHTML(generateRoomAssignmentHTML(assignments));
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
        
        const customerHTML = generateTeeTimeHTML(teeTimesWithPlayers, false);
        const staffHTML = generateTeeTimeHTML(teeTimesWithPlayers, true);
        console.log('고객용 HTML 생성됨:', customerHTML.length);
        console.log('스탭용 HTML 생성됨:', staffHTML.length);
        setTeeTimeHTML(customerHTML); // 고객용
        setTeeTimeStaffHTML(staffHTML); // 스탭용
      } else {
        console.log('티타임 데이터가 없습니다');
        setTeeTimeHTML('<div class="no-data">티타임 데이터가 없습니다.</div>');
        setTeeTimeStaffHTML('<div class="no-data">티타임 데이터가 없습니다.</div>');
      }
    } catch (error) {
      console.error('Error fetching tee times:', error);
      setTeeTimeHTML('<div class="error">티타임 데이터를 불러오는 중 오류가 발생했습니다.</div>');
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
      case 'timetable':
        return teeTimeHTML || '<div>티타임표를 생성 중입니다...</div>';
      case 'timetable-staff':
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
      
      ${productData?.courses?.length > 0 ? `
        <div class="course-info">
          <strong>코스:</strong> ${productData.courses.join(', ')}
        </div>
      ` : ''}
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
        <div class="section-title">이용 안내</div>
        <div class="notice-box">
          <ul class="notice-list">
            ${productData.general_notices.map((notice: any) => `
              <li>${notice.content || notice}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    ` : productData?.usage_round || productData?.usage_hotel || productData?.usage_meal || productData?.usage_bus || productData?.usage_tour ? `
      <div class="section">
        <div class="section-title">이용 안내</div>
        <div class="notice-box">
          <ul class="notice-list">
            ${productData.usage_round ? `<li>라운딩 규정: ${productData.usage_round}</li>` : ''}
            ${productData.usage_hotel ? `<li>숙소 이용: ${productData.usage_hotel}</li>` : ''}
            ${productData.usage_meal ? `<li>식사 안내: ${productData.usage_meal}</li>` : ''}
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
        <div class="notice-box">
          ${tourData.reservation_notices.map((notice: any) => `
            <div class="notice-item">
              <strong>${notice.title}:</strong> ${notice.content}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- 일정 안내 -->
    <div class="section">
      <div class="section-title">일정 안내</div>
      <div class="schedule-section">
        ${tourData.schedules?.map((schedule: any, idx: number) => `
          <div class="day-schedule">
            <div class="day-title">
              <div>Day ${idx + 1} - ${new Date(schedule.date || schedule.schedule_date).toLocaleDateString('ko-KR')}</div>
            </div>
            <div class="day-content">
              <div class="schedule-content">
                ${schedule.title || ''}
                ${schedule.schedule_items?.length > 0 ? `
                  <ul class="schedule-items" style="list-style: none; padding: 0; margin: 10px 0;">
                    ${schedule.schedule_items.map((item: any) => `
                      <li style="padding: 3px 0;">
                        ${item.time ? `<span style="font-weight: bold; color: #2c5282;">${item.time}:</span>` : ''} ${item.content}
                      </li>
                    `).join('')}
                  </ul>
                ` : schedule.description ? `<p>${schedule.description}</p>` : ''}
              </div>
              
              <div class="meal-info">
                <div class="meal">
                  <div>조식</div>
                  <div class="meal-status ${schedule.meal_breakfast ? 'included' : 'not-included'}">
                    ${schedule.meal_breakfast ? 'O' : 'X'}
                  </div>
                  ${schedule.meal_breakfast && schedule.menu_breakfast ? `
                    <div class="meal-menu">${schedule.menu_breakfast}</div>
                  ` : ''}
                </div>
                <div class="meal">
                  <div>중식</div>
                  <div class="meal-status ${schedule.meal_lunch ? 'included' : 'not-included'}">
                    ${schedule.meal_lunch ? 'O' : 'X'}
                  </div>
                  ${schedule.meal_lunch && schedule.menu_lunch ? `
                    <div class="meal-menu">${schedule.menu_lunch}</div>
                  ` : ''}
                </div>
                <div class="meal">
                  <div>석식</div>
                  <div class="meal-status ${schedule.meal_dinner ? 'included' : 'not-included'}">
                    ${schedule.meal_dinner ? 'O' : 'X'}
                  </div>
                  ${schedule.meal_dinner && schedule.menu_dinner ? `
                    <div class="meal-menu">${schedule.menu_dinner}</div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('') || ''}
      </div>
    </div>

    <!-- 이용 안내 (여행상품) - 락카 이용 제외 -->
    ${productData?.usage_round || productData?.usage_hotel || productData?.usage_meal || productData?.usage_bus || productData?.usage_tour ? `
      <div class="section">
        <div class="section-title">이용 안내</div>
        <div class="usage-section">
          ${productData.usage_round ? `
            <div class="usage-item">
              <div class="usage-title">라운딩 규정</div>
              <div class="usage-content">${productData.usage_round.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}
          ${productData.usage_hotel ? `
            <div class="usage-item">
              <div class="usage-title">숙소 이용</div>
              <div class="usage-content">${productData.usage_hotel.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}
          ${productData.usage_meal ? `
            <div class="usage-item">
              <div class="usage-title">식사 안내</div>
              <div class="usage-content">${productData.usage_meal.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}
          ${productData.usage_bus ? `
            <div class="usage-item">
              <div class="usage-title">버스 이용</div>
              <div class="usage-content">${productData.usage_bus.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}
          ${productData.usage_tour ? `
            <div class="usage-item">
              <div class="usage-title">관광지 투어</div>
              <div class="usage-content">${productData.usage_tour.replace(/\n/g, '<br>')}</div>
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
    <div class="header">
      <div class="header-title">싱싱골프투어</div>
      <div class="header-subtitle">${tourData.title}</div>
    </div>
    
    <div class="boarding-cards">
      ${tourBoardingPlaces.map((place: any, index: number) => {
        const boardingPlace = place.boarding_place;
        if (!boardingPlace) return '';
        
        return `
        <div class="boarding-card">
          <div class="card-border"></div>
          <div class="card-content">
            <div class="card-title">${boardingPlace.name}</div>
            <div class="card-time">${place.departure_time ? place.departure_time.slice(0, 5) : '미정'}</div>
            <div class="card-date">${new Date(tourData.start_date).toLocaleDateString('ko-KR')}</div>
            <div class="card-info">
              <div class="info-parking">주차: ${boardingPlace.parking_info || '무료'}</div>
              <div class="info-arrival">${place.arrival_time ? place.arrival_time.slice(0, 5) : getArrivalTime(place.departure_time)} 도착</div>
            </div>
            
            ${boardingPlace.boarding_main || boardingPlace.boarding_sub || boardingPlace.parking_main ? `
              <div class="location-info">
                ${boardingPlace.boarding_main ? `
                  <div class="location-section">
                    <p class="location-title">버스탑승지</p>
                    <p class="location-main">${boardingPlace.boarding_main}</p>
                    ${boardingPlace.boarding_sub ? `<p class="location-sub">${boardingPlace.boarding_sub}</p>` : ''}
                  </div>
                ` : ''}
                
                ${boardingPlace.parking_main ? `
                  <div class="location-section">
                    <p class="location-title">주차장 오는길</p>
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
      }).join('') || '<p class="text-center py-8">탑승지 정보가 없습니다.</p>'}
    </div>
    
    ${/* 경유지 정보 추가 */''}
    <div class="common-info">
      <h3 class="section-title">이동 경로 및 정차 정보</h3>
      <table class="route-table">
        <tr>
          <th style="width: 30%;">시간</th>
          <th>장소</th>
        </tr>
        ${tourBoardingPlaces.map((place: any, index: number) => {
          const boardingPlace = place.boarding_place;
          if (!boardingPlace) return '';
          return `
            <tr>
              <td>${place.departure_time ? place.departure_time.slice(0, 5) : '미정'}</td>
              <td>${boardingPlace.name} 출발</td>
            </tr>
          `;
        }).join('')}
        ${tourWaypoints.map((waypoint: any) => `
          <tr>
            <td>-</td>
            <td>${waypoint.waypoint_name} 정차 (약 ${waypoint.waypoint_duration}분) ${waypoint.waypoint_description ? `- ${waypoint.waypoint_description}` : ''}</td>
          </tr>
        `).join('')}
      </table>
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
        <Flag className="icon" />
        <div>
          <strong>골프장</strong>
          <p>${productData?.golf_course || ''}</p>
        </div>
      </div>
      <div class="info-item">
        <Building className="icon" />
        <div>
          <strong>숙소</strong>
          <p>${productData?.hotel || ''}</p>
        </div>
      </div>
    </div>
    
    <div class="schedule-summary">
      ${tourData.schedules?.map((schedule: any) => `
        <div class="day-summary">
          <div class="day-header">Day ${schedule.day_number}</div>
          <div class="day-date">${new Date(schedule.date).toLocaleDateString('ko-KR')}</div>
          <div class="main-events">
            ${schedule.tour_schedule_items?.filter((item: any) =>
              item.content.includes('골프') || item.content.includes('출발') || item.content.includes('도착')
            ).map((item: any) => `
              <div class="event">${item.time || ''} ${item.content}</div>
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
  const generateRoomAssignmentHTML = (assignments: any[]) => {
    const roomsByRoom = assignments.reduce((acc, participant) => {
      const roomId = participant.room_id;
      if (!acc[roomId]) acc[roomId] = [];
      acc[roomId].push(participant);
      return acc;
    }, {});

    const notices = documentNotices.room_assignment || [];

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 객실 배정표</title>
  <style>
    ${getRoomAssignmentStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>객실 배정표</h1>
      <p>${tourData.title}</p>
      <p>${productData?.hotel || ''}</p>
    </div>
    
    ${Object.entries(roomsByRoom).map(([roomId, participants]: [string, any]) => `
      <div class="room-section">
        <h2>객실 ${roomId}</h2>
        <table>
          <thead>
            <tr>
              <th>성명</th>
              <th>연락처</th>
              <th>팀</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            ${participants.map((participant: any) => `
              <tr>
                <td>${participant.name}</td>
                <td>${participant.phone || '-'}</td>
                <td>${participant.team_name || '-'}</td>
                <td>${participant.note || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('')}
    
    ${documentFooters.room_assignment?.['객실 이용 안내'] ? `
      <div class="notices">
        <h3>객실 이용 안내</h3>
        <ul>
          ${documentFooters.room_assignment['객실 이용 안내'].split('\n').map((line: string) => `
            <li>${line.replace('•', '').trim()}</li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${documentFooters.room_assignment?.['식사 안내'] ? `
      <div class="notices">
        <h3>식사 안내</h3>
        <ul>
          ${documentFooters.room_assignment['식사 안내'].split('\n').map((line: string) => `
            <li>${line.replace('•', '').trim()}</li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
    
    <div class="footer">
      <p>싱싱골프투어 | 031-215-3990</p>
    </div>
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
  <title>${tourData.title} - 티타임표${isStaff ? ' (스탭용)' : ''}</title>
  <style>
    ${getTeeTimeStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>티타임표${isStaff ? ' (스탭용)' : ''}</h1>
      <p>${tourData.title}</p>
      <p>${productData?.golf_course || ''}</p>
    </div>
    
    ${Object.entries(teeTimesByDate).map(([date, times]: [string, any]) => `
      <div class="tee-time-section">
        <h2>${new Date(date).toLocaleDateString('ko-KR')}</h2>
        <table>
          <thead>
            <tr>
              <th width="80">시간</th>
              <th width="100">코스</th>
              <th width="60">팀</th>
              <th>플레이어</th>
                ${isStaff ? '<th>연락처</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${times.map((teeTime: any) => {
              // 티타임에 배정된 참가자 정보
              const players = teeTime.singsing_tee_time_players || [];
              const sortedPlayers = players.sort((a: any, b: any) => (a.order_no || 0) - (b.order_no || 0));
              
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
              
              // 티타임에 플레이어가 있는 경우
              if (sortedPlayers.length > 0) {
                return sortedPlayers.map((player: any, index: number) => {
                  const participant = player.singsing_participants;
                  if (!participant) return '';
                  
                  // 개별 성별 표시 (혼성팀에서 소수 성별만)
                  const getGenderMark = () => {
                  if (!participant.gender) return '';
                  
                  const maleCount = sortedPlayers.filter((p: any) => 
                  p.singsing_participants?.gender === 'M' || p.singsing_participants?.gender === '남'
                  ).length;
                  const femaleCount = sortedPlayers.filter((p: any) => 
                  p.singsing_participants?.gender === 'F' || p.singsing_participants?.gender === '여'
                  ).length;
                  
                  if (maleCount > 0 && femaleCount > 0) {
                  if (maleCount < femaleCount && (participant.gender === 'M' || participant.gender === '남')) {
                  return '(남)';
                  } else if (femaleCount < maleCount && (participant.gender === 'F' || participant.gender === '여')) {
                  return '(여)';
                  }
                  }
                  return '';
                  };
                  
                  const genderMark = getGenderMark();
                  const genderColor = (participant.gender === 'M' || participant.gender === '남') ? '#3b82f6' : 
                  (participant.gender === 'F' || participant.gender === '여') ? '#ec4899' : 
                  '#6b7280';
              
              const courseStyle = 
                (teeTime.course || teeTime.golf_course)?.includes('레이크') || (teeTime.course || teeTime.golf_course)?.includes('Lake') 
                  ? 'background-color: #DBEAFE; color: #1E40AF;' 
                  : (teeTime.course || teeTime.golf_course)?.includes('힐스') || (teeTime.course || teeTime.golf_course)?.includes('Hills')
                  ? 'background-color: #D1FAE5; color: #065F46;'
                  : (teeTime.course || teeTime.golf_course)?.includes('밸리') || (teeTime.course || teeTime.golf_course)?.includes('Valley')
                  ? 'background-color: #EDE9FE; color: #5B21B6;'
                  : (teeTime.course || teeTime.golf_course)?.includes('오션') || (teeTime.course || teeTime.golf_course)?.includes('Ocean')
                  ? 'background-color: #CFFAFE; color: #065F46;'
                  : (teeTime.course || teeTime.golf_course)?.includes('클럽') || (teeTime.course || teeTime.golf_course)?.includes('Club')
                  ? 'background-color: #FED7AA; color: #C2410C;'
                  : 'background-color: #F3F4F6; color: #374151;';
                  
                  return `
                    <tr>
                      ${index === 0 ? `
                        <td rowspan="${sortedPlayers.length}">${teeTime.tee_time}</td>
                        <td rowspan="${sortedPlayers.length}" style="${courseStyle} font-weight: bold;">${teeTime.course || teeTime.golf_course} ${teamGenderType}</td>
                        <td rowspan="${sortedPlayers.length}">${teeTime.team_no}팀</td>
                      ` : ''}
                      <td class="players-cell">
                        <span class="player-name">${participant.name}</span>
                        ${genderMark ? `<span style="color: ${genderColor}; font-weight: bold; margin-left: 4px;">${genderMark}</span>` : ''}
                      </td>
                      ${isStaff ? `<td>${participant.phone || '-'}</td>` : ''}
                    </tr>
                  `;
                }).join('');
              } else {
                // 티타임에 플레이어가 없는 경우 (기존 players 필드 사용)
                const playerNames = teeTime.players ? JSON.parse(teeTime.players) : [];
                const courseStyle = 
                  (teeTime.course || teeTime.golf_course)?.includes('레이크') || (teeTime.course || teeTime.golf_course)?.includes('Lake') 
                    ? 'background-color: #DBEAFE; color: #1E40AF;' 
                    : (teeTime.course || teeTime.golf_course)?.includes('힐스') || (teeTime.course || teeTime.golf_course)?.includes('Hills')
                    ? 'background-color: #D1FAE5; color: #065F46;'
                    : (teeTime.course || teeTime.golf_course)?.includes('밸리') || (teeTime.course || teeTime.golf_course)?.includes('Valley')
                    ? 'background-color: #EDE9FE; color: #5B21B6;'
                    : (teeTime.course || teeTime.golf_course)?.includes('오션') || (teeTime.course || teeTime.golf_course)?.includes('Ocean')
                    ? 'background-color: #CFFAFE; color: #065F46;'
                    : (teeTime.course || teeTime.golf_course)?.includes('클럽') || (teeTime.course || teeTime.golf_course)?.includes('Club')
                    ? 'background-color: #FED7AA; color: #C2410C;'
                    : 'background-color: #F3F4F6; color: #374151;';
                    
                return `
                  <tr>
                    <td>${teeTime.tee_time}</td>
                    <td style="${courseStyle} font-weight: bold;">${teeTime.course || teeTime.golf_course}</td>
                    <td>${teeTime.team_no}팀</td>
                    <td class="players-cell">
                      ${playerNames.length > 0 ? playerNames.join(', ') : '-'}
                    </td>
                    ${isStaff ? '<td>-</td>' : ''}
                  </tr>
                `;
              }
            }).join('')}
          </tbody>
        </table>
      </div>
    `).join('')}
    
    ${documentFooters.rounding_timetable?.['라운딩 주의사항'] ? `
      <div class="notices">
        <h3>라운딩 주의사항</h3>
        <ul>
          ${documentFooters.rounding_timetable['라운딩 주의사항'].split('\n').map((line: string) => 
            line.trim() ? `<li>${line.replace('•', '').trim()}</li>` : ''
          ).filter(Boolean).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${documentFooters.rounding_timetable?.['락카 이용 안내'] ? `
      <div class="notices">
        <h3>락카 이용 안내</h3>
        <ul>
          ${documentFooters.rounding_timetable['락카 이용 안내'].split('\n').map((line: string) => 
            line.trim() ? `<li>${line.replace('•', '').trim()}</li>` : ''
          ).filter(Boolean).join('')}
        </ul>
      </div>
    ` : ''}
    
    <div class="footer">
      <p>싱싱골프투어 | 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 스탭용 탑승안내서 HTML 생성
  const generateStaffHTML = (participants: any[]) => {
    const participantsByLocation = participants.reduce((acc, participant) => {
      const location = participant.pickup_location || '미정';
      if (!acc[location]) acc[location] = [];
      acc[location].push(participant);
      return acc;
    }, {});

    const notices = documentNotices.staff_boarding || [];

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 스탭용 탑승안내서</title>
  <style>
    ${getBoardingStaffStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header-container">
      <div class="title-section">
        <h1>탑승지별 배정 안내</h1>
        <p class="subtitle">${tourData.title} - 탑승 ${participants.length}명</p>
      </div>
      <div class="info-section">
        ${tourData.staff?.map((staff: any) => `
          <p><strong>${staff.name} ${staff.role}</strong></p>
          <p>${staff.phone}</p>
        `).join('') || ''}
      </div>
    </div>
    
    <div class="section">
      ${Object.entries(participantsByLocation).map(([location, locationParticipants]: [string, any]) => `
        <div class="location-section">
          <h3>${location} - ${locationParticipants.length}명</h3>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>성함</th>
                <th>연락처</th>
                <th>팀</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              ${locationParticipants.map((participant: any, idx: number) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${participant.name}</td>
                  <td>${participant.phone || '-'}</td>
                  <td>${participant.team_name || '-'}</td>
                  <td>${participant.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
    
    ${notices.length > 0 ? `
      <div class="notices">
        <h3>스탭 안내사항</h3>
        ${notices.map((notice: any) => `
          <p>${notice.content}</p>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="footer">
      <p>싱싱골프투어 | 031-215-3990</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 스타일 정의 함수들
  const getCustomerScheduleStyles = () => {
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
    .info-label { width: 120px; padding: 12px 15px; background-color: #edf2f7; font-weight: bold; font-size: 14px; }
    .info-value { flex: 1; padding: 12px 15px; font-size: 14px; }
    .important { font-weight: 600; color: #2d3748; }
    .course-info { margin: 0 15px 15px; padding: 10px 15px; background-color: #f8f9fa; border-radius: 6px; font-size: 14px; }
    .notice-box { margin: 15px; background-color: #f8f9fa; border-left: 3px solid #4299e1; border-radius: 6px; padding: 14px 16px; }
    .notice-title { font-weight: bold; color: #2b6cb0; margin-bottom: 10px; }
    .notice-list { list-style: none; }
    .notice-list li { padding: 4px 0; color: #4A5568; font-size: 14px; }
    .notice-list li:before { content: "•"; margin-right: 8px; color: #4299e1; }
    .notice-item { margin-bottom: 10px; font-size: 14px; }
    .notice-item strong { color: #2b6cb0; }
    .usage-section { margin: 15px; }
    .usage-item { margin-bottom: 15px; padding: 12px 15px; background-color: #f8f9fa; border-radius: 6px; }
    .usage-title { font-weight: bold; color: #2b6cb0; margin-bottom: 6px; font-size: 14px; }
    .usage-content { color: #4A5568; font-size: 14px; line-height: 1.6; }
    .day-schedule { background: white; border-radius: 8px; margin: 0 15px 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .day-title { background: #2c5282; color: white; padding: 10px 15px; font-weight: bold; border-radius: 8px 8px 0 0; }
    .day-content { padding: 15px; }
    .schedule-content { margin-bottom: 15px; color: #4a5568; font-size: 14px; }
    .schedule-content p { margin-top: 8px; }
    .meal-info { display: flex; background: #edf2f7; padding: 10px; border-radius: 6px; justify-content: space-around; }
    .meal { text-align: center; flex: 1; }
    .meal-status { font-weight: bold; margin-top: 4px; }
    .meal-menu { font-size: 12px; color: #4a5568; margin-top: 4px; }
    .included { color: #2F855A; }
    .not-included { color: #C53030; }
    .other-notice { margin: 15px; padding: 15px; background-color: #fffaf0; border: 1px solid #feb2b2; border-radius: 6px; color: #7b341e; font-size: 14px; }
    .footer { text-align: center; padding: 20px; background-color: #f8f9fa; font-size: 14px; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
    `;
  };

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
    .location-info { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 15px; }
    .location-section { background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .location-title { font-weight: 600; color: #2d3748; margin-bottom: 5px; display: flex; align-items: center; }
    .location-title:before { content: "📍"; margin-right: 5px; }
    .location-main { font-weight: 600; color: #2d3748; margin-bottom: 2px; }
    .location-sub { color: #718096; font-size: 13px; }
    .map-link { display: inline-block; background-color: #3182ce; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; margin-top: 5px; font-size: 13px; }
    .common-info { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 15px; }
    .section-title { font-size: 18px; font-weight: bold; color: #2c5282; margin-bottom: 15px; }
    .notice-content { white-space: pre-line; color: #4a5568; margin-bottom: 15px; }
    .notice-list { margin-top: 15px; }
    .notice-item { position: relative; padding-left: 20px; margin-bottom: 10px; color: #4a5568; }
    .notice-item:before { content: '※'; position: absolute; left: 0; color: #e53e3e; }
    .contact-box { background-color: #edf2f7; border-radius: 8px; padding: 15px; text-align: center; margin-top: 15px; }
    .contact-title { font-weight: bold; color: #2c5282; margin-bottom: 10px; }
    .contact-phone { font-size: 16px; color: #4a5568; margin: 5px 0; }
    .route-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .route-table th, .route-table td { border: 1px solid #e2e8f0; padding: 10px; }
    .route-table th { background-color: #edf2f7; font-weight: bold; color: #2c5282; }
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
    .section { padding: 20px; }
    .location-section { margin-bottom: 30px; }
    .location-section h3 { font-size: 18px; color: #2c5282; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #DEE2E6; padding: 10px; text-align: center; }
    th { background-color: #ECF0F1; font-weight: bold; color: #34699C; }
    .notices { margin-top: 30px; padding: 20px; background-color: #f8f9fa; }
    .notices h3 { font-size: 16px; color: #2c5282; margin-bottom: 10px; }
    .notices p { margin-bottom: 8px; color: #4a5568; }
    .footer { padding: 15px; text-align: center; background-color: #f8f9fa; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
    `;
  };

  const getSimplifiedStyles = () => {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }
    body { background-color: #f5f7fa; color: #343a40; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; padding: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #2c5282; margin-bottom: 10px; }
    .header p { color: #718096; }
    .quick-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-item { display: flex; align-items: center; gap: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
    .icon { width: 40px; height: 40px; color: #4299e1; }
    .info-item strong { display: block; color: #2c5282; margin-bottom: 5px; }
    .info-item p { color: #4a5568; }
    .schedule-summary { margin-bottom: 30px; }
    .day-summary { border-left: 3px solid #4299e1; padding-left: 20px; margin-bottom: 20px; }
    .day-header { font-weight: bold; color: #2c5282; font-size: 18px; }
    .day-date { color: #718096; margin-bottom: 10px; }
    .event { margin-bottom: 5px; color: #4a5568; }
    .notices { padding: 15px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px; }
    .notices p { color: #4a5568; margin-bottom: 8px; }
    .footer { text-align: center; color: #718096; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
    `;
  };

  const getRoomAssignmentStyles = () => {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }
    body { background-color: #f5f7fa; color: #343a40; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; padding: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #2c5282; margin-bottom: 10px; }
    .header p { color: #718096; }
    .room-section { margin-bottom: 30px; }
    .room-section h2 { font-size: 18px; color: #2c5282; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #DEE2E6; padding: 10px; text-align: center; }
    th { background-color: #ECF0F1; font-weight: bold; color: #34699C; }
    .notices { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
    .notices h3 { font-size: 16px; color: #2c5282; margin-bottom: 10px; }
    .notices p { margin-bottom: 8px; color: #4a5568; }
    .footer { text-align: center; margin-top: 30px; color: #718096; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
    `;
  };

  const getTeeTimeStyles = () => {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }
    body { background-color: #f5f7fa; color: #343a40; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; padding: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #2c5282; margin-bottom: 10px; }
    .header p { color: #718096; margin-bottom: 5px; }
    .tee-time-section { margin-bottom: 30px; }
    .tee-time-section h2 { font-size: 18px; color: #2c5282; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #DEE2E6; padding: 10px 8px; text-align: center; }
    th { background-color: #ECF0F1; font-weight: bold; color: #34699C; font-size: 14px; }
    td { font-size: 14px; }
    .players-cell { text-align: left; padding-left: 15px; }
    .player-name { margin-right: 5px; }
    .notices { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 3px solid #4299e1; }
    .notices h3 { font-size: 16px; color: #2c5282; margin-bottom: 10px; }
    .notices ul { list-style: none; }
    .notices li { padding: 4px 0; color: #4A5568; font-size: 14px; }
    .notices li:before { content: "•"; margin-right: 8px; color: #4299e1; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; }
    .no-data, .error { text-align: center; padding: 40px; color: #718096; font-size: 16px; }
    .error { color: #e53e3e; }
    @media print { body { padding: 0; } .container { box-shadow: none; max-width: 100%; } }
    `;
  };

  // 헬퍼 함수들
  const getParking = (place: string) => {
    if (place.includes('양재')) return '10,000원';
    if (place.includes('수원')) return '7,000원';
    return '무료';
  };

  const getArrivalTime = (time: string) => {
    if (!time) return '';
    // HH:MM:SS 형식에서 HH:MM만 추출
    const timeStr = time.slice(0, 5);
    const [hour, minute] = timeStr.split(':').map(Number);
    let arrivalHour = hour;
    let arrivalMinute = minute - 20;
    
    if (arrivalMinute < 0) {
      arrivalMinute += 60;
      arrivalHour = hour > 0 ? hour - 1 : 23;
    }
    
    return `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`;
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

  // document_settings에 따라 활성화된 문서만 표시
  const enabledDocuments = DOCUMENT_TYPES.filter(doc => 
    tourData.document_settings?.[doc.id] !== false
  );

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
        <div className="flex space-x-8 overflow-x-auto">
          {enabledDocuments.map(doc => (
            <button
              key={doc.id}
              className={`pb-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === doc.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(doc.id)}
            >
              <span className="mr-1">{doc.icon}</span>
              {doc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 문서 정보 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
        <p className="text-sm text-blue-700">
          <strong>활성 문서:</strong> {enabledDocuments.length}개 / 
          총 {DOCUMENT_TYPES.length}개 문서 중 활성화된 문서만 표시됩니다.
        </p>
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