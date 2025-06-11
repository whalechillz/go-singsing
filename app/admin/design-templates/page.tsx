"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Copy, FileText, Calendar, BedDouble } from 'lucide-react';

export default function DesignTemplatesPage() {
  const [activeTemplate, setActiveTemplate] = React.useState<'contract' | 'operational' | 'timetable-customer' | 'timetable-staff'>('contract');

  // A그룹 (계약 문서) - 권위있는 디자인
  const generateContractHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 일정표</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
    }
    
    /* A그룹 헤더 - 권위있는 스타일 */
    .header-contract {
      background-color: #2c5282;
      color: white;
      padding: 30px;
      text-align: center;
      margin: -30px -30px 30px -30px;
    }
    
    .header-contract .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 15px;
      letter-spacing: 0.5px;
    }
    
    .header-contract .subtitle {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 10px;
      opacity: 0.95;
    }
    
    .header-contract .company-info {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.6;
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
    
    .info-box {
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
    
    .day-schedule {
      margin-bottom: 25px;
      border: 1px solid #ddd;
      overflow: hidden;
    }
    
    .day-title {
      background: #2c5282;
      color: white;
      padding: 12px 20px;
      font-weight: bold;
    }
    
    @media print {
      body { margin: 0; }
      .container { max-width: 100%; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-contract">
      <div class="logo">싱싱골프투어</div>
      <div class="subtitle">2박3일 순천버스핑</div>
      <div class="company-info">
        수원시 영통구 법조로149번길 200<br>
        고객센터 TEL 031-215-3990
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">상품 정보</div>
      <div class="info-box">
        <div class="info-row">
          <div class="info-label">상품명</div>
          <div class="info-value">2박3일 순천버스핑</div>
        </div>
        <div class="info-row">
          <div class="info-label">일정</div>
          <div class="info-value">2025. 4. 14. ~ 2025. 4. 16.</div>
        </div>
        <div class="info-row">
          <div class="info-label">골프장</div>
          <div class="info-value">파인힐스CC</div>
        </div>
        <div class="info-row">
          <div class="info-label">숙소</div>
          <div class="info-value">파인힐스 골프텔</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">일정 안내</div>
      <div class="day-schedule">
        <div class="day-title">Day 1 - 2025년 4월 14일 (월)</div>
        <div style="padding: 20px;">
          <div style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="font-weight: bold; color: #2c5282; margin-right: 10px;">13:08</span>
            파인코스
          </div>
          <div style="padding: 10px 0;">
            <span style="font-weight: bold; color: #2c5282; margin-right: 10px;">19:00</span>
            석식 (한정식)
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // B그룹 (실행 문서) - 친근한 디자인
  const generateOperationalHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 탑승 안내</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: #f5f7fa;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    /* B그룹 헤더 - 친근한 스타일 */
    .header-operational {
      background-color: #4a6fa5;
      color: white;
      padding: 25px;
      text-align: center;
    }
    
    .header-operational .logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .header-operational .doc-title {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 5px;
    }
    
    .header-operational .tour-title {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #4a6fa5;
      padding: 10px;
      background: linear-gradient(90deg, #e7f3ff 0%, transparent 100%);
      margin-bottom: 15px;
      border-left: 4px solid #4a6fa5;
      border-radius: 4px;
    }
    
    .boarding-list {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .boarding-item {
      background: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
    }
    
    .boarding-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(74, 111, 165, 0.1);
    }
    
    .boarding-time {
      font-size: 18px;
      font-weight: bold;
      color: #4a6fa5;
    }
    
    .boarding-location {
      flex: 1;
    }
    
    .boarding-count {
      background: #4a6fa5;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
    }
    
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-operational">
      <div class="logo">싱싱골프투어</div>
      <div class="doc-title">탑승 안내</div>
      <div class="tour-title">2박3일 순천버스핑</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">탑승 장소 및 시간</div>
        <div class="boarding-list">
          <div class="boarding-item">
            <div class="boarding-time">05:00</div>
            <div class="boarding-location">
              <strong>강남역</strong><br>
              <span style="color: #666; font-size: 13px;">1번 출구 앞</span>
            </div>
            <div class="boarding-count">12명</div>
          </div>
          
          <div class="boarding-item">
            <div class="boarding-time">05:30</div>
            <div class="boarding-location">
              <strong>잠실역</strong><br>
              <span style="color: #666; font-size: 13px;">8번 출구 앞</span>
            </div>
            <div class="boarding-count">8명</div>
          </div>
          
          <div class="boarding-item">
            <div class="boarding-time">06:00</div>
            <div class="boarding-location">
              <strong>수원역</strong><br>
              <span style="color: #666; font-size: 13px;">역전 로터리</span>
            </div>
            <div class="boarding-count">8명</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">안내 사항</div>
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
          <ul style="margin: 0; padding-left: 20px;">
            <li>출발 20분 전까지 탑승 장소에 도착해 주세요</li>
            <li>탑승 시간은 교통 상황에 따라 변경될 수 있습니다</li>
            <li>신분증을 반드시 지참해 주세요</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // C그룹 - 티타임표 고객용 디자인 (간단한 정보)
  const generateTimetableCustomerHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 티타임표</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: #f5f7fa;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    /* 티타임표 헤더 스타일 */
    .header-timetable {
      background: linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    
    .header-timetable .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .header-timetable .subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
    
    /* 티타임 카드 스타일 */
    .timetable-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .time-card {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .time-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .time-header {
      padding: 15px;
      text-align: center;
      font-weight: bold;
    }
    
    .time-header.morning {
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      color: white;
    }
    
    .time-header.afternoon {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      color: white;
    }
    
    .time-header.late {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      color: white;
    }
    
    .time-content {
      padding: 20px;
    }
    
    .time-slot {
      font-size: 24px;
      font-weight: bold;
      color: #374151;
      margin-bottom: 10px;
    }
    
    .participant-count {
      font-size: 36px;
      font-weight: bold;
      color: #6b7280;
      text-align: center;
      margin: 20px 0;
    }
    
    .participant-label {
      font-size: 14px;
      color: #9ca3af;
      text-align: center;
    }
    
    /* 날짜 섹션 */
    .date-section {
      background: #6366f1;
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: bold;
    }
    
    /* 요약 정보 */
    .summary-section {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 10px;
      margin-top: 30px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      text-align: center;
    }
    
    .summary-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
    }
    
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #6366f1;
    }
    
    .summary-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-timetable">
      <div class="title">티타임표</div>
      <div class="subtitle">2박3일 순천버스핑 · 파인힐스CC</div>
    </div>
    
    <div class="date-section">
      2025년 4월 14일 월요일
    </div>
    
    <div class="timetable-grid">
      <div class="time-card">
        <div class="time-header morning">
          4월 14일 · 오전
        </div>
        <div class="time-content">
          <div class="time-slot">13:08</div>
          <div class="participant-count">28/28</div>
          <div class="participant-label">파인코스</div>
        </div>
      </div>
      
      <div class="time-card">
        <div class="time-header afternoon">
          4월 15일 · 오전
        </div>
        <div class="time-content">
          <div class="time-slot">07:30</div>
          <div class="participant-count">28/28</div>
          <div class="participant-label">밸리코스</div>
        </div>
      </div>
      
      <div class="time-card">
        <div class="time-header late">
          4월 16일 · 오전
        </div>
        <div class="time-content">
          <div class="time-slot">08:00</div>
          <div class="participant-count">28/28</div>
          <div class="participant-label">레이크코스</div>
        </div>
      </div>
    </div>
    
    <div class="summary-section">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-value">3</div>
          <div class="summary-label">총 라운드</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">28</div>
          <div class="summary-label">총 인원</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">7</div>
          <div class="summary-label">총 팀</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // C그룹 - 티타임표 스탭용 디자인 (상세 정보)
  const generateTimetableStaffHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 티타임표 (스탭용)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #333;
      background: #f5f7fa;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    /* 스탭용 헤더 - 전문적인 스타일 */
    .header-staff {
      background: linear-gradient(135deg, #4a5568 0%, #718096 100%);
      color: white;
      padding: 25px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    
    .header-staff .title {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .header-staff .subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    
    /* 날짜별 섹션 */
    .date-section {
      background: #4a5568;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
    }
    
    /* 티타임 테이블 */
    .timetable-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .timetable-table th {
      background: #f7fafc;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      font-size: 13px;
      color: #4a5568;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .timetable-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    
    .timetable-table tr:hover {
      background: #f7fafc;
    }
    
    .timetable-table tr:last-child td {
      border-bottom: none;
    }
    
    .time-slot {
      font-weight: bold;
      color: #4a5568;
      font-size: 14px;
    }
    
    .course-name {
      color: #718096;
      font-size: 12px;
    }
    
    .participant-name {
      font-weight: 600;
      color: #2d3748;
    }
    
    .team-info {
      color: #718096;
      font-size: 12px;
    }
    
    /* 요약 정보 */
    .summary-section {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .summary-item {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #4a5568;
    }
    
    .summary-label {
      font-size: 13px;
      color: #718096;
      margin-top: 5px;
    }
    
    /* 참가자 목록 그리드 */
    .participants-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 20px;
      padding: 20px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .participant-item {
      background: white;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
    }
    
    @media print {
      body { background: white; }
      .container { box-shadow: none; max-width: 100%; }
      .timetable-table { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-staff">
      <div class="title">티타임표 - 스탭용</div>
      <div class="subtitle">2박3일 순천버스핑 · 파인힐스CC</div>
    </div>
    
    <div class="date-section">
      2025년 4월 14일 월요일 - 파인코스
    </div>
    
    <table class="timetable-table">
      <thead>
        <tr>
          <th style="width: 80px;">티타임</th>
          <th style="width: 80px;">팀번호</th>
          <th>참가자 1</th>
          <th>참가자 2</th>
          <th>참가자 3</th>
          <th>참가자 4</th>
          <th style="width: 100px;">탑승지</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="time-slot">13:08</td>
          <td class="team-info">1팀</td>
          <td><span class="participant-name">홍길동</span></td>
          <td><span class="participant-name">김철수</span></td>
          <td><span class="participant-name">이영희</span></td>
          <td><span class="participant-name">박민수</span></td>
          <td class="team-info">강남</td>
        </tr>
        <tr>
          <td class="time-slot">13:08</td>
          <td class="team-info">2팀</td>
          <td><span class="participant-name">최정훈</span></td>
          <td><span class="participant-name">강민정</span></td>
          <td><span class="participant-name">윤서준</span></td>
          <td><span class="participant-name">송민호</span></td>
          <td class="team-info">잠실</td>
        </tr>
        <tr>
          <td class="time-slot">13:08</td>
          <td class="team-info">3팀</td>
          <td><span class="participant-name">정태훈</span></td>
          <td><span class="participant-name">한지민</span></td>
          <td><span class="participant-name">오현우</span></td>
          <td><span class="participant-name">백서진</span></td>
          <td class="team-info">수원</td>
        </tr>
      </tbody>
    </table>
    
    <div class="summary-section">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #2d3748;">일일 요약</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-value">13:08</div>
          <div class="summary-label">티오프 시간</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">7팀</div>
          <div class="summary-label">총 팀 수</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">28명</div>
          <div class="summary-label">총 인원</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">파인코스</div>
          <div class="summary-label">라운드 코스</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 30px;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #2d3748;">탑승지별 참가자 목록</h3>
      <div class="participants-grid">
        <div class="participant-item"><strong>강남:</strong> 12명</div>
        <div class="participant-item"><strong>잠실:</strong> 8명</div>
        <div class="participant-item"><strong>수원:</strong> 8명</div>
        <div class="participant-item"><strong>총계:</strong> 28명</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePreview = () => {
    let html = '';
    switch (activeTemplate) {
      case 'contract':
        html = generateContractHTML();
        break;
      case 'operational':
        html = generateOperationalHTML();
        break;
      case 'timetable-customer':
        html = generateTimetableCustomerHTML();
        break;
      case 'timetable-staff':
        html = generateTimetableStaffHTML();
        break;
    }
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const handleCopyHTML = () => {
    let html = '';
    switch (activeTemplate) {
      case 'contract':
        html = generateContractHTML();
        break;
      case 'operational':
        html = generateOperationalHTML();
        break;
      case 'timetable-customer':
        html = generateTimetableCustomerHTML();
        break;
      case 'timetable-staff':
        html = generateTimetableStaffHTML();
        break;
    }
    
    navigator.clipboard.writeText(html);
    alert('HTML이 클립보드에 복사되었습니다.');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">문서 디자인 템플릿</h1>
      <p className="text-gray-600 mb-8">싱싱골프투어 통합 디자인 시스템</p>
      
      {/* 템플릿 선택 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'contract' ? 'ring-2 ring-blue-700 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('contract')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-700" />
              <div>
                <CardTitle className="text-lg">A그룹: 계약 문서</CardTitle>
                <CardDescription>권위감 · 신뢰감 · 전문성</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2c5282' }}></div>
                <span className="text-sm">진한 네이비 (#2c5282)</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 고객용 일정표 (견적서/계약서)</li>
                <li>• 직사각형 레이아웃</li>
                <li>• 권위있는 헤더 디자인</li>
                <li>• 15px 폰트 크기</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'operational' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('operational')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <BedDouble className="w-8 h-8 text-blue-500" />
              <div>
                <CardTitle className="text-lg">B그룹: 실행 문서</CardTitle>
                <CardDescription>친근감 · 편안함 · 실용성</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4a6fa5' }}></div>
                <span className="text-sm">밝은 블루 (#4a6fa5)</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 탑승안내서, 객실배정표</li>
                <li>• 둥근 모서리 디자인</li>
                <li>• 친근한 헤더 스타일</li>
                <li>• 14px 폰트 크기</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'timetable-customer' ? 'ring-2 ring-purple-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('timetable-customer')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle className="text-lg">C그룹: 티타임표 (고객용)</CardTitle>
                <CardDescription>시각적 · 직관적 · 간단</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #6b46c1, #8b5cf6)' }}></div>
                <span className="text-sm">퍼플 그라데이션</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 티타임 정보 카드</li>
                <li>• 시간대별 색상 구분</li>
                <li>• 요약 정보 대시보드</li>
                <li>• 비주얼 중심 디자인</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'timetable-staff' ? 'ring-2 ring-gray-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('timetable-staff')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-gray-600" />
              <div>
                <CardTitle className="text-lg">C그룹: 티타임표 (스탭용)</CardTitle>
                <CardDescription>상세 · 전문적 · 데이터</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #4a5568, #718096)' }}></div>
                <span className="text-sm">그레이 그라데이션</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 상세 참가자 테이블</li>
                <li>• 탑승지별 분류</li>
                <li>• 팀별 조편표</li>
                <li>• 전문가용 레이아웃</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 미리보기 섹션 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">선택된 템플릿 미리보기</h2>
        <div className="bg-white border rounded-lg p-8 min-h-[400px]">
          {activeTemplate === 'contract' && (
            <div>
              <div className="text-center mb-6" style={{ backgroundColor: '#2c5282', color: 'white', padding: '30px', margin: '-32px -32px 32px -32px' }}>
                <div className="text-2xl font-bold mb-2">싱싱골프투어</div>
                <div className="text-lg mb-1">2박3일 순천버스핑</div>
                <div className="text-sm opacity-90">수원시 영통구 법조로149번길 200 | TEL 031-215-3990</div>
              </div>
              <div className="mb-4">
                <div className="font-bold text-lg mb-2" style={{ color: '#2c5282' }}>상품 정보</div>
                <div className="border rounded p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>상품명:</strong> 2박3일 순천버스핑</div>
                    <div><strong>골프장:</strong> 파인힐스CC</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTemplate === 'operational' && (
            <div>
              <div className="text-center mb-6" style={{ backgroundColor: '#4a6fa5', color: 'white', padding: '25px', borderRadius: '10px' }}>
                <div className="text-xl font-bold mb-1">싱싱골프투어</div>
                <div className="text-lg mb-1">탑승 안내</div>
                <div className="text-sm opacity-90">2박3일 순천버스핑</div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold" style={{ color: '#4a6fa5' }}>05:00</div>
                    <div>
                      <div className="font-semibold">강남역</div>
                      <div className="text-sm text-gray-600">1번 출구 앞</div>
                    </div>
                  </div>
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">12명</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTemplate === 'timetable-customer' && (
            <div>
              <div className="text-center mb-6 p-6 rounded-lg" style={{ background: 'linear-gradient(135deg, #6b46c1, #8b5cf6)', color: 'white' }}>
                <div className="text-2xl font-bold mb-2">티타임표</div>
                <div className="text-sm opacity-90">2박3일 순천버스핑 · 파인힐스CC</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-3 text-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
                    4월 14일
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold mb-2">13:08</div>
                    <div className="text-3xl font-bold text-gray-600 mb-1">28/28</div>
                    <div className="text-sm text-gray-500">파인코스</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTemplate === 'timetable-staff' && (
            <div>
              <div className="text-center mb-6 p-5 rounded-lg" style={{ background: 'linear-gradient(135deg, #4a5568, #718096)', color: 'white' }}>
                <div className="text-xl font-bold mb-1">티타임표 - 스탭용</div>
                <div className="text-sm opacity-90">2박3일 순천버스핑 · 파인힐스CC</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left">티타임</th>
                      <th className="border p-2 text-left">팀</th>
                      <th className="border p-2 text-left">참가자 1</th>
                      <th className="border p-2 text-left">참가자 2</th>
                      <th className="border p-2 text-left">참가자 3</th>
                      <th className="border p-2 text-left">참가자 4</th>
                      <th className="border p-2 text-left">탑승지</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold">13:08</td>
                      <td className="border p-2">1팀</td>
                      <td className="border p-2">홍길동</td>
                      <td className="border p-2">김철수</td>
                      <td className="border p-2">이영희</td>
                      <td className="border p-2">박민수</td>
                      <td className="border p-2">강남</td>
                    </tr>
                  </tbody>
                </table>
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
      
      {/* 디자인 가이드라인 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-blue-900">📐 디자인 원칙</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-blue-700">색상 체계:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-gray-700">
                <li>• A그룹 (#2c5282): 진중하고 권위있는 느낌</li>
                <li>• B그룹 (#4a6fa5): 부드럽고 친근한 느낌</li>
                <li>• C그룹 고객용 (#6b46c1): 화려하고 시각적인 느낌</li>
                <li>• C그룹 스탭용 (#4a5568): 전문적이고 실무적인 느낌</li>
              </ul>
            </div>
            <div>
              <strong className="text-blue-700">레이아웃:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-gray-700">
                <li>• A그룹: 직사각형, 격식있는 구조</li>
                <li>• B그룹: 둥근 모서리, 유연한 구조</li>
                <li>• C그룹 고객용: 카드 형식, 비주얼 중심</li>
                <li>• C그룹 스탭용: 테이블 형식, 데이터 중심</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-green-900">✏️ 사용 가이드</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong className="text-green-700">템플릿 선택:</strong> 문서의 용도와 대상에 맞는 템플릿을 선택하세요.</p>
            <p><strong className="text-green-700">미리보기:</strong> 실제 렌더링된 모습을 새 창에서 확인할 수 있습니다.</p>
            <p><strong className="text-green-700">HTML 복사:</strong> 생성된 HTML을 복사하여 필요에 맞게 수정하세요.</p>
            <p><strong className="text-green-700">커스터마이징:</strong> 색상, 폰트 크기, 여백 등을 조정하여 사용하세요.</p>
            <div className="mt-2 p-3 bg-green-100 rounded text-xs">
              <strong>티타임표 선택 가이드:</strong>
              <ul className="mt-1 ml-4">
                <li>• 고객용: 시각적이고 간단한 정보만 필요한 경우</li>
                <li>• 스탭용: 참가자 이름, 팀 편성 등 상세 정보가 필요한 경우</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
