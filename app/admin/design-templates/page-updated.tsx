"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Copy, FileText, Calendar, BedDouble, Sparkles, Briefcase, Palette, Quote } from 'lucide-react';

export default function DesignTemplatesPage() {
  const [activeTemplate, setActiveTemplate] = React.useState<'a-contract' | 'b-operational' | 'c-promotional' | 'd-professional' | 'e-dynamic' | 'f-quote'>('a-contract');
  const [dynamicTheme, setDynamicTheme] = React.useState<'blue' | 'green' | 'orange'>('blue');

  // A그룹: 브랜드컬러 (계약문서) - #2c5282
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

  // B그룹: 브랜드컬러 (실행문서) - #4a6fa5
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

  // C그룹: 트렌드컬러 (홍보문서) - 화려한 그라데이션
  const generatePromotionalHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 프로모션</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    /* C그룹 헤더 - 화려한 그라데이션 */
    .header-promotional {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
      border-radius: 20px;
      margin-bottom: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
    }
    
    .header-promotional::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 20s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(-50px, -50px) rotate(180deg); }
    }
    
    .header-promotional .logo {
      font-size: 42px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      position: relative;
      z-index: 1;
    }
    
    .header-promotional .title {
      font-size: 28px;
      font-weight: 500;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }
    
    .header-promotional .subtitle {
      font-size: 18px;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    
    /* 콘텐츠 카드 */
    .promo-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transform: translateY(0);
      transition: all 0.3s ease;
    }
    
    .promo-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .promo-title {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      padding: 30px;
      border-radius: 15px;
      color: white;
      text-align: center;
      margin: 30px 0;
      font-size: 20px;
      font-weight: bold;
      box-shadow: 0 10px 20px rgba(250, 112, 154, 0.3);
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }
    
    .feature-item {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      transition: transform 0.3s ease;
    }
    
    .feature-item:hover {
      transform: scale(1.05);
    }
    
    .feature-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      border-radius: 50px;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 10px;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
    }
    
    @media print {
      body { background: white; }
      .promo-card { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-promotional">
      <div class="logo">싱싱골프투어</div>
      <div class="title">특별 프로모션</div>
      <div class="subtitle">2025년 봄 시즌 특가!</div>
    </div>
    
    <div class="promo-card">
      <h2 class="promo-title">한정 특가! 2박3일 순천 골프투어</h2>
      <p style="font-size: 18px; line-height: 1.8;">
        봄꽃이 만발한 순천에서 즐기는 프리미엄 골프 여행!<br>
        순천만국가정원과 순천만습지의 아름다운 풍경과 함께
      </p>
    </div>
    
    <div class="highlight-box">
      🎉 조기 예약 고객님께 20% 할인 혜택! 🎉
    </div>
    
    <div class="feature-grid">
      <div class="feature-item">
        <div class="feature-icon">⛳</div>
        <h3>프리미엄 골프장</h3>
        <p>순천 최고의 코스에서<br>즐기는 라운딩</p>
      </div>
      <div class="feature-item">
        <div class="feature-icon">🏨</div>
        <h3>특급 호텔</h3>
        <p>편안한 휴식을 위한<br>최고급 숙박 시설</p>
      </div>
      <div class="feature-item">
        <div class="feature-icon">🍴</div>
        <h3>특선 요리</h3>
        <p>순천의 맛있는<br>향토 음식 제공</p>
      </div>
    </div>
    
    <div class="promo-card" style="text-align: center;">
      <h3 style="font-size: 28px; margin-bottom: 30px;">지금 바로 예약하세요!</h3>
      <a href="#" class="cta-button">예약하기</a>
      <a href="#" class="cta-button" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">상담받기</a>
    </div>
  </div>
</body>
</html>`;
  };

  // D그룹: 그레이컬러 (실용/고급/권위문서) - #4a5568
  const generateProfessionalHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 공식 문서</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #2d3748;
      background: #f7fafc;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
    }
    
    /* D그룹 헤더 - 고급스럽고 권위있는 스타일 */
    .header-professional {
      background: linear-gradient(135deg, #4a5568 0%, #718096 100%);
      color: white;
      padding: 40px 50px;
      position: relative;
    }
    
    .header-professional::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #cbd5e0 0%, #e2e8f0 50%, #cbd5e0 100%);
    }
    
    .header-professional .logo {
      font-size: 24px;
      font-weight: 300;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 15px;
    }
    
    .header-professional .document-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .header-professional .document-info {
      font-size: 13px;
      opacity: 0.8;
      letter-spacing: 1px;
    }
    
    /* 콘텐츠 영역 */
    .content {
      padding: 50px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-header {
      border-bottom: 2px solid #2d3748;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    .section-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .formal-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .formal-table th {
      background: #2d3748;
      color: white;
      padding: 12px 20px;
      text-align: left;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 13px;
    }
    
    .formal-table td {
      padding: 12px 20px;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }
    
    .formal-table tr:nth-child(even) {
      background: #f7fafc;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      margin: 30px 0;
    }
    
    .info-block {
      background: #f7fafc;
      padding: 25px;
      border-left: 3px solid #4a5568;
    }
    
    .info-block h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #2d3748;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-block p {
      margin: 0;
      color: #4a5568;
      font-size: 14px;
    }
    
    .signature-section {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 1px solid #cbd5e0;
      text-align: right;
    }
    
    .signature-date {
      font-size: 14px;
      color: #718096;
      margin-bottom: 20px;
    }
    
    .signature-name {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 5px;
    }
    
    .signature-title {
      font-size: 14px;
      color: #718096;
    }
    
    /* 푸터 */
    .footer {
      background: #2d3748;
      color: white;
      padding: 30px 50px;
      text-align: center;
      font-size: 12px;
      opacity: 0.8;
    }
    
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-professional">
      <div class="logo">Singsing Golf Tour</div>
      <div class="document-title">공식 운영 문서</div>
      <div class="document-info">Document No. 2025-001 | Date: 2025.01.15</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-header">
          <h2>Executive Summary</h2>
        </div>
        <p style="color: #4a5568; line-height: 1.8;">
          본 문서는 싱싱골프투어의 2025년 상반기 운영 계획을 담고 있습니다.<br>
          최고급 골프 투어 서비스를 통해 고객 만족도를 극대화하고자 합니다.
        </p>
      </div>
      
      <div class="section">
        <div class="section-header">
          <h2>Financial Overview</h2>
        </div>
        <table class="formal-table">
          <tr>
            <th>Category</th>
            <th>Q1 2025</th>
            <th>Q2 2025</th>
            <th>Total</th>
          </tr>
          <tr>
            <td>Revenue</td>
            <td>KRW 1,200M</td>
            <td>KRW 1,500M</td>
            <td>KRW 2,700M</td>
          </tr>
          <tr>
            <td>Operating Cost</td>
            <td>KRW 800M</td>
            <td>KRW 950M</td>
            <td>KRW 1,750M</td>
          </tr>
          <tr>
            <td>Net Profit</td>
            <td>KRW 400M</td>
            <td>KRW 550M</td>
            <td>KRW 950M</td>
          </tr>
        </table>
      </div>
      
      <div class="info-grid">
        <div class="info-block">
          <h3>Mission Statement</h3>
          <p>최고의 골프 여행 경험을 통해 고객의 삶에 가치를 더하는 프리미엄 서비스</p>
        </div>
        <div class="info-block">
          <h3>Core Values</h3>
          <p>Excellence, Integrity, Innovation, Customer-Centricity</p>
        </div>
      </div>
      
      <div class="signature-section">
        <div class="signature-date">2025년 1월 15일</div>
        <div class="signature-name">홍길동</div>
        <div class="signature-title">대표이사 / CEO</div>
      </div>
    </div>
    
    <div class="footer">
      Singsing Golf Tour Co., Ltd. | Business Registration No. 123-45-67890<br>
      149-200 Beopjo-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do, Republic of Korea
    </div>
  </div>
</body>
</html>`;
  };

  // E그룹: 변동컬러 (추천/바이럴/링크/모바일문서) - 테마 토글 가능
  const generateDynamicHTML = () => {
    const themes = {
      blue: {
        primary: '#1a4aa3',
        secondary: '#3a6bc5',
        accent: '#4f8bf9',
        light: '#e8f0ff'
      },
      green: {
        primary: '#2a8d46',
        secondary: '#3bb962',
        accent: '#4bd679',
        light: '#e6f7eb'
      },
      orange: {
        primary: '#e17b20',
        secondary: '#f3a953',
        accent: '#ffbd69',
        light: '#fff4e6'
      }
    };
    
    const theme = themes[dynamicTheme];
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 모바일</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    
    :root {
      --primary-color: ${theme.primary};
      --secondary-color: ${theme.secondary};
      --accent-color: ${theme.accent};
      --light-color: ${theme.light};
      --text-color: #333333;
      --white: #ffffff;
      --light-gray: #f8f9fa;
      --gray: #aaaaaa;
      --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      --transition-speed: 0.5s;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      transition: background-color var(--transition-speed) ease, 
                  color var(--transition-speed) ease,
                  border-color var(--transition-speed) ease;
    }
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      background-color: var(--light-gray);
      color: var(--text-color);
      overflow-x: hidden;
    }
    
    .container {
      max-width: 500px;
      margin: 0 auto;
      padding-bottom: 80px;
    }
    
    .header {
      position: relative;
      height: 180px;
      overflow: hidden;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: var(--white);
      text-align: center;
      padding: 40px 20px 20px;
      border-radius: 0 0 30px 30px;
      box-shadow: var(--card-shadow);
    }
    
    .slogan {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 16px;
      font-weight: 300;
      color: var(--white);
      background-color: rgba(255, 255, 255, 0.2);
      padding: 8px 0;
    }
    
    .header h1 {
      margin: 20px 0 10px;
      font-size: 32px;
      font-weight: 700;
    }
    
    .header p {
      margin: 0;
      font-size: 18px;
      opacity: 0.9;
    }
    
    .section-title {
      margin: 30px 20px 15px;
      font-size: 20px;
      font-weight: 500;
      color: var(--primary-color);
    }
    
    .section {
      margin: 20px;
      padding: 20px;
      background-color: var(--white);
      border-radius: 15px;
      box-shadow: var(--card-shadow);
      position: relative;
    }
    
    .section-number {
      position: absolute;
      right: 15px;
      top: 15px;
      width: 30px;
      height: 30px;
      background-color: var(--primary-color);
      color: var(--white);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
    }
    
    .section h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: var(--primary-color);
    }
    
    .section p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-color);
    }
    
    .card {
      background-color: var(--white);
      border-radius: 15px;
      margin: 15px 20px;
      overflow: hidden;
      box-shadow: var(--card-shadow);
    }
    
    .card-header {
      background-color: var(--primary-color);
      color: var(--white);
      padding: 15px 20px;
    }
    
    .card-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
    
    .card-header p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    
    .card-body {
      padding: 15px 20px;
    }
    
    .card-body p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-color);
    }
    
    .card-body .highlight {
      color: var(--accent-color);
      font-weight: 500;
    }
    
    .btn {
      display: inline-block;
      background-color: var(--primary-color);
      color: var(--white);
      padding: 6px 15px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 14px;
      float: right;
      margin-top: 10px;
    }
    
    .btn:hover {
      background-color: var(--secondary-color);
    }
    
    .contact {
      background-color: var(--white);
      border-radius: 15px;
      margin: 20px;
      padding: 20px;
      text-align: center;
      box-shadow: var(--card-shadow);
    }
    
    .contact h3 {
      margin: 0 0 10px;
      font-size: 16px;
      color: var(--gray);
      font-weight: 400;
    }
    
    .contact p {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-color);
    }
    
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: var(--white);
      padding: 15px 0;
      text-align: center;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      font-size: 14px;
      color: var(--gray);
    }
    
    .footer a {
      text-decoration: none;
      color: var(--primary-color);
    }
    
    @media (max-width: 768px) {
      .container {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="slogan">싱싱골프투어와 함께하는 즐거운 골프 여행!</div>
      <h1>싱싱골프투어</h1>
      <p>순천 2박3일 / 05/19(월)~21(수)</p>
    </div>
    
    <h2 class="section-title">투어 안내</h2>
    
    <div class="section">
      <div class="section-number">1</div>
      <h2>상품 정보</h2>
      <p>일정, 식사, 골프장, 숙박 안내</p>
    </div>
    
    <div class="section">
      <div class="section-number">2</div>
      <h2>탑승지 안내</h2>
      <p>탑승 시간, 위치, 주차 정보</p>
    </div>
    
    <div class="section">
      <div class="section-number">3</div>
      <h2>객실 배정</h2>
      <p>팀 명단 및 객실 배정표</p>
    </div>
    
    <div class="section">
      <div class="section-number">4</div>
      <h2>라운딩 시간표</h2>
      <p>일자별 티오프 시간 및 조 편성</p>
    </div>
    
    <h2 class="section-title">관련 문서</h2>
    
    <div class="card">
      <div class="card-header">
        <h3>5월의 순천</h3>
        <p>2025년 5월 10일</p>
      </div>
      <div class="card-body">
        <p>싱싱골프투어가 선정한 <span class="highlight">5월 순천의 아름다운 풍경</span>과 함께하는 특별한 여행. 순천만 습지와 순천만국가정원의 봄꽃이 만개한 이 시기에 여유로운 골프와 함께 자연의 아름다움을 만끽하세요.</p>
        <a href="#" class="btn">보기</a>
      </div>
    </div>
    
    <div class="contact">
      <h3>담당 기사님</h3>
      <p>010-5254-9876</p>
    </div>
  </div>
  
  <div class="footer">
    싱싱골프투어 | <a href="tel:031-215-3990">031-215-3990</a>
  </div>
</body>
</html>`;
  };

  // F그룹: 견적서 템플릿 (미리보기와 동일) - 보라색 그라데이션, 물결 디자인
  const generateQuoteHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 견적서</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      background: #f5f7fc;
      min-height: 100vh;
      color: #1f2937;
    }
    
    /* 헤더 */
    .header {
      background: linear-gradient(135deg, #5865F2 0%, #8F5FEB 100%);
      color: white;
      padding: 60px 0 80px;
      text-align: center;
      position: relative;
    }
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .header-title {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }