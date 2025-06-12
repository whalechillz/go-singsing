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
    <div class="header-common" style="background-color: ${colors.headerBg};">
      <div class="header-brand">싱싱골프투어</div>
      <div class="header-tour-title">${tourData.title}</div>
      <div class="header-document-type">${documentTitle}</div>
      <div class="header-date">
        ${tourData.start_date && tourData.end_date ? 
          `${new Date(tourData.start_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} ~ 
           ${new Date(tourData.end_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}` : ''}
      </div>
    </div>
  `;
}

// 모바일 최적화된 공통 헤더 스타일
export function getCommonHeaderStyles(isStaff: boolean = false): string {
  const colors = isStaff ? commonHeaderStyles.staff : commonHeaderStyles.customer;
  
  return `
    .header-common {
      background-color: ${colors.headerBg};
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .header-brand {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      opacity: 0.9;
    }
    
    .header-tour-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 6px;
    }
    
    .header-document-type {
      font-size: 14px;
      margin-bottom: 4px;
      opacity: 0.8;
    }
    
    .header-date {
      font-size: 13px;
      opacity: 0.8;
    }
    
    /* 모바일 최적화 */
    @media (max-width: 768px) {
      .header-common {
        padding: 15px;
        margin-bottom: 15px;
      }
      
      .header-brand {
        font-size: 14px;
        margin-bottom: 6px;
      }
      
      .header-tour-title {
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .header-document-type {
        font-size: 13px;
        margin-bottom: 3px;
      }
      
      .header-date {
        font-size: 12px;
      }
    }
    
    /* 인쇄용 스타일 */
    @media print {
      .header-common {
        background-color: ${colors.headerBg} !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        padding: 15px;
        margin: -10mm -10mm 20px -10mm;
      }
    }
  `;
}

// 공통 푸터 HTML
export function generateCommonFooter(tourData: any, isStaff: boolean = false): string {
  if (isStaff) {
    return `
      <div class="footer-common">
        ${tourData.staff && tourData.staff.filter((staff: any) => staff.role.includes('기사')).length > 0 ? `
          <div class="contact-info-staff">
            <div class="contact-title-staff">비상 연락처</div>
            <div class="contact-grid-staff">
              ${tourData.staff.filter((staff: any) => staff.role.includes('기사')).map((staff: any) => `
                <div class="contact-item-staff">
                  <span class="contact-name-staff">${staff.name} ${staff.role}</span>
                  ${staff.phone ? `<span class="contact-phone-staff">${staff.phone}</span>` : ''}
                </div>
              `).join(' | ')}
            </div>
          </div>
        ` : ''}
        <div class="footer-message">싱싱골프투어와 함께하는 즐거운 여행</div>
      </div>
    `;
  } else {
    return `
      <div class="footer-common">
        ${tourData.show_company_phones && (tourData.company_phone || tourData.company_mobile) ? `
          <div class="contact-section">
            <div class="contact-grid-simple">
              ${tourData.company_phone ? `
                <div class="contact-item-simple">
                  <span class="contact-label">대표전화</span>
                  <a href="tel:${tourData.company_phone}" class="contact-value">${tourData.company_phone}</a>
                </div>
              ` : ''}
              ${tourData.company_mobile ? `
                <div class="contact-item-simple">
                  <span class="contact-label">담당자</span>
                  <a href="tel:${tourData.company_mobile}" class="contact-value">${tourData.company_mobile}</a>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        ${tourData.footer_message ? `
          <div class="footer-message">${tourData.footer_message}</div>
        ` : ''}
      </div>
    `;
  }
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
      margin-top: 10px;
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