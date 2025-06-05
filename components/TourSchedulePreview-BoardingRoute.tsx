// 고객용 탑승안내서의 경유지 부분 개선 코드

// 경유지 카드 스타일 추가
const getRouteCardStyles = () => {
  return `
    /* 경로 섹션 스타일 */
    .route-section { 
      background: white; 
      border-radius: 10px; 
      padding: 20px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
      margin-bottom: 15px; 
    }
    
    .route-cards {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }
    
    .route-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 15px;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
    
    .route-card:hover {
      background-color: #f1f5f9;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    /* 순번 스타일 - 둥근 모서리 사각형 */
    .route-number {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      color: white;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    /* 탑승지와 경유지 구분 색상 */
    .boarding-stop .route-number {
      background-color: #4299e1;
    }
    
    .waypoint .route-number {
      background-color: #9333ea;
    }
    
    .route-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .route-time {
      font-size: 20px;
      font-weight: bold;
      color: #1a202c;
      min-width: 60px;
    }
    
    .route-place {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      flex: 1;
    }
    
    .route-type {
      background-color: #e0e7ff;
      color: #4338ca;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .route-info {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .route-duration {
      background-color: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
    }
    
    .route-desc {
      color: #6b7280;
      font-size: 14px;
    }
    
    /* 모바일 대응 */
    @media (max-width: 640px) {
      .route-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      
      .route-content {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      
      .route-number {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }
      
      .route-time {
        font-size: 18px;
      }
      
      .route-place {
        font-size: 15px;
      }
    }
  `;
};

// 개선된 경유지 HTML 생성 함수
export const getImprovedRouteHTML = (tourBoardingPlaces: any[], tourWaypoints: any[]) => {
  return `
    ${(tourBoardingPlaces.length > 0 || tourWaypoints.length > 0) ? `
    <div class="route-section">
      <h3 class="section-title">이동 경로 및 정차 정보</h3>
      <div class="route-cards">
        ${tourBoardingPlaces.map((place: any, index: number) => {
          const boardingPlace = place.boarding_place;
          if (!boardingPlace) return '';
          return `
            <div class="route-card boarding-stop">
              <div class="route-number">${index + 1}</div>
              <div class="route-content">
                <div class="route-time">${place.departure_time ? place.departure_time.slice(0, 5) : '미정'}</div>
                <div class="route-place">${boardingPlace.name}</div>
                <div class="route-type">출발</div>
              </div>
            </div>
          `;
        }).join('')}
        
        ${tourWaypoints.map((waypoint: any, waypointIndex: number) => {
          const orderNumber = tourBoardingPlaces.length + waypointIndex + 1;
          return `
            <div class="route-card waypoint">
              <div class="route-number">${orderNumber}</div>
              <div class="route-content">
                <div class="route-time">${waypoint.waypoint_time || '-'}</div>
                <div class="route-place">${waypoint.waypoint_name}</div>
                <div class="route-info">
                  <span class="route-duration">약 ${waypoint.waypoint_duration}분</span>
                  ${waypoint.waypoint_description ? `<span class="route-desc">${waypoint.waypoint_description}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    ` : ''}
  `;
};

// 전체 고객용 탑승안내서 스타일에 추가될 내용
export const additionalBoardingGuideStyles = `
  ${getRouteCardStyles()}
`;
