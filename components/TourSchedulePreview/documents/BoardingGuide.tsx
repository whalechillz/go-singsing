import { TourData } from '../types';
import { htmlWrapper, getCommonStyles } from '../utils/generators';
import { formatTime, formatDate, getArrivalTime } from '../utils/formatters';
import { generateCommonHeader, getCommonHeaderStyles } from '../utils/commonStyles';

export function generateBoardingGuideHTML(
  tourData: TourData,
  journeyItems: any[], // tour_journey_items with spot relations
  isStaff: boolean,
  participants?: any[]
): string {
  if (isStaff && participants) {
    return generateStaffBoardingHTML(tourData, journeyItems, participants);
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
              <div class="boarding-card-modern">
                <div class="card-header-section">
                  <h3 class="boarding-title">${boardingSpot.name} ${boardingSpot.address ? `(${boardingSpot.address.split(' ')[1] || ''})` : ''}</h3>
                  <div class="boarding-time-display">
                    <span class="time-prefix-modern">${timePrefix}</span>
                    <span class="time-main">${displayTime}</span>
                  </div>
                  <div class="boarding-date">${formatDate(tourData.start_date, true)}</div>
                  <div class="boarding-info-row">
                    <span class="info-label">주차:</span>
                    <span class="info-value">${boardingSpot.parking_info || '제한적'}</span>
                    <span class="info-divider"></span>
                    <span class="info-value departure">${item.arrival_time ? item.arrival_time.slice(0, 5) : getArrivalTime(item.departure_time || '미정')} 도착</span>
                  </div>
                </div>
                
                ${boardingSpot.description || boardingSpot.address || boardingSpot.naver_map_url ? `
                  <div class="location-details-section">
                    ${boardingSpot.description ? `
                      <div class="detail-box">
                        <span class="detail-icon">📍</span>
                        <div class="detail-content">
                          <h4 class="detail-title">버스탑승지</h4>
                          <p class="detail-text">${boardingSpot.description}</p>
                        </div>
                      </div>
                    ` : ''}
                    
                    ${boardingSpot.address || boardingSpot.naver_map_url ? `
                      <div class="detail-box">
                        <span class="detail-icon">📍</span>
                        <div class="detail-content">
                          <h4 class="detail-title">주차장 오는길</h4>
                          <p class="detail-text">${boardingSpot.address || boardingSpot.name}</p>
                          ${boardingSpot.naver_map_url ? `
                            <a href="${boardingSpot.naver_map_url}" target="_blank" class="map-button">네이버 지도에서 보기</a>
                          ` : ''}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      ${tourData.staff && tourData.staff.filter((staff: any) => staff.role.includes('기사')).length > 0 ? `
        <div class="emergency-contact-section">
          <div class="emergency-contact-title">비상 연락처</div>
          <div class="emergency-contact-grid">
            ${tourData.staff.filter((staff: any) => staff.role.includes('기사')).map((staff: any) => `
              <div class="emergency-contact-item">
                <span class="contact-name">${staff.name} ${staff.role}</span>
                <span class="contact-phone">TEL. ${staff.phone}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}    
      
      <div class="footer">
        <p>즐거운 골프 여행 되시길 바랍니다</p>
        <p>싱싱골프투어 | 031-215-3990</p>
      </div>
    </div>
    
    <style>
      ${getCommonHeaderStyles(false)}
      ${getBoardingGuideStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 탑승 안내`, content);
}

function generateStaffBoardingHTML(tourData: TourData, journeyItems: any[], participants: any[]): string {
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
        <p>즐거운 골프 여행 되시길 바랍니다</p>
        <p>싱싱골프투어 | 031-215-3990</p>
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
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .boarding-cards {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .boarding-card-modern {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    
    .card-header-section {
      padding: 24px;
      text-align: center;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .boarding-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 16px 0;
    }
    
    .boarding-time-display {
      margin-bottom: 8px;
    }
    
    .time-prefix-modern {
      font-size: 14px;
      color: #6b7280;
      margin-right: 8px;
    }
    
    .time-main {
      font-size: 36px;
      font-weight: 700;
      color: #dc2626;
    }
    
    .boarding-date {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 20px;
    }
    
    .boarding-info-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px 20px;
      background: #f9fafb;
      border-radius: 8px;
      font-size: 14px;
    }
    
    .info-label {
      color: #6b7280;
    }
    
    .info-value {
      color: #374151;
      font-weight: 500;
    }
    
    .info-divider {
      width: 1px;
      height: 16px;
      background: #e5e7eb;
      margin: 0 8px;
    }
    
    .info-value.departure {
      color: #dc2626;
    }
    
    .location-details-section {
      padding: 24px;
    }
    
    .detail-box {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    
    .detail-box:last-child {
      margin-bottom: 0;
    }
    
    .detail-icon {
      font-size: 20px;
      flex-shrink: 0;
    }
    
    .detail-content {
      flex: 1;
    }
    
    .detail-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 4px 0;
    }
    
    .detail-text {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }
    
    .map-button {
      display: inline-block;
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    .map-button:hover {
      background: #2563eb;
    }
    
    .emergency-contact-section {
      margin: 30px 0;
      padding: 20px;
      background: #e7f3ff;
      border-radius: 10px;
      border-left: 5px solid #2c5282;
    }
    
    .emergency-contact-title {
      font-size: 16px;
      font-weight: bold;
      color: #2c5282;
      margin-bottom: 15px;
    }
    
    .emergency-contact-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .emergency-contact-item {
      font-size: 14px;
      color: #333;
    }
    
    .emergency-contact-item .contact-name {
      font-weight: 500;
      margin-right: 10px;
    }
    
    .emergency-contact-item .contact-phone {
      color: #2c5282;
      font-weight: 500;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
    }
    
    .footer p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    /* 모바일 반응형 */
    @media (max-width: 768px) {
      .boarding-card-modern {
        border-radius: 12px;
      }
      
      .card-header-section {
        padding: 20px;
      }
      
      .boarding-title {
        font-size: 15px;
      }
      
      .time-main {
        font-size: 32px;
      }
      
      .boarding-info-row {
        padding: 10px 16px;
        font-size: 13px;
      }
      
      .location-details-section {
        padding: 20px;
      }
      
      .detail-box {
        padding: 12px;
      }
      
      .map-button {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
    
    /* 인쇄용 스타일 */
    @media print {
      .boarding-card-modern {
        page-break-inside: avoid;
        box-shadow: none;
        border: 1px solid #d1d5db;
      }
      
      .time-main {
        color: #dc2626 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .info-value.departure {
        color: #dc2626 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .map-button {
        background: #3b82f6 !important;
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
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
    }
    
    .footer p {
      margin: 5px 0;
      font-size: 14px;
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
