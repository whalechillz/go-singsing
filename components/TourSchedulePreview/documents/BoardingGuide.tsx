import { TourData } from '../types';
import { htmlWrapper, getCommonStyles } from '../utils/generators';
import { formatTime, formatDate, getArrivalTime } from '../utils/formatters';

export function generateBoardingGuideHTML(
  tourData: TourData,
  journeyItems: any[], // tour_journey_items with spot relations
  isStaff: boolean,
  participants?: any[]
): string {
  if (isStaff && participants) {
    return generateStaffBoardingHTML(tourData, journeyItems, participants);
  }
  
  // journeyItems에서 탑승지와 경유지 분리
  const boardingItems = journeyItems.filter(item => 
    item.spot && item.spot.category === 'boarding'
  );
  
  const waypointItems = journeyItems.filter(item => 
    item.spot && ['rest_area', 'tourist_spot', 'restaurant'].includes(item.spot.category)
  );
  
  const content = `
    <div class="container">
      <div class="route-section">
        <div class="route-header-box">
          <div class="route-header-title">싱싱골프투어</div>
          <div class="route-header-subtitle">${tourData.title}</div>
          <div class="route-header-date">${formatDate(tourData.start_date)} ~ ${formatDate(tourData.end_date)}</div>
        </div>
        
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
                      <div class="card-date">${formatDate(tourData.start_date)}</div>
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
          
          ${waypointItems.map((item, waypointIndex) => {
            const orderNumber = boardingItems.length + waypointIndex + 1;
            const spot = item.spot;
            if (!spot) return '';
            
            const isRestStop = spot.category === 'rest_area';
            const isTourist = spot.category === 'tourist_spot';
            const icon = isRestStop ? '☕' : isTourist ? '🏛️' : '🍽️';
            const { timePrefix, displayTime } = formatTime(item.arrival_time || '미정');
            
            return `
              <div class="boarding-card waypoint-stop">
                <div class="card-border ${isRestStop ? 'rest-stop' : isTourist ? 'tourist-stop' : ''}"></div>
                <div class="card-content">
                  <div class="route-header">
                    <div class="route-number ${isRestStop ? 'rest' : isTourist ? 'tourist' : ''}">${orderNumber}</div>
                    <div class="route-info-main">
                      <div class="card-title">
                        <span class="waypoint-icon">${icon}</span>
                        <span class="location-name">${spot.name}</span>
                      </div>
                      <div class="time-wrapper">
                        <span class="time-prefix">${timePrefix}</span>
                        <span class="card-time waypoint-time">${displayTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="waypoint-info">
                    <div class="waypoint-duration">체류시간: 약 ${item.stay_duration || '30분'}</div>
                    ${spot.description ? `<div class="waypoint-desc">${spot.description}</div>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      ${tourData.staff?.length ? `
        <div class="contact-box">
          <div class="contact-title">비상 연락처</div>
          ${tourData.staff.map(staff => `
            <div class="contact-phone">${staff.name} ${staff.role} - ${staff.phone}</div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="footer">
        <p>즐거운 골프 여행 되시길 바랍니다</p>
        <p>싱싱골프투어 | 031-215-3990</p>
      </div>
    </div>
    
    <style>
      ${getBoardingGuideStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 탑승 안내`, content);
}

function generateStaffBoardingHTML(tourData: TourData, journeyItems: any[], participants: any[]): string {
  // 탑승지별로 참가자 그룹화
  const participantsByLocation: Record<string, any[]> = participants.reduce((acc: Record<string, any[]>, participant: any) => {
    const location = participant.pickup_location || '미정';
    if (!acc[location]) acc[location] = [];
    acc[location].push(participant);
    return acc;
  }, {} as Record<string, any[]>);
  
  const content = `
    <div class="container">
      <div class="header">
        <h1>스탭용 탑승명단</h1>
        <p>${tourData.title}</p>
        <p>${formatDate(tourData.start_date, false)} ~ ${formatDate(tourData.end_date, false)}</p>
      </div>
      
      <div class="summary">
        <p>총 참가자: ${participants.length}명</p>
      </div>
      
      ${Object.entries(participantsByLocation).map(([location, locationParticipants]: [string, any[]]) => `
        <div class="location-section">
          <h2>${location} (${locationParticipants.length}명)</h2>
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
              ${locationParticipants.map((participant: any, index: number) => `
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
      `).join('')}
    </div>
    
    <style>
      ${getStaffDocumentStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 스탭용 탑승명단`, content);
}

function getBoardingGuideStyles(): string {
  return `
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
    
    .card-border.rest-stop { background: #F59E0B; }
    .card-border.tourist-stop { background: #10B981; }
    
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
    
    .route-number.rest { background: #F59E0B; }
    .route-number.tourist { background: #10B981; }
    
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
    
    .waypoint-icon { font-size: 20px; }
    .waypoint-info { margin-top: 15px; }
    .waypoint-duration { font-size: 14px; color: #4a6fa5; font-weight: bold; margin-bottom: 5px; }
    .waypoint-desc { font-size: 14px; color: #666; line-height: 1.6; }
    
    .contact-box {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      text-align: center;
    }
    
    .contact-title { font-size: 16px; font-weight: bold; color: #2c5282; margin-bottom: 10px; }
    .contact-phone { font-size: 14px; color: #333; margin-bottom: 5px; }
  `;
}

function getStaffDocumentStyles(): string {
  return `
    .summary {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
      font-weight: bold;
    }
    
    .location-section {
      margin-bottom: 30px;
    }
    
    .location-section h2 {
      background: #4a6fa5;
      color: white;
      padding: 10px 15px;
      margin-bottom: 0;
      font-size: 16px;
    }
    
    .participant-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }
    
    .participant-table th {
      background: #f8f9fa;
      padding: 8px;
      text-align: center;
      font-size: 12px;
      font-weight: bold;
      border: 1px solid #ddd;
    }
    
    .participant-table td {
      padding: 8px;
      font-size: 12px;
      border: 1px solid #ddd;
    }
    
    .text-center { text-align: center; }
  `;
}
