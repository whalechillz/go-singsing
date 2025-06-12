import { TourData, ProductData } from '../types';
import { htmlWrapper } from '../utils/generators';
import { generateCommonHeader, getCommonHeaderStyles, generateCommonFooter, getCommonFooterStyles } from '../utils/commonStyles';

export function generateRoomAssignmentHTML(
  assignments: any[],
  rooms: any[],
  tourStaff: any,
  isStaff: boolean,
  tourData: TourData,
  productData: ProductData | null
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
        })
        // 고객용에서는 기사 객실 제외
        .filter(room => {
          if (!isStaff) {
            const roomNumber = room.room_number || '';
            return !roomNumber.includes('기사');
          }
          return true;
        })
        .map(room => {
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
                        <th width="50">No</th>
                        <th>성명</th>
                        ${isStaff ? '<th>연락처</th>' : ''}
                        <th width="100">팀</th>
                        ${isStaff ? '<th>비고</th>' : ''}
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
      ` : productData && (productData.usage_hotel || productData.usage_meal) ? `
        ${productData.usage_hotel ? `
          <div class="accommodation-info">
            <h3>숙소 이용 안내</h3>
            <div class="notice-section">
              ${productData.usage_hotel.split('\n').map(line => 
                line.trim() ? `<p>${line.trim()}</p>` : ''
              ).join('')}
            </div>
          </div>
        ` : ''}
        
        ${productData.usage_meal ? `
          <div class="meal-info">
            <h3>식사 안내</h3>
            <div class="notice-section">
              ${productData.usage_meal.split('\n').map(line => 
                line.trim() ? `<p>${line.trim()}</p>` : ''
              ).join('')}
            </div>
          </div>
        ` : ''}
      ` : ''}
      
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
      font-size: 14px;
    }
    
    .container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
    }
    
    /* 객실 배정표 전용 스타일 */
    
    .content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .room-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      border: 1px solid #e5e7eb;
      page-break-inside: avoid;
    }
    
    .room-card.comp-room {
      border: 2px solid #e74c3c;
      box-shadow: 0 2px 8px rgba(231, 76, 60, 0.2);
    }
    
    .room-header {
      background: #2c5282;
      color: white;
      padding: 15px 20px;
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
      font-size: 18px;
      font-weight: bold;
    }
    
    .room-type {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .room-capacity {
      font-size: 14px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: 12px;
    }
    
    .room-body {
      padding: 0;
    }
    
    .empty-room {
      text-align: center;
      color: #999;
      padding: 30px;
      font-style: italic;
      font-size: 14px;
    }
    
    .participant-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    
    .participant-table th {
      background: #f8f9fa;
      padding: 12px 15px;
      text-align: center;
      font-size: 14px;
      color: #555;
      border-bottom: 2px solid #e5e7eb;
      font-weight: bold;
    }
    
    .participant-table td {
      padding: 12px 15px;
      font-size: 14px;
      border-bottom: 1px solid #f0f0f0;
      text-align: center;
    }
    
    .participant-table tr:last-child td {
      border-bottom: none;
    }
    
    .participant-table tbody tr:hover {
      background: #f8f9fa;
    }
    
    .text-center {
      text-align: center;
    }
    
    .internal-info {
      margin: 20px 0;
      padding: 20px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 10px;
    }
    
    .internal-info h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #856404;
    }
    
    .internal-info p {
      margin: 5px 0;
      font-size: 14px;
      color: #856404;
    }
    
    /* 숙소 이용 안내 스타일 */
    .accommodation-info,
    .meal-info {
      margin: 30px 0;
      padding: 25px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #2c5282;
      page-break-inside: avoid;
    }
    
    .accommodation-info h3,
    .meal-info h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #2c5282;
      font-weight: bold;
    }
    
    .notice-section {
      margin-top: 0;
    }
    
    .notice-section p {
      margin: 8px 0;
      font-size: 14px;
      color: #495057;
      line-height: 1.6;
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
        padding: 20px;
        max-width: 100%;
      }
      
      .content {
        gap: 15px;
        grid-template-columns: repeat(2, 1fr);
      }
      
      .room-card {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .room-header {
        background: #2c5282 !important;
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
    }
    
    /* 모바일 반응형 */
    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
      
      .content {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .room-header {
        padding: 12px 16px;
      }
      
      .room-number {
        font-size: 16px;
      }
      
      .participant-table th,
      .participant-table td {
        padding: 10px 12px;
        font-size: 13px;
      }
    }
  `;
}
