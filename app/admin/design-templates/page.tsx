"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Copy, FileText, Calendar, BedDouble, Sparkles, Briefcase, Palette, Quote } from 'lucide-react';
import RainbowText from '@/components/ui/RainbowText';

export default function DesignTemplatesPage() {
  const [activeTemplate, setActiveTemplate] = React.useState<'a-contract' | 'b-operational' | 'c-promotional' | 'd-professional' | 'e-dynamic' | 'f-quote'>('a-contract');
  const [dynamicTheme, setDynamicTheme] = React.useState<'blue' | 'green' | 'orange'>('blue');

  // CSS 애니메이션을 위한 전역 스타일
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradient-flow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
      margin-bottom: 20px;
    }
    
    /* 무지개빛 그라데이션 텍스트 */
    .rainbow-gemini {
      background: linear-gradient(135deg, #4285f4 0%, #9b72cb 20%, #d96570 40%, #f9ab55 60%, #e37400 80%, #4285f4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .rainbow-apple {
      background: linear-gradient(135deg, #5ac8fa 0%, #007aff 20%, #5856d6 40%, #af52de 60%, #ff2d55 80%, #ff3b30 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .rainbow-animated {
      background: linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 56%, #4b0082 70%, #9400d3 84%, #ff0000 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: rainbow-flow 3s ease-in-out infinite;
    }
    
    .rainbow-neon {
      background: linear-gradient(45deg, #00ffff 0%, #ff00ff 25%, #ffff00 50%, #00ff00 75%, #00ffff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: brightness(1.2);
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
      <h2 class="promo-title rainbow-gemini">한정 특가! 2박3일 순천 골프투어</h2>
      <p style="font-size: 18px; line-height: 1.8;">
        <span class="rainbow-apple">봄꽃이 만발한 순천</span>에서 즐기는 프리미엄 골프 여행!<br>
        순천만국가정원과 순천만습지의 아름다운 풍경과 함께
      </p>
    </div>
    
    <div class="highlight-box">
      <span class="rainbow-animated">🎉 조기 예약 고객님께 20% 할인 혜택! 🎉</span>
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
      <h3 style="font-size: 28px; margin-bottom: 30px;" class="rainbow-neon">지금 바로 예약하세요!</h3>
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

  // F그룹: 견적서 템플릿 - 왼쪽 원본과 동일한 디자인
  const generateQuoteHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 - 견적서</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      background: #6366f1;
      min-height: 100vh;
      color: #1f2937;
    }
    
    /* 헤더 */
    .header {
      background: #6366f1;
      color: white;
      padding: 32px 0 50px;
      text-align: center;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 900px;
      margin: 0 auto 30px;
      padding: 0 20px;
    }
    
    .logo {
      font-size: 22px;
      font-weight: 700;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    .header-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 8px;
      color: white;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.3s;
    }
    
    .header-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .header-content {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }
    
    .header-date {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 10px 20px;
      border-radius: 9999px;
      font-size: 16px;
      margin-bottom: 20px;
    }
    
    .header h1 {
      font-size: 52px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -1px;
    }
    
    .header-subtitle {
      font-size: 22px;
      opacity: 0.9;
      margin-bottom: 32px;
    }
    
    .header-badges {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    
    .badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 16px;
    }
    
    /* 본문 컨테이너 */
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px 60px;
    }
    
    /* 견적 요약 카드 */
    .quote-summary {
      background: #5b5fc7;
      color: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      margin-bottom: 40px;
    }
    
    .quote-summary h3 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    
    .price-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .price-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .price-label {
      opacity: 0.9;
      font-size: 16px;
    }
    
    .price-value {
      font-size: 24px;
      font-weight: 700;
    }
    
    .total-price {
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .total-price .label {
      font-size: 20px;
    }
    
    .total-price .value {
      font-size: 32px;
      font-weight: 700;
    }
    
    .validity-notice {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      padding: 14px 20px;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
    }
    
    /* 섹션 */
    .section {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .section-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    /* 일정 카드 */
    .schedule-card {
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .schedule-card:hover {
      border-color: #6366f1;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
    }
    
    .schedule-header {
      display: flex;
      align-items: start;
      gap: 20px;
    }
    
    .day-number {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    
    .day-number.first {
      background: #10b981;
    }
    
    .day-number.middle {
      background: #3b82f6;
    }
    
    .day-number.last {
      background: #ef4444;
    }
    
    .schedule-content {
      flex: 1;
    }
    
    .schedule-date {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 10px;
    }
    
    .schedule-highlights {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .highlight-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .highlight-badge.departure {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .highlight-badge.golf {
      background: #d1fae5;
      color: #065f46;
    }
    
    .highlight-badge.tour {
      background: #ede9fe;
      color: #5b21b6;
    }
    
    .highlight-badge.meal {
      background: #fed7aa;
      color: #9a3412;
    }
    
    .highlight-badge.arrival {
      background: #fee2e2;
      color: #991b1b;
    }
    
    /* 포함/불포함 그리드 */
    .include-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .include-box {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .include-box h3 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .include-box.includes h3 {
      color: #059669;
    }
    
    .include-box.excludes h3 {
      color: #6b7280;
    }
    
    .include-list {
      list-style: none;
    }
    
    .include-list li {
      display: flex;
      align-items: start;
      gap: 10px;
      margin-bottom: 12px;
      color: #4b5563;
      font-size: 16px;
    }
    
    /* 방문 예정지 */
    .spots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }
    
    .spot-card {
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s ease;
    }
    
    .spot-card:hover {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }
    
    .spot-image {
      width: 100%;
      height: 140px;
      object-fit: cover;
      border-radius: 10px;
      margin-bottom: 16px;
    }
    
    .spot-name {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 6px;
    }
    
    .spot-category {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 10px;
    }
    
    .spot-category.tourist {
      background: #ede9fe;
      color: #5b21b6;
    }
    
    .spot-category.restaurant {
      background: #fed7aa;
      color: #9a3412;
    }
    
    .spot-category.rest {
      background: #f3f4f6;
      color: #374151;
    }
    
    .spot-address {
      font-size: 14px;
      color: #6b7280;
      display: flex;
      align-items: start;
      gap: 6px;
    }
    
    /* 문의하기 */
    .contact-section {
      background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .contact-section h3 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
    }
    
    .contact-section p {
      color: #6b7280;
      margin-bottom: 24px;
      font-size: 16px;
    }
    
    .contact-items {
      display: flex;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .contact-icon {
      width: 50px;
      height: 50px;
      background: #dbeafe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2563eb;
      font-size: 20px;
    }
    
    .contact-info {
      text-align: left;
    }
    
    .contact-number {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .contact-time {
      font-size: 14px;
      color: #6b7280;
    }
    
    /* 푸터 */
    .footer {
      background: #1f2937;
      color: white;
      padding: 60px 0;
      margin-top: 60px;
    }
    
    .footer-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
      text-align: center;
    }
    
    .footer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      margin-bottom: 40px;
      text-align: left;
    }
    
    .footer-section h4 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .footer-section p {
      font-size: 16px;
      color: #9ca3af;
      line-height: 1.8;
    }
    
    .footer-divider {
      border-top: 1px solid #374151;
      padding-top: 40px;
      margin-top: 40px;
    }
    
    .footer-bottom {
      font-size: 16px;
      color: #9ca3af;
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .header h1 {
        font-size: 36px;
      }
      
      .header-top {
        flex-direction: column;
        gap: 20px;
      }
      
      .include-grid,
      .footer-grid {
        grid-template-columns: 1fr;
      }
      
      .contact-items {
        flex-direction: column;
      }
    }
    
    @media print {
      body {
        background: white;
      }
      
      .header {
        background: #6366f1;
      }
      
      .section {
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
    }
  </style>
</head>
<body>
  <!-- 헤더 -->
  <div class="header">
    <div class="header-top">
      <div class="logo">싱싱골프투어</div>
      <div class="header-actions">
        <a href="#" class="header-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3L9.65 4.35L14.3 9H3V11H14.3L9.65 15.65L11 17L18 10L11 3Z" fill="white"/>
          </svg>
          링크하기
        </a>
        <a href="#" class="header-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7H13V3C13 2.45 12.55 2 12 2H8C7.45 2 7 2.45 7 3V7H3C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9H7V17C7 17.55 7.45 18 8 18H12C12.55 18 13 17.55 13 17V9H17C17.55 9 18 8.55 18 8C18 7.45 17.55 7 17 7Z" fill="white"/>
          </svg>
          저장하기
        </a>
      </div>
    </div>
    <div class="header-content">
      <div class="header-date">
        📅 2025년 6월 11일 ~ 2025년 6월 13일
      </div>
      <h1>순천 풀패키지 견적서</h1>
      <p class="header-subtitle">2박 3일의 특별한 여행</p>
      <div class="header-badges">
        <div class="badge">
          📍 파인힐스CC
        </div>
        <div class="badge">
          👥 20명
        </div>
        <div class="badge">
          🏨 골프텔
        </div>
      </div>
    </div>
  </div>

  <!-- 메인 컨텐츠 -->
  <div class="container">
    <!-- 견적 요약 -->
    <div class="quote-summary">
      <h3>견적 요약</h3>
      <div class="price-grid">
        <div class="price-item">
          <span class="price-label">1인 요금</span>
          <span class="price-value">900,000원</span>
        </div>
        <div class="price-item">
          <span class="price-label">인원</span>
          <span class="price-value">20명</span>
        </div>
      </div>
      <div class="total-price">
        <span class="label">총 예상 금액</span>
        <span class="value">18,000,000원</span>
      </div>
      <div class="validity-notice">
        ℹ️ 견적 유효기간: 2025년 6월 18일까지
      </div>
    </div>

    <!-- 여행 일정 -->
    <div class="section">
      <h2 class="section-title">
        📅 여행 일정
      </h2>
      
      <div class="schedule-card">
        <div class="schedule-header">
          <div class="day-number first">D1</div>
          <div class="schedule-content">
            <h3 class="schedule-date">6/11(수)</h3>
            <div class="schedule-highlights">
              <span class="highlight-badge departure">출발</span>
              <span class="highlight-badge golf">골프</span>
              <span class="highlight-badge meal">식사</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="schedule-card">
        <div class="schedule-header">
          <div class="day-number middle">D2</div>
          <div class="schedule-content">
            <h3 class="schedule-date">6/12(목)</h3>
            <div class="schedule-highlights">
              <span class="highlight-badge golf">골프</span>
              <span class="highlight-badge tour">관광</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="schedule-card">
        <div class="schedule-header">
          <div class="day-number last">D3</div>
          <div class="schedule-content">
            <h3 class="schedule-date">6/13(금)</h3>
            <div class="schedule-highlights">
              <span class="highlight-badge golf">골프</span>
              <span class="highlight-badge arrival">도착</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 포함/불포함 사항 -->
    <div class="include-grid">
      <div class="include-box includes">
        <h3>
          ✅ 포함 사항
        </h3>
        <ul class="include-list">
          <li>
            <span>✓</span>
            <span>왕복 전용버스</span>
          </li>
          <li>
            <span>✓</span>
            <span>그린피 및 카트비</span>
          </li>
          <li>
            <span>✓</span>
            <span>숙박 (2박)</span>
          </li>
          <li>
            <span>✓</span>
            <span>조식 제공</span>
          </li>
        </ul>
      </div>
      
      <div class="include-box excludes">
        <h3>
          ℹ️ 불포함 사항
        </h3>
        <ul class="include-list">
          <li>
            <span>×</span>
            <span>개인 경비</span>
          </li>
          <li>
            <span>×</span>
            <span>캐디피</span>
          </li>
          <li>
            <span>×</span>
            <span>중식 및 석식</span>
          </li>
          <li>
            <span>×</span>
            <span>여행자 보험</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 방문 예정지 -->
    <div class="section">
      <h2 class="section-title">
        📸 방문 예정지
      </h2>
      
      <div class="spots-grid">
        <div class="spot-card">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Namdaemun.jpg/1200px-Namdaemun.jpg" alt="남대문" class="spot-image">
          <h4 class="spot-name">남대문</h4>
          <span class="spot-category tourist">관광명소</span>
          <p class="spot-address">
            📍 서울특별시 중구 세종대로 40
          </p>
        </div>
        
        <div class="spot-card">
          <img src="https://via.placeholder.com/250x128" alt="순천만 습지" class="spot-image">
          <h4 class="spot-name">순천만 습지</h4>
          <span class="spot-category tourist">관광명소</span>
          <p class="spot-address">
            📍 전남 순천시 순천만길 513-25
          </p>
        </div>
        
        <div class="spot-card">
          <img src="https://via.placeholder.com/250x128" alt="맛집" class="spot-image">
          <h4 class="spot-name">한정식당</h4>
          <span class="spot-category restaurant">맛집</span>
          <p class="spot-address">
            📍 서울시 강남구 테헤란로
          </p>
        </div>
        
        <div class="spot-card">
          <img src="https://via.placeholder.com/250x128" alt="휴게소" class="spot-image">
          <h4 class="spot-name">죽도휴게소</h4>
          <span class="spot-category rest">휴게소</span>
          <p class="spot-address">
            📍 경상북도 울진군 울진읍
          </p>
        </div>
      </div>
    </div>

    <!-- 문의하기 -->
    <div class="contact-section">
      <h3>문의하기</h3>
      <p>견적에 대해 궁금하신 점이 있으시면 언제든 연락주세요.</p>
      <div class="contact-items">
        <div class="contact-item">
          <div class="contact-icon">📞</div>
          <div class="contact-info">
            <div class="contact-number">031-215-3990</div>
            <div class="contact-time">평일 09:00 - 18:00</div>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">✉️</div>
          <div class="contact-info">
            <div class="contact-number">singsinggolf@naver.com</div>
            <div class="contact-time">24시간 접수 가능</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 푸터 -->
  <div class="footer">
    <div class="footer-content">
      <div class="footer-grid">
        <div class="footer-section">
          <h4>싱싱골프투어</h4>
          <p>고품격 골프 여행의 시작,<br>싱싱골프투어가 함께합니다.</p>
        </div>
        <div class="footer-section">
          <h4>운영시간</h4>
          <p>평일: 09:00 - 18:00<br>토요일: 09:00 - 13:00<br>일요일/공휴일: 휴무</p>
        </div>
        <div class="footer-section">
          <h4>연락처</h4>
          <p>전화: 031-215-3990<br>이메일: singsinggolf@naver.com<br>카카오톡: @싱싱골프투어</p>
        </div>
      </div>
      <div class="footer-divider">
        <div class="footer-bottom">
          <p>© 2025 싱싱골프투어. All rights reserved.</p>
          <p>본 견적서는 싱싱골프투어에서 발행한 공식 견적서입니다.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePreview = () => {
    let html = '';
    switch (activeTemplate) {
      case 'a-contract':
        html = generateContractHTML();
        break;
      case 'b-operational':
        html = generateOperationalHTML();
        break;
      case 'c-promotional':
        html = generatePromotionalHTML();
        break;
      case 'd-professional':
        html = generateProfessionalHTML();
        break;
      case 'e-dynamic':
        html = generateDynamicHTML();
        break;
      case 'f-quote':
        html = generateQuoteHTML();
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
      case 'a-contract':
        html = generateContractHTML();
        break;
      case 'b-operational':
        html = generateOperationalHTML();
        break;
      case 'c-promotional':
        html = generatePromotionalHTML();
        break;
      case 'd-professional':
        html = generateProfessionalHTML();
        break;
      case 'e-dynamic':
        html = generateDynamicHTML();
        break;
      case 'f-quote':
        html = generateQuoteHTML();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'a-contract' ? 'ring-2 ring-blue-700 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('a-contract')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-700" />
              <div>
                <CardTitle className="text-lg">A그룹: 계약문서</CardTitle>
                <CardDescription>권위감·신뢰감</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2c5282' }}></div>
                <span className="text-sm">진한 네이비</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 고객용 일정표</li>
                <li>• 직사각형 레이아웃</li>
                <li>• 권위있는 헤더</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'b-operational' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('b-operational')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <BedDouble className="w-8 h-8 text-blue-500" />
              <div>
                <CardTitle className="text-lg">B그룹: 실행문서</CardTitle>
                <CardDescription>친근감·실용성</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4a6fa5' }}></div>
                <span className="text-sm">밝은 블루</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 탑승안내서</li>
                <li>• 둥근 모서리</li>
                <li>• 친근한 스타일</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'c-promotional' ? 'ring-2 ring-purple-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('c-promotional')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle className="text-lg">C그룹: <RainbowText text="홍보문서" variant="gemini" /></CardTitle>
                <CardDescription>화려함·트렌드</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #4285f4 0%, #9b72cb 20%, #d96570 40%, #f9ab55 60%, #e37400 80%, #4285f4 100%)' }}></div>
                  <RainbowText text="Gemini 스타일" variant="gemini" className="text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #5ac8fa 0%, #007aff 20%, #5856d6 40%, #af52de 60%, #ff2d55 80%, #ff3b30 100%)' }}></div>
                  <RainbowText text="Apple 스타일" variant="apple" className="text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 56%, #4b0082 70%, #9400d3 84%, #ff0000 100%)' }}></div>
                  <RainbowText text="애니메이션" variant="animated" className="text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(45deg, #00ffff 0%, #ff00ff 25%, #ffff00 50%, #00ff00 75%, #00ffff 100%)' }}></div>
                  <RainbowText text="네온 효과" variant="neon" className="text-sm" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'd-professional' ? 'ring-2 ring-gray-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('d-professional')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-gray-600" />
              <div>
                <CardTitle className="text-lg">D그룹: 고급문서</CardTitle>
                <CardDescription>권위·전문성</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #4a5568, #718096)' }}></div>
                <span className="text-sm">그레이컬러</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 실용문서</li>
                <li>• 미니멀 디자인</li>
                <li>• 격식있는 포맷</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'e-dynamic' ? 'ring-2 ring-indigo-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('e-dynamic')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-indigo-600" />
              <div>
                <CardTitle className="text-lg">E그룹: 변동컬러</CardTitle>
                <CardDescription>모바일·링크</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-between">
                <span className="text-sm">테마 토글:</span>
                <div className="flex gap-1">
                  <button 
                    className={`w-6 h-6 rounded-full border-2 ${dynamicTheme === 'blue' ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: '#1a4aa3' }}
                    onClick={(e) => { e.stopPropagation(); setDynamicTheme('blue'); }}
                  />
                  <button 
                    className={`w-6 h-6 rounded-full border-2 ${dynamicTheme === 'green' ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: '#2a8d46' }}
                    onClick={(e) => { e.stopPropagation(); setDynamicTheme('green'); }}
                  />
                  <button 
                    className={`w-6 h-6 rounded-full border-2 ${dynamicTheme === 'orange' ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: '#e17b20' }}
                    onClick={(e) => { e.stopPropagation(); setDynamicTheme('orange'); }}
                  />
                </div>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 모바일 최적화</li>
                <li>• 3가지 테마</li>
                <li>• 반응형 디자인</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTemplate === 'f-quote' ? 'ring-2 ring-purple-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setActiveTemplate('f-quote')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Quote className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle className="text-lg">F그룹: 견적문서</CardTitle>
                <CardDescription>원본 견적서 디자인</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}></div>
                <span className="text-sm">진한 보라색</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 견적서 전용</li>
                <li>• 상단 버튼 포함</li>
                <li>• 진한 색감</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 미리보기 섹션 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">선택된 템플릿 미리보기</h2>
        <div className="bg-white border rounded-lg p-8 min-h-[400px]">
          {activeTemplate === 'a-contract' && (
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
          
          {activeTemplate === 'b-operational' && (
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
          
          {activeTemplate === 'c-promotional' && (
            <div>
              <div className="text-center mb-6 p-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' }}>
                <div className="text-3xl font-bold mb-2">특별 프로모션</div>
                <div className="text-lg opacity-90">2025년 봄 시즌 특가!</div>
              </div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">
                  <RainbowText text="한정 특가! 2박3일 순천 골프투어" variant="gemini" />
                </h2>
                <p className="text-lg">
                  <RainbowText text="봄꽃이 만발한 순천" variant="apple" />에서 즐기는 프리미엄 골프 여행!
                </p>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white p-4 rounded-lg text-center mb-4 font-bold text-lg">
                <RainbowText text="🎉 조기 예약 고객님께 20% 할인 혜택! 🎉" variant="animated" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">⛳</div>
                  <div className="font-semibold">프리미엄 골프장</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-2xl mb-2">🏨</div>
                  <div className="font-semibold">특급 호텔</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">🍴</div>
                  <div className="font-semibold">특선 요리</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTemplate === 'd-professional' && (
            <div>
              <div className="p-6 rounded-t-lg" style={{ background: 'linear-gradient(135deg, #4a5568, #718096)', color: 'white' }}>
                <div className="text-sm font-light tracking-widest mb-2">SINGSING GOLF TOUR</div>
                <div className="text-2xl font-bold mb-1">공식 운영 문서</div>
                <div className="text-xs opacity-80">Document No. 2025-001 | Date: 2025.01.15</div>
              </div>
              <div className="p-6 border-l-4 border-gray-500">
                <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">Executive Summary</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Q1 2025</th>
                      <th className="p-2 text-left">Q2 2025</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="p-2">Revenue</td>
                      <td className="p-2">KRW 1,200M</td>
                      <td className="p-2">KRW 1,500M</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTemplate === 'e-dynamic' && (
            <div>
              <div className="text-center mb-6 p-6 rounded-b-3xl" style={{ 
                background: dynamicTheme === 'blue' ? 'linear-gradient(135deg, #1a4aa3, #3a6bc5)' : 
                           dynamicTheme === 'green' ? 'linear-gradient(135deg, #2a8d46, #3bb962)' :
                           'linear-gradient(135deg, #e17b20, #f3a953)', 
                color: 'white' 
              }}>
                <div className="text-xs opacity-80 mb-2">싱싱골프투어와 함께하는 즐거운 골프 여행!</div>
                <div className="text-2xl font-bold mb-1">싱싱골프투어</div>
                <div className="text-sm opacity-90">순천 2박3일 / 05/19(월)~21(수)</div>
              </div>
              <div className="px-4">
                <h3 className="font-semibold mb-3" style={{ color: dynamicTheme === 'blue' ? '#1a4aa3' : dynamicTheme === 'green' ? '#2a8d46' : '#e17b20' }}>투어 안내</h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="bg-white p-4 rounded-lg shadow-sm border relative">
                      <div className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" 
                           style={{ backgroundColor: dynamicTheme === 'blue' ? '#1a4aa3' : dynamicTheme === 'green' ? '#2a8d46' : '#e17b20' }}>
                        {num}
                      </div>
                      <div className="font-semibold mb-1">상품 정보</div>
                      <div className="text-sm text-gray-600">일정, 식사, 골프장, 숙박 안내</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTemplate === 'f-quote' && (
            <div>
              <div className="mb-6" style={{ 
                background: '#6366f1', 
                color: 'white', 
                padding: '24px',
                margin: '-32px -32px 32px -32px'
              }}>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-xl font-bold">싱싱골프투어</div>
                  <div className="flex gap-3">
                    <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                      링크하기
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                      저장하기
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
                    📅 2025년 6월 11일 ~ 2025년 6월 13일
                  </div>
                  <h1 className="text-4xl font-bold mb-3">순천 풀패키지 견적서</h1>
                  <p className="text-xl opacity-90 mb-6">2박 3일의 특별한 여행</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      📍 파인힐스CC
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      👥 20명
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      🏨 골프텔
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4">
                <div className="text-white p-6 rounded-2xl mb-6" style={{ background: '#5b5fc7' }}>
                  <h3 className="text-lg font-bold mb-4">견적 요약</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex justify-between">
                      <span className="opacity-90">1인 요금</span>
                      <span className="font-bold text-xl">900,000원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">인원</span>
                      <span className="font-bold text-xl">20명</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/30 flex justify-between items-center">
                    <span className="text-lg">총 예상 금액</span>
                    <span className="text-2xl font-bold">18,000,000원</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-4 text-sm">
                    ℹ️ 견적 유효기간: 2025년 6월 18일까지
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-md mb-4">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    📅 여행 일정
                  </h2>
                  <div className="space-y-3">
                    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-500 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                          D1
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">6/11(수)</h3>
                          <div className="flex gap-2">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm">출발</span>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm">골프</span>
                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-sm">식사</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-md">
                    <h4 className="font-bold mb-3 text-green-600 text-lg">✅ 포함 사항</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• 왕복 전용버스</li>
                      <li>• 그린피 및 카트비</li>
                      <li>• 숙박 (2박)</li>
                    </ul>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-md">
                    <h4 className="font-bold mb-3 text-gray-600 text-lg">ℹ️ 불포함 사항</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• 개인 경비</li>
                      <li>• 캐디피</li>
                      <li>• 중식 및 석식</li>
                    </ul>
                  </div>
                </div>
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
      
      {/* C그룹 무지개빛 그라데이션 예시 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-8">
        <h3 className="font-semibold mb-4 text-purple-900">🌈 C그룹 무지개빛 그라데이션 예시</h3>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <RainbowText text="Gemini 스타일 - 프로모션 타이틀" variant="gemini" className="text-2xl" />
            <p className="text-sm text-gray-600 mt-2">파란색에서 주황색으로 이어지는 그라데이션</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <RainbowText text="Apple 스타일 - 강조 텍스트" variant="apple" className="text-2xl" />
            <p className="text-sm text-gray-600 mt-2">시안에서 핑크로 이어지는 그라데이션</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <RainbowText text="무지개 애니메이션 - 할인 배너" variant="animated" className="text-2xl" />
            <p className="text-sm text-gray-600 mt-2">움직이는 무지개 효과</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <RainbowText text="네온 효과 - CTA 버튼" variant="neon" className="text-2xl" />
            <p className="text-sm text-gray-600 mt-2">밝고 화려한 네온 스타일</p>
          </div>
        </div>
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
                <li>• C그룹 (무지개빛 그라데이션): 화려하고 트렌디한 느낌
                  <ul className="ml-4 mt-1">
                    <li>- Gemini 스타일: 프로모션 타이틀</li>
                    <li>- Apple 스타일: 강조 텍스트</li>
                    <li>- 애니메이션: 할인 배너</li>
                    <li>- 네온 효과: CTA 버튼</li>
                  </ul>
                </li>
                <li>• D그룹 (#4a5568): 고급스럽고 전문적인 느낌</li>
                <li>• E그룹 (변동): 3가지 테마 선택 가능</li>
                <li>• F그룹 (#6366f1): 진한 보라색, 공식적인 느낌</li>
              </ul>
            </div>
            <div>
              <strong className="text-blue-700">레이아웃:</strong>
              <ul className="mt-1 ml-4 space-y-1 text-gray-700">
                <li>• A그룹: 직사각형, 격식있는 구조</li>
                <li>• B그룹: 둥근 모서리, 유연한 구조</li>
                <li>• C그룹: 무지개빛 그라데이션, 화려한 효과</li>
                <li>• D그룹: 미니멀, 권위있는 구조</li>
                <li>• E그룹: 모바일 최적화, 반응형</li>
                <li>• F그룹: 상단 버튼, 진한 색감</li>
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
              <strong>F그룹 사용 가이드:</strong>
              <ul className="mt-1 ml-4">
                <li>• 견적서 전용 디자인</li>
                <li>• 상단에 링크하기/저장하기 버튼</li>
                <li>• 진한 보라색 배경으로 공식적인 느낌</li>
                <li>• 더 큰 폰트와 더 풍부한 디자인</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
