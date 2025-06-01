# 티오프시간 관리 골프장 정보 문제 해결

## 문제 상황
- 티오프시간 관리 페이지에서 골프장 드롭다운이 비어있음
- DB 구조가 복잡함 (singsing_tours와 tour_products 모두 골프장 정보 포함)

## DB 구조 분석

### tour_products 테이블
- `golf_course` (text): 골프장 이름 (예: "파인힐스 CC")
- `courses` (ARRAY): 코스명 배열 (예: ["파인 코스", "힐스 코스"])

### singsing_tours 테이블
- `golf_course` (text): 골프장-코스 조합 (예: "파인힐스 CC - 파인 코스")
- `tour_product_id` (uuid): tour_products 참조

## 현재 상황
1. 기존 데이터는 singsing_tours.golf_course에 "골프장 - 코스" 형태로 저장되어 있음
2. 새로운 구조는 tour_products에서 골프장과 코스를 분리해서 관리
3. 데이터 중복 문제 존재

## 임시 해결책
- TeeTimeSlotManager에서 singsing_tours의 golf_course를 우선 사용하도록 수정
- tour_products 데이터가 있으면 그것도 함께 사용

## 향후 개선 사항
1. DB 구조 정규화 필요
   - singsing_tours에서 golf_course 제거
   - tour_products만 사용하도록 통일
2. 마이그레이션 스크립트 작성 필요
3. 기존 데이터 변환 필요
