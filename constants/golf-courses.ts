// 골프 코스 관리 파일
// TODO: 추후 데이터베이스에서 동적으로 가져오도록 변경

export interface GolfCourse {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

// 임시 하드코딩된 코스 목록
// 이미지에서 보이는 코스들을 포함
export const GOLF_COURSES: string[] = [
  "파인",
  "레이크", 
  "힐스",
  "마운틴",
  "밸리",
  "황경숙",
  "이용미",
  "윤경숙",
  "손귀순",
  "김기남",
  "김영기",
  "주강택",
  "김영은",
  "김학란",
  "김덕수",
  "전현선",
  "조미영",
  "김애자",
  "양부석",
  "정재원",
  "백연희",
  "백연옥",
  "오규희",
  "조나경",
  "김미정"
];

// 데이터베이스에서 코스 목록을 가져오는 함수 (추후 구현)
export async function fetchGolfCourses(): Promise<GolfCourse[]> {
  // TODO: Supabase에서 golf_courses 테이블 조회
  // 현재는 하드코딩된 목록 반환
  return GOLF_COURSES.map((name, index) => ({
    id: `course-${index}`,
    name
  }));
}
