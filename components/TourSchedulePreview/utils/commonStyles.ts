// 공통 헤더 스타일과 컬러 정의
export const commonHeaderStyles = {
  customer: {
    headerBg: '#2c5282',
    primaryColor: '#2c5282',
    secondaryColor: '#4a6fa5',
    accentColor: '#e7f3ff',
  },
  staff: {
    headerBg: '#2c5282',  // 통일된 색상
    primaryColor: '#2c5282',  // 통일된 색상
    secondaryColor: '#4a6fa5',  // 통일된 색상
    accentColor: '#e7f3ff',  // 통일된 색상
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
      background: #e7f3ff;
      padding: 15px 20px;
      margin-bottom: 20px;
      border-left: 5px solid #2c5282;
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

// 문서별 푸터 메시지 가져오기
function getDocumentFooterMessage(documentType: string | undefined, tourData: any): string {
  const messages: Record<string, string> = {
    'customer_schedule': '♡ 즐거운 골프 여행이 되시길 바랍니다 ♡',
    'customer_boarding': '♡ 안전한 탑승과 즐거운 여행 되세요 ♡',
    'staff_boarding': '♡ 안전한 탑승과 즐거운 여행 되세요 ♡',
    'room_assignment': '♡ 편안한 휴식이 되시길 바랍니다 ♡',
    'room_assignment_staff': '♡ 편안한 휴식이 되시길 바랍니다 ♡',
    'customer_timetable': '♡ 멋진 라운딩 되시길 응원합니다 ♡',
    'staff_timetable': '♡ 멋진 라운딩 되시길 응원합니다 ♡',
    'tee_time': '♡ 멋진 라운딩 되시길 응원합니다 ♡',
    'simplified': '♡ 행복한 추억 만드시길 바랍니다 ♡'
  };
  
  // 문서 타입에 맞는 메시지가 있으면 사용, 없으면 기본 푸터 메시지 사용
  if (documentType && messages[documentType]) {
    return messages[documentType];
  }
  
  // 기본 푸터 메시지 (투어 설정에서 가져옴)
  return tourData.footer_message || '♡ 즐거운 하루 되시길 바랍니다 ♡';
}

// 공통 푸터 HTML - 새로운 스타일 적용
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
  
  // 문서별 푸터 메시지 가져오기
  const footerMessage = getDocumentFooterMessage(documentType, tourData);
  
  return `
    <div class="custom-footer">
      <div class="custom-footer-message">${footerMessage}</div>
    </div>
  `;
}

// 공통 푸터 스타일
export function getCommonFooterStyles(isStaff: boolean = false): string {
  const colors = isStaff ? commonHeaderStyles.staff : commonHeaderStyles.customer;
  
  return `
    /* 통일된 커스텀 푸터 스타일 */
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
    
    /* 인쇄용 스타일 */
    @media print {
      .custom-footer {
        background: #4a69bd !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
      }
    }
    
    /* 기존 스타일 (호환성 유지) */
    .footer-common {
      margin-top: 30px;
      padding: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
    }
    
    /* 푸터 메시지 스타일 */
    .footer-message {
      font-size: 15px;
      color: ${colors.primaryColor};
      margin-bottom: 12px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    /* 연락처 정보 스타일 */
    .contact-info {
      margin-top: 10px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    
    .contact-title {
      font-weight: bold;
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
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