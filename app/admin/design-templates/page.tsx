"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Copy } from 'lucide-react';

// 샘플 데이터
const sampleTourData = {
  id: 'sample-tour',
  title: '2박3일 순천비스팀 골프투어',
  start_date: '2025-04-14',
  end_date: '2025-04-16',
  tour_product_id: 'sample-product',
  schedules: [
    {
      id: 'day1',
      tour_id: 'sample-tour',
      date: '2025-04-14',
      day_number: 1,
      title: 'Day 1 일정',
      meal_breakfast: false,
      meal_lunch: true,
      meal_dinner: true,
      menu_breakfast: '',
      menu_lunch: '골프장 클럽하우스',
      menu_dinner: '한정식',
      schedule_items: [
        {
          time: '05:00',
          content: '강남 집결',
          attraction_data: {
            name: '강남 집결지',
            category: 'boarding',
            main_image_url: 'https://via.placeholder.com/300x200',
            description: '강남역 1번 출구 앞 집결'
          },
          display_options: { show_image: true }
        },
        {
          time: '10:00',
          content: '파인밸리CC 도착',
          attraction_data: {
            name: '파인밸리CC',
            category: 'golf_round',
            main_image_url: 'https://via.placeholder.com/300x200',
            description: '18홀 골프 라운드'
          },
          display_options: { show_image: true }
        }
      ]
    }
  ]
};

const sampleProductData = {
  id: 'sample-product',
  name: '순천비스팀 2박3일',
  golf_course: '파인밸리CC',
  hotel: '파인밸리 골프텔',
  courses: ['파인코스', '밸리코스'],
  included_items: '그린피(18홀×3일), 숙박 2박, 전일정 클럽식, 카트비, 라커피',
  excluded_items: '캐디피',
  general_notices: [
    { content: '티오프 시간 30분 전 골프장 도착' },
    { content: '개인 골프용품 지참' }
  ],
  usage_round: `1. 티오프 15분 전까지 카트 대기선 도착 필수
2. 3인 플레이 시 4인 요금 적용
3. 추가 라운드는 프론트 데스크에 문의`,
  usage_hotel: `1. 체크인 시간: 15시 이후
2. 체크아웃 시간: 11시
3. 객실 내 흡연 금지 (벌금 10만원)`,
  usage_meal: `1. 조식: 클럽하우스 뷔페 (06:30~09:00)
2. 중식/석식: 클럽하우스 한식당
3. 특별 요청사항은 사전 신청 필수`,
  usage_bus: `1. 출발 20분 전 도착
2. 탑승 시간은 변경될 수 있음
3. 짐은 지정 좌석 그대로 이용`
};

export default function DesignTemplatesPage() {
  const [activeExample, setActiveExample] = React.useState<'customer' | 'staff'>('customer');

  // HTML 생성 함수
  const generateExampleHTML = (isStaff: boolean) => {
    const primaryColor = isStaff ? '#4a6fa5' : '#2c5282';
    const backgroundColor = isStaff ? 'linear-gradient(to bottom, #f8fbff 0%, #ffffff 100%)' : '#ffffff';
    
    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>일정표 디자인 예시 - ${isStaff ? '스탭용' : '고객용'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
          
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Noto Sans KR', sans-serif;
            font-size: ${isStaff ? '14px' : '15px'};
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: ${backgroundColor};
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 3px solid ${primaryColor};
            margin-bottom: 30px;
            ${isStaff ? 'background: linear-gradient(135deg, #4a90e2 0%, #5ca3f2 100%); padding: 30px; margin: -30px -30px 30px -30px; color: white;' : ''}
          }
          
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: ${isStaff ? 'white' : primaryColor};
            margin-bottom: 10px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: ${primaryColor};
            padding: 10px;
            background: ${isStaff ? 'linear-gradient(90deg, #e7f3ff 0%, transparent 100%)' : '#e7f3ff'};
            margin-bottom: 15px;
            border-left: 4px solid ${primaryColor};
          }
          
          .day-schedule {
            margin-bottom: 25px;
            border: 1px solid #ddd;
            border-radius: ${isStaff ? '10px' : '5px'};
            overflow: hidden;
            ${isStaff ? 'box-shadow: 0 2px 8px rgba(0,0,0,0.08);' : ''}
          }
          
          .day-title {
            background: ${isStaff ? 'linear-gradient(135deg, #4a90e2 0%, #5ca3f2 100%)' : primaryColor};
            color: white;
            padding: ${isStaff ? '15px 25px' : '12px 20px'};
            font-weight: bold;
            font-size: ${isStaff ? '16px' : '15px'};
          }
          
          .timeline-item {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            ${isStaff ? 'transition: background 0.3s ease;' : ''}
          }
          
          ${isStaff ? '.timeline-item:hover { background: #f8fbff; }' : ''}
          
          .timeline-time {
            font-weight: bold;
            color: ${primaryColor};
            margin-right: 10px;
          }
          
          .usage-item {
            background: ${isStaff ? 'linear-gradient(to bottom, #f8fbff 0%, #ffffff 100%)' : '#f8f9fa'};
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            ${isStaff ? 'box-shadow: 0 2px 8px rgba(74, 144, 226, 0.1); transition: all 0.3s ease;' : ''}
          }
          
          ${isStaff ? '.usage-item:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(74, 144, 226, 0.15); }' : ''}
          
          .usage-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .usage-icon {
            font-size: 20px;
            ${isStaff ? 'background: linear-gradient(135deg, #4a90e2, #5ca3f2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : 'color: ' + primaryColor + ';'}
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">싱싱골프투어</div>
            <div>수원시 영통구 법조로149번길 200 | TEL 031-215-3990</div>
          </div>
          
          <div class="section">
            <div class="section-title">상품 정보</div>
            <div style="border: 1px solid #ddd; padding: 20px;">
              <strong>상품명:</strong> 2박3일 순천비스팀 골프투어<br>
              <strong>일정:</strong> 2025. 4. 14. ~ 2025. 4. 16.<br>
              <strong>골프장:</strong> 파인밸리CC<br>
              <strong>숙소:</strong> 파인밸리 골프텔
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">일정 안내</div>
            <div class="day-schedule">
              <div class="day-title">Day 1 - 2025년 4월 14일 (월)</div>
              <div class="timeline-item">
                <span class="timeline-time">05:00</span> 강남 집결
              </div>
              <div class="timeline-item">
                <span class="timeline-time">10:00</span> 파인밸리CC 도착 및 라운드
              </div>
              <div class="timeline-item">
                <span class="timeline-time">18:00</span> 석식 (한정식)
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">상세 이용 안내</div>
            <div class="usage-item">
              <div class="usage-header">
                <span class="usage-icon">⛳</span>
                <h4 style="margin: 0; color: ${primaryColor};">라운딩 규정</h4>
              </div>
              <div>
                1. 티오프 15분 전까지 카트 대기선 도착 필수<br>
                2. 3인 플레이 시 4인 요금 적용<br>
                3. 추가 라운드는 프론트 데스크에 문의
              </div>
            </div>
            
            <div class="usage-item">
              <div class="usage-header">
                <span class="usage-icon">🏨</span>
                <h4 style="margin: 0; color: ${primaryColor};">숙소 이용</h4>
              </div>
              <div>
                1. 체크인 시간: 15시 이후<br>
                2. 체크아웃 시간: 11시<br>
                3. 객실 내 흡연 금지 (벌금 10만원)
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePreview = () => {
    const html = generateExampleHTML(activeExample === 'staff');
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const handleCopyHTML = () => {
    const html = generateExampleHTML(activeExample === 'staff');
    navigator.clipboard.writeText(html);
    alert('HTML이 클립보드에 복사되었습니다.');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">문서 디자인 템플릿</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card 
          className={`cursor-pointer transition-all ${activeExample === 'customer' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setActiveExample('customer')}
        >
          <CardHeader>
            <CardTitle>고객용 디자인</CardTitle>
            <CardDescription>60대 고객을 위한 깔끔하고 가독성 좋은 디자인</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• 네이비 블루 (#2c5282) 메인 컬러</li>
              <li>• 폰트 크기 15px (인쇄 시 16px)</li>
              <li>• 단색 배경, 그라데이션 없음</li>
              <li>• 심플한 박스 스타일</li>
              <li>• 최소한의 애니메이션</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeExample === 'staff' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setActiveExample('staff')}
        >
          <CardHeader>
            <CardTitle>스탭용 디자인</CardTitle>
            <CardDescription>40-50대 스탭을 위한 현대적이고 화려한 디자인</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• 밝은 블루 (#4a90e2) 그라데이션</li>
              <li>• 폰트 크기 14px</li>
              <li>• 그라데이션 배경 효과</li>
              <li>• 호버 애니메이션</li>
              <li>• 그림자 효과</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">디자인 미리보기</h2>
        <div className="bg-white border rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold" style={{ color: activeExample === 'staff' ? '#4a90e2' : '#2c5282' }}>
              싱싱골프투어
            </div>
            <div className="text-sm text-gray-600 mt-2">
              수원시 영통구 법조로149번길 200 | TEL 031-215-3990
            </div>
          </div>
          
          <div className="mb-6">
            <div 
              className="text-lg font-bold p-3 mb-3" 
              style={{ 
                backgroundColor: activeExample === 'staff' ? '#e7f3ff' : '#e7f3ff',
                borderLeft: `4px solid ${activeExample === 'staff' ? '#4a90e2' : '#2c5282'}`,
                color: activeExample === 'staff' ? '#4a90e2' : '#2c5282'
              }}
            >
              상품 정보
            </div>
            {/* 상품 정보 내용 */}
          </div>
          
          <div className="mb-6">
            <div 
              className="text-lg font-bold p-3 mb-3" 
              style={{ 
                backgroundColor: activeExample === 'staff' ? '#e7f3ff' : '#e7f3ff',
                borderLeft: `4px solid ${activeExample === 'staff' ? '#4a90e2' : '#2c5282'}`,
                color: activeExample === 'staff' ? '#4a90e2' : '#2c5282'
              }}
            >
              일정 안내
            </div>
            <div 
              className="border rounded overflow-hidden"
              style={{ 
                boxShadow: activeExample === 'staff' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                borderRadius: activeExample === 'staff' ? '10px' : '5px'
              }}
            >
              <div 
                className="text-white font-bold p-3"
                style={{ 
                  background: activeExample === 'staff' 
                    ? 'linear-gradient(135deg, #4a90e2 0%, #5ca3f2 100%)' 
                    : '#2c5282',
                  fontSize: activeExample === 'staff' ? '16px' : '15px'
                }}
              >
                Day 1 - 2025년 4월 14일 (월)
              </div>
              {/* 일정 내용 */}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={handlePreview} className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          새 창에서 미리보기
        </Button>
        <Button onClick={handleCopyHTML} variant="outline" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          HTML 복사
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">사용 방법</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>위에서 원하는 디자인 템플릿을 선택합니다 (고객용 또는 스탭용)</li>
          <li>"새 창에서 미리보기"로 실제 디자인을 확인합니다</li>
          <li>"HTML 복사"로 템플릿 코드를 복사하여 사용합니다</li>
          <li>복사한 HTML을 수정하여 실제 문서에 적용합니다</li>
        </ol>
      </div>
    </div>
  );
}
