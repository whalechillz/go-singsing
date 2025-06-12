import { TourData } from '../types';
import { htmlWrapper } from '../utils/generators';
import { generateCommonHeader, getCommonHeaderStyles, generateCommonFooter, getCommonFooterStyles } from '../utils/commonStyles';

export function generateRoomAssignmentHTML(
  assignments: any[],
  rooms: any[],
  tourStaff: any,
  isStaff: boolean,
  tourData: TourData
): string {
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

  const driverInfo = isStaff && tourStaff ? {
    name: tourStaff.name,
    phone: tourStaff.phone,
    room: tourStaff.room_number || '별도 배정'
  } : null;

  const content = `
    <div class="container">
      ${generateCommonHeader(tourData, `객실 배정표${isStaff ? ' (스탭용)' : ''}`, isStaff)}
      
      <div class="content">
        ${rooms.sort((a, b) => {
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
          <p>※ 이 문서는 스탭용으로 고객에게 제공하지 마세요.</p>
        </div>
      ` : `
        <div class="accommodation-info">
          <h3>숙소 이용 안내</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>체크인</strong>
              <span>15:00 이후</span>
            </div>
            <div class="info-item">
              <strong>체크아웃</strong>
              <span>11:00 이전</span>
            </div>
            <div class="info-item">
              <strong>프런트 데스크</strong>
              <span>24시간 운영</span>
            </div>
            <div class="info-item">
              <strong>Wi-Fi</strong>
              <span>전 객실 무료 제공</span>
            </div>
          </div>
          <div class="notice-section">
            <p>• 객실 내 금연입니다. 흡연은 지정된 흡연 구역에서만 가능합니다.</p>
            <p>• 미니바 이용 시 별도 요금이 청구됩니다.</p>
            <p>• 귀중품은 객실 내 금고를 이용해 주시기 바랍니다.</p>
            <p>• 분실물 발생 시 프런트에 문의해 주세요.</p>
          </div>
        </div>
        
        <div class="meal-info">
          <h3>식사 안내</h3>
          <div class="meal-grid">
            <div class="meal-item">
              <strong>조식</strong>
              <div class="meal-details">
                <span>시간: 06:30 ~ 09:30</span>
                <span>장소: 2층 레스토랑</span>
                <span>형태: 뷔페</span>
              </div>
            </div>
            <div class="meal-item">
              <strong>중식</strong>
              <div class="meal-details">
                <span>시간: 12:00 ~ 14:00</span>
                <span>장소: 골프장 클럽하우스</span>
                <span>형태: 단품 메뉴</span>
              </div>
            </div>
            <div class="meal-item">
              <strong>석식</strong>
              <div class="meal-details">
                <span>시간: 18:00 ~ 21:00</span>
                <span>장소: 2층 레스토랑</span>
                <span>형태: 코스 요리</span>
              </div>
            </div>
          </div>
          <div class="notice-section">
            <p>• 조식은 투숙객에 한해 무료로 제공됩니다.</p>
            <p>• 중식 및 석식은 별도 요금이 발생합니다.</p>
            <p>• 룸서비스는 24시간 이용 가능합니다. (별도 요금)</p>
            <p>• 알레르기가 있으신 경우 미리 말씀해 주세요.</p>
          </div>
        </div>
      `}
      
      ${generateCommonFooter(tourData, isStaff, isStaff ? 'room_assignment_staff' : 'room_assignment')}
    </div>
    
    <style>
      ${getCommonHeaderStyles(isStaff)}
      ${getCommonFooterStyles(isStaff)}
      ${getRoomAssignmentStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 객실 배정표${isStaff ? ' (스탭용)' : ''}`, content);
}

function getRoomAssignmentStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      background: white;
      padding: 0;
    }
    
    /* 객실 배정표 전용 스타일 */
    
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
    
    /* 숙소 이용 안내 스타일 */
    .accommodation-info,
    .meal-info {
      margin: 15px 5px;
      padding: 15px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      page-break-inside: avoid;
    }
    
    .accommodation-info h3,
    .meal-info h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #2c5282;
      font-weight: bold;
      border-bottom: 2px solid #a1b7d1;
      padding-bottom: 5px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 11px;
    }
    
    .info-item strong {
      color: #495057;
      font-weight: bold;
    }
    
    .info-item span {
      color: #6c757d;
    }
    
    .meal-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }
    
    .meal-item {
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 8px;
      background: white;
    }
    
    .meal-item strong {
      display: block;
      font-size: 12px;
      color: #2c5282;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .meal-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .meal-details span {
      font-size: 10px;
      color: #6c757d;
    }
    
    .notice-section {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #e9ecef;
    }
    
    .notice-section p {
      margin: 3px 0;
      font-size: 10px;
      color: #495057;
      line-height: 1.4;
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
      
      /* 헤더 스타일은 공통 스타일에서 처리 */
      
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
      
      .accommodation-info,
      .meal-info {
        background: #f8f9fa !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .meal-item {
        background: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    @media screen {
      .container {
        padding: 0;
        max-width: 1200px;
      }
      
      .content {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        padding: 0 20px;
      }
      
      .internal-info {
        margin: 15px 20px;
      }
      
      .accommodation-info,
      .meal-info {
        margin: 15px 20px;
      }
      
      .meal-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }
  `;
}
