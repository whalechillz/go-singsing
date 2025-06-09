import { TourData } from '../types';
import { htmlWrapper } from '../utils/generators';
import { formatDate, formatCourseDisplay, getCourseHeaderClass } from '../utils/formatters';

export function generateTeeTimeHTML(
  teeTimes: any[],
  isStaff: boolean,
  tourData: TourData
): string {
  const teeTimesByDate = teeTimes.reduce((acc, teeTime) => {
    const date = teeTime.date || teeTime.play_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(teeTime);
    return acc;
  }, {} as Record<string, any[]>);

  const content = `
    <div class="container">
      ${isStaff ? `
        <div class="header-container">
          <div class="header-content">
            <div class="title-section">
              <h1>티타임표</h1>
              <p class="subtitle">${tourData.title} / ${tourData.tour_period || `${formatDate(tourData.start_date, false)} ~ ${formatDate(tourData.end_date, false)}`}</p>
            </div>
            <div class="logo-section">
              <div class="logo-text">싱싱골프투어</div>
            </div>
          </div>
        </div>
        
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
        <div class="header">
          <h1>${tourData.title}</h1>
          <p>${tourData.tour_period || `${formatDate(tourData.start_date, false)} ~ ${formatDate(tourData.end_date, false)}`}</p>
        </div>
      `}
      
      ${Object.entries(teeTimesByDate).map(([date, times]: [string, any]) => {
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
        
        if (isStaff) {
          return `
            <div class="day-header">${dateStr}</div>
            <div class="table-container">
              ${Object.entries(courseGroups).map(([course, courseTimes]: [string, any]) => {
                const headerClass = getCourseHeaderClass(course);
                
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
                    }).filter((name: string) => name).join(', ');
                    
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
        
        ${tourData.notices ? `
          <div class="info-section">
            <div class="info-title">안내사항</div>
            <ul class="info-list">
              ${tourData.notices.split('\n').map((notice: string) => 
                notice.trim() ? `<li>${notice.replace(/^[•·\\-]\\s*/, '')}</li>` : ''
              ).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="footer">
          <div class="footer-message">${tourData.footer_message || '즐거운 라운딩 되세요!'}</div>
          <div class="footer-brand">싱싱골프투어</div>
        </div>
      ` : `
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
        
        <div class="footer">
          <div class="footer-message">♡ 즐거운 라운딩 되세요! ♡</div>
          <div class="footer-detail">싱싱골프투어와 함께하는 특별한 하루</div>
        </div>
      `}
    </div>
    
    <style>
      ${isStaff ? getStaffTeeTimeStyles() : getTeeTimeStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 티타임 안내`, content);
}

function getTeeTimeStyles(): string {
  return `
    .schedule-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }
    
    .date-header {
      background: #2c5282;
      color: white;
      padding: 15px 20px;
      font-size: 16px;
      font-weight: bold;
    }
    
    .tee-time-table {
      padding: 20px;
    }
    
    .tee-time-header {
      background: #f8f9fa;
      padding: 10px 15px;
      font-weight: bold;
      color: #4a6fa5;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    
    .tee-time-row {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }
    
    .tee-time-row:last-child {
      border-bottom: none;
    }
    
    .time-box {
      width: 60px;
      font-weight: bold;
      color: #2c5282;
      font-size: 16px;
    }
    
    .players-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .player-names {
      font-size: 14px;
      color: #333;
    }
    
    .player-count {
      font-size: 12px;
      color: #666;
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 10px;
    }
    
    .contact-section {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }
    
    .contact-title {
      font-size: 16px;
      font-weight: bold;
      color: #2c5282;
      margin-bottom: 15px;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .contact-card {
      text-align: center;
    }
    
    .contact-name {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .contact-phone {
      font-size: 18px;
      color: #2c5282;
      text-decoration: none;
      font-weight: bold;
    }
    
    .info-section {
      margin-top: 30px;
      padding: 20px;
      background: #fff8dc;
      border-radius: 10px;
      border: 1px solid #ffd700;
    }
    
    .info-title {
      font-size: 16px;
      font-weight: bold;
      color: #d4a574;
      margin-bottom: 10px;
    }
    
    .info-list {
      margin: 0;
      padding-left: 20px;
      color: #666;
    }
    
    .info-list li {
      margin-bottom: 5px;
    }
    
    .footer {
      margin-top: 40px;
      text-align: center;
      padding: 20px;
      border-top: 2px solid #e5e7eb;
    }
    
    .footer-message {
      font-size: 16px;
      color: #4a6fa5;
      margin-bottom: 5px;
    }
    
    .footer-brand {
      font-size: 14px;
      color: #999;
    }
  `;
}

function getStaffTeeTimeStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
    
    .header-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      color: white;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .subtitle {
      font-size: 18px;
      font-weight: 400;
      opacity: 0.95;
    }
    
    .logo-text {
      font-size: 24px;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .day-header {
      background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
      color: white;
      padding: 15px 25px;
      margin: 30px 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(72, 198, 239, 0.3);
    }
    
    .table-container {
      display: grid;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 14px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
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
    
    .course-header {
      color: white;
      font-weight: 700;
      font-size: 16px;
      padding: 15px 20px;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    .course-header-lake { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .course-header-pine { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    .course-header-hills { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .course-header-valley { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
    .course-header-ocean { background: linear-gradient(135deg, #3d84a8 0%, #48b1bf 100%); }
    .course-header-default { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    
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
    }
    
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
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
    
    .contact-name {
      font-weight: 600;
      color: #2d3436;
      margin-bottom: 5px;
    }
    
    .contact-phone {
      color: #e67e22;
      font-size: 16px;
    }
    
    .footer {
      margin-top: 40px;
      text-align: center;
      padding: 30px;
      background: #f8f9fa;
      border-radius: 15px;
    }
    
    .footer-message {
      font-size: 18px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .footer-detail {
      font-size: 14px;
      color: #6c757d;
    }
  `;
}
