import { TourData } from '../types';
import { htmlWrapper } from '../utils/generators';

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
      <div class="header">
        <h1>객실 배정표${isStaff ? ' (스탭용)' : ''}</h1>
        <p>${tourData.title}</p>
      </div>
      
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
                      ${roomParticipants.map((participant, index) => `
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
      ` : ''}
    </div>
    
    <style>
      ${getRoomAssignmentStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 객실 배정표${isStaff ? ' (스탭용)' : ''}`, content);
}

function getRoomAssignmentStyles(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 10mm;
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
}
