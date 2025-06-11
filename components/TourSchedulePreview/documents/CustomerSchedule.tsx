import { TourData, ProductData } from '../types';
import { createHeader, createSection, createInfoBox, createNoticeBox, createFooter, htmlWrapper } from '../utils/generators';
import { formatDate, formatTextWithBold, getScheduleIcon, simplifyCourseName } from '../utils/formatters';

export function generateCustomerScheduleHTML(tourData: TourData, productData: ProductData | null, isStaff: boolean = false): string {
  const content = `
    <div class="container">
      ${createHeader('싱싱골프투어', '수원시 영통구 법조로149번길 200<br>고객센터 TEL 031-215-3990')}
      
      ${createSection('상품 정보', createInfoBox([
        { label: '상품명', value: tourData.title, important: true },
        { label: '일정', value: `${formatDate(tourData.start_date, false)} ~ ${formatDate(tourData.end_date, false)}`, important: true },
        { label: '골프장', value: productData?.golf_course || '' },
        ...(productData?.courses?.length ? [{ label: '코스', value: productData.courses.join(', ') }] : []),
        { label: '숙소', value: productData?.hotel || '' },
        { label: '포함사항', value: productData?.included_items || '' },
        { label: '불포함사항', value: productData?.excluded_items || '' }
      ]))}
      
      ${tourData.special_notices?.length ? 
        createSection('특별 공지사항', createNoticeBox(tourData.special_notices.map((n: any) => n.content || n))) 
        : ''}
      
      ${productData?.general_notices?.length ? 
        createSection('예약 안내 사항', createNoticeBox(productData.general_notices.map((n: any) => n.content || n)))
        : ''}
      
      <div class="section">
        <div class="section-title">일정 안내</div>
        <div class="schedule-section">
          ${tourData.schedules?.map((schedule: any, idx: number) => `
            <div class="day-schedule">
              <div class="day-title">
                <div>Day ${idx + 1} - ${formatDate(schedule.date)}</div>
                <div class="day-round">${schedule.title ? simplifyCourseName(schedule.title) : ''}</div>
              </div>
              <div class="day-content">
                ${schedule.schedule_items?.length ? `
                  <div class="schedule-timeline">
                    ${schedule.schedule_items.map((item: any) => {
                      const { icon, iconClass } = getScheduleIcon(item.content, item.attraction_data);
                      return `
                        <div class="timeline-item ${iconClass}">
                          <div class="timeline-icon">${icon}</div>
                          <div class="timeline-content">
                            ${item.time ? `<span class="timeline-time">${item.time.split(':').slice(0, 2).join(':')}</span>` : ''}
                            <span class="timeline-text">${item.content}</span>
                            ${item.attraction_data && item.attraction_data.main_image_url && item.display_options?.show_image !== false ? `
                              <div class="timeline-image-wrapper">
                                <img src="${item.attraction_data.main_image_url}" alt="${item.attraction_data.name}" class="timeline-image" />
                              </div>
                            ` : ''}
                            ${item.attraction_data && item.attraction_data.description ? `
                              <div class="timeline-description">${item.attraction_data.description}</div>
                            ` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('') || '<div style="padding: 20px; text-align: center; color: #666;">일정 정보가 없습니다.</div>'}
        </div>
      </div>
      
      ${productData && (productData.usage_round || productData.usage_hotel || productData.usage_meal || productData.usage_bus || productData.usage_tour) ? `
      <div class="section detailed-usage-section">
        <div class="section-title">상세 이용 안내</div>
        <div class="usage-grid">
          ${productData.usage_round ? `
            <div class="usage-item">
              <div class="usage-header">
                <span class="usage-icon">⛳</span>
                <h4>라운딩 규정</h4>
              </div>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_round)}
              </div>
            </div>
          ` : ''}
          
          ${productData.usage_hotel ? `
            <div class="usage-item">
              <div class="usage-header">
                <span class="usage-icon">🏨</span>
                <h4>숙소 이용</h4>
              </div>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_hotel)}
              </div>
            </div>
          ` : ''}
          
          ${productData.usage_meal ? `
            <div class="usage-item">
              <div class="usage-header">
                <span class="usage-icon">🍽️</span>
                <h4>식사 안내</h4>
              </div>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_meal)}
              </div>
            </div>
          ` : ''}
          
          ${productData.usage_bus ? `
            <div class="usage-item">
              <div class="usage-header">
                <span class="usage-icon">🚌</span>
                <h4>버스 이용</h4>
              </div>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_bus)}
              </div>
            </div>
          ` : ''}
          
          ${productData.usage_tour ? `
            <div class="usage-item">
              <div class="usage-header">
                <span class="usage-icon">🎯</span>
                <h4>관광지 투어</h4>
              </div>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_tour)}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${createFooter()}
    </div>
    
    <style>
      ${getScheduleStyles(isStaff)}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 일정표`, content);
}

function formatUsageContent(content: string): string {
  // 줄바꿈을 <br>로 변환하고, 번호 리스트는 스타일 적용
  return content
    .split('\n')
    .map(line => {
      // 숫자. 로 시작하는 라인 감지
      if (/^\d+\.\s/.test(line)) {
        return `<div class="usage-list-item">${line}</div>`;
      }
      return line;
    })
    .join('<br>');
}

function getScheduleStyles(isStaff: boolean = false): string {
  return `
    /* 공통 스타일 */
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
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #666;
    }
    
    /* 일정 스타일 */
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
      padding-bottom: 10px;
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
    .timeline-item.shopping .timeline-icon { background: #f3e5f5; }
    .timeline-item.default .timeline-icon { background: #f0f0f0; }
    
    .timeline-time {
      font-weight: bold;
      color: #2c5282;
      margin-right: 10px;
    }
    
    .timeline-text {
      text-align: left;
    }
    
    .timeline-image-wrapper {
      margin-top: 8px;
      border-radius: 8px;
      overflow: hidden;
      max-width: 300px;
    }
    
    .timeline-image {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .timeline-description {
      margin-top: 8px;
      font-size: 13px;
      color: #666;
      line-height: 1.5;
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
    
    .notice-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
    }
    
    .notice-list {
      margin: 0;
      padding-left: 20px;
    }
    
    .notice-list li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
    
    /* 상세 이용 안내 스타일 */
    .detailed-usage-section {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #ddd;
    }
    
    .usage-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .usage-item {
      background: #f8f9fa;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .usage-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .usage-icon {
      font-size: 20px;
      color: #2c5282;
    }
    
    .usage-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #2c5282;
    }
    
    .usage-content {
      font-size: 14px;
      line-height: 1.8;
      color: #4a5568;
    }
    
    .usage-list-item {
      padding-left: 15px;
      margin-bottom: 8px;
      position: relative;
    }
    
    .usage-list-item:before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 4px;
      height: 4px;
      background: #2c5282;
      border-radius: 50%;
    }
    
    /* 스탭용 추가 스타일 */
    ${isStaff ? `
      .day-schedule {
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      
      .day-title {
        background: #4a6fa5;
        font-size: 16px;
      }
      
      .usage-item {
        background: linear-gradient(to bottom, #f8fbff 0%, #ffffff 100%);
        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.1);
        transition: all 0.3s ease;
      }
      
      .usage-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(74, 144, 226, 0.15);
      }
    ` : ''}
    
    /* 인쇄용 스타일 */
    @media print {
      body { 
        margin: 0; 
        padding: 0;
        font-size: 15px; 
      }
      .container { 
        max-width: 100%; 
        padding: 20px; 
      }
      .section-title { font-size: 18px; }
      .day-title { font-size: 16px; }
      .timeline-text { font-size: 14px; }
      .usage-content { font-size: 14px; }
    }
  `;
}
