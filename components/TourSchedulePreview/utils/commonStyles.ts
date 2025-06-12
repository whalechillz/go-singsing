// 공통 헤더 스타일과 컬러 정의
export const commonHeaderStyles = {
  customer: {
    headerBg: '#2c5282',
    primaryColor: '#2c5282',
    secondaryColor: '#4a6fa5',
    accentColor: '#e7f3ff',
  },
  staff: {
    headerBg: '#6B46C1',
    primaryColor: '#6B46C1',
    secondaryColor: '#9333EA',
    accentColor: '#f3e8ff',
  }
};

// 모바일 최적화된 공통 헤더 HTML
export function generateCommonHeader(tourData: any, documentTitle: string, isStaff: boolean = false): string {
  const colors = isStaff ? commonHeaderStyles.staff : commonHeaderStyles.customer;
  
  return `
    <div class="route-header-box" style="background-color: ${colors.headerBg};">
      <div class="route-header-title">싱싱골프투어</div>
      <div class="route-header-subtitle">${tourData.title}</div>
      <div class="route-header-date">
        ${tourData.start_date && tourData.end_date ? 
          `${new Date(tourData.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ~ 
           ${new Date(tourData.end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
      </div>
    </div>
    
    ${documentTitle ? `
      <div class="document-title-section">
        <div class="document-title">${documentTitle}</div>
      </div>
    ` : ''}
  `;
}

// 모바일 최적화된 공통 헤더 스타일
export function getCommonHeaderStyles(isStaff: boolean = false): string {
  const colors = isStaff ? commonHeaderStyles.staff : commonHeaderStyles.customer;
  
  return `
    .route-header-box {
      text-align: center;
      padding: 30px;
      background: ${colors.headerBg};
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
    
    .document-title-section {
      background: ${isStaff ? '#f3e8ff' : '#e7f3ff'};
      padding: 15px 20px;
      margin-bottom: 20px;
      border-left: 5px solid ${colors.primaryColor};
      border-radius: 0;
    }
    
    .document-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      text-align: left;
      margin: 0;
    }
    
    /* 모바일 최적화 */
    @media (max-width: 768px) {
      .route-header-box {
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .route-header-title {
        font-size: 20px;
        margin-bottom: 8px;
      }
      
      .route-header-subtitle {
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .route-header-date {
        font-size: 14px;
      }
      
      .document-title {
        font-size: 14px;
      }
      
      .document-title-section {
        padding: 12px 15px;
      }
    }
    
    /* 인쇄용 스타일 */
    @media print {
      .route-header-box {
        background: ${colors.headerBg} !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        padding: 20px;
        margin: -10mm -10mm 20px -10mm;
        border-radius: 0;
      }
    }
  `;
}

// 공통 푸터 HTML
export function generateCommonFooter(tourData: any, isStaff: boolean = false, documentType?: string): string {
  // 문서에 따른 전화번호 표시 설정 가져오기
  const phoneSettings = documentType && tourData.phone_display_settings ? 
    tourData.phone_display_settings[documentType] : null;
  
  // 전화번호 수집
  const phones: string[] = [];
  
  if (phoneSettings) {
    if (phoneSettings.show_company_phone && tourData.company_phone) {
      phones.push(`☎ ${tourData.company_phone}`);
    }
    
    if (phoneSettings.show_driver_phone && tourData.staff) {
      const driver = tourData.staff.find((s: any) => s.role === '기사');
      if (driver?.phone) phones.push(`기사 ${driver.phone}`);
    }
    
    if (phoneSettings.show_guide_phone && tourData.staff) {
      const guide = tourData.staff.find((s: any) => s.role === '가이드');
      if (guide?.phone) phones.push(`가이드 ${guide.phone}`);
    }
    
    if ('show_manager_phone' in phoneSettings && phoneSettings.show_manager_phone && tourData.staff) {
      const manager = tourData.staff.find((s: any) => s.role === '매니저');
      if (manager?.phone) phones.push(`매니저 ${manager.phone}`);
    }
    
    if ('show_golf_phone' in phoneSettings && phoneSettings.show_golf_phone && tourData.golf_reservation_phone) {
      phones.push(`골프장 ${tourData.golf_reservation_phone}`);
    }
  } else {
    // 설정이 없으면 기본값 사용 (이전 버전 호환)
    if (tourData.show_company_phones && tourData.company_phone) {
      phones.push(`☎ ${tourData.company_phone}`);
    }
    
    if (isStaff && tourData.staff) {
      const driver = tourData.staff.find((s: any) => s.role === '기사');
      if (driver?.phone) phones.push(`기사 ${driver.phone}`);
    }
  }
  
  return `
    <div class="footer-common">
      ${tourData.footer_message ? `<div class="footer-message">${tourData.footer_message}</div>` : ''}
      ${phones.length > 0 ? `<div class="footer-brand">싱싱골프투어 ${phones.join(' | ')}</div>` : `<div class="footer-brand">싱싱골프투어</div>`}
    </div>
  `;
}

// 공통 푸터 스타일
export function getCommonFooterStyles(isStaff: boolean = false): string {
  const colors = isStaff ? commonHeaderStyles.staff : commonHeaderStyles.customer;
  
  return `
    .footer-common {
      margin-top: 30px;
      padding: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
    }
    
    .contact-section {
      margin-bottom: 15px;
    }
    
    .contact-grid-simple {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 10px;
    }
    
    .contact-item-simple {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .contact-label {
      font-size: 13px;
      color: #666;
    }
    
    .contact-value {
      font-size: 14px;
      color: ${colors.primaryColor};
      text-decoration: none;
      font-weight: 500;
    }
    
    .contact-info-staff {
      margin-bottom: 15px;
      padding: 15px;
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      border-radius: 10px;
    }
    
    .contact-title-staff {
      font-size: 14px;
      font-weight: bold;
      color: #2d3436;
      margin-bottom: 8px;
    }
    
    .contact-grid-staff {
      font-size: 13px;
      color: #333;
    }
    
    .contact-item-staff {
      display: inline;
    }
    
    .contact-name-staff {
      font-weight: 500;
      color: #2d3436;
    }
    
    .contact-phone-staff {
      color: #e67e22;
      font-weight: 500;
    }
    
    .footer-message {
      font-size: 14px;
      color: ${colors.primaryColor};
      margin-bottom: 5px;
    }
    
    .footer-brand {
      font-size: 13px;
      color: #666;
    }
    
    /* 모바일 최적화 */
    @media (max-width: 768px) {
      .footer-common {
        padding: 15px;
        margin-top: 20px;
      }
      
      .contact-grid-simple {
        flex-direction: column;
        gap: 10px;
      }
      
      .contact-item-simple {
        justify-content: center;
      }
      
      .footer-message {
        font-size: 13px;
      }
    }
  `;
}