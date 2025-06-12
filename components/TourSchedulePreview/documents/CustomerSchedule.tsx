import { TourData, ProductData } from '../types';
import { createHeader, createAuthorityHeader, createSection, createInfoBox, createNoticeBox, htmlWrapper } from '../utils/generators';
import { formatDate, formatTextWithBold, getScheduleIcon, simplifyCourseName } from '../utils/formatters';

export function generateCustomerScheduleHTML(tourData: TourData, productData: ProductData | null, isStaff: boolean = false): string {
  // 날짜 및 제목 정보 준비
  const dateStr = tourData.start_date && tourData.end_date ? 
    `${formatDate(tourData.start_date, true)} ~ ${formatDate(tourData.end_date, true)}` : '';
  const subtitle = `${tourData.title}`;
  
  const content = `
    <div class="container">
      ${createAuthorityHeader('싱싱골프투어', subtitle, '수원시 영통구 법조로149번길 200<br>고객센터 TEL 031-215-3990')}
      
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
                <div>Day ${idx + 1} - ${formatDate(schedule.date, true)}</div>
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
      

      
      ${productData && (productData.usage_round || productData.usage_hotel || productData.usage_meal || productData.usage_bus || productData.usage_tour || productData.usage_locker) ? `
      <div class="section detailed-usage-section">
        <div class="section-title">상세 이용 안내</div>
        <div class="usage-details-container">
          ${productData.usage_round ? `
            <details class="usage-details" open>
              <summary class="usage-summary">
                <span class="summary-text">라운딩 규정</span>
                <span class="summary-icon"></span>
              </summary>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_round)}
              </div>
            </details>
          ` : ''}
          
          ${productData.usage_hotel ? `
            <details class="usage-details">
              <summary class="usage-summary">
                <span class="summary-text">숙소 이용</span>
                <span class="summary-icon"></span>
              </summary>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_hotel)}
              </div>
            </details>
          ` : ''}
          
          ${productData.usage_meal ? `
            <details class="usage-details">
              <summary class="usage-summary">
                <span class="summary-text">식사 안내</span>
                <span class="summary-icon"></span>
              </summary>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_meal)}
              </div>
            </details>
          ` : ''}
          
          ${productData.usage_locker ? `
            <details class="usage-details">
              <summary class="usage-summary">
                <span class="summary-text">락카 이용</span>
                <span class="summary-icon"></span>
              </summary>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_locker)}
              </div>
            </details>
          ` : ''}
          
          ${productData.usage_bus ? `
            <details class="usage-details">
              <summary class="usage-summary">
                <span class="summary-text">버스 이용</span>
                <span class="summary-icon"></span>
              </summary>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_bus)}
              </div>
            </details>
          ` : ''}
          
          ${productData.usage_tour ? `
            <details class="usage-details">
              <summary class="usage-summary">
                <span class="summary-text">관광지 투어</span>
                <span class="summary-icon"></span>
              </summary>
              <div class="usage-content">
                ${formatUsageContent(productData.usage_tour)}
              </div>
            </details>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${tourData.other_notices ? `
      <div class="bottom-notice-section">
        ${tourData.other_notices.split('\n').map(notice => notice.trim() ? `<p class="bottom-notice-item">${notice}</p>` : '').join('')}
      </div>
      ` : ''}
      
      ${(tourData.footer_message || tourData.company_phone || tourData.company_mobile) ? `
      <div class="footer">
        ${tourData.footer_message ? `<p>${tourData.footer_message}</p>` : ''}
        ${(tourData.company_phone || tourData.company_mobile) ? `
          <p>
            싱싱골프투어 
            ${tourData.company_phone ? `☎ ${tourData.company_phone}` : ''}
            ${tourData.company_mobile ? `📱 ${tourData.company_mobile}` : ''}
          </p>
        ` : ''}
      </div>
      ` : ''}
    </div>
  `;
  
  // CSS를 head 태그에 포함시키기 위해 수정
  const fullHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 일정표</title>
  <style>
    ${getScheduleStyles(isStaff)}
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  
  return fullHTML;
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
      // 빈 줄은 작은 간격으로
      if (line.trim() === '') {
        return '<div style="height: 5px;"></div>';
      }
      return `<div class="usage-line">${line}</div>`;
    })
    .join('');
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
    
    /* A그룹 권위있는 스타일 헤더 */
    .header-authority {
      background-color: #2c5282;
      color: white;
      padding: 30px;
      text-align: center;
      margin: -30px -30px 30px -30px;
    }
    
    .header-authority .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 15px;
      letter-spacing: 0.5px;
      color: white;
    }
    
    .header-authority .subtitle {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 10px;
      opacity: 0.95;
    }
    
    .header-authority .subtitle > div:first-child {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .header-authority .subtitle > div:last-child {
      font-size: 18px;
      font-weight: 400;
      opacity: 0.9;
    }
    
    .header-authority .company-info {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.6;
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
    
    .notice-item {
      padding: 8px 0;
      line-height: 1.6;
      position: relative;
      padding-left: 20px;
    }
    
    .notice-item:before {
      content: '•';
      position: absolute;
      left: 0;
      color: #2c5282;
      font-weight: bold;
    }
    
    /* 상세 이용 안내 details/summary 스타일 */
    .detailed-usage-section {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #ddd;
    }
    
    .usage-details-container {
      margin-top: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .usage-details {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .usage-details:last-child {
      border-bottom: none;
    }
    
    .usage-summary {
      padding: 16px 20px;
      background: #f8f9fa;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      color: #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
      list-style: none;
    }
    
    .usage-summary:hover {
      background: #e7f3ff;
    }
    
    .usage-details[open] > .usage-summary {
      background: #2c5282;
      color: white;
    }
    
    .usage-summary::-webkit-details-marker {
      display: none;
    }
    
    .summary-icon::after {
      content: '▶';
      font-size: 12px;
      transition: transform 0.2s ease;
      display: inline-block;
    }
    
    .usage-details[open] .summary-icon::after {
      content: '▼';
    }
    
    .usage-content {
      padding: 20px;
      background: white;
      font-size: 14px;
      line-height: 1.8;
      color: #4a5568;
    }
    
    .usage-list-item {
      margin-bottom: 6px;
      line-height: 1.5;
    }
    
    .usage-line {
      margin-bottom: 4px;
      line-height: 1.5;
    }
    
    /* 하단 안내문구 스타일 */
    .bottom-notice-section {
      margin: 40px 0 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-left: 3px solid #2c5282;
      border-radius: 5px;
    }
    
    .bottom-notice-item {
      margin: 0 0 10px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #555;
    }
    
    .bottom-notice-item:last-child {
      margin-bottom: 0;
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
      
      .usage-summary {
        font-weight: 700;
        background: #f0f4f8;
      }
      
      .usage-details[open] > .usage-summary {
        background: #4a6fa5;
      }
      
      .usage-content {
        background: linear-gradient(to bottom, #f8fbff 0%, #ffffff 100%);
        box-shadow: inset 0 2px 4px rgba(74, 144, 226, 0.1);
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
      
      /* 인쇄 시 모든 details 열림 */
      .usage-details {
        page-break-inside: avoid;
      }
      .usage-details:not([open]) > .usage-content {
        display: block !important;
      }
      .usage-summary {
        background: #f0f0f0 !important;
        color: #2c5282 !important;
        page-break-after: avoid;
      }
      .summary-icon { display: none; }
      .usage-details[open] {
        margin-bottom: 20px;
      }
    }
  `;
}
