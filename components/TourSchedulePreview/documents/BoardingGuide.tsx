import { TourData, ProductData } from '../types';
import { htmlWrapper, getCommonStyles } from '../utils/generators';
import { formatTime, formatDate, getArrivalTime } from '../utils/formatters';
import { generateCommonHeader, getCommonHeaderStyles } from '../utils/commonStyles';

export function generateBoardingGuideHTML(
  tourData: TourData,
  journeyItems: any[], // tour_journey_items with spot relations
  isStaff: boolean,
  participants?: any[],
  productData?: ProductData | null
): string {
  if (isStaff && participants) {
    return generateStaffBoardingHTML(tourData, journeyItems, participants, productData);
  }
  
  // journeyItems에서 탑승지만 추출 (첫날만)
  const boardingItems = journeyItems.filter(item => 
    item.spot && item.spot.category === 'boarding' && item.day_number === 1
  );
  
  const content = `
    <div class="container">
      ${generateCommonHeader(tourData, '탑승 안내', false)}
      
      <div class="route-section">
        
        <div class="boarding-cards">
          ${boardingItems.map((item, index) => {
            const boardingSpot = item.spot;
            if (!boardingSpot) return '';
            const departureTime = item.departure_time ? item.departure_time.slice(0, 5) : '미정';
            const { timePrefix, displayTime } = formatTime(departureTime);
            
            return `
              <div class="boarding-card">
                <div class="card-border"></div>
                <div class="card-content">
                  <div class="card-title">${boardingSpot.name}</div>
                  <div class="card-time">${timePrefix} ${displayTime}</div>
                  <div class="card-date">${formatDate(tourData.start_date, true)}</div>
                  <div class="card-info">
                    <div class="info-parking">주차: ${boardingSpot.parking_info || '제한적'}</div>
                    <div class="info-arrival">${item.arrival_time ? item.arrival_time.slice(0, 5) : getArrivalTime(item.departure_time || '미정')} 도착</div>
                  </div>
                  
                  ${boardingSpot.description || boardingSpot.address || boardingSpot.naver_map_url ? `
                    <div class="location-info">
                      ${boardingSpot.description ? `
                        <div class="location-section">
                          <p class="location-title">버스탑승지</p>
                          <p class="location-main">${boardingSpot.description}</p>
                          ${boardingSpot.address ? `<p class="location-sub">${boardingSpot.address}</p>` : ''}
                        </div>
                      ` : ''}
                      
                      ${boardingSpot.parking_detail || boardingSpot.naver_map_url ? `
                        <div class="location-section">
                          <p class="location-title">주차장 오는길</p>
                          <p class="location-main">${boardingSpot.parking_detail || boardingSpot.name + ' 주차장'}</p>
                          ${boardingSpot.naver_map_url ? `
                            <a href="${boardingSpot.naver_map_url}" class="map-link" target="_blank">네이버 지도에서 보기</a>
                          ` : ''}
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <!-- 탑승 주의사항 -->
      ${productData?.usage_bus ? `
        <div class="common-info">
          <h3 class="section-title">탑승 주의사항</h3>
          <ul class="notice-list">
            ${productData.usage_bus.split('\n')
              .filter((notice: string) => {
                // 당구장 관련 내용 필터링
                const lowerNotice = notice.toLowerCase();
                return notice.trim() && 
                       !lowerNotice.includes('당구') && 
                       !lowerNotice.includes('큐대') &&
                       !lowerNotice.includes('포켓볼');
              })
              .map((notice: string) => 
                `<li class="notice-item">${notice.replace(/^[•·\-\*]\s*/, '')}</li>`
              ).join('')}
          </ul>
          
          ${tourData.staff && tourData.staff.filter((staff: any) => staff.role.includes('기사')).length > 0 ? `
            <div class="contact-box">
              ${tourData.staff.filter((staff: any) => staff.role.includes('기사')).map((staff: any) => `
                <div class="contact-title">비상 연락처 - ${staff.name} ${staff.role}</div>
                <div class="contact-phone">${staff.phone}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <!-- 푸터 -->
      ${(() => {
        const phoneSettings = isStaff ? 
          tourData.phone_display_settings?.staff_boarding : 
          tourData.phone_display_settings?.customer_boarding;
        const contactInfo = [];
        
        // 예약/일반 문의: 회사 대표번호
        if (phoneSettings?.show_company_phone && tourData.company_phone) {
          contactInfo.push({ label: '예약/일반 문의', phone: tourData.company_phone });
        }
        
        // 현장 문의: 가이드 전화번호
        if (phoneSettings?.show_guide_phone && tourData.staff) {
          const guide = tourData.staff.find(s => s.role === '가이드');
          if (guide?.phone) contactInfo.push({ label: '현장 문의', phone: guide.phone });
        }
        
        // 긴급 연락처: 매니저 업무폰 (스탭용만)
        if (isStaff && phoneSettings && 'show_manager_phone' in phoneSettings && phoneSettings.show_manager_phone && tourData.staff) {
          const manager = tourData.staff.find(s => s.role === '매니저');
          if (manager?.phone) contactInfo.push({ label: '긴급 연락처', phone: manager.phone });
        }
        
        // 기사 전화번호 (기존 유지)
        if (phoneSettings?.show_driver_phone && tourData.staff) {
          const driver = tourData.staff.find(s => s.role === '기사');
          if (driver?.phone) contactInfo.push({ label: '기사', phone: driver.phone });
        }
        
        return !isStaff ? `
          <div class="custom-footer">
            <div class="custom-footer-message">♡ 안전한 탑승과 즐거운 여행 되세요 ♡</div>
          </div>
        ` : `
          <div class="footer">
            <p>♡ 안전한 탑승과 즐거운 여행 되세요 ♡</p>
            ${contactInfo.length > 0 ? `
              <div class="contact-info">
                <p class="contact-info-title">연락처</p>
                <div class="contact-items">
                  ${contactInfo.map(item => `<span class="contact-item"><span class="contact-label">${item.label}:</span> <span class="contact-phone">${item.phone}</span></span>`).join(' | ')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      })()}
    </div>
    
    <style>
      ${getCommonHeaderStyles(false)}
      ${getBoardingGuideStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 탑승 안내`, content);
}

function generateStaffBoardingHTML(tourData: TourData, journeyItems: any[], participants: any[], productData?: ProductData | null): string {
  // journeyItems에서 탑승지만 추출 (첫날만)
  const boardingItems = journeyItems.filter(item => 
    item.spot && item.spot.category === 'boarding' && item.day_number === 1
  );
  
  // 탑승지별로 참가자 그룹화 및 탑승지 순서 보존
  const participantsByLocation: Record<string, any[]> = {};
  const orderedLocations: string[] = [];
  
  // journeyItems 순서대로 탑승지 목록 생성
  boardingItems.forEach(item => {
    if (item.spot) {
      const locationName = item.spot.name;
      orderedLocations.push(locationName);
      participantsByLocation[locationName] = [];
    }
  });
  
  // 참가자를 해당 탑승지에 할당
  participants.forEach(participant => {
    const location = participant.pickup_location || '미정';
    if (!participantsByLocation[location]) {
      participantsByLocation[location] = [];
      if (location !== '미정') {
        orderedLocations.push(location);
      }
    }
    participantsByLocation[location].push(participant);
  });
  
  // 미정은 맨 뒤로
  if (participantsByLocation['미정'] && participantsByLocation['미정'].length > 0) {
    orderedLocations.push('미정');
  }
  
  const content = `
    <div class="container">
      ${generateCommonHeader(tourData, '탑승안내 (스탭용)', true)}
      
      <div class="document-title-section staff">
        <div class="document-title">총 참가자: ${participants.length}명</div>
      </div>
      
      ${orderedLocations.map((location) => {
        const locationParticipants = participantsByLocation[location] || [];
        if (locationParticipants.length === 0) return '';
        
        // journeyItems에서 해당 탑승지 정보 찾기
        const boardingItem = boardingItems.find(item => item.spot && item.spot.name === location);
        const departureTime = boardingItem?.departure_time ? boardingItem.departure_time.slice(0, 5) : '미정';
        
        return `
          <div class="location-section">
            <div class="location-header">
              <div class="location-title">${location} (${locationParticipants.length}명)</div>
              <div class="location-time">출발: ${departureTime}</div>
            </div>
            <table class="participant-table">
              <thead>
                <tr>
                  <th width="50">No</th>
                  <th width="100">성명</th>
                  <th width="140">연락처</th>
                  <th>팀</th>
                </tr>
              </thead>
              <tbody>
                ${locationParticipants.map((participant: any, index: number) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${participant.name}</td>
                    <td class="text-center">${participant.phone}</td>
                    <td class="text-center">${participant.team_name || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}
      
      <div class="footer">
        <p>♡ 안전한 탑승과 즐거운 여행 되세요 ♡</p>
        ${(() => {
          const phoneSettings = tourData.phone_display_settings?.staff_boarding;
          const contactInfo = [];
          
          // 예약/일반 문의: 회사 대표번호
          if (phoneSettings?.show_company_phone && tourData.company_phone) {
            contactInfo.push({ label: '예약/일반 문의', phone: tourData.company_phone });
          }
          
          // 현장 문의: 가이드 전화번호
          if (phoneSettings?.show_guide_phone && tourData.staff) {
            const guide = tourData.staff.find(s => s.role === '가이드');
            if (guide?.phone) contactInfo.push({ label: '현장 문의', phone: guide.phone });
          }
          
          // 긴급 연락처: 매니저 업무폰
          if (phoneSettings && 'show_manager_phone' in phoneSettings && phoneSettings.show_manager_phone && tourData.staff) {
            const manager = tourData.staff.find(s => s.role === '매니저');
            if (manager?.phone) contactInfo.push({ label: '긴급 연락처', phone: manager.phone });
          }
          
          // 기사 전화번호 (기존 유지)
          if (phoneSettings?.show_driver_phone && tourData.staff) {
            const driver = tourData.staff.find(s => s.role === '기사');
            if (driver?.phone) contactInfo.push({ label: '기사', phone: driver.phone });
          }
          
          return contactInfo.length > 0 ? `
            <div class="contact-info">
              <p class="contact-info-title">연락처</p>
              <div class="contact-items">
                ${contactInfo.map(item => `<span class="contact-item"><span class="contact-label">${item.label}:</span> <span class="contact-phone">${item.phone}</span></span>`).join(' | ')}
              </div>
            </div>
          ` : '';
        })()}
      </div>
    </div>
    
    <style>
      ${getCommonHeaderStyles(true)}
      ${getStaffBoardingStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 스탭용 탑승명단`, content);
}

function getBoardingGuideStyles(): string {
  return `
    /* 탑승 안내 전용 스타일 */
    body {
      background-color: #f5f7fa;
      color: #343a40;
      line-height: 1.6;
      font-size: 16px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .boarding-cards {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 25px;
    }
    
    .boarding-card {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e2e8f0;
      position: relative;
    }
    
    .card-border {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 6px;
      background-color: #3182ce;
      border-radius: 10px 0 0 10px;
    }
    
    .card-content {
      padding: 20px 20px 20px 26px;
    }
    
    .card-title {
      font-size: 20px;
      font-weight: bold;
      color: #2c5282;
      margin-bottom: 15px;
    }
    
    .card-time {
      font-size: 32px;
      font-weight: bold;
      color: #e53e3e;
      margin-bottom: 5px;
    }
    
    .card-date {
      font-size: 16px;
      color: #4a5568;
      margin-bottom: 10px;
    }
    
    .card-info {
      display: flex;
      gap: 15px;
      margin-top: 15px;
      font-size: 14px;
    }
    
    .info-parking, .info-arrival {
      padding: 5px 10px;
      border-radius: 4px;
    }
    
    .info-parking {
      background-color: #ebf8ff;
      color: #2B6CB0;
    }
    
    .info-arrival {
      background-color: #fff5f5;
      color: #e53e3e;
    }
    
    .location-info {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .location-section {
      background-color: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .location-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }
    
    .location-title:before {
      content: "📍";
      margin-right: 5px;
    }
    
    .location-main {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 2px;
    }
    
    .location-sub {
      color: #718096;
      font-size: 13px;
    }
    
    .map-link {
      display: inline-block;
      background-color: #3182ce;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      text-decoration: none;
      margin-top: 5px;
      font-size: 13px;
    }
    
    .map-link:hover {
      background-color: #2c5282;
    }
    
    /* 탑승 주의사항 스타일 */
    .common-info {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e2e8f0;
      margin-bottom: 15px;
      padding: 20px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2c5282;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .notice-list {
      list-style-type: none;
      margin-left: 5px;
    }
    
    .notice-item {
      position: relative;
      padding-left: 20px;
      margin-bottom: 10px;
    }
    
    .notice-item:before {
      content: '※';
      position: absolute;
      left: 0;
      color: #e53e3e;
    }
    
    .contact-box {
      background-color: #edf2f7;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin-top: 15px;
    }
    
    .contact-title {
      font-weight: bold;
      color: #2c5282;
      margin-bottom: 5px;
    }
    
    .contact-phone {
      font-size: 18px;
      font-weight: bold;
      color: #e53e3e;
    }
    
    /* 고객용 커스텀 푸터 스타일 */
    .custom-footer {
      margin-top: 40px;
      padding: 30px;
      background: #4a69bd;
      background: linear-gradient(135deg, #4a69bd 0%, #5f7cdb 100%);
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(74, 105, 189, 0.2);
    }
    
    .custom-footer-message {
      font-size: 20px;
      color: white;
      font-weight: 600;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* 푸터 스타일 */
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #2c5282;
      color: white;
      border-radius: 10px;
      margin-top: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .footer p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .footer > p:first-child {
      font-size: 15px;
      margin-bottom: 10px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    /* 연락처 스타일 */
    .contact-info {
      margin-top: 10px;
    }
    
    .contact-info-title {
      font-weight: bold;
      font-size: 15px;
      margin-bottom: 5px;
    }
    
    .contact-items {
      font-size: 13px;
    }
    
    .contact-item {
      white-space: nowrap;
    }
    
    .contact-label {
      font-weight: 600;
      opacity: 0.9;
    }
    
    .contact-phone {
      font-weight: 500;
    }
    
    /* 모바일 반응형 */
    @media (max-width: 768px) {
      .custom-footer {
        margin-top: 30px;
        padding: 20px;
        border-radius: 12px;
      }
      
      .custom-footer-message {
        font-size: 16px;
      }
    }
    
    /* 넓은 화면에서 2개씩 표시 */
    @media (min-width: 768px) {
      .boarding-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* 인쇄용 스타일 */
    @media print {
      body {
        background-color: white;
      }
      
      .boarding-card {
        page-break-inside: avoid;
        box-shadow: none;
        border: 1px solid #d1d5db;
      }
      
      .card-time {
        color: #e53e3e !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .info-arrival {
        color: #e53e3e !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .map-link {
        background: #3182ce !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .custom-footer {
        background: #4a69bd !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
      }
      
      .footer {
        background-color: #2c5282 !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
}

function getStaffBoardingStyles(): string {
  return `
    /* 공통 스타일 */
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
    }
    
    /* 헤더 스타일은 공통 스타일에서 처리 */
    
    /* 문서 제목 스타일은 공통 스타일에서 처리 */
    
    .location-section {
      margin-bottom: 25px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .location-header {
      background: #4a6fa5;
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .location-title {
      font-size: 16px;
      font-weight: bold;
    }
    
    .location-time {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .participant-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }
    
    .participant-table th {
      background: #f8f9fa;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      border-bottom: 2px solid #e0e0e0;
      color: #555;
    }
    
    .participant-table td {
      padding: 10px;
      font-size: 14px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .participant-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .participant-table tbody tr:hover {
      background: #f8f9fa;
    }
    
    .text-center { text-align: center; }
    
    .footer {
      margin-top: 40px;
      padding: 30px;
      background: #f8f9fa;
      border-radius: 10px;
      text-align: center;
      color: #666;
    }
    
    .footer p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .footer > p:first-child {
      font-size: 15px;
      color: #6B46C1;
      margin-bottom: 12px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    /* 연락처 스타일 */
    .contact-info {
      margin-top: 10px;
    }
    
    .contact-info-title {
      font-weight: bold;
      font-size: 15px;
      color: #2c5282;
      margin-bottom: 5px;
    }
    
    .contact-items {
      font-size: 13px;
    }
    
    .contact-item {
      white-space: nowrap;
    }
    
    .contact-label {
      font-weight: 600;
      color: #555;
    }
    
    .contact-phone {
      color: #2c5282;
    }
    
    /* 인쇄용 스타일 */
    @media print {
      body { margin: 0; padding: 0; }
      .container { max-width: 100%; padding: 20px; }
      .location-section { break-inside: avoid; }
      .document-title-section { break-inside: avoid; }
    }
  `;
}
