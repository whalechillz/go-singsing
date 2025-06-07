// 티타임표 미리보기 테스트
// 이 파일은 티타임표가 제대로 표시되는지 확인하기 위한 테스트 파일입니다

export const testTeeTimeDisplay = () => {
  console.log('티타임표 테스트');
  
  // 문서 타입 확인
  const DOCUMENT_TYPES = [
    { id: 'customer_schedule', label: '고객용 일정표', icon: '📋' },
    { id: 'customer_boarding', label: '고객용 탑승안내서', icon: '🚌' },
    { id: 'staff_boarding', label: '스탭용 탑승안내서', icon: '👥' },
    { id: 'room_assignment', label: '객실 배정표 (고객용)', icon: '🏨' },
    { id: 'room_assignment_staff', label: '객실 배정표 (스탭용)', icon: '🏨' },
    { id: 'customer_timetable', label: '티타임표 (고객용)', icon: '⛳' },
    { id: 'staff_timetable', label: '티타임표 (내부용)', icon: '⛳' },
    { id: 'simplified', label: '간편 일정표', icon: '📄' }
  ];
  
  console.log('문서 타입:', DOCUMENT_TYPES);
  
  // getDocumentHTML 함수 테스트
  const getDocumentHTML = (activeTab: string) => {
    switch (activeTab) {
      case 'customer_schedule':
        return '<div>고객용 일정표</div>';
      case 'customer_boarding':
        return '<div>고객용 탑승안내서</div>';
      case 'staff_boarding':
        return '<div>스탭용 탑승안내서</div>';
      case 'room_assignment':
        return '<div>객실 배정표 (고객용)</div>';
      case 'room_assignment_staff':
        return '<div>객실 배정표 (스탭용)</div>';
      case 'customer_timetable':
        return '<div>티타임표 (고객용)</div>';
      case 'staff_timetable':
        return '<div>티타임표 (내부용)</div>';
      case 'simplified':
        return '<div>간편 일정표</div>';
      default:
        return '<div>기본 문서</div>';
    }
  };
  
  // 각 문서 타입에 대해 테스트
  DOCUMENT_TYPES.forEach(doc => {
    const html = getDocumentHTML(doc.id);
    console.log(`${doc.label}: ${html}`);
  });
};
