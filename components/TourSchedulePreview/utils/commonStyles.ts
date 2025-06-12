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
  
  // 연락처 정보 수집
  const contactInfo: { label: string; phone: string }[] = [];
  
  if (phoneSettings) {
    // 예약/일반 문의: 회사 대표번호
    if (phoneSettings.show_company_phone && tourData.company_phone) {
      contactInfo.push({ label: '예약/일반 문의', phone: tourData.company_phone });
    }
    
    // 현장 문의: 가이드 전화번호
    if (phoneSettings.show_guide_phone && tourData.staff) {
      const guide = tourData.staff.find((s: any) => s.role === '가이드');
      if (guide?.phone) contactInfo.push({ label: '현장 문의', phone: guide.phone });
    }
    
    // 긴급 연락처: 매니저 업무폰 (스탭용만)
    if ('show_manager_phone' in phoneSettings && phoneSettings.show_manager_phone && tourData.staff) {
      const manager = tourData.staff.find((s: any) => s.role === '매니저');
      if (manager?.phone) contactInfo.push({ label: '긴급 연락처', phone: manager.phone });
    }
    
    // 기사 전화번호 (기존 유지)
    if (phoneSettings.show_driver_phone && tourData.staff) {
      const driver = tourData.staff.find((s: any) => s.role === '기사');
      if (driver?.phone) contactInfo.push({ label: '기사', phone: driver.phone });
    }
    
    // 골프장 전화번호 (기존 유지)
    if ('show_golf_phone' in phoneSettings && phoneSettings.show_golf_phone && tourData.golf_reservation_phone) {
      contactInfo.push({ label: '골프장', phone: tourData.golf_reservation_phone });
    }
  } else {
    // 설정이 없으면 기본값 사용 (이전 버전 호환)
    if (tourData.show_company_phones && tourData.company_phone) {
      contactInfo.push({ label: '예약/일반 문의', phone: tourData.company_phone });
    }
    
    if (isStaff && tourData.staff) {
      const driver = tourData.staff.find((s: any) => s.role === '기사');
      if (driver?.phone) contactInfo.push({ label: '기사', phone: driver.phone });
    }
  }
  
  return `
    <div class="footer-common">
      ${tourData.footer_message ? `<div class="footer-message">${tourData.footer_message}</div>` : ''}
      ${contactInfo.length > 0 ? `
        <div class="contact-info">
          <p class="contact-title">연락처</p>
          <div class="contact-items">
            ${contactInfo.map(item => `
              <div class="contact-item">
                <span class="contact-label">${item.label}:</span>
                <span class="contact-phone">${item.phone}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `<div class="footer-brand">싱싱골프투어</div>`}
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
    
    /* 연락처 정보 스타일 */
    .contact-info {
      margin-top: 15px;
    }
    
    .contact-title {
      font-weight: bold;
      font-size: 16px;
      color: ${colors.primaryColor};
      margin-bottom: 10px;
    }
    
    .contact-items {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .contact-label {
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }
    
    .contact-phone {
      color: ${colors.primaryColor};
      font-size: 14px;
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