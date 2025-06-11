// HTML 템플릿 생성 헬퍼 함수들
export const htmlWrapper = (title: string, content: string): string => `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${getCommonStyles()}
</head>
<body>
  ${content}
</body>
</html>`;

export const getCommonStyles = (): string => `
<style>
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
  
  @media print {
    body { margin: 0; padding: 0; }
    .container { max-width: 100%; padding: 20px; }
  }
</style>`;

// 섹션 템플릿
export const createSection = (title: string, content: string): string => `
  <div class="section">
    <div class="section-title">${title}</div>
    ${content}
  </div>
`;

// 정보 박스 템플릿
export const createInfoBox = (rows: Array<{label: string, value: string, important?: boolean}>): string => `
  <div class="product-info-box">
    ${rows.map(row => `
      <div class="info-row">
        <div class="info-label">${row.label}</div>
        <div class="info-value${row.important ? ' important' : ''}">${row.value}</div>
      </div>
    `).join('')}
  </div>
`;

// 공지사항 템플릿
export const createNoticeBox = (notices: string[]): string => `
  <div class="notice-box">
    <ul class="notice-list">
      ${notices.map(notice => `<li>${notice}</li>`).join('')}
    </ul>
  </div>
`;

// 헤더 템플릿
export const createHeader = (logoText: string = '싱싱골프투어', companyInfo?: string): string => `
  <div class="header">
    <div class="logo">${logoText}</div>
    ${companyInfo ? `<div class="company-info">${companyInfo}</div>` : ''}
  </div>
`;

// A그룹 권위있는 스타일 헤더 템플릿
export const createAuthorityHeader = (title: string, subtitle?: string, companyInfo?: string): string => `
  <div class="header-authority">
    <div class="logo">${title}</div>
    ${subtitle ? `<div class="subtitle">${subtitle.split('\n').map(line => `<div>${line}</div>`).join('')}</div>` : ''}
    ${companyInfo ? `<div class="company-info">${companyInfo}</div>` : ''}
  </div>
`;

// 푸터 템플릿
export const createFooter = (message: string = '♡ 즐거운 하루 되시길 바랍니다. ♡', phone: string = '031-215-3990'): string => `
  <div class="footer">
    <p>${message}</p>
    <p>싱싱골프투어 ☎ ${phone}</p>
  </div>
`;
