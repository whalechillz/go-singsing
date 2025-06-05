// 고객용 탑승안내서의 개선된 경유지 부분 HTML 템플릿

export const getCustomerBoardingRouteHTML = (tourBoardingPlaces: any[], tourWaypoints: any[]) => {
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

// 기존 테이블 형태 HTML (비교용)
export const getOldRouteTableHTML = (tourBoardingPlaces: any[], tourWaypoints: any[], calculateWaypointTime: Function) => {
  return `
    <div class="common-info">
      <h3 class="section-title">이동 경로 및 정차 정보</h3>
      <table class="route-table">
        <tr>
          <th style="width: 30%;">시간</th>
          <th>장소</th>
        </tr>
        ${tourBoardingPlaces.map((place: any, index: number) => {
          const boardingPlace = place.boarding_place;
          if (!boardingPlace) return '';
          return `
            <tr>
              <td>${place.departure_time ? place.departure_time.slice(0, 5) : '미정'}</td>
              <td>${boardingPlace.name} 출발</td>
            </tr>
          `;
        }).join('')}
        ${tourWaypoints.map((waypoint: any, waypointIndex: number) => {
          const lastBoardingPlace = tourBoardingPlaces[tourBoardingPlaces.length - 1];
          const estimatedTime = lastBoardingPlace?.departure_time 
            ? calculateWaypointTime(lastBoardingPlace.departure_time, 30 + (waypointIndex * 10))
            : '-';
          
          return `
            <tr>
              <td>${estimatedTime}</td>
              <td>${waypoint.waypoint_name} 정차 (약 ${waypoint.waypoint_duration}분) ${waypoint.waypoint_description ? `- ${waypoint.waypoint_description}` : ''}</td>
            </tr>
          `;
        }).join('')}
      </table>
    </div>
  `;
};
