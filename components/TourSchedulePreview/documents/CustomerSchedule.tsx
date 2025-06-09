import { TourData, ProductData } from '../types';
import { createHeader, createSection, createInfoBox, createNoticeBox, createFooter, htmlWrapper, getCommonStyles } from '../utils/generators';
import { formatDate, formatTextWithBold, getScheduleIcon, simplifyCourseName } from '../utils/formatters';

export function generateCustomerScheduleHTML(tourData: TourData, productData: ProductData | null): string {
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
                      const { icon, iconClass } = getScheduleIcon(item.content);
                      return `
                        <div class="timeline-item ${iconClass}">
                          <div class="timeline-icon">${icon}</div>
                          <div class="timeline-content">
                            ${item.time ? `<span class="timeline-time">${item.time}</span>` : ''}
                            <span class="timeline-text">${item.content}</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : ''}
                
                <div class="meal-info">
                  <div class="meal ${schedule.meal_breakfast ? 'meal-included' : 'meal-excluded'}">
                    <div class="meal-header">조식</div>
                    <div class="meal-status">
                      ${schedule.meal_breakfast ? '✓' : '✗'}
                    </div>
                    ${schedule.meal_breakfast && schedule.menu_breakfast ? `<div class="meal-menu">${schedule.menu_breakfast}</div>` : ''}
                  </div>
                  <div class="meal ${schedule.meal_lunch ? 'meal-included' : 'meal-excluded'}">
                    <div class="meal-header">중식</div>
                    <div class="meal-status">
                      ${schedule.meal_lunch ? '✓' : '✗'}
                    </div>
                    ${schedule.meal_lunch && schedule.menu_lunch ? `<div class="meal-menu">${schedule.menu_lunch}</div>` : ''}
                  </div>
                  <div class="meal ${schedule.meal_dinner ? 'meal-included' : 'meal-excluded'}">
                    <div class="meal-header">석식</div>
                    <div class="meal-status">
                      ${schedule.meal_dinner ? '✓' : '✗'}
                    </div>
                    ${schedule.meal_dinner && schedule.menu_dinner ? `<div class="meal-menu">${schedule.menu_dinner}</div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `).join('') || '<div style="padding: 20px; text-align: center; color: #666;">일정 정보가 없습니다.</div>'}
        </div>
      </div>
      
      ${createFooter()}
    </div>
    
    <style>
      ${getScheduleStyles()}
    </style>
  `;
  
  return htmlWrapper(`${tourData.title} - 일정표`, content);
}

function getScheduleStyles(): string {
  return `
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
    }
    
    .schedule-timeline {
      padding-left: 20px;
      margin-bottom: 20px;
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
    
    .timeline-time {
      font-weight: bold;
      color: #2c5282;
      margin-right: 10px;
    }
    
    .timeline-text {
      text-align: left;
    }
    
    .meal-info {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    
    .meal {
      flex: 1;
      text-align: center;
      padding: 12px;
      border-radius: 6px;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }
    
    .meal.meal-included {
      background: #f0fdf4;
      border-color: #86efac;
    }
    
    .meal.meal-excluded {
      background: #fef2f2;
      border-color: #fecaca;
    }
    
    .meal-header {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .meal.meal-included .meal-header {
      color: #166534;
    }
    
    .meal.meal-excluded .meal-header {
      color: #991b1b;
    }
    
    .meal-status {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
    }
    
    .meal.meal-included .meal-status {
      color: #16a34a;
    }
    
    .meal.meal-excluded .meal-status {
      color: #dc2626;
    }
    
    .meal-menu {
      font-size: 12px;
      color: #555;
      line-height: 1.4;
      max-width: 150px;
      margin: 0 auto;
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
  `;
}
