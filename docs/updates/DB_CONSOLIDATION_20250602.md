# 데이터베이스 통합 및 UI 개선 (2025-06-02)

## 변경 사항

### 1. 데이터베이스 구조 개선

#### 삭제된 테이블
- `boarding_guide_contacts` → `singsing_tour_staff`로 통합
- `boarding_guide_notices` → `singsing_tours.notices` 필드로 통합  
- `boarding_guide_routes` → `singsing_schedules.boarding_info` 필드로 통합

#### 추가된 필드
- `singsing_tours` 테이블에 `notices` (jsonb) 필드 추가
- `singsing_schedules` 테이블에 `boarding_info` (jsonb) 필드 추가

#### 새로운 뷰
- `tour_schedule_preview` - 투어 일정 미리보기를 위한 통합 뷰

### 2. UI/UX 개선

#### 통합 일정 관리
- 새로운 `IntegratedScheduleManager` 컴포넌트 생성
- 일정, 탑승 정보, 공지사항을 하나의 인터페이스에서 관리
- 탭 구조로 편리한 네비게이션 제공

#### 개선된 투어 일정표 미리보기
- `TourSchedulePreview` 컴포넌트 개선
- 전체 일정표, 탑승 안내문, 간단 일정표 3가지 뷰 제공
- PDF 다운로드, 인쇄, 공유 기능 추가
- 반응형 디자인 및 인쇄 최적화

#### 투어 상세 페이지 개선
- 탭 레이블 간소화
- 탑승 시간 설정 탭 제거 (일정 관리에 통합)
- 더 직관적인 워크플로우

### 3. 마이그레이션 가이드

#### 데이터베이스 마이그레이션
```sql
-- 1. 마이그레이션 실행
-- 파일: /supabase/migrations/20250602_consolidate_boarding_tables.sql

-- 2. 백업 테이블 확인
SELECT * FROM _backup_boarding_guide_contacts;
SELECT * FROM _backup_boarding_guide_notices;
SELECT * FROM _backup_boarding_guide_routes;

-- 3. 데이터 이전 확인 후 기존 테이블 삭제
DROP TABLE IF EXISTS boarding_guide_contacts;
DROP TABLE IF EXISTS boarding_guide_notices;
DROP TABLE IF EXISTS boarding_guide_routes;

-- 4. 백업 테이블 삭제 (선택사항)
DROP TABLE IF EXISTS _backup_boarding_guide_contacts;
DROP TABLE IF EXISTS _backup_boarding_guide_notices;
DROP TABLE IF EXISTS _backup_boarding_guide_routes;
```

### 4. 주요 컴포넌트 변경

| 이전 | 현재 | 설명 |
|------|------|------|
| ScheduleManager | IntegratedScheduleManager | 일정, 탑승 정보, 공지사항 통합 관리 |
| BoardingGuidePreview | TourSchedulePreview (탭 내) | 미리보기 기능 통합 |
| TourBoardingTimeManager | IntegratedScheduleManager (탭 내) | 탑승 시간 관리 통합 |

### 5. 사용자 가이드

#### 일정 관리
1. 투어 상세 페이지 → "일정 관리 (통합)" 탭
2. 3개의 하위 탭에서 관리:
   - 일정 관리: 날짜별 일정 및 활동
   - 탑승 정보: 각 날짜별 탑승 시간/장소
   - 공지사항: 투어 전체 공지사항

#### 일정표 미리보기
1. 투어 상세 페이지 → "일정표 미리보기" 탭
2. 3가지 뷰 선택 가능:
   - 전체 일정표: 상세한 모든 정보
   - 탑승 안내문: 고객용 탑승 안내
   - 간단 일정표: 핵심 정보만 표시
3. PDF 다운로드, 인쇄, 공유 기능 활용

### 6. 개발자 참고사항

- 기존 API 엔드포인트는 변경 없음
- 새로운 필드는 하위 호환성 유지
- TypeScript 타입 정의 업데이트 필요
- 테스트 환경에서 충분한 검증 후 프로덕션 적용

---
*작성일: 2025년 6월 2일*