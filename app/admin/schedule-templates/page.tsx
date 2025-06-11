"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Users, UserCheck, Calendar, MapPin, Clock, Utensils } from 'lucide-react';

// A그룹 디자인 시스템 상수
const DESIGN_SYSTEM = {
  colors: {
    primary: '#2c5282',      // 진한 네이비
    primaryLight: '#e7f3ff', // 연한 블루
    white: '#ffffff',
    gray: {
      50: '#f8f9fa',
      100: '#f0f0f0',
      200: '#eee',
      300: '#ddd',
      500: '#555',
      600: '#666',
      700: '#333'
    }
  },
  fonts: {
    family: 'Noto Sans KR',
    sizes: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '15px',
      xl: '16px',
      '2xl': '18px',
      '3xl': '20px',
      '4xl': '24px',
      '5xl': '28px'
    },
    weights: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  spacing: {
    xs: '5px',
    sm: '10px',
    md: '15px',
    lg: '20px',
    xl: '25px',
    '2xl': '30px'
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px'
  }
};

export default function ScheduleTemplatesPage() {
  const [activeTemplate, setActiveTemplate] = React.useState<'customer' | 'staff'>('customer');
  const [templateData, setTemplateData] = React.useState({
    tourName: '2박3일 순천버스핑',
    startDate: '2025. 4. 14.',
    endDate: '2025. 4. 16.',
    golfCourse: '파인힐스CC',
    accommodation: '파인힐스 골프텔',
    meals: {
      day1: { lunch: '현지식', dinner: '한정식' },
      day2: { breakfast: '호텔식', lunch: '현지식', dinner: '삼겹살' },
      day3: { breakfast: '호텔식', lunch: '현지식' }
    },
    schedule: {
      day1: [
        { time: '05:00', activity: '강남 출발' },
        { time: '05:30', activity: '잠실 경유' },
        { time: '06:00', activity: '수원 경유' },
        { time: '11:00', activity: '골프장 도착' },
        { time: '13:08', activity: '라운딩 (파인코스)' },
        { time: '19:00', activity: '석식' }
      ],
      day2: [
        { time: '07:00', activity: '조식' },
        { time: '08:00', activity: '라운딩 (힐코스)' },
        { time: '14:00', activity: '중식' },
        { time: '15:00', activity: '자유시간' },
        { time: '19:00', activity: '석식' }
      ],
      day3: [
        { time: '07:00', activity: '조식' },
        { time: '08:00', activity: '라운딩 (레이크코스)' },
        { time: '14:00', activity: '중식' },
        { time: '15:00', activity: '서울 출발' },
        { time: '20:00', activity: '서울 도착' }
      ]
    },
    staffInfo: {
      busNumber: '경기 12가 3456',
      driverName: '김기사',
      driverPhone: '010-1234-5678',
      guidePhone: '010-8765-4321',
      emergencyContact: '031-215-3990'
    }
  });

  // 공통 스타일 생성 함수
  const generateBaseStyles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: '${DESIGN_SYSTEM.fonts.family}', sans-serif;
      font-size: ${DESIGN_SYSTEM.fonts.sizes.lg};
      line-height: 1.6;
      color: ${DESIGN_SYSTEM.colors.gray[700]};
      background: white;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: ${DESIGN_SYSTEM.spacing['2xl']};
    }
    
    /* A그룹 공통 헤더 스타일 */
    .header-a-group {
      background-color: ${DESIGN_SYSTEM.colors.primary};
      color: ${DESIGN_SYSTEM.colors.white};
      padding: ${DESIGN_SYSTEM.spacing['2xl']};
      text-align: center;
      margin: -${DESIGN_SYSTEM.spacing['2xl']} -${DESIGN_SYSTEM.spacing['2xl']} ${DESIGN_SYSTEM.spacing['2xl']} -${DESIGN_SYSTEM.spacing['2xl']};
    }
    
    .header-logo {
      font-size: ${DESIGN_SYSTEM.fonts.sizes['5xl']};
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      margin-bottom: ${DESIGN_SYSTEM.spacing.md};
      letter-spacing: 0.5px;
    }
    
    .header-subtitle {
      font-size: ${DESIGN_SYSTEM.fonts.sizes['3xl']};
      font-weight: ${DESIGN_SYSTEM.fonts.weights.medium};
      margin-bottom: ${DESIGN_SYSTEM.spacing.sm};
      opacity: 0.95;
    }
    
    .header-info {
      font-size: ${DESIGN_SYSTEM.fonts.sizes.base};
      opacity: 0.9;
      line-height: 1.6;
    }
    
    /* 섹션 스타일 */
    .section {
      margin-bottom: ${DESIGN_SYSTEM.spacing['2xl']};
    }
    
    .section-title {
      font-size: ${DESIGN_SYSTEM.fonts.sizes['2xl']};
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      color: ${DESIGN_SYSTEM.colors.primary};
      padding: ${DESIGN_SYSTEM.spacing.sm};
      background: ${DESIGN_SYSTEM.colors.primaryLight};
      margin-bottom: ${DESIGN_SYSTEM.spacing.md};
      border-left: 4px solid ${DESIGN_SYSTEM.colors.primary};
    }
    
    /* 정보 박스 스타일 */
    .info-box {
      border: 1px solid ${DESIGN_SYSTEM.colors.gray[300]};
      padding: 0;
      margin-bottom: ${DESIGN_SYSTEM.spacing.lg};
    }
    
    .info-row {
      display: flex;
      border-bottom: 1px solid ${DESIGN_SYSTEM.colors.gray[200]};
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      width: 120px;
      padding: ${DESIGN_SYSTEM.spacing.sm};
      background: ${DESIGN_SYSTEM.colors.gray[50]};
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      color: ${DESIGN_SYSTEM.colors.gray[500]};
      border-right: 1px solid ${DESIGN_SYSTEM.colors.gray[200]};
    }
    
    .info-value {
      flex: 1;
      padding: ${DESIGN_SYSTEM.spacing.sm};
    }
    
    /* 일정 스타일 */
    .day-schedule {
      margin-bottom: ${DESIGN_SYSTEM.spacing.xl};
      border: 1px solid ${DESIGN_SYSTEM.colors.gray[300]};
      overflow: hidden;
    }
    
    .day-header {
      background: ${DESIGN_SYSTEM.colors.primary};
      color: ${DESIGN_SYSTEM.colors.white};
      padding: ${DESIGN_SYSTEM.spacing.sm} ${DESIGN_SYSTEM.spacing.lg};
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
    }
    
    .schedule-content {
      padding: ${DESIGN_SYSTEM.spacing.lg};
    }
    
    .schedule-item {
      padding: ${DESIGN_SYSTEM.spacing.sm} 0;
      border-bottom: 1px solid ${DESIGN_SYSTEM.colors.gray[100]};
      display: flex;
      align-items: center;
    }
    
    .schedule-item:last-child {
      border-bottom: none;
    }
    
    .schedule-time {
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      color: ${DESIGN_SYSTEM.colors.primary};
      margin-right: ${DESIGN_SYSTEM.spacing.md};
      min-width: 60px;
    }
    
    .schedule-activity {
      flex: 1;
    }
    
    @media print {
      body { margin: 0; }
      .container { max-width: 100%; padding: 20px; }
      .header-a-group { margin: -20px -20px 20px -20px; }
    }
  `;

  // 고객용 일정표 HTML 생성
  const generateCustomerHTML = () => {
    const baseStyles = generateBaseStyles();
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 일정표 (고객용)</title>
  <style>
    ${baseStyles}
    
    /* 고객용 추가 스타일 */
    .notice-box {
      background: #fff3e0;
      border: 1px solid #ffb74d;
      border-radius: ${DESIGN_SYSTEM.borderRadius.md};
      padding: ${DESIGN_SYSTEM.spacing.md};
      margin: ${DESIGN_SYSTEM.spacing.lg} 0;
    }
    
    .notice-title {
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      color: #f57c00;
      margin-bottom: ${DESIGN_SYSTEM.spacing.sm};
    }
    
    .meal-info {
      display: inline-block;
      background: ${DESIGN_SYSTEM.colors.primaryLight};
      padding: 2px 8px;
      border-radius: ${DESIGN_SYSTEM.borderRadius.sm};
      font-size: ${DESIGN_SYSTEM.fonts.sizes.sm};
      margin-left: ${DESIGN_SYSTEM.spacing.sm};
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 헤더 -->
    <div class="header-a-group">
      <div class="header-logo">싱싱골프투어</div>
      <div class="header-subtitle">${templateData.tourName}</div>
      <div class="header-info">
        수원시 영통구 법조로149번길 200<br>
        고객센터 TEL 031-215-3990
      </div>
    </div>
    
    <!-- 상품 정보 -->
    <div class="section">
      <div class="section-title">상품 정보</div>
      <div class="info-box">
        <div class="info-row">
          <div class="info-label">상품명</div>
          <div class="info-value">${templateData.tourName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">일정</div>
          <div class="info-value">${templateData.startDate} ~ ${templateData.endDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">골프장</div>
          <div class="info-value">${templateData.golfCourse}</div>
        </div>
        <div class="info-row">
          <div class="info-label">숙소</div>
          <div class="info-value">${templateData.accommodation}</div>
        </div>
      </div>
    </div>
    
    <!-- 일정 안내 -->
    <div class="section">
      <div class="section-title">일정 안내</div>
      
      <!-- Day 1 -->
      <div class="day-schedule">
        <div class="day-header">Day 1 - ${templateData.startDate} (월)</div>
        <div class="schedule-content">
          ${templateData.schedule.day1.map(item => `
          <div class="schedule-item">
            <span class="schedule-time">${item.time}</span>
            <span class="schedule-activity">${item.activity}
              ${item.activity.includes('중식') || item.activity.includes('석식') ? 
                `<span class="meal-info">${item.activity.includes('중식') ? 
                  templateData.meals.day1.lunch : templateData.meals.day1.dinner}</span>` : ''}
            </span>
          </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Day 2 -->
      <div class="day-schedule">
        <div class="day-header">Day 2 - 2025. 4. 15. (화)</div>
        <div class="schedule-content">
          ${templateData.schedule.day2.map(item => `
          <div class="schedule-item">
            <span class="schedule-time">${item.time}</span>
            <span class="schedule-activity">${item.activity}
              ${item.activity.includes('조식') ? `<span class="meal-info">${templateData.meals.day2.breakfast}</span>` : ''}
              ${item.activity.includes('중식') ? `<span class="meal-info">${templateData.meals.day2.lunch}</span>` : ''}
              ${item.activity.includes('석식') ? `<span class="meal-info">${templateData.meals.day2.dinner}</span>` : ''}
            </span>
          </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Day 3 -->
      <div class="day-schedule">
        <div class="day-header">Day 3 - ${templateData.endDate} (수)</div>
        <div class="schedule-content">
          ${templateData.schedule.day3.map(item => `
          <div class="schedule-item">
            <span class="schedule-time">${item.time}</span>
            <span class="schedule-activity">${item.activity}
              ${item.activity.includes('조식') ? `<span class="meal-info">${templateData.meals.day3.breakfast}</span>` : ''}
              ${item.activity.includes('중식') ? `<span class="meal-info">${templateData.meals.day3.lunch}</span>` : ''}
            </span>
          </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- 안내사항 -->
    <div class="notice-box">
      <div class="notice-title">안내사항</div>
      <ul style="margin: 0; padding-left: 20px;">
        <li>출발 20분 전까지 탑승 장소에 도착해 주세요</li>
        <li>신분증을 반드시 지참해 주세요</li>
        <li>일정은 현지 사정에 따라 변경될 수 있습니다</li>
        <li>우천 시에도 정상 진행됩니다</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
  };

  // 스탭용 일정표 HTML 생성
  const generateStaffHTML = () => {
    const baseStyles = generateBaseStyles();
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 일정표 (스탭용)</title>
  <style>
    ${baseStyles}
    
    /* 스탭용 추가 스타일 */
    .staff-info-section {
      background: ${DESIGN_SYSTEM.colors.gray[50]};
      border: 2px solid ${DESIGN_SYSTEM.colors.primary};
      border-radius: ${DESIGN_SYSTEM.borderRadius.lg};
      padding: ${DESIGN_SYSTEM.spacing.lg};
      margin: ${DESIGN_SYSTEM.spacing.lg} 0;
    }
    
    .staff-info-title {
      font-size: ${DESIGN_SYSTEM.fonts.sizes.xl};
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      color: ${DESIGN_SYSTEM.colors.primary};
      margin-bottom: ${DESIGN_SYSTEM.spacing.md};
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .staff-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: ${DESIGN_SYSTEM.spacing.md};
    }
    
    .staff-item {
      background: white;
      padding: ${DESIGN_SYSTEM.spacing.sm};
      border: 1px solid ${DESIGN_SYSTEM.colors.gray[200]};
      border-radius: ${DESIGN_SYSTEM.borderRadius.sm};
    }
    
    .staff-label {
      font-size: ${DESIGN_SYSTEM.fonts.sizes.sm};
      color: ${DESIGN_SYSTEM.colors.gray[600]};
      margin-bottom: 4px;
    }
    
    .staff-value {
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      color: ${DESIGN_SYSTEM.colors.gray[700]};
    }
    
    .emergency-box {
      background: #ffebee;
      border: 2px solid #f44336;
      border-radius: ${DESIGN_SYSTEM.borderRadius.md};
      padding: ${DESIGN_SYSTEM.spacing.md};
      margin: ${DESIGN_SYSTEM.spacing.lg} 0;
    }
    
    .emergency-title {
      font-weight: ${DESIGN_SYSTEM.fonts.weights.bold};
      color: #d32f2f;
      margin-bottom: ${DESIGN_SYSTEM.spacing.sm};
      font-size: ${DESIGN_SYSTEM.fonts.sizes.xl};
    }
    
    .checklist-section {
      margin-top: ${DESIGN_SYSTEM.spacing['2xl']};
    }
    
    .checklist-item {
      padding: ${DESIGN_SYSTEM.spacing.sm};
      border: 1px solid ${DESIGN_SYSTEM.colors.gray[300]};
      margin-bottom: ${DESIGN_SYSTEM.spacing.sm};
      display: flex;
      align-items: center;
    }
    
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid ${DESIGN_SYSTEM.colors.primary};
      margin-right: ${DESIGN_SYSTEM.spacing.sm};
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 헤더 -->
    <div class="header-a-group">
      <div class="header-logo">싱싱골프투어</div>
      <div class="header-subtitle">${templateData.tourName} - 스탭용</div>
      <div class="header-info">
        운행 관리 문서<br>
        문서번호: ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}
      </div>
    </div>
    
    <!-- 운행 정보 -->
    <div class="staff-info-section">
      <div class="staff-info-title">운행 정보</div>
      <div class="staff-grid">
        <div class="staff-item">
          <div class="staff-label">차량번호</div>
          <div class="staff-value">${templateData.staffInfo.busNumber}</div>
        </div>
        <div class="staff-item">
          <div class="staff-label">운전기사</div>
          <div class="staff-value">${templateData.staffInfo.driverName}</div>
        </div>
        <div class="staff-item">
          <div class="staff-label">기사 연락처</div>
          <div class="staff-value">${templateData.staffInfo.driverPhone}</div>
        </div>
        <div class="staff-item">
          <div class="staff-label">가이드 연락처</div>
          <div class="staff-value">${templateData.staffInfo.guidePhone}</div>
        </div>
      </div>
    </div>
    
    <!-- 긴급 연락망 -->
    <div class="emergency-box">
      <div class="emergency-title">긴급 연락망</div>
      <div>본사 상황실: ${templateData.staffInfo.emergencyContact} (24시간)</div>
      <div>의료 응급: 119 / 경찰: 112</div>
    </div>
    
    <!-- 상품 정보 -->
    <div class="section">
      <div class="section-title">상품 정보</div>
      <div class="info-box">
        <div class="info-row">
          <div class="info-label">상품명</div>
          <div class="info-value">${templateData.tourName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">일정</div>
          <div class="info-value">${templateData.startDate} ~ ${templateData.endDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">골프장</div>
          <div class="info-value">${templateData.golfCourse}</div>
        </div>
        <div class="info-row">
          <div class="info-label">숙소</div>
          <div class="info-value">${templateData.accommodation}</div>
        </div>
        <div class="info-row">
          <div class="info-label">총 인원</div>
          <div class="info-value">28명 (7팀)</div>
        </div>
      </div>
    </div>
    
    <!-- 상세 일정 -->
    <div class="section">
      <div class="section-title">상세 일정</div>
      
      <!-- Day 1 -->
      <div class="day-schedule">
        <div class="day-header">Day 1 - ${templateData.startDate} (월)</div>
        <div class="schedule-content">
          ${templateData.schedule.day1.map(item => `
          <div class="schedule-item">
            <span class="schedule-time">${item.time}</span>
            <span class="schedule-activity">${item.activity}
              ${item.activity.includes('출발') || item.activity.includes('경유') ? 
                '<span style="color: #d32f2f; font-weight: bold; margin-left: 10px;">[집결 체크]</span>' : ''}
              ${item.activity.includes('중식') || item.activity.includes('석식') ? 
                `<span class="meal-info">${item.activity.includes('중식') ? 
                  templateData.meals.day1.lunch : templateData.meals.day1.dinner}</span>` : ''}
            </span>
          </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Day 2 -->
      <div class="day-schedule">
        <div class="day-header">Day 2 - 2025. 4. 15. (화)</div>
        <div class="schedule-content">
          ${templateData.schedule.day2.map(item => `
          <div class="schedule-item">
            <span class="schedule-time">${item.time}</span>
            <span class="schedule-activity">${item.activity}
              ${item.activity.includes('조식') ? `<span class="meal-info">${templateData.meals.day2.breakfast}</span>` : ''}
              ${item.activity.includes('중식') ? `<span class="meal-info">${templateData.meals.day2.lunch}</span>` : ''}
              ${item.activity.includes('석식') ? `<span class="meal-info">${templateData.meals.day2.dinner}</span>` : ''}
            </span>
          </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Day 3 -->
      <div class="day-schedule">
        <div class="day-header">Day 3 - ${templateData.endDate} (수)</div>
        <div class="schedule-content">
          ${templateData.schedule.day3.map(item => `
          <div class="schedule-item">
            <span class="schedule-time">${item.time}</span>
            <span class="schedule-activity">${item.activity}
              ${item.activity.includes('조식') ? `<span class="meal-info">${templateData.meals.day3.breakfast}</span>` : ''}
              ${item.activity.includes('중식') ? `<span class="meal-info">${templateData.meals.day3.lunch}</span>` : ''}
              ${item.activity.includes('출발') ? 
                '<span style="color: #d32f2f; font-weight: bold; margin-left: 10px;">[인원 체크]</span>' : ''}
            </span>
          </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- 체크리스트 -->
    <div class="checklist-section">
      <div class="section-title">운행 체크리스트</div>
      <div class="checklist-item">
        <span class="checkbox"></span>
        차량 안전점검 완료
      </div>
      <div class="checklist-item">
        <span class="checkbox"></span>
        탑승자 명단 확인
      </div>
      <div class="checklist-item">
        <span class="checkbox"></span>
        응급의료키트 준비
      </div>
      <div class="checklist-item">
        <span class="checkbox"></span>
        골프장 예약 확인
      </div>
      <div class="checklist-item">
        <span class="checkbox"></span>
        숙소 예약 확인
      </div>
      <div class="checklist-item">
        <span class="checkbox"></span>
        식당 예약 확인
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePreview = () => {
    const html = activeTemplate === 'customer' ? generateCustomerHTML() : generateStaffHTML();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const handleCopyHTML = () => {
    const html = activeTemplate === 'customer' ? generateCustomerHTML() : generateStaffHTML();
    navigator.clipboard.writeText(html);
    alert('HTML이 클립보드에 복사되었습니다.');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">일정표 템플릿</h1>
      <p className="text-gray-600 mb-8">A그룹 디자인 - 권위있고 신뢰감 있는 스타일</p>
      
      {/* 템플릿 선택 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'customer' ? 'ring-2 ring-blue-700 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('customer')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-700" />
              <div>
                <CardTitle className="text-lg">고객용 일정표</CardTitle>
                <CardDescription>깔끔하고 이해하기 쉬운 정보 전달</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                일정별 시간표
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                장소 및 이동 정보
              </li>
              <li className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                식사 메뉴 안내
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                중요 안내사항
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'staff' ? 'ring-2 ring-blue-700 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('staff')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-blue-700" />
              <div>
                <CardTitle className="text-lg">스탭용 일정표</CardTitle>
                <CardDescription>운행 관리를 위한 상세 정보</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                운행 정보 및 연락처
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                긴급 연락망
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                체크포인트 표시
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                운행 체크리스트
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* 데이터 입력 섹션 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">템플릿 데이터 설정</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">투어명</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md"
              value={templateData.tourName}
              onChange={(e) => setTemplateData({...templateData, tourName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">골프장</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md"
              value={templateData.golfCourse}
              onChange={(e) => setTemplateData({...templateData, golfCourse: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">시작일</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md"
              value={templateData.startDate}
              onChange={(e) => setTemplateData({...templateData, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">종료일</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md"
              value={templateData.endDate}
              onChange={(e) => setTemplateData({...templateData, endDate: e.target.value})}
            />
          </div>
        </div>
      </div>
      
      {/* 미리보기 섹션 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">템플릿 미리보기</h2>
        <div className="bg-white border rounded-lg p-8 min-h-[400px]">
          <div className="text-center mb-6" style={{ backgroundColor: '#2c5282', color: 'white', padding: '30px', margin: '-32px -32px 32px -32px' }}>
            <div className="text-2xl font-bold mb-2">싱싱골프투어</div>
            <div className="text-lg mb-1">{templateData.tourName} {activeTemplate === 'staff' && '- 스탭용'}</div>
            <div className="text-sm opacity-90">
              {activeTemplate === 'customer' ? 
                '수원시 영통구 법조로149번길 200 | TEL 031-215-3990' : 
                `운행 관리 문서 | 문서번호: ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
              }
            </div>
          </div>
          
          {activeTemplate === 'customer' ? (
            <div>
              <div className="mb-4">
                <div className="font-bold text-lg mb-2" style={{ color: '#2c5282' }}>상품 정보</div>
                <div className="border rounded p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>상품명:</strong> {templateData.tourName}</div>
                    <div><strong>골프장:</strong> {templateData.golfCourse}</div>
                    <div><strong>일정:</strong> {templateData.startDate} ~ {templateData.endDate}</div>
                    <div><strong>숙소:</strong> {templateData.accommodation}</div>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-300 rounded p-3 text-sm">
                <strong className="text-orange-700">안내사항</strong>
                <p className="mt-1">출발 20분 전까지 탑승 장소에 도착해 주세요</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 border-2 border-blue-700 rounded-lg p-4 mb-4">
                <div className="font-bold text-blue-700 mb-2">운행 정보</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2 border rounded">
                    <div className="text-xs text-gray-600">차량번호</div>
                    <div className="font-bold">{templateData.staffInfo.busNumber}</div>
                  </div>
                  <div className="bg-white p-2 border rounded">
                    <div className="text-xs text-gray-600">운전기사</div>
                    <div className="font-bold">{templateData.staffInfo.driverName}</div>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3">
                <div className="font-bold text-red-700">긴급 연락망</div>
                <div className="text-sm mt-1">본사 상황실: {templateData.staffInfo.emergencyContact} (24시간)</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 액션 버튼 */}
      <div className="flex gap-4 mb-8">
        <Button onClick={handlePreview} className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          새 창에서 미리보기
        </Button>
        <Button onClick={handleCopyHTML} variant="outline" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          HTML 복사
        </Button>
      </div>
      
      {/* 디자인 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-blue-900">🎨 디자인 시스템</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-blue-700">색상:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-gray-700">
                <li>• Primary: #2c5282 (진한 네이비)</li>
                <li>• Primary Light: #e7f3ff (연한 블루)</li>
                <li>• Gray Scale: #f8f9fa ~ #333</li>
              </ul>
            </div>
            <div>
              <strong className="text-blue-700">타이포그래피:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-gray-700">
                <li>• Font: Noto Sans KR</li>
                <li>• Sizes: 12px ~ 28px</li>
                <li>• Weights: 400, 500, 700</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-green-900">📋 사용 가이드</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong className="text-green-700">모듈화 구조:</strong> 각 섹션이 독립적으로 관리되어 쉽게 수정 가능</p>
            <p><strong className="text-green-700">데이터 바인딩:</strong> 템플릿 데이터를 한 곳에서 관리하여 일관성 유지</p>
            <p><strong className="text-green-700">반응형 디자인:</strong> 인쇄 및 화면 표시에 최적화</p>
            <p><strong className="text-green-700">확장성:</strong> 새로운 섹션이나 정보를 쉽게 추가 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
}
