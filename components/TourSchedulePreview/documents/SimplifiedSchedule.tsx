import { TourData, ProductData } from '../types';
import { formatDate } from '../utils/formatters';
import { generateCommonHeader, getCommonHeaderStyles, generateCommonFooter, getCommonFooterStyles } from '../utils/commonStyles';

export function generateSimplifiedHTML(tourData: TourData | null, productData: ProductData | null): string {
  if (!tourData) return '<div>데이터를 불러올 수 없습니다.</div>';
  
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourData.title} - 간편 일정표</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    ${getCommonHeaderStyles(false)}
    ${getCommonFooterStyles(false)}
    
    .quick-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .info-item {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    
    .info-item strong {
      display: block;
      font-size: 16px;
      color: #2c5282;
      margin-bottom: 5px;
    }
    
    .info-item p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }
    
    .schedule-summary {
      margin-bottom: 40px;
    }
    
    .day-summary {
      margin-bottom: 30px;
      padding: 20px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
    }
    
    .day-header {
      font-size: 18px;
      font-weight: bold;
      color: #2c5282;
      margin-bottom: 5px;
    }
    
    .day-subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }
    
    .main-events {
      font-size: 14px;
      line-height: 1.8;
    }
    
    .event {
      padding: 5px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .event:last-child {
      border-bottom: none;
    }
    
    /* 고객용 커스텀 푸터 스타일 */
    .custom-footer {
      margin-top: 40px;
      padding: 30px;
      background: #4a69bd;
      background: linear-gradient(135deg, #4a69bd 0%, #5f7cdb 100%);
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(74, 105, 189, 0.2);
    }
    
    .custom-footer-message {
      font-size: 20px;
      color: white;
      font-weight: 600;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* footer 스타일은 공통 스타일에서 처리 */
    
    /* 모바일 반응형 */
    @media (max-width: 768px) {
      .custom-footer {
        margin-top: 30px;
        padding: 20px;
        border-radius: 12px;
      }
      
      .custom-footer-message {
        font-size: 16px;
      }
    }
    
    @media print {
      .container {
        max-width: 100%;
      }
      
      .day-summary {
        page-break-inside: avoid;
      }
      
      .custom-footer {
        background: #4a69bd !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${generateCommonHeader(tourData, '간편 일정표', false)}
    
    <div class="quick-info">
      <div class="info-item">
        <strong>⛳ 골프장</strong>
        <p>${productData?.golf_course || '미정'}</p>
      </div>
      <div class="info-item">
        <strong>🏨 숙소</strong>
        <p>${productData?.hotel || '미정'}</p>
      </div>
    </div>
    
    <div class="schedule-summary">
      ${tourData.schedules?.map((schedule: any, index: number) => `
        <div class="day-summary">
          <div class="day-header">Day ${schedule.day_number} - ${formatDate(schedule.date)}</div>
          <div class="day-subtitle">${schedule.title}</div>
          <div class="main-events">
            ${schedule.schedule_items?.map((item: any) => `
              <div class="event">${item.time ? item.time + ' ' : ''}${item.content}</div>
            `).join('') || '<div class="event">일정 정보가 없습니다.</div>'}
          </div>
        </div>
      `).join('') || '<div>일정 정보가 없습니다.</div>'}
    </div>
    
    <div class="custom-footer">
      <div class="custom-footer-message">♡ 행복한 추억 만드시길 바랍니다 ♡</div>
    </div>
  </div>
</body>
</html>`;
}
