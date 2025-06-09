import { simplifyCourseName } from '@/lib/utils';

// 텍스트를 파싱하여 "제목: 내용" 형식을 볼드 처리하는 함수
export const formatTextWithBold = (text: string): string => {
  if (!text) return '';
  return text.split('\n').map(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1 && colonIndex < line.length - 1) {
      const title = line.substring(0, colonIndex).trim();
      const content = line.substring(colonIndex + 1).trim();
      return `<strong>${title}:</strong> ${content}`;
    }
    return line;
  }).join('<br>');
};

// 도착 시간 계산 함수
export const getArrivalTime = (departureTime: string): string => {
  if (!departureTime || departureTime === '미정') return '미정';
  const [hour, minute] = departureTime.split(':').map(Number);
  const arrivalHour = hour + 1;
  return `${arrivalHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// 시간 포맷팅 함수
export const formatTime = (time: string): { timePrefix: string, displayTime: string } => {
  if (!time || time === '미정') return { timePrefix: '', displayTime: '미정' };
  
  const hour = parseInt(time.split(':')[0]);
  const timePrefix = hour < 12 ? '오전' : '오후';
  const displayHour = hour > 12 ? hour - 12 : hour;
  const displayTime = `${displayHour}:${time.split(':')[1]}`;
  
  return { timePrefix, displayTime };
};

// 날짜 포맷팅 함수
export const formatDate = (date: string | Date, includeWeekday: boolean = true): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  
  if (includeWeekday) {
    return `${d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }).replace('. ', '월 ').replace('.', '일')} (${weekdays[d.getDay()]})`;
  }
  return d.toLocaleDateString('ko-KR');
};

// 일정 아이콘 결정 함수
export const getScheduleIcon = (content: string, spot?: any): { icon: string, iconClass: string } => {
  // 스팟 정보가 있으면 카테고리에 따라 아이콘 결정
  if (spot && spot.category) {
    switch(spot.category) {
      case 'boarding':
      case 'boarding_place':
        return { icon: '🚌', iconClass: 'departure' }; // 버스 아이콘
      case 'tourist_spot':
        return { icon: '📷', iconClass: 'tour' }; // 카메라 아이콘
      case 'rest_area':
        return { icon: '☕', iconClass: 'rest' }; // 커피 아이콘
      case 'restaurant':
      case 'club_meal':
        return { icon: '🍴', iconClass: 'meal' }; // 식기 아이콘
      case 'golf_course':
      case 'golf_round':
        return { icon: '⛳', iconClass: 'golf' }; // 골프 아이콘
      case 'shopping':
        return { icon: '🛍️', iconClass: 'shopping' }; // 쇼핑백 아이콘
      case 'activity':
        return { icon: '🎯', iconClass: 'tour' }; // 액티비티 아이콘
      case 'mart':
        return { icon: '🛒', iconClass: 'shopping' }; // 카트 아이콘
      default:
        break;
    }
  }
  
  // 기존 콘텐츠 문자열 기반 로직 (폴백)
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('탑승') || lowerContent.includes('출발') || lowerContent.includes('동성골프연습장')) {
    return { icon: '🚌', iconClass: 'departure' };
  } else if (lowerContent.includes('이동') || lowerContent.includes('경유')) {
    return { icon: '🚗', iconClass: 'transit' };
  } else if (lowerContent.includes('라운드') || lowerContent.includes('골프') || lowerContent.includes('클럽식')) {
    return { icon: '⛳', iconClass: 'golf' };
  } else if (lowerContent.includes('조식') || lowerContent.includes('아침')) {
    return { icon: '🌅', iconClass: 'meal' };
  } else if (lowerContent.includes('중식') || lowerContent.includes('점심')) {
    return { icon: '🍴', iconClass: 'meal' };
  } else if (lowerContent.includes('석식') || lowerContent.includes('저녁')) {
    return { icon: '🌙', iconClass: 'meal' };
  } else if (lowerContent.includes('간편식')) {
    return { icon: '🥪', iconClass: 'meal' };
  } else if (lowerContent.includes('휴식') || lowerContent.includes('자유')) {
    return { icon: '🏨', iconClass: 'rest' };
  } else if (lowerContent.includes('도착')) {
    return { icon: '📍', iconClass: 'arrival' };
  } else if (lowerContent.includes('마트') || lowerContent.includes('쇼핑')) {
    return { icon: '🛒', iconClass: 'shopping' };
  } else if (lowerContent.includes('관광') || lowerContent.includes('투어')) {
    return { icon: '🏛️', iconClass: 'tour' };
  } else if (lowerContent.includes('연습장')) {
    return { icon: '🏌️', iconClass: 'golf' };
  } else if (lowerContent.includes('숙소') || lowerContent.includes('호텔')) {
    return { icon: '🏨', iconClass: 'rest' };
  } else if (lowerContent.includes('공항')) {
    return { icon: '✈️', iconClass: 'transit' };
  } else if (lowerContent.includes('휴게소')) {
    return { icon: '☕', iconClass: 'rest' };
  }
  
  return { icon: '📌', iconClass: 'default' };
};

// 코스 이름 포맷팅 함수
export const formatCourseDisplay = (courseName: string): string => {
  if (!courseName) return '';
  if (courseName.includes(' - ')) {
    return courseName.split(' - ')[1] || courseName;
  }
  return courseName;
};

// 코스별 헤더 클래스 결정
export const getCourseHeaderClass = (course: string): string => {
  let headerClass = 'course-header course-header-default';
  
  if (course.includes('레이크') || course.includes('Lake') || course.includes('lake')) {
    headerClass = 'course-header course-header-lake';
  } else if (course.includes('파인') || course.includes('Pine') || course.includes('pine')) {
    headerClass = 'course-header course-header-pine';
  } else if (course.includes('힐스') || course.includes('Hills') || course.includes('hills')) {
    headerClass = 'course-header course-header-hills';
  } else if (course.includes('밸리') || course.includes('Valley') || course.includes('valley')) {
    headerClass = 'course-header course-header-valley';
  } else if (course.includes('오션') || course.includes('Ocean') || course.includes('ocean')) {
    headerClass = 'course-header course-header-ocean';
  }
  
  return headerClass;
};

export { simplifyCourseName };
