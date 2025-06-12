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
              <div class="boarding-card route-stop">
                <div class="card-border"></div>
                <div class="card-content">
                  <div class="route-header">
                    <div class="route-number">${index + 1}</div>
                    <div class="route-info-main">
                      <div class="card-title">
                        <span class="location-name">${boardingSpot.name}</span>
                        <span class="location-type">(탑승지)</span>
                      </div>
                      <div class="time-wrapper">
                        <span class="time-prefix">${timePrefix}</span>
                        <span class="card-time">${displayTime}</span>
                      </div>
                      <div class="card-date">${formatDate(tourData.start_date, true)}</div>
                    </div>
                  </div>
                  
                  <div class="card-info">
                    <div class="info-parking">주차: ${boardingSpot.parking_info || '무료'}</div>
                    <div class="info-arrival">${item.arrival_time ? item.arrival_time.slice(0, 5) : getArrivalTime(item.departure_time || '미정')} 도착</div>
                    ${item.passenger_count ? `<div class="info-passenger">탑승인원: ${item.passenger_count}명</div>` : ''}
                  </div>
                  
                  ${boardingSpot.description ? `
                    <div class="location-info">
                      <p class="location-desc">${boardingSpot.description}</p>
                    </div>
                  ` : ''}
                </div>
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
    
    .card-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .location-name { color: #2c5282; }
    .location-type { font-size: 14px; color: #666; font-weight: normal; }
    
    .time-wrapper {
      display: flex;
      align-items: baseline;
      gap: 5px;
      margin-bottom: 5px;
    }
    
    .time-prefix { font-size: 14px; color: #666; }
    .card-time { font-size: 24px; font-weight: bold; color: #2c5282; }
    .card-date { font-size: 14px; color: #666; }
    
    .card-info {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
      margin: 15px 0;
    }
    
    .location-info { margin-top: 15px; }
    .location-desc { font-size: 14px; line-height: 1.6; color: #333; }
    
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
